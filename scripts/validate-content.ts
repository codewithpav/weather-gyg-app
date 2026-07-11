// Validates the authored city content dataset: schema (zod) + coverage matrix.
// Usage: npm run content:validate
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  TEMP_BANDS,
  CONDITIONS,
  TIMES_OF_DAY,
  VIBES,
  SETTINGS,
  CATEGORIES,
  PRICE_TIERS,
  type CityContent,
  type Condition,
  type TimeOfDay,
} from "../lib/content/types";

const CONTENT_DIR = path.join(__dirname, "..", "content", "cities");

const activitySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  category: z.enum(CATEGORIES),
  description: z.string().min(20),
  insiderNote: z.string().optional(),
  setting: z.enum(SETTINGS),
  suitability: z.object({
    temps: z.array(z.enum(TEMP_BANDS)).min(1),
    conditions: z.array(z.enum(CONDITIONS)).min(1),
    times: z.array(z.enum(TIMES_OF_DAY)).min(1),
  }),
  vibes: z.array(z.enum(VIBES)).min(1),
  durationMinutes: z.tuple([z.number().positive(), z.number().positive()]),
  priceTier: z.enum(PRICE_TIERS),
  priceHint: z.string().optional(),
  months: z.array(z.number().min(1).max(12)).optional(),
  neighborhood: z.string().optional(),
  icon: z.string().min(1),
  imageUrl: z.string().url().optional(),
  bookingQuery: z.string().optional(),
});

const citySchema = z.object({
  schemaVersion: z.literal(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  country: z.string(),
  countryCode: z.string().length(2),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  heroImageUrl: z.string().url().optional(),
  illustrationUrl: z.string().url().optional(),
  localTips: z.array(z.string().min(10)).min(3).max(6),
  activities: z.array(activitySchema).min(28),
});

const indexSchema = z.array(
  z.object({
    slug: z.string(),
    name: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    aliases: z.array(z.string()),
  })
);

// Every plausible (condition, time) pair must have enough eligible activities
// so the runtime selector never runs dry. Snow is exempt for cities where it
// is implausible; rain/clear/clouds apply everywhere.
const REQUIRED_CONDITIONS: Condition[] = ["clear", "clouds", "rain"];
const MIN_PER_BUCKET = 4;
const MIN_PER_CATEGORY = { free: 12, insider: 7, bookable: 9 } as const;

function checkCity(fileName: string, raw: unknown): string[] {
  const errors: string[] = [];
  const parsed = citySchema.safeParse(raw);
  if (!parsed.success) {
    return parsed.error.issues.map(
      (i) => `${fileName}: ${i.path.join(".")} — ${i.message}`
    );
  }
  const city = parsed.data as CityContent;

  if (city.slug !== fileName.replace(/\.json$/, "")) {
    errors.push(`${fileName}: slug "${city.slug}" does not match file name`);
  }

  const ids = new Set<string>();
  for (const a of city.activities) {
    if (ids.has(a.id)) errors.push(`${fileName}: duplicate activity id "${a.id}"`);
    ids.add(a.id);
    if (a.category === "bookable" && !a.bookingQuery) {
      errors.push(`${fileName}: bookable "${a.id}" is missing bookingQuery`);
    }
    if (a.durationMinutes[0] > a.durationMinutes[1]) {
      errors.push(`${fileName}: "${a.id}" durationMinutes min > max`);
    }
  }

  for (const [category, min] of Object.entries(MIN_PER_CATEGORY)) {
    const count = city.activities.filter((a) => a.category === category).length;
    if (count < min) {
      errors.push(`${fileName}: only ${count} ${category} activities (need >= ${min})`);
    }
  }

  for (const condition of REQUIRED_CONDITIONS) {
    for (const time of TIMES_OF_DAY) {
      const eligible = city.activities.filter(
        (a) =>
          a.suitability.conditions.includes(condition) &&
          a.suitability.times.includes(time as TimeOfDay) &&
          !a.months // seasonal items don't count toward year-round coverage
      ).length;
      if (eligible < MIN_PER_BUCKET) {
        errors.push(
          `${fileName}: coverage gap — only ${eligible} activities for ${condition}/${time} (need >= ${MIN_PER_BUCKET})`
        );
      }
    }
  }

  return errors;
}

function main() {
  // Merge any index.json and index.*.part.json files to form the complete index
  const indexFiles = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => /^index(\..+)?\.json$/.test(f));

  if (indexFiles.length === 0) {
    console.error("content/cities/index.json not found");
    process.exit(1);
  }

  const mergedIndexEntries: any[] = [];
  const seenIndex = new Set<string>();
  for (const idxFile of indexFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, idxFile), "utf8"));
    if (!Array.isArray(raw)) continue;
    for (const e of raw) {
      if (!seenIndex.has(e.slug)) {
        mergedIndexEntries.push(e);
        seenIndex.add(e.slug);
      }
    }
  }

  const index = indexSchema.parse(mergedIndexEntries);

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json") && !/^index(\..+)?\.json$/.test(f));

  const allErrors: string[] = [];
  const indexSlugs = new Set(index.map((e) => e.slug));
  const fileSlugs = new Set(files.map((f) => f.replace(/\.json$/, "")));

  for (const slug of Array.from(indexSlugs)) {
    if (!fileSlugs.has(slug)) allErrors.push(`index.json lists "${slug}" but no city file exists`);
  }
  for (const slug of Array.from(fileSlugs)) {
    if (!indexSlugs.has(slug)) allErrors.push(`city file "${slug}.json" is missing from index.json`);
  }

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
    allErrors.push(...checkCity(file, raw));
    // Additional image existence checks: either a remote URL is provided
    // via heroImageUrl/illustrationUrl, or a local fallback file must exist
    // under public/images/cities/.
    try {
      const parsed = citySchema.parse(raw) as CityContent;
      const publicDir = path.join(process.cwd(), "public", "images", "cities");
      const exts = ["jpg", "jpeg", "png", "webp", "avif", "svg"];

      const heroLocalExists = exts.some((ext) =>
        fs.existsSync(path.join(publicDir, `${parsed.slug}-hero.${ext}`))
      );
      if (!parsed.heroImageUrl && !heroLocalExists) {
        allErrors.push(
          `${file}: missing hero image — provide heroImageUrl or add public/images/cities/${parsed.slug}-hero.jpg`
        );
      }

      const illustLocalExists = exts.some((ext) =>
        fs.existsSync(path.join(publicDir, `${parsed.slug}-illust.${ext}`)) ||
        fs.existsSync(path.join(publicDir, `${parsed.slug}-illustration.${ext}`))
      );
      if (!parsed.illustrationUrl && !illustLocalExists) {
        allErrors.push(
          `${file}: missing illustration — provide illustrationUrl or add public/images/cities/${parsed.slug}-illust.png`
        );
      }
    } catch (e) {
      // ignore — parsing errors already reported above
    }
  }

  if (allErrors.length > 0) {
    console.error(`FAILED — ${allErrors.length} issue(s):\n`);
    for (const e of allErrors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`OK — ${files.length} cities validated, coverage complete.`);
}

main();
