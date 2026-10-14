/**
 * Server-side validation of LLM output. The model's JSON is never trusted:
 *  - citations must be ids we retrieved (anything else is dropped);
 *  - products must be candidates we offered, allowed by the guards, and in stock;
 *  - product copy must pass the claim filter (else curated copy, else dropped);
 *  - prose goes through the claim sanitiser; caps are applied;
 *  - safety notices and dosage directions always come from the deterministic engine.
 * Returns null when the output is unusable, so the caller serves the fallback answer.
 */
import { verifiedFacts } from "./product-data.js";
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
  /** Sentences dropped for recommending other treatments/interventions. */
  removedInterventions?: number;
}

const NUM = /\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+)?/g;
/** True when every number in `text` appears in a verified field (or name) of the mentioned products. */
export function numbersAreVerified(text: string, mentioned: { id: string; name: string }[]): boolean {
  const pool = mentioned.map(p => `${p.name} ${JSON.stringify(verifiedFacts(p.id))}`).join(" ");
  const allowed = new Set((pool.match(NUM) ?? []).map(n => n.replace(/\s/g, "")));
  return (text.replace(/\[\d+\]/g, "").match(NUM) ?? []).every(n => allowed.has(n.replace(/\s/g, "")));
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
    removedInterventions: 0,
  };
  const names = Array.from(catalog.values()).map(p => p.name);

  // Summary (required).
  const summaryClean = sanitizeAnswerProse(
    clampText(str(data.summary), 900),
    names
  );
  report.removedSentences += summaryClean.removed;
  const summaryScoped = withoutInterventionAdvice(summaryClean.text);
  report.removedInterventions! += summaryScoped.removed;
  summaryClean.text = summaryScoped.text;
  if (summaryClean.text.length < 20) return null;
  // No invented doses: in a dosing turn every number must come from a verified product field.
  if (analysis.intent === "dosage" && !numbersAreVerified(summaryClean.text, analysis.mentioned)) {
    summaryClean.text = draft.summary;
    report.removedSentences += 1;
  }

  // Sections.
  let sections: AnswerSection[] = [];
  for (const item of arr(data.sections).slice(0, 5)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const body = sanitizeAnswerProse(clampText(str(rec.body), 1400), names);
    report.removedSentences += body.removed;
    const scoped = withoutInterventionAdvice(body.text);
    report.removedInterventions! += scoped.removed;
    body.text = scoped.text;
    if (!body.text) continue;
    const heading = clampText(str(rec.heading), 80);
    sections.push(
      heading && !BANNED_TERMS.test(heading)
        ? { heading, body: body.text }
        : { body: body.text }
    );
  }
  // "Learn more": deeper science, same prose filters as sections.
  const learnMore: AnswerSection[] = [];
  for (const item of arr(data.learnMore).slice(0, 4)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const body = sanitizeAnswerProse(clampText(str(rec.body), 1400), names);
    report.removedSentences += body.removed;
    const scoped = withoutInterventionAdvice(body.text);
    report.removedInterventions! += scoped.removed;
    if (!scoped.text) continue;
    const heading = clampText(str(rec.heading), 80);
    learnMore.push(
      heading && !BANNED_TERMS.test(heading) ? { heading, body: scoped.text } : { body: scoped.text }
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

  // Inline [n] markers refer to positions in the model's sourceIds; renumber them to
  // the validated list and drop any that point at a rejected or missing source.
  const rawIds = arr(data.sourceIds).map(str);
  const summaryText = remapCitationMarkers(summaryClean.text, n => {
    const src = byId.get(rawIds[n - 1] ?? "");
    const at = src && research.length ? finalResearch.indexOf(src) : -1;
    return at >= 0 ? at + 1 : null;
  });

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
      // Card facts (tissue line, family, verified protocol) come only from our candidate, never the model.
      products.push({
        product,
        why,
        evidenceNote,
        tissue: candidate.tissue,
        family: candidate.family,
        protocol: candidate.protocol,
        research: candidate.research,
        alternatives: candidate.alternatives,
      });
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
      summary: summaryText,
      sections,
      learnMore: learnMore.length ? learnMore : draft.learnMore,
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

/** Rewrites "[2]" / "[1, 3]" markers via `map` (null drops that number; empty markers vanish). */
export function remapCitationMarkers(
  text: string,
  map: (n: number) => number | null
): string {
  return text
    .replace(/\s?\[(\d+(?:\s*,\s*\d+)*)\]/g, (whole, nums: string) => {
      const kept = Array.from(
        new Set(
          nums
            .split(",")
            .map(x => map(Number(x.trim())))
            .filter((x): x is number => x !== null)
        )
      );
      return kept.length ? `${whole.startsWith(" ") ? " " : ""}[${kept.join(", ")}]` : "";
    })
    .trim();
}

/**
 * Pepita answers about peptides/ingredients only (Julia, 2026-10-13): phrases that
 * recommend other treatments or interventions. Cheap and deliberately narrow; red-flag
 * care advice ("see your doctor", "call 911") is never matched.
 */
export const INTERVENTION_ADVICE =
  /\b(CBT(?:-I)?|cognitive[- ]behaviou?ral therapy|first[- ]line|best[- ](?:proven|evidenced|supported) (?:ways?|tools?|steps?|options?|levers?|approach\w*|interventions?)|(?:strongest|biggest) levers?|sleep hygiene|physiotherapy|hormone (?:replacement )?therapy|(?:try|consider|start) (?:regular )?(?:exercise|exercising|meditation|yoga|counsel+ing|therapy|a (?:diet|sleep programme|sleep program))|(?:prescription|prescribed) (?:sleep )?(?:medication|medicine|drug|pill)s?)\b/i;

/** Drops sentences that recommend other interventions; keeps everything else verbatim. */
export function withoutInterventionAdvice(text: string): { text: string; removed: number } {
  let removed = 0;
  const out = text
    .split(/\n{2,}/)
    .map(para =>
      para
        .split("\n")
        .map(line => {
          const kept = line.split(/(?<=[.!?])\s+/).filter(sentence => {
            if (INTERVENTION_ADVICE.test(sentence)) {
              removed++;
              return false;
            }
            return true;
          });
          const joined = kept.join(" ");
          return /^\s*[-•*]\s*$/.test(joined) ? "" : joined;
        })
        .filter(l => l.trim())
        .join("\n")
    )
    .filter(p => p.trim())
    .join("\n\n");
  return { text: out, removed };
}
