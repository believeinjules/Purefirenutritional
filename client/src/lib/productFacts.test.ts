import { describe, expect, it } from "vitest";
import { getProductFacts } from "./productFacts";
import { products } from "@/data/products";
import { DOSING } from "@/data/dosing";

const byId = (id: string) => products.find((p) => p.id === id)!;

describe("product facts (data-only)", () => {
  it("Bonomarlot 20 caps: one 10-day cycle and cost per day", () => {
    const f = getProductFacts(byId("bonomarlot"), "20", 77.99);
    expect(f.sizeLabel).toBe("20 caps");
    expect(f.daysPerBottle).toBe(10);
    expect(f.coverageLabel).toBe("One 10-day cycle");
    expect(f.costPerDayUSD).toBe(7.8);
  });

  it("Testoluten 20 caps: 3 bottles make the 30-day course", () => {
    const f = getProductFacts(byId("testoluten"), "20", 58.99);
    expect(f.bottlesPerCycle).toBe(3);
    expect(f.coverageLabel).toBe("10 days · 3 bottles = one 30-day cycle");
  });

  it("listing card without a size shows both sizes", () => {
    expect(getProductFacts(byId("cartalax"), undefined, 47.99).sizeLabel).toBe("20 or 60 caps");
  });

  it("renders nothing about days or cost when dosing is ambiguous", () => {
    const f = getProductFacts(byId("cartalax"), "20", 47.99);
    expect(f.daysPerBottle).toBeUndefined();
    expect(f.coverageLabel).toBeUndefined();
    expect(f.costPerDayUSD).toBeUndefined();
  });

  it("single-size products without a bottle count show no size or cost", () => {
    const f = getProductFacts(byId("revilab-ml-01"), undefined, 113.99);
    expect(f.sizeLabel).toBeUndefined();
    expect(f.costPerDayUSD).toBeUndefined();
  });

  it("every dosing entry belongs to a real product and quotes its usage text", () => {
    for (const [id, d] of Object.entries(DOSING)) {
      const p = byId(id);
      expect(p, id).toBeTruthy();
      expect(p.usage ?? "", id).toContain(d.source.slice(0, 20));
    }
  });
});
