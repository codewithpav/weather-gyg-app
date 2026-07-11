import test from "node:test";
import assert from "node:assert/strict";
import { recommend } from "../lib/recommend";
import { buildOutfit } from "../lib/outfit";
import {
  tempBandFromFeelsLike,
  conditionFromCode,
  timeOfDayFromOffset,
  type WeatherContext,
} from "../lib/weatherBuckets";
import { haversineKm } from "../lib/content/nearestCity";
import type { CityActivity } from "../lib/content/types";

function ctx(overrides: Partial<WeatherContext> = {}): WeatherContext {
  return {
    tempBand: "mild",
    condition: "clear",
    timeOfDay: "afternoon",
    localHour: 14,
    temperature: 15,
    feelsLike: 14,
    windSpeed: 3,
    description: "clear sky",
    humidity: 50,
    iconUrl: "",
    ...overrides,
  };
}

function activity(overrides: Partial<CityActivity>): CityActivity {
  return {
    id: "test-activity",
    title: "Test",
    category: "free",
    description: "A test activity somewhere nice.",
    setting: "outdoor",
    suitability: {
      temps: ["mild", "warm"],
      conditions: ["clear", "clouds"],
      times: ["morning", "afternoon"],
    },
    vibes: ["walks"],
    durationMinutes: [60, 120],
    priceTier: "free",
    icon: "🌳",
    ...overrides,
  };
}

test("rain filters out unsuitable outdoor activities", () => {
  const outdoorSunny = activity({ id: "sunny-walk" });
  const indoorMuseum = activity({
    id: "museum",
    setting: "indoor",
    suitability: { temps: ["mild"], conditions: ["clear", "clouds", "rain"], times: ["afternoon"] },
  });
  const picks = recommend({
    citySlug: "testville",
    activities: [outdoorSunny, indoorMuseum],
    ctx: ctx({ condition: "rain" }),
    vibes: [],
  });
  assert.equal(picks.free[0].activity.id, "museum");
});

test("fallback readmits outdoor items with a caution when pool is thin", () => {
  const onlyOutdoor = activity({ id: "outdoor-only" });
  const picks = recommend({
    citySlug: "testville",
    activities: [onlyOutdoor],
    ctx: ctx({ condition: "rain" }),
    vibes: [],
  });
  assert.equal(picks.free.length, 1);
  assert.ok(picks.free[0].caution);
});

test("vibe overlap boosts score", () => {
  const foodSpot = activity({ id: "food-spot", vibes: ["food"] });
  const walkSpot = activity({ id: "walk-spot", vibes: ["walks"] });
  const picks = recommend({
    citySlug: "testville",
    activities: [foodSpot, walkSpot],
    ctx: ctx(),
    vibes: ["food"],
  });
  assert.equal(picks.free[0].activity.id, "food-spot");
});

test("out-of-season activities are excluded", () => {
  const christmasMarket = activity({ id: "xmas", months: [12] });
  const evergreen = activity({ id: "evergreen" });
  const july = new Date("2026-07-15T12:00:00Z");
  const picks = recommend({
    citySlug: "testville",
    activities: [christmasMarket, evergreen],
    ctx: ctx(),
    vibes: [],
    now: july,
  });
  assert.deepEqual(
    picks.free.map((p) => p.activity.id),
    ["evergreen"]
  );
});

test("outfit adds umbrella in rain and sunscreen on hot clear days", () => {
  const rainy = buildOutfit(ctx({ condition: "rain", tempBand: "mild" }));
  assert.ok(rainy.items.some((i) => i.icon === "☔"));

  const scorcher = buildOutfit(ctx({ condition: "clear", tempBand: "hot" }));
  assert.ok(scorcher.items.some((i) => i.icon === "🧴"));

  const freezing = buildOutfit(ctx({ tempBand: "freezing" }));
  assert.ok(freezing.items.some((i) => i.label.toLowerCase().includes("gloves")));
});

test("temp bands and condition codes map correctly", () => {
  assert.equal(tempBandFromFeelsLike(-5), "freezing");
  assert.equal(tempBandFromFeelsLike(5), "cold");
  assert.equal(tempBandFromFeelsLike(12), "mild");
  assert.equal(tempBandFromFeelsLike(22), "warm");
  assert.equal(tempBandFromFeelsLike(30), "hot");

  assert.equal(conditionFromCode(500), "rain");
  assert.equal(conditionFromCode(211), "rain");
  assert.equal(conditionFromCode(600), "snow");
  assert.equal(conditionFromCode(800), "clear");
  assert.equal(conditionFromCode(804), "clouds");
  assert.equal(conditionFromCode(741), "clouds");
});

test("time of day uses the city's UTC offset, not the server clock", () => {
  // 21:00 UTC; Tokyo (+9h) should be 06:00 = morning.
  const nine_pm_utc = new Date("2026-07-10T21:00:00Z");
  const tokyo = timeOfDayFromOffset(9 * 3600, nine_pm_utc);
  assert.equal(tokyo.timeOfDay, "morning");
  // Same instant in London (UTC+0/BST+1... offset given directly): 21:00 = night.
  const london = timeOfDayFromOffset(0, nine_pm_utc);
  assert.equal(london.timeOfDay, "night");
});

test("haversine distance is sane (Paris to London ~344km)", () => {
  const d = haversineKm(48.8566, 2.3522, 51.5074, -0.1278);
  assert.ok(d > 330 && d < 360, `got ${d}`);
});

test("daily seeded ranking is stable within a day", () => {
  const pool = Array.from({ length: 10 }, (_, i) =>
    activity({ id: `walk-${i}` })
  );
  const run = () =>
    recommend({ citySlug: "testville", activities: pool, ctx: ctx(), vibes: [] });
  assert.deepEqual(
    run().free.map((p) => p.activity.id),
    run().free.map((p) => p.activity.id)
  );
});
