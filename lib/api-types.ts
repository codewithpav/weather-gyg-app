// Response types for /api/today endpoint
import type { CityActivity, Condition, TimeOfDay } from "./content/types";

export interface OutfitItem {
  icon: string;
  label: string;
  note?: string;
}

export interface Outfit {
  headline: string;
  items: OutfitItem[];
}

export interface TodayActivity extends CityActivity {
  whyNow: string; // Why this activity suits right now (weather, time, vibes)
  durationLabel: string; // e.g. "1–2 hours"
  reasonTags: string[]; // e.g. ["Indoors", "Rain-safe", "Vibe match"]
  caution?: string; // e.g. "Bring an umbrella" for outdoor in drizzle
  providerLinks?: {
    getYourGuide: string;
    klook: string;
    viator: string;
  };
}

export interface WeatherSnapshot {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  condition: Condition;
  timeOfDay: TimeOfDay;
  localHour: number;
  fetchedAt: string;
}

export interface CitySnapshot {
  slug: string;
  name: string;
  country: string;
}

export interface TodaySuccess {
  requestedCity: string; // What the user searched for
  city: CitySnapshot;
  match: "exact" | "nearest";
  distanceKm?: number;
  weather: WeatherSnapshot;
  heroImageUrl?: string;
  outfit: Outfit;
  freeActivities: TodayActivity[];
  insiderTips: TodayActivity[];
  bookableExperiences: TodayActivity[];
  localTips: string[];
  coveredCities: Array<{ slug: string; name: string }>;
}

export interface TodayError {
  error: string;
  code?: string;
}

export type TodayResponse = TodaySuccess | TodayError;
