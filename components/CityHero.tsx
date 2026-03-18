import React from "react";

interface CityHeroProps {
  city: string;
  description: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  iconUrl?: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export const CityHero: React.FC<CityHeroProps> = ({
  city,
  description,
  temperature,
  feelsLike,
  humidity,
  iconUrl,
  imageUrl,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="mb-6 h-56 animate-pulse rounded-3xl bg-slate-900/90" />;
  }

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl shadow-xl">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${city} skyline`}
          className="h-56 w-full object-cover sm:h-64"
        />
      ) : (
        <div className="h-56 w-full bg-gradient-to-br from-sky-500 via-indigo-600 to-slate-900 sm:h-64" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-black/15" />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          Today in
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          {city}
        </h1>
        <p className="mt-1 text-sm text-white/95 capitalize [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          {description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm">
            {iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconUrl} alt={description} className="h-4 w-4" />
            )}
            {Math.round(temperature)}°C
          </span>
          <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm">
            Feels like {Math.round(feelsLike)}°C
          </span>
          <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm">
            Humidity {humidity}%
          </span>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
          <span>Live conditions</span>
          <span>•</span>
          <span>Updated now</span>
        </div>
      </div>
    </section>
  );
};

