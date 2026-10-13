import { describe, expect, it } from "vitest";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import type {
  PeppyProductSuggestion,
  PeppySourceCard,
} from "@shared/peppy/types";
import { RESEARCH_REGISTRY } from "@shared/peppy/research-registry";
import {
  FRAMEABLE_HOSTS,
  STUDY_TYPE_LABEL,
  citationSummary,
  studyOpenMode,
  visibleSuggestions,
} from "./pepitaPreview";

const source: PeppySourceCard = {
  id: "pmid:12374906",
  kind: "pubmed",
  title: "Peptide regulation of ageing: the Original Title, verbatim.",
  journal: "Some Journal",
  year: "2002",
  pmid: "12374906",
  url: "https://pubmed.ncbi.nlm.nih.gov/12374906/",
  studyType: "animal",
  finding: "Mice lived longer.",
  limitation: "Animal study; not tested in people.",
  origin: "curated",
};

describe("citationSummary", () => {
  it("maps only existing fields, title verbatim", () => {
    expect(citationSummary(source)).toEqual({
      title: source.title,
      year: "2002",
      studyType: "Animal study",
      finding: "Mice lived longer.",
      limitation: "Animal study; not tested in people.",
      url: source.url,
    });
  });
  it("omits a missing or blank year instead of inventing one", () => {
    expect(
      citationSummary({ ...source, year: undefined }).year
    ).toBeUndefined();
    expect(citationSummary({ ...source, year: " " }).year).toBeUndefined();
  });
  it("labels every study type", () => {
    for (const t of Object.keys(STUDY_TYPE_LABEL))
      expect(
        citationSummary({ ...source, studyType: t as never }).studyType
      ).toBe(STUDY_TYPE_LABEL[t as keyof typeof STUDY_TYPE_LABEL]);
  });
});

describe("studyOpenMode", () => {
  it("never embeds the registry hosts (all refuse framing)", () => {
    expect(RESEARCH_REGISTRY.length).toBeGreaterThan(0);
    for (const s of RESEARCH_REGISTRY) {
      expect(studyOpenMode(s.url)?.mode).toBe("new-tab");
    }
    expect(FRAMEABLE_HOSTS.size).toBe(0);
  });
  it("embeds only allowlisted https hosts", () => {
    const allow = new Set(["example.org"]);
    expect(studyOpenMode("https://example.org/a", allow)).toEqual({
      mode: "embed",
      url: "https://example.org/a",
    });
    expect(studyOpenMode("http://example.org/a", allow)?.mode).toBe("new-tab");
    expect(studyOpenMode("https://evil.example.org/a", allow)?.mode).toBe(
      "new-tab"
    );
  });
  it("flags PDFs so they open in a new tab, never as a download", () => {
    expect(studyOpenMode("https://www.fda.gov/media/1/download.PDF")).toEqual({
      mode: "new-tab",
      url: "https://www.fda.gov/media/1/download.PDF",
      reason: "pdf",
    });
  });
  it("rejects non-web or malformed URLs", () => {
    expect(studyOpenMode("javascript:alert(1)")).toBeNull();
    expect(studyOpenMode("not a url")).toBeNull();
  });
});

describe("visibleSuggestions", () => {
  const s = (id: string) =>
    ({
      product: { id },
      why: "",
      evidenceNote: "",
    }) as unknown as PeppyProductSuggestion;
  it("drops every hidden product", () => {
    const all = [...Array.from(HIDDEN_PRODUCT_IDS), "endoluten"].map(s);
    expect(visibleSuggestions(all).map(x => x.product.id)).toEqual([
      "endoluten",
    ]);
  });
  it("drops products flagged hidden or inactive", () => {
    const flagged = [
      { ...s("a"), product: { id: "a", hidden: true } },
      { ...s("b"), product: { id: "b", active: false } },
    ] as unknown as PeppyProductSuggestion[];
    expect(visibleSuggestions(flagged)).toEqual([]);
  });
});
