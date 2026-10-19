/**
 * Body-system category pages (/products/system/<slug>) and the Khavinson
 * Peptides List (/khavinson-peptides-list). Brief: seo-audit/brief-list-and-category-pages.md;
 * copy: content/categoryCopy.ts.
 *
 * Membership and complex codes come from the brief's mapping, which was taken
 * from each product's OWN meta description (shared/product-facts.json). Nothing
 * here adds a claim: pages show the product's existing name and its existing
 * short (meta) description only.
 *
 * Hidden products (shared/hidden-products.ts) and products on hold are never
 * shown; resolve membership through `systemProducts()` against the storefront
 * catalog, which already drops hidden ids.
 */
import type { Product } from "@/data/products";
import { CATEGORY_COPY, type PageCopy } from "@/content/categoryCopy";

/**
 * THE ONE SWITCH. false = every new page renders `noindex`, stays out of
 * sitemap.xml, and product BreadcrumbList stays Home > Shop > Product.
 * Flip to true only after Julia approves the copy (content/categoryCopy.ts)
 * and the placement; that one change adds all 13 URLs to the sitemap and drops noindex.
 */
export const CATEGORY_PAGES_LIVE = true;

export const LIST_PAGE_PATH = "/khavinson-peptides-list";

/**
 * Products held back from these pages even if they are not in the hidden list:
 * identity / formulation on hold in product-facts (Indosine, Calsil-T), plus the
 * explicitly excluded Olecap / Panaxod (already hidden; listed for safety).
 */
export const CATEGORY_EXCLUDED_IDS: ReadonlySet<string> = new Set(["indosine", "calsil-t", "olecap", "panaxod"]); // all four are also in HIDDEN_PRODUCT_IDS

/**
 * Existing copy flagged for Editorial ("weight-management routines"): the card
 * on category pages shows no description for these until the copy is revised.
 */
export const DESCRIPTION_SUPPRESSED_IDS: ReadonlySet<string> = new Set(["volustom", "reviform-cocktail"]);

export type SystemSlug =
  | "brain-nervous-system"
  | "immune-thymus"
  | "heart-blood-vessels"
  | "liver-digestive"
  | "kidney-bladder"
  | "lungs-airways"
  | "joints-bones-cartilage"
  | "muscle"
  | "endocrine-glands"
  | "blood-bone-marrow"
  | "womens-health"
  | "mens-health";

export type BodySystem = {
  slug: SystemSlug;
  name: string;
  /** "support normal … function" wording for the meta description. */
  supports: string;
  /** Khavinson Cytomax / Cytogen (and AA) products with the code from their own meta. */
  bioregulators: Array<{ id: string; code: string }>;
  /** Complexes and supplements whose own description names this system. */
  others: string[];
};

export const BODY_SYSTEMS: BodySystem[] = [
  {
    slug: "brain-nervous-system",
    name: "Brain & Nervous System",
    supports: "support normal brain and nervous-system function",
    bioregulators: [{ id: "cerluten", code: "A-5" }, { id: "pinealon", code: "AC-5" }],
    others: ["prime-peptide-brain", "revilab-ml-01", "revilab-ml-03", "revilab-sl-02", "felicita", "mesotel", "mesotel-neo", "ensil"],
  },
  {
    slug: "immune-thymus",
    name: "Immune & Thymus",
    supports: "support normal immune and thymus function",
    bioregulators: [{ id: "vladonix", code: "A-6" }, { id: "crystagen", code: "AC-6" }],
    others: ["prime-peptide-omega", "revilab-ml-02", "revilab-sl-07", "imusil", "revifort", "zinsil-t", "reviplant"],
  },
  {
    slug: "heart-blood-vessels",
    name: "Heart & Blood Vessels",
    supports: "support normal heart and blood-vessel function",
    bioregulators: [{ id: "chelohart", code: "A-14" }, { id: "ventfort", code: "A-3" }, { id: "vesugen", code: "AC-2" }],
    others: ["revilab-ml-04", "revilab-sl-01", "complex-3r"],
  },
  {
    slug: "liver-digestive",
    name: "Liver, Stomach & Digestion",
    supports: "support normal liver and digestive function",
    bioregulators: [
      { id: "svetinorm", code: "A-7" },
      { id: "ovagen", code: "AC-3" },
      { id: "stamakort", code: "A-10" },
      { id: "suprefort", code: "A-1" },
    ],
    others: ["revilab-ml-06", "revilab-sl-05", "likam", "pangluin", "digemax", "getrufline", "volustom"],
  },
  {
    slug: "kidney-bladder",
    name: "Kidney & Bladder",
    supports: "support normal kidney and bladder function",
    bioregulators: [{ id: "pielotax", code: "A-9" }, { id: "chitomur", code: "A-12" }],
    others: ["revilab-sl-08", "renefort"],
  },
  {
    slug: "lungs-airways",
    name: "Lungs & Airways",
    supports: "support normal lung and airway function",
    bioregulators: [{ id: "taxorest", code: "A-19" }, { id: "chonluten", code: "AC-7" }],
    others: ["revilab-ml-05", "revilab-sl-06", "alvenorm-forte", "rinolax"],
  },
  {
    slug: "joints-bones-cartilage",
    name: "Joints, Bones & Cartilage",
    supports: "support normal joint, bone and cartilage function",
    bioregulators: [{ id: "sigumir", code: "A-4" }, { id: "cartalax", code: "AC-4" }, { id: "bonothyrk", code: "A-21" }],
    // Calsil-T is in the brief but on hold (identity unconfirmed): excluded.
    others: ["prime-peptide-joints", "revilab-ml-09", "revilab-sl-04"],
  },
  {
    slug: "muscle",
    name: "Muscle & Physical Performance",
    supports: "support normal muscle function",
    bioregulators: [{ id: "gotratix", code: "A-18" }],
    others: ["revilab-sl-04", "levain", "reviform-cocktail"],
  },
  {
    // Was "Thyroid & Adrenal"; renamed with Bonothyrk cross-listed (Julia, 2026-10-19; copy's Endocrine option).
    slug: "endocrine-glands",
    name: "Endocrine Glands",
    supports: "support normal thyroid, adrenal and parathyroid function",
    bioregulators: [{ id: "thyreogen", code: "A-2" }, { id: "glandokort", code: "A-17" }, { id: "bonothyrk", code: "A-21" }],
    others: [],
  },
  {
    slug: "blood-bone-marrow",
    name: "Blood & Bone Marrow",
    supports: "support normal blood and bone-marrow function",
    bioregulators: [{ id: "bonomarlot", code: "A-20" }],
    others: ["revilab-ml-02", "revilab-sl-07", "revimite"],
  },
  {
    slug: "womens-health",
    name: "Women's Hormonal Balance",
    supports: "support women's normal hormonal balance",
    bioregulators: [{ id: "zhenoluten", code: "A-15" }],
    others: ["gpl-femme", "mamiton", "revilab-ml-08", "revilab-sl-10"],
  },
  {
    slug: "mens-health",
    name: "Men's Reproductive Wellness",
    supports: "support normal male reproductive function",
    bioregulators: [{ id: "testoluten", code: "A-13" }, { id: "libidon", code: "A-16" }],
    others: ["gpl-man", "revilab-ml-07", "revilab-sl-09"],
  },
];

