/**
 * Server-side validation of LLM output. The model's JSON is never trusted:
 *  - citations must be ids we retrieved (anything else is dropped);
 *  - products must be candidates we offered, allowed by the guards, and in stock;
 *  - product copy must pass the claim filter (else curated copy, else dropped);
 *  - prose goes through the claim sanitiser; caps are applied;
 *  - safety notices and dosage directions always come from the deterministic engine.
 * Returns null when the output is unusable, so the caller serves the fallback answer.
 */
import {
  isCompliantEvidenceNote,
  isCompliantProductCopy,
  sanitizeAnswerProse,
  BANNED_TERMS,
} from "./claims.js";
import type { Analysis } from "./engine.js";
import { clampText, normalizeForMatch } from "./text.js";
import {
  PEPPY_LIMITS,
  type AnswerSection,
  type PeppyProduct,
  type PeppyProductSuggestion,
  type PeppyResponse,
  type PeppySourceCard,
} from "./types.js";

export interface ValidationReport {
  droppedSources: string[];
  droppedProducts: string[];
  rewrittenProductCopy: number;
  removedSentences: number;
}

export function parseLlmJson(raw: string): Record<string, unknown> | null {
  if (typeof raw !== "string") return null;
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function cleanList(v: unknown, max: number, maxLen: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr(v)) {
    const s = str(item);
    if (!s || s.length > maxLen || BANNED_TERMS.test(s)) continue;
    const key = normalizeForMatch(s);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

export function validateLlmAnswer(input: {
  raw: string | Record<string, unknown>;
  analysis: Analysis;
  sources: PeppySourceCard[];
  candidates: PeppyProductSuggestion[];
  catalog: Map<string, PeppyProduct>;
  draft: PeppyResponse;
}): { response: PeppyResponse; report: ValidationReport } | null {
  const { analysis, sources, candidates, catalog, draft } = input;
  const data =
    typeof input.raw === "string" ? parseLlmJson(input.raw) : input.raw;
  if (!data) return null;

  const report: ValidationReport = {
    droppedSources: [],
    droppedProducts: [],
    rewrittenProductCopy: 0,
    removedSentences: 0,
  };
  const names = Array.from(catalog.values()).map(p => p.name);

  // Summary (required).
  const summaryClean = sanitizeAnswerProse(
    clampText(str(data.summary), 900),
    names
  );
  report.removedSentences += summaryClean.removed;
  if (summaryClean.text.length < 20) return null;

  // Sections.
  let sections: AnswerSection[] = [];
  for (const item of arr(data.sections).slice(0, 5)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const body = sanitizeAnswerProse(clampText(str(rec.body), 1400), names);
    report.removedSentences += body.removed;
    if (!body.text) continue;
    const heading = clampText(str(rec.heading), 80);
    sections.push(
      heading && !BANNED_TERMS.test(heading)
        ? { heading, body: body.text }
        : { body: body.text }
    );
  }
  if (
    analysis.intent === "dosage" &&
    draft.sections[0]?.heading === "Manufacturer's directions"
  ) {
    sections = [
      draft.sections[0],
      ...sections.filter(
        s => !/direction|how to take|dos(e|age)/i.test(s.heading ?? "")
      ),
    ];
  }

  // Citations: only ids we retrieved.
  const byId = new Map(sources.map(s => [s.id, s]));
  const research: PeppySourceCard[] = [];
  for (const id of arr(data.sourceIds)) {
    const key = str(id);
    const src = byId.get(key);
    if (!src) {
      if (key) report.droppedSources.push(key);
      continue;
    }
    if (!research.includes(src)) research.push(src);
  }
  // If the model cited nothing valid but we have curated evidence, show the curated set.
  const finalResearch = (research.length ? research : draft.research).slice(
    0,
    PEPPY_LIMITS.maxSources
  );

  // Products: candidates only, guards respected, claim-filtered copy.
  const products: PeppyProductSuggestion[] = [];
  const candidateById = new Map(candidates.map(c => [c.product.id, c]));
  if (analysis.productsAllowed) {
    for (const item of arr(data.products)) {
      if (products.length >= PEPPY_LIMITS.maxProducts) break;
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const id = str(rec.id);
      const candidate = candidateById.get(id);
      const product = catalog.get(id);
      if (
        !candidate ||
        !product ||
        !product.inStock ||
        products.some(p => p.product.id === id)
      ) {
        if (id) report.droppedProducts.push(id);
        continue;
      }
      let why = clampText(str(rec.why), 240);
      if (!why || !isCompliantProductCopy(why)) {
        report.rewrittenProductCopy++;
        why = candidate.why;
      }
      let evidenceNote = clampText(str(rec.evidenceNote), 240);
      if (!evidenceNote || !isCompliantEvidenceNote(evidenceNote)) {
        report.rewrittenProductCopy++;
        evidenceNote = candidate.evidenceNote;
      }
      if (
        !isCompliantProductCopy(why) ||
        !isCompliantEvidenceNote(evidenceNote)
      ) {
        report.droppedProducts.push(id);
        continue;
      }
      products.push({ product, why, evidenceNote });
    }
  } else {
    for (const item of arr(data.products)) {
      const id =
        item && typeof item === "object"
          ? str((item as Record<string, unknown>).id)
          : "";
      if (id) report.droppedProducts.push(id);
    }
  }

  const evidenceNoteRaw = clampText(str(data.evidenceNote), 260);
  const evidenceNote =
    evidenceNoteRaw &&
    isCompliantEvidenceNote(evidenceNoteRaw) &&
    !BANNED_TERMS.test(evidenceNoteRaw)
      ? evidenceNoteRaw
      : draft.evidenceNote;

  const followUps = cleanList(data.followUps, PEPPY_LIMITS.maxFollowUps, 200);
  let suggestions = cleanList(
    data.suggestions,
    PEPPY_LIMITS.maxSuggestions,
    90
  );
  if (suggestions.length < 2) {
    const have = new Set(suggestions.map(normalizeForMatch));
    suggestions = [
      ...suggestions,
      ...draft.suggestions.filter(s => !have.has(normalizeForMatch(s))),
    ].slice(0, PEPPY_LIMITS.maxSuggestions);
  }

  return {
    response: {
      mode: "llm",
      summary: summaryClean.text,
      sections,
      research: finalResearch,
      evidenceNote,
      safety: draft.safety,
      followUps,
      suggestions,
      products,
      showDisclaimer: draft.showDisclaimer || products.length > 0,
      topics: draft.topics,
    },
    report,
  };
}
