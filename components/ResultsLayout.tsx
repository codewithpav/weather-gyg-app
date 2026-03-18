import React from "react";
import { OutfitCard } from "./OutfitCard";
import { ActivityCard } from "./ActivityCard";
import { TipsCard } from "./TipsCard";
import { CityHero } from "./CityHero";
import { SwipeDeck } from "./SwipeDeck";
import {
  makeActivityPreferenceKey,
  type ActivityPreferenceState,
  type ActivitySection,
} from "../lib/userPrefs";

type RecommendationCard = {
  title: string;
  description: string;
  whyNow: string;
  duration: string;
  priceHint?: string;
  icon?: string;
  imageUrl?: string;
  reasonTags?: string[];
  rankScore?: number;
  providerLinks?: {
    getYourGuide?: string;
    klook?: string;
    viator?: string;
  };
};

interface ResultsLayoutProps {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  iconUrl?: string;
  cityHeroImageUrl?: string;
  weatherUpdatedAt?: string;
  outfitHeadline: string;
  outfitExplanation: string;
  outfitItems: {
    icon: string;
    label: string;
    note?: string;
  }[];
  freeActivities: RecommendationCard[];
  insiderTips: RecommendationCard[];
  bookableExperiences: RecommendationCard[];
  localTip?: string;
  localRecommendations?: string[];
  searchCity: string;
  onSearchCityChange: (value: string) => void;
  onSearchCitySubmit: () => void;
  onRetryAi?: () => void;
  onBackToLanding: () => void;
  isWeatherLoading?: boolean;
  isAiLoading?: boolean;
  aiError?: string | null;
  selectedVibes?: string[];
  activityPreferences?: Record<string, ActivityPreferenceState>;
  onActivityPreferenceChange?: (
    section: ActivitySection,
    title: string,
    next: ActivityPreferenceState | null
  ) => void;
  hideDismissed?: boolean;
  hideCompleted?: boolean;
  onHideDismissedChange?: (value: boolean) => void;
  onHideCompletedChange?: (value: boolean) => void;
}

