/**
 * Data for the light Khavinson learning page.
 *  - The "Read the research" list comes from shared/peppy/research-registry.ts (verbatim titles)
 *    plus one PubMed-verified extra (36979488).
 *  - Products come only from the public catalog and are filtered again with isHiddenProduct.
 *  - No study is linked to a product anywhere on the page.
 */
import { RESEARCH_REGISTRY } from "@shared/peppy/research-registry";
import { isHiddenProduct } from "@shared/hidden-products";
import type { ResearchSource } from "@shared/peppy/types";
import { products as catalog, type Product } from "@/data/products";

/** "Read the research" list (Research, 2026-10-13). Registry titles are verbatim. */
export const RESEARCH_LIST_IDS = ["pmid:34834147", "pmid:31598715", "pmid:35887081"] as const;

type ListedSource = Pick<ResearchSource, "id" | "title" | "pmid" | "url" | "year" | "journal">;

const pubmed = (pmid: string, title: string, year: string, journal: string): ListedSource => ({
  id: `pmid:${pmid}`,
  title,
  pmid,
  url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  year,
  journal,
});

/** Not in the registry; titles copied verbatim from PubMed esummary on 2026-10-13. */
export const EXTRA_RESEARCH: ListedSource[] = [
  pubmed("14977407", "Molecular and integrative physiology of intestinal peptide transport.", "2004", "Annual review of physiology"),
  pubmed("24007794", "Drug transport via the intestinal peptide transporter PepT1.", "2013", "Current opinion in pharmacology"),
  pubmed("16076145", "Identification of food-derived collagen peptides in human blood after oral ingestion of gelatin hydrolysates.", "2005", "Journal of agricultural and food chemistry"),
  pubmed("36979488", "Feasibility of Transport of 26 Biologically Active Ultrashort Peptides via LAT and PEPT Family Transporters.", "2023", "Biomolecules"),
];

/** Display order set by Research. */
export const RESEARCH_LIST_ORDER = ["34834147", "31598715", "14977407", "24007794", "16076145", "35887081", "36979488"];

const REGISTRY_BY_ID = new Map(RESEARCH_REGISTRY.map((s) => [s.id, s]));

/** The research list in display order (registry entries + PubMed-verified extras). */
export function researchList(): ListedSource[] {
  const all = new Map<string, ListedSource>();
  for (const id of RESEARCH_LIST_IDS) {
    const src = REGISTRY_BY_ID.get(id);
    if (!src) throw new Error(`learnData: ${id} missing from registry`);
    all.set(src.pmid!, src);
  }
  for (const e of EXTRA_RESEARCH) all.set(e.pmid!, e);
  return RESEARCH_LIST_ORDER.map((p) => all.get(p)!);
}

// ── Products ────────────────────────────────────────────────────────────────

export type FamilyId = "cytomaxes" | "cytogens" | "revilab" | "prime-peptide";

/** Membership is read from catalog wording (never guessed). */
export function familyOf(p: Pick<Product, "id" | "name" | "description">): FamilyId | null {
  if (/synthesi[sz]ed cytogen/i.test(p.description)) return "cytogens";
  if (/^revilab /i.test(p.name)) return "revilab";
  if (/^prime peptide /i.test(p.name)) return "prime-peptide";
  if (/peptide bioregulator/i.test(p.description) && /\(A-\d+\)/.test(p.description)) return "cytomaxes";
  return null;
}

export interface Family {
  id: FamilyId;
  name: string;
  tagline: string;
  /** Catalog-grounded description. */
  body: string;
  /** Which molecule illustration to show. */
  art: "complex" | "defined" | "blend" | "formula";
}

