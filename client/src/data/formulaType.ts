/**
 * PROPOSAL (not live): "Focused Formula" vs "Combination Formula" type, and the
 * "Compare Related Formulas" counterparts.
 *
 *  - Focused Formula     = Khavinson Cytomax® / Cytogen® products (one peptide or peptide complex).
 *                          Derived from the collection tags in productTags.ts.
 *  - Combination Formula = Revilab ML 01–09, Revilab SL 01–10 and the Prime Peptide line.
 *
 * PREVIEW GATE: only /products and the Bonomarlot product page show any of this
 * (FORMULA_PREVIEW_PDP_IDS). Every other page renders exactly as on main.
 *
 * LABEL WORDING RULE. The repo has no photographed labels or Supplement Facts
 * panels; the label-derived source we use is `composition` in
 * shared/product-facts.json (taken from the manufacturer's official product pages,
 * and shown on our PDPs under "Active Ingredients"). A pair is mapped only when
 * BOTH composition strings use the identical words for the complex (ignoring
 * the A-/AC-/AA- code and any parenthetical amino-acid note), and the blend's
 * PDP shows that composition. formulaType.test.ts enforces both.
 * Pairs whose words differ (Epiphysis vs Pineal gland, Vascular vs Vascular wall,
 * Heart vs Cardiac muscle, Bronchial vs Bronchi, Testicular vs Testes) are in
 * FLAGGED_PAIRS and get no compare line.
 *
 * Codes differ between lines (Cytomax A-20 vs Revilab AA-4), so the copy says
 * both "contain a bone marrow peptide complex" and never says it is the identical complex.
 *
 * Read from code by product id; Firestore product docs are not involved.
 */
import { isHiddenProduct } from "@shared/hidden-products";
import { PRODUCT_FACTS } from "@shared/product-facts";
import { tagsFor } from "./productTags";
import { BONOMARLOT_BROCHURE_DIRECTIONS, type DirectionsSource } from "./formulaPreviewContent";

export type FormulaType = "focused" | "combination";

export const FORMULA_TYPE_LABEL: Record<FormulaType, string> = {
  focused: "Focused Formula",
  combination: "Combination Formula",
};

export const FORMULA_TYPE_FILTERS: ReadonlyArray<{ value: "all" | FormulaType; label: string }> = [
  { value: "all", label: "All" },
  { value: "focused", label: "Focused Formula" },
  { value: "combination", label: "Combination Formula" },
];

/** Anchor of the "Understanding the Formulas" panel on /products. */
export const FORMULA_EXPLAINER_ID = "understanding-the-formulas";
export const FORMULA_EXPLAINER_HREF = `/products#${FORMULA_EXPLAINER_ID}`;

/** Product pages that show the new treatment. Everything else is unchanged. */
export const FORMULA_PREVIEW_PDP_IDS: ReadonlySet<string> = new Set(["bonomarlot"]);
export function isFormulaPreviewPdp(id: string): boolean {
  return FORMULA_PREVIEW_PDP_IDS.has(id);
}

const FOCUSED_COLLECTIONS = ["collection:khavinson-cytomaxes", "collection:khavinson-cytogens"];

/** Prime Peptide wording is on hold: tag only, no other new copy. */
export function isPrimePeptide(id: string): boolean {
  return tagsFor(id).includes("collection:prime-peptide");
}

export function formulaTypeFor(id: string): FormulaType | undefined {
  if (isHiddenProduct({ id })) return undefined;
  const tags = tagsFor(id);
  if (FOCUSED_COLLECTIONS.some((c) => tags.includes(c))) return "focused";
  if (/^revilab-(ml|sl)-\d{2}$/.test(id) || isPrimePeptide(id)) return "combination";
  return undefined;
}

export type FormulaLine = "Cytomax" | "Cytogen" | "Revilab ML" | "Revilab SL" | "Prime Peptide";

/** Product line shown after the tag, from the same collection tags / ids. */
export function formulaLineFor(id: string): FormulaLine | undefined {
  if (!formulaTypeFor(id)) return undefined;
  const tags = tagsFor(id);
  if (tags.includes("collection:khavinson-cytomaxes")) return "Cytomax";
  if (tags.includes("collection:khavinson-cytogens")) return "Cytogen";
  if (id.startsWith("revilab-ml-")) return "Revilab ML";
  if (id.startsWith("revilab-sl-")) return "Revilab SL";
  if (isPrimePeptide(id)) return "Prime Peptide";
  return undefined;
}

