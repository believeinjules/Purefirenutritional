import { describe, expect, it } from "vitest";
import { answerPeppy } from "./respond";
import { buildCatalog } from "./catalog";
import { extractProfile, missingSlotQuestions } from "./profile";
import { PEPPY_SYSTEM_PROMPT } from "./prompt";
import { HIDDEN_PRODUCT_IDS } from "../hidden-products";
import { products } from "../../client/src/data/products";

const catalog = buildCatalog(products as unknown as Parameters<typeof buildCatalog>[0]);

describe("Pepita v6 response logic", () => {
  it("joint pain: cartilage bioregulator + Prime Peptide Joints (+ collagen), verified protocols, 2–3 follow-ups", async () => {
    const { response } = await answerPeppy({ message: "My knees ache, what could help?" }, { catalog });
    expect(response.products.map(p => p.product.id)).toEqual(["sigumir", "prime-peptide-joints", "prime-peptide-collagen"]);
    expect(response.products.map(p => p.family)).toEqual(["khavinson", "prime-peptide", "prime-peptide"]);
    for (const p of response.products) expect(p.protocol).toMatch(/^Manufacturer protocol: .*not a clinically validated regimen/);
    expect(response.followUps.length).toBeGreaterThanOrEqual(2);
    expect(response.followUps.length).toBeLessThanOrEqual(3);
    expect(response.learnMore?.map(s => s.heading)).toContain("How the three picks differ");
    expect(response.summary).not.toMatch(/^(evidence is limited|only animal)/i);
    expect(response.summary).not.toMatch(/only cell and animal studies/i);
  });

  it("remembers answers and refines picks instead of restarting", async () => {
    const history = [
      { role: "user" as const, content: "My knees ache, what could help?" },
      { role: "assistant" as const, content: "..." },
      { role: "user" as const, content: "about 3 months" },
      { role: "assistant" as const, content: "..." },
    ];
    const { response } = await answerPeppy({ message: "I'm 55 and I run", history }, { catalog });
    expect(response.summary).toMatch(/^Thanks, that helps: .*55 years old.*3 months/);
    expect(response.products[0].product.id).toBe("prime-peptide-joints");
    expect(response.followUps.join(" ")).not.toMatch(/how old/i);
  });

  it("tracks slots", () => {
    const p = extractProfile("I'm 55, knee pain for 3 months, I run and want to prevent it getting worse");
    expect(p).toMatchObject({ age: "55", duration: "3 months", activity: "run", area: "knee", goal: "prevention" });
    expect(missingSlotQuestions(p)).toEqual([]);
  });

  it("never shows hidden products", async () => {
    for (const m of ["My knees ache", "What helps women's health?", "Something for sleep?", "What supports the liver?"]) {
      const { response } = await answerPeppy({ message: m }, { catalog });
      for (const s of response.products) expect(HIDDEN_PRODUCT_IDS.has(s.product.id)).toBe(false);
    }
  });

  it("prompt carries the v6 response order and evidence framing", () => {
    for (const t of ["RESPONSE ORDER", "learnMore", "Khavinson bioregulators", "Prime Peptide formulations", "Revilab", "never lump them", "customerProfile", "not a clinically validated regimen"])
      expect(PEPPY_SYSTEM_PROMPT).toContain(t);
  });
});
