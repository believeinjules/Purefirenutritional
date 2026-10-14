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

export interface GuideEntry {
  id: string;
  /** Structure/function notes (body systems), from the guide with claims removed. */
  notes: string[];
  /** Guide pages the notes came from (internal review only). */
  pages: number[];
}

// NO DOSING HERE (2026-10-13). This file used to carry `directions` built from shared template strings
// (one Cytomax line and one Revilab ML line reused for 20 products) plus templated condition schedules.
// That produced generic schedules (e.g. Endoluten "1–2 capsules 1–2 times daily"). All schedules now come
// only from verified per-product records in product-data.json (see product-data.ts).
export const MANUFACTURER_GUIDE: GuideEntry[] = [
  { id: "bonomarlot", notes: ["Supports normal bone marrow and blood-forming function."], pages: [70] },
  { id: "cartalax", notes: ["Supports normal cartilage and connective tissue."], pages: [9, 41] },
  { id: "chelohart", notes: ["Supports normal heart muscle function."], pages: [7, 9] },
  { id: "crystagen", notes: ["Supports normal immune function."], pages: [22, 45] },
  { id: "endoluten", notes: ["Supports normal pineal gland and neuroendocrine function.", "Supports a normal sleep–wake rhythm."], pages: [12, 26, 28] },
  { id: "pielotax", notes: ["Supports normal kidney function."], pages: [34, 41] },
  { id: "testoluten", notes: ["Supports normal male reproductive gland function."], pages: [60] },
  { id: "thyreogen", notes: ["Supports normal thyroid gland function."], pages: [38, 63] },
  { id: "ventfort", notes: ["Supports normal blood vessel wall structure."], pages: [6, 8] },
  { id: "vesugen", notes: ["Supports normal blood vessel wall structure."], pages: [6, 9] },
  { id: "visoluten", notes: ["Supports normal retina and eye function."], pages: [54] },
  { id: "vladonix", notes: ["Supports normal immune function."], pages: [13, 26, 30] },
  { id: "ensil", notes: ["Provides vitamins, antioxidants and coenzymes that support normal cellular energy."], pages: [29] },
  { id: "complex-3d", notes: ["Provides dihydroquercetin and the antioxidant enzymes superoxide dismutase and catalase."], pages: [66] },
  { id: "zinsil-t", notes: ["Provides zinc, glycine and vitamin B6, which support normal immune and nervous system function."], pages: [20, 26] },
  { id: "revilab-ml-01", notes: ["Supports normal neuroendocrine, immune and liver function."], pages: [26, 68] },
  { id: "revilab-ml-02", notes: ["Supports normal blood-forming and immune function."], pages: [22] },
  { id: "revilab-ml-03", notes: ["Supports normal brain, retina and blood vessel function."], pages: [8, 29] },
  { id: "revilab-ml-04", notes: ["Supports normal heart and blood vessel function."], pages: [6, 28] },
  { id: "revilab-ml-05", notes: ["Supports normal respiratory and immune function."], pages: [12, 14] },
  { id: "revilab-ml-06", notes: ["Supports normal liver, pancreas and stomach function."], pages: [17, 24] },
  { id: "revilab-ml-07", notes: ["Supports normal male reproductive and urinary function."], pages: [61] },
  { id: "revilab-ml-08", notes: ["Supports normal female hormonal balance and bladder function."], pages: [62, 64] },
  { id: "revilab-ml-09", notes: ["Supports normal joint, cartilage and blood vessel function."], pages: [9, 50] },
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
    "Educational information, not medical advice. Not intended to diagnose, treat, cure, or prevent any disease.",
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
