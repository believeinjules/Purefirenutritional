import { describe, expect, it } from "vitest";
import { allProducts, products } from "../client/src/data/products";
import { isHiddenProduct } from "./hidden-products";
import {
  BATCHES,
  BATCH_ROUTES,
  batchKey,
  batchPath,
  expiryLabel,
  findBatches,
  formatPrintedDate,
  getBatchByKey,
  madeLabel,
  lotMatchKey,
  normalizeLot,
  NOT_PRINTED,
} from "./batches";

/**
 * Values copied from the package stamps (Julia's box videos, 2026-11-19;
 * /workspace/pf-lots/lots.csv). Changing a batch must be deliberate: update
 * both the data and this list.
 */
const PRINTED: Array<[slug: string, lot: string, made: string | null, expiry: string | null]> = [
  ["endoluten", "10225", "27.02.25", null],
  ["chelohart", "20126", "07.01.2026", "06.01.2029"],
  ["chitomur", "20825", "04.08.25", "03.08.28"],
  ["cerluten", "20126", "07.01.2026", "06.01.2029"],
  ["prime-peptide-omega", "29423-01", null, "03/2030"],
  ["svetinorm", "31125", "05.11.2025", "04.11.2028"],
  ["pinealon", "20126", "07.01.2026", "06.01.2029"],
  ["glandokort", "71125", "05.11.2025", "04.11.2028"],
  ["revilab-ml-03", "1225", "05.12.2025", "04.12.2028"],
  ["ventfort", "20126", "07.01.2026", "06.01.2029"],
  ["prime-peptide-brain", "29421-02", null, "04/2030"],
  ["mesotel-ultra", "001", "07.04.2026", "06.04.2028"],
];

/** Sortable YYYYMMDD / YYYYMM from a printed date (test only). */
function sortable(printed: string): number {
  const d = printed.match(/^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/);
  if (d) return Number(`${d[3].length === 2 ? "20" + d[3] : d[3]}${d[2]}${d[1]}`);
  const m = printed.match(/^(\d{2})\/(\d{4})$/)!;
  return Number(`${m[2]}${m[1]}01`);
}

describe("Batch Passport data", () => {
  it("holds exactly the printed values, nothing more", () => {
    expect(BATCHES.map((b) => [b.productSlug, b.lot, b.madePrinted, b.expiryPrinted])).toEqual(PRINTED);
  });

  it("keys every batch by product slug + lot, uniquely", () => {
    const keys = BATCHES.map(batchKey);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(BATCH_ROUTES).toContain("/batch-passport/cerluten-20126");
    expect(BATCH_ROUTES).toContain("/batch-passport/prime-peptide-omega-29423-01");
  });

  it("maps every batch to a catalog product; only visible ones get a product-page link", () => {
    for (const b of BATCHES) {
      expect(b.catalogProductId, b.productSlug).toBe(b.productSlug);
      const p = allProducts.find((x) => x.id === b.catalogProductId);
      expect(p, b.productSlug).toBeDefined();
      const visible = products.some((x) => x.id === b.catalogProductId);
      expect(visible).toBe(!isHiddenProduct(p));
    }
    // Mesotel Ultra is published (2026-11-19), so its batch page links to the product.
    expect(products.some((x) => x.id === "mesotel-ultra")).toBe(true);
  });

  it("no two lots of the same product collide once hyphens and spaces are ignored", () => {
    const seen = new Set<string>();
    for (const b of BATCHES) {
      const k = `${b.productSlug}|${lotMatchKey(b.lot)}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
    }
  });

  it("every printed date is readable and the made date comes before the expiry", () => {
    for (const b of BATCHES) {
      if (b.madePrinted) expect(formatPrintedDate(b.madePrinted), `${b.productSlug} made`).not.toBeNull();
      if (b.expiryPrinted) expect(formatPrintedDate(b.expiryPrinted), `${b.productSlug} expiry`).not.toBeNull();
      if (b.madePrinted && b.expiryPrinted) expect(sortable(b.madePrinted)).toBeLessThan(sortable(b.expiryPrinted));
      expect(b.expiryPrinted || b.shelfLife, `${b.productSlug} has an expiry or a printed shelf life`).toBeTruthy();
    }
  });

  it("Endoluten shows its made date and the printed shelf life, no computed expiry", () => {
    const b = getBatchByKey("endoluten-10225")!;
    expect(madeLabel(b)).toEqual({ display: "Feb 27, 2025", printed: "27.02.25" });
    expect(expiryLabel(b)).toEqual({ display: "3-year shelf life", printed: null });
  });

  it("Prime Peptide bottles say the made date is not printed", () => {
    for (const key of ["prime-peptide-omega-29423-01", "prime-peptide-brain-29421-02"]) {
      expect(madeLabel(getBatchByKey(key)!).display).toBe(NOT_PRINTED);
    }
    expect(expiryLabel(getBatchByKey("prime-peptide-brain-29421-02")!).display).toBe("Apr 2030");
  });
});

describe("Batch Passport lookup", () => {
  it("normalizes typed lots: trim, no spaces, case-insensitive", () => {
    expect(normalizeLot("  20 126 ")).toBe("20126");
    expect(normalizeLot("29423-01")).toBe("29423-01");
    expect(normalizeLot("ab c")).toBe("ABC");
  });

  it("finds a batch by product + lot", () => {
    const r = findBatches(" 201 26 ", "cerluten");
    expect(r.map(batchPath)).toEqual(["/batch-passport/cerluten-20126"]);
    expect(madeLabel(r[0]).display).toBe("Jan 7, 2026");
    expect(expiryLabel(r[0]).display).toBe("Jan 6, 2029");
  });

  it("matches with or without the printed hyphen", () => {
    for (const typed of ["2942301", "29423-01", " 29423 01 ", "29423\u201301"]) {
      expect(findBatches(typed).map(batchPath), typed).toEqual(["/batch-passport/prime-peptide-omega-29423-01"]);
    }
    expect(findBatches("2942102", "prime-peptide-brain").map((b) => b.lot)).toEqual(["29421-02"]);
    // Hyphen-free typing never crosses products: Omega's lot is not Brain's.
    expect(findBatches("2942301", "prime-peptide-brain")).toEqual([]);
    expect(lotMatchKey("29423-01")).toBe("2942301");
  });

  it("without a product, returns every product that shares the lot", () => {
    expect(findBatches("20126").map((b) => b.productSlug).sort()).toEqual(["cerluten", "chelohart", "pinealon", "ventfort"]);
    expect(findBatches("29421-02").map((b) => b.productSlug)).toEqual(["prime-peptide-brain"]);
  });

  it("returns nothing for an unknown lot, an empty input, or the wrong product", () => {
    expect(findBatches("99999")).toEqual([]);
    expect(findBatches("   ")).toEqual([]);
    expect(findBatches("20126", "endoluten")).toEqual([]);
  });

  it("formats printed dates unambiguously", () => {
    expect(formatPrintedDate("07.01.2026")).toBe("Jan 7, 2026");
    expect(formatPrintedDate("03.08.28")).toBe("Aug 3, 2028");
    expect(formatPrintedDate("03/2030")).toBe("Mar 2030");
    expect(formatPrintedDate("13.13.2026")).toBeNull();
    expect(formatPrintedDate("soon")).toBeNull();
  });
});
