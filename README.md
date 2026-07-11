# GoToday — weather-smart day plans

Search a city, get an instant day plan matched to the live weather and local
time of day: free activities, insider picks, bookable experiences (affiliate
links), and what to wear.

## How it works — zero AI cost at runtime

There are **no AI/LLM API calls anywhere in this app**. All recommendation
content is precomputed and committed as JSON under [`content/cities/`](content/cities/):
one file per city containing 30+ activities tagged with weather, temperature,
time-of-day, and vibe suitability. At runtime:

1. `GET /api/today?city=<query>&vibes=a,b` resolves the query against the city
   index (exact/alias match, else OpenWeather geocoding + haversine to the
   **nearest covered city**).
2. One OpenWeatherMap call fetches current conditions for the covered city's
   coordinates — the app's only external API.
3. Pure functions bucket the weather ([`lib/weatherBuckets.ts`](lib/weatherBuckets.ts)),
   build outfit advice ([`lib/outfit.ts`](lib/outfit.ts)), and select/rank
   activities from the city's pool ([`lib/recommend.ts`](lib/recommend.ts)) —
   deterministic, with a daily-seeded shuffle so picks refresh each day.

## Setup

```bash
cp .env.example .env.local   # add your OpenWeatherMap key
npm install
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Standard Next.js |
| `npm test` | Unit tests for the selection, outfit, and weather-bucket logic |
| `npm run content:validate` | Schema + coverage checks over `content/cities/*.json` |

## Adding a city

1. Create `content/cities/<slug>.json` following the shape in
   [`lib/content/types.ts`](lib/content/types.ts) (30+ activities: ≥12 free,
   ≥7 insider, ≥9 bookable, with rain/night coverage).
2. Add the city to `content/cities/index.json` (slug, name, country, lat/lon, aliases).
3. Run `npm run content:validate` — it enforces the coverage matrix
   (each condition × time-of-day needs ≥4 eligible activities).
