import React, { useState } from "react";
import Image from "next/image";

interface CityHeroProps {
  city: string;
  country: string;
  description: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  timeOfDay: string;
  localHour: number;
  fetchedAt?: string;
  imageUrl?: string;
  citySlug?: string;
  isLoading?: boolean;
}

// Weather- and time-driven gradients: the hero always reflects conditions,
// with no dependency on fetched imagery.
function heroGradient(condition: string, timeOfDay: string): string {
  const night = timeOfDay === "night";
  const evening = timeOfDay === "evening";
  switch (condition) {
    case "clear":
      if (night) return "from-indigo-950 via-slate-900 to-blue-950";
      if (evening) return "from-orange-400 via-rose-500 to-indigo-800";
      return "from-sky-400 via-blue-500 to-indigo-600";
    case "rain":
      return night
        ? "from-slate-950 via-slate-900 to-indigo-950"
        : "from-slate-500 via-slate-600 to-slate-800";
    case "snow":
      return night
        ? "from-slate-800 via-slate-700 to-indigo-900"
        : "from-slate-300 via-slate-400 to-slate-600";
    default: // clouds
      if (night) return "from-slate-900 via-slate-800 to-slate-950";
      if (evening) return "from-slate-500 via-slate-600 to-indigo-800";
      return "from-slate-400 via-slate-500 to-slate-700";
  }
}

// Simple, self-contained line-art weather glyphs so the hero communicates the
// condition visually without depending on a remote icon service.
const WeatherGlyph: React.FC<{ condition: string; timeOfDay: string; className?: string }> = ({
  condition,
  timeOfDay,
  className,
}) => {
  const night = timeOfDay === "night";
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (condition === "clear" && night) {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" />
      </svg>
    );
  }
  if (condition === "clear") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
      </svg>
    );
  }
  if (condition === "rain") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M7 16.5a4.5 4.5 0 0 1 .3-8.99A6 6 0 0 1 19 8.5a3.75 3.75 0 0 1-.2 7.98" />
        <path d="M8 19.5l-1 2M12.5 19.5l-1 2M17 19.5l-1 2" />
      </svg>
    );
  }
  if (condition === "snow") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M7 15.5a4.5 4.5 0 0 1 .3-8.99A6 6 0 0 1 19 7.5a3.75 3.75 0 0 1-.2 7.98" />
        <path d="M9 19h.01M12 20.5h.01M15 19h.01" />
      </svg>
    );
  }
  // clouds
  return (
    <svg {...common} aria-hidden="true">
      <path d="M7 18a4.5 4.5 0 0 1 .3-8.99A6 6 0 0 1 19 10a3.75 3.75 0 0 1-.2 7.98H7z" />
    </svg>
  );
};

function freshnessLabel(fetchedAt?: string): string {
  if (!fetchedAt) return "Live weather";
  const ageMs = Date.now() - new Date(fetchedAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return "Live weather";
  const mins = Math.floor(ageMs / 60000);
  if (mins < 1) return "Updated just now";
  if (mins === 1) return "Updated 1 min ago";
  if (mins < 60) return `Updated ${mins} min ago`;
  return "Updated recently";
}

export const CityHero: React.FC<CityHeroProps> = ({
  city,
  country,
  description,
  temperature,
  feelsLike,
  humidity,
  windSpeed,
  condition,
  timeOfDay,
  localHour,
  fetchedAt,
  imageUrl,
  citySlug,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="mb-8 h-64 animate-pulse rounded-3xl bg-slate-200 sm:h-72" />;
  }

  const localTime = `${String(localHour).padStart(2, "0")}:00`;

  const stats = [
    { label: "Feels like", value: `${Math.round(feelsLike)}°` },
    { label: "Humidity", value: `${humidity}%` },
    { label: "Wind", value: `${Math.round(windSpeed)} m/s` },
  ];

  const [imgError, setImgError] = useState(false);

  const derivedImage = imageUrl || (citySlug ? `/images/cities/${citySlug}-hero.jpg` : undefined);

  return (
    <section className="card-elevated relative mb-8 overflow-hidden rounded-3xl">
      {derivedImage && !imgError ? (
        <>
          <Image
            src={derivedImage}
            alt={`${city} skyline`}
            width={1600}
            height={720}
            className="h-72 w-full object-cover sm:h-80"
            onError={() => setImgError(true)}
          />
          <div
            className={`absolute inset-0 -z-10 bg-gradient-to-br ${heroGradient(condition, timeOfDay)}`}
          />
        </>
      ) : (
        <div
          className={`h-72 w-full bg-gradient-to-br sm:h-80 ${heroGradient(condition, timeOfDay)}`}
        />
      )}

      {/* Legibility wash + a large condition glyph filling the panel's centre. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/10" />
      <WeatherGlyph
        condition={condition}
        timeOfDay={timeOfDay}
        className="pointer-events-none absolute right-6 top-1/2 h-56 w-56 -translate-y-1/2 text-white/10 sm:right-16"
      />

      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-8">
        {/* Top row: live badge + current temperature. */}
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {freshnessLabel(fetchedAt)}
          </span>

          <div className="flex items-center gap-2 text-right">
            <WeatherGlyph
              condition={condition}
              timeOfDay={timeOfDay}
              className="h-9 w-9 text-white/90 sm:h-10 sm:w-10"
            />
            <div>
              <p className="font-display text-5xl font-light leading-none tracking-tighter tabular-nums sm:text-6xl">
                {Math.round(temperature)}°
              </p>
              <p className="mt-1 text-xs font-medium text-white/70 tabular-nums">{localTime} local</p>
            </div>
          </div>
        </div>

        {/* Bottom block: place + grouped weather readout. */}
        <div>
          <p className="text-[13px] font-medium uppercase tracking-wide text-white/70">{country}</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {city}
          </h1>
          <p className="mt-1.5 text-sm capitalize text-white/85">{description}</p>

          <dl className="mt-4 flex flex-wrap gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/12 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/15"
              >
                <dt className="text-[10px] font-medium uppercase tracking-wide text-white/60">
                  {stat.label}
                </dt>
                <dd className="text-sm font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
