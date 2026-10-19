/**
 * Shop taxonomy: body-system groups, collections and goals, and the
 * Khavinson Peptides List. Membership is NOT stored here: it is read from
 * data/productTags.ts (one source of truth) and resolved against the
 * storefront catalog, so hidden products never appear and a new product
 * only needs a line in productTags.ts. Copy: content/categoryCopy.ts.
 */
import type { Product } from "@/data/products";
import { CATEGORY_COPY, type PageCopy } from "@/content/categoryCopy";
import { PRODUCT_TAGS, idsWithTag, tagsFor } from "@/data/productTags";
import { isHiddenProduct } from "@shared/hidden-products";

/** Browse pages are indexable and in the sitemap (Julia approved 2026-10-19). */
export const CATEGORY_PAGES_LIVE = true;

export const LIST_PAGE_PATH = "/khavinson-peptides-list";
export const SYSTEMS_LANDING_PATH = "/products/system";

/** Never shown on browse pages even if a hidden flag were removed by mistake (on hold / hidden). */
export const CATEGORY_EXCLUDED_IDS: ReadonlySet<string> = new Set(["indosine", "calsil-t", "olecap", "panaxod"]);

/** Existing copy flagged for Editorial ("weight-management routines"): no card description on browse pages. */
export const DESCRIPTION_SUPPRESSED_IDS: ReadonlySet<string> = new Set(["volustom", "reviform-cocktail"]);

export type BrowseKind = "system" | "collection" | "goal";

export type BrowsePage = {
  kind: BrowseKind;
  slug: string;
  /** Short label (menu, tiles, breadcrumbs). */
  name: string;
};

/** Order = menu order. The 7 consolidated groups, then Blood & Bone Marrow (kept separate; see audit). */
export const BODY_SYSTEMS: BrowsePage[] = [
  { kind: "system", slug: "brain-nervous-system", name: "Brain & Nervous System" },
  { kind: "system", slug: "heart-circulation", name: "Heart & Circulation" },
  { kind: "system", slug: "immune-respiratory", name: "Immune & Respiratory" },
  { kind: "system", slug: "digestion-metabolism", name: "Digestion & Metabolism" },
  { kind: "system", slug: "kidney-bladder", name: "Kidney & Bladder" },
  { kind: "system", slug: "bones-joints-muscles", name: "Bones, Joints & Muscles" },
  { kind: "system", slug: "hormonal-reproductive-health", name: "Hormonal & Reproductive Health" },
  { kind: "system", slug: "blood-bone-marrow", name: "Blood & Bone Marrow" },
];

export const COLLECTIONS: BrowsePage[] = [
  { kind: "collection", slug: "khavinson-cytomaxes", name: "Khavinson Cytomaxes" },
  { kind: "collection", slug: "khavinson-cytogens", name: "Khavinson Cytogens" },
  { kind: "collection", slug: "revilab", name: "Revilab" },
  { kind: "collection", slug: "prime-peptide", name: "Prime Peptide" },
];

export const GOALS: BrowsePage[] = [
  { kind: "goal", slug: "sleep-daily-rhythms", name: "Sleep & Daily Rhythms" },
  { kind: "goal", slug: "focus-cognition", name: "Focus & Cognition" },
  { kind: "goal", slug: "energy-vitality", name: "Energy & Vitality" },
  { kind: "goal", slug: "stress-resilience", name: "Stress & Resilience" },
  { kind: "goal", slug: "healthy-aging", name: "Healthy Aging" },
  { kind: "goal", slug: "recovery-mobility", name: "Recovery & Mobility" },
  { kind: "goal", slug: "skin-hair-beauty", name: "Skin, Hair & Beauty" },
];

/** First-level Shop > Body System menu: the 7 consolidated groups (Blood & Bone Marrow is on the landing page only). */
export const MENU_BODY_SYSTEMS: BrowsePage[] = BODY_SYSTEMS.filter((s) => s.slug !== "blood-bone-marrow");

export const ALL_BROWSE_PAGES: BrowsePage[] = [...BODY_SYSTEMS, ...COLLECTIONS, ...GOALS];

const BASE: Record<BrowseKind, string> = {
  system: "/products/system",
  collection: "/products/collection",
  goal: "/products/goal",
};

export function browsePath(page: Pick<BrowsePage, "kind" | "slug">): string {
  return `${BASE[page.kind]}/${page.slug}`;
}

export function systemPath(slug: string): string {
  return browsePath({ kind: "system", slug });
}

export function getBrowsePage(kind: BrowseKind, slug: string | null | undefined): BrowsePage | undefined {
  return ALL_BROWSE_PAGES.find((p) => p.kind === kind && p.slug === slug);
}

