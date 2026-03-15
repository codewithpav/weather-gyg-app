import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ResultsLayout } from "../components/ResultsLayout";

type WeatherPayload = {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  iconUrl?: string;
  cityHeroImageUrl?: string;
};

type AiPayload = {
  outfitHeadline: string;
  outfitExplanation: string;
  outfitItems: { icon: string; label: string; note?: string }[];
  freeActivities: {
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
  }[];
  insiderTips: {
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
  }[];
  bookableExperiences: {
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
  }[];
  localTip?: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const city = useMemo(() => ((router.query.city as string) || "London").trim(), [router.query.city]);
  const vibeFilters = useMemo(() => {
    const raw = router.query.vibes;
    const value = Array.isArray(raw) ? raw.join(",") : raw || "";
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }, [router.query.vibes]);
  const [searchCity, setSearchCity] = useState("");
  const [pendingCity, setPendingCity] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [aiData, setAiData] = useState<AiPayload | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    setSearchCity(city);
  }, [city, router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;

    const controller = new AbortController();
    const load = async () => {
      try {
        setWeatherLoading(true);
        setAiLoading(true);
        setWeatherError(null);
        setAiError(null);
        setWeatherData(null);
        setAiData(null);

        const weatherResponse = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
          signal: controller.signal,
        });

        let weatherPayload: any = null;
        try {
          weatherPayload = await weatherResponse.json();
        } catch {
          weatherPayload = null;
        }

        if (!weatherResponse.ok || !weatherPayload || typeof weatherPayload !== "object") {
          setWeatherError(
            weatherPayload?.error ||
              `Failed to load weather (HTTP ${weatherResponse.status}).`
          );
          setPendingCity(null);
          setWeatherLoading(false);
          setAiLoading(false);
          return;
        }

        setWeatherData(weatherPayload as WeatherPayload);
        setWeatherLoading(false);
        setPendingCity(null);

        const aiUrl = new URL("/api/ai-recommendations", window.location.origin);
        const currentHour = new Date().getHours();
        const timeOfDay =
          currentHour < 12
            ? "morning"
            : currentHour < 17
            ? "afternoon"
            : currentHour < 21
            ? "evening"
            : "night";
        aiUrl.searchParams.set("city", weatherPayload.city);
        aiUrl.searchParams.set("temperature", String(weatherPayload.temperature));
        aiUrl.searchParams.set("feelsLike", String(weatherPayload.feelsLike));
        aiUrl.searchParams.set("description", weatherPayload.description);
        aiUrl.searchParams.set("humidity", String(weatherPayload.humidity));
        aiUrl.searchParams.set("timeOfDay", timeOfDay);
        if (vibeFilters.length > 0) {
          aiUrl.searchParams.set("vibes", vibeFilters.join(","));
        }

        const aiResponse = await fetch(aiUrl.toString(), { signal: controller.signal });
        let aiPayload: any = null;
        try {
          aiPayload = await aiResponse.json();
        } catch {
          aiPayload = null;
        }

        if (!aiResponse.ok || !aiPayload || typeof aiPayload !== "object") {
          setAiError(aiPayload?.error || "Could not generate AI recommendations.");
          setAiLoading(false);
          return;
        }

        setAiData(aiPayload as AiPayload);
        setAiLoading(false);
        setPendingCity(null);
      } catch (err: any) {
        // Ignore request cancellation when city changes or component unmounts.
        if (err?.name === "AbortError") return;
        setWeatherError("Unable to load weather right now. Please try again.");
        setAiError("Could not generate AI recommendations right now.");
        setPendingCity(null);
      } finally {
        if (!controller.signal.aborted) {
          setWeatherLoading(false);
          setAiLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [city, router.isReady, vibeFilters]);

  const handleSearchSubmit = () => {
    const nextCity = searchCity.trim();
    if (!nextCity) return;
    setPendingCity(nextCity);
    router.push(`/results?city=${encodeURIComponent(nextCity)}`);
  };

  const displayCity = (
    pendingCity ||
    weatherData?.city ||
    city ||
    "City"
  ).trim();

  if (weatherError && !weatherData) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-3xl bg-white border border-red-100 shadow-sm p-6 text-center max-w-md w-full">
          <p className="text-red-700 font-medium">Could not load weather</p>
          <p className="mt-2 text-sm text-slate-600">{weatherError}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition-colors"
          >
            Back to search
          </button>
        </div>
      </main>
    );
  }

  return (
    <ResultsLayout
      city={displayCity}
      temperature={weatherData?.temperature ?? 0}
      feelsLike={weatherData?.feelsLike ?? 0}
      description={weatherData?.description ?? ""}
      humidity={weatherData?.humidity ?? 0}
      iconUrl={weatherData?.iconUrl}
      cityHeroImageUrl={weatherData?.cityHeroImageUrl}
      outfitHeadline={aiData?.outfitHeadline ?? ""}
      outfitExplanation={aiData?.outfitExplanation ?? ""}
      outfitItems={aiData?.outfitItems ?? []}
      freeActivities={aiData?.freeActivities ?? []}
      insiderTips={aiData?.insiderTips ?? []}
      bookableExperiences={aiData?.bookableExperiences ?? []}
      localTip={aiData?.localTip ?? ""}
      localRecommendations={(aiData?.insiderTips ?? [])
        .map((item) => item.description)
        .filter(Boolean)
        .slice(0, 3)}
      searchCity={searchCity}
      onSearchCityChange={setSearchCity}
      onSearchCitySubmit={handleSearchSubmit}
      onBackToLanding={() => router.push("/")}
      isWeatherLoading={weatherLoading}
      isAiLoading={aiLoading}
      aiError={aiError}
      selectedVibes={vibeFilters}
    />
  );
}