export const ResultsLayout: React.FC<ResultsLayoutProps> = (props) => {
  const {
    city,
    temperature,
    feelsLike,
    description,
    humidity,
    iconUrl,
    cityHeroImageUrl,
    weatherUpdatedAt,
    outfitHeadline,
    outfitExplanation,
    outfitItems,
    freeActivities,
    insiderTips,
    bookableExperiences,
    localTip = "",
    localRecommendations = [],
    searchCity,
    onSearchCityChange,
    onSearchCitySubmit,
    onRetryAi,
    onBackToLanding,
    isWeatherLoading = false,
    isAiLoading = false,
    aiError = null,
    selectedVibes = [],
    activityPreferences = {},
    onActivityPreferenceChange,
    hideDismissed = true,
    hideCompleted = false,
    onHideDismissedChange,
    onHideCompletedChange,
  } = props;
  const reasonLabel =
    selectedVibes.length > 0 ? "Why this fits your vibe now" : "Why now";
  const weatherSummary = `${Math.round(temperature)}C, ${description}`;
  const getActivityPreference = (section: ActivitySection, title: string) => {
    const key = makeActivityPreferenceKey(city, section, title);
    return activityPreferences[key] || null;
  };
  const shouldDisplay = (section: ActivitySection, title: string) => {
    const state = getActivityPreference(section, title);
    if (hideDismissed && state === "dismissed") return false;
    if (hideCompleted && state === "done") return false;
    return true;
  };

  const filteredFreeActivities = freeActivities.filter((item) =>
    shouldDisplay("best_now", item.title)
  );
  const topPick = filteredFreeActivities[0];
  const remainingFreeActivities = filteredFreeActivities.slice(1);
  const filteredBookableExperiences = bookableExperiences.filter((item) =>
    shouldDisplay("bookable", item.title)
  );

  const getFreshnessLabel = () => {
    if (!weatherUpdatedAt) return "Updated just now";
    const updatedMs = new Date(weatherUpdatedAt).getTime();
    if (Number.isNaN(updatedMs)) return "Updated just now";
    const diffMins = Math.max(0, Math.floor((Date.now() - updatedMs) / 60000));
    if (diffMins < 1) return "Updated just now";
    if (diffMins === 1) return "Updated 1 min ago";
    return `Updated ${diffMins} mins ago`;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <section className="mb-6 sm:mb-8 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ← Back to search
            </button>

            <div className="flex w-full items-center gap-2">
              <input
                value={searchCity}
                onChange={(e) => onSearchCityChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearchCitySubmit()}
                placeholder="Search another city..."
                className="h-10 w-full rounded-2xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
              <button
                type="button"
                onClick={onSearchCitySubmit}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </section>

        <CityHero
          city={city}
          description={description}
          temperature={temperature}
          feelsLike={feelsLike}
          humidity={humidity}
          iconUrl={iconUrl}
          imageUrl={cityHeroImageUrl}
          isLoading={isWeatherLoading}
        />

        <section className="mb-4 mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          <span>{getFreshnessLabel()}</span>
          <span aria-hidden="true">•</span>
          <span>Tuned using weather, time of day, and your vibe filters.</span>
          <span aria-hidden="true">•</span>
          <span>Sources: OpenWeather, OpenAI, Pexels/Openverse/Wikimedia</span>
        </section>

        {(isWeatherLoading || isAiLoading) && (
          <p className="mb-6 text-xs text-slate-400">
            {isWeatherLoading
              ? "Updating live weather..."
              : "Weather ready. Generating activity ideas..."}
          </p>
        )}

        {selectedVibes.length > 0 && (
          <section className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Focused on
            </span>
            {selectedVibes.map((vibe) => (
              <span
                key={vibe}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"
              >
                {vibe}
              </span>
            ))}
            <span className="ml-1 text-xs text-slate-500">
              Recommendations are tuned to weather, time of day, and your selected vibes.
            </span>
          </section>
        )}

        <section className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Display options</span>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={hideDismissed}
              onChange={(e) => onHideDismissedChange?.(e.target.checked)}
            />
            Hide dismissed
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => onHideCompletedChange?.(e.target.checked)}
            />
            Hide completed
          </label>
        </section>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 lg:items-start">
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            <section>
              {!isAiLoading && topPick && (
                <div className="mb-4 hidden sm:block rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Top pick right now
                    </p>
                  </div>
                  <ActivityCard
                    city={city}
                    reasonLabel={reasonLabel}
                    showPriceLevel={false}
                    activityState={getActivityPreference("best_now", topPick.title)}
                    onChangeActivityState={(next) =>
                      onActivityPreferenceChange?.("best_now", topPick.title, next)
                    }
                    trackingContext={{
                      section: "best_now",
                      position: 1,
                      selectedVibes,
                      weatherSummary,
                    }}
                    {...topPick}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                  Best things to do right now
                </h2>
                <p className="text-xs text-slate-400">
                  Ranked for weather, timing, and vibe fit
                </p>
              </div>
              {isAiLoading && (
                <p className="mb-3 text-xs text-slate-400">
                  Picking the strongest options for this weather and time...
                </p>
              )}
              {aiError && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <p>{aiError} Showing weather now - retry recommendations in a few seconds.</p>
                  {onRetryAi && (
                    <button
                      type="button"
                      onClick={onRetryAi}
                      className="mt-2 inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                    >
                      Retry recommendations
                    </button>
                  )}
                </div>
              )}
              {isAiLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                  <div className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                  <div className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                  <div className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                </div>
              ) : (
                <div>
                  <div className="sm:hidden">
                    {filteredFreeActivities.length > 0 ? (
                      <SwipeDeck
                        items={filteredFreeActivities}
                        getKey={(item, idx) => `${item.title}-${idx}`}
                        onSwipe={(item, direction) =>
                          onActivityPreferenceChange?.(
                            "best_now",
                            item.title,
                            direction === "right" ? "saved" : "dismissed"
                          )
                        }
                        onUndoSwipe={(item) =>
                          onActivityPreferenceChange?.("best_now", item.title, null)
                        }
                        renderCard={(item, idx) => (
                          <ActivityCard
                            key={`${item.title}-${idx}`}
                            city={city}
                            reasonLabel={reasonLabel}
                            showPriceLevel={false}
                            showPreferenceActions={false}
                            activityState={getActivityPreference("best_now", item.title)}
                            onChangeActivityState={(next) =>
                              onActivityPreferenceChange?.("best_now", item.title, next)
                            }
                            trackingContext={{
                              section: "best_now",
                              position: idx + 1,
                              selectedVibes,
                              weatherSummary,
                            }}
                            {...item}
                          />
                        )}
                      />
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                        No activities match your current display filters. Try turning off
                        &quot;Hide dismissed&quot; or &quot;Hide completed&quot;.
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:grid sm:grid-cols-2 gap-4">
                    {remainingFreeActivities.map((a, idx) => (
                      <ActivityCard
                        key={`${a.title}-${idx}`}
                        city={city}
                        reasonLabel={reasonLabel}
                        showPriceLevel={false}
                        activityState={getActivityPreference("best_now", a.title)}
                        onChangeActivityState={(next) =>
                          onActivityPreferenceChange?.("best_now", a.title, next)
                        }
                        trackingContext={{
                          section: "best_now",
                          position: idx + 2,
                          selectedVibes,
                          weatherSummary,
                        }}
                        {...a}
                      />
                    ))}
                    {filteredFreeActivities.length === 0 && (
                      <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                        No activities match your current display filters. Try turning off
                        &quot;Hide dismissed&quot; or &quot;Hide completed&quot;.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                  Bookable experiences
                </h2>
                <p className="text-xs text-slate-400">
                  Best if availability remains today
                </p>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Availability may vary by provider. Compare options across partners
                like GetYourGuide, Klook, and others.
              </p>
              {isAiLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                  <div className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBookableExperiences.map((exp, idx) => (
                    <ActivityCard
                      key={`${exp.title}-${idx}`}
                      city={city}
                      reasonLabel={reasonLabel}
                      activityState={getActivityPreference("bookable", exp.title)}
                      onChangeActivityState={(next) =>
                        onActivityPreferenceChange?.("bookable", exp.title, next)
                      }
                      {...exp}
                      showBookingCta
                      showPriceLevel
                      providerLabel="Compare providers"
                      trackingContext={{
                        section: "bookable",
                        position: idx + 1,
                        selectedVibes,
                        weatherSummary,
                      }}
                    />
                  ))}
                  {filteredBookableExperiences.length === 0 && (
                    <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                      No bookable cards match your current display filters.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {isAiLoading ? (
              <>
                <section className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-xl">🧥</span>
                    <span>What to wear</span>
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Preparing your weather-based outfit suggestions...
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                </section>

                <section className="rounded-3xl bg-slate-900 p-5 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-50 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <span>Hidden local tips</span>
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Little things locals know that make your day smoother.
                  </p>
                  <p className="mt-3 text-xs text-slate-300">
                    Finding insider tips for this city...
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="h-10 animate-pulse rounded-2xl bg-white/10" />
                    <div className="h-10 animate-pulse rounded-2xl bg-white/10" />
                    <div className="h-10 animate-pulse rounded-2xl bg-white/10" />
                  </div>
                </section>
              </>
            ) : (
              <>
                <OutfitCard
                  headline={outfitHeadline}
                  explanation={outfitExplanation}
                  items={outfitItems}
                />
                {localRecommendations.length > 0 ? (
                  <TipsCard tips={localRecommendations} />
                ) : localTip ? (
                  <TipsCard tips={[localTip]} />
                ) : (
                  <TipsCard tips={[]} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

