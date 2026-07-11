import React from "react";
import Link from "next/link";
import { CityHero } from "./CityHero";
import { OutfitCard } from "./OutfitCard";
import { ActivityCard } from "./ActivityCard";
import { NearestCityBanner } from "./NearestCityBanner";
import { VibeChips } from "./VibeChips";
import type { Vibe } from "../lib/content/types";
import type { ActivityPreferenceState } from "../lib/userPrefs";
import type { TodayActivity, TodaySuccess } from "../pages/api/today";

interface ResultsLayoutProps {
  data: TodaySuccess;
  selectedVibes: Vibe[];
  onToggleVibe: (vibe: Vibe) => void;
  showHidden: boolean;
  onToggleShowHidden: () => void;
  getPreference: (activityId: string) => ActivityPreferenceState | undefined;
  onSetPreference: (activityId: string, state: ActivityPreferenceState | null) => void;
}

interface SectionSpec {
  key: "free" | "insider" | "bookable";
  title: string;
  subtitle: string;
  emoji: string;
  activities: TodayActivity[];
}

export const ResultsLayout: React.FC<ResultsLayoutProps> = ({
  data,
  selectedVibes,
  onToggleVibe,
  showHidden,
  onToggleShowHidden,
  getPreference,
  onSetPreference,
}) => {
  const sections: SectionSpec[] = [
    {
      key: "free",
      title: "Free today",
      subtitle: "Great things that cost nothing",
      emoji: "🌿",
      activities: data.freeActivities,
    },
    {
      key: "insider",
      title: "Insider picks",
      subtitle: "Where locals actually go",
      emoji: "🗝️",
      activities: data.insiderTips,
    },
    {
      key: "bookable",
      title: "Worth booking",
      subtitle: "Experiences to lock in",
      emoji: "🎟️",
      activities: data.bookableExperiences,
    },
  ];

  const hiddenCount = sections
    .flatMap((s) => s.activities)
    .filter((a) => getPreference(a.id) === "dismissed").length;

  return (
    <div>
      {data.match === "nearest" && (
        <NearestCityBanner
          requestedCity={data.requestedCity}
          resolvedCity={data.city.name}
          distanceKm={data.distanceKm}
        />
      )}

      <CityHero
        city={data.city.name}
        country={data.city.country}
        description={data.weather.description}
        temperature={data.weather.temperature}
        feelsLike={data.weather.feelsLike}
        humidity={data.weather.humidity}
        windSpeed={data.weather.windSpeed}
        condition={data.weather.condition}
        timeOfDay={data.weather.timeOfDay}
        localHour={data.weather.localHour}
        iconUrl={data.weather.iconUrl}
        imageUrl={data.heroImageUrl}
      />

      <div className="mb-6 flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Tune today&apos;s picks
        </p>
        <VibeChips selected={selectedVibes} onToggle={onToggleVibe} size="sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          {sections.map((section) => {
            const visible = section.activities.filter(
              (a) => showHidden || getPreference(a.id) !== "dismissed"
            );
            if (visible.length === 0) return null;
            return (
              <section key={section.key}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <span>{section.emoji}</span>
                    {section.title}
                  </h2>
                  <p className="text-xs text-slate-400">{section.subtitle}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {visible.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      citySlug={data.city.slug}
                      cityName={data.city.name}
                      section={section.key}
                      preference={getPreference(activity.id)}
                      onSetPreference={onSetPreference}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={onToggleShowHidden}
              className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              {showHidden
                ? "Hide dismissed activities"
                : `Show ${hiddenCount} dismissed ${hiddenCount === 1 ? "activity" : "activities"}`}
            </button>
          )}
        </div>

        <aside className="space-y-6">
          <OutfitCard
            headline={data.outfit.headline}
            explanation={data.outfit.explanation}
            items={data.outfit.items}
          />

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <span className="text-xl">💡</span>
              Good to know
            </h2>
            <ul className="mt-3 space-y-2.5">
              {data.localTips.slice(0, 4).map((tip) => (
                <li key={tip} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-slate-300">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Covered cities</h2>
            <p className="mt-1 text-xs text-slate-500">
              Instant weather-smart plans for {data.coveredCities.length} cities and counting.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.coveredCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/results?city=${encodeURIComponent(c.name)}`}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    c.slug === data.city.slug
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
