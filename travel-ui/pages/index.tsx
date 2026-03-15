import { useRouter } from "next/router";
import { useState } from "react";
import { SearchBar } from "../components/SearchBar";

const VIBE_OPTIONS = [
  "Chill",
  "History",
  "Walks",
  "Food",
  "Instagrammable",
  "Indoor",
  "Night",
];

export default function LandingPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleSubmit = () => {
    if (!city.trim()) return;
    const params = new URLSearchParams();
    params.set("city", city.trim());
    if (selectedVibes.length > 0) {
      params.set("vibes", selectedVibes.join(","));
    }
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-slate-50 to-slate-50">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_60%)] opacity-60 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-xs text-slate-500 shadow-sm mb-4">
            Weather-smart city planning
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
            Plan your day perfectly
            <br className="hidden sm:block" /> in any city
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-600">
            Your personal travel assistant that blends live weather data with
            smart recommendations, so you know exactly what to do, wear, and
            book.
          </p>
        </header>

        <div className="mt-8">
          <SearchBar
            value={city}
            onChange={setCity}
            onSubmit={handleSubmit}
            suggestions={["London", "Lisbon", "Tokyo", "New York"]}
          />
        </div>

        <section className="mx-auto mt-6 max-w-3xl">
          <p className="mb-2 text-center text-xs uppercase tracking-[0.18em] text-slate-400">
            Optional vibe filters
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {VIBE_OPTIONS.map((vibe) => {
              const active = selectedVibes.includes(vibe);
              return (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => toggleVibe(vibe)}
                  className={`rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white/80 text-slate-700 hover:bg-white"
                  }`}
                >
                  {vibe}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-100 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">
              Weather-aware planning
            </p>
            <p className="mt-1 text-xs text-slate-500">
              We look at today&apos;s forecast to suggest activities that
              actually fit the conditions.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-100 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">What to wear</p>
            <p className="mt-1 text-xs text-slate-500">
              Clear clothing guidance so you&apos;re never too cold, too hot, or
              caught in the rain unprepared.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-100 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">
              Book in a couple taps
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Browse bookable experiences from partners like GetYourGuide
              directly from your results.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

