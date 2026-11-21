import { describe, expect, it } from "vitest";
import {
  INDEXNOW_BASE,
  diffSitemaps,
  parseSitemap,
  selectIndexNowUrls,
  toAbsUrl,
} from "./indexnow-select.mjs";

const u = (path: string) => `${INDEXNOW_BASE}${path}`;

const staticPaths = ["/", "/products", "/about", "/learn", "/science", "/privacy"];
const productPaths = ["/products/cerluten", "/products/endoluten"];
const allPaths = [...staticPaths, ...productPaths];

function sitemap(entries: { path: string; lastmod: string }[]) {
  const urls = entries
    .map((e) => `  <url><loc>${u(e.path)}</loc><lastmod>${e.lastmod}</lastmod></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset>${urls}</urlset>`;
}

const buildA = "2026-11-18";
const buildB = "2026-11-19";
const prevXml = sitemap([
  ...staticPaths.map((path) => ({ path, lastmod: buildA })),
  { path: "/products/cerluten", lastmod: "2026-10-01" },
  { path: "/products/endoluten", lastmod: "2026-10-01" },
]);
const currUrls = allPaths.map(u);

describe("parseSitemap / diffSitemaps", () => {
  it("parses loc and lastmod and flags a uniform build-date lastmod bump as ambiguous", () => {
    const prev = parseSitemap(prevXml);
    expect(prev).toHaveLength(8);
    expect(prev[0]).toEqual({ loc: u("/"), lastmod: buildA });
    const allBumped = sitemap(allPaths.map((path) => ({ path, lastmod: buildB })));
    const diff = diffSitemaps(prev, parseSitemap(allBumped));
    expect(diff.added).toEqual([]);
    expect(diff.lastmodAmbiguous).toBe(true);
    expect(diff.lastmodChanged.length).toBe(8);
  });

  it("treats a single product lastmod change as a real update", () => {
    const current = sitemap([
      ...staticPaths.map((path) => ({ path, lastmod: buildA })),
      { path: "/products/cerluten", lastmod: "2026-11-19" },
      { path: "/products/endoluten", lastmod: "2026-10-01" },
    ]);
    const diff = diffSitemaps(parseSitemap(prevXml), parseSitemap(current));
    expect(diff.lastmodAmbiguous).toBe(false);
    expect(diff.lastmodChanged).toEqual([u("/products/cerluten")]);
  });
});

describe("selectIndexNowUrls", () => {
  it("maps a single page file to that route", () => {
    const r = selectIndexNowUrls({ changedFiles: ["client/src/pages/Index.tsx"], currentUrls: currUrls });
    expect(r).toEqual({ urls: [u("/")], reason: "changed", fallback: false });
  });

  it("maps a learn article to its journal URL", () => {
    const r = selectIndexNowUrls({
      changedFiles: ["client/src/pages/learn/VesugenResearchSafety.tsx"],
      currentUrls: [...currUrls, u("/learn/vesugen-research-safety")],
    });
    expect(r.urls).toEqual([u("/learn/vesugen-research-safety")]);
    expect(r.fallback).toBe(false);
  });

  it("maps products.ts to the catalog and every product URL, not the whole site", () => {
    const r = selectIndexNowUrls({ changedFiles: ["client/src/data/products.ts"], currentUrls: currUrls });
    expect(r.fallback).toBe(false);
    expect(r.urls).toEqual([u("/products"), u("/products/cerluten"), u("/products/endoluten")]);
    expect(r.urls).not.toContain(u("/about"));
  });

  it("falls back to the full sitemap for site-wide chrome (nav, CSS, prerender)", () => {
    for (const file of ["client/src/components/Navigation.tsx", "client/src/index.css", "prerender.mjs"]) {
      const r = selectIndexNowUrls({ changedFiles: [file], currentUrls: currUrls });
      expect(r, file).toMatchObject({ reason: "ambiguous-files", fallback: true });
      expect(r.urls, file).toEqual([...currUrls].sort());
    }
  });

  it("falls back when a source file cannot be mapped to a route", () => {
    const r = selectIndexNowUrls({ changedFiles: ["client/src/lib/dailyFire.ts"], currentUrls: currUrls });
    expect(r).toMatchObject({ reason: "ambiguous-files", fallback: true });
    expect(r.urls).toEqual([...currUrls].sort());
  });

  it("ignores tests and docs, and reports no indexable changes when that's all that moved", () => {
    const r = selectIndexNowUrls({
      changedFiles: ["scripts/indexnow-select.test.ts", "docs/notes.md", "pending/indexnow.yml"],
      currentUrls: currUrls,
    });
    expect(r).toEqual({ urls: [], reason: "no-indexable-changes", fallback: false });
  });

  it("unions a sitemap-added URL and a precise lastmod change", () => {
    const current = sitemap([
      ...staticPaths.map((path) => ({ path, lastmod: buildA })),
      { path: "/products/cerluten", lastmod: "2026-10-01" },
      { path: "/products/endoluten", lastmod: "2026-11-02" },
      { path: "/learn/vesugen-research-safety", lastmod: buildA },
    ]);
    const r = selectIndexNowUrls({ previousSitemap: prevXml, currentSitemap: current });
    expect(r.fallback).toBe(false);
    expect(r.urls).toEqual([u("/learn/vesugen-research-safety"), u("/products/endoluten")]);
  });

  it("ignores a uniform lastmod bump and only submits the file-mapped route", () => {
    const bumped = sitemap(allPaths.map((path) => ({ path, lastmod: buildB })));
    const r = selectIndexNowUrls({
      previousSitemap: prevXml,
      currentSitemap: bumped,
      changedFiles: ["client/src/pages/About.tsx"],
    });
    expect(r).toEqual({ urls: [u("/about")], reason: "changed", fallback: false });
  });

  it("does not fall back to the full set when lastmods all bump but the URL set and files are unchanged", () => {
    const bumped = sitemap(allPaths.map((path) => ({ path, lastmod: buildB })));
    const r = selectIndexNowUrls({ previousSitemap: prevXml, currentSitemap: bumped, changedFiles: [] });
    expect(r).toEqual({ urls: [], reason: "no-indexable-changes", fallback: false });
  });

  it("toAbsUrl normalizes paths", () => {
    expect(toAbsUrl("/about")).toBe(u("/about"));
    expect(toAbsUrl(u("/about"))).toBe(u("/about"));
  });
});

describe("Prime mixed bundles", () => {
  it("maps bundle files to live bundle URLs only (drafts are not in the sitemap)", () => {
    const live = u("/bundles/focus-pair");
    expect(selectIndexNowUrls({ changedFiles: ["client/src/pages/BundleDetail.tsx"], currentUrls: [...currUrls, live] })).toEqual({
      urls: [live],
      reason: "changed",
      fallback: false,
    });
    expect(selectIndexNowUrls({ changedFiles: ["shared/mixed-bundles.ts"], currentUrls: currUrls })).toEqual({
      urls: [],
      reason: "no-indexable-changes",
      fallback: false,
    });
  });
});
