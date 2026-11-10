/**
 * Copy for the rolled-out product pages (Julia's round-3 Bonomarlot template, written
 * per product). Only ids in FORMULA_PDP_CONTENT render the new template; Prime Peptide
 * and hidden products never do.
 *
 * Status (2026-11-09, approved for the main site): Khavinson Cytomax® (21),
 * Khavinson Cytogen® (6) and Revilab ML 01–09.
 */
import { isHiddenProduct } from "@shared/hidden-products";
import { CYTOMAX_COPY } from "./pdpCopy/cytomax";
import { REVILAB_ML_COPY } from "./pdpCopy/revilabMl";
import { CYTOGEN_COPY } from "./pdpCopy/cytogen";
import { TEMPLATE_COPY } from "./pdpCopy/template";
import { PHASE2_COPY } from "./pdpCopy/phase2";
import type { FormulaPdpContent } from "./pdpCopy/shared";

export type { DirectionsSource, FormulaPdpContent } from "./pdpCopy/shared";
export { MANUFACTURER_DIRECTIONS_LINE } from "./pdpCopy/shared";
export { BONOMARLOT_BROCHURE_DIRECTIONS } from "./pdpCopy/cytomax";

/** Never roll out over Prime Peptide (wording frozen) or hidden products. */
const PRIME_IDS = /^prime-peptide-/;

/**
 * Round 3 (Julia approved 2026-11-09): every Khavinson Cytomax, Cytogen and Revilab ML capsule
 * page. Phase 2 (local, pdpCopy/phase2.ts): the remaining visible non-Prime products with their
 * real forms (Revilab SL drops, cosmetics, tablets, nutritional). Prime Peptide never.
 */
const ROUND3: Record<string, FormulaPdpContent> = { ...CYTOMAX_COPY, ...CYTOGEN_COPY, ...REVILAB_ML_COPY };

/** Meta description "{Name}: {snapshot}", cut before its last " with " clause only when over 160. */
function templateMeta(title: string, name: string, snapshot: string): string | undefined {
  const mark = title.startsWith(`${name}®`) ? `${name}®` : name;
  const full = `${mark}: ${snapshot.replace(/^A /, "a ").replace(/^An /, "an ")}`;
  if (full.length <= 160) return undefined;
  const at = full.lastIndexOf(" with ");
  return at > 0 ? `${full.slice(0, at)}.` : undefined;
}

/**
 * ChatGPT content template (Julia 2026-11-09): one-sentence Snapshot, two-sentence Biological
 * Focus, "Line · Formula type" subline. Copy only; layout and styling stay as on main.
 */
function applyTemplate(id: string, c: FormulaPdpContent): FormulaPdpContent {
  const t = TEMPLATE_COPY[id];
  const name = c.title.split(/®| — /)[0];
  const snapshot = t?.snapshot ?? c.snapshot;
  return {
    ...c,
    subline: c.subline.replace(" | ", " · "),
    snapshot,
    biologicalFocus: { heading: c.biologicalFocus.heading, body: t?.focus ?? c.biologicalFocus.body },
    metaDescription: t?.snapshot ? templateMeta(c.title, name, snapshot) : c.metaDescription,
  };
}

const ALL: Record<string, FormulaPdpContent> = {
  ...Object.fromEntries(Object.entries(ROUND3).map(([id, c]) => [id, applyTemplate(id, c)])),
  ...Object.fromEntries(
    Object.entries(PHASE2_COPY).map(([id, c]) => [id, { ...c, metaDescription: c.metaDescription ?? templateMeta(c.title, c.title, c.snapshot) }]),
  ),
};

export const FORMULA_PDP_CONTENT: Readonly<Record<string, FormulaPdpContent>> = Object.fromEntries(
  Object.entries(ALL).filter(([id]) => !PRIME_IDS.test(id) && !isHiddenProduct({ id })),
);

/** Copy grouped by line, for the counsel review file and tests. */
export const PDP_COPY_BATCHES: ReadonlyArray<{ line: string; ids: string[] }> = [
  { line: "Khavinson Cytomax®", ids: Object.keys(CYTOMAX_COPY) },
  { line: "Khavinson Cytogen®", ids: Object.keys(CYTOGEN_COPY) },
  { line: "Revilab ML", ids: Object.keys(REVILAB_ML_COPY) },
  { line: "Phase 2 (SL, nutritional, anti-aging, cosmetic, GPL)", ids: Object.keys(PHASE2_COPY) },
];

/** "Dosage & Course Information" visible text (ChatGPT template, Julia 2026-11-09), verbatim on every page. */
export const DOSAGE_COURSE_SHORT =
  "Manufacturer directions are general, not personalized. Package quantity does not necessarily represent a single course. Review the research and consult a qualified healthcare professional before considering a different serving amount or duration.";
/** Line under the active complex (ChatGPT template). The full list closes "Safety & FAQs". */
export const INGREDIENTS_TEMPLATE_NOTE = "Full ingredients listed below or on label.";
export const LABEL_INFORMATION_HEADING = "Label Information";

/** Per-product FAQs hidden on every product page: injectable messaging stays on the homepage only (Julia 2026-11-09). */
export function isInjectableFaq(question: string): boolean {
  return /inject/i.test(question);
}

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

/**
 * Products whose "Recommended combination" line (in the catalog's product-line text) is not
 * approved for change: it stays on the page word for word after "About This Product Line" is
 * removed. Bonomarlot is excluded (its round-3 page was approved without it).
 */
export const RECOMMENDED_COMBINATION_IDS: ReadonlySet<string> = new Set([
  "cartalax", "chelohart", "crystagen", "gotratix", "pielotax", "ventfort", "visoluten", "thyreogen",
]);

/** The unchanged "Recommended combination(s): …" sentence from seriesInfo, for the ids above. */
export function recommendedCombinationLine(id: string, seriesInfo: string | undefined): string | undefined {
  if (!RECOMMENDED_COMBINATION_IDS.has(id) || !seriesInfo) return undefined;
  const start = seriesInfo.search(/Recommended combinations?:/);
  if (start < 0) return undefined;
  const end = seriesInfo.indexOf(". ", start);
  return (end < 0 ? seriesInfo.slice(start) : seriesInfo.slice(start, end + 1)).trim();
}
