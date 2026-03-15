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
  whyNow: string;
  duration: string;
  priceHint?: string;
  icon?: string;
  imageUrl?: string;
  providerLinks?: {
    getYourGuide?: string;
    klook?: string;
    viator?: string;
  };
};

type AiSuccess = {
  outfitHeadline: string;
  outfitExplanation: string;
  outfitItems: OutfitItem[];
  freeActivities: Activity[];
  insiderTips: Activity[];
  bookableExperiences: Activity[];
  localTip: string;
};

type AiError = { error: string };

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

async function fetchWikimediaImage(query: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2400);

  try {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("generator", "search");
    url.searchParams.set("gsrnamespace", "6");
    url.searchParams.set("gsrlimit", "8");
    url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url");
    url.searchParams.set("iiurlwidth", "1200");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) return undefined;

    const payload = await response.json();
    const pages = payload?.query?.pages;
    if (!pages) return undefined;

    const cityToken = query.split(" ")[0]?.toLowerCase() || "";
    const bannedTerms = [
      "map",
      "logo",
      "icon",
      "flag",
      "coat of arms",
      "diagram",
      "symbol",
      "route",
      "metro",
      "subway",
      "sign",
      "emblem",
    ];

    const scored = (Object.values(pages) as any[])
      .map((page) => {
        const title: string = String(page?.title || "").toLowerCase();
        const info = page?.imageinfo?.[0];
        const imageUrl = info?.thumburl || info?.url || undefined;
        if (!imageUrl) return null;

        let score = 0;
        if (cityToken && title.includes(cityToken)) score += 5;
        if (title.includes("street") || title.includes("city") || title.includes("view")) {
          score += 2;
        }
        if (bannedTerms.some((term) => title.includes(term))) score -= 12;
        if (title.includes("night") || title.includes("sunset") || title.includes("cafe")) {
          score += 1;
        }

        return { score, imageUrl };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    return scored[0]?.imageUrl;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchPexelsImage(query: string): Promise<string | undefined> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2200);

  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "6");
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("size", "large");

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Authorization: apiKey },
    });
    if (!response.ok) return undefined;

    const payload = await response.json();
    const photos = Array.isArray(payload?.photos) ? payload.photos : [];
    if (!photos.length) return undefined;

    const best = photos.find((p: any) => p?.width >= 1200) || photos[0];
    return (
      best?.src?.large2x ||
      best?.src?.large ||
      best?.src?.landscape ||
      best?.src?.original
    );
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchOpenverseImage(query: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2200);

  try {
    const url = new URL("https://api.openverse.org/v1/images/");
    url.searchParams.set("q", query);
    url.searchParams.set("page_size", "8");
    url.searchParams.set("mature", "false");

    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) return undefined;

    const payload = await response.json();
    const results = Array.isArray(payload?.results) ? payload.results : [];
    if (!results.length) return undefined;

    const badTerms = ["logo", "icon", "map", "flag", "emblem", "diagram"];
    const scored = results
      .filter((r: any) => {
        const title = String(r?.title || "").toLowerCase();
        const imageUrl = String(r?.url || "");
        if (!imageUrl) return false;
        if (badTerms.some((term) => title.includes(term))) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        const aw = Number(a?.width || 0);
        const bw = Number(b?.width || 0);
        return bw - aw;
      });

    return scored[0]?.url;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchBestImage(query: string): Promise<string | undefined> {
  const pexels = await fetchPexelsImage(query);
  if (pexels) return pexels;

  const openverse = await fetchOpenverseImage(query);
  if (openverse) return openverse;

  return fetchWikimediaImage(query);
}

function activityThemeQuery(city: string, activityTitle: string): string {
  const text = activityTitle.toLowerCase();

  if (text.includes("hawker") || text.includes("street food")) {
    return `${city} hawker centre food market`;
  }
  if (text.includes("cafe") || text.includes("coffee") || text.includes("food")) {
    return `${city} cafe street`;
  }
  if (text.includes("museum") || text.includes("gallery") || text.includes("art")) {
    return `${city} museum`;
  }
  if (text.includes("walk") || text.includes("tour") || text.includes("river")) {
    return `${city} street view`;
  }
  if (text.includes("rooftop") || text.includes("sunset") || text.includes("night")) {
    return `${city} skyline night`;
  }
  if (text.includes("park") || text.includes("garden")) {
    return `${city} park`;
  }
  return `${city} city view`;
}

