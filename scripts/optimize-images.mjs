/**
 * One-off image optimizer (run locally, outputs are committed; Vercel build does not need sharp).
 *   npm i --no-save sharp && node scripts/optimize-images.mjs
 * Writes resized WebP copies to client/public/opt/<path>-<w>.webp and the width list per
 * source to shared/image-manifest.json (used by client/src/lib/responsiveImage.ts).
 * Originals are untouched (share images / JSON-LD still point at them).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const pub = path.join(root, "client/public");
const outDir = path.join(pub, "opt");
const WIDTHS = [160, 320, 640, 960];
const sources = [
  "logo-flame.jpeg",
  "peptalk-logo.png",
  ...fs.readdirSync(path.join(pub, "products")).map((f) => `products/${f}`),
].filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

const manifest = {};
for (const rel of sources) {
  const src = path.join(pub, rel);
  let meta;
  try { meta = await sharp(src).metadata(); } catch { console.warn(`skip (unreadable): ${rel}`); continue; }
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, 1200));
  const uniq = [...new Set(widths)].sort((a, b) => a - b);
  const base = rel.replace(/\.[^.]+$/, "");
  for (const w of uniq) {
    const out = path.join(outDir, `${base}-${w}.webp`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (!fs.existsSync(out)) await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(out);
  }
  manifest["/" + rel] = { w: uniq, ratio: +(meta.width / meta.height).toFixed(4) };
}
fs.writeFileSync(path.join(root, "shared/image-manifest.json"), JSON.stringify(manifest) + "\n");
console.log(`optimized ${sources.length} images`);
