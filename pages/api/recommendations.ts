import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

type OutfitItem = {
  icon: string;
  label: string;
  note?: string;
};

type Activity = {
  title: string;
  description: string;
  weatherReason: string;
  duration: string;
  priceHint: string;
};

type ApiSuccess = {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  iconUrl: string;
  outfitHeadline: string;
  outfitExplanation: string;
  outfitItems: OutfitItem[];
  activities: Activity[];
  tips: string[];
};

type ApiError = {
  error: string;
};

const OUTFIT_ICON_MAP: Record<string, string> = {
  jacket: "🧥",
  coat: "🧥",
  shoes: "👟",
  trainers: "👟",
  sneakers: "👟",
  umbrella: "☔",
  sunglasses: "🕶️",
  hat: "🧢",
  scarf: "🧣",
  tshirt: "👕",
  "t-shirt": "👕",
  shorts: "🩳",
  jeans: "👖",
};

function pickIcon(text: string): string {
  const lower = text.toLowerCase();
  for (const keyword of Object.keys(OUTFIT_ICON_MAP)) {
    if (lower.includes(keyword)) return OUTFIT_ICON_MAP[keyword];
  }
  return "✨";
}

function buildFallbackResponse(weather: {
  city: string;
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  icon: string;
}): ApiSuccess {
  return {
    city: weather.city,
    temperature: weather.temp,
    feelsLike: weather.feels_like,
    description: weather.description,
    humidity: weather.humidity,
    iconUrl: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
    outfitHeadline: "Comfort-first layers will work well today.",
    outfitExplanation:
      "Conditions can shift through the day, so wear light layers and comfortable footwear.",
    outfitItems: [
      { icon: "🧥", label: "Light outer layer", note: "Easy to remove indoors." },
      { icon: "👟", label: "Comfortable walking shoes", note: "Good for longer city walks." },
      { icon: "🎒", label: "Small day bag", note: "Carry water and essentials." },
    ],
    activities: [
      {
        title: "City highlights walking route",
        description: "Explore key landmarks at a relaxed pace with coffee stops.",
        weatherReason: "Comfortable for typical daytime conditions.",
        duration: "2-3 hours",
        priceHint: "From £20",
      },
      {
        title: "Indoor cultural stop",
        description: "Visit a museum or gallery for a flexible weather-safe option.",
        weatherReason: "Great backup if conditions change.",
        duration: "1-2 hours",
        priceHint: "From £12",
      },
      {
        title: "Local food tour",
        description: "Try local favorites while discovering neighborhoods.",
        weatherReason: "Works in most weather with short walking segments.",
        duration: "2-3 hours",
        priceHint: "From £35",
      },
      {
        title: "Sunset viewpoint visit",
        description: "Wrap up your day with a scenic city view.",
        weatherReason: "Best when visibility is decent in late afternoon.",
        duration: "1 hour",
        priceHint: "Free-£10",
      },
    ],
    tips: [
      "Start major attractions early to avoid crowds and keep flexibility later.",
      "Keep one indoor option saved in case the weather changes unexpectedly.",
      "Check local transit updates before crossing the city.",
    ],
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiSuccess | ApiError>
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
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!weatherApiKey) {
    return res.status(500).json({ error: "Missing OPENWEATHER_API_KEY." });
  }
  if (!openaiApiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY." });
  }

  const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  weatherUrl.searchParams.set("q", city);
  weatherUrl.searchParams.set("appid", weatherApiKey);
  weatherUrl.searchParams.set("units", "metric");

  let weatherData: any;
  try {
    const weatherResponse = await fetch(weatherUrl.toString());
    if (!weatherResponse.ok) {
      const payload = await weatherResponse.json().catch(() => ({}));
      const message = payload?.message || "Failed to fetch weather data.";
      return res.status(weatherResponse.status).json({ error: message });
    }
    weatherData = await weatherResponse.json();
  } catch {
    return res.status(502).json({ error: "Could not reach weather service." });
  }

  const weather = {
    city: weatherData?.name || city,
    temp: Number(weatherData?.main?.temp ?? 0),
    feels_like: Number(weatherData?.main?.feels_like ?? 0),
    humidity: Number(weatherData?.main?.humidity ?? 0),
    description: String(weatherData?.weather?.[0]?.description ?? "unknown weather"),
    icon: String(weatherData?.weather?.[0]?.icon ?? "01d"),
  };

  const client = new OpenAI({ apiKey: openaiApiKey });

  const prompt = `
You are a premium travel assistant.
Given weather data, return ONLY strict JSON with this shape:
{
  "outfitHeadline": string,
  "outfitExplanation": string,
  "outfitItems": [{ "label": string, "note": string }],
  "activities": [{
    "title": string,
    "description": string,
    "weatherReason": string,
    "duration": string,
    "priceHint": string
  }],
  "tips": [string]
}

Rules:
- outfitItems: exactly 3 items.
- activities: exactly 4 items suitable for this weather.
- tips: exactly 3 concise insider-style tips.
- Keep text user-friendly and concise.
- Do not include markdown or extra text.

Weather:
City: ${weather.city}
Temperature C: ${weather.temp}
Feels like C: ${weather.feels_like}
Conditions: ${weather.description}
Humidity: ${weather.humidity}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    const result: ApiSuccess = {
      city: weather.city,
      temperature: weather.temp,
      feelsLike: weather.feels_like,
      description: weather.description,
      humidity: weather.humidity,
      iconUrl: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
      outfitHeadline: String(parsed.outfitHeadline || "Dress comfortably for today."),
      outfitExplanation: String(
        parsed.outfitExplanation || "Choose layers and practical footwear."
      ),
      outfitItems: Array.isArray(parsed.outfitItems)
        ? parsed.outfitItems.slice(0, 3).map((item: any) => ({
            icon: pickIcon(String(item?.label || "")),
            label: String(item?.label || "Comfortable layers"),
            note: String(item?.note || ""),
          }))
        : buildFallbackResponse(weather).outfitItems,
      activities: Array.isArray(parsed.activities)
        ? parsed.activities.slice(0, 4).map((activity: any) => ({
            title: String(activity?.title || "Explore the city"),
            description: String(activity?.description || "A weather-friendly city activity."),
            weatherReason: String(activity?.weatherReason || "Good fit for today's conditions."),
            duration: String(activity?.duration || "1-2 hours"),
            priceHint: String(activity?.priceHint || "From £20"),
          }))
        : buildFallbackResponse(weather).activities,
      tips: Array.isArray(parsed.tips)
        ? parsed.tips.slice(0, 3).map((tip: any) => String(tip))
        : buildFallbackResponse(weather).tips,
    };

    return res.status(200).json(result);
  } catch {
    // If AI fails, still return a weather-powered fallback so UX remains usable.
    return res.status(200).json(buildFallbackResponse(weather));
  }
}

