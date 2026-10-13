/**
 * Peppy deterministic engine.
 *
 * 1. analyze() — classifies a turn (red flags, guards, intent, topics, products). Used by
 *    BOTH modes: it drives retrieval for the LLM and the fallback answer.
 * 2. composeFallback() — builds a complete structured answer from curated content when no
 *    LLM is configured or the LLM fails, so the assistant never shows an error.
 */
import {
  ASSISTANT_DISCLAIMER,
  detectGuards,
  detectRedFlag,
  isCompliantEvidenceNote,
  isCompliantProductCopy,
  productsBlockedBy,
  sanitizeAnswerProse,
  type GuardFlags,
  type RedFlagKind,
} from "./claims.js";
import { findMentionedProducts } from "./catalog.js";
import { RESEARCH_REGISTRY } from "./research-registry.js";
import {
  bloodThinnerResponse,
  combinationResponse,
  diseaseResponse,
  namedCondition,
  drugReplacementResponse,
  medicationsResponse,
  pediatricResponse,
  pregnancyResponse,
  sideEffectsResponse,
  urgentResponse,
} from "./safety.js";
import {
  PRODUCT_EVIDENCE,
  TOPICS,
  TOPICS_BY_ID,
  type Topic,
} from "./topics.js";
import { normalizeForMatch, toInlinePhrase } from "./text.js";
import {
  PEPPY_LIMITS,
  type AnswerSection,
  type PeppyHistoryTurn,
  type PeppyProduct,
  type PeppyProductSuggestion,
  type PeppyResponse,
  type PeppySourceCard,
  type ResearchSource,
  type StudyType,
} from "./types.js";

export { ASSISTANT_DISCLAIMER };

export const REGISTRY_BY_ID = new Map(RESEARCH_REGISTRY.map(s => [s.id, s]));

export type Intent =
  | "product-finding"
  | "evidence"
  | "safety"
  | "dosage"
  | "info"
  | "general";

export interface Analysis {
  message: string;
  redFlag: RedFlagKind | null;
  guards: GuardFlags;
  intent: Intent;
  safetyKind:
    | "pregnancy"
    | "pediatric"
    | "drug-replacement"
    | "disease"
    | "blood-thinners"
    | "combination"
    | "medications"
    | "side-effects"
    | null;
  topics: Topic[];
  mentioned: PeppyProduct[];
  /** Topic/product inherited from earlier turns for short follow-up messages. */
  continuation: boolean;
  /** Bare "hi" / "hello". */
  greeting: boolean;
  offTopic: boolean;
  productsAllowed: boolean;
  /** Why products are blocked (for the prompt / tests). */
  productBlockReasons: string[];
  pubmedQueries: string[];
}

const PRODUCT_FINDING =
  /\b((?:which|what) (?:pure fire |of your |of the )?(?:product|products|supplement|supplements|peptide|peptides|bioregulator|one)\b|recommend\w*|suggest\w*|something for|anything for|best (?:product|supplement|peptide|thing)|what should (?:i|a|an|my|he|she|we) (?:take|buy|try|use)|what (?:can|could) i take|do you (?:have|sell|carry)|good for|help(?:s)? with|options? for)\b/i;
const EVIDENCE =
  /\b(does|do|did|is|are|can)\b.{0,60}\b(work|works|help|helps|effective|legit|real|proven|worth it)\b|\b(evidence|proof|studies|study|research|trials?|science behind|scam)\b/i;
const SAFETY =
  /\b(safe|safety|side[- ]?effects?|interact\w*|contraindicat\w*|allerg\w*|dangerous|risks?|combine|combining|together with|mix(?:ing)? with|at the same time as|while (?:pregnant|breast ?feeding|nursing|on)|(?:take|use|taking)\b.{1,40}\bwith\b)\b/i;
const DOSAGE =
  /\b(how (?:much|many|often|long)|dosage|dosing|dose|doses|when (?:should|do) i take|how (?:do|should) i (?:take|use)|protocol|course length|cycle)\b/i;
