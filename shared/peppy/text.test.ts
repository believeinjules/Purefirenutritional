import { describe, expect, it } from "vitest";
import {
  toInlinePhrase,
  capitalizeFirst,
  clampText,
  splitSentences,
} from "./text";
import { buildCatalog } from "./catalog";
import { productWhyFromCatalog } from "./engine";

describe("toInlinePhrase (the 'listed for cNS function' bug)", () => {
  it("keeps acronyms, digit words and hyphenated prefixes intact", () => {
    expect(toInlinePhrase("CNS function")).toBe("CNS function");
    expect(toInlinePhrase("DNA repair support")).toBe("DNA repair support");
    expect(toInlinePhrase("CoQ10 levels")).toBe("CoQ10 levels");
    expect(toInlinePhrase("B12 status")).toBe("B12 status");
    expect(toInlinePhrase("T-cell maturation")).toBe("T-cell maturation");
  });
  it("lower-cases ordinary sentence-start words and trims trailing punctuation", () => {
    expect(toInlinePhrase("Crosses blood-brain barrier.")).toBe(
      "crosses blood-brain barrier"
    );
    expect(toInlinePhrase("Healthy sleep rhythm;")).toBe(
      "healthy sleep rhythm"
    );
  });
  it("is used for catalog-derived product lines", () => {
    const catalog = buildCatalog([
      {
        id: "x-brain",
        name: "Test Brain",
        priceUSD: 10,
        benefits: ["CNS function"],
        ingredients: ["Magnesium"],
      },
    ]);
    const why = productWhyFromCatalog(catalog.get("x-brain")!);
    expect(why).toContain("CNS function");
    expect(why).not.toContain("cNS");
  });
});

describe("text helpers", () => {
  it("capitalizes, clamps on word boundaries and splits sentences", () => {
    expect(capitalizeFirst("hello")).toBe("Hello");
    expect(clampText("one two three four", 9).length).toBeLessThanOrEqual(10);
    expect(splitSentences("One. Two? Three!")).toHaveLength(3);
  });
});
