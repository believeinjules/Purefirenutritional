import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { buildCatalog } from "./catalog";
import { answerPeppy } from "./respond";
import { sentenceChunks, splitSentences } from "./text";
import { firstSentence, shortAnswer } from "../../client/src/lib/pepitaPreview";

describe("sentence splitting keeps abbreviations whole", () => {
  it("does not end a sentence at p., pp., No., e.g., i.e., vs., approx., et al.", () => {
    const t =
      "See the brochure, p. 103 and pp. 12-14. Partner No. 296389 applies. Some, e.g. Vesugen, i.e. AC-2, vs. Ventfort, approx. 2 caps. Khavinson et al. reported it.";
    const want = [
      "See the brochure, p. 103 and pp. 12-14.",
      "Partner No. 296389 applies.",
      "Some, e.g. Vesugen, i.e. AC-2, vs. Ventfort, approx. 2 caps.",
      "Khavinson et al. reported it.",
    ];
    expect(splitSentences(t)).toEqual(want);
    expect(sentenceChunks(t)).toEqual(want);
    expect(shortAnswer(t, 1)).toBe(want[0]);
    expect(firstSentence(t)).toBe(want[0]);
  });
  it("still ends a sentence at a plain 'no.'", () => {
    expect(splitSentences("The answer is no. Ask your doctor.")).toEqual(["The answer is no.", "Ask your doctor."]);
  });
});

describe("Vesugen dosage answer", () => {
  it("shows the full 'p. 103' citation in the on-screen answer", async () => {
    const { response } = await answerPeppy(
      { message: "What's the dosage for Vesugen?", history: [] },
      { catalog: buildCatalog(products as never) }
    );
    expect(response.summary).toContain("(Cytomax and Cytogen product brochure, p. 103; the same text as our product page.)");
    // On screen the answer is cut to 3 sentences (PeppyAnswer); the quote + citation must survive that.
    const shown = shortAnswer(response.summary, 3);
    expect(shown).toContain("product brochure, p. 103;");
    expect(shown).toContain("not results from clinical trials of this product.");
    expect(shown).not.toMatch(/peptid\.ru/);
  });
});
