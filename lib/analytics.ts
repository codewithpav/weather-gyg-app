export type AnalyticsEventName =
  | "search_submitted"
  | "vibe_selected"
  | "card_impression"
  | "maps_click"
  | "youtube_click"
  | "provider_click"
  | "save_click"
  | "dismiss_click"
  | "done_click";

export type AnalyticsPayload = Record<string, unknown>;

type AnalyticsEvent = {
  name: AnalyticsEventName;
  payload: AnalyticsPayload;
  timestamp: string;
  path?: string;
};

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const event: AnalyticsEvent = {
    name,
    payload,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  if (process.env.NODE_ENV !== "production") {
    // Keep local debugging simple while a real analytics sink is not yet connected.
    // eslint-disable-next-line no-console
    console.info("[analytics]", event);
  }

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // Never break UX if telemetry fails.
  });
}
