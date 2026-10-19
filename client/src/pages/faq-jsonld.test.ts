import { describe, it, expect } from "vitest";
import { render } from "../entry-server";
import { faqs } from "./FAQ";
import { faqPageJsonLd } from "@/lib/seo";

type Question = { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } };

function ldBlocks(scriptTags: string): Array<Record<string, unknown>> {
  return Array.from(scriptTags.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)).map(
    (m) => JSON.parse(m[1]),
  );
}

describe("/faq FAQPage JSON-LD", () => {
  it("has one Question per FAQ entry with the plain-text answer", () => {
    const ld = faqPageJsonLd(faqs);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("FAQPage");
    const qs = ld.mainEntity as Question[];
    expect(qs).toHaveLength(faqs.length);
    qs.forEach((q, i) => {
      expect(q).toEqual({
        "@type": "Question",
        name: faqs[i].question,
        acceptedAnswer: { "@type": "Answer", text: faqs[i].answer },
      });
      expect(q.name.trim()).not.toBe("");
      expect(q.acceptedAnswer.text.trim()).not.toBe("");
      expect(q.acceptedAnswer.text).not.toMatch(/<[a-z/][^>]*>/i);
    });
    expect(new Set(qs.map((q) => q.name)).size).toBe(qs.length);
  });

  it("is in the server-rendered <head> of /faq (what prerender.mjs writes)", () => {
    const { helmet } = render("/faq");
    const blocks = ldBlocks(helmet.script.toString()).filter((b) => b["@type"] === "FAQPage");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual(faqPageJsonLd(faqs));
  });
});
