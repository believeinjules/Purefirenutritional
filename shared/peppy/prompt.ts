/**
 * Prompt + context for LLM mode. The model only ever sees curated / retrieved material and
 * must answer in a fixed JSON shape; validate.ts enforces every rule again server-side.
 */
import type { Analysis } from "./engine.js";
import {
  PEPPY_LIMITS,
  type PeppyHistoryTurn,
  type PeppyResponse,
  type PeppySourceCard,
} from "./types.js";
import type { PeppyProductSuggestion } from "./types.js";

export const PEPPY_SYSTEM_PROMPT = `You are Peppy, the research assistant on the Pure Fire Nutritional website (peptide bioregulators and nutritional supplements).
You are a research and wellness guide first and a low-pressure shop assistant a distant second.

ANSWERING
- Answer the user's actual question in the first 1–3 sentences ("summary"), specifically and plainly. No preamble, no "great question".
- Then up to 4 short sections with headings. Short paragraphs; "- " bullets where helpful; **bold** sparingly.
- Say clearly what research supports, what is uncertain, and what is unknown. Distinguish human trials from animal/cell studies.
- Ask 1–3 follow-up questions ONLY if the answer would materially change. Otherwise return an empty followUps array.
- Never diagnose. Never say a supplement or peptide treats, cures, prevents, reverses or mitigates any disease, and never suggest stopping or replacing a medicine.
- Red flags (pregnancy, children, prescription medicines, worrying symptoms) → recommend involving a clinician; emergencies are handled before you are called.
- Use "geroprotector" only if needed; never use the words "oncoprotector", "anti-cancer" or "anti-tumor" about any product or peptide.
- Don't quote dosages beyond the manufacturer directions given in the context.

RESEARCH
- Cite ONLY sources from CONTEXT.sources, by their exact "id". Never invent, guess or alter a citation, PMID, title, number or statistic.
- Prefer systematic reviews/meta-analyses, then human RCTs, then other studies, then NIH/FDA guidance.
- Don't describe a source beyond its provided finding/limitation.

PRODUCTS
- Products are optional and secondary. Only suggest ids from CONTEXT.candidateProducts, and only if CONTEXT.productsAllowed is true. Max ${PEPPY_LIMITS.maxProducts}.
- "why" must explain relevance from the product's ingredients/formulation (structure/function language: "supports", "is formulated for"). No disease words, no promises, no percentages.
- "evidenceNote" must separate ingredient evidence from evidence for the finished product (usually: none published).
- Don't mention products in the summary unless the user asked about a product. Don't end with a sales pitch.

OUTPUT: a single JSON object, no markdown fences:
{"summary": string, "sections": [{"heading": string, "body": string}], "sourceIds": string[], "evidenceNote": string, "products": [{"id": string, "why": string, "evidenceNote": string}], "followUps": string[], "suggestions": string[]}
"suggestions" are 2–4 short next questions the user might tap (under 70 characters each).`;

export interface LlmContext {
  system: string;
  user: string;
}

function compactSource(s: PeppySourceCard) {
  return {
    id: s.id,
    title: s.title,
    type: s.studyType,
    year: s.year,
    finding: s.finding,
    limitation: s.limitation,
  };
}

export function buildLlmContext(input: {
  analysis: Analysis;
  sources: PeppySourceCard[];
  candidates: PeppyProductSuggestion[];
  draft: PeppyResponse;
  history: PeppyHistoryTurn[];
  contextProductName?: string;
}): LlmContext {
  const { analysis, sources, candidates, draft, history } = input;
  const context = {
    intent: analysis.intent,
    topics: analysis.topics.slice(0, 2).map(t => t.label),
    productsAllowed: analysis.productsAllowed && candidates.length > 0,
    productBlockReasons: analysis.productBlockReasons,
    viewingProduct: input.contextProductName ?? null,
    mentionedProducts: analysis.mentioned.map(p => ({
      id: p.id,
      name: p.name,
      ingredients: p.ingredients,
      catalogSummary: p.summary,
      manufacturerDirections: p.usage ?? null,
    })),
    sources: sources.map(compactSource),
    candidateProducts: candidates.map(c => ({
      id: c.product.id,
      name: c.product.name,
      ingredients: c.product.ingredients,
      curatedWhy: c.why,
      curatedEvidenceNote: c.evidenceNote,
    })),
    // Curated, fact-checked notes for this topic. Use them as ground truth; rephrase to fit the question.
    curatedNotes: {
      summary: draft.summary,
      sections: draft.sections,
      evidenceNote: draft.evidenceNote ?? null,
      safety: draft.safety ?? null,
      suggestedFollowUps: draft.followUps,
    },
  };
  const convo = history
    .slice(-PEPPY_LIMITS.maxHistoryTurns)
    .map(
      h =>
        `${h.role === "user" ? "User" : "Peppy"}: ${h.content.slice(0, PEPPY_LIMITS.maxHistoryChars)}`
    )
    .join("\n");
  const user = [
    `CONTEXT:\n${JSON.stringify(context)}`,
    convo ? `CONVERSATION SO FAR:\n${convo}` : "",
    `USER QUESTION:\n${analysis.message}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return { system: PEPPY_SYSTEM_PROMPT, user };
}