export function getBodySystem(slug: string | null | undefined): BrowsePage | undefined {
  return getBrowsePage("system", slug);
}

/**
 * Dropped / renamed browse URLs from earlier unmerged versions → destination.
 * Mirrored in vercel.json (permanent redirects); a test keeps them in sync.
 */
export const RETIRED_BROWSE_PATHS: Record<string, string> = {
  "/products/goal/stress-mood": "/products/goal/stress-resilience",
  "/products/collection/hair-skin-beauty": "/products/goal/skin-hair-beauty",
  // Eye products are listed in their own section of the Khavinson Peptides List.
  "/products/goal/eyes-vision": "/khavinson-peptides-list",
  "/products/goal/antioxidant-support": "/products",
};

/** Every prerendered browse route (list page, landing, groups, collections, goals). */
export const CATEGORY_ROUTES: string[] = [LIST_PAGE_PATH, SYSTEMS_LANDING_PATH, ...ALL_BROWSE_PAGES.map(browsePath)];

/**
 * Old body-system slugs from the unmerged 12-page version → their consolidated
 * group. Mirrored in vercel.json (permanent redirects); a test keeps them in sync.
 */
export const RETIRED_SYSTEM_SLUGS: Record<string, string> = {
  "heart-blood-vessels": "heart-circulation",
  "immune-thymus": "immune-respiratory",
  "lungs-airways": "immune-respiratory",
  "liver-digestive": "digestion-metabolism",
  "joints-bones-cartilage": "bones-joints-muscles",
  muscle: "bones-joints-muscles",
  "endocrine-glands": "hormonal-reproductive-health",
  "womens-health": "hormonal-reproductive-health",
  "mens-health": "hormonal-reproductive-health",
};

export function copyFor(path: string): PageCopy {
  const c = CATEGORY_COPY[path];
  if (!c) throw new Error(`No category copy for ${path}`);
  return c;
}

export function tagOf(page: Pick<BrowsePage, "kind" | "slug">): string {
  return `${page.kind}:${page.slug}`;
}

export function codeFor(id: string): string | undefined {
  return PRODUCT_TAGS[id]?.code;
}

/** Khavinson Cytomax / Cytogen first, then everything else; tag-file order within each. */
function isKhavinson(id: string): boolean {
  return tagsFor(id).some((t) => t === "collection:khavinson-cytomaxes" || t === "collection:khavinson-cytogens");
}

type Sellable = Pick<Product, "id" | "priceUSD">;

function sellable<T extends Sellable>(p: T | undefined): p is T {
  return !!p && !isHiddenProduct(p) && !CATEGORY_EXCLUDED_IDS.has(p.id) && typeof p.priceUSD === "number" && p.priceUSD > 0;
}

/** Products on a browse page, from the given storefront catalog (already without hidden products). */
export function pageProducts<T extends Sellable>(page: Pick<BrowsePage, "kind" | "slug">, catalog: readonly T[]): T[] {
  const byId = new Map(catalog.map((p) => [p.id, p] as const));
  const ids = idsWithTag(tagOf(page));
  const ordered = [...ids.filter(isKhavinson), ...ids.filter((id) => !isKhavinson(id))];
  return ordered.map((id) => byId.get(id)).filter(sellable);
}

/** Back-compat name used by the system page. */
export const systemProducts = pageProducts;

/** Body-system groups a product belongs to; the first is its primary (breadcrumbs). */
export function systemsForProduct(id: string): BrowsePage[] {
  if (CATEGORY_EXCLUDED_IDS.has(id)) return [];
  return tagsFor(id)
    .filter((t) => t.startsWith("system:"))
    .map((t) => getBodySystem(t.slice("system:".length)))
    .filter((p): p is BrowsePage => !!p);
}

/**
 * List-page sections: each body-system group, then products with no group
 * (Eyes & Vision goal first, then the rest), so every sold product is listed.
 */
export function listPageGroups<T extends Sellable>(catalog: readonly T[]) {
  const groups: Array<{ name: string; page?: BrowsePage; products: T[] }> = BODY_SYSTEMS.map((s) => ({
    name: s.name,
    page: s,
    products: pageProducts(s, catalog),
  }));
  const grouped = new Set(groups.flatMap((g) => g.products.map((p) => p.id)));
  const rest = catalog.filter((p) => sellable(p) && !grouped.has(p.id));
  const eyeIds = new Set(idsWithTag("list:eyes-vision"));
  groups.push({ name: "Eyes & Vision", products: rest.filter((p) => eyeIds.has(p.id)) });
  groups.push({ name: "Skin, Energy & General", products: rest.filter((p) => !eyeIds.has(p.id)) });
  return groups.filter((g) => g.products.length > 0);
}
