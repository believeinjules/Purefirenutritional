import { describe, expect, it, vi } from "vitest";
import {
  BUNDLE_MANUFACTURER_NOTE,
  BUNDLE_NOT_STUDIED_NOTE,
  MIXED_BUNDLES,
  boughtSeparatelyCents,
  bundleSubtitle,
  liveMixedBundles,
  type MixedBundle,
} from "./mixed-bundles";
import {
  CheckoutValidationError,
  findProduct,
  resolveCheckoutLines,
  resolveCheckoutLinesWith,
  resolveMixedBundleLine,
} from "./product-prices";
import { getPdpContent } from "./product-facts";
import { buildCheckoutSessionParams, bundleSummary } from "../api/_lib/checkout-session";
import { PUBLIC_STATIC_ROUTES, UNLISTED_ROUTES, buildSitemapXml } from "../client/src/lib/seo/sitemap";

const single = (id: string) => findProduct({ productId: id })?.priceUSD;

// Draft table (bundle-copy-draft.md): name, subtitle, bought separately, price.
const EXPECTED: Array<[string, string, number, number]> = [
  ["mobility-pair", "Mobility Pair: Prime Peptide Joints + Protect", 378, 369],
  ["skin-and-bones-duo", "Skin & Bones Duo: Prime Peptide Collagen + Joints", 333, 324],
  ["focus-pair", "Focus Pair: Prime Peptide Brain + Omega", 306, 297],
  ["day-and-night-duo", "Day & Night Duo: Prime Peptide Brain + Protect", 351, 342],
  ["beauty-duo", "Beauty Duo: Prime Peptide Collagen + Omega", 288, 279],
  ["glow-up-trio", "Glow-Up Trio: Prime Peptide Brain + Collagen + Omega", 450, 423],
  ["foundation-trio", "Foundation Trio: Prime Peptide Collagen + Joints + Protect", 522, 495],
];

const copyOf = (b: MixedBundle) =>
  [b.name, bundleSubtitle(b), b.intro, ...b.bullets, b.outro ?? ""].join(" ");

describe("mixed bundles: static list", () => {
  it("has exactly the seven approved bundles (All five dropped)", () => {
    expect(MIXED_BUNDLES.map((b) => b.slug)).toEqual(EXPECTED.map((e) => e[0]));
    expect(MIXED_BUNDLES.some((b) => /all.?five/i.test(b.slug + b.name))).toBe(false);
    expect(liveMixedBundles()).toEqual(MIXED_BUNDLES.filter((b) => b.live));
  });

  it.each(EXPECTED)("%s: subtitle, bought-separately sum and price", (slug, subtitle, separately, price) => {
    const b = MIXED_BUNDLES.find((x) => x.slug === slug)!;
    expect(bundleSubtitle(b)).toBe(subtitle);
    expect(b.priceUSD).toBe(price);
    expect(boughtSeparatelyCents(b, single)).toBe(separately * 100);
    expect(b.priceUSD * 100).toBeLessThan(boughtSeparatelyCents(b, single)!);
  });

  it("uses the new single prices", () => {
    expect([
      "prime-peptide-collagen",
      "prime-peptide-omega",
      "prime-peptide-brain",
      "prime-peptide-joints",
      "prime-peptide-protect",
    ].map(single)).toEqual([144, 144, 162, 189, 189]);
  });

  it("bought-separately is undefined when a price is missing", () => {
    expect(boughtSeparatelyCents(MIXED_BUNDLES[0], () => undefined)).toBeUndefined();
  });

  it("copy avoids forbidden words", () => {
    const forbidden = /sleep|insomnia|stress|anxiety|density|osteopor|heart|\bALA\b|Complete|save|%/i;
    for (const b of MIXED_BUNDLES) expect(copyOf(b)).not.toMatch(forbidden);
    expect(BUNDLE_MANUFACTURER_NOTE + BUNDLE_NOT_STUDIED_NOTE).not.toMatch(forbidden);
  });

  it("frozen safety text is identical on every Prime product", () => {
    const ids = [...new Set(MIXED_BUNDLES.flatMap((b) => b.productIds))];
    const texts = new Set(ids.map((id) => getPdpContent(id)?.safety));
    expect(texts.size).toBe(1);
    expect([...texts][0]).toMatch(/^Not recommended during pregnancy or breastfeeding unless your doctor advises it\./);
  });

  it("bundle pages are not in the sitemap or prerendered route lists", () => {
    const all = [...PUBLIC_STATIC_ROUTES, ...UNLISTED_ROUTES];
    expect(all.some((r) => r.startsWith("/bundles"))).toBe(false);
    expect(buildSitemapXml(PUBLIC_STATIC_ROUTES.map((path) => ({ path })))).not.toContain("/bundles");
  });
});

