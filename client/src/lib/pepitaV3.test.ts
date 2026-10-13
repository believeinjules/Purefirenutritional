import { describe, expect, it } from "vitest";
import { nextQuestions, relevantProduct, shortAnswer } from "./pepitaPreview";
import type { PeppyProductSuggestion } from "@shared/peppy/types";

const sug = (id: string, name: string): PeppyProductSuggestion =>
  ({ product: { id, name } as PeppyProductSuggestion["product"], why: "", evidenceNote: "" });

describe("Pepita v3 answer shape", () => {
  it("drops the report-style opener and [n] markers, max 3 sentences", () => {
    expect(
      shortAnswer("Here's what Endoluten is, what the research does and doesn't show, and who it may suit. Endoluten is a pineal complex [1]. Two. Three. Four.")
    ).toBe("Endoluten is a pineal complex. Two. Three.");
  });
  it("shows a product only when the question names it, at most one", () => {
    const s = [sug("endoluten", "Endoluten"), sug("vladonix", "Vladonix")];
    expect(relevantProduct(s, "What is Endoluten?")?.product.id).toBe("endoluten");
    expect(relevantProduct(s, "Why am I tired in the afternoon?")).toBeNull();
    expect(relevantProduct(s, undefined)).toBeNull();
  });
  it("never shows a hidden product even if named", () => {
    expect(relevantProduct([sug("femalin", "Femalin")], "What is Femalin?")).toBeNull();
  });
  it("at most two next-question chips", () => {
    expect(nextQuestions(["a", "b", "c", "d"])).toEqual(["a", "b"]);
  });
});