async function enrichActivitiesWithImages(
  city: string,
  activities: Activity[],
  usedImages: Set<string>
): Promise<Activity[]> {
  const cache = new Map<string, string | undefined>();

  const getImage = async (query: string): Promise<string | undefined> => {
    if (cache.has(query)) return cache.get(query);
    const image = await fetchBestImage(query);
    cache.set(query, image);
    return image;
  };

  return Promise.all(
    activities.map(async (activity) => {
      const themedQuery = activityThemeQuery(city, activity.title);
      const cityAndTitleQuery = `${city} ${activity.title}`;
      const cityAndDescriptionQuery = `${city} ${activity.description
        .split(" ")
        .slice(0, 8)
        .join(" ")}`;
      const cityFallbackQuery = `${city} skyline`;
      const genericFallbackQuery = `${activity.title}`;
      const genericDescriptionQuery = `${activity.description
        .split(" ")
        .slice(0, 8)
        .join(" ")}`;

      const queries = [
        themedQuery,
        cityAndTitleQuery,
        cityAndDescriptionQuery,
        cityFallbackQuery,
        genericFallbackQuery,
        genericDescriptionQuery,
      ];

      let imageUrl: string | undefined;
      for (const query of queries) {
        const candidate = await getImage(query);
        if (candidate && !usedImages.has(candidate)) {
          imageUrl = candidate;
          usedImages.add(candidate);
          break;
        }
      }

      return { ...activity, imageUrl: imageUrl || undefined };
    })
  );
}

function normalizeActivity(item: any, defaults: Activity): Activity {
  return {
    title: String(item?.title || defaults.title),
    description: String(item?.description || defaults.description),
    whyNow: String(item?.whyNow || defaults.whyNow),
    duration: String(item?.duration || defaults.duration),
    priceHint: String(item?.priceHint || defaults.priceHint || ""),
    icon: String(item?.icon || defaults.icon || "✨"),
  };
}

function buildProviderLinks(city: string, title: string, partnerId: string) {
  const query = `${title} ${city}`;
  const encoded = encodeURIComponent(query);
  return {
    getYourGuide: `https://www.getyourguide.com/s/?q=${encoded}&partner_id=${encodeURIComponent(
      partnerId
    )}`,
    klook: `https://www.klook.com/en-GB/search/result/?query=${encoded}`,
    viator: `https://www.viator.com/searchResults/all?text=${encoded}`,
  };
}

function attachProviderLinks(
  city: string,
  activities: Activity[],
  partnerId: string
): Activity[] {
  return activities.map((activity) => ({
    ...activity,
    providerLinks: buildProviderLinks(city, activity.title, partnerId),
  }));
}

