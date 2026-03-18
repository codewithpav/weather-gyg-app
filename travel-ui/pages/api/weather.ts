import type { NextApiRequest, NextApiResponse } from "next";

type WeatherSuccess = {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  iconUrl: string;
  cityHeroImageUrl?: string;
  fetchedAt: string;
};

type WeatherError = { error: string };

async function fetchCityHeroImage(city: string): Promise<string | undefined> {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1800);

  try {
    if (pexelsApiKey) {
      const pexelsUrl = new URL("https://api.pexels.com/v1/search");
      pexelsUrl.searchParams.set("query", `${city} skyline cityscape`);
      pexelsUrl.searchParams.set("per_page", "4");
      pexelsUrl.searchParams.set("orientation", "landscape");
      pexelsUrl.searchParams.set("size", "large");

      const pexelsRes = await fetch(pexelsUrl.toString(), {
        signal: controller.signal,
        headers: { Authorization: pexelsApiKey },
      });
      if (pexelsRes.ok) {
        const data = await pexelsRes.json();
        const photos = Array.isArray(data?.photos) ? data.photos : [];
        if (photos.length > 0) {
          const best = photos.find((p: any) => p?.width >= 1200) || photos[0];
          const imageUrl =
            best?.src?.large2x ||
            best?.src?.large ||
            best?.src?.landscape ||
            best?.src?.original;
          if (imageUrl) return imageUrl;
        }
      }
    }

    const openverseUrl = new URL("https://api.openverse.org/v1/images/");
    openverseUrl.searchParams.set("q", `${city} skyline`);
    openverseUrl.searchParams.set("page_size", "4");
    openverseUrl.searchParams.set("mature", "false");
    const openverseRes = await fetch(openverseUrl.toString(), {
      signal: controller.signal,
    });
    if (!openverseRes.ok) return undefined;
    const payload = await openverseRes.json();
    const results = Array.isArray(payload?.results) ? payload.results : [];
    const best = results.find((r: any) => r?.url) || results[0];
    return best?.url;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherSuccess | WeatherError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const cityParam = Array.isArray(req.query.city) ? req.query.city[0] : req.query.city;
  const city = cityParam?.trim();
  if (!city) {
    return res.status(400).json({ error: "City is required." });
  }

  const weatherApiKey = process.env.OPENWEATHER_API_KEY;
  if (!weatherApiKey) {
    return res.status(500).json({ error: "Missing OPENWEATHER_API_KEY." });
  }

  const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  weatherUrl.searchParams.set("q", city);
  weatherUrl.searchParams.set("appid", weatherApiKey);
  weatherUrl.searchParams.set("units", "metric");

  try {
    const weatherResponse = await fetch(weatherUrl.toString());
    if (!weatherResponse.ok) {
      const payload = await weatherResponse.json().catch(() => ({}));
      return res
        .status(weatherResponse.status)
        .json({ error: payload?.message || "Failed to fetch weather data." });
    }

    const weatherData = await weatherResponse.json();
    const cityName = String(weatherData?.name || city);
    const cityHeroImageUrl = await fetchCityHeroImage(cityName);

    return res.status(200).json({
      city: cityName,
      temperature: Number(weatherData?.main?.temp ?? 0),
      feelsLike: Number(weatherData?.main?.feels_like ?? 0),
      description: String(weatherData?.weather?.[0]?.description ?? "unknown weather"),
      humidity: Number(weatherData?.main?.humidity ?? 0),
      iconUrl: `https://openweathermap.org/img/wn/${String(
        weatherData?.weather?.[0]?.icon ?? "01d"
      )}@2x.png`,
      cityHeroImageUrl,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(502).json({ error: "Could not reach weather service." });
  }
}

