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
    <div className="mb-5 rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-black/[0.06]">
      <span className="font-semibold text-slate-900">{requestedCity}</span> isn&apos;t covered
      yet — showing <span className="font-semibold text-slate-900">{resolvedCity}</span>, the
      nearest covered city
      {typeof distanceKm === "number" && <> ({distanceKm.toLocaleString()} km away)</>}.
      {far && (
        <span className="text-amber-700">
          {" "}
          That&apos;s a fair distance, so conditions there may differ from yours.
        </span>
      )}
    </div>
  );
};
