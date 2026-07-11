// Resolves free-text city input to a covered city: exact/alias match first,
// then OpenWeather geocoding + haversine to the nearest covered city.
import type { CityIndexEntry } from "./types";
import { getCityIndex } from "./loader";

export type CityResolution =
  | { match: "exact"; entry: CityIndexEntry }
  | { match: "nearest"; entry: CityIndexEntry; requested: string; distanceKm: number }
  | { match: "not_found"; requested: string };

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestEntry(
  lat: number,
  lon: number
): { entry: CityIndexEntry; distanceKm: number } {
  const index = getCityIndex();
  let best = index[0];
  let bestDist = haversineKm(lat, lon, best.lat, best.lon);
  for (const entry of index.slice(1)) {
    const dist = haversineKm(lat, lon, entry.lat, entry.lon);
    if (dist < bestDist) {
      best = entry;
      bestDist = dist;
    }
  }
  return { entry: best, distanceKm: Math.round(bestDist) };
}

export function matchIndex(input: string): CityIndexEntry | null {
  const q = normalize(input);
  for (const entry of getCityIndex()) {
    if (normalize(entry.name) === q) return entry;
    if (entry.aliases.some((a) => normalize(a) === q)) return entry;
  }
  return null;
}

async function geocode(
  query: string,
  apiKey: string
): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://api.openweathermap.org/geo/1.0/direct");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("appid", apiKey);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: number; lon: number }>;
    if (!Array.isArray(results) || results.length === 0) return null;
    return { lat: results[0].lat, lon: results[0].lon };
  } catch {
    return null;
  }
}

export async function resolveCity(
  input: string,
  apiKey: string
): Promise<CityResolution> {
  const exact = matchIndex(input);
  if (exact) return { match: "exact", entry: exact };

  const coords = await geocode(input, apiKey);
  if (!coords) return { match: "not_found", requested: input };

  const { entry, distanceKm } = nearestEntry(coords.lat, coords.lon);
  // A geocode result within a few km of a covered city is that city
  // (e.g. "Shibuya" or a misspelling OpenWeather resolves anyway).
  if (distanceKm <= 25) return { match: "exact", entry };
  return { match: "nearest", entry, requested: input, distanceKm };
}
