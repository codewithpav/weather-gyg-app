import React from "react";

interface NearestCityBannerProps {
  requestedCity: string;
  resolvedCity: string;
  distanceKm?: number;
}

export const NearestCityBanner: React.FC<NearestCityBannerProps> = ({
  requestedCity,
  resolvedCity,
  distanceKm,
}) => {
  const far = (distanceKm ?? 0) > 500;
  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
        far
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-sky-200 bg-sky-50 text-sky-900"
      }`}
    >
      <span className="text-lg">📍</span>
      <p>
        <span className="font-semibold">{requestedCity}</span> isn&apos;t covered yet — showing{" "}
        <span className="font-semibold">{resolvedCity}</span>, the nearest covered city
        {typeof distanceKm === "number" && <> ({distanceKm.toLocaleString()} km away)</>}.
        {far && " That's quite a distance, so conditions there may not reflect your spot."}
      </p>
    </div>
  );
};
