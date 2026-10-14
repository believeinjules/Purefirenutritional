/**
 * Pepita deterministic engine.
 *
 * 1. analyze() — classifies a turn (red flags, guards, intent, topics, products). Used by
 *    BOTH modes: it drives retrieval for the LLM and the fallback answer.
 * 2. composeFallback() — builds a complete structured answer from curated content when no
 *    LLM is configured or the LLM fails, so the assistant never shows an error.
 */
import { dosingAnswer, nonDailyExamples, plainAudience, verified } from "./product-data.js";
import { isHiddenProduct } from "../hidden-products.js";
import { extractProfile, hasProfile, missingSlotQuestions, profileFromMessages, profileRecap } from "./profile.js";
import { isPreorderProduct } from "../preorder.js";
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
import { getProductFacts } from "../product-facts.js";
import { goldResponse, matchGold } from "./gold.js";
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
  type TopicProduct,
} from "./topics.js";
import { normalizeForMatch, toInlinePhrase } from "./text.js";
import {
  PEPPY_LIMITS,
  type AnswerSection,
  type PeppyHistoryTurn,
  type PeppyProduct,
  type PeppyProductSuggestion,
  type PeppyProfile,
  type ProductFamily,
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
  /** Recent turns (for context the user already gave, e.g. their pack size). */
  history: PeppyHistoryTurn[];
  /** Memory slots (goal, duration, age, activity, area) from this conversation. */
  profile: PeppyProfile;
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
  /\b(bladder|urinary|urin\w*|ketamine|urolog\w*|health\w*|supplement\w*|peptide\w*|bioregulator\w*|vitamin\w*|mineral\w*|herb\w*|extract\w*|nutrient\w*|symptom\w*|pain\w*|ache\w*|sore\w*|doctor|medic\w*|wellness|well-being|body|diet\w*|nutrition\w*|food\w*|research|study|studies|evidence|product\w*|pure fire|order|cart|price|capsule\w*|pill\w*|tablet\w*|dose\w*|dosage|safe|safety|side effects?|immun\w*|hormone\w*|gland\w*|organ\w*|aging|ageing|longevity|energy|sleep\w*|tired\w*|blood|sugar|glucose|cholesterol|pressure|weight|fat|metabol\w*|gut|digest\w*|bloat\w*|skin|hair|nails?|muscle\w*|joint\w*|bone\w*|heart|brain|memory|focus|mood|stress\w*|anxi\w*|liver|kidney\w*|eyes?|vision|thyroid|libido|testosterone|estrogen|menopaus\w*|fertility|prostate|inflamm\w*|antioxidant\w*|collagen|protein|creatine|magnesium|zinc|iron|omega|probiotic\w*|melatonin|caffeine|ashwagandha|berberine|curcumin|turmeric|nad\+?|nmn|coq10|exercise|workout|training|recovery|cold|flu|allerg\w*|pregnan\w*|breastfeed\w*)\b/i;
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
  profile?: PeppyProfile;
}): Analysis {
  const message = input.message.trim().slice(0, PEPPY_LIMITS.maxMessageChars);
  const history = (input.history ?? []).slice(-PEPPY_LIMITS.maxHistoryTurns);
  const redFlag = detectRedFlag(message);
  const guards = detectGuards(message);

  let mentioned = findMentionedProducts(message, input.catalog);
  let topics = topicScores(message);
  let continuation = false;

  // The most recent earlier user turn that set a topic or product, so a second or third short
  // answer ("I'm 55", "I run") still refines the same conversation instead of restarting.
  const userTurns = [...history].reverse().filter(h => h.role === "user").map(h => h.content);
  const lastUser =
    userTurns.find(
      u => topicScores(u).length > 0 || findMentionedProducts(u, input.catalog).length > 0
    ) ?? userTurns[0] ?? "";
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
  // Every answer that can suggest products gets a live PubMed lookup (topic query first,
  // generic Khavinson/bioregulator query otherwise).
  if (
    pubmedQueries.length === 0 &&
    (productsAllowed || mentioned.length > 0) &&
    (topics.length > 0 || mentioned.length > 0)
  )
    pubmedQueries.push(GENERIC_PUBMED_QUERY);

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
    history,
    profile: {
      ...profileFromMessages([...history.filter(h => h.role === "user").map(h => h.content), message]),
      ...(input.profile ?? {}),
      // What the customer says now wins over anything remembered.
      ...extractProfile(message),
    },
  };
}

