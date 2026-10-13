/**
 * Manufacturer's directions for Peppy (internal only).
 *
 * Built from the manufacturer's 2021 product guide. RULES (Julia + Regulatory Advisor):
 *  - Internal only: never link, cite or name the guide to users. Page numbers live here for
 *    review; to users the source is always "manufacturer's directions".
 *  - Capsules / tablets only: no drops, liquids, linguals. Visible catalog products only.
 *  - The label wins: `directions` is taken word for word from the product's label/site usage
 *    text (intensive-schedule sentences and claim words such as "Prevention:" left out). Guide lines
 *    that conflict with it (e.g. "before meals" vs "with meals") were dropped, not reworded.
 *  - `notes` are structure/function only ("supports normal X function"); every effect claim
 *    from the guide's "action" column was removed.
 *  - `conditionDoses` are HIGH RISK and gated (see selectConditionDose): only when the user
 *    explicitly asks for a dose for their condition, never on the doctor-only list, never in a
 *    product-recommendation context, never above the label maximum or more often than the
 *    label, no intensive schedules. Each one needs Julia's approval (peppy-source/review.md).
 */

export interface ConditionDose {
  /** Plain-words condition label (internal; Peppy does not repeat it next to the product). */
  condition: string;
  /** Lowercase keywords that identify the condition in a user message. */
  keywords: string[];
  /** Schedule only, label timing included. Framed to users as "a protocol some people have followed". */
  schedule: string;
  /** Guide page (internal review only). */
  page: number;
}

export interface GuideEntry {
  id: string;
  /** Label / site usage text, verbatim. Always the default answer. */
  directions: string;
  /** Course length stated on the label, if any. */
  course?: string;
  /** Structure/function notes (body systems), from the guide with claims removed. */
  notes: string[];
  /** Guide pages the notes came from (internal review only). */
  pages: number[];
  /** Gated, high-risk condition-specific schedules. */
  conditionDoses?: ConditionDose[];
}

const CYTOMAX = "1–2 capsules 1–2 times daily with meals.";
const ML = "Take 1 capsule daily in the morning on an empty stomach.";
const ML_COURSE = "4–6 weeks; may be repeated 1–2 times per year";

