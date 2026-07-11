import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ResultsLayout } from "../components/ResultsLayout";
import { trackEvent } from "../lib/analytics";
import { VIBES, type Vibe } from "../lib/content/types";
import {
  loadActivityPreferences,
  makeActivityPreferenceKey,
  persistActivityPreferences,
  upsertActivityPreference,
  type ActivityPreferenceState,
} from "../lib/userPrefs";
import type { TodayError, TodaySuccess } from "./api/today";

type FetchState =
  | { status: "loading" }
  | { status: "error"; error: TodayError }
  | { status: "ready"; data: TodaySuccess };

function parseVibesParam(raw: string | string[] | undefined): Vibe[] {
  const value = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  return value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v): v is Vibe => (VIBES as readonly string[]).includes(v));
}

export default function ResultsPage() {
  const router = useRouter();
  const cityParam = typeof router.query.city === "string" ? router.query.city : "";
  const selectedVibes = useMemo(
    () => parseVibesParam(router.query.vibes),
    [router.query.vibes]
  );

  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [prefs, setPrefs] = useState<Record<string, ActivityPreferenceState>>({});
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    setPrefs(loadActivityPreferences());
  }, []);

  useEffect(() => {
    if (!router.isReady || !cityParam) return;
    let cancelled = false;
    setState({ status: "loading" });

    const url = new URL("/api/today", window.location.origin);
    url.searchParams.set("city", cityParam);
    if (selectedVibes.length > 0) url.searchParams.set("vibes", selectedVibes.join(","));

    fetch(url.toString())
      .then(async (res) => {
        const payload = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", error: payload as TodayError });
          return;
        }
        const data = payload as TodaySuccess;
        if (data.match === "nearest") {
          trackEvent("nearest_city_shown", {
            requested: data.requestedCity,
            resolved: data.city.slug,
            distanceKm: data.distanceKm,
          });
        }
        setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: "error",
            error: { error: "Something went wrong — please try again." },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router.isReady, cityParam, selectedVibes]);

  const citySlug = state.status === "ready" ? state.data.city.slug : "";

  const getPreference = useCallback(
    (activityId: string) => prefs[makeActivityPreferenceKey(citySlug, activityId)],
    [prefs, citySlug]
  );

  const setPreference = useCallback(
    (activityId: string, value: ActivityPreferenceState | null) => {
      setPrefs((current) => {
        const next = upsertActivityPreference(
          current,
          makeActivityPreferenceKey(citySlug, activityId),
          value
        );
        persistActivityPreferences(next);
        return next;
      });
    },
    [citySlug]
  );

  const toggleVibe = (vibe: Vibe) => {
    const next = selectedVibes.includes(vibe)
      ? selectedVibes.filter((v) => v !== vibe)
      : [...selectedVibes, vibe];
    trackEvent("vibe_selected", { city: cityParam, vibe, selectedVibes: next });
    const params = new URLSearchParams();
    params.set("city", cityParam);
    if (next.length > 0) params.set("vibes", next.join(","));
    router.replace(`/results?${params.toString()}`, undefined, { shallow: false });
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>
          {state.status === "ready"
            ? `Today in ${state.data.city.name} — GoToday`
            : "GoToday — plan your day"}
        </title>
      </Head>
      <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#fafafa]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-slate-900">
            GoToday
          </Link>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/[0.06] transition-colors hover:ring-black/20"
          >
            New search
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {state.status === "loading" && (
          <div>
            <div className="mb-8 h-72 animate-pulse rounded-3xl bg-slate-200 sm:h-80" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
                ))}
              </div>
              <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">🧭</p>
            <h1 className="mt-3 text-lg font-semibold text-slate-900">
              {state.error.notFound ? "We couldn't find that place" : "Something went wrong"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{state.error.error}</p>
            {state.error.coveredCities && state.error.coveredCities.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {state.error.coveredCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/results?city=${encodeURIComponent(c.name)}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-400"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm text-white transition-colors hover:bg-brand-700"
            >
              Back to search
            </Link>
          </div>
        )}

        {state.status === "ready" && (
          <ResultsLayout
            data={state.data}
            selectedVibes={selectedVibes}
            onToggleVibe={toggleVibe}
            showHidden={showHidden}
            onToggleShowHidden={() => setShowHidden((v) => !v)}
            getPreference={getPreference}
            onSetPreference={setPreference}
          />
        )}
      </div>
    </div>
  );
}