/** Fallback live-PubMed query for product answers without a topic-specific query. */
export const GENERIC_PUBMED_QUERY = "Khavinson peptide bioregulator";

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
      ? "Pepita hasn't summarised this paper yet — open it on PubMed to read the abstract."
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

/** Newer product lines that must compete fairly with the long-standing curated picks. */
export const NEWER_LINE = /^(revilab-|anti-age-nb-|gpl-|prime-peptide-)/;

/**
 * Fair ordering of a topic's products: alternates long-standing picks with newer-line
 * products (Revilab, Anti-Age NB, GPL, Prime Peptide) so neither group always wins the
 * first slots. Order within each group is kept.
 */
export function fairOrder<T extends { id: string }>(items: readonly T[]): T[] {
  const newer = items.filter(i => NEWER_LINE.test(i.id));
  const older = items.filter(i => !NEWER_LINE.test(i.id));
  const out: T[] = [];
  for (let i = 0; i < Math.max(newer.length, older.length); i++) {
    if (older[i]) out.push(older[i]);
    if (newer[i]) out.push(newer[i]);
  }
  // Prefer capsules/tablets: liquid (pre-order) products move behind the others, order kept.
  const ordered = [
    ...out.filter(i => !isPreorderProduct(i.id)),
    ...out.filter(i => isPreorderProduct(i.id)),
  ];
  // Moving a pre-order newer-line product back must not cost the newer lines their early slot.
  if (ordered.length > 2 && !ordered.slice(0, 2).some(i => NEWER_LINE.test(i.id))) {
    const j = ordered.findIndex((i, k) => k >= 2 && NEWER_LINE.test(i.id) && !isPreorderProduct(i.id));
    if (j > 0) ordered.splice(1, 0, ...ordered.splice(j, 1));
  }
  return ordered;
}

/** Fallback (no-LLM) answers can't judge whether a third product adds a distinct reason, so they stop at 2. */
export const FALLBACK_MAX_PRODUCTS = 2;

function productSuggestions(
  topic: Topic | undefined,
  catalog: Map<string, PeppyProduct>,
  max: number,
  profile: PeppyProfile = {}
): PeppyProductSuggestion[] {
  if (!topic) return [];
  const out: PeppyProductSuggestion[] = [];
  // Topics with their own cap list products in biological-relevance order; keep that order
  // (refined by what the customer told us) instead of alternating product lines.
  const ordered = topic.maxProducts
    ? refineOrder(topic.products, profile)
    : fairOrder(topic.products);
  for (const tp of ordered) {
    const product = catalog.get(tp.id);
    if (!product || !product.inStock || isHiddenProduct(product)) continue;
    if (
      !isCompliantProductCopy(tp.why) ||
      !isCompliantEvidenceNote(tp.evidenceNote)
    )
      continue;
    out.push(withCardFacts({ product, why: tp.why, evidenceNote: tp.evidenceNote }, tp));
    if (out.length >= max) break;
  }
  return out;
}

/** Family of a product id (Khavinson bioregulators vs Prime Peptide vs Revilab). */
export function productFamily(id: string, category = ""): ProductFamily {
  if (/^prime-peptide-/.test(id)) return "prime-peptide";
  if (/^revilab-/.test(id)) return "revilab";
  if (/bioregulator|cytomax|cytogen/i.test(category)) return "khavinson";
  return "other";
}

/**
 * Manufacturer protocol line, only from VERIFIED label directions in product-data.json.
 * Labelled as the manufacturer's protocol, never as a clinically validated regimen.
 */
export function protocolLine(id: string): string | undefined {
  const label = verified(id, "labelDirections");
  if (!label) return undefined;
  const text = plainAudience(label).replace(/^for adults/i, "Adults:");
  const t = text.charAt(0).toUpperCase() + text.slice(1);
  const body = /[.!?]$/.test(t) ? t : `${t}.`;
  if (getProductFacts(id)?.pepitaOverride) return `Manufacturer directions: ${body}`;
  return `Manufacturer protocol: ${body} (Label directions, not a clinically validated regimen.)`;
}

/** Alternative course schedules (dealer/scheme documents) — educational, shown only in card details. */
export function productAlternatives(id: string): PeppyProductSuggestion["alternatives"] {
  const alt = getProductFacts(id)?.alternativeProtocols ?? [];
  return alt.length ? alt.map(a => ({ text: a.text, kind: a.kind })) : undefined;
}

