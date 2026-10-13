/**
 * Data for the interactive Khavinson learning experience.
 *
 * Sourcing rules (Research Director can audit every line here):
 *  - Studies come ONLY from shared/peppy/research-registry.ts (verbatim titles, PubMed URLs).
 *    `tested` / `population` are restatements of that registry entry's `finding` text.
 *  - Products come ONLY from the public catalog (client/src/data/products.ts, already filtered
 *    by shared/hidden-products.ts) and are filtered again with isHiddenProduct.
 *  - Each body system says which peptide/preparation a study used, and that a study of one
 *    peptide or formulation does not show that a different product works.
 */
import { RESEARCH_REGISTRY } from "@shared/peppy/research-registry";
import { isHiddenProduct } from "@shared/hidden-products";
import type { ResearchSource } from "@shared/peppy/types";
import { products as catalog, type Product } from "@/data/products";

export type EvidenceLevel = "cell" | "animal" | "human" | "review" | "insufficient";

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  cell: "Cell / lab study",
  animal: "Animal study",
  human: "Human study",
  review: "Review of research",
  insufficient: "Insufficient evidence",
};

export function evidenceFor(src: Pick<ResearchSource, "studyType">): EvidenceLevel {
  switch (src.studyType) {
    case "in-vitro":
      return "cell";
    case "animal":
      return "animal";
    case "rct":
    case "clinical":
      return "human";
    case "review":
    case "systematic-review":
      return "review";
    default:
      return "insufficient";
  }
}

export const STUDY_TYPE_LABEL: Record<string, string> = {
  "in-vitro": "Laboratory (cell or molecular) study",
  animal: "Animal study",
  clinical: "Human clinical study",
  rct: "Human randomised study",
  review: "Narrative review",
  "systematic-review": "Systematic review",
  guidance: "Health-authority guidance",
};

export interface LearnStudy {
  source: ResearchSource;
  /** What was given / examined (from the registry finding). */
  tested: string;
  /** Who or what was studied (from the registry finding/limitation). */
  population: string;
}

/** Extra plain-English fields per registry id. Restated from the registry entry only. */
const STUDY_NOTES: Record<string, { tested: string; population: string }> = {
  "pmid:34834147": { tested: "Published work on 2–7 amino-acid peptides and gene expression", population: "Cell, animal and some human studies (review)" },
  "pmid:19830585": { tested: "Peptide preparations from the Khavinson–Anisimov program", population: "Rodents (lifespan) plus reported clinical use (review)" },
  "pmid:12374906": { tested: "Tissue-extract peptides such as Epithalamin", population: "Cell, animal and early clinical work (review)" },
  "pmid:24003726": { tested: "Injectable peptide drugs (Thymalin, Epithalamin, Cortexin, Retinalamin and others)", population: "The group's clinical studies (review)" },
  "pmid:14523363": { tested: "Injectable Thymalin and/or Epithalamin", population: "266 older adults followed 6–8 years" },
  "pmid:31598715": { tested: "Dipeptides modelled against DNA sequences", population: "Computer (docking) model — no cells or people" },
  "pmid:35887081": { tested: "How di- and tripeptides cross into cells via PEPT1/PEPT2 and LAT carriers", population: "Mechanistic review" },
  "pmid:11524632": { tested: "Synthetic Epitalon (AEDG tetrapeptide), injected", population: "A small number of old rhesus monkeys" },
  "pmid:17969590": { tested: "Pineal peptide preparations (Epithalamin, Epitalon)", population: "Old monkeys and older adults (small study)" },
  "pmid:29124531": { tested: "Mass spectrometry of the pineal polypeptide complex", population: "Chemical analysis — no people" },
  "pmid:9701766": { tested: "Pineal extract Epithalamin", population: "Fruit flies, mice and rats" },
  "pmid:35408963": { tested: "Five Khavinson peptides including Epitalon and Thymalin", population: "Human immune (THP-1) cell line" },
  "pmid:37686182": { tested: "KE and EW dipeptides found in Thymalin", population: "Computer modelling and cell work" },
  "pmid:33237528": { tested: "Thymalin", population: "Human blood stem cells in culture" },
  "pmid:33396470": { tested: "EDR peptide (Pinealon)", population: "Cell and animal work, limited reports in older adults (review)" },
  "pmid:39518916": { tested: "EDR, KED and AEDG peptides", population: "Neurons made from older donors' skin cells" },
  "pmid:21978084": { tested: "Pinealon", population: "Several cell types in culture" },
  "pmid:30859383": { tested: "Peptide 'retinoprotectors'", population: "Mechanistic review" },
  "pmid:36611900": { tested: "Where vascular peptides might act on age-related inflammation", population: "Heart and vessel cells (mechanistic review)" },
  "pmid:25408528": { tested: "Two short vascular peptides", population: "Ageing vascular cell cultures" },
  "pmid:27383168": { tested: "A vascular peptide preparation", population: "Old rats" },
  "pmid:32399807": { tested: "AED, KED and KE peptides", population: "Human bone-marrow stem cells in culture" },
  "pmid:18306703": { tested: "A cartilage extract and the T-31 (AED) peptide", population: "Rats after ovary removal" },
};

const REGISTRY_BY_ID = new Map(RESEARCH_REGISTRY.map((s) => [s.id, s]));

