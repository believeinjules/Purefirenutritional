/**
 * Shared types and helpers for the rolled-out product page copy (PROPOSAL, local only).
 * Copy files per line live next to this file. Every fact must come from
 * shared/product-facts.json, client/src/data/*, the brochure notes
 * (/workspace/sources/khavinson-brochure-dosing-notes.md) or existing page copy.
 */

/**
 * brochure  = Cytomax/Cytogen brochure quote (with page);
 * package   = the directions printed on the package, shown as "As listed on the package:" (Revilab ML);
 * confirmed = directions Julia confirmed for this product (Endoluten, 2026-10-14), stated plainly.
 */
export type DirectionsKind = "manufacturer" | "brochure" | "package" | "confirmed";

export interface DirectionsSource {
  kind: DirectionsKind;
  /** Plain-text attribution. Never a link (the brochure's distributor is a retail store). */
  attribution: string;
  /** Quoted directions. Brochure text: line-break hyphens joined, otherwise as printed. */
  text: string;
  /** Short tag for the compare table. */
  short: string;
  /** Brochure page number (brochure sources only). */
  page?: number;
}

export interface FormulaPdpContent {
  title: string;
  subline: string;
  snapshot: string;
  ingredients: string[];
  /** TODO: amount per serving. Rendered only when verified. */
  amountPerCapsule?: string;
  biologicalFocus: { heading: string; body: string };
  /** Omitted on streamlined pages (Bonomarlot, round 3). */
  about?: string;
  manufacturerDirections: { source?: DirectionsSource; line: string };
  compareIntro?: string;
  research: string;
  importantInformation: string;
  /** Show the shared "Dosage & Course Information" block (capsule/tablet products; never Prime). */
  dosageCourse: boolean;
  /** Page <title> when the H1-based title would exceed 60 characters (Revilab ML, Julia 2026-11-09). */
  seoTitle?: string;
  /** Meta description when "{Name}®: {snapshot}" would exceed 160 characters (Snapshot, shortened only by cutting its last clause). */
  metaDescription?: string;
  /** Streamlined layout (Bonomarlot, round 3): essentials visible, deeper reading collapsed. */
  streamlined?: StreamlinedPdp;
  /** Review flags for counsel/Julia. Never rendered. */
  flags?: string[];
}

export interface StreamlinedPdp {
  /** Small line under the active complex. */
  ingredientsNote: string;
  /**
   * Collapsible "Manufacturer's Labeled Directions" inside Dosage & Course Information.
   * Omitted (no expander) when no verifiable manufacturer source exists for the product.
   */
  labeledDirections?: { heading: string; attribution?: string; text: string; note?: string };
  /** "Safety & FAQs": merged Important Information + Safety + stop-use paragraphs, no repeats. */
  safety: string[];
  /** Default doctor questions left out on this page (exact text from DOCTOR_QUESTIONS). */
  omitDoctorQuestions: string[];
}

export const MANUFACTURER_DIRECTIONS_LINE =
  "Follow the instructions on the current product packaging for serving size and course duration. A manufacturer-defined course describes the recommended usage schedule, not a guaranteed timeline for results.";

export const BROCHURE_TITLE =
  "Reports on the results of clinical studies of peptide bioregulators of the CYTOMAX AND CYTOGEN class";

export function brochure(page: number, text: string): DirectionsSource {
  return {
    kind: "brochure",
    attribution: `As printed in the "Recommendations for use" section of the brochure "${BROCHURE_TITLE}" (p. ${page}):`,
    text,
    short: `(brochure, p. ${page})`,
    page,
  };
}

/** Directions printed on the package, shown as plain text (never linked, no outside source named). */
export function onPackage(text: string): DirectionsSource {
  return { kind: "package", attribution: PACKAGE_ATTRIBUTION, text, short: "" };
}

/** Directions confirmed by Julia for this product, stated plainly. */
export function confirmed(text: string): DirectionsSource {
  return { kind: "confirmed", attribution: "", text, short: "" };
}

