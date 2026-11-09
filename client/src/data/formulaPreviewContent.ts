/**
 * PROPOSAL copy for the Bonomarlot preview page (Julia's template, verbatim).
 * Only product ids in FORMULA_PREVIEW_PDP_IDS render this. Nothing here is live.
 */

export interface DirectionsSource {
  /** Plain-text attribution. No link: the brochure's distributor is a retail store. */
  attribution: string;
  /** Verbatim quote. */
  text: string;
  /** Short tag for the compare table. */
  short: string;
}

export interface FormulaPdpContent {
  title: string;
  subline: string;
  snapshot: string;
  ingredients: string[];
  /**
   * TODO(julia): amount per capsule. Only "Release form: 20 capsules or tablets containing
   * 10 mg of BONOMARLOT®" (brochure p. 7) exists; not verified against our label, so nothing
   * is rendered. Do not publish "Reportedly 10 mg per capsule".
   */
  amountPerCapsule?: string;
  biologicalFocus: { heading: string; body: string };
  about: string;
  manufacturerDirections: { source?: DirectionsSource; line: string };
  compareIntro?: string;
  research: string;
  importantInformation: string;
}

export const MANUFACTURER_DIRECTIONS_LINE =
  "Follow the instructions on the current product packaging for serving size and course duration. A manufacturer-defined course describes the recommended usage schedule, not a guaranteed timeline for results.";

/** Source: /workspace/sources/khavinson-brochure-dosing-notes.md, Bonomarlot "RECOMMENDATIONS FOR USE", p. 7. */
export const BONOMARLOT_BROCHURE_DIRECTIONS: DirectionsSource = {
  attribution:
    "As printed in the \"Recommendations for use\" section of the brochure \"Reports on the results of clinical studies of peptide bioregulators of the CYTOMAX AND CYTOGEN class\" (p. 7):",
  text: "Bonomarlot® instructions: 1-2 capsules or tablets 1-2 times a day with meals. The duration of administration is 30 days. It is advisable to repeat the course in 3-6 months.",
  short: "(brochure, p. 7)",
};

export const FORMULA_PDP_CONTENT: Record<string, FormulaPdpContent> = {
  bonomarlot: {
    title: "Bonomarlot® — A-20 Bone Marrow Peptide Complex",
    subline: "Khavinson Cytomax® | Focused Formula",
    snapshot:
      "A tissue-derived peptide bioregulator from the original Khavinson Cytomax collection, centered on the A-20 bone marrow peptide complex.",
    ingredients: [
      "Primary ingredient: A-20 bone marrow-derived peptide complex.",
      "Formulation type: Focused peptide complex.",
    ],
    biologicalFocus: {
      heading: "Bone marrow & hematopoietic system",
      body: "Bone marrow is responsible for producing red blood cells, white blood cells, and platelets, which are essential for oxygen transport, immune defense, and blood clotting. Bonomarlot's tissue association places it within the broader research context of hematopoiesis (blood cell formation) and cellular regulation. This association does not establish that taking the product increases blood cell production.",
    },
    about:
      "Bonomarlot contains A-20, a naturally derived peptide complex obtained from bone marrow tissue. It belongs to the Khavinson Cytomax collection, which consists of tissue-derived peptide complexes associated with specific organs and biological systems. Unlike multi-component formulations, Bonomarlot centers on one tissue-derived peptide complex rather than combining several peptide complexes with additional active ingredients.",
    manufacturerDirections: { source: BONOMARLOT_BROCHURE_DIRECTIONS, line: MANUFACTURER_DIRECTIONS_LINE },
    compareIntro:
      "Revilab ML 02 and Revilab SL 07 are related combination formulations containing bone marrow-associated peptide ingredients. Unlike Bonomarlot, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Khavinson peptide research has explored tissue-derived peptides and their potential involvement in cellular regulatory processes. Bonomarlot's research association centers on bone marrow and the hematopoietic system. However, laboratory findings and research involving related peptides do not necessarily establish clinical benefits for the finished product. Evidence establishing Bonomarlot's effectiveness and long-term safety in humans remains limited.",
    importantInformation:
      "Bonomarlot is not presented as a treatment for blood disorders, immune deficiencies, or other medical conditions. Review the complete product label and consult a qualified healthcare professional before use.",
  },
};

/** Shared "Dosage & Course Information" (capsule products; never Prime). Verbatim, 4 paragraphs. */
export const DOSAGE_COURSE_HEADING = "Dosage & Course Information";
export const DOSAGE_COURSE_PARAGRAPHS: readonly string[] = [
  "Manufacturer directions provide general serving and usage information, not personalized recommendations. Package size does not necessarily indicate a single course length.",
  "Appropriate use may depend on the specific formulation, individual health considerations, and the intended purpose of use. Published research and manufacturer materials may describe different usage schedules, but these should not be interpreted as instructions to change the labeled serving amount.",
  "We encourage customers to review the available research and consult a qualified healthcare professional before use, particularly when considering a serving amount or course duration different from the product label.",
  "Always refer to the current packaging for the manufacturer's directions. Do not exceed the labeled serving amount without guidance from a qualified healthcare professional.",
];

export const FDA_DISCLAIMER =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

/** FAQ entries hidden on the preview page because the new sections duplicate them. */
export const PREVIEW_REMOVED_FAQ: readonly string[] = ["What is Bonomarlot?", "How should I take it?"];
