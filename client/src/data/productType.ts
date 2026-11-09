/**
 * PROPOSAL (not live): "Targeted" vs "Broad-spectrum" product type, and the
 * "How it compares" counterparts shown on product pages.
 *
 *  - Targeted       = Khavinson Cytomax® / Cytogen® singles (one peptide complex).
 *                     Derived from the collection tags in productTags.ts.
 *  - Broad-spectrum = Revilab ML 01–09, Revilab SL 01–10 and the Prime Peptide line.
 *
 * Counterparts come ONLY from SHARED_COMPLEXES below. Every entry quotes the
 * exact composition string from shared/product-facts.json for each product; the
 * test (productType.test.ts) fails if a quoted string is not in that product's
 * composition. Codes differ between lines (Cytomax A-20 vs Revilab AA-4), so the
 * copy says both "contain a bone marrow peptide complex" and never claims the
 * two are the identical complex.
 *
 * Read from code by product id; Firestore product docs are not involved.
 */
import { isHiddenProduct } from "@shared/hidden-products";
import { tagsFor } from "./productTags";

export type ProductType = "targeted" | "broad-spectrum";

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  targeted: "Targeted",
  "broad-spectrum": "Broad-spectrum",
};

export const PRODUCT_TYPE_FILTERS: ReadonlyArray<{ value: "all" | ProductType; label: string }> = [
  { value: "all", label: "All types" },
  { value: "targeted", label: "Targeted" },
  { value: "broad-spectrum", label: "Broad-spectrum" },
];

/** Anchor of the explainer section; the filter's "What's the difference?" link points here. */
export const PRODUCT_TYPE_EXPLAINER_ID = "targeted-vs-broad-spectrum";

const TARGETED_COLLECTIONS = ["collection:khavinson-cytomaxes", "collection:khavinson-cytogens"];

/** Prime Peptide wording is on hold: tag only, no "How it compares" line. */
export function isPrimePeptide(id: string): boolean {
  return tagsFor(id).includes("collection:prime-peptide");
}

export function productTypeFor(id: string): ProductType | undefined {
  if (isHiddenProduct({ id })) return undefined;
  const tags = tagsFor(id);
  if (TARGETED_COLLECTIONS.some((c) => tags.includes(c))) return "targeted";
  if (/^revilab-(ml|sl)-\d{2}$/.test(id) || isPrimePeptide(id)) return "broad-spectrum";
  return undefined;
}

export interface SharedComplex {
  /** Plain wording used in the copy, e.g. "bone marrow peptide complex". */
  label: string;
  /** Targeted single(s) → exact composition string in shared/product-facts.json. */
  targeted: Record<string, string>;
  /** Broad-spectrum blend(s) → exact composition string in shared/product-facts.json. */
  broad: Record<string, string>;
}

