// The single runtime endpoint: resolves the city, fetches live weather from
// OpenWeatherMap (the app's only external API), and selects recommendations
// from the precomputed content dataset. Zero AI calls, zero AI cost.
import type { NextApiRequest, NextApiResponse } from "next";
import { loadCity } from "../../lib/content/loader";
import { resolveCity } from "../../lib/content/nearestCity";
import { deriveContext } from "../../lib/weatherBuckets";
import { buildOutfit, type Outfit } from "../../lib/outfit";
import { recommend, type ScoredActivity } from "../../lib/recommend";
import { buildProviderLinks, type ProviderLinks } from "../../lib/affiliates";
import { VIBES, type Vibe } from "../../lib/content/types";

export interface TodayActivity {
  id: string;
  title: string;
  description: string;
  insiderNote?: string;
  whyNow: string;
  caution?: string;
  reasonTags: string[];
  durationLabel: string;
  priceHint?: string;
  neighborhood?: string;
  icon: string;
  imageUrl?: string;
  providerLinks?: ProviderLinks;
}

export interface TodaySuccess {
  requestedCity: string;
  city: { slug: string; name: string; country: string };
  match: "exact" | "nearest";
  distanceKm?: number;
  weather: {
    temperature: number;
    feelsLike: number;
    description: string;
    humidity: number;
    windSpeed: number;
    iconUrl: string;
    tempBand: string;
    condition: string;
    timeOfDay: string;
    localHour: number;
    fetchedAt: string;
  };
  heroImageUrl?: string;
  outfit: Outfit;
  freeActivities: TodayActivity[];
  insiderTips: TodayActivity[];
  bookableExperiences: TodayActivity[];
  localTips: string[];
  coveredCities: Array<{ slug: string; name: string; country: string }>;
}

export interface TodayError {
  error: string;
  notFound?: boolean;
  coveredCities?: Array<{ slug: string; name: string; country: string }>;
}

function durationLabel([min, max]: [number, number]): string {
  const fmt = (m: number) => (m >= 60 ? `${Math.round((m / 60) * 2) / 2}h` : `${m}min`);
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

function toPayload(scored: ScoredActivity, cityName: string, partnerId: string): TodayActivity {
  const a = scored.activity;
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    insiderNote: a.insiderNote,
    whyNow: scored.whyNow,
    caution: scored.caution,
    reasonTags: scored.reasonTags,
    durationLabel: durationLabel(a.durationMinutes),
    priceHint: a.priceHint ?? (a.priceTier === "free" ? "Free" : undefined),
    neighborhood: a.neighborhood,
    icon: a.icon,
    imageUrl: a.imageUrl,
    providerLinks:
      a.category === "bookable" && a.bookingQuery
        ? buildProviderLinks(a.bookingQuery, partnerId)
        : undefined,
  };
}

function parseVibes(raw: string | string[] | undefined): Vibe[] {
  const value = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  return value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v): v is Vibe => (VIBES as readonly string[]).includes(v));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodaySuccess | TodayError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const cityParam = Array.isArray(req.query.city) ? req.query.city[0] : req.query.city;
  const requestedCity = cityParam?.trim();
  if (!requestedCity) {
    return res.status(400).json({ error: "City is required." });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing OPENWEATHER_API_KEY." });
  }

  const { getCityIndex } = await import("../../lib/content/loader");
  const coveredCities = getCityIndex().map(({ slug, name, country }) => ({ slug, name, country }));

  const resolution = await resolveCity(requestedCity, apiKey);
  if (resolution.match === "not_found") {
    return res.status(404).json({
      error: `We couldn't find "${requestedCity}". Try one of the covered cities below.`,
      notFound: true,
      coveredCities,
    });
  }

  const city = loadCity(resolution.entry.slug);
  if (!city) {
    return res.status(500).json({ error: "City content missing — please try another city." });
  }

  // Weather is fetched for the covered city's coordinates so the forecast
  // and the recommendations always describe the same place.
  const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  weatherUrl.searchParams.set("lat", String(city.lat));
  weatherUrl.searchParams.set("lon", String(city.lon));
  weatherUrl.searchParams.set("appid", apiKey);
  weatherUrl.searchParams.set("units", "metric");

  let owm: any;
  try {
    const weatherResponse = await fetch(weatherUrl.toString());
    if (!weatherResponse.ok) {
      const payload = await weatherResponse.json().catch(() => ({}));
      return res
        .status(502)
        .json({ error: payload?.message || "Failed to fetch weather data." });
    }
    owm = await weatherResponse.json();
  } catch {
    return res.status(502).json({ error: "Could not reach the weather service." });
  }

  const ctx = deriveContext(owm);
  const vibes = parseVibes(req.query.vibes);
  const partnerId = process.env.GYG_PARTNER_ID || "PWRQOQM";

  const picks = recommend({
    citySlug: city.slug,
    activities: city.activities,
    ctx,
    vibes,
  });

  const seed = new Date().getDate() % Math.max(city.localTips.length, 1);

  return res.status(200).json({
    requestedCity,
    city: { slug: city.slug, name: city.name, country: city.country },
    match: resolution.match,
    distanceKm: resolution.match === "nearest" ? resolution.distanceKm : undefined,
    weather: {
      temperature: ctx.temperature,
      feelsLike: ctx.feelsLike,
      description: ctx.description,
      humidity: ctx.humidity,
      windSpeed: ctx.windSpeed,
      iconUrl: ctx.iconUrl,
      tempBand: ctx.tempBand,
      condition: ctx.condition,
      timeOfDay: ctx.timeOfDay,
      localHour: ctx.localHour,
      fetchedAt: new Date().toISOString(),
    },
    heroImageUrl: city.heroImageUrl,
    outfit: buildOutfit(ctx),
    freeActivities: picks.free.map((s) => toPayload(s, city.name, partnerId)),
    insiderTips: picks.insider.map((s) => toPayload(s, city.name, partnerId)),
    bookableExperiences: picks.bookable.map((s) => toPayload(s, city.name, partnerId)),
    localTips: [...city.localTips.slice(seed), ...city.localTips.slice(0, seed)],
    coveredCities,
  });
}
