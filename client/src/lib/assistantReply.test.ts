import { describe, it, expect } from "vitest";
import { ASSISTANT_DISCLAIMER, composeAssistantReply } from "./assistantReply";

const vague = "what helps fatigue and energy?";

function turn(partial: Parameters<typeof composeAssistantReply>[0]) {
  return composeAssistantReply(partial);
}

describe("shop assistant replies", () => {
  it("asks one follow-up and names no products on a vague first question", () => {
    const reply = turn({
      phase: "idle",
      context: "",
      message: vague,
      listedIds: [],
      candidates: [],
    });
    expect(reply.phase).toBe("need-detail");
    expect(reply.productIds).toEqual([]);
    expect(reply.content.toLowerCase()).not.toMatch(/panaxod|endoluten|revilab/);
    expect(reply.content).toMatch(/how long/i);
    expect(reply.content).toMatch(/sleep/i);
    expect(reply.content).toMatch(/thyroid/i);
    expect(reply.content).toMatch(/medication/i);
    expect(reply.content).toContain(ASSISTANT_DISCLAIMER);
    expect(reply.content).not.toMatch(/pubmed|pmid/i);
  });

  it("narrows when several products fit, instead of a long list", () => {
    const reply = turn({
      phase: "need-detail",
      context: vague,
      message: "for 6 months, I sleep poorly, thyroid is fine, no medications",
      listedIds: [],
      candidates: [],
    });
    expect(reply.phase).toBe("need-narrow");
    expect(reply.productIds).toEqual([]);
    expect(reply.candidates.length).toBeGreaterThan(3);
    expect(reply.content).toMatch(/which one do you want/i);
    expect(reply.content).toContain(ASSISTANT_DISCLAIMER);
    expect(reply.content).not.toMatch(/pubmed/i);
  });

  it("then returns a short buy list with a catalog blurb and no invented study", () => {
    const narrowed = turn({
      phase: "need-detail",
      context: vague,
      message: "for 6 months, I sleep poorly, thyroid is fine, no medications",
      listedIds: [],
      candidates: [],
    });
    const reply = turn({
      phase: "need-narrow",
      context: narrowed.context,
      message: "Panaxod",
      listedIds: [],
      candidates: narrowed.candidates,
    });
    expect(reply.productIds).toEqual(["panaxod"]);
    expect(reply.explanations.panaxod).toMatch(/Panaxod is listed for/i);
    expect(reply.explanations.panaxod.split(".").filter(Boolean).length).toBeLessThanOrEqual(2);
    expect(reply.content).toMatch(/short list/i);
    expect(reply.content).toMatch(/not listed/i);
    expect(reply.content).toContain("These statements have not been evaluated by the FDA.");
    expect(reply.content).toContain("Always consult a medical professional.");
    expect(reply.content).not.toMatch(/pregnancy|allergic|discontinue use/i);
    expect(reply.content).not.toMatch(/pubmed/i);
  });

  it("shows an existing study link only after learn more, labeled as a potential role", () => {
    const listed = turn({
      phase: "idle",
      context: "",
      message: "sleep for 4 months, no medications",
      listedIds: [],
      candidates: [],
    });
    expect(listed.productIds.length).toBeGreaterThan(0);
    expect(listed.productIds.length).toBeLessThanOrEqual(3);
    expect(listed.content).not.toMatch(/pubmed/i);
    const index = listed.productIds.indexOf("endoluten");
    expect(index).toBeGreaterThanOrEqual(0);
    const more = turn({
      phase: "listed",
      context: listed.context,
      message: "Learn more",
      listedIds: listed.listedIds,
      candidates: listed.candidates,
    });
    expect(more.productIds).toEqual([]);
    expect(more.content).toContain(
      `Suggestion ${index + 1}'s potential role in sleep and daily rhythm: https://pubmed.ncbi.nlm.nih.gov/11524632/`
    );
    expect(more.content).not.toMatch(/29432159|24389208|27411589/);
    expect(more.content).toContain(ASSISTANT_DISCLAIMER);
  });
});
