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
  about: string;
  manufacturerDirections: { source?: DirectionsSource; line: string };
  compareIntro?: string;
  research: string;
  importantInformation: string;
  /** Show the shared "Dosage & Course Information" block (capsule/tablet products; never Prime). */
  dosageCourse: boolean;
  /** Review flags for counsel/Julia. Never rendered. */
  flags?: string[];
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
