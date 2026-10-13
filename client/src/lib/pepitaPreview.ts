/**
 * Pure helpers behind Pepita's citation and product previews (no React, unit tested).
 */
import { isHiddenProduct } from "@shared/hidden-products";
import type {
  PeppyProductSuggestion,
  PeppySourceCard,
  StudyType,
} from "@shared/peppy/types";

export const STUDY_TYPE_LABEL: Record<StudyType, string> = {
  "systematic-review": "Systematic review",
  rct: "Randomised trial",
  clinical: "Clinical study",
  observational: "Observational",
  review: "Review",
  animal: "Animal study",
  "in-vitro": "Lab study",
  guidance: "NIH / FDA guidance",
  other: "Study",
};

export interface CitationSummary {
  /** Verbatim published title. */
  title: string;
  year?: string;
  studyType: string;
  finding: string;
  limitation: string;
  url: string;
}

/** Tooltip / modal summary, taken only from fields already on the source. */
export function citationSummary(source: PeppySourceCard): CitationSummary {
  return {
    title: source.title,
    year: source.year?.trim() || undefined,
    studyType: STUDY_TYPE_LABEL[source.studyType] ?? STUDY_TYPE_LABEL.other,
    finding: source.finding,
    limitation: source.limitation,
    url: source.url,
  };
}

/**
 * Hosts whose pages may be shown in an iframe on our origin. Checked with
 * `curl -I` (Oct 2026) against every host in shared/peppy/research-registry.ts
 * plus PMC; all of them refuse framing, so the list is empty:
 *   pubmed.ncbi.nlm.nih.gov  bot challenge to curl; refuses framing in browsers
 *   pmc.ncbi.nlm.nih.gov     X-Frame-Options: DENY
 *   medlineplus.gov          SAMEORIGIN + frame-ancestors 'self' nnlm/medlineplus
 *   ods.od.nih.gov, www.fda.gov, www.nei.nih.gov, www.niams.nih.gov  SAMEORIGIN
 *   www.nccih.nih.gov        DENY + frame-ancestors 'none'
 * Add a host only after confirming it sends neither header (a blocked frame
 * renders blank and can't be detected reliably from the page).
 */
export const FRAMEABLE_HOSTS: ReadonlySet<string> = new Set<string>([]);

export type StudyOpenMode =
  /** Show the page in the modal iframe. */
  | { mode: "embed"; url: string }
  /** Show the summary with an "Open study in new tab" button. */
  | { mode: "new-tab"; url: string; reason: "not-frameable" | "pdf" };

export function isPdfUrl(url: URL): boolean {
  return /\.pdf$/i.test(url.pathname);
}

/** Decide ahead of time whether a study URL can be embedded; never guess. */
export function studyOpenMode(
  rawUrl: string,
  frameable: ReadonlySet<string> = FRAMEABLE_HOSTS
): StudyOpenMode | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const allowed =
    url.protocol === "https:" && frameable.has(url.hostname.toLowerCase());
  if (allowed) return { mode: "embed", url: url.href };
  return {
    mode: "new-tab",
    url: url.href,
    reason: isPdfUrl(url) ? "pdf" : "not-frameable",
  };
}

/** Render-time guard: suggestions that may become links, cards or add-to-cart. */
export function visibleSuggestions(
  suggestions: readonly PeppyProductSuggestion[]
): PeppyProductSuggestion[] {
  return suggestions.filter(s => s?.product && !isHiddenProduct(s.product));
}

/** Everyday wording for study types (no "RCT" / "meta-analysis" jargon). */
export const PLAIN_STUDY_TYPE: Record<StudyType, string> = {
  "systematic-review": "A review that pooled many studies",
  rct: "A controlled trial in people",
  clinical: "A study in people",
  observational: "A study that observed people",
  review: "An overview of earlier research",
  animal: "A study in animals",
  "in-vitro": "A lab study on cells",
  guidance: "Government health information (NIH / FDA)",
  other: "A published study",
};

/** First sentence of a registry field, verbatim (no paraphrase, no new facts). */
export function firstSentence(text: string | undefined, max = 220): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = t.match(/^.+?[.!?](?=\s|$)/);
  const s = m ? m[0] : t;
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

export interface PlainStudySummary {
  /** Verbatim published title. */
  title: string;
  kind: string;
  year?: string;
  /** Journal / publisher. */
  source?: string;
  found: string;
  caveat: string;
  url: string;
}

/** 1–2 sentence hover summary built only from the source's existing fields. */
export function plainStudySummary(source: PeppySourceCard): PlainStudySummary {
  return {
    title: source.title,
    kind: PLAIN_STUDY_TYPE[source.studyType] ?? PLAIN_STUDY_TYPE.other,
    year: source.year?.trim() || undefined,
    source: source.journal?.trim() || undefined,
    found: firstSentence(source.finding),
    caveat: firstSentence(source.limitation),
    url: source.url,
  };
}

export type AnswerPiece =
  | { type: "text"; text: string }
  | { type: "cite"; index: number };

/** Splits "text [1] more [2, 3]" into text and citation pieces; unknown numbers are dropped. */
export function splitCitations(text: string, count: number): AnswerPiece[] {
  const out: AnswerPiece[] = [];
  let last = 0;
  for (const m of Array.from(text.matchAll(/\s?\[(\d+(?:\s*,\s*\d+)*)\]/g))) {
    out.push({ type: "text", text: text.slice(last, m.index) });
    for (const n of m[1].split(",").map(x => Number(x.trim()))) {
      if (n >= 1 && n <= count) out.push({ type: "cite", index: n - 1 });
    }
    last = m.index! + m[0].length;
  }
  out.push({ type: "text", text: text.slice(last) });
  return out.filter(p => p.type === "cite" || p.text.length > 0);
}

/** Whole answer prose as at most two short paragraphs (sections are summarised elsewhere). */
export function conciseParagraphs(summary: string): string[] {
  const paras = summary
    .split(/\n{2,}/)
    .map(p => p.replace(/^[-•*]\s+/gm, "").replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  return paras.length <= 2 ? paras : [paras[0], paras.slice(1).join(" ")];
}
