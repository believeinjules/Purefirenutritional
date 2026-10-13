import { describe, expect, it } from "vitest";
import {
  ASSISTANT_DISCLAIMER,
  detectGuards,
  detectRedFlag,
  isCompliantProductCopy,
  productsBlockedBy,
  safeBenefits,
  sanitizeAnswerProse,
} from "./claims";

describe("disclaimer text", () => {
  it("is the exact existing FDA line", () => {
    expect(ASSISTANT_DISCLAIMER).toBe(
      "These statements have not been evaluated by the FDA.\nAlways consult a medical professional."
    );
  });
});

describe("red flags", () => {
  it.each([
    ["I have chest pain and my left arm hurts", "cardiac"],
    ["I think I'm having a stroke, my face is drooping", "stroke"],
    ["I can't breathe after taking it", "breathing"],
    ["my throat is swelling", "allergy"],
    ["my kid swallowed a whole bottle", "overdose"],
    ["I don't want to live anymore", "crisis"],
  ])("%s → %s", (msg, kind) => {
    expect(detectRedFlag(msg)).toBe(kind);
  });
  it("does not fire on risk or research questions", () => {
    expect(detectRedFlag("does omega-3 lower stroke risk?")).toBeNull();
    expect(detectRedFlag("what reduces heart attack risk")).toBeNull();
    expect(detectRedFlag("Why am I tired in the afternoon?")).toBeNull();
  });
});

describe("guards", () => {
  it("detects pregnancy, children, disease asks and drug replacement", () => {
    expect(detectGuards("I'm pregnant, can I take Vladonix?").pregnancy).toBe(
      true
    );
    expect(detectGuards("what about for my 8 year old").pediatric).toBe(true);
    expect(detectGuards("Can peptides cure my diabetes?").disease).toBe(true);
    expect(
      detectGuards("Can I stop my thyroid medication and use Thyreogen?")
        .drugReplacement
    ).toBe(true);
    expect(detectGuards("I'm on warfarin, is omega 3 ok?").bloodThinners).toBe(
      true
    );
  });
  it("blocks products for hard guards only", () => {
    expect(
      productsBlockedBy(detectGuards("I'm on a statin, what helps energy?"))
    ).toEqual([]);
    expect(
      productsBlockedBy(detectGuards("I'm breastfeeding, what helps sleep?"))
    ).toEqual(["pregnancy"]);
  });
  it("doesn't treat height or adult ages as pediatric", () => {
    expect(detectGuards("I'm 5 foot 4 and always tired").pediatric).toBe(false);
    expect(detectGuards("my 45 year old husband snores").pediatric).toBe(false);
  });
});

describe("claim filter", () => {
  it("strips percentage, lifespan, telomere and dosage benefits", () => {
    expect(
      safeBenefits([
        "Lifespan extension 30–40%",
        "Telomere lengthening",
        "Healthy sleep rhythm",
        "Take 2 capsules",
      ])
    ).toEqual(["Healthy sleep rhythm"]);
  });
  it("rejects disease or banned wording in product copy", () => {
    expect(isCompliantProductCopy("Supports healthy cartilage.")).toBe(true);
    expect(isCompliantProductCopy("Treats arthritis.")).toBe(false);
    expect(isCompliantProductCopy("A natural oncoprotector.")).toBe(false);
    expect(
      isCompliantProductCopy("Clinically proven to lengthen telomeres.")
    ).toBe(false);
  });
  it("drops prose sentences tying a product to a disease, and any banned term", () => {
    const { text, removed } = sanitizeAnswerProse(
      "Sleep matters. Endoluten treats insomnia. Epitalon is an anti-cancer peptide. Endoluten is a pineal peptide complex.",
      ["Endoluten"]
    );
    expect(text).toBe("Sleep matters. Endoluten is a pineal peptide complex.");
    expect(removed).toBe(2);
  });
});