/** "Focused Formula · Cytomax" etc. (visible text; the tag adds the "Formula type: " prefix for screen readers). */
export function formulaTagText(id: string): string | undefined {
  const type = formulaTypeFor(id);
  const line = formulaLineFor(id);
  return type && line ? `${FORMULA_TYPE_LABEL[type]} · ${line}` : undefined;
}

/** Composition string minus its code and parenthetical note: "Liver peptide complex A-7 (natural extract)" → "liver peptide complex". */
export function labelPhrase(composition: string): string {
  return composition
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+\(?A{1,2}C?-\d+\)?\s*$/, "")
    .trim()
    .toLowerCase();
}

export interface SharedComplex {
  /** Exact label words (lower-case), used verbatim in the copy, e.g. "bone marrow peptide complex". */
  label: string;
  /** Focused Formula(s) → exact composition string in shared/product-facts.json. */
  focused: Record<string, string>;
  /** Combination Formula(s) → exact composition string in shared/product-facts.json. */
  combination: Record<string, string>;
}

export const SHARED_COMPLEXES: SharedComplex[] = [
  {
    label: "bone marrow peptide complex",
    focused: { bonomarlot: "Bone marrow peptide complex (A-20)" },
    combination: {
      "revilab-ml-02": "Bone marrow peptide complex (AA-4)",
      "revilab-sl-07": "Bone marrow peptide complex (AA-4)",
    },
  },
  {
    label: "liver peptide complex",
    focused: { svetinorm: "Liver peptide complex A-7 (natural extract)" },
    combination: {
      "revilab-ml-01": "Liver peptide complex (AA-10)",
      "revilab-ml-02": "Liver peptide complex (AA-10)",
      "revilab-ml-06": "Liver peptide complex (AA-10)",
      "revilab-sl-05": "Liver peptide complex (AA-10)",
    },
  },
  {
    label: "pineal gland peptide complex",
    focused: { endoluten: "Pineal gland peptide complex (A-8)" },
    combination: { "revilab-sl-09": "Pineal gland peptide complex (AA-1)" },
  },
  {
    label: "brain peptide complex",
    focused: {
      cerluten: "Brain peptide complex A-5 (natural extract)",
      pinealon: "Brain peptide complex AC-5 (arginine, glutamic acid, aspartic acid)",
    },
    combination: {
      "revilab-ml-03": "Brain peptide complex (AA-5)",
      "revilab-sl-02": "Brain peptide complex (AA-5)",
    },
  },
  {
    label: "heart muscle peptide complex",
    focused: { chelohart: "Heart muscle peptide complex (A-14)" },
    combination: { "revilab-ml-04": "Heart muscle peptide complex (AA-8)" },
  },
  {
    label: "cartilage peptide complex",
    focused: { cartalax: "Cartilage peptide complex AC-4 (Ala-Glu-Asp / AED tripeptide)" },
    combination: {
      "revilab-ml-09": "Cartilage peptide complex (AA-9)",
      "revilab-sl-04": "Cartilage peptide complex (AA-9)",
    },
  },
  {
    label: "muscle peptide complex",
    focused: { gotratix: "Muscle peptide complex (A-18)" },
    combination: { "revilab-sl-04": "Muscle peptide complex (AA-17)" },
  },
  {
    label: "pancreas peptide complex",
    focused: { suprefort: "Pancreas peptide complex A-1 (natural extract)" },
    combination: {
      "revilab-ml-06": "Pancreas peptide complex (AA-11)",
      "revilab-sl-05": "Pancreas peptide complex (AA-11)",
    },
  },
  {
    label: "bladder peptide complex",
    focused: { chitomur: "Bladder peptide complex A-12 (natural extract)" },
    combination: {
      "revilab-sl-08": "Bladder peptide complex (AA-13)",
      "revilab-sl-09": "Bladder peptide complex (AA-13)",
    },
  },
  {
    label: "prostate peptide complex",
    focused: { libidon: "Prostate peptide complex A-16 (natural extract)" },
    combination: { "revilab-sl-09": "Prostate peptide complex (AA-16)" },
  },
];

