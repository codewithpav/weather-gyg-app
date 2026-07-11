// Deterministic outfit advice from the weather context. No AI involved:
// a lookup table on temperature band, adjusted for condition and wind.
import type { Condition, TempBand } from "./content/types";
import type { WeatherContext } from "./weatherBuckets";

export interface OutfitItem {
  icon: string;
  label: string;
  note?: string;
}

export interface Outfit {
  headline: string;
  explanation: string;
  items: OutfitItem[];
}

const BASE: Record<TempBand, { headline: string; explanation: string; items: OutfitItem[] }> = {
  freezing: {
    headline: "Bundle up — it's properly cold out there.",
    explanation: "Sub-zero feels-like temperatures call for serious layers and covered extremities.",
    items: [
      { icon: "🧥", label: "Insulated winter coat", note: "Wind-resistant if possible." },
      { icon: "🧣", label: "Scarf, hat and gloves", note: "Most heat escapes at the extremities." },
      { icon: "👢", label: "Warm, grippy boots", note: "Pavements may be icy." },
      { icon: "👖", label: "Thermal base layer", note: "Makes long outdoor stretches comfortable." },
    ],
  },
  cold: {
    headline: "Wrap up warm in proper layers.",
    explanation: "It feels wintry — a warm coat over layers keeps you flexible between indoors and out.",
    items: [
      { icon: "🧥", label: "Warm coat", note: "You'll want it all day." },
      { icon: "🧣", label: "Scarf or beanie", note: "Easy warmth you can stash away." },
      { icon: "👟", label: "Closed, comfortable shoes", note: "Warm socks make the difference." },
    ],
  },
  mild: {
    headline: "Light layers are the smart play today.",
    explanation: "Comfortable but changeable — a layer you can add or remove keeps you right all day.",
    items: [
      { icon: "🧥", label: "Light jacket or overshirt", note: "Easy to carry when the sun's out." },
      { icon: "👕", label: "Long-sleeve top", note: "Comfortable base for the whole day." },
      { icon: "👟", label: "Comfortable walking shoes", note: "City days mean serious step counts." },
    ],
  },
  warm: {
    headline: "Dress light — it's lovely out.",
    explanation: "Warm and pleasant: breathable fabrics and sun protection are all you need.",
    items: [
      { icon: "👕", label: "T-shirt or light shirt", note: "Breathable fabrics win." },
      { icon: "🕶️", label: "Sunglasses", note: "You'll use them." },
      { icon: "👟", label: "Comfortable trainers or sandals", note: "Broken-in, not brand new." },
    ],
  },
  hot: {
    headline: "Full summer mode — stay cool and hydrated.",
    explanation: "It's hot: light colors, sun protection, and water within reach at all times.",
    items: [
      { icon: "👕", label: "Light, loose clothing", note: "Light colors reflect the heat." },
      { icon: "🧢", label: "Hat and sunglasses", note: "Shade is your friend in the midday hours." },
      { icon: "🧴", label: "Sunscreen and water bottle", note: "Reapply and refill often." },
      { icon: "🩳", label: "Shorts or a light dress", note: "Comfort beats style points today." },
    ],
  },
};

const CONDITION_EXTRAS: Partial<Record<Condition, OutfitItem>> = {
  rain: { icon: "☔", label: "Umbrella or rain jacket", note: "Showers are in play — stay dry between stops." },
  snow: { icon: "🧤", label: "Waterproof gloves & boots", note: "Snow underfoot — keep hands and feet dry." },
};

export function buildOutfit(ctx: WeatherContext): Outfit {
  const base = BASE[ctx.tempBand];
  const items = [...base.items];

  const extra = CONDITION_EXTRAS[ctx.condition];
  if (extra && !items.some((i) => i.label === extra.label)) items.unshift(extra);

  if (ctx.condition === "clear" && (ctx.tempBand === "warm" || ctx.tempBand === "hot")) {
    if (!items.some((i) => i.icon === "🧴")) {
      items.push({ icon: "🧴", label: "Sunscreen", note: "Clear skies — protect exposed skin." });
    }
  }

  if (ctx.windSpeed > 10) {
    items.push({ icon: "🌬️", label: "Windproof layer", note: "It's blustery — a shell layer stops the chill." });
  }

  let explanation = base.explanation;
  if (ctx.condition === "rain") explanation += " Expect wet spells, so plan covered escapes along the way.";
  if (ctx.condition === "snow") explanation += " Snow is falling — allow extra time getting around.";

  return { headline: base.headline, explanation, items: items.slice(0, 5) };
}
