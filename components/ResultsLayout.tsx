import React from "react";
import Link from "next/link";
import { CityHero } from "./CityHero";
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
      activities: data.freeActivities,
    },
    {
      key: "insider",
      title: "Like a local",
      subtitle: "Where the city actually goes",
      activities: data.insiderTips,
    },
    {
      key: "bookable",
      title: "Worth booking",
      subtitle: "Experiences to lock in",
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
        imageUrl={data.heroImageUrl}
      />

      <div className="mb-10 flex justify-center">
        <VibeChips selected={selectedVibes} onToggle={onToggleVibe} size="sm" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-12">
          {sections.map((section) => {
            const visible = section.activities.filter(
              (a) => showHidden || getPreference(a.id) !== "dismissed"
            );
            if (visible.length === 0) return null;
            return (
              <section key={section.key}>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                    {section.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">{section.subtitle}</p>
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
                : `Show ${hiddenCount} hidden ${hiddenCount === 1 ? "activity" : "activities"}`}
            </button>
          )}
        </div>

        <aside>
          <div className="card-elevated space-y-6 rounded-2xl border border-black/[0.04] bg-white p-6 lg:sticky lg:top-20">
            <section>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                What to wear
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {data.outfit.headline}
              </p>
              <ul className="mt-3 space-y-2">
                {data.outfit.items.map((item) => (
                  <li key={item.label} className="flex items-baseline gap-2.5 text-sm">
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="text-slate-700">{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="border-t border-slate-100" />

            <section>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                Good to know
              </h2>
              <ul className="mt-3 space-y-2.5">
                {data.localTips.slice(0, 3).map((tip) => (
                  <li key={tip} className="text-sm leading-relaxed text-slate-600">
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>

      <section className="mt-16 border-t border-slate-200/70 pt-8">
        <p className="text-sm font-medium text-slate-900">
          Covered cities
          <span className="ml-2 font-normal text-slate-400">
            searching elsewhere routes you to the nearest one
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.coveredCities.map((c) => (
            <Link
              key={c.slug}
              href={`/results?city=${encodeURIComponent(c.name)}`}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                c.slug === data.city.slug
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 shadow-sm ring-1 ring-black/[0.06] hover:ring-black/20"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
