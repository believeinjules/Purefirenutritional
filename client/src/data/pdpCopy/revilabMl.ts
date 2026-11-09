/** Revilab ML product page copy (PROPOSAL, local only). Example: Revilab ML 02 only, pending Julia's review. */
import { manufacturer, MANUFACTURER_DIRECTIONS_LINE as LINE, type FormulaPdpContent } from "./shared";

export const REVILAB_ML_COPY: Record<string, FormulaPdpContent> = {
  "revilab-ml-02": {
    title: "Revilab ML 02 — Immune, Bone Marrow and Liver Peptide Complexes with Omega-3 and Vitamins",
    subline: "Revilab ML | Combination Formula",
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines four peptide complexes (two immune, one bone marrow and one liver) with omega-3 fatty acids and vitamins E, B6 and B9.",
    ingredients: [
      "Peptide complexes: T-link immune peptide complex (AA-2); B-link immune peptide complex (AA-3); bone marrow peptide complex (AA-4); liver peptide complex (AA-10).",
      "Other listed ingredients: omega-3 polyunsaturated fatty acids; vitamins E, B6, B9.",
      "Formulation type: Combination formula (peptide complexes with nutrients).",
    ],
    biologicalFocus: {
      heading: "Bone marrow, immune & liver tissues",
      body: "Revilab ML 02 lists peptide complexes associated with three tissues: two immune complexes (\"T-link\" and \"B-link\"), a bone marrow complex and a liver complex. Bone marrow produces blood cells, the immune system defends the body, and the liver processes nutrients and clears substances the body no longer needs. These associations place the formula within the broader research context of blood cell formation, immune regulation and liver metabolism. This association does not establish that taking the product increases blood cell production, strengthens immunity or changes liver function.",
    },
    about:
      "Revilab ML 02 is a capsule formula from the Revilab ML line. It combines four peptide complexes, coded AA-2, AA-3, AA-4 and AA-10, with omega-3 polyunsaturated fatty acids and vitamins E, B6 and B9 in a single formulation. A Focused Formula centers on one tissue-derived peptide complex; Revilab ML 02 brings several ingredients together in one product.",
    manufacturerDirections: {
      source: manufacturer("Adults: 1 capsule once a day with meals. Course duration: 4–6 weeks; the course can be repeated within a year if needed."),
      line: LINE,
    },
    compareIntro:
      "Bonomarlot and Svetinorm are related focused formulations. Bonomarlot contains a bone marrow peptide complex and Svetinorm a liver peptide complex, and complexes with the same names are listed in Revilab ML 02. Unlike Revilab ML 02, each of them centers on a single tissue-derived peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes listed in Revilab ML 02 are associated with bone marrow, immune and liver tissues, and its other ingredients are omega-3 fatty acids and vitamins. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 02's effectiveness and long-term safety in humans remains limited.",
    importantInformation:
      "Revilab ML 02 is not presented as a treatment for anemia, blood disorders, immune deficiencies, liver disease or other medical conditions. Review the complete product label and consult a qualified healthcare professional before use, particularly if you are receiving medical care for any condition.",
    dosageCourse: true,
    flags: [
      "No product-specific research text exists in the sources, so the Research section only describes the listed ingredients and states limitations.",
      "Existing overview says ML 02 contains \"plant extracts\"; its composition lists none. Not repeated; existing text to be corrected.",
      "Per-ingredient amounts not listed in any source (formulation note: 30 caps × 0.3 g).",
    ],
  },
};
