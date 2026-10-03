import { getAIRecommendations, healthKeywordMap } from "@/data/aiRecommendations";
import { getProductById, type Product } from "@/data/products";

/** Required on every assistant reply. Do not paraphrase. */
export const ASSISTANT_DISCLAIMER =
  "These statements have not been evaluated by the FDA.\nAlways consult a medical professional.";

const NOT_LISTED = "Potential contraindications are not listed.";

const MAX_LIST = 3;

/**
 * Study URLs already printed in client/src/pages/Science.tsx.
 * Attached only when that page names the product. No new PMIDs.
 */
const STUDY_BY_PRODUCT: Record<string, { topic: string; url: string }> = {
  endoluten: {
    topic: "sleep and daily rhythm",
    url: "https://pubmed.ncbi.nlm.nih.gov/11524632/",
  },
  vladonix: {
    topic: "immune function",
    url: "https://pubmed.ncbi.nlm.nih.gov/12618089/",
  },
  cartalax: {
    topic: "joint comfort",
    url: "https://pubmed.ncbi.nlm.nih.gov/28853107/",
  },
  chelohart: {
    topic: "heart and blood vessels",
    url: "https://pubmed.ncbi.nlm.nih.gov/31560178/",
  },
  ventfort: {
    topic: "heart and blood vessels",
    url: "https://pubmed.ncbi.nlm.nih.gov/31560178/",
  },
};

const BENEFIT_HINTS: Record<string, string[]> = {
  sleep: ["melatonin", "sleep", "pineal"],
  energy: ["energy", "fatigue"],
  fatigue: ["energy", "fatigue"],
  brain: ["brain", "cognitive", "memory"],
  memory: ["memory", "cognitive"],
  focus: ["focus", "cognitive", "memory"],
  cognitive: ["cognitive", "memory", "brain"],
  heart: ["heart", "cardio"],
  cardiovascular: ["heart", "cardio", "vascular"],
  circulation: ["circulat", "vascular"],
  joint: ["joint", "cartilage"],
  joints: ["joint", "cartilage"],
  arthritis: ["joint", "cartilage"],
  cartilage: ["cartilage", "joint"],
  immune: ["immune"],
  immunity: ["immune"],
  thyroid: ["thyroid"],
  stress: ["stress"],
  anxiety: ["stress", "calm"],
};

export type AssistantPhase = "idle" | "need-detail" | "need-narrow" | "listed";

export interface AssistantTurnInput {
  phase: AssistantPhase;
  context: string;
  message: string;
  listedIds: string[];
  candidates: string[];
}

export interface AssistantTurn {
  phase: AssistantPhase;
  context: string;
  content: string;
  productIds: string[];
  explanations: Record<string, string>;
  listedIds: string[];
  candidates: string[];
}

function finish(body: string): string {
  return `${body.trim()}\n\n${ASSISTANT_DISCLAIMER}`;
}

function matchedKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.keys(healthKeywordMap).filter((keyword) => lower.includes(keyword));
}

function hasPersonalDetail(text: string): boolean {
  return /\b\d+\s*(week|month|year|day|hour)s?\b|\b(months|weeks|years)\b|\bthyroid\b|\bmedications?\b|\bmedicines?\b|\bmeds\b|\bprescription\b|\bi sleep\b|\bmy sleep\b|\bsleep poorly\b|\binsomnia\b|\bsince\b|\bmy doctor\b/i.test(
    text
  );
}

function isVagueHealthAsk(text: string): boolean {
  if (matchedKeywords(text).length === 0) return false;
  if (hasPersonalDetail(text)) return false;
  return text.trim().split(/\s+/).length <= 24;
}

function wantsLearnMore(text: string): boolean {
  return /\blearn more\b/i.test(text);
}

function safeBenefits(product: Product): string[] {
  return (product.benefits ?? []).filter(
    (benefit) =>
      !/\d+\s*%|lifespan|cure|clinically proven|telomere|dose|capsule|\bmg\b|oncolog|chemo/i.test(
        benefit
      )
  );
}

function pickBenefit(product: Product, topic: string): string | undefined {
  const safe = safeBenefits(product);
  if (safe.length === 0) return undefined;
  const hints = new Set<string>();
  const lowerTopic = topic.toLowerCase();
  for (const [keyword, words] of Object.entries(BENEFIT_HINTS)) {
    if (lowerTopic.includes(keyword)) words.forEach((word) => hints.add(word));
  }
  const hinted = safe.find((benefit) =>
    [...hints].some((hint) => benefit.toLowerCase().includes(hint))
  );
  if (hinted) return hinted;
  return safe.slice().sort((a, b) => a.length - b.length)[0];
}

export function productBlurb(product: Product, topic: string): string {
  const benefit = pickBenefit(product, topic);
  if (!benefit) return `${product.name} is in the catalog for this concern.`;
  const phrase = benefit.charAt(0).toLowerCase() + benefit.slice(1).replace(/\.$/, "");
  return `${product.name} is listed for ${phrase}.`;
}

function contraindicationLine(ids: string[]): string {
  const pattern =
    /contraindicat|not be taken|do not (?:take|use|combine)|should not be taken|avoid taking/i;
  for (const id of ids) {
    const product = getProductById(id);
    if (!product) continue;
    const blob = [product.description, product.usage, product.seriesInfo, ...(product.benefits ?? [])]
      .filter(Boolean)
      .join(" ");
    if (!pattern.test(blob)) continue;
    const sentence = blob.split(/(?<=\.)\s/).find((part) => pattern.test(part));
    if (sentence) return sentence.trim();
  }
  return NOT_LISTED;
}

