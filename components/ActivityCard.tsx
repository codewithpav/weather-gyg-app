import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import Image from "next/image";
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

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  citySlug,
  cityName,
  section,
  preference,
  onSetPreference,
}) => {
  const impressionSent = useRef(false);
  const [imgError, setImgError] = useState(false);
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

  const meta = [activity.neighborhood, activity.durationLabel, activity.priceHint].filter(
    Boolean
  );

  // One contextual line per card: the local secret for insider picks,
  // the weather reasoning everywhere else.
  const contextLine =
    section === "insider" && activity.insiderNote ? activity.insiderNote : activity.whyNow;

  return (
    <article
      className={`card-elevated group relative flex flex-col rounded-2xl border border-black/[0.04] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 ${
        preference === "done" ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        aria-label={preference === "saved" ? "Unsave" : "Save"}
        onClick={() => toggle("saved")}
        className={`absolute right-4 top-4 text-lg leading-none transition-transform hover:scale-110 ${
          preference === "saved" ? "text-rose-500" : "text-slate-300 hover:text-slate-400"
        }`}
      >
        {preference === "saved" ? "♥" : "♡"}
      </button>

      <h3 className="pr-8 font-display text-[15px] font-semibold tracking-tight text-slate-900">
        <span className="mr-1.5">{activity.icon}</span>
        {activity.title}
      </h3>
      {/* City illustration or activity image */}
      {(activity.imageUrl || !imgError) && (
        <div className="mt-3 mb-1.5 h-28 w-full overflow-hidden rounded-lg">
          <Image
            src={activity.imageUrl || `/images/cities/${citySlug}-illust.png`}
            alt={activity.title}
            width={600}
            height={168}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}
      {meta.length > 0 && (
        <p className="mt-1 text-xs text-slate-400">{meta.join(" · ")}</p>
      )}

      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{activity.description}</p>

      <p className="mt-2.5 border-l-2 border-slate-200 pl-2.5 text-xs leading-relaxed text-slate-500">
        {contextLine}
        {activity.caution && (
          <span className="mt-0.5 block font-medium text-amber-600">{activity.caution}</span>
        )}
      </p>

      <div className="mt-4 flex items-center gap-3 pt-1 text-xs">
        {activity.providerLinks ? (
          <>
            <a
              href={activity.providerLinks.getYourGuide}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                trackEvent("provider_click", { ...trackingPayload, provider: "getyourguide" })
              }
              className="rounded-full bg-brand-600 px-4 py-1.5 font-medium text-white shadow-sm shadow-brand-600/25 transition-colors hover:bg-brand-700"
            >
              Book experience
            </a>
            <span className="text-slate-400">
              also on{" "}
              <a
                href={activity.providerLinks.viator}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() =>
                  trackEvent("provider_click", { ...trackingPayload, provider: "viator" })
                }
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              >
                Viator
              </a>{" "}
              ·{" "}
              <a
                href={activity.providerLinks.klook}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() =>
                  trackEvent("provider_click", { ...trackingPayload, provider: "klook" })
                }
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              >
                Klook
              </a>
            </span>
          </>
        ) : (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("maps_click", trackingPayload)}
            className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-800"
          >
            View on map
          </a>
        )}

        <span className="ml-auto flex gap-3 text-slate-300">
          <button
            type="button"
            onClick={() => toggle("done")}
            className={`transition-colors hover:text-emerald-600 ${
              preference === "done" ? "text-emerald-600" : ""
            }`}
          >
            {preference === "done" ? "Done ✓" : "Done"}
          </button>
          <button
            type="button"
            onClick={() => toggle("dismissed")}
            className="transition-colors hover:text-slate-500"
          >
            Hide
          </button>
        </span>
      </div>
    </article>
  );
};
