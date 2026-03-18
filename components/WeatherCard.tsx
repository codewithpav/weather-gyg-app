import React from "react";

interface WeatherCardProps {
  city: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  iconUrl?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  temperature,
  feelsLike,
  description,
  humidity,
  iconUrl,
}) => {
  const desc = description.toLowerCase();
  const isRain = desc.includes("rain") || desc.includes("drizzle");
  const isCloudy = desc.includes("cloud") || desc.includes("mist") || desc.includes("fog");
  const isClear = desc.includes("clear") || desc.includes("sun");

  const bgClass = isRain
    ? "from-slate-800 via-slate-900 to-slate-950"
    : isCloudy
    ? "from-slate-700 via-slate-800 to-slate-900"
    : isClear
    ? "from-sky-500 via-indigo-600 to-slate-900"
    : "from-slate-900 via-slate-900 to-slate-950";

  const vibe = isRain
    ? "Rain-ready city day"
    : isCloudy
    ? "Soft, moody city weather"
    : isClear
    ? "Perfect sky for exploring"
    : "City weather right now";

  return (
    <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgClass} text-white shadow-xl p-5 sm:p-6`}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/35 blur-3xl" />
      <div className="absolute -left-6 -bottom-10 h-32 w-32 rounded-full bg-violet-400/30 blur-3xl" />
      <div className="absolute right-8 top-8 text-white/15 text-6xl select-none">☁︎</div>
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Today in
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-semibold">{city}</h2>
          <p className="mt-2 text-sm text-white/80 capitalize">
            {description}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            {vibe}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-4xl sm:text-5xl font-semibold tracking-tight">
              {Math.round(temperature)}°
            </span>
            {iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt={description}
                className="h-12 w-12 sm:h-14 sm:w-14"
              />
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/85">
              Feels like {Math.round(feelsLike)}°
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/85">
              Humidity {humidity}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

