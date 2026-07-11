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
  imageUrl,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="mb-8 h-64 animate-pulse rounded-3xl bg-slate-900/90" />;
  }

  const localTime = `${String(localHour).padStart(2, "0")}:00`;
  const metaParts = [
    description,
    `feels like ${Math.round(feelsLike)}°`,
    `${humidity}% humidity`,
  ];
  if (windSpeed > 8) metaParts.push(`windy ${Math.round(windSpeed)} m/s`);

  return (
    <section className="card-elevated relative mb-8 overflow-hidden rounded-3xl">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${city} skyline`}
            className="h-64 w-full object-cover sm:h-72"
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
          className={`h-64 w-full bg-gradient-to-br sm:h-72 ${heroGradient(condition, timeOfDay)}`}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

      <div className="absolute right-6 top-5 text-right text-white sm:right-8 sm:top-6">
        <p className="text-5xl font-extralight tracking-tighter sm:text-6xl">
          {Math.round(temperature)}°
        </p>
        <p className="mt-0.5 text-xs font-medium text-white/70">{localTime} local</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
        <p className="text-[13px] font-medium text-white/70">{country}</p>
        <h1 className="mt-0.5 text-4xl font-semibold tracking-tight sm:text-5xl">{city}</h1>
        <p className="mt-2 text-sm capitalize text-white/85">{metaParts.join(" · ")}</p>
      </div>
    </section>
  );
};