export const FAMILIES: Family[] = [
  {
    id: "cytomaxes",
    name: "Cytomaxes",
    tagline: "Natural peptide complexes",
    body: "Peptide complexes derived from young animal tissue, each matched to one organ (for example the pineal gland, thymus or blood vessels).",
    art: "complex",
  },
  {
    id: "cytogens",
    name: "Cytogens",
    tagline: "Synthetic short peptides",
    body: "Laboratory-synthesised peptides with a defined amino-acid sequence — the manufacturer describes Cartalax, for example, as the tripeptide Ala-Glu-Asp. Not animal-derived.",
    art: "defined",
  },
  {
    id: "revilab",
    name: "Revilab",
    tagline: "Multi-peptide formulas",
    body: "Formulas that combine several organ peptide complexes with nutrients or botanicals. ML products are capsules; SL products are sublingual.",
    art: "blend",
  },
  {
    id: "prime-peptide",
    name: "Prime Peptide",
    tagline: "Peptide-plus-nutrient formulas",
    body: "Formulas built around named IPH peptides and combined with vitamins, minerals and other nutrients.",
    art: "formula",
  },
];

export function visibleProducts(list: readonly Product[] = catalog): Product[] {
  return list.filter((p) => !isHiddenProduct(p));
}

export function productsInFamily(id: FamilyId, list: readonly Product[] = catalog): Product[] {
  return visibleProducts(list).filter((p) => familyOf(p) === id);
}

/** Lingual/liquid products are pre-order only where the site already flags them; it does not yet. */
export function productHref(id: string): string {
  return `/products/${id}`;
}

// ── Body systems ────────────────────────────────────────────────────────────

export interface BodySystem {
  id: string;
  name: string;
  /** Short, structure/function wording only. */
  summary: string;
  /** Catalog product ids whose own descriptions name this organ/system. */
  productIds: string[];
  /** Position on the body diagram (viewBox 0 0 120 260). */
  dot: { x: number; y: number };
  ask: string;
}

export const BODY_SYSTEMS: BodySystem[] = [
  {
    id: "brain",
    name: "Brain & nervous system",
    summary: "Formulas made to support normal nervous-system function.",
    productIds: ["revilab-sl-02", "revilab-ml-03", "prime-peptide-brain"],
    dot: { x: 50, y: 18 },
    ask: "Which products relate to the brain and nervous system, and how do they differ?",
  },
  {
    id: "pineal",
    name: "Pineal gland & daily rhythm",
    summary: "The pineal gland makes melatonin. These products contain pineal peptide complexes.",
    productIds: ["endoluten", "revilab-sl-03"],
    dot: { x: 60, y: 32 },
    ask: "What are pineal peptide complexes, and which products contain them?",
  },
  {
    id: "immune",
    name: "Immune system (thymus)",
    summary: "The thymus helps T-cells mature. These products contain thymus peptides.",
    productIds: ["vladonix", "crystagen"],
    dot: { x: 60, y: 70 },
    ask: "What is the difference between Vladonix and Crystagen?",
  },
  {
    id: "vascular",
    name: "Heart & blood vessels",
    summary: "Products with vascular-wall or heart-muscle peptide complexes.",
    productIds: ["ventfort", "vesugen", "chelohart", "revilab-ml-04", "revilab-sl-01"],
    dot: { x: 52, y: 84 },
    ask: "Which products relate to the heart and blood vessels, and how do they differ?",
  },
  {
    id: "eyes",
    name: "Eyes & retina",
    summary: "Products with retina peptide complexes.",
    productIds: ["visoluten", "revilab-sl-02", "revilab-ml-03"],
    dot: { x: 70, y: 20 },
    ask: "Which products contain retina peptide complexes?",
  },
  {
    id: "joints",
    name: "Joints, cartilage & bone",
    summary: "Products with cartilage peptides.",
    productIds: ["cartalax", "revilab-sl-04", "revilab-ml-09", "prime-peptide-joints"],
    dot: { x: 46, y: 160 },
    ask: "Which products relate to joints, cartilage and bone, and how do they differ?",
  },
];

/** Products for a system, hidden products always removed. */
export function productsForSystem(sys: BodySystem, list: readonly Product[] = catalog): Product[] {
  const visible = visibleProducts(list);
  return sys.productIds
    .map((id) => visible.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
}
