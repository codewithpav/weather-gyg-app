// Pure selection/ranking over a city's precomputed activity pool.
// No I/O, no AI — filter by season, score against the live weather context
// and requested vibes, then pick a diverse set per category.
import type { CityActivity, Category, TimeOfDay, Vibe } from "./content/types";
import type { WeatherContext } from "./weatherBuckets";

export interface ScoredActivity {
  activity: CityActivity;
  score: number;
  reasonTags: string[];
  whyNow: string;
  caution?: string;
}

const ADJACENT_TIMES: Record<TimeOfDay, TimeOfDay[]> = {
  morning: ["afternoon"],
  afternoon: ["morning", "evening"],
  evening: ["afternoon", "night"],
  night: ["evening"],
};

const PICK_COUNTS: Record<Category, number> = { free: 4, insider: 3, bookable: 4 };

function inSeason(activity: CityActivity, month: number): boolean {
  return !activity.months || activity.months.includes(month);
}

// Deterministic per-day tiebreak: stable within a day, fresh tomorrow.
function dailySeed(slug: string, date: Date): number {
  const key = `${slug}:${date.toISOString().slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return hash;
}

function seededJitter(seed: number, id: string): number {
  let hash = seed;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 1000) / 1000; // 0..1, deterministic
}

interface ScoreResult {
  score: number;
  reasonTags: string[];
  whyNow: string;
  caution?: string;
  hardFail: boolean;
}

const CONDITION_LABEL: Record<string, string> = {
  clear: "clear skies",
  clouds: "cloudy skies",
  rain: "the rain",
  snow: "the snow",
};

function scoreActivity(
  activity: CityActivity,
  ctx: WeatherContext,
  vibes: Vibe[]
): ScoreResult {
  const s = activity.suitability;
  const reasonTags: string[] = [];
  const whyParts: string[] = [];
  let score = 50;
  let caution: string | undefined;

  const wetWeather = ctx.condition === "rain" || ctx.condition === "snow";
  const conditionMatch = s.conditions.includes(ctx.condition);

  // Hard filter: fully outdoor activities that don't list the current wet condition.
  if (wetWeather && activity.setting === "outdoor" && !conditionMatch) {
    return { score: 0, reasonTags, whyNow: "", hardFail: true };
  }

  if (conditionMatch) {
    score += 20;
    if (wetWeather && (activity.setting === "indoor" || activity.setting === "covered")) {
      score += 4;
      reasonTags.push(ctx.condition === "rain" ? "Rain-proof" : "Snow-proof");
      whyParts.push(`a dry escape from ${CONDITION_LABEL[ctx.condition]}`);
    } else if (ctx.condition === "clear" && activity.setting === "outdoor") {
      reasonTags.push("Great in this weather");
      whyParts.push("made for clear skies");
    }
  } else if (!wetWeather) {
    score -= 4; // mildly off-condition, still fine
  }

  if (s.temps.includes(ctx.tempBand)) {
    score += 12;
  } else {
    score -= 8;
  }

  const timeMatch = s.times.includes(ctx.timeOfDay);
  const adjacentMatch = ADJACENT_TIMES[ctx.timeOfDay].some((t) => s.times.includes(t));
  if (timeMatch) {
    score += 12;
    if (ctx.timeOfDay === "night" || ctx.timeOfDay === "evening") {
      if (activity.vibes.includes("night")) {
        reasonTags.push("Best after dark");
        whyParts.push("at its best after dark");
      }
    } else if (ctx.timeOfDay === "morning" && s.times.length <= 2) {
      reasonTags.push("Morning pick");
      whyParts.push("best in the morning hours");
    }
  } else if (adjacentMatch) {
    score -= 6;
  } else {
    score -= 14;
  }

  const vibeOverlap = vibes.filter((v) => activity.vibes.includes(v));
  if (vibeOverlap.length > 0) {
    score += Math.min(vibeOverlap.length * 8, 16);
    const label = vibeOverlap[0];
    reasonTags.push(`${label.charAt(0).toUpperCase() + label.slice(1)} vibe`);
    whyParts.push(`matches your ${vibeOverlap.join(" + ")} vibe`);
  }

  if (wetWeather && activity.setting === "mixed" && conditionMatch) {
    caution = "Partly outdoors — bring an umbrella.";
  }

  const whyNow =
    whyParts.length > 0
      ? capitalize(whyParts.join(", and "))
      : `A solid pick for ${ctx.timeOfDay} in this weather.`;

  return { score, reasonTags: reasonTags.slice(0, 3), whyNow, caution, hardFail: false };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

function diversify(picks: ScoredActivity[], limit: number): ScoredActivity[] {
  const chosen: ScoredActivity[] = [];
  const seenPairs = new Set<string>();
  for (const candidate of picks) {
    if (chosen.length >= limit) break;
    const pair = `${candidate.activity.setting}::${candidate.activity.vibes[0] ?? ""}`;
    if (seenPairs.has(pair) && picks.length - chosen.length > limit - chosen.length) {
      continue;
    }
    seenPairs.add(pair);
    chosen.push(candidate);
  }
  // Backfill if diversity filtering left us short.
  for (const candidate of picks) {
    if (chosen.length >= limit) break;
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }
  return chosen;
}

export interface RecommendationInput {
  citySlug: string;
  activities: CityActivity[];
  ctx: WeatherContext;
  vibes: Vibe[];
  now?: Date;
}

export function recommend(input: RecommendationInput): Record<Category, ScoredActivity[]> {
  const now = input.now ?? new Date();
  const month = now.getUTCMonth() + 1;
  const seed = dailySeed(input.citySlug, now);

  const result: Record<Category, ScoredActivity[]> = { free: [], insider: [], bookable: [] };

  for (const category of Object.keys(PICK_COUNTS) as Category[]) {
    const pool = input.activities.filter(
      (a) => a.category === category && inSeason(a, month)
    );

    let scored = pool
      .map((activity) => ({ activity, ...scoreActivity(activity, input.ctx, input.vibes) }))
      .filter((s) => !s.hardFail);

    // Fallback ladder: if the strict pass leaves too few, readmit hard-failed
    // outdoor items with a caution (drizzle-with-umbrella territory).
    if (scored.length < PICK_COUNTS[category]) {
      const relaxed = pool
        .map((activity) => ({ activity, ...scoreActivity(activity, input.ctx, input.vibes) }))
        .filter((s) => s.hardFail)
        .map((s) => ({
          ...s,
          score: 30,
          caution: "Weather may interfere — have a backup plan.",
          whyNow: "Worth it if the weather holds.",
          hardFail: false,
        }));
      scored = scored.concat(relaxed);
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return seededJitter(seed, a.activity.id) - seededJitter(seed, b.activity.id);
    });

    result[category] = diversify(scored, PICK_COUNTS[category]).map(
      ({ activity, score, reasonTags, whyNow, caution }) => ({
        activity,
        score,
        reasonTags,
        whyNow,
        caution,
      })
    );
  }

  return result;
}