/** Studies with lifespan, mortality, survival or tumour outcomes are never surfaced on cards. */
const BANNED_FINDING = /life ?span|mortality|surviv|tumou?r|cancer|oncolog/i;

/** Up to 2 curated studies for a product's details panel (its lineage evidence). */
export function productResearch(id: string): PeppyProductSuggestion["research"] {
  const ids = PRODUCT_EVIDENCE[id]?.sourceIds ?? [];
  const out = ids
    .map(x => REGISTRY_BY_ID.get(x))
    .filter((s): s is NonNullable<typeof s> => !!s && !!s.url && !BANNED_FINDING.test(`${s.title} ${s.finding}`))
    .slice(0, 2)
    .map(s => ({ id: s.id, title: s.title, url: s.url!, finding: s.finding }));
  return out.length ? out : undefined;
}

export function withCardFacts(s: PeppyProductSuggestion, tp?: TopicProduct): PeppyProductSuggestion {
  return {
    ...s,
    tissue: tp?.tissue,
    family: tp?.family ?? productFamily(s.product.id, s.product.category),
    protocol: protocolLine(s.product.id),
    research: productResearch(s.product.id),
    alternatives: productAlternatives(s.product.id),
  };
}

/**
 * Fallback memory refines the picks: activity / recovery goals put the daily multi-ingredient
 * formula first; prevention or later life stage keeps the organ-specific course first.
 */
function refineOrder(products: readonly TopicProduct[], p: PeppyProfile): TopicProduct[] {
  const list = [...products];
  const active = !!p.activity && !/desk|sit|sedentary/.test(p.activity);
  if (p.goal === "recovery" || (active && p.goal !== "prevention")) {
    const i = list.findIndex(x => x.family === "prime-peptide");
    if (i > 0) list.unshift(...list.splice(i, 1));
  }
  return list;
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

  // 0) Curated gold answers (progressive disclosure v11). Red-flag gold answers put medical advice first.
  const gold = matchGold(analysis.message);
  const broad = gold && ["symptom", "combining", "efficacy"].includes(gold.intent);
  const specific = analysis.mentioned.length > 0 || analysis.intent === "dosage" || /ketamine/i.test(analysis.message);
  if (gold && !(analysis.redFlag && gold.intent !== "red-flag") && !(broad && specific)) {
    const g = goldResponse(gold, catalog, withCardFacts, ids =>
      pickSources(ids.flatMap(id => (id.startsWith("topic:") ? TOPICS_BY_ID.get(id.slice(6))?.sourceIds ?? [] : [id])), [], 2)
    );
    const t = TOPICS_BY_ID.get(gold.id) ?? TOPICS_BY_ID.get(gold.sourceIds.find(i => i.startsWith("topic:"))?.slice(6) ?? "");
    if (!g.learnMore && t?.learnMore) g.learnMore = t.learnMore;
    return g;
  }

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
        "Hi, I'm Pepita — Pure Fire's research assistant. Ask me about a symptom or goal, a peptide or supplement, or one of our products, and I'll tell you what the research does and doesn't show, with links to the studies.",
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
        "I'm Pepita, Pure Fire's research assistant. I can help with questions about peptides, supplements, wellness research and our products — but that one's outside what I can help with.",
      sections: [],
      suggestions: suggestionFor(undefined, used),
      showDisclaimer: false,
      topics: [],
    };
  }

  // 3b) Pattern answers built from data (comparisons, combinations, schedules, "same as" questions).
  const pattern = patternAnswer(analysis);
  if (pattern) return { ...base(analysis), sections: [], topics: [], ...pattern, summary: pattern.summary ?? "" };

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
      topic.productPolicy === "ingredient"
        ? 1
        : Math.min(topic.maxProducts ?? FALLBACK_MAX_PRODUCTS, PEPPY_LIMITS.maxProducts);
    const products = allowProducts
      ? productSuggestions(topic, catalog, maxProducts, analysis.profile)
      : [];

    // Memory-driven follow-ups: ask only for slots the customer hasn't answered yet (1–2).
    const slotQs = topic.slotFollowUps ? missingSlotQuestions(analysis.profile, 2) : [];
    const askFollowUps = topic.slotFollowUps
      ? slotQs.length > 0
      : !analysis.continuation &&
        !hasDetail(analysis.message) &&
        analysis.message.split(/\s+/).length <= 16 &&
        topic.followUps.length > 0;
    const recap = hasProfile(analysis.profile) ? profileRecap(analysis.profile) : "";

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
          ? topic.slotFollowUps && recap
            ? `Thanks, that helps: ${recap}. ${refinedLead(topic, products, analysis.profile)}`
            : `Thanks — that helps. ${topic.summary}`
          : topic.summary,
      sections: cleanSections(sections, catalog),
      learnMore: topic.learnMore ? cleanSections(topic.learnMore, catalog) : undefined,
      research: pickSources(topic.sourceIds, liveSources),
      evidenceNote: topic.evidenceNote,
      safety,
      followUps: askFollowUps
        ? (topic.slotFollowUps
            ? [...slotQs, ...topic.followUps.filter(q => !slotQs.includes(q))]
            : topic.followUps
          ).slice(0, PEPPY_LIMITS.maxFollowUps)
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
      ? "Unreviewed search results: Pepita hasn't checked these papers' quality or relevance, so how well they answer your question is uncertain."
      : undefined,
    followUps: live.length
      ? []
      : ["What's the main symptom or goal, and how long has it been going on?"],
    suggestions: suggestionFor(undefined, used),
  };
}

