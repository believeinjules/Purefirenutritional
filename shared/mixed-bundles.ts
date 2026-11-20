/**
 * Prime Peptide mixed bundles (Phase 2, Julia 2026-11-20).
 *
 * Static list: one bottle each of two or three Prime Peptide products sold as
 * one line at a fixed bundle price. Copy comes verbatim from the Regulatory-
 * reviewed draft (bundle-copy-draft.md); do not edit wording here without
 * Regulatory sign-off.
 *
 * `live: false` → the page is a local/preview-only draft:
 *   - not in the shop grid, sitemap or prerender output;
 *   - /bundles/<slug> renders only when VITE_BUNDLE_PREVIEW=1 at build time
 *     (otherwise NotFound), and always with noindex while not live;
 *   - checkout rejects the bundle id.
 * Going live needs Julia's direct go-ahead.
 */

export type MixedBundle = {
  slug: string;
  /** Julia's name, used as the page title. */
  name: string;
  /** Product ids inside (one bottle each), in display order. */
  productIds: string[];
  /** Fixed bundle price in whole US dollars (charged server-side from this list). */
  priceUSD: number;
  /** Short description: intro paragraph. */
  intro: string;
  /** Short description: bullet lines. */
  bullets: string[];
  /** Optional closing line under the bullets. */
  outro?: string;
  live: boolean;
};

export const PRIME_PRODUCT_NAMES: Record<string, string> = {
  "prime-peptide-brain": "Prime Peptide Brain",
  "prime-peptide-collagen": "Prime Peptide Collagen",
  "prime-peptide-joints": "Prime Peptide Joints",
  "prime-peptide-omega": "Prime Peptide Omega",
  "prime-peptide-protect": "Prime Peptide Protect",
};

/** Required on every bundle page (draft: "Required on every bundle page"). */
export const BUNDLE_MANUFACTURER_NOTE =
  "The manufacturer describes its IPH peptides as short peptides combined with supporting nutrients; the research it cites is its own, and the finished product has not been tested in published independent trials.";
export const BUNDLE_NOT_STUDIED_NOTE =
  "These products have not been studied together; bundles group them for convenience.";

