import React from "react";

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
  iconUrl?: string;
  imageUrl?: string;
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

const CONDITION_EMOJI: Record<string, string> = {
  clear: "☀️",
  clouds: "☁️",
  rain: "🌧️",
  snow: "❄️",
};

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
  iconUrl,
  imageUrl,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="mb-6 h-60 animate-pulse rounded-3xl bg-slate-900/90" />;
  }

  const localTime = `${String(localHour).padStart(2, "0")}:00`;

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl shadow-xl">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${city} skyline`}
            className="h-60 w-full object-cover sm:h-72"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            className={`absolute inset-0 -z-10 bg-gradient-to-br ${heroGradient(condition, timeOfDay)}`}
          />
        </>
      ) : (
        <div
          className={`h-60 w-full bg-gradient-to-br sm:h-72 ${heroGradient(condition, timeOfDay)}`}
        >
          <span className="absolute right-6 top-5 select-none text-7xl opacity-25 sm:text-8xl">
            {CONDITION_EMOJI[condition] ?? "🌤️"}
          </span>
          <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-16 bottom-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/80">
          Right now in
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
          <h1 className="text-3xl font-semibold sm:text-4xl [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
            {city}
          </h1>
          <span className="text-sm text-white/70">{country}</span>
        </div>
        <p className="mt-1 text-sm capitalize text-white/90">
          {description} · local time {localTime}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            {iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconUrl} alt={description} className="h-4 w-4" />
            )}
            {Math.round(temperature)}°C
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            Feels like {Math.round(feelsLike)}°
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            Humidity {humidity}%
          </span>
          {windSpeed > 8 && (
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              Windy {Math.round(windSpeed)} m/s
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
