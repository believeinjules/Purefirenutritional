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
  it("shows four trust points in a 2×2 / four-column grid, without the eyebrow or the 40+ / Authorized cards", () => {
    expect(index).not.toContain("Why we carry these");
    expect(index).toContain('data-testid="home-trust-points"');
    expect(index).toContain("grid grid-cols-2 md:grid-cols-4");
    const block = index.slice(index.indexOf("const trustPoints"), index.indexOf("export default function Index"));
    expect(block).toContain("Grounded in decades of published research.");
    expect(block).not.toContain("40+ years");
    expect(block).not.toContain("Authorized US Retailer");
    expect(block).not.toContain("Sourced directly from the manufacturer");
    expect(block).not.toMatch(/\d/);
    const stats = [...block.matchAll(/stat: "([^"]+)"/g)].map((m) => m[1]);
    expect(stats).toEqual(["Evidence backed", "Oral", "Short cycles", "Tissue-specific"]);
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


describe("homepage science stat cards", () => {
  it("removes the science stat card block (Julia, 2026-11-18)", () => {
    expect(index).not.toContain("Peptide levels in a 55-year-old");
    expect(index).not.toContain("Amino acids in Epitalon (Ala-Glu-Asp-Gly)");
    expect(index).not.toContain("Duration of effect per course");
    expect(index).not.toContain("10×");
    expect(index).not.toContain("4–6 mo");
    expect(index).not.toContain("20–40%");
    expect(index).not.toMatch(/Potential increase in mean lifespan/);
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
