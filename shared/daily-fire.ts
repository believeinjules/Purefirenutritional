/**
 * "Daily Fire" discount quiz: shared config (browser + API).
 *
 * The visitor answers ONE question (any answer counts) and the SERVER picks a
 * weighted discount tier and mints a unique, single-use Stripe promotion code
 * (api/_lib/discount.ts). Nothing here is trusted from the client except the
 * question/answer ids, which are only logged as promotion-code metadata.
 *
 * Copy rules: structure/function wording only, no disease or treatment claims,
 * no medical advice, "U.S." spelling, no links to other stores.
 */

export const DAILY_FIRE_NAME = "Daily Fire";
/** Alternatives offered to Julia; DAILY_FIRE_NAME is the default. */
export const DAILY_FIRE_NAME_OPTIONS = ["Daily Fire", "Spark of the Day", "Fire Starter Question"] as const;

export type DiscountTier = { percentOff: 5 | 10 | 15 | 20 | 25; weight: number };

/** Weights out of 100: 5% and 10% are 75% of all reveals. */
export const DISCOUNT_TIERS: readonly DiscountTier[] = [
  { percentOff: 5, weight: 40 },
  { percentOff: 10, weight: 35 },
  { percentOff: 15, weight: 15 },
  { percentOff: 20, weight: 7 },
  { percentOff: 25, weight: 3 },
] as const;

export const TOTAL_TIER_WEIGHT = DISCOUNT_TIERS.reduce((s, t) => s + t.weight, 0);

/**
 * Picks a tier from an integer roll in [0, TOTAL_TIER_WEIGHT). The server
 * passes crypto.randomInt(TOTAL_TIER_WEIGHT); tests pass every roll.
 */
export function tierForRoll(roll: number): DiscountTier {
  let r = Math.floor(roll);
  if (!Number.isFinite(r) || r < 0) r = 0;
  if (r >= TOTAL_TIER_WEIGHT) r = TOTAL_TIER_WEIGHT - 1;
  for (const tier of DISCOUNT_TIERS) {
    if (r < tier.weight) return tier;
    r -= tier.weight;
  }
  return DISCOUNT_TIERS[0];
}

/** Single-use code lifetime. */
export const DAILY_FIRE_CODE_TTL_DAYS = 7;
/** A dismissed popup stays away this long. A claimed one never returns while the code is valid, and not for this long either. */
export const DAILY_FIRE_SNOOZE_DAYS = 30;

/** Stripe coupon id per tier (create once per Stripe mode; see docs/daily-fire-discounts.md). */
export function couponIdForPercent(percentOff: number, prefix = "pf-daily-fire-"): string {
  return `${prefix}${percentOff}`;
}

/** Customer-facing code shape: FIRE10-K7Q2MX (no 0/O/1/I/L to avoid typos). */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const DAILY_FIRE_CODE_RE = /^FIRE(5|10|15|20|25)-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

/** Promotion codes accepted by checkout: Stripe allows a-z, A-Z, 0-9 and dashes. */
export const PROMO_CODE_RE = /^[A-Za-z0-9-]{3,64}$/;

export function normalizePromoCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.trim().toUpperCase();
  return PROMO_CODE_RE.test(code) ? code : null;
}

export type QuizOption = { id: string; label: string };
export type QuizQuestion = {
  id: string;
  kind: "goals" | "peptides" | "body";
  prompt: string;
  options: QuizOption[];
  /** Trivia only: the option id that is correct (any answer still reveals a code). */
  answerId?: string;
  /** Shown after answering. Educational, structure/function only. */
  fact?: string;
};

