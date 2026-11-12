/**
 * Revilab ML product page copy (round 3). Written per product from the composition in
 * shared/product-facts.json. Directions: the package text from product-facts.json
 * storefrontUsage (same for ML 01–09 on main), shown as "As listed on the package:" in
 * plain text, never linked and with no outside source named (Julia, 2026-11-09).
 */
import { PRODUCT_FACTS } from "@shared/product-facts";
import { MANUFACTURER_DIRECTIONS_LINE as LINE, onPackage, streamline, type FormulaPdpContent } from "./shared";

const SUBLINE = "Revilab ML | Combination Formula";
const NO_SOURCE = "Directions shown as \"As listed on the package:\" (Julia, 2026-11-09).";

const DRAFT: Record<string, FormulaPdpContent> = {
  "revilab-ml-01": {
    title: "Revilab ML 01 — Epiphysis, Immune and Liver Peptide Complexes with Resveratrol, Omega-3 and Vitamins",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that pairs epiphysis, B-link immune and liver peptide complexes with resveratrol, choline, omega-3 and vitamins E, A and C.",
    ingredients: [
      "Peptide complexes: epiphysis peptide complex (AA-1); B-link immune peptide complex (AA-3); liver peptide complex (AA-10).",
      "Other listed ingredients: resveratrol; choline bitartrate; omega-3 polyunsaturated fatty acids; vitamins E, A, C.",
    ],
    biologicalFocus: {
      heading: "Epiphysis, immune & liver tissues",
      body: "Revilab ML 01 lists peptide complexes associated with three tissues. The epiphysis (pineal gland) helps time the body's daily rhythms, B cells are the immune cells that make antibodies, and the liver processes nutrients and clears substances the body no longer needs. Resveratrol and vitamins E, A and C are antioxidant nutrients. These associations place the formula within the broader research context of daily rhythms, immune regulation and liver metabolism. This association does not establish that taking the product changes sleep, immunity, liver function or ageing.",
    },
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Svetinorm is a related focused formulation containing a liver peptide complex, and a complex with the same name is listed in Revilab ML 01. Unlike Revilab ML 01, Svetinorm centers on a single tissue-derived peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes in Revilab ML 01 are associated with the epiphysis, the B-cell arm of the immune system and the liver, and its other ingredients are resveratrol, choline, omega-3 fatty acids and vitamins. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 01's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [NO_SOURCE, "The manufacturer's Russian page composition also lists griffonia extract and lactose; product-facts.json composition does not. Not added here."],
  },

  "revilab-ml-02": {
    title: "Revilab ML 02 — Immune, Bone Marrow and Liver Peptide Complexes with Omega-3 and Vitamins",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines four peptide complexes (two immune, one bone marrow and one liver) with omega-3 fatty acids and vitamins E, B6 and B9.",
    ingredients: [
      "Peptide complexes: T-link immune peptide complex (AA-2); B-link immune peptide complex (AA-3); bone marrow peptide complex (AA-4); liver peptide complex (AA-10).",
      "Other listed ingredients: omega-3 polyunsaturated fatty acids; vitamins E, B6, B9.",
    ],
    biologicalFocus: {
      heading: "Bone marrow, immune & liver tissues",
      body: "Revilab ML 02 lists peptide complexes associated with three tissues: two immune complexes (\"T-link\" and \"B-link\"), a bone marrow complex and a liver complex. Bone marrow produces blood cells, the immune system defends the body, and the liver processes nutrients and clears substances the body no longer needs. These associations place the formula within the broader research context of blood cell formation, immune regulation and liver metabolism. This association does not establish that taking the product increases blood cell production, strengthens immunity or changes liver function.",
    },
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Bonomarlot and Svetinorm are related focused formulations. Bonomarlot contains a bone marrow peptide complex and Svetinorm a liver peptide complex, and complexes with the same names are listed in Revilab ML 02. Unlike Revilab ML 02, each of them centers on a single tissue-derived peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes listed in Revilab ML 02 are associated with bone marrow, immune and liver tissues, and its other ingredients are omega-3 fatty acids and vitamins. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 02's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      NO_SOURCE,
      "Existing overview says ML 02 contains \"plant extracts\"; its composition lists none. Not repeated.",
      "Per-ingredient amounts not listed in any source (formulation note: 30 caps × 0.3 g).",
    ],
  },

  "revilab-ml-03": {
    title: "Revilab ML 03 — Brain, Retina and Vascular Wall Peptide Complexes with Astaxanthin, Marigold Extract and B Vitamins",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines brain, retina and vascular wall peptide complexes with astaxanthin, marigold extract, choline, omega-3 and B vitamins.",
    ingredients: [
      "Peptide complexes: brain peptide complex (AA-5); retina peptide complex (AA-6); vascular wall peptide complex (AA-7).",
      "Other listed ingredients: astaxanthin; choline bitartrate; omega-3 polyunsaturated fatty acids; vitamins B1, B2, B6; marigold extract (lutein, zeaxanthin).",
    ],
    biologicalFocus: {
      heading: "Brain, retina & the vessels that supply them",
      body: "Revilab ML 03 lists peptide complexes associated with the brain, the retina (the light-sensitive layer at the back of the eye) and the vessel wall. The retina is an extension of the brain, and both depend on a dense network of small blood vessels. Lutein and zeaxanthin from marigold are pigments found naturally in the retina, and B vitamins take part in nerve-cell energy metabolism. These associations place the formula within the broader research context of the nervous system and visual tissue. This association does not establish that taking the product improves memory, eyesight or circulation.",
    },
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Cerluten and Pinealon are related focused formulations, each containing a brain peptide complex, and a complex with the same name is listed in Revilab ML 03. Unlike Revilab ML 03, each of them centers on a single peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes in Revilab ML 03 are associated with brain, retinal and vascular tissue, and its other ingredients are carotenoids (astaxanthin, lutein and zeaxanthin), choline, omega-3 fatty acids and B vitamins. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 03's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [NO_SOURCE],
  },

  "revilab-ml-04": {
    title: "Revilab ML 04 — Epiphysis, Vascular Wall and Heart Muscle Peptide Complexes with Resveratrol, Rutin and Omega-3",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines epiphysis, vascular wall and heart muscle peptide complexes with resveratrol, rutin, omega-3 and niacin.",
    ingredients: [
      "Peptide complexes: epiphysis peptide complex (AA-1); vascular wall peptide complex (AA-7); heart muscle peptide complex (AA-8).",
      "Other listed ingredients: resveratrol; rutin; omega-3 polyunsaturated fatty acids; vitamin PP (niacin).",
    ],
    biologicalFocus: {
      heading: "Heart muscle & blood vessels",
      body: "Revilab ML 04 lists peptide complexes associated with the heart muscle, the vessel wall and the epiphysis (pineal gland). The heart pumps blood through a network of vessels whose walls need to stay flexible, and the pineal gland helps time the body's daily rhythms. Resveratrol and rutin are plant polyphenols, and niacin is a B vitamin used in energy metabolism. These associations place the formula within the broader research context of cardiovascular function. This association does not establish that taking the product changes heart function, blood pressure or circulation.",
    },
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Chelohart is a related focused formulation containing a heart muscle peptide complex, and a complex with the same name is listed in Revilab ML 04. Unlike Revilab ML 04, Chelohart centers on a single tissue-derived peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes in Revilab ML 04 are associated with heart muscle, vascular and pineal tissue, and its other ingredients are resveratrol, rutin, omega-3 fatty acids and niacin. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 04's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [NO_SOURCE, "The manufacturer's Russian page prints the heart muscle complex as \"AA-6\"; product-facts.json and the peptideproduct.com formulation note say AA-8. AA-8 kept."],
  },

  "revilab-ml-05": {
    title: "Revilab ML 05 — Immune, Bronchi and Lung/Stomach Wall Peptide Complexes with Omega-3, Vitamins and Licorice",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines T-link immune, bronchi and lungs-and-stomach-wall peptide complexes with omega-3, vitamins E and A and licorice root extract.",
    ingredients: [
      "Peptide complexes: T-link immune peptide complex (AA-2); bronchi peptide complex (AA-14); lungs and stomach wall peptide complex (AA-15).",
      "Other listed ingredients: omega-3 polyunsaturated fatty acids; vitamins E, A; licorice root extract.",
    ],
    biologicalFocus: {
      heading: "Airways, lungs & local immunity",
      body: "Revilab ML 05 lists peptide complexes associated with the bronchi, the lungs and stomach wall, and T cells, the immune cells that patrol tissues such as the airway lining. The bronchi carry air into the lungs, and their lining traps and clears inhaled particles. Vitamin A helps maintain the lining tissues of the body. These associations place the formula within the broader research context of the respiratory lining and its immune defences. This association does not establish that taking the product changes breathing, lung function or immunity.",
    },
    manufacturerDirections: { line: LINE },
    research:
      "The peptide complexes in Revilab ML 05 are associated with bronchial, lung and stomach-wall tissue and with T cells, and its other ingredients are omega-3 fatty acids, vitamins E and A and licorice root extract. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 05's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [NO_SOURCE],
  },

  "revilab-ml-06": {
    title: "Revilab ML 06 — Liver, Pancreas and Stomach Wall Peptide Complexes with Omega-3 and Plant Extracts",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines liver, pancreas and lungs-and-stomach-wall peptide complexes with omega-3 and licorice, artichoke, plantain and strawberry leaf extracts.",
    ingredients: [
      "Peptide complexes: liver peptide complex (AA-10); pancreas peptide complex (AA-11); lungs and stomach wall peptide complex (AA-15).",
      "Other listed ingredients: omega-3 polyunsaturated fatty acids; licorice root extract; artichoke fruit extract; plantain leaves extract; strawberry leaves extract.",
    ],
    biologicalFocus: {
      heading: "Liver, pancreas & stomach",
      body: "Revilab ML 06 lists peptide complexes associated with the liver, the pancreas and the stomach wall, three organs that work together in digestion. The stomach starts breaking food down, the pancreas releases digestive enzymes and hormones such as insulin, and the liver makes bile and processes absorbed nutrients. Its plant extracts are licorice root, artichoke fruit, plantain leaves and strawberry leaves. These associations place the formula within the broader research context of digestion and metabolism. This association does not establish that taking the product changes digestion, liver function or blood sugar.",
    },
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Svetinorm and Suprefort are related focused formulations. Svetinorm contains a liver peptide complex and Suprefort a pancreas peptide complex, and complexes with the same names are listed in Revilab ML 06. Unlike Revilab ML 06, each of them centers on a single tissue-derived peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes in Revilab ML 06 are associated with liver, pancreatic and stomach-wall tissue, and its other ingredients are omega-3 fatty acids and four plant extracts. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 06's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [NO_SOURCE],
  },

  "revilab-ml-07": {
    title: "Revilab ML 07 — Epiphysis, Vascular Wall, Testes and Bladder Peptide Complexes with L-Carnitine and Zinc",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule for men from the Revilab ML line that combines epiphysis, vascular wall, testes and bladder peptide complexes with omega-3, L-carnitine and zinc citrate.",
    ingredients: [
      "Peptide complexes: epiphysis peptide complex (AA-1); vascular wall peptide complex (AA-7); testes peptide complex (AA-12); bladder peptide complex (AA-13).",
      "Other listed ingredients: omega-3 polyunsaturated fatty acids; L-carnitine; zinc citrate.",
    ],
    biologicalFocus: {
      heading: "Male reproductive & urinary systems",
      body: "Revilab ML 07 lists peptide complexes associated with the testes, the bladder, the vessel wall and the epiphysis (pineal gland). The testes produce sperm and testosterone, the bladder stores urine, and both depend on a healthy blood supply, while the pineal gland helps time hormonal rhythms. Zinc is a trace mineral used by many enzymes, including in reproductive tissue, and L-carnitine takes part in cellular energy metabolism. These associations place the formula within the broader research context of male reproductive and urinary function. This association does not establish that taking the product changes testosterone, fertility, sexual or urinary function.",
    },
    manufacturerDirections: { line: LINE },
    research:
      "The peptide complexes in Revilab ML 07 are associated with testicular, bladder, vascular and pineal tissue, and its other ingredients are omega-3 fatty acids, L-carnitine and zinc citrate. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 07's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      NO_SOURCE,
      "Ingredients now listed from product-facts.json composition (the old page said \"See the full ingredient list on your package.\"). FLAGGED_PAIRS still treats ML 07 as not showing its composition, so no new compare pairs were added (Chitomur/Testoluten pairs stay off pending Julia).",
    ],
  },

  "revilab-ml-08": {
    title: "Revilab ML 08 — Epiphysis, Vascular Wall, Cartilage and Bladder Peptide Complexes with Resveratrol and Arginine",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule for women from the Revilab ML line that combines epiphysis, vascular wall, cartilage and bladder peptide complexes with omega-3, resveratrol and arginine.",
    ingredients: [
      "Peptide complexes: epiphysis peptide complex (AA-1); vascular wall peptide complex (AA-7); cartilage peptide complex (AA-9); bladder peptide complex (AA-13).",
      "Other listed ingredients: omega-3 polyunsaturated fatty acids; resveratrol; arginine.",
    ],
    biologicalFocus: {
      heading: "Hormonal rhythms, bone & cartilage, urinary system",
      body: "Revilab ML 08 lists peptide complexes associated with the epiphysis (pineal gland), the vessel wall, cartilage and the bladder. The pineal gland helps time the body's hormonal rhythms, cartilage cushions the joints, and the bladder wall stretches and contracts as it stores and releases urine. Arginine is an amino acid the body uses to make nitric oxide, a signal involved in blood-vessel tone, and resveratrol is a plant polyphenol. These associations place the formula within the broader research context of women's hormonal balance, joints and urinary function. This association does not establish that taking the product changes hormone levels, joint comfort or urinary function.",
    },
    manufacturerDirections: { line: LINE },
    research:
      "The peptide complexes in Revilab ML 08 are associated with pineal, vascular, cartilage and bladder tissue, and its other ingredients are omega-3 fatty acids, resveratrol and arginine. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 08's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [
      NO_SOURCE,
      "Ingredients now listed from product-facts.json composition (old page: \"See the full ingredient list on your package.\"). FLAGGED_PAIRS unchanged, so no Cartalax/Chitomur compare pairs were added.",
    ],
  },

  "revilab-ml-09": {
    title: "Revilab ML 09 — Immune, Vascular Wall and Cartilage Peptide Complexes with Chondroitin and Antioxidant Enzymes",
    subline: SUBLINE,
    snapshot:
      "A multi-ingredient capsule from the Revilab ML line that combines B-link immune, vascular wall and cartilage peptide complexes with chondroitin sulfate, omega-3, SOD, catalase and carnosine.",
    ingredients: [
      "Peptide complexes: B-link immune peptide complex (AA-3); vascular wall peptide complex (AA-7); cartilage peptide complex (AA-9).",
      "Other listed ingredients: chondroitin sulfate; omega-3 polyunsaturated fatty acids; superoxide dismutase (SOD); catalase; carnosine.",
    ],
    biologicalFocus: {
      heading: "Joints, cartilage & connective tissue",
      body: "Revilab ML 09 lists peptide complexes associated with cartilage, the vessel wall and B cells, the antibody-producing immune cells. Cartilage cushions the joints and has almost no blood supply of its own, so it relies on nearby vessels and joint fluid for nutrients. Chondroitin sulfate is a natural building block of cartilage, and SOD and catalase are enzymes the body uses to break down reactive oxygen species. These associations place the formula within the broader research context of joints and connective tissue. This association does not establish that taking the product changes joint comfort, mobility or cartilage.",
    },
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Cartalax is a related focused formulation containing a cartilage peptide complex, and a complex with the same name is listed in Revilab ML 09. Unlike Revilab ML 09, Cartalax centers on a single peptide complex. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The peptide complexes in Revilab ML 09 are associated with cartilage, vascular tissue and B cells, and its other ingredients are chondroitin sulfate, omega-3 fatty acids, the antioxidant enzymes SOD and catalase, and carnosine. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing Revilab ML 09's effectiveness and long-term safety in humans remains limited.",
    importantInformation: "",
    dosageCourse: true,
    flags: [NO_SOURCE],
  },
};

