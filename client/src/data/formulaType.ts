/**
 * PROPOSAL (not live): "Single" vs "Blend" formula type, and the
 * "How it compares" counterparts shown on product pages.
 *
 *  - Single = Khavinson Cytomax® / Cytogen® products (one peptide or peptide complex).
 *             Derived from the collection tags in productTags.ts.
 *  - Blend  = Revilab ML 01–09, Revilab SL 01–10 and the Prime Peptide line.
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
import { tagsFor } from "./productTags";

export type FormulaType = "single" | "blend";

export const FORMULA_TYPE_LABEL: Record<FormulaType, string> = {
  single: "Single",
  blend: "Blend",
};

export const FORMULA_TYPE_FILTERS: ReadonlyArray<{ value: "all" | FormulaType; label: string }> = [
  { value: "all", label: "All types" },
  { value: "single", label: "Single" },
  { value: "blend", label: "Blend" },
];

/** Anchor of the explainer section; the filter's "What's the difference?" link points here. */
export const FORMULA_TYPE_EXPLAINER_ID = "single-or-blend";

const SINGLE_COLLECTIONS = ["collection:khavinson-cytomaxes", "collection:khavinson-cytogens"];

/** Prime Peptide wording is on hold: tag only, no "How it compares" line. */
export function isPrimePeptide(id: string): boolean {
  return tagsFor(id).includes("collection:prime-peptide");
}

export function formulaTypeFor(id: string): FormulaType | undefined {
  if (isHiddenProduct({ id })) return undefined;
  const tags = tagsFor(id);
  if (SINGLE_COLLECTIONS.some((c) => tags.includes(c))) return "single";
  if (/^revilab-(ml|sl)-\d{2}$/.test(id) || isPrimePeptide(id)) return "blend";
  return undefined;
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
  /** Single(s) → exact composition string in shared/product-facts.json. */
  single: Record<string, string>;
  /** Blend(s) → exact composition string in shared/product-facts.json. */
  blend: Record<string, string>;
}

export const SHARED_COMPLEXES: SharedComplex[] = [
  {
    label: "bone marrow peptide complex",
    single: { bonomarlot: "Bone marrow peptide complex (A-20)" },
    blend: {
      "revilab-ml-02": "Bone marrow peptide complex (AA-4)",
      "revilab-sl-07": "Bone marrow peptide complex (AA-4)",
    },
  },
  {
    label: "liver peptide complex",
    single: { svetinorm: "Liver peptide complex A-7 (natural extract)" },
    blend: {
      "revilab-ml-01": "Liver peptide complex (AA-10)",
      "revilab-ml-02": "Liver peptide complex (AA-10)",
      "revilab-ml-06": "Liver peptide complex (AA-10)",
      "revilab-sl-05": "Liver peptide complex (AA-10)",
    },
  },
  {
    label: "pineal gland peptide complex",
    single: { endoluten: "Pineal gland peptide complex (A-8)" },
    blend: { "revilab-sl-09": "Pineal gland peptide complex (AA-1)" },
  },
  {
    label: "brain peptide complex",
    single: {
      cerluten: "Brain peptide complex A-5 (natural extract)",
      pinealon: "Brain peptide complex AC-5 (arginine, glutamic acid, aspartic acid)",
    },
    blend: {
      "revilab-ml-03": "Brain peptide complex (AA-5)",
      "revilab-sl-02": "Brain peptide complex (AA-5)",
    },
  },
  {
    label: "heart muscle peptide complex",
    single: { chelohart: "Heart muscle peptide complex (A-14)" },
    blend: { "revilab-ml-04": "Heart muscle peptide complex (AA-8)" },
  },
  {
    label: "cartilage peptide complex",
    single: { cartalax: "Cartilage peptide complex AC-4 (Ala-Glu-Asp / AED tripeptide)" },
    blend: {
      "revilab-ml-09": "Cartilage peptide complex (AA-9)",
      "revilab-sl-04": "Cartilage peptide complex (AA-9)",
    },
  },
  {
    label: "muscle peptide complex",
    single: { gotratix: "Muscle peptide complex (A-18)" },
    blend: { "revilab-sl-04": "Muscle peptide complex (AA-17)" },
  },
  {
    label: "pancreas peptide complex",
    single: { suprefort: "Pancreas peptide complex A-1 (natural extract)" },
    blend: {
      "revilab-ml-06": "Pancreas peptide complex (AA-11)",
      "revilab-sl-05": "Pancreas peptide complex (AA-11)",
    },
  },
  {
    label: "bladder peptide complex",
    single: { chitomur: "Bladder peptide complex A-12 (natural extract)" },
    blend: {
      "revilab-sl-08": "Bladder peptide complex (AA-13)",
      "revilab-sl-09": "Bladder peptide complex (AA-13)",
    },
  },
  {
    label: "prostate peptide complex",
    single: { libidon: "Prostate peptide complex A-16 (natural extract)" },
    blend: { "revilab-sl-09": "Prostate peptide complex (AA-16)" },
  },
];

