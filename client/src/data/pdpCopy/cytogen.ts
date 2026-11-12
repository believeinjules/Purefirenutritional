/**
 * Khavinson Cytogen® product page copy (round 3). Written per product from
 * shared/product-facts.json (composition, pdp copy) and the brochure notes
 * (/workspace/sources/khavinson-brochure-dosing-notes.md, pp. 100–125). Brochure
 * directions are quoted exactly (dosing sentences only where the block also lists
 * disease uses). Layout and safety come from streamline() in ./shared.
 */
import { PRODUCT_FACTS } from "@shared/product-facts";
import { brochure, MANUFACTURER_DIRECTIONS_LINE as LINE, streamline, type FormulaPdpContent } from "./shared";

const SUBLINE = "Khavinson Cytogen® | Focused Formula";

const DRAFT: Record<string, FormulaPdpContent> = {
  cartalax: {
    title: "Cartalax® — AC-4 Cartilage Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytogen peptide bioregulator built on AC-4, a synthetic short-peptide complex modelled on peptides of cartilage tissue.",
    ingredients: ["Active complex: AC-4, a synthetic cartilage peptide complex (Ala-Glu-Asp / AED tripeptide)."],
    biologicalFocus: {
      heading: "Cartilage, joints & connective tissue",
      body: "Cartilage covers the ends of bones in the joints and cushions the spine, letting joints glide and absorbing shock. It has a limited blood supply and renews slowly, so it changes with wear and with age. Cartalax's tissue association places it within the broader research context of cartilage cells and connective-tissue renewal. This association does not establish that taking the product changes joint comfort, mobility or cartilage.",
    },
    manufacturerDirections: {
      source: brochure(107, "Adults are advised to take 1-2 capsules 1-2 times daily with meals. The duration of admission is 10-30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab ML 09 and Revilab SL 04 are related combination formulations containing cartilage-associated peptide ingredients. Unlike Cartalax, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Cartalax belongs to the Khavinson Cytogen family of short synthetic peptides developed at the St. Petersburg Institute of Bioregulation and Gerontology. Researchers have studied short peptides and cartilage cells in laboratory models, along with connective-tissue renewal and joint mobility with age; the research literature describes the AED tripeptide (Ala-Glu-Asp) in connection with this complex. Much of this work is cell and animal research published in Russian-language literature, and it does not necessarily establish clinical benefits for the finished product. Evidence establishing Cartalax's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      "Brochure p. 107 prints \"10- 30 days\" across a line break; quoted as \"10-30 days\". Matches the manufacturer's Russian text the page already shows (10–30 days, repeat after 4–6 months).",
    ],
  },

  crystagen: {
    title: "Crystagen® — AC-6 Thymus Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytogen peptide bioregulator containing AC-6, a synthetic short-peptide complex modelled on peptides of the thymus.",
    ingredients: ["Active complex: AC-6, a synthetic thymus peptide complex."],
    biologicalFocus: {
      heading: "Thymus & immune balance",
      body: "The thymus sits behind the breastbone and is where T cells, white blood cells that coordinate many immune responses, mature. The gland is largest in childhood and is gradually replaced by fatty tissue with age. Crystagen's thymus association places it within the broader research context of T-cell maturation and immune balance over a lifetime. This association does not establish that taking the product changes immune function or immune-cell counts.",
    },
    manufacturerDirections: {
      source: brochure(111, "Adults are advised to take 1-2 capsules 1-2 times daily with meals. The duration of admission is 10-30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Crystagen is one of the Khavinson Cytogen short synthetic peptides. Researchers have studied short thymus peptides and immune-cell activity in laboratory models, including the balance between different immune-cell populations and how immune regulation changes with age. These are mainly cell and animal studies, and they do not necessarily establish clinical benefits for the finished product. Evidence establishing Crystagen's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      "Brochure p. 111 prints \"10- 30 days\" across a line break; quoted as \"10-30 days\". Store usage before: \"1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.\"",
    ],
  },

  ovagen: {
    title: "Ovagen® — AC-3 Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytogen peptide bioregulator built on AC-3, a synthetic peptide complex the manufacturer associates with the liver and digestive tract.",
    ingredients: ["Active complex: AC-3, a synthetic peptide complex (leucine, glutamic acid, aspartic acid)."],
    biologicalFocus: {
      heading: "Liver & digestive tract",
      body: "The liver processes nutrients, makes the bile that helps digest fats, and clears substances the body no longer needs. It works alongside the stomach and intestines, which break food down and absorb nutrients. Ovagen's manufacturer association places it within the broader research context of liver cell activity and digestive function. This association does not establish that taking the product changes liver function, digestion or any test result.",
    },
    manufacturerDirections: {
      source: brochure(115, "OVAGEN® is recommended to be taken 10-15 minutes before meals, 1-2 tablets or capsules 2-3 times a day for 15-20 days. A second course could be repeated in 3 - 6 months."),
      line: LINE,
    },
    research:
      "Ovagen is a Khavinson Cytogen short synthetic peptide made from leucine, glutamic acid and aspartic acid. Its label names no source tissue; the manufacturer associates it with the liver and digestive tract, and research interest has centred on liver cells in laboratory models and metabolic pathways in liver tissue. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Ovagen's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      "Brochure p. 115 quoted as an excerpt (dosing sentences only; the same block lists disease uses, including cancer patients after radiation or chemotherapy, not reproduced). Store had no usage line in code; Firestore usage differs.",
    ],
  },

  pinealon: {
    title: "Pinealon® — AC-5 Brain Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytogen peptide bioregulator containing AC-5, a synthetic short-peptide complex based on peptides of the cerebral cortex.",
    ingredients: ["Active complex: AC-5, a synthetic brain peptide complex (arginine, glutamic acid, aspartic acid)."],
    biologicalFocus: {
      heading: "Brain & nervous system",
      body: "The cerebral cortex, the brain's outer layer, handles thinking, memory, language and attention, and its nerve cells are among the most energy-demanding in the body. They are also sensitive to oxidative stress and change with age. Pinealon's brain-peptide association places it within the broader research context of nerve-cell resilience and the ageing nervous system. This association does not establish that taking the product improves memory, focus or any other brain function.",
    },
    manufacturerDirections: {
      source: brochure(121, "PINEALON® is recommended to be taken 10-15 minutes before meals, 1-3 tablets or capsules 2-3 times a day for 10-20 days. It is desirable to repeat the course in 3 - 6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab ML 03 and Revilab SL 02 are related combination formulations containing brain-associated peptide ingredients. Unlike Pinealon, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Pinealon is a Khavinson Cytogen short synthetic peptide. The research literature describes it as the EDR tripeptide (Glu-Asp-Arg), although the label itself prints no sequence. Brain peptides have been studied in cell and animal work on nerve-cell resilience to oxidative stress. These findings do not necessarily establish clinical benefits for the finished product, and there are no published human trials of Pinealon as a finished product. Evidence establishing Pinealon's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      "Brochure p. 121 quoted as an excerpt (dosing sentences only; the same block lists disease uses, not reproduced). Printed \"PINEALON®is\" spacing fixed. Store had no usage line in code; Firestore usage differs.",
    ],
  },

  vesugen: {
    title: "Vesugen® — AC-2 Vascular Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytogen peptide bioregulator built on AC-2, a synthetic short-peptide complex modelled on peptides of the blood-vessel wall.",
    ingredients: ["Active complex: AC-2, a synthetic vascular peptide complex."],
    biologicalFocus: {
      heading: "Blood vessels & circulation",
      body: "Arteries, veins and capillaries form a network that carries blood to every tissue. The thin inner lining of each vessel helps set how widely it opens and how nutrients pass into the surrounding tissue, and vessel walls tend to lose flexibility with age. Vesugen's vascular association places it within the broader research context of vessel-wall cells and vascular tone. This association does not establish that taking the product changes blood pressure, circulation or vessel health.",
    },
    manufacturerDirections: {
      source: brochure(103, "Adults are recommended to take 1-2 capsules 1-2 times a day with meals. The duration of admission is 10-30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Vesugen is a Khavinson Cytogen short synthetic peptide modelled on peptides of the vessel wall. Researchers have studied short vascular peptides and vessel-wall cells in laboratory models, along with circulation and how blood vessels change with age. These laboratory findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Vesugen's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      "Store usage before: \"1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.\" Brochure p. 103: 10-30 days, repeat in 4-6 months.",
    ],
  },

  chonluten: {
    title: "Chonluten® — AC-7 Respiratory Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytogen peptide bioregulator containing AC-7, a synthetic short-peptide complex modelled on peptides of airway and lung tissue.",
    ingredients: ["Active complex: AC-7, a synthetic respiratory peptide complex (glycine, glutamic acid, aspartic acid)."],
    biologicalFocus: {
      heading: "Bronchi, lungs & airway lining",
      body: "The bronchi carry air into the lungs, where oxygen passes into the blood and carbon dioxide passes out. The airway lining meets dust, pollutants and changes in air temperature with every breath and relies on steady cell renewal. Chonluten's respiratory association places it within the broader research context of bronchial lining cells and how the airways respond to environmental stress. This association does not establish that taking the product changes breathing or lung function.",
    },
    manufacturerDirections: {
      source: brochure(125, "Adults are advised to take 1-2 capsules 1-2 times daily with meals. The duration of admission is 10-30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Chonluten is a Khavinson Cytogen short synthetic peptide. Researchers have studied short respiratory peptides and bronchial lining cells in laboratory models, including gene-expression signalling in respiratory tissue. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Chonluten's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: ["Store had no usage line in code; Firestore usage differs. Brochure p. 125 quoted."],
  },
};

export const CYTOGEN_COPY: Record<string, FormulaPdpContent> = Object.fromEntries(
  Object.entries(DRAFT).map(([id, c]) => [id, streamline(PRODUCT_FACTS[id]?.name ?? id, c, PRODUCT_FACTS[id]?.pdp?.safety)]),
);
