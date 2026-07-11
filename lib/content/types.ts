// Single source of truth for the precomputed city content dataset and the
// runtime taxonomy used to match live weather against it.

export const TEMP_BANDS = ["freezing", "cold", "mild", "warm", "hot"] as const;
export type TempBand = (typeof TEMP_BANDS)[number];

export const CONDITIONS = ["clear", "clouds", "rain", "snow"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const TIMES_OF_DAY = ["morning", "afternoon", "evening", "night"] as const;
export type TimeOfDay = (typeof TIMES_OF_DAY)[number];

export const VIBES = [
  "chill",
  "history",
  "walks",
  "food",
  "instagrammable",
  "indoor",
  "night",
] as const;
export type Vibe = (typeof VIBES)[number];

export const SETTINGS = ["indoor", "outdoor", "covered", "mixed"] as const;
export type Setting = (typeof SETTINGS)[number];

export const CATEGORIES = ["free", "insider", "bookable"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PRICE_TIERS = ["free", "low", "medium", "high"] as const;
export type PriceTier = (typeof PRICE_TIERS)[number];

export interface ActivitySuitability {
  temps: TempBand[];
  conditions: Condition[];
  times: TimeOfDay[];
}

export interface CityActivity {
  /** Stable slug used for localStorage preference keys, e.g. "lisbon-lx-factory". */
  id: string;
  title: string;
  category: Category;
  /** 1-2 sentences describing the real, named place or experience. */
  description: string;
  /** The "locals know" angle; strongly encouraged for insider items. */
  insiderNote?: string;
  setting: Setting;
  suitability: ActivitySuitability;
  vibes: Vibe[];
  /** [min, max] minutes. */
  durationMinutes: [number, number];
  priceTier: PriceTier;
  priceHint?: string;
  /** Months (1-12) when this activity applies; absent = year-round. */
  months?: number[];
  neighborhood?: string;
  /** Emoji shown on the card. */
  icon: string;
  imageUrl?: string;
  /** Affiliate search string for bookables, e.g. "Alfama walking tour Lisbon". */
  bookingQuery?: string;
}

export interface CityContent {
  schemaVersion: 1;
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  heroImageUrl?: string;
  /** 3-5 evergreen local tips. */
  localTips: string[];
  activities: CityActivity[];
}

export interface CityIndexEntry {
  slug: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** Lowercase alternate spellings/names, e.g. ["nyc", "new york city"]. */
  aliases: string[];
}
