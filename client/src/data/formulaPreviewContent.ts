/**
 * PROPOSAL copy for the rolled-out product pages (Julia's Bonomarlot template, written
 * per product). Only ids in FORMULA_PDP_CONTENT render the new template; Prime Peptide
 * and hidden products never do. Nothing here is live.
 *
 * Batch status (2026-11-09): Khavinson Cytomax® (all 21), plus Revilab ML 02 and
 * Zinsil-T as examples. Remaining lines wait for Julia's review.
 */
import { isHiddenProduct } from "@shared/hidden-products";
import { CYTOMAX_COPY } from "./pdpCopy/cytomax";
import { REVILAB_ML_COPY } from "./pdpCopy/revilabMl";
import { NUTRITIONAL_COPY } from "./pdpCopy/nutritional";
import type { FormulaPdpContent } from "./pdpCopy/shared";

export type { DirectionsSource, FormulaPdpContent } from "./pdpCopy/shared";
export { MANUFACTURER_DIRECTIONS_LINE } from "./pdpCopy/shared";
export { BONOMARLOT_BROCHURE_DIRECTIONS } from "./pdpCopy/cytomax";

/** Never roll out over Prime Peptide (wording frozen) or hidden products. */
const PRIME_IDS = /^prime-peptide-/;

const ALL: Record<string, FormulaPdpContent> = { ...CYTOMAX_COPY, ...REVILAB_ML_COPY, ...NUTRITIONAL_COPY };

export const FORMULA_PDP_CONTENT: Readonly<Record<string, FormulaPdpContent>> = Object.fromEntries(
  Object.entries(ALL).filter(([id]) => !PRIME_IDS.test(id) && !isHiddenProduct({ id })),
);

/** Copy grouped by line, for the counsel review file and tests. */
export const PDP_COPY_BATCHES: ReadonlyArray<{ line: string; ids: string[] }> = [
  { line: "Khavinson Cytomax®", ids: Object.keys(CYTOMAX_COPY) },
  { line: "Revilab ML (example)", ids: Object.keys(REVILAB_ML_COPY) },
  { line: "Nutritional supplements (example)", ids: Object.keys(NUTRITIONAL_COPY) },
];

/** Shared "Dosage & Course Information" (capsule/tablet products; never Prime). Verbatim, 4 paragraphs. */
export const DOSAGE_COURSE_HEADING = "Dosage & Course Information";
export const DOSAGE_COURSE_PARAGRAPHS: readonly string[] = [
  "Manufacturer directions provide general serving and usage information, not personalized recommendations. Package size does not necessarily indicate a single course length.",
  "Appropriate use may depend on the specific formulation, individual health considerations, and the intended purpose of use. Published research and manufacturer materials may describe different usage schedules, but these should not be interpreted as instructions to change the labeled serving amount.",
  "We encourage customers to review the available research and consult a qualified healthcare professional before use, particularly when considering a serving amount or course duration different from the product label.",
  "Always refer to the current packaging for the manufacturer's directions. Do not exceed the labeled serving amount without guidance from a qualified healthcare professional.",
];

export const FDA_DISCLAIMER =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

/**
 * FAQ entries hidden on rolled-out pages because the new sections cover them
 * ("What is {Name}?" → Snapshot/About; "How should I take it?" → Manufacturer Directions).
 */
export function isPreviewRemovedFaq(productName: string, question: string): boolean {
  return question === `What is ${productName}?` || question === "How should I take it?";
}
