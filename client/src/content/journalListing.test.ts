import { describe, expect, it } from "vitest";
import { JOURNAL_ARTICLES, JOURNAL_CATEGORIES, JOURNAL_TAGS } from "./learnArticles";
import { mostRead, pinnedArticles, startHereArticles } from "./journalListing";

describe("Journal categorization", () => {
  it("every article has a known category and 2–4 known tags", () => {
    for (const a of JOURNAL_ARTICLES) {
      expect(JOURNAL_CATEGORIES.map((c) => c.id), a.href).toContain(a.category);
      expect(a.tags.length, a.href).toBeGreaterThanOrEqual(2);
      expect(a.tags.length, a.href).toBeLessThanOrEqual(4);
      for (const t of a.tags) expect(Object.keys(JOURNAL_TAGS)).toContain(t);
    }
  });
  it("no category has fewer than 2 posts", () => {
    for (const c of JOURNAL_CATEGORIES) expect(JOURNAL_ARTICLES.filter((a) => a.category === c.id).length).toBeGreaterThanOrEqual(2);
  });
  it("exactly one Start-here pick per category", () => {
    expect(startHereArticles().map((a) => a.category)).toEqual(JOURNAL_CATEGORIES.map((c) => c.id));
  });
  it("glossary is the first pinned reference", () => {
    expect(pinnedArticles()[0].href).toBe("/learn/cytomaxes-cytogens-a-numbers-glossary");
  });
  it("no fabricated view data", () => {
    expect(mostRead()).toEqual([]);
  });
});
