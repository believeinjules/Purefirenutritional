/**
 * Peppy claim rules (DSHEA structure/function only for OUR product copy).
 *
 * - Product-facing text (why-relevant lines, evidence notes, product summaries) may never
 *   carry disease names, treat/cure/prevent/diagnose language, efficacy percentages,
 *   lifespan/telomere promises, "clinically proven", or "oncoprotector".
 * - General answer prose may discuss research on conditions, but any sentence that ties a
 *   catalog product to a disease or to treat/cure/prevent language is removed.
 * - Cited paper titles are quoted verbatim and are NOT filtered — the rules apply to our
 *   claims, not to published titles.
 *
 * Patterns carried over from the retired client assistantReply.ts safeBenefits() filter
 * (% figures, lifespan, cure, clinically proven, telomere, dose/capsule/mg, oncolog, chemo)
 * are kept and extended here.
 */
import { normalizeForMatch, splitSentences } from "./text.js";

/** Required FDA line for health/product answers. Do not paraphrase. */
export const ASSISTANT_DISCLAIMER =
  "These statements have not been evaluated by the FDA.\nAlways consult a medical professional.";

/** Words we never use in our own copy (Julia: "geroprotector" OK, "oncoprotector" not). */
export const BANNED_TERMS =
  /\bonco[- ]?protect\w*|\banti-?(?:cancer|tumou?r|carcinogen\w*)\b|\bantitumou?r\b/i;

/** Disease / condition vocabulary (FDA disease-claim territory when attached to a product). */
export const DISEASE_TERMS =
  /\b(cancer\w*|tumou?r\w*|oncolog\w*|carcinom\w*|leuka?emi\w*|lymphoma|metasta\w*|chemo\w*|diabet\w*|alzheimer\w*|dementia|parkinson\w*|huntington\w*|arthritis|osteoarthr\w*|osteoporo\w*|hypertension|high blood pressure|hypotension|heart disease|heart failure|coronary|atheroscl\w*|myocardial infarction|heart attack|stroke|covid\w*|coronavirus|influenza|\bflu\b|infection\w*|infectious|viral|virus\w*|bacterial|hiv|aids|hepatitis|cirrhosis|fatty liver|kidney disease|renal failure|nephropath\w*|retinopath\w*|macular degeneration|\bamd\b|glaucoma|cataract\w*|retinitis|depression|depressive|anxiety disorder|bipolar|schizophren\w*|adhd|autism|insomnia|sleep apnea|infertil\w*|erectile dysfunction|impotence|prostatitis|prostate enlargement|\bbph\b|hypothyroid\w*|hyperthyroid\w*|hashimoto\w*|graves|thyroiditis|asthma|copd|bronchitis|pneumonia|lupus|multiple sclerosis|psoriasis|eczema|anemi\w*|anaemi\w*|obesity|disease\w*|disorder\w*|syndrome|patholog\w*|autoimmun\w*|inflammatory disease|ulcer\w*|gout|fibromyalgia|epilep\w*|seizure\w*|migraine\w*|neuropath\w*|cholesterol|hypercholesterol\w*|dyslipid\w*|glucose intolerance|insulin resistance|blood sugar)\b/i;

/** Treat/cure-type verbs that create a drug claim when attached to a product. */
export const CLAIM_VERBS =
  /\b(cur(?:e|es|ed|ing)|treat(?:s|ed|ing|ment|ments)?|heal(?:s|ed|ing)?|prevent(?:s|ed|ing|ion|ive)?|revers(?:e|es|ed|ing)|diagnos\w*|eliminat\w*|eradicat\w*|fight(?:s|ing)?|combat\w*|kills?|remed(?:y|ies)|therap(?:y|ies|eutic)|medicat\w*|prescri\w*|restor(?:e|es|ed|ing|ation)|normaliz\w*|normalis\w*|regenerat\w*|repair(?:s|ed|ing)?|protects? against|replace(?:s)? (?:your|a|the)? ?(?:medic\w*|drug\w*))\b/i;

