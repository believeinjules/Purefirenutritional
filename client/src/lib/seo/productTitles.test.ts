import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { BIOREGULATOR_ORGAN, SEO_TITLE_FOCUS, hasClaimLanguage, productHead, productTitle } from "./index";
import { FORMULA_PDP_CONTENT } from "@/data/formulaPreviewContent";
import { isHiddenProduct } from "../../../../shared/hidden-products";

const visible = products.filter((p) => !isHiddenProduct(p));
/** Rolled-out pages take their title from the H1 (tested below); the rest keep the three-part pattern. */
const legacy = visible.filter((p) => !FORMULA_PDP_CONTENT[p.id]);
const rolled = visible.filter((p) => FORMULA_PDP_CONTENT[p.id]);
const BANNED = /\b(cure[sd]?|curing|treat(s|ed|ing|ment)?|prevent(s|ed|ing|ion)?|disease|heal(s|ing)?)\b/i;

describe("descriptive product titles", () => {
  it("every visible non-rolled-out product has a three-part descriptive title", () => {
    for (const p of legacy) {
      const parts = productTitle(p).split(" | ");
      expect(parts, p.id).toHaveLength(3);
      expect(parts[0]).toBe(p.name);
      expect(parts[2]).toBe("Pure Fire Nutritional");
      expect(parts[1]!.length, p.id).toBeGreaterThan(0);
    }
  });

  it("every visible non-Khavinson product has an explicit SEO_TITLE_FOCUS entry", () => {
    const missing = visible.filter((p) => !BIOREGULATOR_ORGAN[p.id] && !SEO_TITLE_FOCUS[p.id]).map((p) => p.id);
    expect(missing).toEqual([]);
  });

  it("map has no stale or hidden ids", () => {
    const ids = new Set(visible.map((p) => p.id));
    for (const id of Object.keys(SEO_TITLE_FOCUS)) expect(ids.has(id), id).toBe(true);
    for (const id of ["calsil-t", "indosine", "panaxod"]) expect(SEO_TITLE_FOCUS[id]).toBeUndefined();
  });

  it("mapped titles stay within 60 characters unless the name alone forces it", () => {
    for (const p of legacy) {
      if (!SEO_TITLE_FOCUS[p.id]) continue;
      const t = productTitle(p);
      // Over 60 only for long names, and then the middle must already be minimal.
      const ok = t.length <= 60 || SEO_TITLE_FOCUS[p.id]!.length <= 12;
      expect(ok, `${p.id}: ${t} (${t.length})`).toBe(true);
    }
  });

  it("title middles and meta descriptions avoid disease / treatment wording", () => {
    for (const p of visible) {
      const head = productHead(p as never);
      expect(FORMULA_PDP_CONTENT[p.id] ? head.title : head.title.split(" | ")[1], p.id).not.toMatch(BANNED);
      expect(head.description.length, p.id).toBeLessThanOrEqual(160);
    }
  });

  it("keeps the Khavinson pattern for Cytogens and other legacy pages", () => {
    expect(productTitle({ id: "pinealon", name: "Pinealon" })).toBe(
      "Pinealon | Brain Peptide Bioregulator | Pure Fire Nutritional"
    );
  });

  it("rolled-out pages: title is the H1 (site name only when it fits), og:title follows", () => {
    expect(rolled.length).toBe(Object.keys(FORMULA_PDP_CONTENT).length);
    for (const p of rolled) {
      const h1 = FORMULA_PDP_CONTENT[p.id]!.title;
      const t = productTitle(p);
      const core = t.replace(/ \| Pure Fire Nutritional$/, "");
      expect(h1.startsWith(core), `${p.id}: ${t}`).toBe(true);
      expect(t.endsWith("| Pure Fire Nutritional") ? t.length <= 60 : true, t).toBe(true);
      // Only a trailing " with …" descriptor may be dropped.
      if (core !== h1) expect(h1.slice(core.length).startsWith(" with "), p.id).toBe(true);
    }
    expect(productTitle({ id: "bonomarlot", name: "Bonomarlot" })).toBe("Bonomarlot® — A-20 Bone Marrow Peptide Complex");
  });

  it("rolled-out meta descriptions are unique, from the Snapshot, claim-free and ≤160", () => {
    const seen = new Set<string>();
    for (const p of rolled) {
      const d = productHead(p as never).description;
      expect(seen.has(d), p.id).toBe(false);
      seen.add(d);
      expect(d.length, p.id).toBeLessThanOrEqual(160);
      // Tissue-of-origin words already in the visible H1 (e.g. "Prostate", "Bronchial") are names, not claims.
      const h1Words = FORMULA_PDP_CONTENT[p.id]!.title.toLowerCase().match(/[a-z]{4,}/g) ?? [];
      const rest = h1Words.reduce((acc, w) => acc.replace(new RegExp(`\\b${w}\\b`, "gi"), ""), d);
      expect(hasClaimLanguage(rest), `${p.id}: ${d}`).toBe(false);
      expect(d, p.id).not.toMatch(BANNED);
      const snap = FORMULA_PDP_CONTENT[p.id]!.snapshot;
      expect(d.toLowerCase(), p.id).toContain(snap.slice(2, 40).toLowerCase());
    }
  });
});
