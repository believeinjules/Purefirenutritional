/**
 * Runtime-agnostic Peppy pipeline: analyse → (live PubMed) → deterministic draft →
 * (LLM + validation) → response. The server passes PubMed/LLM adapters; the browser
 * fallback calls it with none and gets the curated deterministic answer.
 */
import {
  analyze,
  composeFallback,
  pickSources,
  type Analysis,
} from "./engine.js";
import { buildLlmContext, type LlmContext } from "./prompt.js";
import { validateLlmAnswer, type ValidationReport } from "./validate.js";
import { isCompliantEvidenceNote, isCompliantProductCopy } from "./claims.js";
import {
  PEPPY_LIMITS,
  type PeppyHistoryTurn,
  type PeppyProduct,
  type PeppyProductSuggestion,
  type PeppyResponse,
  type ResearchSource,
} from "./types.js";
import { productWhyFromCatalog } from "./engine.js";

export interface PeppyDeps {
  catalog: Map<string, PeppyProduct>;
  /** Live PubMed search; must resolve (never throw) within its own timeout. */
  searchPubmed?: (query: string) => Promise<ResearchSource[]>;
  /** LLM call returning raw JSON text; may throw (timeout, HTTP error) → fallback. */
  callLlm?: (ctx: LlmContext) => Promise<string>;
}

export interface PeppyMeta {
  llm: "not-configured" | "skipped" | "ok" | "invalid" | "error";
  pubmedLive: number;
  report?: ValidationReport;
}

const STOP = new Set(
  "a an and are as at be but by can could did do does for from had has have how i if in into is it its me my of on or our should so than that the their them then there these they this to too was we what when where which who why will with would you your about any some just really very much many more most also been being get got take taking use using help helps good best".split(
    " "
  )
);

/** Keyword PubMed query from a free-text question (used only when no curated topic matched). */
export function keywordQuery(message: string): string | null {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
  const unique = Array.from(new Set(words)).slice(0, 4);
  return unique.length >= 1 ? unique.join(" AND ") : null;
}

function wantsLivePubmed(analysis: Analysis): string | null {
  if (analysis.redFlag || analysis.offTopic || analysis.greeting) return null;
  if (
    analysis.safetyKind &&
    analysis.safetyKind !== "side-effects" &&
    analysis.safetyKind !== "combination"
  )
    return null;
  if (analysis.pubmedQueries.length) return analysis.pubmedQueries[0];
  if (analysis.topics.length === 0 && analysis.mentioned.length === 0)
    return keywordQuery(analysis.message);
  return null;
}

/** Product candidates the LLM may choose from (already guard- and claim-checked). */
export function llmCandidates(
  analysis: Analysis,
  catalog: Map<string, PeppyProduct>,
  draft: PeppyResponse
): PeppyProductSuggestion[] {
  if (!analysis.productsAllowed || analysis.guards.disease) return [];
  const out: PeppyProductSuggestion[] = [...draft.products];
  const add = (s: PeppyProductSuggestion) => {
    if (out.length >= 4 || out.some(o => o.product.id === s.product.id)) return;
    if (
      !s.product.inStock ||
      !isCompliantProductCopy(s.why) ||
      !isCompliantEvidenceNote(s.evidenceNote)
    )
      return;
    out.push(s);
  };
  const topic = analysis.topics[0];
  if (topic && topic.productPolicy !== "never") {
    for (const tp of topic.products) {
      const product = catalog.get(tp.id);
      if (product) add({ product, why: tp.why, evidenceNote: tp.evidenceNote });
    }
  }
  for (const product of analysis.mentioned) {
    add({
      product,
      why: productWhyFromCatalog(product, topic),
      evidenceNote:
        "This finished product hasn't been tested in published trials; any research is on its ingredients.",
    });
  }
  return out;
}

export async function answerPeppy(
  req: {
    message: string;
    history?: PeppyHistoryTurn[];
    productId?: string;
    usedSuggestions?: string[];
  },
  deps: PeppyDeps
): Promise<{ response: PeppyResponse; analysis: Analysis; meta: PeppyMeta }> {
  const history = (req.history ?? [])
    .filter(
      h =>
        h &&
        (h.role === "user" || h.role === "assistant") &&
        typeof h.content === "string"
    )
    .slice(-PEPPY_LIMITS.maxHistoryTurns)
    .map(h => ({
      role: h.role,
      content: h.content.slice(0, PEPPY_LIMITS.maxHistoryChars),
    }));
  const analysis = analyze({
    message: req.message,
    history,
    catalog: deps.catalog,
    contextProductId: req.productId,
  });
  const meta: PeppyMeta = {
    llm: deps.callLlm ? "skipped" : "not-configured",
    pubmedLive: 0,
  };

  let live: ResearchSource[] = [];
  const query = wantsLivePubmed(analysis);
  if (query && deps.searchPubmed) {
    try {
      live = await deps.searchPubmed(query);
    } catch {
      live = [];
    }
  }
  meta.pubmedLive = live.length;

  // Don't offer "ask next" chips the user has already asked.
  const asked = [
    ...(req.usedSuggestions ?? []),
    ...history.filter(h => h.role === "user").map(h => h.content),
  ];
  const draft = composeFallback(analysis, deps.catalog, live, asked);

  const hardGuard =
    !!analysis.redFlag ||
    analysis.offTopic ||
    analysis.greeting ||
    analysis.safetyKind === "pregnancy" ||
    analysis.safetyKind === "pediatric" ||
    analysis.safetyKind === "drug-replacement" ||
    analysis.safetyKind === "disease";
  if (!deps.callLlm || hardGuard) return { response: draft, analysis, meta };

  // Wider source pool for the model: draft citations + remaining topic sources + live results.
  const ids = [
    ...draft.research.map(s => s.id),
    ...analysis.topics.slice(0, 2).flatMap(t => t.sourceIds),
  ];
  const sources = pickSources(Array.from(new Set(ids)), live, 8);
  const candidates = llmCandidates(analysis, deps.catalog, draft);
  const ctx = buildLlmContext({
    analysis,
    sources,
    candidates,
    draft,
    history,
    contextProductName: req.productId
      ? deps.catalog.get(req.productId)?.name
      : undefined,
  });
  try {
    const raw = await deps.callLlm(ctx);
    const validated = validateLlmAnswer({
      raw,
      analysis,
      sources,
      candidates,
      catalog: deps.catalog,
      draft,
    });
    if (!validated) {
      meta.llm = "invalid";
      return { response: draft, analysis, meta };
    }
    meta.llm = "ok";
    meta.report = validated.report;
    return { response: validated.response, analysis, meta };
  } catch {
    meta.llm = "error";
    return { response: draft, analysis, meta };
  }
}