/** Efficacy/longevity promises not allowed in product copy (from original safeBenefits). */
export const PROMISE_TERMS =
  /\d+(?:[.,]\d+)?\s*(?:[–-]\s*\d+(?:[.,]\d+)?\s*)?%|\blifespan\b|\blife span\b|\bprolong\w* (?:life|lifespan)|\btelomer\w*|\bclinically (?:proven|shown|tested)\b|\bproven to\b|\bguarantee\w*|\bmiracle\b|\bno side effects\b|\bdoping\b|\bdose\b|\bcapsules?\b|\bmg\b/i;

export type ClaimIssue = "banned-term" | "disease" | "claim-verb" | "promise";

/** Issues in a piece of PRODUCT-facing copy (why-relevant, evidence note, summary, benefit). */
export function productCopyIssues(text: string): ClaimIssue[] {
  const issues: ClaimIssue[] = [];
  if (BANNED_TERMS.test(text)) issues.push("banned-term");
  if (DISEASE_TERMS.test(text)) issues.push("disease");
  if (CLAIM_VERBS.test(text)) issues.push("claim-verb");
  if (PROMISE_TERMS.test(text)) issues.push("promise");
  return issues;
}

export function isCompliantProductCopy(text: string): boolean {
  return productCopyIssues(text).length === 0;
}

/**
 * Evidence notes compare ingredient research with the finished product. They may say a
 * product is "not tested" or that research was "in animals", but still never name a disease
 * or promise an outcome.
 */
export function isCompliantEvidenceNote(text: string): boolean {
  return (
    !BANNED_TERMS.test(text) &&
    !DISEASE_TERMS.test(text) &&
    !PROMISE_TERMS.test(text) &&
    !/\b(cur(?:e|es)|treats?|heals?|prevents?|reverses?|diagnos\w*)\b/i.test(
      text
    )
  );
}