/**
 * On the list page only (no system page). Pineal and Eyes pages were dropped
 * (SEO Director, 2026-10-19), so their products are listed here. Panaxod is
 * hidden and Indosine is on hold, so neither appears.
 */
export const LIST_ONLY_GROUPS: Array<{ name: string; ids: string[] }> = [
  { name: "Pineal & Daily Rhythms", ids: ["endoluten", "prime-peptide-protect", "revilab-sl-03"] },
  { name: "Eyes & Vision", ids: ["visoluten", "pinalex-tab", "retisil", "revilab-ml-03"] },
  {
  name: "Skin, Energy & General",
  ids: [
    "prime-peptide-collagen",
    "mesotel-beauty",
    "revilab-anti-age",
    "anti-wrinkle-serum-7",
    "anti-age-nb-activity",
    "anti-age-nb-health",
    "complex-3d",
    "revilab-pro-elements",
  ],
  },
];

/** Codes for list-only products, from their own meta descriptions. */
export const LIST_ONLY_CODES: Record<string, string> = {
  endoluten: "A-8",
  visoluten: "A-11",
  "pinalex-tab": "AA-6",
  "anti-age-nb-activity": "AA-9, AA-3",
  "anti-age-nb-health": "AA-3, AA-1",
};

export function systemPath(slug: string): string {
  return `/products/system/${slug}`;
}

export const CATEGORY_ROUTES: string[] = [LIST_PAGE_PATH, ...BODY_SYSTEMS.map((s) => systemPath(s.slug))];

export function getBodySystem(slug: string | null | undefined): BodySystem | undefined {
  return BODY_SYSTEMS.find((s) => s.slug === slug);
}


type Sellable = Pick<Product, "id" | "priceUSD">;

function sellable<T extends Sellable>(p: T | undefined): p is T {
  return !!p && !CATEGORY_EXCLUDED_IDS.has(p.id) && typeof p.priceUSD === "number" && p.priceUSD > 0;
}

/**
 * Products on a system page, bioregulators first, from the given storefront
 * catalog (already without hidden products). Unknown / hidden / held ids drop out.
 */
export function systemProducts<T extends Sellable>(system: BodySystem, catalog: readonly T[]): T[] {
  const byId = new Map(catalog.map((p) => [p.id, p] as const));
  const ids = [...system.bioregulators.map((b) => b.id), ...system.others];
  return Array.from(new Set(ids)).map((id) => byId.get(id)).filter(sellable);
}

/** Code for a product on a given page (bioregulators only). */
export function codeFor(id: string, system?: BodySystem): string | undefined {
  if (system) return system.bioregulators.find((b) => b.id === id)?.code;
  for (const s of BODY_SYSTEMS) {
    const hit = s.bioregulators.find((b) => b.id === id);
    if (hit) return hit.code;
  }
  return LIST_ONLY_CODES[id];
}

/** Systems a product belongs to; the first is its primary (bioregulator membership wins). */
export function systemsForProduct(id: string): BodySystem[] {
  if (CATEGORY_EXCLUDED_IDS.has(id)) return [];
  const primary = BODY_SYSTEMS.filter((s) => s.bioregulators.some((b) => b.id === id));
  const rest = BODY_SYSTEMS.filter((s) => !primary.includes(s) && s.others.includes(id));
  return [...primary, ...rest];
}

/** List-page groups (each system, then the list-only group), sold products only. */
export function listPageGroups<T extends Sellable>(catalog: readonly T[]) {
  const groups = BODY_SYSTEMS.map((s) => ({ name: s.name, slug: s.slug as string | undefined, system: s as BodySystem | undefined, products: systemProducts(s, catalog) }));
  const byId = new Map(catalog.map((p) => [p.id, p] as const));
  for (const g of LIST_ONLY_GROUPS) {
    groups.push({ name: g.name, slug: undefined, system: undefined, products: g.ids.map((id) => byId.get(id)).filter(sellable) });
  }
  return groups.filter((g) => g.products.length > 0);
}


/** Editorial copy for a category route (title, meta, H1, intro). */
export function copyFor(path: string): PageCopy {
  const c = CATEGORY_COPY[path];
  if (!c) throw new Error(`No category copy for ${path}`);
  return c;
}