/** Same tissue, but the label words differ or the combination's PDP doesn't show its composition: no compare line. */
export const FLAGGED_PAIRS: ReadonlyArray<{ focused: string; combination: string; focusedLabel: string; combinationLabel: string; reason: string }> = [
  ...["revilab-ml-01", "revilab-ml-04", "revilab-ml-07", "revilab-ml-08"].map((combination) => ({
    focused: "endoluten", combination, focusedLabel: "Pineal gland peptide complex (A-8)", combinationLabel: "Epiphysis peptide complex (AA-1)",
    reason: "label words differ (Pineal gland vs Epiphysis)",
  })),
  ...["revilab-sl-03", "revilab-sl-10"].map((combination) => ({
    focused: "endoluten", combination, focusedLabel: "Pineal gland peptide complex (A-8)", combinationLabel: "Pineal gland peptide complex (AA-1)",
    reason: "words match, but the combination's PDP shows \"See the full ingredient list on your package.\" instead of its composition",
  })),
  ...["ventfort", "vesugen"].flatMap((focused) =>
    ["revilab-ml-03", "revilab-ml-04", "revilab-ml-07", "revilab-ml-08", "revilab-ml-09", "revilab-sl-01", "revilab-sl-02", "revilab-sl-07", "revilab-sl-08", "revilab-sl-10"].map((combination) => ({
      focused, combination,
      focusedLabel: focused === "ventfort" ? "Vascular peptide complex (A-3)" : "Vascular peptide complex (AC-2)",
      combinationLabel: "Vascular wall peptide complex (AA-7)",
      reason: "label words differ (Vascular vs Vascular wall)",
    })),
  ),
  { focused: "chelohart", combination: "revilab-sl-01", focusedLabel: "Heart muscle peptide complex (A-14)", combinationLabel: "Cardiac muscle peptide complex (AA-8)", reason: "label words differ (Heart muscle vs Cardiac muscle)" },
  { focused: "cartalax", combination: "revilab-ml-08", focusedLabel: "Cartilage peptide complex AC-4 (Ala-Glu-Asp / AED tripeptide)", combinationLabel: "Cartilage peptide complex (AA-9)", reason: "words match, but the combination's PDP shows \"See the full ingredient list on your package.\"" },
  ...["revilab-ml-05", "revilab-sl-06"].map((combination) => ({
    focused: "taxorest", combination, focusedLabel: "Bronchial peptide complex A-19 (natural extract)", combinationLabel: "Bronchi peptide complex (AA-14)",
    reason: "label words differ (Bronchial vs Bronchi)",
  })),
  ...["revilab-ml-07", "revilab-sl-09"].map((combination) => ({
    focused: "testoluten", combination, focusedLabel: "Testicular peptide complex (A-13)", combinationLabel: "Testes peptide complex (AA-12)",
    reason: "label words differ (Testicular vs Testes)",
  })),
  ...["revilab-ml-07", "revilab-ml-08", "revilab-sl-10"].map((combination) => ({
    focused: "chitomur", combination, focusedLabel: "Bladder peptide complex A-12 (natural extract)", combinationLabel: "Bladder peptide complex (AA-13)",
    reason: "words match, but the combination's PDP shows \"See the full ingredient list on your package.\"",
  })),
];

/** Focused Formulas with no label-supported counterpart at all (tissue unclear or no Revilab equivalent). */
export const NEEDS_CONFIRMATION: Record<string, string> = {
  vladonix: "Thymus peptide complex (A-6); Revilab lists \"T-link / T-cell immune peptide complex (AA-2)\" and never says thymus.",
  crystagen: "Thymus peptide complex (AC-6); same AA-2 question as Vladonix.",
  sigumir: "\"Cartilage and bone peptide complex A-4\" vs Revilab \"Cartilage peptide complex (AA-9)\".",
  stamakort: "\"Stomach peptide complex A-10\" vs Revilab \"Lungs and stomach wall peptide complex (AA-15)\".",
  visoluten: "\"Eye tissue peptide complex (A-11)\" vs Revilab \"Retina peptide complex (AA-6)\".",
  chonluten: "\"Respiratory peptide complex AC-7\" vs Revilab \"Bronchi (AA-14)\" / \"Lungs and stomach wall (AA-15)\".",
  ovagen: "\"Peptide complex AC-3\": no tissue named.",
  taxorest: "Only Bronchial vs Bronchi pairs (flagged).",
  testoluten: "Only Testicular vs Testes pairs (flagged).",
  ventfort: "Only Vascular vs Vascular wall pairs (flagged).",
  vesugen: "Only Vascular vs Vascular wall pairs (flagged).",
};

export interface Counterpart {
  id: string;
  /** Exact label words for the shared complex. */
  complex: string;
}

