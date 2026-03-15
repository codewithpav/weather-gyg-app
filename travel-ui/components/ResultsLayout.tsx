import React from "react";
import { OutfitCard } from "./OutfitCard";
import { ActivityCard } from "./ActivityCard";
import { TipsCard } from "./TipsCard";
import { CityHero } from "./CityHero";

type RecommendationCard = {
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

interface ResultsLayoutProps {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  iconUrl?: string;
  cityHeroImageUrl?: string;
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
  onBackToLanding: () => void;
  isWeatherLoading?: boolean;
  isAiLoading?: boolean;
  aiError?: string | null;
  selectedVibes?: string[];
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
    onBackToLanding,
    isWeatherLoading = false,
    isAiLoading = false,
    aiError = null,
    selectedVibes = [],
  } = props;

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
          </section>
        )}

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 lg:items-start">
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                  Best things to do right now
                </h2>
                <p className="text-xs text-slate-400">
                  Pick one and get moving
                </p>
              </div>
              {isAiLoading && (
                <p className="mb-3 text-xs text-slate-400">
                  Picking the strongest options for this weather and time...
                </p>
              )}
              {aiError && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {aiError} Showing weather now - retry this city in a few seconds.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freeActivities.map((a, idx) => (
                    <ActivityCard
                      key={`${a.title}-${idx}`}
                      city={city}
                      showPriceLevel={false}
                      {...a}
                    />
                  ))}
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
                  {bookableExperiences.map((exp, idx) => (
                    <ActivityCard
                      key={`${exp.title}-${idx}`}
                      city={city}
                      {...exp}
                      showBookingCta
                      showPriceLevel
                      providerLabel="Compare providers"
                    />
                  ))}
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

