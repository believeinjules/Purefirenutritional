import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, rel), "utf8");
const index = read("./Index.tsx");

describe("homepage copy (approved items only)", () => {
  it("has the five 'Why we carry these' items", () => {
    expect(index).toContain("Why we carry these");
    for (const s of [
      '"40+ years"',
      "Research line from the St. Petersburg Institute of Bioregulation and Gerontology",
      '"Oral"',
      "Capsules. No needles.",
      '"Short cycles"',
      "Taken in short cycles, then paused",
      '"Tissue-specific"',
      "Each formula is matched to one organ or system",
      '"Authorized US Retailer"',
      "Sourced directly from the manufacturer",
    ])
      expect(index).toContain(s);
  });

  it("replaces Pharmaceutical Grade and the courses line", () => {
    expect(index).toContain('title: "Quality you can check"');
    expect(index).toContain("Lot number, expiry, and certificate of analysis listed on every product where available.");
    expect(index).toContain("Short. Tissue-specific. Capsules in short cycles, not shots.");
    expect(index).not.toContain("Pharmaceutical Grade");
    expect(index).not.toContain("15M+");
  });

  it("keeps the Evidence-Informed card exactly as it was", () => {
    expect(index).toContain('title: "Evidence-Informed",');
    expect(index).toContain(
      'text: "Every product is grounded in peer-reviewed research and clinical evidence — not marketing claims.",'
    );
  });
});

describe("claims removed from other pages", () => {
  it("no 15M+, pharmaceutical-grade or 20–40% lifespan claims outside the homepage", () => {
    for (const rel of ["./Science.tsx", "./About.tsx", "./FAQ.tsx", "./learn/WhatAreKhavinsonPeptides.tsx", "../data/products.ts"]) {
      const s = read(rel);
      expect(s, rel).not.toMatch(/15M\+|Patients Supported/);
      expect(s, rel).not.toMatch(/pharmaceutical[- ]grade/i);
      expect(s, rel).not.toMatch(/20[–-]40\s*%/);
    }
  });
});