/**
 * Meta description: "{Name}: {snapshot}", shortened only by cutting the snapshot's last
 * clause (from " with ") when the whole would exceed 160 characters.
 */
function snapshotMeta(name: string, snapshot: string): string | undefined {
  const full = `${name}: ${snapshot.replace(/^A /, "a ")}`;
  if (full.length <= 160) return undefined;
  const cut = `${full.slice(0, full.lastIndexOf(" with "))}.`;
  if (cut.length > 160) throw new Error(`meta too long for ${name}`);
  return cut;
}

/** Page <title>s under 60 characters (Julia, 2026-11-09); the H1 keeps the full descriptive title. */
export const REVILAB_ML_SEO_TITLES: Record<string, string> = {
  "revilab-ml-01": "Revilab ML 01 — Pineal, Immune & Liver Peptides | Pure Fire",
  "revilab-ml-02": "Revilab ML 02 — Immune, Marrow & Liver Peptides | Pure Fire",
  "revilab-ml-03": "Revilab ML 03 — Brain, Retina & Vessel Peptides | Pure Fire",
  "revilab-ml-04": "Revilab ML 04 — Heart, Vessel & Pineal Peptides | Pure Fire",
  "revilab-ml-05": "Revilab ML 05 — Immune, Bronchi & Lung Peptides | Pure Fire",
  "revilab-ml-06": "Revilab ML 06 — Liver, Pancreas & Stomach Blend | Pure Fire",
  "revilab-ml-07": "Revilab ML 07 — Men's Multi-Peptide Complex | Pure Fire",
  "revilab-ml-08": "Revilab ML 08 — Women's Multi-Peptide Complex | Pure Fire",
  "revilab-ml-09": "Revilab ML 09 — Cartilage & Vessel Peptides | Pure Fire",
};

export const REVILAB_ML_COPY: Record<string, FormulaPdpContent> = Object.fromEntries(
  Object.entries(DRAFT).map(([id, c]) => {
    const name = PRODUCT_FACTS[id]?.name ?? id;
    const metaDescription = snapshotMeta(name, c.snapshot);
    const usage = PRODUCT_FACTS[id]?.storefrontUsage.text;
    if (!usage) throw new Error(`no package directions for ${id}`);
    const withDirections: FormulaPdpContent = { ...c, seoTitle: REVILAB_ML_SEO_TITLES[id], manufacturerDirections: { ...c.manufacturerDirections, source: onPackage(usage) } };
    return [id, streamline(name, metaDescription ? { ...withDirections, metaDescription } : withDirections, PRODUCT_FACTS[id]?.pdp?.safety)];
  }),
);