const INFO =
  /\b(what (?:is|are|does|do)|what's|how (?:does|do)|explain|tell me (?:about|more)|meaning of|difference between)\b/i;
const HEALTH_WORDS =
  /\b(health\w*|supplement\w*|peptide\w*|bioregulator\w*|vitamin\w*|mineral\w*|herb\w*|extract\w*|nutrient\w*|symptom\w*|pain\w*|ache\w*|sore\w*|doctor|medic\w*|wellness|well-being|body|diet\w*|nutrition\w*|food\w*|research|study|studies|evidence|product\w*|pure fire|order|cart|price|capsule\w*|pill\w*|tablet\w*|dose\w*|dosage|safe|safety|side effects?|immun\w*|hormone\w*|gland\w*|organ\w*|aging|ageing|longevity|energy|sleep\w*|tired\w*|blood|sugar|glucose|cholesterol|pressure|weight|fat|metabol\w*|gut|digest\w*|bloat\w*|skin|hair|nails?|muscle\w*|joint\w*|bone\w*|heart|brain|memory|focus|mood|stress\w*|anxi\w*|liver|kidney\w*|eyes?|vision|thyroid|libido|testosterone|estrogen|menopaus\w*|fertility|prostate|inflamm\w*|antioxidant\w*|collagen|protein|creatine|magnesium|zinc|iron|omega|probiotic\w*|melatonin|caffeine|ashwagandha|berberine|curcumin|turmeric|nad\+?|nmn|coq10|exercise|workout|training|recovery|cold|flu|allerg\w*|pregnan\w*|breastfeed\w*)\b/i;
const GREETING =
  /^(hi|hello|hey|hiya|howdy|good (?:morning|afternoon|evening)|yo|greetings)\b[\s!.,?]*(?:peppy)?[\s!.,?]*$/i;
const CURE_ASK =
  /\b(cure[sd]?|curing|treat|treats|treating|treatment for|heal|heals|reverse|reverses|get rid of|fight|fights|beat|kill|kills|shrink)\b/i;
const SHORT_REPLY =
  /^(yes|yeah|yep|no|nope|ok|okay|sure|thanks|thank you|tell me more|more|go on|and\??|why\??|how\??|really\??|what else\??|learn more)\b/i;

function topicScores(text: string): Topic[] {
  const t = normalizeForMatch(text);
  const scored: { topic: Topic; score: number; at: number }[] = [];
  for (const topic of TOPICS) {
    let score = 0;
    let at = Infinity;
    for (const p of topic.patterns) {
      const g = new RegExp(
        p.source,
        p.flags.includes("g") ? p.flags : p.flags + "g"
      );
      let m: RegExpExecArray | null;
      while ((m = g.exec(t)) !== null) {
        score += 1;
        at = Math.min(at, m.index);
        if (m[0].length === 0) g.lastIndex++;
      }
    }
    if (score > 0) scored.push({ topic, score, at });
  }
  // Specific explainer/evidence topics beat generic body-system words when they match.
  const priority: Record<string, number> = {
    "khavinson-evidence": 3,
    epitalon: 2,
    thymus: 1,
    men: 2,
  };
  scored.sort(
    (a, b) =>
      (priority[b.topic.id] ?? 0) - (priority[a.topic.id] ?? 0) ||
      b.score - a.score ||
      a.at - b.at
  );
  return scored.map(s => s.topic);
}

function topicsForProduct(productId: string): Topic[] {
  return TOPICS.filter(t => t.products.some(p => p.id === productId));
}

export function analyze(input: {
  message: string;
  history?: PeppyHistoryTurn[];
  catalog: Map<string, PeppyProduct>;
  contextProductId?: string;
}): Analysis {
  const message = input.message.trim().slice(0, PEPPY_LIMITS.maxMessageChars);
  const history = (input.history ?? []).slice(-PEPPY_LIMITS.maxHistoryTurns);
  const redFlag = detectRedFlag(message);
  const guards = detectGuards(message);

  let mentioned = findMentionedProducts(message, input.catalog);
  let topics = topicScores(message);
  let continuation = false;

  const lastUser =
    [...history].reverse().find(h => h.role === "user")?.content ?? "";
  const words = message.split(/\s+/).filter(Boolean).length;
  const asksNew =
    /\?/.test(message) || PRODUCT_FINDING.test(message) || INFO.test(message);
  if (
    lastUser &&
    mentioned.length === 0 &&
    words <= 14 &&
    (!asksNew || topics.length === 0 || SHORT_REPLY.test(message))
  ) {
    // Short reply to a follow-up ("about 3 months, heavy periods, no meds") — keep the previous
    // topic/product in focus; details that match other topics only refine it.
    const prevTopics = topicScores(lastUser);
    const prevProducts = findMentionedProducts(lastUser, input.catalog);
    if (prevTopics.length || prevProducts.length) {
      topics = [...prevTopics, ...topics.filter(t => !prevTopics.includes(t))];
      mentioned = prevProducts;
      continuation = true;
      const prevGuards = detectGuards(lastUser);
      (Object.keys(guards) as (keyof GuardFlags)[]).forEach(k => {
        guards[k] = guards[k] || prevGuards[k];
      });
    }
  }
  if (
    mentioned.length === 0 &&
    input.contextProductId &&
    /\b(it|this|this one|this product|that one)\b/i.test(message)
  ) {
    const ctx = input.catalog.get(input.contextProductId);
    if (ctx) mentioned = [ctx];
  }
  if (topics.length === 0 && mentioned.length > 0)
    topics = topicsForProduct(mentioned[0].id);

  let safetyKind: Analysis["safetyKind"] = null;
  if (guards.pregnancy) safetyKind = "pregnancy";
  else if (guards.pediatric) safetyKind = "pediatric";
  else if (guards.drugReplacement) safetyKind = "drug-replacement";
  else if (
    guards.disease &&
    (CURE_ASK.test(message) || (topics.length === 0 && mentioned.length === 0))
  )
    safetyKind = "disease";
  else if (guards.bloodThinners) safetyKind = "blood-thinners";
  else if (
    SAFETY.test(message) &&
    (mentioned.length >= 2 ||
      /melatonin|alcohol|wine|beer|caffeine|coffee/i.test(message))
  )
    safetyKind = "combination";
  else if (
    guards.medications &&
    (SAFETY.test(message) || /\b(on|taking|take)\b/i.test(message))
  )
    safetyKind = "medications";
  else if (/\bside[- ]?effects?\b|\ballerg/i.test(message))
    safetyKind = "side-effects";

  let intent: Intent = "general";
  if (safetyKind || SAFETY.test(message)) intent = "safety";
  else if (DOSAGE.test(message) && mentioned.length) intent = "dosage";
  else if (
    mentioned.length &&
    (EVIDENCE.test(message) ||
      /\b(good for|help(?:s)? (?:with|for)|worth (?:it|taking|trying)|any good)\b/i.test(
        message
      ))
  )
    intent = "evidence";
  else if (PRODUCT_FINDING.test(message)) intent = "product-finding";
  else if (EVIDENCE.test(message)) intent = "evidence";
  else if (INFO.test(message)) intent = "info";

  const greeting = GREETING.test(message);
  const offTopic =
    !greeting &&
    !redFlag &&
    topics.length === 0 &&
    mentioned.length === 0 &&
    !safetyKind &&
    !HEALTH_WORDS.test(message) &&
    !continuation;

  const blocked = productsBlockedBy(guards) as string[];
  const reasons = [...blocked];
  if (redFlag) reasons.push("red-flag");
  if (intent === "safety") reasons.push("safety-question");
  if (offTopic) reasons.push("off-topic");
  if (greeting) reasons.push("greeting");
  const productsAllowed = reasons.length === 0;

  const pubmedQueries: string[] = [];
  for (const t of topics.slice(0, 1))
    if (t.pubmedQuery) pubmedQueries.push(t.pubmedQuery);

  return {
    message,
    redFlag,
    guards,
    intent,
    safetyKind,
    topics,
    mentioned,
    continuation,
    greeting,
    offTopic,
    productsAllowed,
    productBlockReasons: reasons,
    pubmedQueries,
  };
}

// ── Composition helpers ─────────────────────────────────────────────────────

const STUDY_LIMIT_DEFAULT: Record<StudyType, string> = {
  "systematic-review":
    "Pools several studies; check whether the included trials match your situation.",
  rct: "A single randomised trial; results may not generalise beyond its participants.",
  clinical:
    "Human study without strong controls; treat results as preliminary.",
  observational: "Shows association, not cause and effect.",
  review:
    "Narrative review; summarises other studies rather than testing anything new.",
  animal: "Animal study; results may not apply to people.",
  "in-vitro": "Cell or lab study; no effect in people was measured.",
  guidance: "General guidance.",
  other: "See the abstract for details.",
};

export function toSourceCard(
  src: ResearchSource,
  finding?: string,
  limitation?: string
): PeppySourceCard | null {
  const f = (finding ?? src.finding ?? "").trim();
  const l = (
    limitation ??
    src.limitation ??
    STUDY_LIMIT_DEFAULT[src.studyType]
  ).trim();
  const findingText =
    f ||
    (src.origin === "pubmed-live"
      ? "Peppy hasn't summarised this paper yet — open it on PubMed to read the abstract."
      : "");
  if (!findingText) return null;
  return { ...src, finding: findingText, limitation: l };
}

const EVIDENCE_RANK: Record<StudyType, number> = {
  "systematic-review": 0,
  rct: 1,
  clinical: 2,
  observational: 3,
  review: 4,
  animal: 5,
  "in-vitro": 6,
  guidance: 7,
  other: 8,
};

/** Curated ids first in the topic's order, then live PubMed (best evidence first), deduped. */
export function pickSources(
  ids: string[],
  live: ResearchSource[] = [],
  max: number = PEPPY_LIMITS.maxSources
): PeppySourceCard[] {
  const out: PeppySourceCard[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const src = REGISTRY_BY_ID.get(id);
    if (!src || seen.has(src.id)) continue;
    const card = toSourceCard(src);
    if (card) {
      out.push(card);
      seen.add(src.id);
    }
  }
  const curatedPmids = new Set(out.map(s => s.pmid).filter(Boolean));
  const liveSorted = [...live].sort(
    (a, b) => EVIDENCE_RANK[a.studyType] - EVIDENCE_RANK[b.studyType]
  );
  const liveSlots = out.length >= 3 ? 1 : 2;
  let added = 0;
  for (const src of liveSorted) {
    if (added >= liveSlots) break;
    if (seen.has(src.id) || (src.pmid && curatedPmids.has(src.pmid))) continue;
    const card = toSourceCard(src);
    if (card) {
      out.push(card);
      seen.add(src.id);
      added++;
    }
  }
  // Keep the human-relevant evidence on top, guidance pages last.
  return out.slice(0, max);
}

function suggestionFor(topic: Topic | undefined, used: Set<string>): string[] {
  const base = topic?.suggestions ?? [
    "How do peptide bioregulators work?",
    "Do Khavinson peptides actually work in humans?",
    "Which Pure Fire product for sleep?",
    "Why am I tired in the afternoon?",
  ];
  return base
    .filter(s => !used.has(normalizeForMatch(s)))
    .slice(0, PEPPY_LIMITS.maxSuggestions);
}

function productSuggestions(
  topic: Topic | undefined,
  catalog: Map<string, PeppyProduct>,
  max: number
): PeppyProductSuggestion[] {
  if (!topic) return [];
  const out: PeppyProductSuggestion[] = [];
  for (const tp of topic.products) {
    const product = catalog.get(tp.id);
    if (!product || !product.inStock) continue;
    if (
      !isCompliantProductCopy(tp.why) ||
      !isCompliantEvidenceNote(tp.evidenceNote)
    )
      continue;
    out.push({ product, why: tp.why, evidenceNote: tp.evidenceNote });
    if (out.length >= max) break;
  }
  return out;
}

/** Catalog-derived why line for a product the user asked about by name. */
export function productWhyFromCatalog(
  product: PeppyProduct,
  topic?: Topic
): string {
  const curated = topic?.products.find(p => p.id === product.id)?.why;
  if (curated) return curated;
  const benefit = product.benefits[0];
  const ingredients = product.ingredients.slice(0, 3).join(", ");
  const parts: string[] = [];
  if (ingredients) parts.push(`Contains ${toInlinePhrase(ingredients)}`);
  if (benefit)
    parts.push(
      `${parts.length ? "the catalog lists it for" : "The catalog lists it for"} ${toInlinePhrase(benefit)}`
    );
  const line = parts.length
    ? `${parts.join("; ")}.`
    : `${product.name} is in our catalog.`;
  return isCompliantProductCopy(line)
    ? line
    : `${product.name} is in our catalog.`;
}

function hasDetail(message: string): boolean {
  return /\b\d+\s*(?:day|week|month|year|hour|hr)s?\b|\b(?:since|for (?:a|about|over) (?:few|couple|while|month|year|week))\b|\bmedication|\bmeds\b|\bsnor|\bperiods?\b|\bvegan|\bvegetarian|\bmy doctor\b/i.test(
    message
  );
}

/** Small rules that turn a user's added detail into a targeted note (fallback mode). */
function detailNotes(message: string): string[] {
  const t = normalizeForMatch(message);
  const notes: string[] = [];
  if (/snor|gasp|stop breathing/.test(t))
    notes.push(
      "Snoring or gasping at night is worth raising with a doctor — a sleep study can check for sleep apnea, a common and treatable cause of daytime tiredness."
    );
  if (/heavy periods?|vegan|vegetarian|plant[- ]based/.test(t))
    notes.push(
      "Heavy periods or a plant-based diet make low iron stores more likely; a ferritin test is a sensible first step."
    );
  if (/\b(?:[3-9]|1[0-2])\s*months?\b|\byears?\b|\bmonths\b/.test(t))
    notes.push(
      "Because this has gone on for months, it's worth a check-up rather than self-treating — persistent symptoms deserve a proper look."
    );
  if (/\b(?:1|2|one|two|a couple of)\s*weeks?\b|\bfew days\b/.test(t))
    notes.push(
      "A short-lived change often settles with the basics above; if it hasn't improved in another couple of weeks, get it checked."
    );
  const noMeds =
    /\b(?:no|not on any|don'?t take any|without) (?:regular )?(?:medications?|medicines?|meds|prescriptions?)\b|\bnot on any\b/.test(
      t
    );
  if (noMeds)
    notes.push(
      "No regular medicines keeps things simpler, though it's still worth telling your doctor about any supplement you start."
    );
  else if (
    /medication|medicine|meds|prescri|statin|metformin|levothyroxine|blood thinner|warfarin/.test(
      t
    )
  )
    notes.push(
      "Since you take medicines, check any new supplement with your pharmacist first."
    );
  return notes;
}

function cleanSections(
  sections: AnswerSection[],
  catalog: Map<string, PeppyProduct>
): AnswerSection[] {
  const names = Array.from(catalog.values()).map(p => p.name);
  return sections
    .map(s => ({ ...s, body: sanitizeAnswerProse(s.body, names).text }))
    .filter(s => s.body.trim());
}

function base(analysis: Analysis): Omit<PeppyResponse, "summary" | "sections"> {
  return {
    mode: "fallback",
    research: [],
    followUps: [],
    suggestions: [],
    products: [],
    showDisclaimer: true,
    topics: analysis.topics.slice(0, 2).map(t => t.id),
  };
}

// ── Fallback composition ────────────────────────────────────────────────────

function safetyPart(analysis: Analysis, catalog: Map<string, PeppyProduct>) {
  switch (analysis.safetyKind) {
    case "pregnancy":
      return pregnancyResponse();
    case "pediatric":
      return pediatricResponse();
    case "drug-replacement":
      return drugReplacementResponse();
    case "disease":
      return diseaseResponse(analysis.message);
    case "blood-thinners":
      return bloodThinnerResponse(catalog, analysis.mentioned);
    case "combination":
      return combinationResponse(analysis.message, analysis.mentioned);
    case "medications":
      return medicationsResponse(analysis.mentioned);
    default:
      return sideEffectsResponse(analysis.mentioned);
  }
}

export function composeFallback(
  analysis: Analysis,
  catalog: Map<string, PeppyProduct>,
  liveSources: ResearchSource[] = [],
  usedSuggestions: string[] = []
): PeppyResponse {
  const used = new Set(usedSuggestions.map(normalizeForMatch));
  used.add(normalizeForMatch(analysis.message));
  const topic = analysis.topics[0];

  // 1) Emergencies short-circuit everything.
  if (analysis.redFlag) {
    const u = urgentResponse(analysis.redFlag);
    return {
      ...base(analysis),
      mode: "urgent",
      summary: u.summary,
      sections: [],
      safety: u.safety,
      showDisclaimer: false,
      topics: [],
    };
  }

  // 2) Safety questions.
  if (analysis.safetyKind) {
    const part = safetyPart(analysis, catalog);
    return {
      ...base(analysis),
      summary: part.summary,
      sections: cleanSections(part.sections, catalog),
      research: pickSources(part.sourceIds, [], 4),
      evidenceNote: part.evidenceNote,
      safety: part.safety,
      followUps: part.followUps.slice(0, PEPPY_LIMITS.maxFollowUps),
      suggestions: part.suggestions
        .filter(s => !used.has(normalizeForMatch(s)))
        .slice(0, PEPPY_LIMITS.maxSuggestions),
    };
  }

  // 3) Greeting / off-topic.
  if (analysis.greeting) {
    return {
      ...base(analysis),
      summary:
        "Hi, I'm Peppy — Pure Fire's research assistant. Ask me about a symptom or goal, a peptide or supplement, or one of our products, and I'll tell you what the research does and doesn't show, with links to the studies.",
      sections: [],
      suggestions: suggestionFor(undefined, used),
      showDisclaimer: false,
      topics: [],
    };
  }
  if (analysis.offTopic) {
    return {
      ...base(analysis),
      summary:
        "I'm Peppy, Pure Fire's research assistant. I can help with questions about peptides, supplements, wellness research and our products — but that one's outside what I can help with.",
      sections: [],
      suggestions: suggestionFor(undefined, used),
      showDisclaimer: false,
      topics: [],
    };
  }

  // 4) A specific product was named.
  const product = analysis.mentioned[0];
  if (product)
    return composeProductAnswer(analysis, product, catalog, liveSources, used);

  // 5) Topic answer.
  if (topic) {
    const diseaseBlocked = analysis.guards.disease;
    const notes = analysis.continuation ? detailNotes(analysis.message) : [];
    const sections: AnswerSection[] = [];
    if (notes.length)
      sections.push({
        heading: "Based on what you've shared",
        body: notes.map(n => `- ${n}`).join("\n"),
      });
    // A follow-up reply already saw the overview: repeat only the evidence and when-to-get-checked parts.
    const FOLLOW_UP_SECTIONS = /research|checked|see a|doctor|clinician/i;
    sections.push(
      ...(analysis.continuation && notes.length
        ? topic.sections.filter(sec =>
            FOLLOW_UP_SECTIONS.test(sec.heading ?? "")
          )
        : topic.sections)
    );

    const allowProducts =
      analysis.productsAllowed &&
      !diseaseBlocked &&
      topic.productPolicy !== "never" &&
      (topic.productPolicy === "symptom" ||
        analysis.intent === "product-finding" ||
        analysis.intent === "info" ||
        analysis.intent === "general");
    const maxProducts =
      topic.productPolicy === "ingredient" ? 1 : PEPPY_LIMITS.maxProducts;
    const products = allowProducts
      ? productSuggestions(topic, catalog, maxProducts)
      : [];

    const askFollowUps =
      !analysis.continuation &&
      !hasDetail(analysis.message) &&
      analysis.message.split(/\s+/).length <= 16 &&
      topic.followUps.length > 0;

    let safety = topic.safety;
    if (diseaseBlocked) {
      safety = {
        level: "caution",
        title: "About your condition",
        body: "Because you mentioned a diagnosed condition, I won't suggest products for it — supplements aren't a treatment. Please involve your doctor before adding anything.",
      };
    }
    return {
      ...base(analysis),
      summary: diseaseBlocked
        ? `${conditionLead(analysis.message)} ${topic.summary}`
        : analysis.continuation
          ? `Thanks — that helps. ${topic.summary}`
          : topic.summary,
      sections: cleanSections(sections, catalog),
      research: pickSources(topic.sourceIds, liveSources),
      evidenceNote: topic.evidenceNote,
      safety,
      followUps: askFollowUps
        ? topic.followUps.slice(0, PEPPY_LIMITS.maxFollowUps)
        : [],
      suggestions: suggestionFor(topic, used),
      products,
    };
  }

  // 6) Health question we have no curated topic for.
  const live = pickSources([], liveSources, 3);
  return {
    ...base(analysis),
    summary: live.length
      ? "I don't have a curated, fact-checked summary for that question yet, so I won't guess at an answer. The closest matches on PubMed are below — I haven't summarised them, so open the abstracts and check the study type before drawing conclusions."
      : "I don't have curated research on that specific question yet, so I'd rather not guess. If you tell me a bit more — the symptom or goal, how long it's been going on, and any medicines you take — I can point you to what the research says on related topics, or you can ask your clinician.",
    sections: [],
    research: live,
    evidenceNote: live.length
      ? "Unreviewed search results: Peppy hasn't checked these papers' quality or relevance, so how well they answer your question is uncertain."
      : undefined,
    followUps: live.length
      ? []
      : ["What's the main symptom or goal, and how long has it been going on?"],
    suggestions: suggestionFor(undefined, used),
  };
}

function conditionLead(message: string): string {
  const condition = namedCondition(message);
  return condition
    ? `First, the direct answer: supplements and peptides — including ours — aren't a treatment for ${condition}, and there's no good human evidence that they prevent or cure it. Please let your doctor guide care for it. Here's what the general research does show.`
    : "Supplements and peptides — including ours — aren't a treatment for medical conditions. Please let your doctor guide care. Here's what the general research does show.";
}

function composeProductAnswer(
  analysis: Analysis,
  product: PeppyProduct,
  catalog: Map<string, PeppyProduct>,
  liveSources: ResearchSource[],
  used: Set<string>
): PeppyResponse {
  const topic =
    analysis.topics.find(t => t.products.some(p => p.id === product.id)) ??
    analysis.topics[0] ??
    topicsForProduct(product.id)[0];
  const ev = PRODUCT_EVIDENCE[product.id];
  const sections: AnswerSection[] = [];

  if (analysis.intent === "dosage") {
    sections.push({
      heading: "Manufacturer's directions",
      body: product.usage
        ? `${product.usage}\n\nThese are the label directions, not personal dosing advice. Check with your clinician first if you take medicines, are pregnant or breastfeeding, or have a medical condition.`
        : "The label directions aren't listed on our product page yet — follow the package insert, and check with your clinician first if you take medicines or have a medical condition.",
    });
  }

  const ingredients = product.ingredients.length
    ? product.ingredients.join(", ")
    : "";
  const what = ev
    ? `${product.name} is ${ev.lineage}.`
    : `${product.name}${product.summary ? ` — ${product.summary}` : " is in our catalog."}`;
  sections.push({
    heading: "What it is",
    body: [what, ingredients ? `**Listed ingredients:** ${ingredients}.` : ""]
      .filter(Boolean)
      .join("\n\n"),
  });

  const evidenceBody = ev
    ? `${ev.productNote}${ev.sourceIds.length ? " The studies below are about the ingredient or related preparations, not this exact product." : ""}`
    : "We don't have curated research for this exact product. Any studies on its individual ingredients don't show what the finished formula does.";
  sections.push({ heading: "What the research says", body: evidenceBody });

  if (topic && analysis.intent !== "dosage") {
    sections.push({
      heading: "Is it worth it?",
      body: `${topic.summary.split(/(?<=\.)\s/)[0]} A product like this is optional — it may suit people who want to try a bioregulator alongside those basics, ideally with their clinician's knowledge.`,
    });
  }

  const showCard = analysis.productsAllowed && !analysis.guards.disease;
  const tp = topic?.products.find(p => p.id === product.id);
  const card: PeppyProductSuggestion = {
    product,
    why: productWhyFromCatalog(product, topic),
    evidenceNote:
      tp?.evidenceNote ??
      ev?.productNote ??
      "This finished product hasn't been tested in published trials.",
  };
  const evidenceOk = isCompliantEvidenceNote(card.evidenceNote);
  return {
    ...base(analysis),
    summary:
      analysis.intent === "evidence"
        ? ev && ev.sourceIds.length
          ? `Short answer: there's no published trial of ${product.name} itself, so nobody can say how well it works. What exists is research on its ingredient or related preparations — mostly lab, animal and small human studies — summarised below.`
          : `Short answer: there's no published research on ${product.name} itself, so nobody can say how well it works${topic ? ` for ${toInlinePhrase(topic.label)}` : ""}. Below is what's in it and what's known in general.`
        : analysis.intent === "dosage"
          ? `Here are the manufacturer's directions for ${product.name}, plus what to keep in mind.`
          : `Here's what ${product.name} is, what the research behind it does and doesn't show, and who it may suit.`,
    sections: cleanSections(sections, catalog),
    research: pickSources(ev?.sourceIds ?? [], liveSources, 4),
    evidenceNote: ev ? ev.productNote : undefined,
    safety: analysis.guards.disease
      ? {
          level: "caution",
          title: "About your condition",
          body: "Supplements aren't a treatment for a diagnosed condition. Please involve your doctor before adding anything.",
        }
      : undefined,
    followUps: [],
    suggestions: [
      `Is ${product.name} safe with my medications?`,
      ...(analysis.intent === "dosage"
        ? []
        : [`How do I take ${product.name}?`]),
      ...suggestionFor(topic, used),
    ]
      .filter(
        (s, i, arr) => arr.indexOf(s) === i && !used.has(normalizeForMatch(s))
      )
      .slice(0, PEPPY_LIMITS.maxSuggestions),
    products: showCard && evidenceOk && product.inStock ? [card] : [],
    topics: topic ? [topic.id] : [],
  };
}

export { TOPICS_BY_ID };