export const SHARED_COMPLEXES: SharedComplex[] = [
  {
    label: "bone marrow peptide complex",
    targeted: { bonomarlot: "Bone marrow peptide complex (A-20)" },
    broad: {
      "revilab-ml-02": "Bone marrow peptide complex (AA-4)",
      "revilab-sl-07": "Bone marrow peptide complex (AA-4)",
    },
  },
  {
    label: "liver peptide complex",
    targeted: { svetinorm: "Liver peptide complex A-7 (natural extract)" },
    broad: {
      "revilab-ml-01": "Liver peptide complex (AA-10)",
      "revilab-ml-02": "Liver peptide complex (AA-10)",
      "revilab-ml-06": "Liver peptide complex (AA-10)",
      "revilab-sl-05": "Liver peptide complex (AA-10)",
    },
  },
  {
    label: "pineal gland peptide complex", // ML lines say "Epiphysis" (= pineal gland); SL lines say "Pineal gland" for the same AA-1
    targeted: { endoluten: "Pineal gland peptide complex (A-8)" },
    broad: {
      "revilab-ml-01": "Epiphysis peptide complex (AA-1)",
      "revilab-ml-04": "Epiphysis peptide complex (AA-1)",
      "revilab-ml-07": "Epiphysis peptide complex (AA-1)",
      "revilab-ml-08": "Epiphysis peptide complex (AA-1)",
      "revilab-sl-03": "Pineal gland peptide complex (AA-1)",
      "revilab-sl-09": "Pineal gland peptide complex (AA-1)",
      "revilab-sl-10": "Pineal gland peptide complex (AA-1)",
    },
  },
  {
    label: "brain peptide complex",
    targeted: {
      cerluten: "Brain peptide complex A-5 (natural extract)",
      pinealon: "Brain peptide complex AC-5 (arginine, glutamic acid, aspartic acid)",
    },
    broad: {
      "revilab-ml-03": "Brain peptide complex (AA-5)",
      "revilab-sl-02": "Brain peptide complex (AA-5)",
    },
  },
  {
    label: "vascular peptide complex",
    targeted: {
      ventfort: "Vascular peptide complex (A-3)",
      vesugen: "Vascular peptide complex (AC-2)",
    },
    broad: {
      "revilab-ml-03": "Vascular wall peptide complex (AA-7)",
      "revilab-ml-04": "Vascular wall peptide complex (AA-7)",
      "revilab-ml-07": "Vascular wall peptide complex (AA-7)",
      "revilab-ml-08": "Vascular wall peptide complex (AA-7)",
      "revilab-ml-09": "Vascular wall peptide complex (AA-7)",
      "revilab-sl-01": "Vascular wall peptide complex (AA-7)",
      "revilab-sl-02": "Vascular wall peptide complex (AA-7)",
      "revilab-sl-07": "Vascular wall peptide complex (AA-7)",
      "revilab-sl-08": "Vascular wall peptide complex (AA-7)",
      "revilab-sl-10": "Vascular wall peptide complex (AA-7)",
    },
  },
  {
    label: "heart muscle peptide complex",
    targeted: { chelohart: "Heart muscle peptide complex (A-14)" },
    broad: {
      "revilab-ml-04": "Heart muscle peptide complex (AA-8)",
      "revilab-sl-01": "Cardiac muscle peptide complex (AA-8)",
    },
  },
  {
    label: "cartilage peptide complex",
    targeted: { cartalax: "Cartilage peptide complex AC-4 (Ala-Glu-Asp / AED tripeptide)" },
    broad: {
      "revilab-ml-08": "Cartilage peptide complex (AA-9)",
      "revilab-ml-09": "Cartilage peptide complex (AA-9)",
      "revilab-sl-04": "Cartilage peptide complex (AA-9)",
    },
  },
  {
    label: "muscle peptide complex",
    targeted: { gotratix: "Muscle peptide complex (A-18)" },
    broad: { "revilab-sl-04": "Muscle peptide complex (AA-17)" },
  },
  {
    label: "bronchial peptide complex",
    targeted: { taxorest: "Bronchial peptide complex A-19 (natural extract)" },
    broad: {
      "revilab-ml-05": "Bronchi peptide complex (AA-14)",
      "revilab-sl-06": "Bronchi peptide complex (AA-14)",
    },
  },
  {
    label: "pancreas peptide complex",
    targeted: { suprefort: "Pancreas peptide complex A-1 (natural extract)" },
    broad: {
      "revilab-ml-06": "Pancreas peptide complex (AA-11)",
      "revilab-sl-05": "Pancreas peptide complex (AA-11)",
    },
  },
  {
    label: "testes peptide complex",
    targeted: { testoluten: "Testicular peptide complex (A-13)" },
    broad: {
      "revilab-ml-07": "Testes peptide complex (AA-12)",
      "revilab-sl-09": "Testes peptide complex (AA-12)",
    },
  },
  {
    label: "bladder peptide complex",
    targeted: { chitomur: "Bladder peptide complex A-12 (natural extract)" },
    broad: {
      "revilab-ml-07": "Bladder peptide complex (AA-13)",
      "revilab-ml-08": "Bladder peptide complex (AA-13)",
      "revilab-sl-08": "Bladder peptide complex (AA-13)",
      "revilab-sl-09": "Bladder peptide complex (AA-13)",
      "revilab-sl-10": "Bladder peptide complex (AA-13)",
    },
  },
  {
    label: "prostate peptide complex",
    targeted: { libidon: "Prostate peptide complex A-16 (natural extract)" },
    broad: { "revilab-sl-09": "Prostate peptide complex (AA-16)" },
  },
];

