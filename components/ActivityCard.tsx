import React, { useEffect, useRef } from "react";
import { trackEvent } from "../lib/analytics";
import type { ActivityPreferenceState } from "../lib/userPrefs";
import type { TodayActivity } from "../pages/api/today";

interface ActivityCardProps {
  activity: TodayActivity;
  citySlug: string;
  cityName: string;
  section: "free" | "insider" | "bookable";
  preference?: ActivityPreferenceState;
  onSetPreference: (activityId: string, state: ActivityPreferenceState | null) => void;
}

const SECTION_ACCENT: Record<ActivityCardProps["section"], string> = {
  free: "bg-emerald-50 text-emerald-700 border-emerald-200",
  insider: "bg-violet-50 text-violet-700 border-violet-200",
  bookable: "bg-amber-50 text-amber-700 border-amber-200",
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  citySlug,
  cityName,
  section,
  preference,
  onSetPreference,
}) => {
  const impressionSent = useRef(false);
  useEffect(() => {
    if (impressionSent.current) return;
    impressionSent.current = true;
    trackEvent("card_impression", {
      city: citySlug,
      section,
      activityId: activity.id,
      title: activity.title,
    });
  }, [activity.id, activity.title, citySlug, section]);

  const trackingPayload = {
    city: citySlug,
    section,
    activityId: activity.id,
    title: activity.title,
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${activity.title} ${cityName}`
  )}`;

  const toggle = (state: ActivityPreferenceState) => {
    const next = preference === state ? null : state;
    onSetPreference(activity.id, next);
    if (next === "saved") trackEvent("save_click", trackingPayload);
    if (next === "dismissed") trackEvent("dismiss_click", trackingPayload);
    if (next === "done") trackEvent("done_click", trackingPayload);
  };

  const dimmed = preference === "done";

  return (
    <article
      className={`group flex flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${
        dimmed ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-xl">
            {activity.icon}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
              {activity.title}
              {preference === "done" && <span className="ml-2">✅</span>}
            </h3>
            {activity.neighborhood && (
              <p className="text-xs text-slate-400">{activity.neighborhood}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            title={preference === "saved" ? "Unsave" : "Save"}
            onClick={() => toggle("saved")}
            className={`rounded-full p-1.5 text-sm transition-colors ${
              preference === "saved"
                ? "bg-rose-100 text-rose-600"
                : "text-slate-300 hover:bg-slate-50 hover:text-rose-400"
            }`}
          >
            {preference === "saved" ? "♥" : "♡"}
          </button>
          <button
            type="button"
            title="Done it"
            onClick={() => toggle("done")}
            className={`rounded-full p-1.5 text-sm transition-colors ${
              preference === "done"
                ? "bg-emerald-100 text-emerald-600"
                : "text-slate-300 hover:bg-slate-50 hover:text-emerald-500"
            }`}
          >
            ✓
          </button>
          <button
            type="button"
            title="Not for me"
            onClick={() => toggle("dismissed")}
            className="rounded-full p-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500"
          >
            ✕
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">{activity.description}</p>

      {activity.insiderNote && (
        <p className="mt-2 rounded-2xl bg-violet-50/70 px-3 py-2 text-xs text-violet-800">
          <span className="font-semibold">Local tip:</span> {activity.insiderNote}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-400">{activity.whyNow}</p>

      {activity.caution && (
        <p className="mt-1 text-xs font-medium text-amber-600">⚠️ {activity.caution}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {activity.reasonTags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full border px-2 py-0.5 text-[11px] ${SECTION_ACCENT[section]}`}
          >
            {tag}
          </span>
        ))}
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
          ⏱ {activity.durationLabel}
        </span>
        {activity.priceHint && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
            {activity.priceHint}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("maps_click", trackingPayload)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
        >
          📍 Map
        </a>
        {activity.providerLinks && (
          <>
            <a
              href={activity.providerLinks.getYourGuide}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                trackEvent("provider_click", { ...trackingPayload, provider: "getyourguide" })
              }
              className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-700"
            >
              Book on GetYourGuide
            </a>
            <a
              href={activity.providerLinks.viator}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                trackEvent("provider_click", { ...trackingPayload, provider: "viator" })
              }
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
            >
              Viator
            </a>
            <a
              href={activity.providerLinks.klook}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                trackEvent("provider_click", { ...trackingPayload, provider: "klook" })
              }
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50"
            >
              Klook
            </a>
          </>
        )}
      </div>
    </article>
  );
};