/** Counterparts of the other type that share a peptide complex (catalog order). */
export function counterpartsFor(id: string): Counterpart[] {
  if (isHiddenProduct({ id }) || isPrimePeptide(id)) return [];
  const type = formulaTypeFor(id);
  if (!type) return [];
  const out: Counterpart[] = [];
  for (const c of SHARED_COMPLEXES) {
    const [mine, theirs] = type === "focused" ? [c.focused, c.combination] : [c.combination, c.focused];
    if (!(id in mine)) continue;
    for (const other of Object.keys(theirs)) {
      if (!isHiddenProduct({ id: other }) && !out.some((o) => o.id === other)) out.push({ id: other, complex: c.label });
    }
  }
  return out;
}

/** One column of the side-by-side: the product's own composition strings, verbatim. */
export interface CompareColumn {
  id: string;
  tag: string;
  /** Composition strings of this product that share a label phrase with the other side. */
  shared: string[];
  /** The rest of this product's composition, in catalog order. */
  other: string[];
  /** Verified per-ingredient amounts. None exist in the repo yet, so always undefined ("Not listed"). */
  quantities?: string;
  /** Verified manufacturer directions (product-facts status "verified"), else a quoted brochure source, else undefined. */
  directions?: string;
}

/** Directions from sources other than product-facts (plain-text attribution, never a link). */
const OTHER_DIRECTIONS: Record<string, DirectionsSource> = { bonomarlot: BONOMARLOT_BROCHURE_DIRECTIONS };

export function verifiedDirectionsFor(id: string): string | undefined {
  const md = PRODUCT_FACTS[id]?.manufacturerDirections;
  if (md?.status === "verified" && md.text) return md.text;
  const other = OTHER_DIRECTIONS[id];
  return other ? `${other.text} ${other.short}` : undefined;
}

function compositionOf(id: string): string[] {
  return PRODUCT_FACTS[id]?.composition ?? [];
}

/**
 * Side-by-side data for "Compare Related Formulas": the current product first, then
 * its counterparts. Works both ways (Focused → Combination, Combination → Focused).
 * Shared strings are matched by exact label phrase, so nothing is inferred.
 */
export function compareColumns(id: string): CompareColumn[] {
  const counterparts = counterpartsFor(id);
  if (counterparts.length === 0) return [];
  const column = (pid: string, sharedPhrases: Set<string>): CompareColumn => {
    const comp = compositionOf(pid);
    return {
      id: pid,
      tag: formulaTagText(pid) ?? "",
      shared: comp.filter((c) => sharedPhrases.has(labelPhrase(c))),
      other: comp.filter((c) => !sharedPhrases.has(labelPhrase(c))),
      quantities: undefined,
      directions: verifiedDirectionsFor(pid),
    };
  };
  const selfPhrases = new Set(counterparts.map((c) => c.complex));
  return [
    column(id, selfPhrases),
    ...counterparts.map((c) =>
      column(c.id, new Set(counterparts.filter((x) => x.id === c.id).map((x) => x.complex))),
    ),
  ];
}

// ── Copy (proposal; for counsel review) ─────────────────────────────────────
export const COMPARE_HEADING = "Compare Related Formulas";
export const COMPARE_INTRO = "These formulas list a peptide complex with the same name in their composition.";
export const COMPARE_BUTTON_OPEN = "See how they compare";
export const COMPARE_BUTTON_CLOSE = "Hide comparison";
export const COMPARE_ROW_LABELS = {
  type: "Formula type",
  shared: "Shared listed ingredient(s)",
  other: "Other listed ingredients",
  quantities: "Quantities",
  directions: "Manufacturer directions",
  notEstablished: "Not established",
} as const;
export const COMPARE_NOT_LISTED = "Not listed";
export const COMPARE_NONE_OTHER = "None listed besides the shared ingredient";
export const COMPARE_NOT_ESTABLISHED =
  "The listed composition doesn't establish whether these products are equivalent, or how their amounts or effects compare.";
export const COMPARE_NOTE = "Ingredient overlap is based on each product's listed composition.";

export const EXPLAINER_HEADING = "Understanding the Formulas";
export const EXPLAINER_TEXT =
  "Focused Formulas, such as the Khavinson Cytomax® and Cytogen® lines, each contain one peptide or peptide complex associated with a single organ or tissue. Bonomarlot, for example, contains a bone marrow peptide complex. Combination Formulas, such as the Revilab ML and Revilab SL lines, combine several peptide complexes, often with vitamins or plant extracts. Some Combination Formulas contain the same type of peptide complex as a Focused Formula; where they do, the product page says so under \"Compare Related Formulas.\" Neither type is better. A Focused Formula contains one ingredient focus, and a Combination Formula combines several in one formula. A qualified healthcare professional can help you decide which suits you.";