/**
 * Not mapped on purpose — the catalog does not state the same tissue for both
 * sides, so there is no compare line until Julia confirms.
 */
export const NEEDS_CONFIRMATION: Record<string, string> = {
  vladonix: "Thymus (A-6); Revilab lists a \"T-link / T-cell immune peptide complex (AA-2)\" but never says thymus.",
  crystagen: "Thymus (AC-6); same AA-2 question as Vladonix.",
  sigumir: "\"Cartilage and bone\" (A-4) vs Revilab \"Cartilage\" (AA-9): only partly the same tissue.",
  stamakort: "Stomach (A-10) vs Revilab \"Lungs and stomach wall\" (AA-15), a combined complex.",
  visoluten: "\"Eye tissue\" (A-11) vs Revilab \"Retina\" (AA-6).",
  chonluten: "\"Respiratory peptide complex AC-7\" vs Revilab \"Bronchi\" (AA-14) / \"Lungs and stomach wall\" (AA-15).",
  ovagen: "Composition says only \"Peptide complex AC-3\" (no tissue named; target listed as liver).",
};

export interface Counterpart {
  id: string;
  /** Wording for the shared complex. */
  complex: string;
}

/** Counterparts of the other type that share a peptide complex (blend order = catalog order). */
export function counterpartsFor(id: string): Counterpart[] {
  if (isHiddenProduct({ id }) || isPrimePeptide(id)) return [];
  const type = productTypeFor(id);
  if (!type) return [];
  const out: Counterpart[] = [];
  for (const c of SHARED_COMPLEXES) {
    const [mine, theirs] = type === "targeted" ? [c.targeted, c.broad] : [c.broad, c.targeted];
    if (!(id in mine)) continue;
    for (const other of Object.keys(theirs)) {
      if (!isHiddenProduct({ id: other }) && !out.some((o) => o.id === other)) out.push({ id: other, complex: c.label });
    }
  }
  return out;
}

/** A piece of the compare line: plain text, or an internal link to a Pure Fire product page. */
export type CompareSegment = { text: string } | { text: string; productId: string };

function nameOf(id: string, names: (id: string) => string | undefined): string {
  return names(id) ?? id;
}

function joinList(items: CompareSegment[][], conj: string): CompareSegment[] {
  const out: CompareSegment[] = [];
  items.forEach((item, i) => {
    if (i > 0) out.push({ text: i === items.length - 1 ? (items.length > 2 ? `, ${conj} ` : ` ${conj} `) : ", " });
    out.push(...item);
  });
  return out;
}

/**
 * The one-line "How it compares" note, or null (no counterparts, Prime, hidden,
 * or untyped). `names` maps an id to its storefront name.
 */
export function compareLine(id: string, names: (id: string) => string | undefined): CompareSegment[] | null {
  const type = productTypeFor(id);
  const counterparts = counterpartsFor(id);
  if (!type || counterparts.length === 0) return null;
  const self = nameOf(id, names);
  if (type === "targeted") {
    const complex = counterparts[0].complex;
    const links = counterparts.map((c) => [{ text: nameOf(c.id, names), productId: c.id }]);
    const plural = counterparts.length > 1;
    return [
      { text: `${self} is targeted: it contains one ${complex}. ` },
      ...joinList(links, "and"),
      {
        text: plural
          ? ` are broad-spectrum blends that also contain a ${complex}, alongside other peptide complexes and ingredients.`
          : ` is a broad-spectrum blend that also contains a ${complex}, alongside other peptide complexes and ingredients.`,
      },
    ];
  }
  const links = counterparts.map((c) => [{ text: nameOf(c.id, names), productId: c.id }, { text: ` (${c.complex})` }]);
  return [
    { text: `${self} is broad-spectrum: it combines several peptide complexes in one formula. For a targeted single built on one of them, see ` },
    ...joinList(links, "or"),
    { text: "." },
  ];
}

export function compareLineText(id: string, names: (id: string) => string | undefined): string | null {
  const line = compareLine(id, names);
  return line ? line.map((s) => s.text).join("") : null;
}
