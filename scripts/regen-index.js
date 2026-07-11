// Regenerate content/cities/index.json by scanning all city JSON files
import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content", "cities");
const INDEX_PATH = path.join(CONTENT_DIR, "index.json");

function slugFromFile(file) {
  return file.replace(/\.json$/, "");
}

function makeAliases(slug, name) {
  const al = [slug, name.toLowerCase()];
  return Array.from(new Set(al)).slice(0, 5);
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error("content/cities not found");
    process.exit(1);
  }
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json') && !/^index(\..+)?\.json$/.test(f));
  const entries = [];
  for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8'));
    const slug = slugFromFile(f);
    const name = raw.name || slug;
    const country = raw.country || "";
    const lat = typeof raw.lat === 'number' ? raw.lat : 0;
    const lon = typeof raw.lon === 'number' ? raw.lon : 0;
    const aliases = Array.isArray(raw.aliases) ? raw.aliases : makeAliases(slug, name);
    entries.push({ slug, name, country, lat, lon, aliases });
  }
  // sort by name
  entries.sort((a,b)=>a.name.localeCompare(b.name));
  fs.writeFileSync(INDEX_PATH, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`Wrote ${path.relative(process.cwd(), INDEX_PATH)} with ${entries.length} entries`);
}

main();
