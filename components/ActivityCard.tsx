import React, { useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import type { ActivityPreferenceState } from "../lib/userPrefs";

interface ActivityCardProps {
  city: string;
  title: string;
  description: string;
  whyNow: string;
  reasonLabel?: string;
  duration: string;
  priceHint?: string;
  icon?: string;
  providerLabel?: string;
  imageUrl?: string;
  reasonTags?: string[];
  showBookingCta?: boolean;
  showPriceLevel?: boolean;
  providerLinks?: {
    getYourGuide?: string;
    klook?: string;
    viator?: string;
  };
  trackingContext?: {
    section: "best_now" | "bookable";
    position: number;
    selectedVibes?: string[];
    weatherSummary?: string;
  };
  activityState?: ActivityPreferenceState | null;
  onChangeActivityState?: (next: ActivityPreferenceState | null) => void;
  showPreferenceActions?: boolean;
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors";

function getPriceLevel(priceHint?: string): "$" | "$$" | "$$$" {
  if (!priceHint) return "$";
  const hint = priceHint.toLowerCase();

  if (
    hint.includes("free") ||
    hint.includes("budget") ||
    hint.includes("low") ||
    hint.includes("cheap")
  ) {
    return "$";
  }
  if (
    hint.includes("premium") ||
    hint.includes("luxury") ||
    hint.includes("high") ||
    hint.includes("expensive")
  ) {
    return "$$$";
  }

  const match = hint.match(/(\d+(\.\d+)?)/);
  if (match) {
    const value = Number(match[1]);
    if (!Number.isNaN(value)) {
      if (value < 20) return "$";
      if (value < 60) return "$$";
      return "$$$";
    }
  }
  return "$$";
}

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

export const ActivityCard: React.FC<ActivityCardProps> = ({
  city,
  title,
  description,
  whyNow,
  reasonLabel = "Why now",
  duration,
  priceHint,
  icon = "✨",
  providerLabel = "Check availability",
  imageUrl,
  reasonTags = [],
  showBookingCta = false,
  showPriceLevel = true,
  providerLinks,
  trackingContext,
  activityState = null,
  onChangeActivityState,
  showPreferenceActions = true,
}) => {
  const mapQuery = encodeURIComponent(`${title} ${city}`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const youtubeQuery = encodeURIComponent(`${title} ${city} travel guide`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${youtubeQuery}`;
  const priceLevel = getPriceLevel(priceHint);

  useEffect(() => {
    trackEvent("card_impression", {
      city,
      title,
      section: trackingContext?.section || "best_now",
      position: trackingContext?.position ?? 0,
      vibes: trackingContext?.selectedVibes || [],
      weatherSummary: trackingContext?.weatherSummary || "",
    });
  }, [
    city,
    title,
    trackingContext?.section,
    trackingContext?.position,
    trackingContext?.selectedVibes,
    trackingContext?.weatherSummary,
  ]);

  const baseTrackingPayload = {
    city,
    title,
    section: trackingContext?.section || "best_now",
    position: trackingContext?.position ?? 0,
    vibes: trackingContext?.selectedVibes || [],
    weatherSummary: trackingContext?.weatherSummary || "",
  };
  const actionButtonBase =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors";

  return (
    <article className="flex flex-col rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-32 w-full bg-gradient-to-tr from-sky-100 via-slate-50 to-emerald-100" />
      )}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 flex-1">
          {description}
        </p>
        <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 rounded-full inline-flex px-2 py-0.5">
          {reasonLabel}: {whyNow}
        </p>
        {reasonTags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {reasonTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{duration}</span>
          {showPriceLevel ? <span title="Estimated budget level">{priceLevel}</span> : <span />}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          {showPreferenceActions ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onChangeActivityState?.(activityState === "saved" ? null : "saved")
                }
                className={`${actionButtonBase} ${
                  activityState === "saved"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeActivityState?.(
                    activityState === "dismissed" ? null : "dismissed"
                  )
                }
                className={`${actionButtonBase} ${
                  activityState === "dismissed"
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeActivityState?.(activityState === "done" ? null : "done")
                }
                className={`${actionButtonBase} ${
                  activityState === "done"
                    ? "border-sky-300 bg-sky-50 text-sky-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Done
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">
              Swipe right to save, left to skip
            </span>
          )}

          <div className="flex items-center gap-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Watch related videos on YouTube"
              title="Watch related videos on YouTube"
              className={iconButtonClass}
              onClick={() => trackEvent("youtube_click", baseTrackingPayload)}
            >
              <PlayIcon />
            </a>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open in maps"
              title="Open in maps"
              className={iconButtonClass}
              onClick={() => trackEvent("maps_click", baseTrackingPayload)}
            >
              <MapPinIcon />
            </a>
          </div>
        </div>
        {showBookingCta && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">
              {providerLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {providerLinks?.getYourGuide && (
                <a
                  href={providerLinks.getYourGuide}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    trackEvent("provider_click", {
                      ...baseTrackingPayload,
                      provider: "getyourguide",
                    })
                  }
                >
                  GetYourGuide
                </a>
              )}
              {providerLinks?.klook && (
                <a
                  href={providerLinks.klook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    trackEvent("provider_click", {
                      ...baseTrackingPayload,
                      provider: "klook",
                    })
                  }
                >
                  Klook
                </a>
              )}
              {providerLinks?.viator && (
                <a
                  href={providerLinks.viator}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    trackEvent("provider_click", {
                      ...baseTrackingPayload,
                      provider: "viator",
                    })
                  }
                >
                  Viator
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