/** Catalog benefit lines that are safe to quote (structure/function only). */
export function safeBenefits(
  benefits: readonly string[] | undefined
): string[] {
  return (benefits ?? []).filter(
    b => isCompliantProductCopy(b) && b.trim().length > 2
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function productNamePattern(names: readonly string[]): RegExp | null {
  const parts = names
    .map(n => n.trim())
    .filter(n => n.length >= 3)
    .map(n => escapeRegExp(n).replace(/\\ /g, "\\s+"));
  if (parts.length === 0) return null;
  return new RegExp(
    `\\b(?:${parts.join("|")}|pure fire(?: nutritional)?(?: products?)?|our products?)\\b`,
    "i"
  );
}

/**
 * Clean general answer prose:
 *  - drop any sentence that names a catalog product (or "our products") together with a
 *    disease term or treat/cure/prevent language;
 *  - drop any sentence using a banned term ("oncoprotector", "anti-cancer").
 * Returns the cleaned text and whether anything was removed.
 */
export function sanitizeAnswerProse(
  text: string,
  productNames: readonly string[]
): { text: string; removed: number } {
  const namePattern = productNamePattern(productNames);
  let removed = 0;
  const paragraphs = text.split(/\n{2,}/).map(para => {
    const lines = para.split("\n").map(line => {
      const bullet = line.match(/^(\s*[-•*]\s+)(.*)$/);
      const prefix = bullet ? bullet[1] : "";
      const content = bullet ? bullet[2] : line;
      const kept = splitSentences(content).filter(sentence => {
        if (BANNED_TERMS.test(sentence)) {
          removed++;
          return false;
        }
        if (namePattern && namePattern.test(sentence)) {
          const strictVerb =
            /\b(cur(?:e|es|ed|ing)|treat(?:s|ed|ing|ment)?|heal(?:s|ed|ing)?|prevent(?:s|ed|ing|ion)?|revers(?:e|es|ed|ing)|diagnos\w*|eliminat\w*|fight(?:s|ing)?|combat\w*|replace\w*)\b/i;
          if (
            DISEASE_TERMS.test(sentence) ||
            strictVerb.test(sentence) ||
            PROMISE_TERMS.test(sentence)
          ) {
            removed++;
            return false;
          }
        }
        return true;
      });
      return kept.length ? prefix + kept.join(" ") : "";
    });
    return lines.filter(l => l.trim()).join("\n");
  });
  return { text: paragraphs.filter(p => p.trim()).join("\n\n"), removed };
}

// ── Red flags & guarded intents ─────────────────────────────────────────────

export type RedFlagKind =
  | "cardiac"
  | "stroke"
  | "breathing"
  | "allergy"
  | "overdose"
  | "crisis"
  | "bleeding"
  | "neuro";

const RED_FLAGS: { kind: RedFlagKind; pattern: RegExp }[] = [
  {
    kind: "crisis",
    pattern:
      /\b(suicid\w*|kill (?:my ?self|myself)|end (?:my|it all)|(?:don'?t|do not) want to (?:live|be alive|wake up)|self[- ]?harm\w*|hurt(?:ing)? myself|better off dead|take my (?:own )?life)\b/i,
  },
  {
    kind: "overdose",
    pattern:
      /\b(overdos\w*|took (?:too many|way too much|a whole (?:bottle|vial))|swallowed (?:a|the) (?:whole )?(?:bottle|vial)|poison(?:ed|ing)?|child (?:ate|swallowed)|kid (?:ate|swallowed))\b/i,
  },
  {
    kind: "cardiac",
    pattern:
      /\b(chest (?:pain|pains|pressure|tightness|tight|hurts?|ache)|pain in (?:my|the) chest|(?:having|think i'?m having|think i am having) a heart attack|crushing (?:pain|pressure)|pain (?:spreading|radiating) (?:to|down) (?:my )?(?:left )?(?:arm|jaw)|heart (?:is )?(?:racing|pounding) and (?:i )?(?:feel )?(?:faint|dizzy))\b/i,
  },
  {
    kind: "stroke",
    pattern:
      /\b((?:having|think (?:i'?m|i am|he'?s|she'?s|they'?re) having|signs of) a stroke|face (?:is )?(?:drooping|droop)|drooping face|slurred speech|slurring|(?:sudden )?(?:numbness|weakness) (?:on|in) one side|one side of (?:my|the|his|her) (?:body|face)|can'?t (?:move|feel) (?:my )?(?:arm|leg|face)|sudden (?:confusion|vision loss|loss of vision)|worst headache)\b/i,
  },
  {
    kind: "breathing",
    pattern:
      /\b(can'?t breathe|cannot breathe|can'?t catch my breath|struggling to breathe|trouble breathing|difficulty breathing|short(?:ness)? of breath|choking|lips (?:are |turning )?blue)\b/i,
  },
  {
    kind: "allergy",
    pattern:
      /\b(anaphyla\w*|throat (?:is )?(?:closing|swelling|swollen)|swollen (?:tongue|lips|throat|face)|tongue (?:is )?swelling|hives all over|severe allergic)\b/i,
  },
  {
    kind: "bleeding",
    pattern:
      /\b(coughing (?:up )?blood|vomiting blood|throwing up blood|blood in (?:my )?(?:vomit|stool)|black (?:tarry )?stool|won'?t stop bleeding|bleeding (?:heavily|a lot|won'?t stop))\b/i,
  },
  {
    kind: "neuro",
    pattern:
      /\b(passed out|fainted|fainting|unconscious|having a seizure|seizing|convuls\w*)\b/i,
  },
];

export function detectRedFlag(message: string): RedFlagKind | null {
  const t = normalizeForMatch(message);
  for (const { kind, pattern } of RED_FLAGS) if (pattern.test(t)) return kind;
  return null;
}

export interface GuardFlags {
  pregnancy: boolean;
  pediatric: boolean;
  /** User names a diagnosed disease / asks for disease treatment or cure. */
  disease: boolean;
  /** Wants to replace or stop a prescription medicine. */
  drugReplacement: boolean;
  /** Mentions prescription medicines / blood thinners / interactions. */
  medications: boolean;
  bloodThinners: boolean;
}

const PREGNANCY =
  /\b(pregnan\w*|expecting a baby|breast ?feed\w*|nursing (?:my )?(?:baby|infant)|lactat\w*|trying to (?:conceive|get pregnant)|ttc|postpartum|first trimester|second trimester|third trimester)\b/i;
const PEDIATRIC =
  /\b(my (?:son|daughter|kid|kids|child|children|baby|babies|toddler|infant|teen|teenager|newborn|grandson|granddaughter|grandchild)|for (?:a |my |our )?(?:child|kid|kids|children|baby|toddler|infant|teen|teens|teenager|newborn)|(?:child|kid|toddler|infant|baby|teen)'?s?\b (?:dose|dosing|dosage)|pediatric|paediatric|(?:[1-9]|1[0-7])[- ]?(?:year|yr|month|week)s?[- ]?olds?|under 18)\b/i;
const DISEASE_ASK =
  /\b(i have|i've got|i was diagnosed|diagnosed with|my (?:doctor|dr) (?:says|said) i have|suffer(?:ing)? from|living with|for my|treat(?:ing|ment)? (?:for|of)?|cure(?:s)?|heal(?:s)?|get rid of|reverse)\b/i;
const RX =
  "(?:medication|medications|medicine|medicines|meds|prescription|prescriptions|pills|drugs?|statins?|metformin|insulin|warfarin|levothyroxine|synthroid|thyroxine|antidepressants?|ssris?|blood pressure (?:meds|pills|tablets)|inhaler|chemo\\w*|treatment|blood thinners?)";
const DRUG_REPLACEMENT = new RegExp(
  `\\b(?:instead of (?:\\w+ ){0,3}${RX}|(?:replace|substitute|swap) (?:\\w+ ){0,3}${RX}|(?:stop|stopping|quit|quitting|come off|coming off|get off|getting off|ditch|drop) (?:taking |using )?(?:\\w+ ){0,3}${RX}|${RX} (?:\\w+ ){0,4}(?:instead|replacement)|without (?:\\w+ ){0,2}${RX}|(?:no longer|not) need (?:\\w+ ){0,2}${RX})\\b`,
  "i"
);
const BLOOD_THINNERS =
  /\b(blood thinner\w*|anticoagula\w*|antiplatelet|warfarin|coumadin|jantoven|eliquis|apixaban|xarelto|rivaroxaban|pradaxa|dabigatran|savaysa|edoxaban|heparin|enoxaparin|lovenox|plavix|clopidogrel|brilinta|ticagrelor|baby aspirin|aspirin daily|daily aspirin)\b/i;
const MEDICATIONS =
  /\b(medication\w*|medicine\w*|meds|prescription\w*|drug interaction\w*|interact\w*|on (?:a )?(?:statin|metformin|insulin|levothyroxine|synthroid|ssri|antidepressant\w*|beta[- ]blocker\w*|blood pressure (?:meds|medication|pills))|statin\w*|metformin|insulin|levothyroxine|synthroid|ssri\w*|sertraline|fluoxetine|lisinopril|amlodipine|immunosuppress\w*|tacrolimus|prednisone|steroid\w*|sedative\w*|sleeping pills?|ambien|zolpidem|benzodiazepine\w*|chemo\w*)\b/i;

export function detectGuards(message: string): GuardFlags {
  const t = normalizeForMatch(message);
  const bloodThinners = BLOOD_THINNERS.test(t);
  const diseaseNamed = DISEASE_TERMS.test(t);
  return {
    pregnancy: PREGNANCY.test(t),
    pediatric: PEDIATRIC.test(t),
    disease:
      diseaseNamed &&
      (DISEASE_ASK.test(t) ||
        /\b(cure|treat|treatment|heal|reverse)\b/.test(t) ||
        /\b(cancer|tumou?r|diabet\w*|alzheimer\w*|dementia|parkinson\w*|covid\w*|hiv|hepatitis|heart failure|kidney disease|renal failure|macular degeneration|glaucoma|retinopath\w*|multiple sclerosis|lupus|leuka?emia|lymphoma|stroke)\b/.test(
          t
        )),
    drugReplacement: DRUG_REPLACEMENT.test(t),
    medications: bloodThinners || MEDICATIONS.test(t),
    bloodThinners,
  };
}

/** Products may only be suggested when none of the hard guards are tripped. */
export function productsBlockedBy(flags: GuardFlags): (keyof GuardFlags)[] {
  return (
    ["pregnancy", "pediatric", "disease", "drugReplacement"] as const
  ).filter(k => flags[k]);
}