describe("mixed bundles: checkout validation", () => {
  const liveList: MixedBundle[] = MIXED_BUNDLES.map((b) => ({ ...b, live: true }));

  it("rejects every bundle whose live flag is false", () => {
    const drafts: MixedBundle[] = MIXED_BUNDLES.map((b) => ({ ...b, live: false }));
    for (const b of drafts) {
      expect(() => resolveMixedBundleLine({ mixedBundle: b.slug, quantity: 1 }, drafts)).toThrow(/not available yet/);
    }
    for (const b of MIXED_BUNDLES.filter((x) => !x.live)) {
      expect(() => resolveCheckoutLines([{ mixedBundle: b.slug, quantity: 1 }])).toThrow(CheckoutValidationError);
    }
  });

  it("rejects unknown bundles", () => {
    expect(() => resolveMixedBundleLine({ mixedBundle: "all-five", quantity: 1 }, liveList)).toThrow(/Unknown bundle/);
  });

  it.each(EXPECTED)("%s (live): one line at the static price, bottles recorded", (slug, subtitle, _s, price) => {
    const line = resolveMixedBundleLine({ mixedBundle: slug, quantity: 2, price: 1 }, liveList);
    const b = liveList.find((x) => x.slug === slug)!;
    expect(line.unitAmountCents).toBe(price * 100);
    expect(line.quantity).toBe(2);
    expect(line.name).toBe(subtitle);
    expect(line.bundleBottles).toBe(b.productIds.length);
    expect(line.bundleContents).toEqual(b.productIds);
    expect(line.bundleKind).toBe(`mixed:${slug}`);
  });

  it("ignores client price / productId and rejects bad quantity", () => {
    const line = resolveMixedBundleLine(
      { mixedBundle: "beauty-duo", productId: "prime-peptide-brain", quantity: 1, price: 0.01 },
      liveList
    );
    expect(line.unitAmountCents).toBe(27900);
    expect(line.productId).toBe("bundle:beauty-duo");
    expect(() => resolveMixedBundleLine({ mixedBundle: "beauty-duo", quantity: 0 }, liveList)).toThrow(/quantity/);
  });

  it("resolveCheckoutLinesWith mixes bundles and singles; lookup never sees bundle slugs", async () => {
    const lookup = vi.fn(async () => new Map());
    const lines = await resolveCheckoutLinesWith(
      [
        { mixedBundle: "foundation-trio", quantity: 1 },
        { productId: "prime-peptide-brain", quantity: 1 },
      ],
      lookup,
      { mixedBundles: liveList }
    );
    expect(lookup).toHaveBeenCalledWith(["prime-peptide-brain"]);
    expect(lines.map((l) => l.unitAmountCents)).toEqual([49500, 16200]);

    const { params } = buildCheckoutSessionParams({ resolved: lines, origin: "https://example.test" });
    const md = params.line_items[0].price_data.product_data.metadata;
    expect(md.bundle_contents).toBe("prime-peptide-collagen+prime-peptide-joints+prime-peptide-protect");
    expect(md.bundle_bottles).toBe("3");
    expect(bundleSummary(lines)).toBe("bundle:foundation-trio:-:mixed:foundation-triox1");
  });

  it("not-live bundles are rejected through resolveCheckoutLinesWith", async () => {
    const drafts: MixedBundle[] = MIXED_BUNDLES.map((b) => ({ ...b, live: false }));
    await expect(
      resolveCheckoutLinesWith([{ mixedBundle: "focus-pair", quantity: 1 }], async () => new Map(), { mixedBundles: drafts })
    ).rejects.toThrow(CheckoutValidationError);
  });
});
