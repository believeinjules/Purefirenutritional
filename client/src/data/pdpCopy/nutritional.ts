/**
 * Nutritional supplement page copy (PROPOSAL, local only). Example: Zinsil-T only.
 * Adaptation: no "peptide complex" framing, no Formula type tag or subline type, no
 * Compare section (no peptide pairs). Nutrient background is general and kept minimal.
 */
import { manufacturer, MANUFACTURER_DIRECTIONS_LINE as LINE, type FormulaPdpContent } from "./shared";

export const NUTRITIONAL_COPY: Record<string, FormulaPdpContent> = {
  "zinsil-t": {
    title: "Zinsil-T — Glycine, Zinc and Vitamin B6 Chewable Tablets",
    subline: "Nutritional Supplement | Chewable tablet",
    snapshot: "A chewable tablet that combines the amino acid glycine with zinc and vitamin B6, with the amount of each ingredient listed.",
    ingredients: [
      "Listed ingredients: glycine (500 mg); zinc (8.6 mg); pyridoxine / vitamin B6 (1.5 mg).",
      "Formulation type: Chewable tablet.",
    ],
    biologicalFocus: {
      heading: "Zinc, glycine & vitamin B6",
      body: "Zinc is an essential trace mineral that the body uses in many enzymes, including enzymes involved in immune function. Vitamin B6 takes part in protein and amino-acid metabolism, and glycine is an amino acid that also acts as a signalling molecule in the nervous system. This nutrient profile places Zinsil-T within the broader context of immune function, mood and normal metabolism. This association does not establish that taking the product improves immunity, mood or sleep.",
    },
    about:
      "Zinsil-T is a chewable tablet with three listed ingredients: glycine, zinc and pyridoxine (vitamin B6). It contains no peptide complexes. The manufacturer's directions describe chewing the tablets during meals.",
    manufacturerDirections: {
      source: manufacturer("Take 1 tablet 2 times daily, chewing during meals. Duration: 1 month. May be repeated as needed."),
      line: LINE,
    },
    research:
      "Zinc, glycine and vitamin B6 are each widely studied nutrients, but research on individual nutrients does not necessarily establish benefits for this particular combination or tablet. Evidence establishing Zinsil-T's effectiveness and long-term safety in humans remains limited.",
    importantInformation:
      "Zinsil-T is not presented as a treatment for zinc deficiency, sleep disorders, anxiety, depression or other medical conditions. If you already take a zinc or multivitamin supplement, check your total intake with a qualified healthcare professional. Review the complete product label and consult a qualified healthcare professional before use.",
    dosageCourse: true,
    flags: [
      "Amounts come from product-facts.json composition (\"Glycine (500mg)\" etc.); the basis (per tablet) should be confirmed against the label before publishing.",
      "Biological Focus uses general nutrient background (zinc in enzymes, B6 in amino-acid metabolism, glycine as a neurotransmitter), not product research. Counsel to confirm.",
      "Dosage & Course Information shown on a tablet product (the brief described it for capsule products). Julia to confirm.",
    ],
  },
};
