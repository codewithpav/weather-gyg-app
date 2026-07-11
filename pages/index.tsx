import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import type { GetStaticProps } from "next";
import { SearchBar, type CityOption } from "../components/SearchBar";
import { VibeChips } from "../components/VibeChips";
import { trackEvent } from "../lib/analytics";
import type { Vibe } from "../lib/content/types";

interface LandingProps {
  cities: CityOption[];
}

// The covered-city index is tiny and static — embed it at build time so
// autocomplete works with zero API calls.
export const getStaticProps: GetStaticProps<LandingProps> = async () => {
  const { getCityIndex } = await import("../lib/content/loader");
  const cities = getCityIndex().map(({ slug, name, country }) => ({ slug, name, country }));
  return { props: { cities } };
};

export default function LandingPage({ cities }: LandingProps) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<Vibe[]>([]);

  const toggleVibe = (vibe: Vibe) => {
    setSelectedVibes((prev) => {
      const next = prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe];
      trackEvent("vibe_selected", { cityInput: city.trim(), vibe, selectedVibes: next });
      return next;
    });
  };

  const handleSubmit = (submitted?: string) => {
    const query = (submitted ?? city).trim();
    if (!query) return;
    trackEvent("search_submitted", { source: "landing", city: query, vibes: selectedVibes });
    const params = new URLSearchParams();
    params.set("city", query);
    if (selectedVibes.length > 0) params.set("vibes", selectedVibes.join(","));
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>GoToday — weather-smart day plans for any city</title>
        <meta
          name="description"
          content="Search a city and instantly get a day plan matched to the live weather: what to do, what to wear, and what's worth booking."
        />
      </Head>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm text-white">
              ✈️
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">GoToday</p>
              <p className="text-[11px] text-slate-500">Weather-smart travel planner</p>
            </div>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">
            {cities.length} cities covered · no signup · instant
          </p>
        </header>

        <section className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-50 via-amber-50/60 to-white px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10">
          <span className="mb-4 inline-flex items-center rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs text-slate-500 shadow-sm">
            Live weather in · smart plans out
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Plan your day perfectly
            <br className="hidden sm:block" /> in any city
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
            Search a city and get an instant plan matched to right-now weather and
            time of day — what to do, what to wear, and what&apos;s worth booking.
          </p>
        </section>

        <div className="mt-8">
          <SearchBar
            value={city}
            onChange={setCity}
            onSubmit={handleSubmit}
            cities={cities}
          />
          <div className="mx-auto mt-3 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs text-slate-500 sm:text-sm">
            <span className="text-slate-400">Try:</span>
            {cities.slice(0, 5).map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => handleSubmit(c.name)}
                className="rounded-full border border-slate-200 bg-white/60 px-3 py-1 transition-colors hover:border-slate-400 hover:bg-white"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <section className="mx-auto mt-6 max-w-xl">
          <p className="mb-2 text-center text-xs uppercase tracking-[0.18em] text-slate-400">
            Optional vibe filters
          </p>
          <VibeChips selected={selectedVibes} onToggle={toggleVibe} />
        </section>

        <section className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <Image
                src="/images/weather-aware-planning.png"
                alt="Weather-aware planning illustration"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <p className="text-sm font-medium text-slate-900">Weather-aware planning</p>
            <p className="mt-1 text-xs text-slate-500">
              Rain sends you somewhere covered, sunshine sends you outside — picks
              adapt to live conditions and local time of day.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <Image
                src="/images/what-to-wear.png"
                alt="What to wear illustration"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <p className="text-sm font-medium text-slate-900">What to wear</p>
            <p className="mt-1 text-xs text-slate-500">
              Clear clothing guidance so you&apos;re never too cold, too hot, or caught
              in the rain unprepared.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <Image
                src="/images/book-in-couple-of-taps.png"
                alt="Book in a couple of taps illustration"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <p className="text-sm font-medium text-slate-900">Book in a couple taps</p>
            <p className="mt-1 text-xs text-slate-500">
              Browse bookable experiences from partners like GetYourGuide directly
              from your results.
            </p>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Covered cities</h2>
            <p className="text-xs text-slate-400">
              Searching somewhere else? We&apos;ll route you to the nearest covered city.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cities.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => handleSubmit(c.name)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-slate-400 hover:bg-white"
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-14 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">GoToday</p>
              <p className="mt-2 text-xs text-slate-500">
                Open the app and instantly know what to do based on weather, time of
                day, and local context.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Product</p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>Features</p>
                <p>City guides</p>
                <p>Affiliate partners</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Company</p>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>About</p>
                <p>Contact</p>
                <p>Privacy</p>
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-3 text-xs text-slate-500">
            © {new Date().getFullYear()} GoToday. Built for better day-of travel decisions.
          </div>
        </footer>
      </div>
    </div>
  );
}