export function manufacturer(text: string): DirectionsSource {
  return { kind: "manufacturer", attribution: "As listed by the manufacturer:", text, short: "" };
}

// ── Streamlined layout (round 3; Julia approved 2026-11-09) ─────────────────

export const INGREDIENTS_NOTE = "Full ingredient list and amounts available on the product label.";
export const LABELED_DIRECTIONS_HEADING = "Manufacturer's Labeled Directions";
export const DIRECTIONS_HEADING = "Directions";
export const PACKAGE_ATTRIBUTION = "As listed on the package:";
export const CONFER_DOCTOR_LINE = "Please confer with your doctor before use.";
export const STOP_USE_LINE =
  "If you have an allergic reaction, an adverse effect, or a concern, discontinue use and seek medical care.";
/** Default doctor questions left out on streamlined pages (exact DOCTOR_QUESTIONS text). */
export const OMIT_DOCTOR_QUESTIONS: readonly string[] = [
  "Should I take this preventively or restoratively?",
  "How long should one cycle be for me?",
];
/** Sentence of the product-facts safety paragraph already covered by the safety lead. */
const CONSULT_SENTENCE = "Consult a healthcare professional before use, especially if you take medications or have a medical condition.";

/** Safety lead (Julia's round-2 Bonomarlot wording, with the product's own name). */
export function safetyLead(name: string): string {
  return `${name} is not a medicine. Review the complete product label, including other ingredients and any warnings, and consult a qualified healthcare professional before use, especially if you take medications or have a medical condition.`;
}

/** Directions expander for any source kind (undefined when there is no source). */
export function labeledDirectionsFor(src: DirectionsSource | undefined): StreamlinedPdp["labeledDirections"] {
  if (!src) return undefined;
  if (src.kind === "brochure") return brochureLabeledDirections(src);
  if (src.kind === "package") return { heading: LABELED_DIRECTIONS_HEADING, attribution: PACKAGE_ATTRIBUTION, text: src.text };
  if (src.kind === "confirmed") return { heading: DIRECTIONS_HEADING, text: src.text, note: CONFER_DOCTOR_LINE };
  return undefined;
}

/** Labeled-directions expander from a brochure source: quoted exactly, with its page number. */
export function brochureLabeledDirections(src: DirectionsSource): StreamlinedPdp["labeledDirections"] {
  if (src.kind !== "brochure" || !src.page) throw new Error("brochureLabeledDirections needs a brochure source");
  return {
    heading: LABELED_DIRECTIONS_HEADING,
    attribution: `As printed in the Cytomax and Cytogen product brochure (p. ${src.page}):`,
    text: `"${src.text}"`,
  };
}

/**
 * Round-3 layout for one product: "About This Product" dropped, Important Information,
 * the product's own safety paragraph (shared/product-facts.json pdp.safety, minus the
 * consult sentence the lead already says) and the stop-use line merged into
 * "Safety & FAQs"; directions from the brochure, the package (Revilab ML) or Julia-confirmed text (Endoluten); else no expander.
 */
export function streamline(
  name: string,
  copy: FormulaPdpContent,
  productSafety: string | undefined,
): FormulaPdpContent {
  const lead = safetyLead(name);
  const own = (productSafety ?? "").replace(CONSULT_SENTENCE, "").replace(/\s{2,}/g, " ").trim();
  const src = copy.manufacturerDirections.source;
  return {
    ...copy,
    about: undefined,
    importantInformation: lead,
    streamlined: {
      ingredientsNote: INGREDIENTS_NOTE,
      ...(labeledDirectionsFor(src) ? { labeledDirections: labeledDirectionsFor(src) } : {}),
      safety: [lead, ...(own ? [own] : []), STOP_USE_LINE],
      omitDoctorQuestions: [...OMIT_DOCTOR_QUESTIONS],
    },
  };
}