/** Continuation lead: how what the customer shared changes the picks (no restart). */
function refinedLead(topic: Topic, products: PeppyProductSuggestion[], p: PeppyProfile): string {
  const first = products[0];
  if (!first) return firstSentenceOf(topic.summary);
  const daily = first.family === "prime-peptide";
  const why = daily
    ? "With regular load on your joints, a daily formula that pairs cartilage peptides with joint nutrients fits best as the starting point"
    : p.goal === "prevention"
      ? "For a prevention goal, a short organ-specific bioregulator course fits best as the starting point"
      : "An organ-specific cartilage bioregulator course is the most targeted starting point";
  return `${why}, so I've put ${first.product.name} first${products.length > 1 ? ` and kept ${products.slice(1).map(x => x.product.name).join(" and ")} alongside it` : ""}.`;
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

  // Dosing comes ONLY from verified fields in product-data.json (never from free catalog text).
  const dosing = analysis.intent === "dosage" ? dosingAnswer(product.id, product.name, packFromConversation(analysis, product.name)) : null;

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
      body: `${topic.summary.split(/(?<=\.)\s/)[0]} A product like this is optional; if you're curious about a bioregulator, talk it over with your clinician first.`,
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
          ? dosing!.text
          : // v3: answer naturally, right away (no report-style opener).
            [
              what,
              ev
                ? `${firstSentenceOf(ev.productNote)} The research so far is on its ingredient or related preparations, not this exact product.`
                : "There's no published research on this exact product, so its effects haven't been shown.",
            ].join(" "),
    sections: cleanSections(sections, catalog),
    research: pickSources(ev?.sourceIds ?? [], liveSources, 4),
    evidenceNote: ev ? ev.productNote : undefined,
    safety: dosing
      ? {
          level: "info",
          title: "Worth knowing",
          body: "Check the amount with your doctor first if you take medicines, are pregnant or breastfeeding, have a hormone-sensitive condition or have surgery coming up.",
        }
      : analysis.guards.disease
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
    dosingFacts: dosing?.verified
      ? { product: product.name, dose: verified(product.id, "labelDirections") ?? "", source: "Manufacturer label directions" }
      : undefined,
    topics: topic ? [topic.id] : [],
  };
}

/** Pack size the user mentioned in this conversation ("I have Endoluten 60", "60 capsules"). */
function packFromConversation(analysis: Analysis, name: string): number | null {
  const text = [analysis.message, ...analysis.history.filter(h => h.role === "user").map(h => h.content)].join(" ");
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = text.match(new RegExp(`${esc}\\s*(?:N\\s*)?(\\d{2,3})\\b`, "i")) ?? text.match(/\b(\d{2,3})[- ]?(?:caps?|capsules?|count|tablets?)\b/i);
  return m ? Number(m[1]) : null;
}

const SUBSTANCES: Record<string, string> = {
  melatonin: "a hormone your pineal gland makes, and also sold as a supplement",
  collagen: "a structural protein",
  ashwagandha: "an herb",
  magnesium: "a mineral",
};

/**
 * Data-built answers for question shapes the topic library doesn't cover well. These are rules, not
 * canned answers: wording is assembled from catalog evidence (lineage) and verified product data.
 */