export const MANUFACTURER_GUIDE: GuideEntry[] = [
  { id: "bonomarlot", directions: `${CYTOMAX} Maintenance: 20-capsule vial (10 days).`, notes: ["Supports normal bone marrow and blood-forming function."], pages: [70] },
  { id: "cartalax", directions: CYTOMAX, course: "30 days; repeat every 3–6 months", notes: ["Supports normal cartilage and connective tissue."], pages: [9, 41] },
  { id: "chelohart", directions: `${CYTOMAX} Maintenance: 20-capsule vial.`, notes: ["Supports normal heart muscle function."], pages: [7, 9] },
  { id: "crystagen", directions: CYTOMAX, course: "30 days; repeat every 3–6 months", notes: ["Supports normal immune function."], pages: [22, 45] },
  {
    id: "endoluten",
    directions: `${CYTOMAX} Maintenance: 20-capsule vial (10 days).`,
    notes: ["Supports normal pineal gland and neuroendocrine function.", "Supports a normal sleep–wake rhythm."],
    pages: [12, 26, 28],
    conditionDoses: [
      { condition: "asthma", keywords: ["asthma"], schedule: "1 capsule once every 3 days, in the morning with a meal", page: 12 },
      { condition: "stomach lining irritation or stomach ulcers", keywords: ["gastritis", "stomach ulcer", "duodenal ulcer", "peptic ulcer"], schedule: "1 capsule once every 3 days, in the morning with a meal", page: 17 },
      { condition: "low mood or depression", keywords: ["depression", "depressed", "low mood"], schedule: "1 capsule once every 3 days, in the morning with a meal", page: 26 },
      { condition: "migraines", keywords: ["migraine"], schedule: "1 capsule once every 3 days, in the morning with a meal", page: 28 },
      { condition: "rheumatoid arthritis", keywords: ["rheumatoid"], schedule: "1 capsule once every 3 days, in the morning with a meal", page: 50 },
      { condition: "bone thinning (osteoporosis)", keywords: ["osteoporosis", "osteopenia", "bone thinning", "bone loss"], schedule: "1 capsule once every 3 days, in the morning with a meal", page: 52 },
    ],
  },
  { id: "pielotax", directions: CYTOMAX, course: "30 days; repeat every 3–6 months", notes: ["Supports normal kidney function."], pages: [34, 41] },
  { id: "testoluten", directions: "1 capsule twice daily with meals for 30 days. Repeat every 4–6 months.", course: "30 days; repeat every 4–6 months", notes: ["Supports normal male reproductive gland function."], pages: [60] },
  { id: "thyreogen", directions: CYTOMAX, course: "10–30 days; repeat in 4–6 months", notes: ["Supports normal thyroid gland function."], pages: [38, 63] },
  {
    id: "ventfort",
    directions: CYTOMAX,
    course: "30 days; repeat every 3–6 months",
    notes: ["Supports normal blood vessel wall structure."],
    pages: [6, 8],
    conditionDoses: [
      { condition: "rheumatoid arthritis", keywords: ["rheumatoid"], schedule: "2 capsules once every 3 days, in the morning with a meal", page: 50 },
    ],
  },
  {
    id: "vesugen",
    directions: CYTOMAX,
    course: "30 days; repeat every 3–6 months",
    notes: ["Supports normal blood vessel wall structure."],
    pages: [6, 9],
    conditionDoses: [
      { condition: "rheumatoid arthritis", keywords: ["rheumatoid"], schedule: "2 capsules once every 3 days, in the morning with a meal", page: 50 },
    ],
  },
  {
    id: "visoluten",
    directions: CYTOMAX,
    course: "30 days; repeat every 3–6 months",
    notes: ["Supports normal retina and eye function."],
    pages: [54],
    conditionDoses: [
      { condition: "eye conditions such as glaucoma, cataract or macular degeneration", keywords: ["glaucoma", "cataract", "macular"], schedule: "2 capsules once a day, in the morning with a meal", page: 54 },
    ],
  },
  {
    id: "vladonix",
    directions: CYTOMAX,
    course: "30 days; repeat every 3–6 months",
    notes: ["Supports normal immune function."],
    pages: [13, 26, 30],
    conditionDoses: [
      { condition: "high blood pressure or hardened arteries", keywords: ["high blood pressure", "hypertension", "atherosclerosis", "hardening of the arteries"], schedule: "2 capsules once every 3 days, in the morning with a meal", page: 6 },
    ],
  },
  { id: "ensil", directions: "Take 1 capsule 3 times daily with meals. Course duration: 1 month.", course: "1 month", notes: ["Provides vitamins, antioxidants and coenzymes that support normal cellular energy."], pages: [29] },
  { id: "complex-3d", directions: "Take 1 capsule daily with meals. Duration: 4–6 weeks. Course may be repeated throughout the year.", course: "4–6 weeks", notes: ["Provides dihydroquercetin and the antioxidant enzymes superoxide dismutase and catalase."], pages: [66] },
  { id: "zinsil-t", directions: "Take 1 tablet 2 times daily, chewing during meals. Duration: 1 month. May be repeated as needed.", course: "1 month", notes: ["Provides zinc, glycine and vitamin B6, which support normal immune and nervous system function."], pages: [20, 26] },
  {
    id: "revilab-ml-01",
    directions: ML,
    course: ML_COURSE,
    notes: ["Supports normal neuroendocrine, immune and liver function."],
    pages: [26, 68],
    conditionDoses: [
      { condition: "long-term liver conditions (hepatitis, cirrhosis)", keywords: ["hepatitis", "cirrhosis"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 23 },
      { condition: "low mood or depression", keywords: ["depression", "depressed", "low mood"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 26 },
      { condition: "stress and chronic fatigue", keywords: ["chronic fatigue", "burnout", "stress"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 30 },
      { condition: "thyroid problems", keywords: ["thyroid"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 38 },
      { condition: "excess weight", keywords: ["obesity", "obese", "overweight", "weight loss"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 40 },
      { condition: "skin conditions such as vitiligo, psoriasis or eczema", keywords: ["vitiligo", "psoriasis", "eczema", "dermatitis"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 44 },
      { condition: "allergies", keywords: ["allergy", "allergies", "hay fever"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 78 },
    ],
  },
  { id: "revilab-ml-02", directions: ML, course: ML_COURSE, notes: ["Supports normal blood-forming and immune function."], pages: [22] },
  { id: "revilab-ml-03", directions: ML, course: ML_COURSE, notes: ["Supports normal brain, retina and blood vessel function."], pages: [8, 29] },
  {
    id: "revilab-ml-04",
    directions: ML,
    course: ML_COURSE,
    notes: ["Supports normal heart and blood vessel function."],
    pages: [6, 28],
    conditionDoses: [
      { condition: "high blood pressure or hardened arteries", keywords: ["high blood pressure", "hypertension", "atherosclerosis", "hardening of the arteries"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 6 },
      { condition: "migraines", keywords: ["migraine"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 28 },
    ],
  },
  { id: "revilab-ml-05", directions: ML, course: ML_COURSE, notes: ["Supports normal respiratory and immune function."], pages: [12, 14] },
  { id: "revilab-ml-06", directions: ML, course: ML_COURSE, notes: ["Supports normal liver, pancreas and stomach function."], pages: [17, 24] },
  {
    id: "revilab-ml-07",
    directions: ML,
    course: ML_COURSE,
    notes: ["Supports normal male reproductive and urinary function."],
    pages: [61],
    conditionDoses: [
      { condition: "an enlarged prostate", keywords: ["enlarged prostate", "prostate adenoma", "bph", "prostate enlargement"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 61 },
    ],
  },
  {
    id: "revilab-ml-08",
    directions: ML,
    course: ML_COURSE,
    notes: ["Supports normal female hormonal balance and bladder function."],
    pages: [62, 64],
    conditionDoses: [
      { condition: "menopause symptoms", keywords: ["menopause", "menopausal", "hot flashes", "hot flushes", "perimenopause"], schedule: "1 capsule once every 3 days, in the morning on an empty stomach", page: 62 },
    ],
  },
  { id: "revilab-ml-09", directions: ML, course: ML_COURSE, notes: ["Supports normal joint, cartilage and blood vessel function."], pages: [9, 50] },
];

export const MANUFACTURER_GUIDE_BY_ID = new Map(MANUFACTURER_GUIDE.map(e => [e.id, e]));

/** What users are told the source is. Never name or link the guide. */
export const GUIDE_SOURCE_LABEL = "manufacturer's directions";

/** Always added when a condition comes up with a dose. Do not paraphrase. */
export const DOCTOR_DOSE_LINE =
  "The right amount for you has to come from your doctor, based on proper blood tests and your full health picture.";
export const CONDITION_DISCLAIMER =
  "This is general information, not medical advice. These products are not intended to diagnose, treat, cure, or prevent any disease.";

/** Regulatory disease-question format (approved by Julia 2026-10-13). Do not paraphrase. */
export const DISEASE_FORMAT = {
  doctorFirst:
    "Please check with your doctor before buying, especially if you're managing [condition] or take medication.",
  productsHeader: "Products that support [organ] function:",
  studiesHeader: "Published studies",
  limitedHuman: "Most of this research is in cells or animals, and human studies are limited.",
  dosingGeneral:
    "About dosing: The right amount and course can vary from person to person, for example by sex and by your goal. A preventive course (general upkeep) is often different from a regenerative one (more active support after strain or with age). Each product page lists the label directions. Ask your doctor which approach fits you.",
  closing:
    "Please talk with your doctor before starting. Educational information, not medical advice. Not intended to diagnose, treat, cure, or prevent any disease.",
} as const;

/** Hard doctor-only topics: no dose of any kind (label or condition), refer to a doctor. */
export const DOCTOR_ONLY =
  /\b(cancer\w*|tumou?r\w*|oncolog\w*|chemo\w*|radiation|radiotherapy|leuka?emi\w*|lymphoma|myeloma|blood[- ]thinner\w*|anticoagula\w*|warfarin|coumadin|eliquis|apixaban|xarelto|rivaroxaban|heparin|clopidogrel|plavix|diabet\w*|blood sugar|glucose|insulin|metformin|epilep\w*|seizure\w*|multiple sclerosis|\bms\b|\bals\b|amyotrophic|lou gehrig|tuberculosis|\btb\b|fertility|infertil\w*|ivf|trying to conceive|pregnan\w*|breast-?feeding|nursing|child|children|kids?|baby|infant|toddler|teen\w*|minor|emergenc\w*|chest pain|can'?t breathe|overdose|suicid\w*|stop (?:taking )?(?:my )?(?:meds|medication\w*|medicine\w*|pills)|reduc\w* (?:my )?(?:meds|medication\w*|medicine\w*|dose)|replac\w* (?:my )?(?:meds|medication\w*|medicine\w*)|instead of (?:my )?(?:meds|medication\w*|medicine\w*)|come off|wean off|taper)\b/i;

/** The user explicitly asks how much / how often to take something. */
export const EXPLICIT_DOSE_REQUEST =
  /\b(dose|dosage|dosing|how (?:much|many|often)|how should i take|what amount|protocol|schedule)\b/i;

export function isDoctorOnly(message: string): boolean {
  return DOCTOR_ONLY.test(message);
}

/**
 * Gate for the high-risk condition-specific schedules. Returns a dose only when ALL hold:
 * the user explicitly asked for a dose, names a matching condition, the product is the one
 * they asked about, the message is not doctor-only, and the turn is not a recommendation.
 */
export function selectConditionDose(input: {
  message: string;
  productId: string;
  intent: string;
  safetyKind: string | null;
  redFlag: unknown;
}): ConditionDose | null {
  const { message, productId } = input;
  if (input.redFlag || input.safetyKind) return null;
  if (input.intent !== "dosage") return null;
  if (!EXPLICIT_DOSE_REQUEST.test(message) || isDoctorOnly(message)) return null;
  const entry = MANUFACTURER_GUIDE_BY_ID.get(productId);
  if (!entry?.conditionDoses?.length) return null;
  const text = message.toLowerCase();
  return entry.conditionDoses.find(d => d.keywords.some(k => new RegExp(`\\b${k}`).test(text))) ?? null;
}
