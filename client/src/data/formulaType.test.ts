import { describe, it, expect } from "vitest";
import { PRODUCT_FACTS } from "@shared/product-facts";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import { products, getProductById } from "./products";
import {
  COMPARE_BUTTON_CLOSE,
  COMPARE_BUTTON_OPEN,
  COMPARE_HEADING,
  COMPARE_INTRO,
  COMPARE_NONE_OTHER,
  COMPARE_NOTE,
  COMPARE_NOT_ESTABLISHED,
  COMPARE_NOT_LISTED,
  COMPARE_ROW_LABELS,
  EXPLAINER_HEADING,
  EXPLAINER_TEXT,
  FLAGGED_PAIRS,
  FORMULA_PREVIEW_PDP_IDS,
  FORMULA_TYPE_FILTERS,
  FORMULA_TYPE_LABEL,
  NEEDS_CONFIRMATION,
  SHARED_COMPLEXES,
  compareColumns,
  counterpartsFor,
  formulaLineFor,
  formulaTagText,
  formulaTypeFor,
  isFormulaPreviewPdp,
  isPrimePeptide,
  labelPhrase,
} from "./formulaType";
import {
  DOSAGE_COURSE_PARAGRAPHS,
  FORMULA_PDP_CONTENT,
  MANUFACTURER_DIRECTIONS_LINE,
} from "./formulaPreviewContent";

const NEVER_SURFACED = ["calsil-t", "indosine", "panaxod"];
const allMapped = () => SHARED_COMPLEXES.flatMap((c) => [...Object.keys(c.focused), ...Object.keys(c.combination)]);

// Comparative / course-length claims that must never appear in the new copy.
// "Neither type is better." is counsel-approved and is the only allowed use of "better".
const COMPARATIVE =
  /\b(stronger|strongest|better|best|more effective|most effective|more potent|potent|superior|maintenance|short[- ]term|intensive|faster|quicker|preferred|recommended for)\b/i;
// Disease / treatment wording (Important Information is a disclaimer that names conditions on purpose).
const DISEASE =
  /\b(chemo\w*|radiother\w*|radiation|cancer\w*|tumou?r\w*|oncolog\w*|diseases?|cure[sd]?|treat\w*|heal(s|ed|ing)?|prevent\w*|diagnos\w*|therap\w*|anemi\w*|anaemi\w*|leuk\w*|symptom\w*|restor\w*|repair\w*)\b/i;

const compareCopy = [
  COMPARE_HEADING, COMPARE_INTRO, COMPARE_BUTTON_OPEN, COMPARE_BUTTON_CLOSE, COMPARE_NOT_ESTABLISHED,
  COMPARE_NOTE, COMPARE_NOT_LISTED, COMPARE_NONE_OTHER, ...Object.values(COMPARE_ROW_LABELS),
  ...Object.values(FORMULA_TYPE_LABEL), ...FORMULA_TYPE_FILTERS.map((f) => f.label), EXPLAINER_HEADING,
];
const pdpCopy = Object.values(FORMULA_PDP_CONTENT).flatMap((c) => [
  c.title, c.subline, c.snapshot, ...c.ingredients, c.biologicalFocus.heading, c.biologicalFocus.body,
  c.about, c.manufacturerDirections.line, c.compareIntro ?? "", c.research,
]);
const allNewCopy = [...compareCopy, ...pdpCopy, EXPLAINER_TEXT, ...DOSAGE_COURSE_PARAGRAPHS, ...Object.values(FORMULA_PDP_CONTENT).map((c) => c.importantInformation)];