function explainList(ids: string[], topic: string): Record<string, string> {
  const explanations: Record<string, string> = {};
  for (const id of ids) {
    const product = getProductById(id);
    if (product) explanations[id] = productBlurb(product, topic);
  }
  return explanations;
}

function listReply(ids: string[], topic: string): Pick<
  AssistantTurn,
  "content" | "productIds" | "explanations" | "phase" | "listedIds" | "candidates"
> {
  return {
    phase: "listed",
    content: finish(
      `Here is a short list you can open or add to the cart.\n\n${contraindicationLine(ids)}`
    ),
    productIds: ids,
    explanations: explainList(ids, topic),
    listedIds: ids,
    candidates: ids,
  };
}

function narrowReply(ids: string[], topic: string): Pick<
  AssistantTurn,
  "content" | "productIds" | "explanations" | "phase" | "listedIds" | "candidates"
> {
  const options = ids.slice(0, MAX_LIST).map((id) => {
    const product = getProductById(id);
    if (!product) return id;
    const benefit = pickBenefit(product, topic);
    return benefit ? `${product.name} (${benefit})` : product.name;
  });
  return {
    phase: "need-narrow",
    content: finish(
      `A few catalog products fit. Which one do you want to see: ${options.join(", ")}?`
    ),
    productIds: [],
    explanations: {},
    listedIds: [],
    candidates: ids,
  };
}

function productsFor(topic: string): string[] {
  return getAIRecommendations(topic, 12);
}

function chooseFromCandidates(candidates: string[], message: string, topic: string): string[] {
  const q = message.toLowerCase();
  const words = q.split(/\W+/).filter((word) => word.length > 3);
  const hits = candidates.filter((id) => {
    const product = getProductById(id);
    if (!product) return false;
    const name = product.name.toLowerCase();
    if (q.includes(name) || words.some((word) => name.includes(word))) return true;
    const benefit = pickBenefit(product, topic);
    if (!benefit) return false;
    const benefitLower = benefit.toLowerCase();
    return words.some((word) => benefitLower.includes(word));
  });
  return (hits.length > 0 ? hits : candidates).slice(0, MAX_LIST);
}

function learnMoreReply(listedIds: string[]): AssistantTurn {
  const lines: string[] = [];
  listedIds.forEach((id, index) => {
    const study = STUDY_BY_PRODUCT[id];
    if (!study) return;
    lines.push(
      `Suggestion ${index + 1}'s potential role in ${study.topic}: ${study.url}`
    );
  });
  const body =
    lines.length > 0
      ? `A little more, in plain words. A link is only a pointer, not a promise.\n\n${lines.join(
          "\n"
        )}\n\n${contraindicationLine(listedIds)}`
      : `No study link is listed for these in the shop sources.\n\n${contraindicationLine(
          listedIds
        )}`;
  return {
    phase: "listed",
    context: "",
    content: finish(body),
    productIds: [],
    explanations: {},
    listedIds,
    candidates: listedIds,
  };
}

function followUp(): string {
  return finish(
    "Before I name a product: how long has this been going on, and do sleep, your thyroid, or a medication play a part?"
  );
}

export function composeAssistantReply(input: AssistantTurnInput): AssistantTurn {
  const message = input.message.trim();
  const base = {
    context: input.context,
    listedIds: input.listedIds,
    candidates: input.candidates,
  };

  if (wantsLearnMore(message)) {
    if (input.listedIds.length === 0) {
      return {
        ...base,
        phase: input.phase,
        content: finish("Tell me the concern in a few words, such as energy, sleep, or joints."),
        productIds: [],
        explanations: {},
      };
    }
    const learned = learnMoreReply(input.listedIds);
    return { ...learned, context: input.context };
  }

  if (input.phase === "need-detail") {
    const topic = `${input.context} ${message}`.trim();
    const ids = productsFor(topic);
    if (ids.length === 0) {
      return {
        phase: "idle",
        context: topic,
        content: finish(
          "I do not see a matching catalog product for that. Name one concern, such as energy, sleep, or joints."
        ),
        productIds: [],
        explanations: {},
        listedIds: [],
        candidates: [],
      };
    }
    const reply = ids.length > MAX_LIST ? narrowReply(ids, topic) : listReply(ids, topic);
    return { ...reply, context: topic };
  }

  if (input.phase === "need-narrow") {
    const topic = `${input.context} ${message}`.trim();
    const ids = chooseFromCandidates(input.candidates, message, topic);
    const reply = listReply(ids, topic);
    return { ...reply, context: topic };
  }

  if (isVagueHealthAsk(message)) {
    return {
      phase: "need-detail",
      context: message,
      content: followUp(),
      productIds: [],
      explanations: {},
      listedIds: [],
      candidates: [],
    };
  }

  const keywords = matchedKeywords(message);
  if (keywords.length === 0) {
    return {
      phase: "idle",
      context: input.context,
      content: finish(
        "Peptide bioregulators are short chains the catalog describes for one concern, such as sleep or joints. They are not a medicine. Name a concern and I can show a short list."
      ),
      productIds: [],
      explanations: {},
      listedIds: [],
      candidates: [],
    };
  }

  const ids = productsFor(message);
  if (ids.length === 0) {
    return {
      phase: "idle",
      context: message,
      content: finish("Name a concern, such as energy, sleep, or joints, and I can show a short list."),
      productIds: [],
      explanations: {},
      listedIds: [],
      candidates: [],
    };
  }
  const reply = ids.length > MAX_LIST ? narrowReply(ids, message) : listReply(ids, message);
  return { ...reply, context: message };
}