function fallback(city: string, timeOfDay: string): AiSuccess {
  return {
    outfitHeadline: "Comfort-first layers will work well today.",
    outfitExplanation:
      "Conditions can shift through the day, so wear light layers and comfortable footwear.",
    outfitItems: [
      { icon: "🧥", label: "Light outer layer", note: "Easy to remove indoors." },
      { icon: "👟", label: "Comfortable walking shoes", note: "Good for longer city walks." },
      { icon: "🎒", label: "Small day bag", note: "Carry water and essentials." },
    ],
    freeActivities: [
      {
        title: "Scenic neighborhood walk",
        description: `Explore walkable streets and local architecture in ${city}.`,
        whyNow: `${timeOfDay} conditions are suitable for a relaxed outdoor route.`,
        duration: "2-3 hours",
        priceHint: "Free",
        icon: "🚶",
      },
      {
        title: "Public viewpoint stop",
        description: `Visit a public viewpoint and enjoy city panoramas in ${city}.`,
        whyNow: "Good low-effort option while the weather is manageable.",
        duration: "45-90 mins",
        priceHint: "Free",
        icon: "🌆",
      },
      {
        title: "Park or waterfront break",
        description: `Spend time in a scenic open space and recharge at an easy pace in ${city}.`,
        whyNow: "Great when you want a low-cost option that still feels memorable.",
        duration: "60-90 mins",
        priceHint: "Free",
        icon: "🌿",
      },
      {
        title: "Neighborhood photo walk",
        description: `Discover photogenic streets and local details beyond the busiest zones.`,
        whyNow: "Works well for flexible timing and light weather windows.",
        duration: "1-2 hours",
        priceHint: "Free",
        icon: "📷",
      },
    ],
    insiderTips: [
      {
        title: "Neighborhood cafe pick",
        description: "Try a quieter cafe slightly away from the main tourist streets.",
        whyNow: "Great for recharging while avoiding crowded hotspots.",
        duration: "45-60 mins",
        priceHint: "Low spend",
        icon: "☕",
      },
      {
        title: "Local market window",
        description: "Visit when locals usually arrive for better atmosphere and food.",
        whyNow: "Timing matters here and this window is usually more authentic.",
        duration: "1-2 hours",
        priceHint: "Varies",
        icon: "🛍️",
      },
    ],
    bookableExperiences: [
      {
        title: "Guided city highlights tour",
        description: `A structured way to cover top ${city} sights efficiently.`,
        whyNow: "Useful when you want a no-planning option for today.",
        duration: "2-3 hours",
        priceHint: "From £25",
        icon: "🎟️",
      },
      {
        title: "Evening cultural experience",
        description: "A curated evening activity with local storytelling or tasting.",
        whyNow: "Pairs well with cooler evening conditions and lower crowds.",
        duration: "2 hours",
        priceHint: "From £30",
        icon: "🌙",
      },
    ],
    localTip:
      "Locals often shift plans later in the day; check neighborhood spots after peak tourist hours for a better vibe.",
  };
}

function getTimeOfDayLabel(raw: string): string {
  const normalized = raw.toLowerCase();
  if (["morning", "afternoon", "evening", "night"].includes(normalized)) {
    return normalized;
  }
  return "daytime";
}

function currentHourFallbackToTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function ensureLength<T>(arr: T[], count: number, fallbackItems: T[]): T[] {
  if (arr.length >= count) return arr.slice(0, count);
  const out = [...arr];
  for (const item of fallbackItems) {
    if (out.length >= count) break;
    out.push(item);
  }
  return out.slice(0, count);
}

function pickTopLocalTip(insiderTips: Activity[], fallbackTip: string): string {
  const firstTip = insiderTips[0]?.description;
  return firstTip || fallbackTip;
}

function withImagesIfMissing(base: Activity[], enriched: Activity[]): Activity[] {
  return base.map((item, index) => ({
    ...item,
    imageUrl: enriched[index]?.imageUrl,
  }));
}

