/**
 * Public, indexable routes + sitemap.xml builder (used at build time by
 * prerender.mjs). Private / transactional routes live in PRIVATE_ROUTES
 * (./index.ts) and are never listed.
 */
import { SPOT_A_FAKE } from "@/content/spotAFake";
import { canonicalUrl } from "./index";

/**
 * Public pages that can be held back as drafts. While unpublished the page
 * renders `noindex` itself, so it is prerendered (a real page, not a 404) but
 * left out of the sitemap. Once published it joins PUBLIC_STATIC_ROUTES.
 */
const DRAFTABLE_ROUTES: Array<{ path: string; published: boolean }> = [
  { path: "/how-to-spot-a-fake", published: SPOT_A_FAKE.published },
];

/** Static public pages (each one is a real route in App.tsx). */
export const PUBLIC_STATIC_ROUTES: string[] = [
  "/",
  "/products",
  "/science",
  "/about",
  "/faq",
  "/ai-assistant",
  "/peptalk",
  "/documentation",
  "/learn/what-are-khavinson-peptide-bioregulators",
  "/learn/cytomaxes-vs-cytogens",
  "/learn/buy-khavinson-peptides-usa",
  ...DRAFTABLE_ROUTES.filter((r) => r.published).map((r) => r.path),
];

/** Real public pages that are not listed in the sitemap (unpublished drafts, noindex). */
export const UNLISTED_ROUTES: string[] = DRAFTABLE_ROUTES.filter((r) => !r.published).map((r) => r.path);

export type SitemapEntry = { path: string; lastmod?: string };

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** YYYY-MM-DD (W3C date) from an ISO timestamp or Date. */
export function w3cDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const e of entries) {
    const loc = canonicalUrl(e.path);
    if (seen.has(loc)) continue;
    seen.add(loc);
    urls.push(
      `  <url>\n    <loc>${xmlEscape(loc)}</loc>${e.lastmod ? `\n    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : ""}\n  </url>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
