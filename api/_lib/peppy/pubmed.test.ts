import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanTitle,
  clearPubmedCache,
  parseEfetchConclusions,
  parseEsearchIds,
  parseEsummary,
  searchPubmed,
  studyTypeFromPubTypes,
} from "./pubmed";

const esummary = {
  result: {
    uids: ["111", "222", "333", "bad"],
    "111": {
      uid: "111",
      title:
        "Melatonin for sleep: a &lt;i&gt;meta-analysis&lt;/i&gt; of randomized trials.",
      pubtype: ["Journal Article", "Meta-Analysis"],
      fulljournalname: "Sleep Medicine Reviews",
      pubdate: "2013 May",
      authors: [
        { name: "Ferracioli-Oda E" },
        { name: "Qawasmi A" },
        { name: "Bloch MH" },
        { name: "Extra A" },
      ],
      articleids: [{ idtype: "doi", value: "10.1/abc" }],
    },
    "222": {
      uid: "222",
      title: "Retracted: something",
      pubtype: ["Retracted Publication"],
      pubdate: "2020",
    },
    "333": {
      uid: "333",
      title: "A trial of ginseng in fatigue.",
      pubtype: ["Randomized Controlled Trial"],
      source: "J Test",
      pubdate: "2018 Jan 3",
    },
  },
};

describe("PubMed parsing", () => {
  it("keeps titles verbatim apart from markup, skips retractions, classifies study type", () => {
    const out = parseEsummary(esummary);
    expect(out.map(s => s.pmid)).toEqual(["111", "333"]);
    expect(out[0].title).toBe(
      "Melatonin for sleep: a meta-analysis of randomized trials."
    );
    expect(out[0].studyType).toBe("systematic-review");
    expect(out[0].authors).toBe(
      "Ferracioli-Oda E, Qawasmi A, Bloch MH, et al."
    );
    expect(out[0].year).toBe("2013");
    expect(out[0].doi).toBe("10.1/abc");
    expect(out[0].url).toBe("https://pubmed.ncbi.nlm.nih.gov/111/");
    expect(out[0].origin).toBe("pubmed-live");
    expect(out[0].finding).toMatch(/hasn't summarised/);
    expect(out[1].studyType).toBe("rct");
    expect(out[1].journal).toBe("J Test");
  });
  it("tolerates junk payloads", () => {
    expect(parseEsummary(null)).toEqual([]);
    expect(parseEsummary({ result: { uids: "x" } })).toEqual([]);
    expect(
      parseEsearchIds({ esearchresult: { idlist: ["1", "x2", 3] } })
    ).toEqual(["1", "3"]);
  });
  it("maps publication types and decodes entities", () => {
    expect(studyTypeFromPubTypes(["Systematic Review"])).toBe(
      "systematic-review"
    );
    expect(studyTypeFromPubTypes(["Clinical Trial, Phase II"])).toBe(
      "clinical"
    );
    expect(studyTypeFromPubTypes(["Review"])).toBe("review");
    expect(cleanTitle("Omega-3 &amp; mood&#39;s &#x3b1; test")).toBe(
      "Omega-3 & mood's α test"
    );
  });
});

describe("abstract conclusions", () => {
  it("quotes a labelled conclusion, else the closing sentence", () => {
    const xml = `<PubmedArticle><PMID Version="1">1</PMID><AbstractText Label="CONCLUSION">Iron &amp; fatigue: <i>benefit</i> when ferritin is low.</AbstractText></PubmedArticle>
<PubmedArticle><PMID Version="1">2</PMID><AbstractText>Background text. This trial found no difference between collagen and placebo for pain scores.</AbstractText></PubmedArticle>`;
    const out = parseEfetchConclusions(xml);
    expect(out.get("1")).toEqual({
      kind: "conclusion",
      text: "Iron & fatigue: benefit when ferritin is low.",
    });
    expect(out.get("2")).toEqual({
      kind: "closing",
      text: "This trial found no difference between collagen and placebo for pain scores.",
    });
  });
});

describe("searchPubmed", () => {
  beforeEach(() => clearPubmedCache());

  const respond = (body: unknown) => ({
    ok: true,
    json: async () => body,
    text: async () => String(body),
  });
  const efetchXml = `<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID Version="1">111</PMID><Article><Abstract>
    <AbstractText Label="RESULTS">Sleep onset improved.</AbstractText>
    <AbstractText Label="CONCLUSIONS" NlmCategory="CONCLUSIONS">Melatonin modestly reduces sleep onset latency.</AbstractText>
  </Abstract></Article></MedlineCitation></PubmedArticle></PubmedArticleSet>`;

  it("broadens when the high-evidence query finds too little, then caches", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("esearch") && url.includes("meta-analysis"))
        return respond({ esearchresult: { idlist: ["111"] } });
      if (url.includes("esearch"))
        return respond({ esearchresult: { idlist: ["111", "333"] } });
      if (url.includes("efetch")) return respond(efetchXml);
      return respond(esummary);
    });
    const first = await searchPubmed("melatonin sleep", { fetchImpl });
    expect(first.map(s => s.pmid)).toEqual(["111", "333"]);
    expect(first[0].finding).toBe(
      'Authors\' conclusion: "Melatonin modestly reduces sleep onset latency."'
    );
    expect(first[1].finding).toMatch(/hasn't summarised/);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
    const esummaryUrl = fetchImpl.mock.calls
      .map(c => c[0] as string)
      .find(u => u.includes("esummary"))!;
    expect(esummaryUrl).toContain("id=111,333");
    expect(esummaryUrl).toContain("tool=purefire-peppy");
    await searchPubmed("melatonin sleep", { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it("returns [] on HTTP errors and timeouts instead of throwing", async () => {
    const failing = vi.fn(async () => ({ ok: false, json: async () => ({}) }));
    expect(await searchPubmed("x", { fetchImpl: failing })).toEqual([]);
    const hanging = vi.fn(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise<never>((_, reject) =>
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted"))
          )
        )
    );
    expect(
      await searchPubmed("y", { fetchImpl: hanging, timeoutMs: 20 })
    ).toEqual([]);
  });
});