/** Same tissue, but the label words differ or the blend's PDP doesn't show its composition: no compare line. */
export const FLAGGED_PAIRS: ReadonlyArray<{ single: string; blend: string; singleLabel: string; blendLabel: string; reason: string }> = [
  ...["revilab-ml-01", "revilab-ml-04", "revilab-ml-07", "revilab-ml-08"].map((blend) => ({
    single: "endoluten", blend, singleLabel: "Pineal gland peptide complex (A-8)", blendLabel: "Epiphysis peptide complex (AA-1)",
    reason: "label words differ (Pineal gland vs Epiphysis)",
  })),
  ...["revilab-sl-03", "revilab-sl-10"].map((blend) => ({
    single: "endoluten", blend, singleLabel: "Pineal gland peptide complex (A-8)", blendLabel: "Pineal gland peptide complex (AA-1)",
    reason: "words match, but the blend's PDP shows \"See the full ingredient list on your package.\" instead of its composition",
  })),
  ...["ventfort", "vesugen"].flatMap((single) =>
    ["revilab-ml-03", "revilab-ml-04", "revilab-ml-07", "revilab-ml-08", "revilab-ml-09", "revilab-sl-01", "revilab-sl-02", "revilab-sl-07", "revilab-sl-08", "revilab-sl-10"].map((blend) => ({
      single, blend,
      singleLabel: single === "ventfort" ? "Vascular peptide complex (A-3)" : "Vascular peptide complex (AC-2)",
      blendLabel: "Vascular wall peptide complex (AA-7)",
      reason: "label words differ (Vascular vs Vascular wall)",
    })),
  ),
  { single: "chelohart", blend: "revilab-sl-01", singleLabel: "Heart muscle peptide complex (A-14)", blendLabel: "Cardiac muscle peptide complex (AA-8)", reason: "label words differ (Heart muscle vs Cardiac muscle)" },
  { single: "cartalax", blend: "revilab-ml-08", singleLabel: "Cartilage peptide complex AC-4 (Ala-Glu-Asp / AED tripeptide)", blendLabel: "Cartilage peptide complex (AA-9)", reason: "words match, but the blend's PDP shows \"See the full ingredient list on your package.\"" },
  ...["revilab-ml-05", "revilab-sl-06"].map((blend) => ({
    single: "taxorest", blend, singleLabel: "Bronchial peptide complex A-19 (natural extract)", blendLabel: "Bronchi peptide complex (AA-14)",
    reason: "label words differ (Bronchial vs Bronchi)",
  })),
  ...["revilab-ml-07", "revilab-sl-09"].map((blend) => ({
    single: "testoluten", blend, singleLabel: "Testicular peptide complex (A-13)", blendLabel: "Testes peptide complex (AA-12)",
    reason: "label words differ (Testicular vs Testes)",
  })),
  ...["revilab-ml-07", "revilab-ml-08", "revilab-sl-10"].map((blend) => ({
    single: "chitomur", blend, singleLabel: "Bladder peptide complex A-12 (natural extract)", blendLabel: "Bladder peptide complex (AA-13)",
    reason: "words match, but the blend's PDP shows \"See the full ingredient list on your package.\"",
  })),
];

/** Singles with no label-supported counterpart at all (tissue unclear or no Revilab equivalent). */
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
    const [mine, theirs] = type === "single" ? [c.single, c.blend] : [c.blend, c.single];
    if (!(id in mine)) continue;
    for (const other of Object.keys(theirs)) {
      if (!isHiddenProduct({ id: other }) && !out.some((o) => o.id === other)) out.push({ id: other, complex: c.label });
    }
  }
  return out;
}

/** A piece of the compare line: plain text, or an internal link to a Pure Fire product page. */
export type CompareSegment = { text: string } | { text: string; productId: string };

/** "A", "A and B", "A, B and C" (site style: no serial comma). */
function joinList(items: CompareSegment[][], conj: string): CompareSegment[] {
  const out: CompareSegment[] = [];
  items.forEach((item, i) => {
    if (i > 0) out.push({ text: i === items.length - 1 ? ` ${conj} ` : ", " });
    out.push(...item);
  });
  return out;
}

/** The one-line "How it compares" note (without the "How it compares: " lead), or null. */
export function compareLine(id: string, names: (id: string) => string | undefined): CompareSegment[] | null {
  const type = formulaTypeFor(id);
  const counterparts = counterpartsFor(id);
  if (!type || counterparts.length === 0) return null;
  const name = (x: string) => names(x) ?? x;
  const self = name(id);
  if (type === "single") {
    const complex = counterparts[0].complex;
    const links = counterparts.map((c) => [{ text: name(c.id), productId: c.id }]);
    return [
      { text: `${self} is a single: it contains one ${complex}. ` },
      ...joinList(links, "and"),
      {
        text:
          counterparts.length > 1
            ? ` are blends that also contain a ${complex}, along with other ingredients.`
            : ` is a blend that also contains a ${complex}, along with other ingredients.`,
      },
    ];
  }
  const links = counterparts.map((c) => [{ text: name(c.id), productId: c.id }, { text: ` (${c.complex})` }]);
  return [
    { text: `${self} is a blend: it combines several peptide complexes in one formula. For a single that contains one of them, see ` },
    ...joinList(links, "or"),
    { text: "." },
  ];
}

export const COMPARE_LEAD = "How it compares: ";

export function compareLineText(id: string, names: (id: string) => string | undefined): string | null {
  const line = compareLine(id, names);
  return line ? COMPARE_LEAD + line.map((s) => s.text).join("") : null;
}
