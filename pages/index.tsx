import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
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

// Deterministic soft gradient per city so the grid feels designed, not random.
const TILE_GRADIENTS = [
  "from-sky-500 to-indigo-600",
  "from-amber-400 to-rose-500",
  "from-emerald-500 to-teal-700",
  "from-violet-500 to-indigo-700",
  "from-rose-400 to-fuchsia-600",
  "from-cyan-500 to-blue-700",
  "from-orange-400 to-red-600",
  "from-slate-600 to-slate-900",
];

function tileGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  return TILE_GRADIENTS[Math.abs(hash) % TILE_GRADIENTS.length];
}

const VALUE_PROPS = [
  {
    title: "Reads the sky",
    body: "Live weather and local time decide what makes the list — rain moves you under cover, sunshine sends you out.",
  },
  {
    title: "Knows the city",
    body: "Real places with the local angle — not a generic top-10. Free finds, insider spots, and experiences worth paying for.",
  },
  {
    title: "Instant, always",
    body: "No signup, no loading spinner theatre. Search, get your day, go.",
  },
];

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
    <div className="min-h-screen">
      <Head>
        <title>GoToday — weather-smart day plans for any city</title>
        <meta
          name="description"
          content="Search a city and instantly get a day plan matched to the live weather: what to do, what to wear, and what's worth booking."
        />
      </Head>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-lg font-bold tracking-tight text-slate-900">GoToday</p>
        <p className="text-xs text-slate-400">
          {cities.length} cities · no signup · instant
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-2xl pb-10 pt-14 text-center sm:pt-20">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Plan your day perfectly,
            <br />
            in any city
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-500">
            Live weather in, a smart day out — what to do, what to wear, and
            what&apos;s worth booking.
          </p>

          <div className="mt-9">
            <SearchBar value={city} onChange={setCity} onSubmit={handleSubmit} cities={cities} />
          </div>

          <div className="mt-6">
            <VibeChips selected={selectedVibes} onToggle={toggleVibe} size="sm" />
          </div>
        </section>

        <section className="py-12">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Where today?</h2>
            <p className="text-xs text-slate-400">
              Somewhere else? We&apos;ll route you to the nearest covered city.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cities.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => handleSubmit(c.name)}
                className={`card-elevated group relative h-28 overflow-hidden rounded-2xl bg-gradient-to-br text-left transition-transform duration-200 hover:-translate-y-0.5 ${tileGradient(
                  c.slug
                )}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-colors group-hover:from-black/50" />
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-[11px] text-white/70">{c.country}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-slate-200/70 py-14 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title}>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                {prop.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{prop.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-slate-400 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} GoToday</p>
          <p>Built for better day-of travel decisions</p>
        </div>
      </footer>
    </div>
  );
}
