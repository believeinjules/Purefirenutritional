/**
 * Shared types and helpers for the rolled-out product page copy (PROPOSAL, local only).
 * Copy files per line live next to this file. Every fact must come from
 * shared/product-facts.json, client/src/data/*, the brochure notes
 * (/workspace/sources/khavinson-brochure-dosing-notes.md) or existing page copy.
 */

export type DirectionsKind = "manufacturer" | "brochure";

export interface DirectionsSource {
  kind: DirectionsKind;
  /** Plain-text attribution. Never a link (the brochure's distributor is a retail store). */
  attribution: string;
  /** Quoted directions. Brochure text: line-break hyphens joined, otherwise as printed. */
  text: string;
  /** Short tag for the compare table. */
  short: string;
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
  /** Collapsible "Manufacturer's Labeled Directions" inside Dosage & Course Information. */
  labeledDirections: { heading: string; attribution: string; text: string };
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
  };
}

export function manufacturer(text: string): DirectionsSource {
  return { kind: "manufacturer", attribution: "As listed by the manufacturer:", text, short: "" };
}