async function enrichAllSectionsWithImages(city: string, data: AiSuccess): Promise<AiSuccess> {
  const usedImages = new Set<string>();
  const freeWithImages = await enrichActivitiesWithImages(
    city,
    data.freeActivities,
    usedImages
  );
  const insiderWithImages = await enrichActivitiesWithImages(
    city,
    data.insiderTips,
    usedImages
  );
  const bookableWithImages = await enrichActivitiesWithImages(
    city,
    data.bookableExperiences,
    usedImages
  );

  return {
    ...data,
    freeActivities: withImagesIfMissing(data.freeActivities, freeWithImages),
    insiderTips: withImagesIfMissing(data.insiderTips, insiderWithImages),
    bookableExperiences: withImagesIfMissing(data.bookableExperiences, bookableWithImages),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiSuccess | AiError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const city = String(req.query.city || "").trim();
  const description = String(req.query.description || "").trim();
  const temperature = Number(req.query.temperature ?? 0);
  const feelsLike = Number(req.query.feelsLike ?? 0);
  const humidity = Number(req.query.humidity ?? 0);
  const vibes = String(req.query.vibes || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const timeOfDay = getTimeOfDayLabel(
    String(req.query.timeOfDay || currentHourFallbackToTimeOfDay())
  );

  if (!city || !description) {
    return res.status(400).json({ error: "City and weather details are required." });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const gygPartnerId = process.env.GYG_PARTNER_ID || "PWRQOQM";
  if (!openaiApiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY." });
  }

  const client = new OpenAI({ apiKey: openaiApiKey });
  const fallbackData = fallback(city, timeOfDay);

  const prompt = `
You are a premium travel assistant for a daily travel planner product.
Return ONLY strict JSON with this exact shape:
{
  "outfitHeadline": string,
  "outfitExplanation": string,
  "outfitItems": [{ "label": string, "note": string }],
  "freeActivities": [{
    "title": string,
    "description": string,
    "whyNow": string,
    "duration": string,
    "priceHint": string,
    "icon": string
  }],
  "insiderTips": [{
    "title": string,
    "description": string,
    "whyNow": string,
    "duration": string,
    "priceHint": string,
    "icon": string
  }],
  "bookableExperiences": [{
    "title": string,
    "description": string,
    "whyNow": string,
    "duration": string,
    "priceHint": string,
    "icon": string
  }],
  "localTip": string
}

Rules:
- outfitItems: exactly 3 items.
- freeActivities: exactly 4 items.
- insiderTips: exactly 2 items.
- bookableExperiences: exactly 2 items.
- Focus on what is best RIGHT NOW using weather + time of day.
- Keep all text concise and practical.
- Do not include markdown or prose outside JSON.

Context:
City: ${city}
Time of day: ${timeOfDay}
Temperature C: ${temperature}
Feels like C: ${feelsLike}
Conditions: ${description}
Humidity: ${humidity}
Preferred vibes (optional): ${vibes.length > 0 ? vibes.join(", ") : "No specific vibe selected"}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.55,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    const freeActivities = ensureLength(
      Array.isArray(parsed.freeActivities)
        ? parsed.freeActivities.map((item: any, idx: number) =>
            normalizeActivity(
              item,
              fallbackData.freeActivities[idx % fallbackData.freeActivities.length]
            )
          )
        : [],
      4,
      fallbackData.freeActivities
    );

    const insiderTips = ensureLength(
      Array.isArray(parsed.insiderTips)
        ? parsed.insiderTips.map((item: any, idx: number) =>
            normalizeActivity(
              item,
              fallbackData.insiderTips[idx % fallbackData.insiderTips.length]
            )
          )
        : [],
      2,
      fallbackData.insiderTips
    );

    const bookableExperiences = ensureLength(
      Array.isArray(parsed.bookableExperiences)
        ? parsed.bookableExperiences.map((item: any, idx: number) =>
            normalizeActivity(
              item,
              fallbackData.bookableExperiences[idx % fallbackData.bookableExperiences.length]
            )
          )
        : [],
      2,
      fallbackData.bookableExperiences
    );

    const composed: AiSuccess = {
      outfitHeadline: String(parsed.outfitHeadline || fallbackData.outfitHeadline),
      outfitExplanation: String(parsed.outfitExplanation || fallbackData.outfitExplanation),
      outfitItems: Array.isArray(parsed.outfitItems)
        ? parsed.outfitItems.slice(0, 3).map((item: any) => ({
            icon: pickIcon(String(item?.label || "")),
            label: String(item?.label || "Comfortable layers"),
            note: String(item?.note || ""),
          }))
        : fallbackData.outfitItems,
      freeActivities,
      insiderTips,
      bookableExperiences: attachProviderLinks(city, bookableExperiences, gygPartnerId),
      localTip: String(parsed.localTip || pickTopLocalTip(insiderTips, fallbackData.localTip)),
    };

    const withImages = await enrichAllSectionsWithImages(city, composed);
    return res.status(200).json(withImages);
  } catch {
    const fallbackWithLinks: AiSuccess = {
      ...fallbackData,
      bookableExperiences: attachProviderLinks(
        city,
        fallbackData.bookableExperiences,
        gygPartnerId
      ),
    };
    const withImages = await enrichAllSectionsWithImages(city, fallbackWithLinks);
    return res.status(200).json(withImages);
  }
}

