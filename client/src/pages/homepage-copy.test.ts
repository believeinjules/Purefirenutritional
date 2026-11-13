import { describe, expect, it } from "vitest";
import { PUBLIC_PAGE_HEADS } from "@/lib/seo/publicHeads";
import fs from "node:fs";
import path from "node:path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, rel), "utf8");
const index = read("./Index.tsx");

describe("homepage SEO head", () => {
  it("title and meta description are the approved wording", () => {
    const { title, description } = PUBLIC_PAGE_HEADS["/"];
    expect(index).toContain('title={requirePageHead("/").title}');
    expect(index).toContain('description={requirePageHead("/").description}');
    expect(title).toBe("Authorized U.S. Khavinson Retailer | Pure Fire Nutritional");
    expect(description).toMatch(/U\.S\.-based authorized retailer of Khavinson peptide bioregulators/);
    expect(description).toMatch(/cellular health, healthy aging, and longevity/);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeLessThanOrEqual(160);
  });
});

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

describe("shared footer (Julia, 2026-11-12)", () => {
  it("uses U.S. in the authorized-retailer line", () => {
    const footer = read("../components/Footer.tsx");
    expect(footer).toContain("Authorized U.S. retailer of Khavinson peptide bioregulators.");
    expect(footer).not.toContain("Authorized US retailer of Khavinson peptide bioregulators.");
  });
});