export const MIXED_BUNDLES: MixedBundle[] = [
  {
    slug: "mobility-pair",
    name: "Mobility Pair",
    productIds: ["prime-peptide-joints", "prime-peptide-protect"],
    priceUSD: 369,
    intro:
      "One bottle each of Prime Peptide Joints and Prime Peptide Protect, for people who want joint support and antioxidant support in one order.",
    bullets: [
      "Prime Peptide Joints is built around the manufacturer's IPH AEN and IPH ESM peptides and is formulated to support the joints and cartilage.",
      "Prime Peptide Protect is built around IPH REG and IPH EP and is formulated to support antioxidant defences, normal melatonin levels and a calm mood.",
    ],
    live: false,
  },
  {
    slug: "skin-and-bones-duo",
    name: "Skin & Bones Duo",
    productIds: ["prime-peptide-collagen", "prime-peptide-joints"],
    priceUSD: 324,
    intro:
      "Two formulas built around the manufacturer's IPH AEN peptide, for skin and connective tissue (Collagen) and for joints and cartilage (Joints). Both are formulated to support normal collagen and hyaluronic acid production.",
    bullets: [
      "Prime Peptide Collagen is formulated to support skin, hair, nails and connective tissue, with marine collagen.",
      "Prime Peptide Joints is formulated to support the joints and cartilage.",
    ],
    live: false,
  },
  {
    slug: "focus-pair",
    name: "Focus Pair",
    productIds: ["prime-peptide-brain", "prime-peptide-omega"],
    priceUSD: 297,
    intro:
      "One bottle each of Prime Peptide Brain and Prime Peptide Omega, for people who want brain and immune support in one order.",
    bullets: [
      "Prime Peptide Brain is built around the manufacturer's IPH AGAP peptide and is formulated to support the brain and cognitive function.",
      "Prime Peptide Omega is built around IPH T and is formulated to support the immune system, with omega fatty acids.",
    ],
    live: false,
  },
  {
    slug: "day-and-night-duo",
    name: "Day & Night Duo",
    productIds: ["prime-peptide-brain", "prime-peptide-protect"],
    priceUSD: 342,
    intro:
      "One bottle each of Prime Peptide Brain and Prime Peptide Protect, for people who want brain support and antioxidant support in one order.",
    bullets: [
      "Prime Peptide Brain is built around the manufacturer's IPH AGAP peptide and is formulated to support the brain and cognitive function.",
      "Prime Peptide Protect is formulated to support antioxidant defences, normal melatonin levels and a calm mood.",
    ],
    live: false,
  },
  {
    slug: "beauty-duo",
    name: "Beauty Duo",
    productIds: ["prime-peptide-collagen", "prime-peptide-omega"],
    priceUSD: 279,
    intro:
      "One bottle each of Prime Peptide Collagen and Prime Peptide Omega, for people who want skin and connective-tissue support and immune support in one order.",
    bullets: [
      "Prime Peptide Collagen is formulated to support skin, hair, nails and connective tissue, with marine collagen.",
      "Prime Peptide Omega is formulated to support the immune system, with omega fatty acids.",
    ],
    live: false,
  },
  {
    slug: "glow-up-trio",
    name: "Glow-Up Trio",
    productIds: ["prime-peptide-brain", "prime-peptide-collagen", "prime-peptide-omega"],
    priceUSD: 423,
    intro: "Three Prime Peptide formulas in one order:",
    bullets: [
      "Brain, formulated to support the brain and cognitive function.",
      "Collagen, formulated to support skin, hair, nails and connective tissue.",
      "Omega, formulated to support the immune system, with omega fatty acids.",
    ],
    live: false,
  },
  {
    slug: "foundation-trio",
    name: "Foundation Trio",
    productIds: ["prime-peptide-collagen", "prime-peptide-joints", "prime-peptide-protect"],
    priceUSD: 495,
    intro: "Three Prime Peptide formulas in one order:",
    bullets: [
      "Collagen, formulated to support skin, hair, nails and connective tissue.",
      "Joints, formulated to support the joints and cartilage.",
      "Protect, formulated to support antioxidant defences, normal melatonin levels and a calm mood.",
    ],
    outro: "Collagen and Joints are both built around the manufacturer's IPH AEN peptide.",
    live: false,
  },
];

export function bundlePath(slug: string): string {
  return `/bundles/${slug}`;
}

export function getMixedBundle(slug: string | null | undefined): MixedBundle | undefined {
  if (typeof slug !== "string") return undefined;
  return MIXED_BUNDLES.find((b) => b.slug === slug.trim());
}

/** "Prime Peptide Brain + Protect" */
export function bundleProductList(bundle: MixedBundle): string {
  const short = bundle.productIds.map((id) => (PRIME_PRODUCT_NAMES[id] ?? id).replace(/^Prime Peptide /, ""));
  return `Prime Peptide ${short.join(" + ")}`;
}

/** "Day & Night Duo: Prime Peptide Brain + Protect" */
export function bundleSubtitle(bundle: MixedBundle): string {
  return `${bundle.name}: ${bundleProductList(bundle)}`;
}

/** Bundles a shopper may see / buy (live only). */
export function liveMixedBundles(): MixedBundle[] {
  return MIXED_BUNDLES.filter((b) => b.live);
}

/** Sum of single-bottle prices (whole cents) from a price lookup; undefined if any is missing. */
export function boughtSeparatelyCents(
  bundle: MixedBundle,
  singlePriceUSD: (productId: string) => number | undefined
): number | undefined {
  let total = 0;
  for (const id of bundle.productIds) {
    const p = singlePriceUSD(id);
    if (typeof p !== "number" || !Number.isFinite(p) || p <= 0) return undefined;
    total += Math.round(p * 100);
  }
  return total;
}
