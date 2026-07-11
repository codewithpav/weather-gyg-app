import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import type { GetStaticProps } from "next";
import { SearchBar, type CityOption } from "../components/SearchBar";
import { VibeChips } from "../components/VibeChips";
import { trackEvent } from "../lib/analytics";
import type { Vibe } from "../lib/content/types";
import AllCitiesModal from "../components/AllCitiesModal";

interface FeaturedCity {
  slug: string;
  name: string;
  country: string;
  illustrationUrl?: string;
  heroImageUrl?: string;
  blurb?: string;
  region?: string;
}

interface LandingProps {
  cities: CityOption[];
  featured: FeaturedCity[];
}

// The covered-city index is tiny and static — embed it at build time so
// autocomplete works with zero API calls.
export const getStaticProps: GetStaticProps<LandingProps> = async () => {
  const { getCityIndex, loadCity } = await import("../lib/content/loader");
  const index = getCityIndex();
  const cities: CityOption[] = index.map(({ slug, name, country }) => ({
    slug,
    name,
    country,
    region: regionFor(country),
  }));

  const regionFor = (country: string) => {
    const europe = new Set(["Netherlands","Greece","Spain","Germany","Hungary","Italy","Portugal","United Kingdom","France","Czech Republic","Austria","Türkiye"]);
    const americas = new Set(["United States","Mexico","Brazil"]);
    const asia = new Set(["Thailand","China","Japan","South Korea","Singapore","United Arab Emirates"]);
    const oceania = new Set(["Australia"]);
    if (europe.has(country)) return "Europe";
    if (americas.has(country)) return "Americas";
    if (asia.has(country)) return "Asia";
    if (oceania.has(country)) return "Oceania";
    return "Other";
  };

  const featuredSlugs = ["paris","london","new-york","tokyo","barcelona","sydney"];
  const featured = featuredSlugs
    .map((s) => {
      const city = loadCity(s);
      if (!city) return null;
      return {
        slug: city.slug,
        name: city.name,
        country: city.country,
        illustrationUrl: city.illustrationUrl ?? null,
        heroImageUrl: city.heroImageUrl ?? null,
        blurb: city.localTips && city.localTips.length > 0 ? city.localTips[0] : null,
        region: regionFor(city.country) ?? null,
      } as FeaturedCity;
    })
    .filter(Boolean) as FeaturedCity[];

  return { props: { cities, featured } };
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

export default function LandingPage({ cities, featured }: LandingProps) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<Vibe[]>([]);
  const [allOpen, setAllOpen] = useState(false);

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
        <p className="font-display text-lg font-bold tracking-tight text-slate-900">GoToday</p>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => setAllOpen(true)}
            className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"
          >
            Browse all cities
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-2xl pb-10 pt-14 text-center sm:pt-20">
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
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
            <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">Featured cities</h2>
            <p className="text-xs text-slate-400">Quick picks curated for inspiration</p>
          </div>

          <div className="mb-4 flex gap-2">
            <button className="rounded-full border px-3 py-1 text-sm text-slate-700">Europe</button>
            <button className="rounded-full border px-3 py-1 text-sm text-slate-700">Americas</button>
            <button className="rounded-full border px-3 py-1 text-sm text-slate-700">Asia</button>
            <button className="rounded-full border px-3 py-1 text-sm text-slate-700">Oceania</button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((f) => (
              <button
                key={f.slug}
                type="button"
                onClick={() => handleSubmit(f.name)}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="h-20 w-28 flex-none overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={f.illustrationUrl || `/images/cities/${f.slug}-illust.svg`}
                      alt={f.name}
                      width={160}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">{f.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{f.country}</p>
                    <p className="mt-2 text-xs text-slate-400">{f.blurb ?? 'A short hook about the city to entice a click.'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <AllCitiesModal open={allOpen} onClose={() => setAllOpen(false)} cities={cities} onSelect={(name) => { setAllOpen(false); handleSubmit(name); }} />

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