function patternAnswer(a: Analysis): Partial<PeppyResponse> | null {
  const msg = a.message.toLowerCase();
  const [p1, p2] = a.mentioned;
  const lineage = (p: PeppyProduct) => PRODUCT_EVIDENCE[p.id]?.lineage;
  const card = (p: PeppyProduct): PeppyProductSuggestion => ({
    product: p,
    why: p.summary ?? "",
    evidenceNote: PRODUCT_EVIDENCE[p.id]?.productNote ?? "This finished product hasn't been tested in published trials.",
  });

  // "Is Endoluten the same as melatonin?"
  const sub = Object.keys(SUBSTANCES).find(k => new RegExp(`\\b${k}\\b`).test(msg));
  if (p1 && !p2 && sub && /\b(same|the same thing|equivalent|just|basically|vs\.?|versus|different|like)\b/.test(msg) && lineage(p1)) {
    return {
      summary: `No. ${sub[0].toUpperCase()}${sub.slice(1)} is ${SUBSTANCES[sub]}; ${p1.name} is ${lineage(p1)}. They're different substances, even if they get talked about in the same breath. Researchers have looked at pineal peptides mostly in lab and animal studies plus small human studies, and none of that shows ${p1.name} acts like ${sub}.`,
      suggestions: [`Can I take ${p1.name} with ${sub}?`, `How do I take ${p1.name}?`],
      products: [card(p1)],
    };
  }

  // Combinations: "Can I take X and Y together?"
  if (p1 && p2 && /\b(together|combine|combined|combination|stack|at the same time|and)\b/.test(msg) && /\b(can i|safe|ok|okay|together|combine|stack)\b/.test(msg) && !/\b(or|vs\.?|versus|compare|difference|better)\b/.test(msg)) {
    return {
      summary: `Nobody has published studies of ${p1.name} and ${p2.name} taken together, so it's genuinely unknown whether the combination adds anything, and "each is sold on its own" doesn't make the pair automatically safe. If you take medicines or have a health condition, run the combination past your doctor first.`,
      safety: { level: "info", title: "Worth knowing", body: "Bring both labels to your doctor or pharmacist, along with everything else you take." },
      suggestions: [`How do I take ${p1.name}?`, `How do I take ${p2.name}?`],
      products: [],
    };
  }

  // Comparisons: "Vesugen or Ventfort?"
  if (p1 && p2 && /\b(or|vs\.?|versus|compare|difference|better)\b/.test(msg)) {
    const desc = (p: PeppyProduct) => (lineage(p) ? `${p.name} is ${lineage(p)}` : `${p.name} is ${p.summary ?? "in our catalog"}`);
    return {
      summary: `${desc(p1)}, while ${desc(p2)}. They haven't been compared head to head in published studies, so the choice usually comes down to which body system you're interested in, not which one "works better". Ask me how either one is taken and I'll give you its verified directions.`,
      suggestions: [`How do I take ${p1.name}?`, `How do I take ${p2.name}?`],
      products: [card(p1), card(p2)],
    };
  }

  // "Do I take every peptide daily?"
  if (!p1 && /\b(every|all|each)\b.*\b(peptides?|bioregulators?|products?)\b.*\b(daily|every day|each day)\b/.test(msg)) {
    const ex = nonDailyExamples().slice(0, 2);
    return {
      summary: `No, schedules differ from product to product. Many labels are daily, but not all${ex.length ? `: for example, ${ex.map(e => `${e.name} ${e.kind}`).join(", and ")}` : ""}. Tell me which product you have and I'll check its exact instructions.`,
      suggestions: ex.map(e => `How do I take ${e.name}?`).slice(0, 2),
      products: [],
    };
  }

  // Bladder symptoms after ketamine: red-flag note before anything else.
  if (/ketamine/.test(msg) && /bladder|urin/.test(msg)) {
    return {
      summary: `Research on supplements for this specific situation is limited, and I wouldn't start there. Ketamine use can seriously damage the bladder and urinary tract, so a urologist should assess your symptoms first; that matters more than any product choice. I don't have a product by that name in our catalog, so I can't tell you what it contains.`,
      safety: { level: "caution", title: "Worth knowing", body: "Blood in the urine, pain, or needing to go very often are reasons to see a doctor soon." },
      suggestions: ["What should I ask my doctor?"],
      products: [],
    };
  }
  return null;
}

function firstSentenceOf(text: string): string {
  const m = text.replace(/\s+/g, " ").trim().match(/^.+?[.!?](?=\s|$)/);
  return m ? m[0] : text.trim();
}

export { TOPICS_BY_ID };