describe("formula type map", () => {
  it("labels and lines", () => {
    expect(formulaTagText("bonomarlot")).toBe("Focused Formula · Cytomax");
    expect(formulaTagText("cartalax")).toBe("Focused Formula · Cytogen");
    expect(formulaTagText("revilab-ml-02")).toBe("Combination Formula · Revilab ML");
    expect(formulaTagText("revilab-sl-07")).toBe("Combination Formula · Revilab SL");
    expect(formulaTagText("prime-peptide-brain")).toBe("Combination Formula · Prime Peptide");
    for (const p of products) if (formulaTypeFor(p.id)) expect(formulaLineFor(p.id), p.id).toBeDefined();
  });

  it("every quoted string is in that product's composition, and its label words equal the phrase", () => {
    for (const c of SHARED_COMPLEXES) {
      for (const [id, quoted] of [...Object.entries(c.focused), ...Object.entries(c.combination)]) {
        expect(PRODUCT_FACTS[id]?.composition ?? [], `${id}: "${quoted}"`).toContain(quoted);
        expect(labelPhrase(quoted), `${id}: "${quoted}"`).toBe(c.label);
      }
      for (const id of Object.keys(c.focused)) expect(formulaTypeFor(id), id).toBe("focused");
      for (const id of Object.keys(c.combination)) expect(formulaTypeFor(id), id).toBe("combination");
    }
  });

  it("every mapped product's PDP shows the quoted composition string", () => {
    for (const c of SHARED_COMPLEXES) {
      for (const [id, quoted] of [...Object.entries(c.focused), ...Object.entries(c.combination)]) {
        expect(PRODUCT_FACTS[id]?.pdp?.ingredients ?? [], id).toContain(quoted);
      }
    }
  });

  it("flagged pairs are real composition data and never become counterparts", () => {
    for (const f of FLAGGED_PAIRS) {
      expect(PRODUCT_FACTS[f.focused]?.composition ?? []).toContain(f.focusedLabel);
      expect(PRODUCT_FACTS[f.combination]?.composition ?? []).toContain(f.combinationLabel);
      expect(counterpartsFor(f.focused).map((c) => c.id)).not.toContain(f.combination);
      expect(counterpartsFor(f.combination).map((c) => c.id)).not.toContain(f.focused);
    }
  });

  it("never tags or links hidden products", () => {
    for (const id of [...HIDDEN_PRODUCT_IDS, ...NEVER_SURFACED]) {
      expect(formulaTypeFor(id)).toBeUndefined();
      expect(formulaTagText(id)).toBeUndefined();
      expect(counterpartsFor(id)).toEqual([]);
      expect(compareColumns(id)).toEqual([]);
    }
    for (const id of allMapped()) expect(HIDDEN_PRODUCT_IDS.has(id), id).toBe(false);
    for (const p of products) for (const c of compareColumns(p.id)) expect(NEVER_SURFACED).not.toContain(c.id);
    for (const t of allNewCopy) for (const h of ["Calsil", "Indosine", "Panaxod"]) expect(t).not.toContain(h);
  });

  it("Prime Peptide: Combination Formula tag only, no compare data, no preview page, never a counterpart", () => {
    const prime = products.filter((p) => isPrimePeptide(p.id));
    expect(prime.length).toBe(5);
    for (const p of prime) {
      expect(formulaTypeFor(p.id)).toBe("combination");
      expect(counterpartsFor(p.id)).toEqual([]);
      expect(compareColumns(p.id)).toEqual([]);
      expect(isFormulaPreviewPdp(p.id)).toBe(false);
      expect(FORMULA_PDP_CONTENT[p.id]).toBeUndefined();
    }
    for (const id of allMapped()) expect(isPrimePeptide(id), id).toBe(false);
    for (const t of allNewCopy.filter((t) => t !== "Combination Formula")) expect(t).not.toMatch(/Prime/);
  });

  it("needs-confirmation products have no counterparts", () => {
    for (const id of Object.keys(NEEDS_CONFIRMATION)) {
      expect(formulaTypeFor(id), id).toBe("focused");
      expect(counterpartsFor(id), id).toEqual([]);
    }
  });

  it("compare data: Bonomarlot → Combination Formulas", () => {
    const cols = compareColumns("bonomarlot");
    expect(cols.map((c) => c.id)).toEqual(["bonomarlot", "revilab-ml-02", "revilab-sl-07"]);
    expect(cols[0]).toMatchObject({ tag: "Focused Formula · Cytomax", shared: ["Bone marrow peptide complex (A-20)"], other: [] });
    expect(cols[1].shared).toEqual(["Bone marrow peptide complex (AA-4)"]);
    expect(cols[1].other).toEqual([
      "T-link immune peptide complex (AA-2)",
      "B-link immune peptide complex (AA-3)",
      "Liver peptide complex (AA-10)",
      "Omega-3 polyunsaturated fatty acids",
      "Vitamins E, B6, B9",
    ]);
    expect(cols[2].shared).toEqual(["Bone marrow peptide complex (AA-4)"]);
    // Other = the rest of the product's composition, verbatim.
    for (const c of cols) expect([...c.shared, ...c.other].sort()).toEqual([...(PRODUCT_FACTS[c.id]?.composition ?? [])].sort());
    // Quantities: none verified in the repo. Directions: verified label text or quoted brochure only.
    for (const c of cols) expect(c.quantities).toBeUndefined();
    expect(cols[1].directions).toBe(PRODUCT_FACTS["revilab-ml-02"].manufacturerDirections.text);
    expect(cols[2].directions).toBe(PRODUCT_FACTS["revilab-sl-07"].manufacturerDirections.text);
    expect(cols[0].directions).toContain("(brochure, p. 7)");
  });

  it("compare data: Revilab ML 02 → the Focused Formulas it contains (page not switched on)", () => {
    expect(isFormulaPreviewPdp("revilab-ml-02")).toBe(false);
    const cols = compareColumns("revilab-ml-02");
    expect(cols.map((c) => c.id)).toEqual(["revilab-ml-02", "bonomarlot", "svetinorm"]);
    expect(cols[0].shared).toEqual(["Bone marrow peptide complex (AA-4)", "Liver peptide complex (AA-10)"]);
    expect(cols[1].shared).toEqual(["Bone marrow peptide complex (A-20)"]);
    expect(cols[2].shared).toEqual(["Liver peptide complex A-7 (natural extract)"]);
    expect(cols[2].directions).toBeUndefined(); // Svetinorm has no verified directions → "Not listed"
  });

  it("gating: only Bonomarlot gets the preview page", () => {
    expect([...FORMULA_PREVIEW_PDP_IDS]).toEqual(["bonomarlot"]);
    expect(Object.keys(FORMULA_PDP_CONTENT)).toEqual(["bonomarlot"]);
    for (const p of products) expect(isFormulaPreviewPdp(p.id), p.id).toBe(p.id === "bonomarlot");
  });

  it("approved copy is verbatim", () => {
    expect(EXPLAINER_TEXT).toContain("Neither type is better.");
    expect(EXPLAINER_TEXT).toContain("one peptide or peptide complex");
    expect(MANUFACTURER_DIRECTIONS_LINE).toBe(
      "Follow the instructions on the current product packaging for serving size and course duration. A manufacturer-defined course describes the recommended usage schedule, not a guaranteed timeline for results.",
    );
    expect(DOSAGE_COURSE_PARAGRAPHS).toHaveLength(4);
    expect(FORMULA_PDP_CONTENT.bonomarlot.amountPerCapsule).toBeUndefined(); // "10 mg" is unverified
    expect(pdpCopy.join(" ")).not.toMatch(/10 mg/);
  });

  it("no comparative claims anywhere in the new copy (except the approved 'Neither type is better.')", () => {
    for (const t of allNewCopy) expect(t.replace("Neither type is better.", ""), t).not.toMatch(COMPARATIVE);
  });

  it("no disease/treatment wording outside the Important Information disclaimer", () => {
    for (const t of [...compareCopy, ...pdpCopy, EXPLAINER_TEXT, ...DOSAGE_COURSE_PARAGRAPHS]) expect(t, t).not.toMatch(DISEASE);
  });
});