export function learnStudy(id: string): LearnStudy {
  const source = REGISTRY_BY_ID.get(id);
  const notes = STUDY_NOTES[id];
  if (!source || !notes) throw new Error(`learnData: unknown study ${id}`);
  return { source, ...notes };
}

/** Studies cited in the "deeper science" layer and the study library. */
export const FOUNDATION_STUDY_IDS = [
  "pmid:34834147",
  "pmid:31598715",
  "pmid:35887081",
  "pmid:29124531",
  "pmid:19830585",
  "pmid:12374906",
  "pmid:24003726",
  "pmid:14523363",
  "pmid:9701766",
];

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
    body: "Peptide complexes extracted from animal organs and tissues, each matched to one organ (for example the pineal gland, thymus or blood vessels).",
    art: "complex",
  },
  {
    id: "cytogens",
    name: "Cytogens",
    tagline: "Synthetic short peptides",
    body: "Laboratory-synthesised peptides with a defined amino-acid sequence — for example Cartalax, the tripeptide Ala-Glu-Asp. Not animal-derived.",
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
  studyIds: string[];
  /** What the cited studies actually used, and the caveat. */
  studiedNote: string;
  /** Position on the body diagram (viewBox 0 0 120 260). */
  dot: { x: number; y: number };
  ask: string;
}

export const BODY_SYSTEMS: BodySystem[] = [
  {
    id: "brain",
    name: "Brain & nervous system",
    summary: "Products formulated to support normal nervous-system function.",
    productIds: ["revilab-sl-02", "revilab-ml-03", "prime-peptide-brain"],
    studyIds: ["pmid:33396470", "pmid:39518916", "pmid:21978084"],
    studiedNote: "These studies used the EDR peptide (Pinealon) and related short peptides in cells and animals. Pinealon is not one of the products listed here, and these results do not show that any listed product works.",
    dot: { x: 50, y: 18 },
    ask: "What does the research on the EDR peptide (Pinealon) actually show, and what doesn't it show?",
  },
  {
    id: "pineal",
    name: "Pineal gland & daily rhythm",
    summary: "The pineal gland makes melatonin. These products contain pineal peptide complexes.",
    productIds: ["endoluten", "revilab-sl-03"],
    studyIds: ["pmid:29124531", "pmid:11524632", "pmid:17969590"],
    studiedNote: "Studies used Epitalon (the synthetic AEDG peptide) or injectable pineal extracts. AEDG was detected in the pineal polypeptide complex, but that is a chemistry finding — it does not show that Endoluten has the effects seen with Epitalon.",
    dot: { x: 60, y: 32 },
    ask: "How is Epitalon research related to pineal peptide complexes like Endoluten, and where are the limits?",
  },
  {
    id: "immune",
    name: "Immune system (thymus)",
    summary: "The thymus helps T-cells mature. These products contain thymus peptides.",
    productIds: ["vladonix", "crystagen"],
    studyIds: ["pmid:33237528", "pmid:35408963"],
    studiedNote: "These are laboratory studies of Thymalin and other Khavinson peptides in human cells. Thymalin is an injectable drug, not one of these capsules.",
    dot: { x: 60, y: 70 },
    ask: "What has been shown in lab studies of thymus peptides like Thymalin, and how does that relate to Vladonix and Crystagen?",
  },
  {
    id: "vascular",
    name: "Heart & blood vessels",
    summary: "Products with vascular-wall or heart-muscle peptide complexes.",
    productIds: ["ventfort", "vesugen", "chelohart", "revilab-ml-04", "revilab-sl-01"],
    studyIds: ["pmid:25408528", "pmid:27383168", "pmid:36611900"],
    studiedNote: "Results come from vascular cell cultures and old rats given a vascular peptide preparation that differs from any finished supplement.",
    dot: { x: 52, y: 84 },
    ask: "What do cell and animal studies of vascular peptides show, and what don't they tell us about supplements?",
  },
  {
    id: "eyes",
    name: "Eyes & retina",
    summary: "Products with retina peptide complexes.",
    productIds: ["visoluten", "revilab-sl-02", "revilab-ml-03"],
    studyIds: ["pmid:30859383"],
    studiedNote: "Only a short mechanistic review is cited here, so the evidence for these products specifically is insufficient.",
    dot: { x: 70, y: 20 },
    ask: "How are retina peptides proposed to work, and how strong is the evidence?",
  },
  {
    id: "joints",
    name: "Joints, cartilage & bone",
    summary: "Products with cartilage peptides, including the AED tripeptide.",
    productIds: ["cartalax", "revilab-sl-04", "revilab-ml-09", "prime-peptide-joints"],
    studyIds: ["pmid:32399807", "pmid:18306703"],
    studiedNote: "The AED peptide (the sequence in Cartalax) was studied in stem-cell cultures and in rats. No human joint or bone outcomes are cited.",
    dot: { x: 46, y: 160 },
    ask: "What has the AED (Cartalax) peptide been tested in so far?",
  },
];

/** Products for a system, hidden products always removed. */
export function productsForSystem(sys: BodySystem, list: readonly Product[] = catalog): Product[] {
  const visible = visibleProducts(list);
  return sys.productIds
    .map((id) => visible.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
}