const opts = (...labels: string[]): QuizOption[] =>
  labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "goal-focus",
    kind: "goals",
    prompt: "Which area of wellness are you focusing on this season?",
    options: opts("Energy and focus", "Sleep and recovery", "Skin, hair, and nails", "Joints and mobility"),
  },
  {
    id: "goal-morning",
    kind: "goals",
    prompt: "What does your ideal morning feel like?",
    options: opts("Clear and focused", "Rested and calm", "Strong and ready to move", "Glowing and refreshed"),
  },
  {
    id: "goal-habit",
    kind: "goals",
    prompt: "Which daily habit are you building right now?",
    options: opts("A steady sleep schedule", "Moving every day", "Eating more whole foods", "Drinking more water"),
  },
  {
    id: "goal-aging",
    kind: "goals",
    prompt: "How do you like to support healthy aging?",
    options: opts("Nutrition first", "Movement and strength", "Rest and stress balance", "Targeted supplements"),
  },
  {
    id: "goal-unwind",
    kind: "goals",
    prompt: "What helps you unwind at the end of the day?",
    options: opts("A good book", "A walk outside", "Stretching", "Music"),
  },
  {
    id: "pep-familiar",
    kind: "peptides",
    prompt: "How familiar are you with peptide bioregulators?",
    options: opts("Brand new to them", "I've read a little", "I've tried a few", "Long-time fan"),
  },
  {
    id: "pep-learn",
    kind: "peptides",
    prompt: "What would you most like to learn more about?",
    options: opts(
      "How peptides work",
      "Choosing a bioregulator",
      "Daily wellness routines",
      "The research behind Khavinson peptides"
    ),
  },
  {
    id: "pep-what",
    kind: "peptides",
    prompt: "What is a peptide?",
    options: opts("A short chain of amino acids", "A type of fat", "A mineral", "A type of sugar"),
    answerId: "a",
    fact: "Peptides are short chains of amino acids, the same building blocks that make up proteins.",
  },
  {
    id: "pep-khavinson",
    kind: "peptides",
    prompt: "Who is known for decades of research on peptide bioregulators?",
    options: opts("Professor Vladimir Khavinson", "Louis Pasteur", "Marie Curie", "Alexander Fleming"),
    answerId: "a",
    fact: "Professor Vladimir Khavinson and his colleagues in St. Petersburg have studied short peptides for more than 40 years.",
  },
  {
    id: "pep-cytogen-length",
    kind: "peptides",
    prompt: "Synthesized \"cytogen\" bioregulators are usually how many amino acids long?",
    options: opts("2 to 4", "50 to 100", "About 500", "Over 1,000"),
    answerId: "a",
    fact: "Cytogens are synthesized di-, tri-, and tetrapeptides: just 2 to 4 amino acids.",
  },
  {
    id: "body-amino-acids",
    kind: "body",
    prompt: "How many standard amino acids does the body use to build proteins?",
    options: opts("5", "20", "50", "100"),
    answerId: "b",
    fact: "There are 20 standard amino acids. Nine are called essential because they have to come from food.",
  },
  {
    id: "body-largest-organ",
    kind: "body",
    prompt: "What is the largest organ of the human body?",
    options: opts("The liver", "The brain", "The skin", "The lungs"),
    answerId: "c",
    fact: "Your skin is your largest organ. It covers about 20 square feet in an adult.",
  },
  {
    id: "body-pineal",
    kind: "body",
    prompt: "Which gland makes melatonin, part of your sleep–wake rhythm?",
    options: opts("Thyroid", "Pineal", "Adrenal", "Pancreas"),
    answerId: "b",
    fact: "The small pineal gland in the brain releases melatonin, mostly in the dark hours.",
  },
  {
    id: "body-bones",
    kind: "body",
    prompt: "About how many bones are in the adult human body?",
    options: opts("106", "156", "206", "306"),
    answerId: "c",
    fact: "Adults have 206 bones. Babies start with more, and some fuse together as they grow.",
  },
  {
    id: "body-collagen",
    kind: "body",
    prompt: "What is the most abundant protein in the human body?",
    options: opts("Keratin", "Collagen", "Insulin", "Hemoglobin"),
    answerId: "b",
    fact: "Collagen is the body's most abundant protein, a key structural part of skin, tendons, and bones.",
  },
  {
    id: "body-second-brain",
    kind: "body",
    prompt: "Which part of the body is often called the \"second brain\"?",
    options: opts("The heart", "The gut", "The liver", "The skin"),
    answerId: "b",
    fact: "The gut has its own network of hundreds of millions of nerve cells, the enteric nervous system.",
  },
  {
    id: "body-water",
    kind: "body",
    prompt: "About how much of an adult's body weight is water?",
    options: opts("About 30%", "About 45%", "About 60%", "About 85%"),
    answerId: "c",
    fact: "Water makes up roughly 60% of an adult's body weight.",
  },
  {
    id: "body-bone-mineral",
    kind: "body",
    prompt: "Which mineral is the main building block of bones?",
    options: opts("Iron", "Calcium", "Zinc", "Sodium"),
    answerId: "b",
    fact: "Bones store about 99% of the body's calcium.",
  },
  {
    id: "body-circadian",
    kind: "body",
    prompt: "What does \"circadian\" in circadian rhythm mean?",
    options: opts("About a day", "About a week", "About a month", "About a year"),
    answerId: "a",
    fact: "It comes from the Latin circa diem, \"about a day\": your body's roughly 24-hour cycle.",
  },
] as const;

export function questionById(id: unknown): QuizQuestion | undefined {
  return typeof id === "string" ? QUIZ_QUESTIONS.find((q) => q.id === id) : undefined;
}

/** Random question for this visit (browser side; the discount is still decided server-side). */
export function pickQuestion(rand: () => number = Math.random): QuizQuestion {
  const i = Math.min(QUIZ_QUESTIONS.length - 1, Math.floor(rand() * QUIZ_QUESTIONS.length));
  return QUIZ_QUESTIONS[Math.max(0, i)];
}

/** Estimated discount shown in the cart; Stripe computes the exact amount. */
export function estimateDiscountCents(merchandiseCents: number, percentOff: number): number {
  if (!Number.isFinite(merchandiseCents) || merchandiseCents <= 0) return 0;
  if (!Number.isFinite(percentOff) || percentOff <= 0) return 0;
  return Math.round((merchandiseCents * Math.min(percentOff, 100)) / 100);
}

/** Paths where the popup never appears. */
export function isDailyFireExcludedPath(path: string): boolean {
  const p = (path || "/").split(/[?#]/)[0].toLowerCase();
  return [
    "/checkout",
    "/admin",
    "/login",
    "/signup",
    "/auth",
    "/review",
    "/dashboard",
    "/__dev",
  ].some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

/**
 * Mailing-list consent shown on the email step (exact wording; the server
 * stores THIS constant as `consentText`, never text sent by the browser).
 * Bump DAILY_FIRE_CONSENT_VERSION whenever the wording changes.
 */
export const DAILY_FIRE_CONSENT_TEXT = "Email me Pure Fire news and offers. Unsubscribe anytime.";
export const DAILY_FIRE_CONSENT_VERSION = "2026-11-18";
