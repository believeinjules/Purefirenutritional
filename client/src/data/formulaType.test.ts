import { describe, it, expect } from "vitest";
import { PRODUCT_FACTS } from "@shared/product-facts";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import { products, getProductById } from "./products";
import {
  FLAGGED_PAIRS,
  NEEDS_CONFIRMATION,
  SHARED_COMPLEXES,
  compareLine,
  compareLineText,
  counterpartsFor,
  formulaTypeFor,
  isPrimePeptide,
  labelPhrase,
} from "./formulaType";
import { EXPLAINER_TEXT } from "@/components/shop/FormulaTypeParts";

const names = (id: string) => getProductById(id)?.name;
const NEVER_SURFACED = ["calsil-t", "indosine", "panaxod"];
// Disease / treatment / condition wording that must not appear in the new copy.
const BANNED =
  /\b(chemo\w*|radiother\w*|radiation|cancer\w*|tumou?r\w*|oncolog\w*|diseases?|cure[sd]?|treat\w*|heal(s|ed|ing)?|prevent\w*|diagnos\w*|therap\w*|anemi\w*|anaemi\w*|leuk\w*|symptom\w*|deficien\w*|disorder\w*|restor\w*|repair\w*|dose|dosing|dosage|capsules? (a|per) day)\b/i;
const allMapped = () => SHARED_COMPLEXES.flatMap((c) => [...Object.keys(c.single), ...Object.keys(c.blend)]);

describe("formula type map", () => {
  it("every quoted string is in that product's composition, and its label words equal the phrase used in the copy", () => {
    for (const c of SHARED_COMPLEXES) {
      for (const [id, quoted] of [...Object.entries(c.single), ...Object.entries(c.blend)]) {
        expect(PRODUCT_FACTS[id]?.composition ?? [], `${id}: "${quoted}"`).toContain(quoted);
        expect(labelPhrase(quoted), `${id}: "${quoted}"`).toBe(c.label);
      }
      for (const id of Object.keys(c.single)) expect(formulaTypeFor(id), id).toBe("single");
      for (const id of Object.keys(c.blend)) expect(formulaTypeFor(id), id).toBe("blend");
    }
  });

  it("every mapped product's PDP shows the quoted composition string (no 'see your package' blends)", () => {
    for (const c of SHARED_COMPLEXES) {
      for (const [id, quoted] of [...Object.entries(c.single), ...Object.entries(c.blend)]) {
        expect(PRODUCT_FACTS[id]?.pdp?.ingredients ?? [], id).toContain(quoted);
      }
    }
  });

  it("flagged pairs are really in the composition data and never produce a link", () => {
    for (const f of FLAGGED_PAIRS) {
      expect(PRODUCT_FACTS[f.single]?.composition ?? []).toContain(f.singleLabel);
      expect(PRODUCT_FACTS[f.blend]?.composition ?? []).toContain(f.blendLabel);
      expect(counterpartsFor(f.single).map((c) => c.id), `${f.single}>${f.blend}`).not.toContain(f.blend);
      expect(counterpartsFor(f.blend).map((c) => c.id), `${f.blend}>${f.single}`).not.toContain(f.single);
    }
  });

  it("every mapped counterpart is a live storefront product", () => {
    for (const p of products) {
      for (const c of counterpartsFor(p.id)) expect(getProductById(c.id), `${p.id} -> ${c.id}`).toBeDefined();
    }
  });

  it("never tags or links hidden products (Calsil-T, Indosine, Panaxod and the rest)", () => {
    for (const id of [...HIDDEN_PRODUCT_IDS, ...NEVER_SURFACED]) {
      expect(formulaTypeFor(id)).toBeUndefined();
      expect(counterpartsFor(id)).toEqual([]);
      expect(compareLine(id, names)).toBeNull();
    }
    for (const id of allMapped()) expect(HIDDEN_PRODUCT_IDS.has(id), id).toBe(false);
    for (const p of products) {
      const text = compareLineText(p.id, names) ?? "";
      for (const h of ["Calsil", "Indosine", "Panaxod"]) expect(text, p.id).not.toContain(h);
    }
  });

  it("Prime Peptide products get the Blend tag but no compare line, and are never a counterpart", () => {
    const prime = products.filter((p) => isPrimePeptide(p.id));
    expect(prime.length).toBe(5);
    for (const p of prime) {
      expect(formulaTypeFor(p.id)).toBe("blend");
      expect(compareLine(p.id, names)).toBeNull();
    }
    for (const id of allMapped()) expect(isPrimePeptide(id), id).toBe(false);
    for (const p of products) {
      expect(compareLineText(p.id, names) ?? "", p.id).not.toMatch(/Prime/);
    }
  });

  it("needs-confirmation singles have no compare line", () => {
    for (const id of Object.keys(NEEDS_CONFIRMATION)) {
      expect(formulaTypeFor(id), id).toBe("single");
      expect(compareLine(id, names), id).toBeNull();
    }
  });

  it("uses the approved templates", () => {
    expect(compareLineText("bonomarlot", names)).toBe(
      "How it compares: Bonomarlot is a single: it contains one bone marrow peptide complex. Revilab ML 02 and Revilab SL 07 are blends that also contain a bone marrow peptide complex, along with other ingredients.",
    );
    expect(compareLineText("revilab-ml-02", names)).toBe(
      "How it compares: Revilab ML 02 is a blend: it combines several peptide complexes in one formula. For a single that contains one of them, see Bonomarlot (bone marrow peptide complex) or Svetinorm (liver peptide complex).",
    );
  });

  it("new copy uses no disease/treatment/dose wording", () => {
    for (const p of products) {
      const text = compareLineText(p.id, names);
      if (text) expect(text, p.id).not.toMatch(BANNED);
    }
    expect(EXPLAINER_TEXT).not.toMatch(BANNED);
  });
});
