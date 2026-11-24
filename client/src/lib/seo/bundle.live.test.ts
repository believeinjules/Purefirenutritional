/**
 * Go-live safety net for Prime Peptide mixed bundles: flip a bundle to
 * live: true in memory and check everything indexing depends on, using the
 * same render + checks prerender.mjs runs at build time.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { MIXED_BUNDLES, bundlePath, getMixedBundle, groupBottlesAlt } from "@shared/mixed-bundles";
import { render } from "../../entry-server";
import { bundleHead, bundleJsonLd, liveBundleRoutes, llmsBundleSection } from "./bundle";
import { buildSitemapXml, PUBLIC_STATIC_ROUTES } from "./sitemap";
import { canonicalUrl, hasClaimLanguage } from "./index";
import { canShowBundle } from "@/pages/BundleDetail";
// @ts-expect-error plain .mjs build helpers
import { applyHead, checkLiveBundlePage, jsonLdBlocks, headingLevels } from "../../../../scripts/prerender-html.mjs";
// @ts-expect-error plain .mjs build helpers
import { selectIndexNowUrls, INDEXNOW_BASE } from "../../../../scripts/indexnow-select.mjs";

const root = path.resolve(__dirname, "../../../..");
const template = fs.readFileSync(path.join(root, "client/index.html"), "utf8");

/** Same as prerender.mjs renderRoute(). */
function prerenderPage(route: string): string {
  const { html, helmet } = render(route);
  return applyHead(template.replace(`<div id="root"></div>`, `<div id="root">${html}</div>`), helmet);
}

function expectedFor(slug: string) {
  const b = getMixedBundle(slug)!;
  return {
    name: b.name,
    title: `${b.name} | Pure Fire Nutritional`,
    description: b.metaDescription,
    canonical: `https://www.purefirenutritional.com/bundles/${slug}`,
    priceUSD: b.priceUSD,
    imageCount: b.productIds.length + 1,
  };
}

describe.each(MIXED_BUNDLES.map((b) => b.slug))("bundle %s as a draft (live: false)", (slug) => {
  const bundle = getMixedBundle(slug)!;
  let was = false;
  beforeAll(() => {
    was = bundle.live;
    bundle.live = false;
  });
  afterAll(() => {
    bundle.live = was;
  });

  it("is not prerendered, sitemap-listed, in llms.txt or IndexNow", () => {
    expect(liveBundleRoutes()).not.toContain(bundlePath(slug));
    expect(llmsBundleSection()).not.toContain(bundlePath(slug));
    // llms.txt bundle lines are added at build time only (prerender.mjs), never by hand.
    expect(fs.readFileSync(path.join(root, "client/public/llms.txt"), "utf8")).not.toContain("/bundles/");
  });

  it("production renders NotFound (no preview flag)", () => {
    expect(canShowBundle(bundle, undefined)).toBe(false);
    expect(prerenderPage(bundlePath(slug))).not.toContain('data-testid="bundle-page"');
  });

  it("head: noindex, no JSON-LD (PageSeo drops the canonical on noindex pages)", () => {
    const head = bundleHead(bundle);
    expect(head.noindex).toBe(true);
    expect(head.jsonLd).toEqual([]);
  });
});

