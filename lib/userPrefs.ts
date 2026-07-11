export type ActivityPreferenceState = "saved" | "dismissed" | "done";

// v2: keys are `${citySlug}::${activityId}` — stable ids from the content
// dataset. v1 title-based keys are simply orphaned.
const ACTIVITY_PREFS_KEY = "gotoday.activity-preferences.v2";

type ActivityPreferencesMap = Record<string, ActivityPreferenceState>;

export function makeActivityPreferenceKey(citySlug: string, activityId: string): string {
  return `${citySlug}::${activityId}`;
}

export function loadActivityPreferences(): ActivityPreferencesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACTIVITY_PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const allowed: ActivityPreferenceState[] = ["saved", "dismissed", "done"];
    const cleaned: ActivityPreferencesMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && allowed.includes(value as ActivityPreferenceState)) {
        cleaned[key] = value as ActivityPreferenceState;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function persistActivityPreferences(map: ActivityPreferencesMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVITY_PREFS_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures and keep UX responsive.
  }
}

export function upsertActivityPreference(
  map: ActivityPreferencesMap,
  key: string,
  state: ActivityPreferenceState | null
): ActivityPreferencesMap {
  const next = { ...map };
  if (state === null) {
    delete next[key];
    return next;
  }
  next[key] = state;
  return next;
}
