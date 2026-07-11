// Generates simple SVG hero and illustration placeholders for each city
// Writes to public/images/cities/{slug}-hero.svg and {slug}-illust.svg

import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content", "cities");
const OUT_DIR = path.join(process.cwd(), "public", "images", "cities");

function slugColor(slug) {
  // deterministic color from slug
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 65% 55%)`;
}

function escape(text) {
  return text.replace(/[&<>\"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
}

function heroSvg(name, slug) {
  const color = slugColor(slug);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="720" viewBox="0 0 1600 720">\n  <defs>\n    <linearGradient id="g" x1="0" x2="1">\n      <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>\n      <stop offset="100%" stop-color="black" stop-opacity="0.12"/>\n    </linearGradient>\n  </defs>\n  <rect width="100%" height="100%" fill="url(#g)"/>\n  <g fill="white" opacity="0.95">\n    <text x="48" y="110" font-family="Inter, system-ui, Arial" font-size="64" font-weight="700">${escape(name)}</text>\n    <text x="48" y="170" font-family="Inter, system-ui, Arial" font-size="20" opacity="0.85">Hero placeholder — replace with curated photo</text>\n  </g>\n</svg>`;
}

function illustSvg(name, slug) {
  const color = slugColor(slug);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="600" height="168" viewBox="0 0 600 168">\n  <rect width="100%" height="100%" rx="12" fill="${color}"/>\n  <g fill="white" opacity="0.95">\n    <text x="20" y="96" font-family="Inter, system-ui, Arial" font-size="28" font-weight="600">${escape(name)}</text>\n  </g>\n</svg>`;
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error("content/cities directory not found");
    process.exit(1);
  }
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8'));
    const name = raw.name || slug;

    const heroPath = path.join(OUT_DIR, `${slug}-hero.svg`);
    const illustPath = path.join(OUT_DIR, `${slug}-illust.svg`);

    fs.writeFileSync(heroPath, heroSvg(name, slug), 'utf8');
    fs.writeFileSync(illustPath, illustSvg(name, slug), 'utf8');
    console.log(`wrote ${path.relative(process.cwd(), heroPath)}`);
    console.log(`wrote ${path.relative(process.cwd(), illustPath)}`);
  }
}

main();
