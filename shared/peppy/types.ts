/**
 * Pepita — shared response contract between the /api/peppy endpoint, the
 * deterministic fallback engine and the /ai-assistant UI.
 */

export type StudyType =
  | "systematic-review"
  | "rct"
  | "clinical"
  | "observational"
  | "review"
  | "animal"
  | "in-vitro"
  | "guidance"
  | "other";

export interface ResearchSource {
  /** "pmid:<PMID>" for PubMed, "ref:<slug>" for NIH/FDA guidance pages. */
  id: string;
  kind: "pubmed" | "authority";
  /** Verbatim published title. Never paraphrased. */
  title: string;
  authors?: string;
  /** Journal name (PubMed) or publisher (guidance pages). */
  journal?: string;
  year?: string;
  pmid?: string;
  doi?: string;
  url: string;
  studyType: StudyType;
  /** One-line plain-English summary of what the source found. */
  finding?: string;
  /** One-line limitation (animal vs human, sample size, single group, ...). */
  limitation?: string;
  origin: "curated" | "pubmed-live";
}

/** A source as rendered under "What the research says". */
export interface PeppySourceCard extends ResearchSource {
  finding: string;
  limitation: string;
}

/** Catalog product as Pepita sees it (Firestore first, products.ts fallback). */
export interface PeppyProduct {
  id: string;
  name: string;
  priceUSD: number;
  image?: string;
  category: string;
  /** Claim-filtered benefit lines (structure/function only). */
  benefits: string[];
  ingredients: string[];
  /** Short claim-filtered description. */
  summary: string;
  /** Manufacturer directions from the label (disease language removed). */
  usage?: string;
  inStock: boolean;
}

export interface PeppyProductSuggestion {
  product: PeppyProduct;
  /** Why this product relates to the question (ingredients/formulation). */
  why: string;
  /** Honesty line: ingredient evidence vs evidence for this finished product. */
  evidenceNote: string;
  /** Short tissue-target line for the compact card ("Cartilage bioregulator"). */
  tissue?: string;
  /** Which family the product belongs to (shown on the card, used to explain differences). */
  family?: ProductFamily;
  /** Verified manufacturer protocol from product-data.json, if any (never a clinical regimen). */
  protocol?: string;
  /** Research about this product's peptide or ingredients (curated registry only), for the card details. */
  research?: { id: string; title: string; url: string; finding?: string }[];
  /** Course/research schedules from the facts file: educational only, never the label. */
  alternatives?: { text: string; kind: string }[];
}

export type ProductFamily = "khavinson" | "prime-peptide" | "revilab" | "other";

/**
 * Fallback memory: what the customer has told Pepita so far in this conversation
 * (tracked in component state, sent with each request so picks refine instead of restarting).
 */
export interface PeppyProfile {
  goal?: "prevention" | "recovery" | "existing";
  duration?: string;
  age?: string;
  activity?: string;
  /** Body area the customer named (knee, hip, back...). */
  area?: string;
}

export interface AnswerSection {
  heading?: string;
  /** Markdown-light: paragraphs separated by blank lines, "- " bullets, **bold**. */
  body: string;
}

export interface SafetyNotice {
  level: "info" | "caution" | "urgent";
  title: string;
  body: string;
}

export type PeppyMode = "llm" | "fallback" | "urgent";

export interface PeppyResponse {
  mode: PeppyMode;
  /** Short direct answer shown first. */
  summary: string;
  sections: AnswerSection[];
  research: PeppySourceCard[];
  /** One-line overall evidence-strength note. */
  evidenceNote?: string;
  safety?: SafetyNotice;
  /** Deeper science for the expandable "Learn more" section (physiology, mechanisms, how products differ). */
  learnMore?: AnswerSection[];
  /** Clarifying questions — only when the answer would materially change (0–3). */
  followUps: string[];
  /** Tappable next questions (2–4). */
  suggestions: string[];
  /** Optional, secondary product suggestions. */
  products: PeppyProductSuggestion[];
  /** Show the compact per-answer FDA note (health/product related answers). */
  showDisclaimer: boolean;
  /** Topic ids used (for analytics/tests; no user text). */
  topics: string[];
}

export interface PeppyHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface PeppyRequestBody {
  message: string;
  history?: PeppyHistoryTurn[];
  /** Product page hand-off (/ai-assistant?product=...). */
  productId?: string;
  goal?: "preventive" | "restorative";
  /** Slots remembered from earlier answers in this chat (fallback memory). */
  profile?: PeppyProfile;
}

/** Limits shared by client and server. */
export const PEPPY_LIMITS = {
  maxMessageChars: 800,
  maxHistoryTurns: 24,
  maxHistoryChars: 1500,
  maxSources: 5,
  maxProducts: 3,
  maxFollowUps: 3,
  maxSuggestions: 4,
} as const;
