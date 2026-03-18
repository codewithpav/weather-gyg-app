import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import { SearchBar } from "../components/SearchBar";
import { trackEvent } from "../lib/analytics";

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
    setSelectedVibes((prev) => {
      const next = prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe];
      trackEvent("vibe_selected", {
        cityInput: city.trim(),
        vibe,
        selectedVibes: next,
      });
      return next;
    });
  };

  const handleSubmit = () => {
    if (!city.trim()) return;
    trackEvent("search_submitted", {
      source: "landing",
      city: city.trim(),
      vibes: selectedVibes,
    });
    const params = new URLSearchParams();
    params.set("city", city.trim());
    if (selectedVibes.length > 0) {
      params.set("vibes", selectedVibes.join(","));
    }
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm text-white">
                ✈️
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">GoToday</p>
                <p className="text-[11px] text-slate-500">Weather-smart travel planner</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Discover
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                How it works
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Cities
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
              >
                Plan today
              </button>
            </nav>
          </div>
        </header>

        <header className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-50 via-amber-50/60 to-white px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10">
          <div className="relative mb-5 h-40 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100">
            <div className="absolute -left-6 top-6 h-24 w-40 rotate-6 rounded-[40%] border-2 border-white/80" />
            <div className="absolute left-20 top-2 h-32 w-56 -rotate-12 rounded-[45%] border-2 border-white/70" />
            <div className="absolute right-4 top-6 h-28 w-40 rotate-12 rounded-[42%] border-2 border-white/70" />

            <svg
              viewBox="0 0 420 160"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <path
                d="M20 120 C 80 80, 120 80, 170 100 S 260 140, 330 105 S 385 70, 410 60"
                fill="none"
                stroke="rgba(15,23,42,0.25)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5 7"
              />
              <path
                d="M30 50 C 80 30, 120 45, 180 62 S 300 88, 390 42"
                fill="none"
                stroke="rgba(2,132,199,0.3)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute left-[14%] top-[62%] h-6 w-6 rounded-full border-2 border-white bg-slate-900 shadow-md" />
            <div className="absolute left-[46%] top-[48%] h-7 w-7 rounded-full border-2 border-white bg-emerald-600 shadow-md" />
            <div className="absolute right-[12%] top-[34%] h-6 w-6 rounded-full border-2 border-white bg-sky-600 shadow-md" />

            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/45 to-transparent" />
          </div>

          <span className="mb-4 inline-flex items-center rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs text-slate-500 shadow-sm">
            Weather-smart city planning
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Plan your day perfectly
            <br className="hidden sm:block" /> in any city
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
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

        <section className="mx-auto mt-6 max-w-xl">
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
            <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <Image
                src="/images/weather-aware-planning.png"
                alt="Weather-aware planning illustration"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Weather-aware planning
            </p>
            <p className="mt-1 text-xs text-slate-500">
              We look at today&apos;s forecast to suggest activities that
              actually fit the conditions.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-100 p-4 shadow-sm">
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
              Clear clothing guidance so you&apos;re never too cold, too hot, or
              caught in the rain unprepared.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-100 p-4 shadow-sm">
            <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <Image
                src="/images/book-in-couple-of-taps.png"
                alt="Book in a couple of taps illustration"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Book in a couple taps
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Browse bookable experiences from partners like GetYourGuide
              directly from your results.
            </p>
          </div>
        </section>

        <footer className="mt-14 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">GoToday</p>
              <p className="mt-2 text-xs text-slate-500">
                Open the app and instantly know what to do based on weather,
                time of day, and local context.
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

