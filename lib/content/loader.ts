// Server-only access to the committed content dataset. City JSONs are read
// from disk and cached in memory — they must never be imported into client code.
import fs from "node:fs";
import path from "node:path";
import type { CityContent, CityIndexEntry } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "cities");

let indexCache: CityIndexEntry[] | null = null;
const cityCache = new Map<string, CityContent>();

export function getCityIndex(): CityIndexEntry[] {
  if (!indexCache) {
    const files = fs
      .readdirSync(CONTENT_DIR)
      .filter((f) => /^index(\..+)?\.json$/.test(f));

    const entries: CityIndexEntry[] = [];
    const seen = new Set<string>();

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
        const arr = JSON.parse(raw) as CityIndexEntry[];
        for (const e of arr) {
          if (!seen.has(e.slug)) {
            entries.push(e);
            seen.add(e.slug);
          }
        }
      } catch (err) {
        // ignore malformed index parts
      }
    }

    indexCache = entries;
  }

  return indexCache;
}

export function loadCity(slug: string): CityContent | null {
  const cached = cityCache.get(slug);
  if (cached) return cached;
  const filePath = path.join(CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const city = JSON.parse(fs.readFileSync(filePath, "utf8")) as CityContent;
  cityCache.set(slug, city);
  return city;
}