describe.each(MIXED_BUNDLES.map((b) => b.slug))("bundle %s simulated live", (slug) => {
  const bundle = getMixedBundle(slug)!;
  let was = false;
  beforeAll(() => {
    was = bundle.live;
    bundle.live = true;
  });
  afterAll(() => {
    bundle.live = was;
  });

  it("prerendered HTML passes the build-time page checks", () => {
    expect(canShowBundle(bundle, undefined)).toBe(true);
    const page = prerenderPage(bundlePath(slug));
    expect(checkLiveBundlePage(page, expectedFor(slug))).toEqual([]);
    // Draft-only guards are gone; the page itself is in the static HTML.
    expect(page).not.toMatch(/name="robots"[^>]*noindex/);
    expect(page).toContain('data-testid="bundle-page"');
    expect(headingLevels(page.match(/<div id="root">([\s\S]*)<\/div>/)![1]).filter((l: number) => l === 1)).toHaveLength(1);
  });

  it("JSON-LD: one Product (price/USD/availability/brand/images, components linked) + BreadcrumbList, no ratings or claims", () => {
    const blocks = jsonLdBlocks(prerenderPage(bundlePath(slug)));
    const product = blocks.find((b: { "@type": string }) => b["@type"] === "Product");
    expect(product).toEqual(bundleJsonLd(bundle));
    expect(product.offers.price).toBe(bundle.priceUSD.toFixed(2));
    expect(product.offers.priceCurrency).toBe("USD");
    expect(product.offers.availability).toBe("https://schema.org/InStock");
    expect(product.brand).toEqual({ "@type": "Brand", name: "Prime Peptide" });
    expect(product.image).toEqual([
      `https://www.purefirenutritional.com/images/bundles/${slug}.webp`,
      ...bundle.productIds.map((id) => `https://www.purefirenutritional.com/products/${id.replace("prime-peptide-", "pp-")}.png`),
    ]);
    const page = prerenderPage(bundlePath(slug));
    expect(page).toMatch(new RegExp(`<meta[^>]*property="og:image" content="https://www\\.purefirenutritional\\.com/images/bundles/${slug}\\.webp"`));
    expect(page).toContain(`content="${groupBottlesAlt(bundle)}"`);
    expect(product.isRelatedTo.map((r: { url: string }) => r.url)).toEqual(bundle.productIds.map((id) => canonicalUrl(`/products/${id}`)));
    expect(product.aggregateRating).toBeUndefined();
    expect(product.review).toBeUndefined();
    expect(hasClaimLanguage(JSON.stringify(product))).toBe(false);
    const crumbs = blocks.find((b: { "@type": string }) => b["@type"] === "BreadcrumbList");
    expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual(["Home", "Shop", bundle.name]);
  });

  it("is in the sitemap, llms.txt section and IndexNow selection", () => {
    expect(liveBundleRoutes()).toContain(bundlePath(slug));
    const url = `https://www.purefirenutritional.com/bundles/${slug}`;
    // Same entries prerender.mjs writes.
    const xml = buildSitemapXml([...PUBLIC_STATIC_ROUTES, ...liveBundleRoutes()].map((p) => ({ path: p })));
    expect(xml).toContain(`<loc>${url}</loc>`);
    expect(llmsBundleSection()).toContain(`- [${bundle.name}](${url}): ${bundle.metaDescription}`);
    const prev = buildSitemapXml([...PUBLIC_STATIC_ROUTES, ...liveBundleRoutes().filter((r) => r !== bundlePath(slug))].map((p) => ({ path: p })));
    const added = selectIndexNowUrls({ previousSitemap: prev, currentSitemap: xml, changedFiles: ["shared/mixed-bundles.ts"] });
    expect(added.fallback).toBe(false);
    // The new URL, plus any other live bundle (mixed-bundles.ts maps to every /bundles/ URL).
    expect(added.urls).toContain(url);
    expect(added.urls.every((x: string) => x.startsWith("https://www.purefirenutritional.com/bundles/"))).toBe(true);
    expect(INDEXNOW_BASE).toBe("https://www.purefirenutritional.com");
  });
});

describe("build-time checker catches broken pages", () => {
  it("flags missing H1, noindex, wrong price and bad JSON-LD", () => {
    const exp = expectedFor("focus-pair");
    const bad = `<html><head><title>x</title><meta name="robots" content="noindex"/><script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","price":"1.00"}}</script></head><body><div id="root"><h2>a</h2><h4>b</h4></div></body></html>`;
    const problems = checkLiveBundlePage(bad, exp).join("\n");
    expect(problems).toMatch(/exactly one <h1>/);
    expect(problems).toMatch(/skips from h2 to h4/);
    expect(problems).toMatch(/noindex/);
    expect(problems).toMatch(/offer price 1.00/);
    expect(problems).toMatch(/canonical/);
    expect(problems).toMatch(/BreadcrumbList/);
    expect(() => jsonLdBlocks(`<script type="application/ld+json">{bad</script>`)).toThrow();
  });
});
