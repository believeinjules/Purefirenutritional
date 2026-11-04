import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { BIOREGULATOR_ORGAN, SEO_TITLE_FOCUS, productHead, productTitle } from "./index";
import { isHiddenProduct } from "../../../../shared/hidden-products";

const visible = products.filter((p) => !isHiddenProduct(p));
const BANNED = /\b(cure[sd]?|curing|treat(s|ed|ing|ment)?|prevent(s|ed|ing|ion)?|disease|heal(s|ing)?)\b/i;

describe("descriptive product titles", () => {
  it("every visible product has a three-part descriptive title", () => {
    for (const p of visible) {
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
    for (const p of visible) {
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
      expect(head.title.split(" | ")[1], p.id).not.toMatch(BANNED);
      expect(head.description.length, p.id).toBeLessThanOrEqual(160);
    }
  });

  it("keeps the Khavinson pattern", () => {
    expect(productTitle({ id: "cerluten", name: "Cerluten" })).toBe(
      "Cerluten | Brain Peptide Bioregulator | Pure Fire Nutritional"
    );
  });
});
