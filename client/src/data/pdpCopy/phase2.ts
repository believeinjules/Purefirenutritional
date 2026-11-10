/**
 * Phase 2 (local only, Julia 2026-11-09 8:29 PM): the ChatGPT content template on the remaining
 * visible non-Prime products, with each product's real form. Sublingual drops are drops,
 * cosmetics are cosmetics (no dosage framing), tablets are tablets.
 *
 * Facts come only from shared/product-facts.json (composition, verified manufacturer
 * directions, safety) and the catalog (client/src/data/products.ts description/seriesInfo).
 * Nothing is invented: no size unless the data lists it (Revilab SL: "Each 10 ml bottle"),
 * no amounts unless the verified composition lists them (Zinsil-T), no directions unless
 * product-facts marks them "verified" (manufacturer source). Gaps are in PHASE2_GAPS.
 */
import { PRODUCT_FACTS } from "@shared/product-facts";
import {
  MANUFACTURER_DIRECTIONS_LINE as LINE,
  manufacturer,
  streamline,
  type FormulaPdpContent,
} from "./shared";

type Form = "drops" | "capsules" | "tablets" | "chewable tablets" | "liquid" | "truffles" | "shake" | "cosmetic" | "unknown";

interface Draft {
  form: Form;
  subline: string;
  /** Plain-text size, only when the data lists it. */
  size?: string;
  snapshot: string;
  /** Visible active line(s); empty = only the "available on the product label" note. */
  ingredients: string[];
  /** Full label information (composition / catalog list), shown at the end of Safety & FAQs. */
  labelLines: string[];
  focusHeading: string;
  /** First Biological Focus sentence; the second is added below. */
  focus: string;
  /** What the research paragraph says the product contains. */
  contains: string;
  /** "Dosage & Course Information" off (cosmetics; unclear form). */
  noDosage?: boolean;
}

/** Lower-case the first letter unless it starts an abbreviation ("T-cell", "B-cell"). */
const lowerFirst = (t: string) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

const SL_OTHER = ["Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"];
const SL_SIZE = "10 mL bottle (drops)";
const SL_SUB = "Revilab SL · Combination Formula";

function sl(complexes: string[], extra: string[], focusHeading: string, focus: string, who = ""): Draft {
  const listed = complexes.map(lowerFirst).join("; ");
  const tissues = complexes.map((c) => lowerFirst(c.replace(/ peptide complex.*$/, "")));
  const tissueText = tissues.length > 1 ? `${tissues.slice(0, -1).join(", ")} and ${tissues[tissues.length - 1]}` : tissues[0];
  return {
    form: "drops",
    subline: SL_SUB,
    size: SL_SIZE,
    snapshot: `Revilab SL drops${who} taken under the tongue, combining ${tissueText} peptide complexes with ${extra.length ? `${extra.join(", ")}, ` : ""}plant extracts, essential oils and dihydroquercetin.`,
    ingredients: [`Peptide complexes: ${listed}.`],
    labelLines: [...complexes, ...extra.map((e) => e), ...SL_OTHER],
    focusHeading,
    focus,
    contains: `peptide complexes associated with ${tissueText} tissue${extra.length ? `, ${extra.join(" and ")}` : ""}, licorice, propolis and mint extracts, chamomile and clove oils and dihydroquercetin`,
  };
}

const NS = "Nutritional Supplement";
const AA = "Anti-Aging & Longevity";

const DRAFTS: Record<string, Draft> = {
  "revilab-sl-01": sl(["Vascular wall peptide complex (AA-7)", "Cardiac muscle peptide complex (AA-8)"], [], "Heart & blood vessels",
    "The heart muscle pumps blood through vessels whose walls need to stay flexible."),
  "revilab-sl-02": sl(["Brain peptide complex (AA-5)", "Retina peptide complex (AA-6)", "Vascular wall peptide complex (AA-7)"], [], "Brain, retina & blood vessels",
    "The retina is an extension of the brain, and both depend on a dense network of small blood vessels."),
  "revilab-sl-03": sl(["Pineal gland peptide complex (AA-1)", "T-cell immune peptide complex (AA-2)", "B-cell immune peptide complex (AA-3)"], [], "Pineal gland & immune balance",
    "The pineal gland helps time daily rhythms, while T cells coordinate immune responses and B cells make antibodies."),
  "revilab-sl-04": sl(["B-cell immune peptide complex (AA-3)", "Cartilage peptide complex (AA-9)", "Muscle peptide complex (AA-17)"], [], "Joints, muscles & cartilage",
    "Cartilage cushions the joints, skeletal muscles move the body, and B cells are the antibody-producing immune cells."),
  "revilab-sl-05": sl(["Liver peptide complex (AA-10)", "Pancreas peptide complex (AA-11)", "Lungs and stomach wall peptide complex (AA-15)"], [], "Liver, pancreas & stomach",
    "The stomach, pancreas and liver work together in digestion, from breaking food down to processing absorbed nutrients."),
  "revilab-sl-06": sl(["B-cell immune peptide complex (AA-3)", "Bronchi peptide complex (AA-14)", "Lungs and stomach wall peptide complex (AA-15)"], [], "Airways, lungs & local immunity",
    "The bronchi carry air into the lungs, and B cells help defend tissues such as the airway lining."),
  "revilab-sl-07": sl(["B-cell immune peptide complex (AA-3)", "Bone marrow peptide complex (AA-4)", "Vascular wall peptide complex (AA-7)"], ["Folic acid (calcium L-methylfolate)", "Vitamin B12 (cobalamin)"], "Bone marrow, blood & immune cells",
    "Bone marrow produces blood cells, and folate and vitamin B12 contribute to normal red blood cell formation."),
  "revilab-sl-08": sl(["T-cell immune peptide complex (AA-2)", "Vascular wall peptide complex (AA-7)", "Bladder peptide complex (AA-13)"], [], "Bladder & urinary tract",
    "The bladder stores and releases urine, and its wall depends on a healthy blood supply."),
  "revilab-sl-09": sl(["Pineal gland peptide complex (AA-1)", "Testes peptide complex (AA-12)", "Bladder peptide complex (AA-13)", "Prostate peptide complex (AA-16)"], [], "Male reproductive & urinary systems",
    "The testes produce sperm and testosterone, the prostate contributes to seminal fluid, and the pineal gland helps time hormonal rhythms.", " for men"),
  "revilab-sl-10": sl(["Pineal gland peptide complex (AA-1)", "Vascular wall peptide complex (AA-7)", "Bladder peptide complex (AA-13)"], [], "Hormonal rhythms, blood vessels & bladder",
    "The pineal gland helps time hormonal rhythms, blood vessels supply every tissue, and the bladder stores and releases urine.", " for women"),

  "revilab-pro-elements": {
    form: "unknown", subline: `Revilab · ${AA}`,
    snapshot: "A Revilab complex of glycine, calcium, magnesium and zinc citrates, vitamins A, E, D3 and B6, and chromium picolinate.",
    ingredients: ["Listed ingredients: glycine; calcium citrate; magnesium citrate; zinc citrate; vitamins A, E, D3, B6; chromium picolinate."],
    labelLines: ["Glycine", "Calcium citrate", "Magnesium citrate", "Zinc citrate", "Vitamins A, E, D3, B6", "Chromium picolinate"],
    focusHeading: "Minerals & everyday nutrition",
    focus: "Calcium, magnesium and zinc are minerals the body uses for bones, muscles, nerves and many enzymes.",
    contains: "glycine, mineral citrates, vitamins A, E, D3 and B6 and chromium picolinate",
  },
  "revilab-anti-age": {
    form: "capsules", subline: "Revilab · Capsules",
    snapshot: "A Revilab capsule formula built around carnosine, astaxanthin and alpha-lipoic acid, with rosemary extract and taurine.",
    ingredients: ["Listed ingredients: carnosine (beta-alanyl-L-histidine); astaxanthin; alpha-lipoic acid (vitamin N); rosemary extract; taurine."],
    labelLines: ["Carnosine (beta-alanyl-L-histidine)", "Astaxanthin", "Alpha-lipoic acid (vitamin N)", "Rosemary extract", "Taurine"],
    focusHeading: "Proteins & antioxidant defences",
    focus: "Over time, sugars can bind to proteins such as collagen in a process called glycation, and the body uses antioxidants to manage oxidative stress.",
    contains: "carnosine, astaxanthin, alpha-lipoic acid, rosemary extract and taurine",
  },
  "mesotel": {
    form: "unknown", subline: `Mesotel · ${AA}`,
    snapshot: "A choline-based formula from the Mesotel family, focused on the brain, the liver and the cardiovascular system.",
    ingredients: ["Based on choline."],
    labelLines: [],
    focusHeading: "Brain, liver & heart",
    focus: "Choline is a nutrient the body uses to build cell membranes and the messenger acetylcholine.",
    contains: "choline",
  },
  "mesotel-neo": {
    form: "liquid", subline: `Mesotel · Liquid`,
    snapshot: "A choline-based liquid formula enriched with gotu kola and wolfberry extracts, zinc, vitamins and resveratrol.",
    ingredients: ["Listed ingredients: choline; gotu kola extract; wolfberry extract; zinc; vitamins; resveratrol."],
    labelLines: [],
    focusHeading: "Nervous system, heart & skin",
    focus: "Choline is a nutrient the body uses to build cell membranes and the messenger acetylcholine, and resveratrol is a plant polyphenol.",
    contains: "choline, gotu kola and wolfberry extracts, zinc, vitamins and resveratrol",
  },
  "mesotel-beauty": {
    form: "unknown", subline: `Mesotel · ${AA}`,
    snapshot: "A choline-based antioxidant formula enriched with gotu kola, wolfberry (goji), zinc and vitamins.",
    ingredients: ["Listed ingredients: choline; gotu kola extract; wolfberry (goji); zinc; vitamins."],
    labelLines: [],
    focusHeading: "Skin & antioxidant defences",
    focus: "Zinc contributes to normal skin, and the body relies on antioxidant nutrients to manage everyday oxidative stress.",
    contains: "choline, gotu kola, wolfberry (goji), zinc and vitamins",
  },
  "anti-wrinkle-serum-7": {
    form: "cosmetic", subline: "Cosmetic · Face Serum", noDosage: true,
    snapshot: "A professional cosmetic peptide serum for the face, neck and décolleté with Matrixyl® synthe'6™, Progeline™, Liftessense™ and low-molecular-weight hyaluronic acid.",
    ingredients: ["Key ingredients: Matrixyl® synthe'6™ (palmitoyl tripeptide-38); Progeline™ (acetyl tripeptide-2); Liftessense™ (Cyathea cumingii extract); low molecular weight hyaluronic acid."],
    labelLines: ["Matrixyl® synthe'6™ (palmitoyl tripeptide-38)", "Progeline™ (acetyl tripeptide-2)", "Liftessense™ (Cyathea cumingii extract)", "Low molecular weight hyaluronic acid", "CO2 pomegranate extract", "Evening primrose oil"],
    focusHeading: "Skin",
    focus: "Skin's firmness depends on collagen and other structural proteins, and hyaluronic acid helps the skin hold water.",
    contains: "cosmetic peptides, a fern extract, hyaluronic acid, pomegranate extract and evening primrose oil",
  },
  "alvenorm-forte": {
    form: "liquid", subline: `${NS} · Herbal Liquid`,
    snapshot: "A herbal liquid for the airways with Iceland moss, liquorice root, thyme, nettle, plantain, cowberry, eucalyptus and calendula in grape juice.",
    ingredients: ["Listed ingredients: Iceland moss decoction; liquorice root; thyme; nettle; broadleaf plantain; cowberry leaf; eucalyptus; calendula; red grape juice (base)."],
    labelLines: ["Iceland moss decoction", "Liquorice root", "Thyme", "Nettle", "Broadleaf plantain", "Cowberry leaf", "Eucalyptus", "Calendula", "Red grape juice (base)"],
    focusHeading: "Airways & breathing",
    focus: "The airways carry air to the lungs, and their lining traps and clears inhaled particles.",
    contains: "eight plant ingredients in a red grape juice base",
  },
  volustom: {
    form: "unknown", subline: NS,
    snapshot: "A dietary-fibre formula with adsorbent fibres, designed to support digestion and a balanced gut.",
    ingredients: [], labelLines: [],
    focusHeading: "Digestion & gut",
    focus: "Dietary fibre adds bulk in the gut and feeds the bacteria that live there.",
    contains: "adsorbent dietary fibres",
  },
  getrufline: {
    form: "truffles", subline: `${NS} · Herbal Truffles`,
    snapshot: "A herbal complex in chewable truffle form, designed to support the gut lining and microbiome.",
    ingredients: [], labelLines: [],
    focusHeading: "Gut lining & microbiome",
    focus: "The intestinal lining absorbs nutrients and forms a barrier, and the gut microbiome is the community of bacteria living alongside it.",
    contains: "herbal ingredients in a chewable truffle",
  },
  digemax: {
    form: "unknown", subline: NS,
    snapshot: "A digestive support formula designed to support comfortable digestion and nutrient absorption.",
    ingredients: [], labelLines: [],
    focusHeading: "Digestion",
    focus: "Digestive enzymes break food down into nutrients the gut can absorb.",
    contains: "digestive support ingredients",
  },
  imusil: {
    form: "unknown", subline: NS,
    snapshot: "An immune and skin support formula designed to support the body's natural defences and healthy skin.",
    ingredients: [], labelLines: [],
    focusHeading: "Immune system & skin",
    focus: "The immune system defends the body, and the skin forms its outer barrier.",
    contains: "immune and skin support ingredients",
  },
  "complex-3d": {
    form: "unknown", subline: NS,
    snapshot: "An antioxidant formula with vitamins C, E and A, selenium yeast, L-cysteine, dihydroquercetin, catalase, barley sprout extract and glutathione.",
    ingredients: ["Listed ingredients: ascorbyl palmitate (vitamin C); selenium yeast; L-cysteine; dihydroquercetin; catalase; vitamin E; barley sprout extract; retinol palmitate (vitamin A); glutathione."],
    labelLines: ["Ascorbyl palmitate (Vitamin C)", "Selenium yeast", "L-cysteine", "Dihydroquercetin", "Catalase", "Vitamin E", "Barley sprout extract", "Retinol palmitate (Vitamin A)", "Glutathione"],
    focusHeading: "Antioxidant defences",
    focus: "The body manages oxidative stress with antioxidant enzymes and nutrients, and selenium and vitamins C and E contribute to protecting cells from oxidative stress.",
    contains: "antioxidant vitamins, selenium, L-cysteine, dihydroquercetin, catalase, barley sprout extract and glutathione",
  },
  "complex-3r": {
    form: "tablets", subline: `${NS} · Tablets`,
    snapshot: "An antioxidant formula in tablets that combines dihydroquercetin, resveratrol and coenzyme Q10.",
    ingredients: ["Listed ingredients: dihydroquercetin; resveratrol; coenzyme Q10."],
    labelLines: ["Dihydroquercetin", "Resveratrol", "Coenzyme Q10"],
    focusHeading: "Antioxidant defences & energy",
    focus: "Coenzyme Q10 takes part in cellular energy production, and dihydroquercetin and resveratrol are plant polyphenols.",
    contains: "dihydroquercetin, resveratrol and coenzyme Q10",
  },
  levain: {
    form: "unknown", subline: NS,
    snapshot: "An adaptogen formula combining nine plant-based adaptogens, designed for periods of intense stress and fatigue.",
    ingredients: [], labelLines: [],
    focusHeading: "Stress response & energy",
    focus: "Adaptogens are plants traditionally used to help the body cope with physical and mental strain.",
    contains: "nine plant-based adaptogens",
  },
  likam: {
    form: "unknown", subline: NS,
    snapshot: "A liver and bile-duct formula designed to support normal liver function and healthy bile flow.",
    ingredients: [], labelLines: [],
    focusHeading: "Liver & bile flow",
    focus: "The liver makes bile, which flows through the bile ducts to help digest fats.",
    contains: "liver and bile-duct support ingredients",
  },
  mamiton: {
    form: "unknown", subline: NS,
    snapshot: "A herbal formula for women with resveratrol, nine plant extracts including motherwort, hops and field horsetail, and vitamins A and E.",
    ingredients: ["Listed ingredients: resveratrol; motherwort, mint, rosehip, nettle, knotweed, hops, laminaria, field horsetail and Juglans regia pericarp extracts; vitamins A and E."],
    labelLines: ["Resveratrol", "Motherwort extract", "Mint extract", "Rosehip extract", "Nettle extract", "Knotweed extract", "Hops extract", "Laminaria extract", "Vitamin A", "Vitamin E", "Field horsetail extract", "Juglans regia pericarp extract"],
    focusHeading: "Female reproductive system",
    focus: "The ovaries produce estrogen and progesterone, which shape the menstrual cycle and change around perimenopause.",
    contains: "resveratrol, nine plant extracts and vitamins A and E",
  },
  "pinalex-tab": {
    form: "tablets", subline: `${NS} · Tablets`,
    snapshot: "An eye-focused tablet with the AA-6 peptide complex, lutein, astaxanthin, blueberry, grape peel extract, taurine and vitamins.",
    ingredients: ["Peptide complex: AA-6 peptide complex."],
    labelLines: ["AA-6 peptide complex", "Lutein (marigold extract)", "Astaxanthin", "Blueberry juice powder", "Grape peel extract", "Taurine", "Vitamin E", "Beta-carotene", "B vitamins"],
    focusHeading: "Eyes & visual tissue",
    focus: "The retina turns light into signals for the brain, and lutein is a pigment found naturally in it.",
    contains: "the AA-6 peptide complex, lutein, astaxanthin, blueberry, grape peel extract, taurine and vitamins",
  },
  pangluin: {
    form: "unknown", subline: NS,
    snapshot: "A formula designed to support the pancreas and normal energy metabolism.",
    ingredients: [], labelLines: [],
    focusHeading: "Pancreas & energy metabolism",
    focus: "The pancreas produces insulin and other hormones that help the body use energy from food.",
    contains: "pancreas and metabolic support ingredients",
  },
  revimite: {
    form: "unknown", subline: NS,
    snapshot: "A nutraceutical combining pomegranate, green tea, echinacea, oat, grape seed, ginger and soy extracts with iron, B vitamins and soy lecithin.",
    ingredients: ["Listed ingredients: pomegranate, green tea, echinacea, oat, grape seed, ginger and soy extracts; iron; B vitamins (B1, B6, B12); soy lecithin."],
    labelLines: ["Pomegranate extract", "Green tea extract", "Echinacea extract", "Oat extract", "Grape seed extract", "Ginger extract", "Soy extract", "Iron", "B vitamins (B1, B6, B12)", "Soy lecithin"],
    focusHeading: "Energy & blood formation",
    focus: "Iron and vitamin B12 contribute to normal red blood cell formation, and B vitamins take part in energy metabolism.",
    contains: "seven plant extracts, iron, B vitamins and soy lecithin",
  },
  reviplant: {
    form: "unknown", subline: NS,
    snapshot: "A phytonutrient formula combining botanical extracts to support the liver and the immune system.",
    ingredients: [], labelLines: [],
    focusHeading: "Liver & immune system",
    focus: "The liver processes nutrients and clears substances the body no longer needs, and the immune system defends the body.",
    contains: "botanical extracts",
  },
  "reviform-cocktail": {
    form: "shake", subline: `${NS} · Shake`,
    snapshot: "A nutritional shake that combines protein with vitamins and minerals.",
    ingredients: ["Listed ingredients: protein; vitamins; minerals."],
    labelLines: [],
    focusHeading: "Muscle & body composition",
    focus: "Protein supplies the amino acids the body uses to maintain muscle.",
    contains: "protein, vitamins and minerals",
  },
  revifort: {
    form: "capsules", subline: `${NS} · Capsules`,
    snapshot: "A capsule formula combining shiitake, reishi, maitake and cordyceps mushroom extracts with red echinacea, zinc, kelp and selenium.",
    ingredients: ["Listed ingredients: shiitake, reishi, maitake and cordyceps extracts (6:1); red echinacea top extract; zinc citrate; laminaria (kelp) extract; sodium selenite."],
    labelLines: ["Shiitake mushroom extract (6:1)", "Reishi mushroom extract (6:1)", "Maitake mushroom extract (6:1)", "Cordyceps extract (6:1)", "Red echinacea top extract", "Zinc citrate", "Laminaria (kelp) extract", "Sodium selenite"],
    focusHeading: "Immune system",
    focus: "Zinc and selenium contribute to the normal function of the immune system, and mushroom glucans have been studied for their role in immune function.",
    contains: "four mushroom extracts, red echinacea, zinc, kelp and selenium",
  },
  renefort: {
    form: "unknown", subline: NS,
    snapshot: "A kidney support formula designed to support normal kidney function and urinary-system balance.",
    ingredients: [], labelLines: [],
    focusHeading: "Kidneys & urinary system",
    focus: "The kidneys filter the blood and keep water and salts in balance.",
    contains: "kidney support ingredients",
  },
  retisil: {
    form: "unknown", subline: NS,
    snapshot: "An eye-health formula with lutein, zeaxanthin and complementary nutrients.",
    ingredients: ["Listed ingredients include lutein and zeaxanthin."],
    labelLines: [],
    focusHeading: "Eyes & retina",
    focus: "Lutein and zeaxanthin are pigments found naturally in the macula, the central part of the retina.",
    contains: "lutein, zeaxanthin and complementary nutrients",
  },
  rinolax: {
    form: "unknown", subline: NS, noDosage: true,
    snapshot: "A natural formula designed to support the nose, sinuses and throat.",
    ingredients: [], labelLines: [],
    focusHeading: "Nose, sinuses & throat",
    focus: "The nasal and sinus lining warms and moistens the air we breathe and traps particles.",
    contains: "natural ingredients for the nose, sinuses and throat",
  },
  felicita: {
    form: "unknown", subline: NS,
    snapshot: "A mood-support formula designed to support a balanced mood and resilience to everyday stress.",
    ingredients: [], labelLines: [],
    focusHeading: "Mood & stress response",
    focus: "Mood is shaped by brain messengers such as serotonin and dopamine.",
    contains: "mood-support ingredients",
  },
  "zinsil-t": {
    form: "chewable tablets", subline: `${NS} · Chewable Tablets`,
    snapshot: "A chewable tablet that combines glycine (500 mg), zinc (8.6 mg) and vitamin B6 (1.5 mg).",
    ingredients: ["Listed ingredients: glycine (500 mg); zinc (8.6 mg); pyridoxine / vitamin B6 (1.5 mg)."],
    labelLines: ["Glycine (500mg)", "Zinc (8.6mg)", "Pyridoxine / Vitamin B6 (1.5mg)"],
    focusHeading: "Immune function & metabolism",
    focus: "Zinc contributes to normal immune function, and vitamin B6 contributes to normal energy metabolism.",
    contains: "glycine, zinc and vitamin B6",
  },
  ensil: {
    form: "capsules", subline: `${NS} · Capsules`,
    snapshot: "A capsule formula with coenzyme Q10, nicotinamide, folic acid, echinacea, succinic acid, L-carnitine, L-cysteine and a broad range of vitamins.",
    ingredients: ["Listed ingredients: coenzyme Q10; nicotinamide (vitamin PP); folic acid; echinacea extract; succinic acid; L-carnitine; L-cysteine; vitamins A, B1, B2, B5, B6, B12, C, D and E; biotin."],
    labelLines: ["Coenzyme Q10", "Nicotinamide (Vitamin PP)", "Folic acid", "Echinacea extract", "Succinic acid (amber acid)", "L-carnitine", "Vitamins B1, B5, B6", "Vitamins C and E", "L-cysteine", "Vitamin B2", "Vitamin A", "Vitamin D", "Vitamin B12", "Biotin"],
    focusHeading: "Cellular energy",
    focus: "Coenzyme Q10 and B vitamins take part in the reactions cells use to produce energy.",
    contains: "coenzyme Q10, nicotinamide, folic acid, echinacea, succinic acid, L-carnitine, L-cysteine and vitamins",
  },
  "anti-age-nb-activity": {
    form: "liquid", subline: "Anti-Age Complex NB · Liquid Concentrate",
    snapshot: "A liquid concentrate from the Anti-Age Complex NB line containing the AA-9 and AA-3 peptide complexes.",
    ingredients: ["Peptide complexes: AA-9 and AA-3 (per the manufacturer)."],
    labelLines: [],
    focusHeading: "Connective tissue & energy",
    focus: "Collagen is the main structural protein of skin and connective tissue.",
    contains: "the AA-9 and AA-3 peptide complexes",
  },
  "anti-age-nb-health": {
    form: "capsules", subline: "Anti-Age Complex NB · Capsules",
    snapshot: "A capsule formula from the Anti-Age Complex NB line containing the AA-3 and AA-1 peptide complexes.",
    ingredients: ["Peptide complexes: AA-3 and AA-1 (per the manufacturer)."],
    labelLines: [],
    focusHeading: "Proteins & ageing",
    focus: "Advanced glycation end-products (AGEs) are compounds that build up in proteins with age.",
    contains: "the AA-3 and AA-1 peptide complexes",
  },
  "gpl-femme": {
    form: "unknown", subline: "Peptide Bioregulators",
    snapshot: "A multi-peptide formula for women that combines pineal, brain, vascular, liver, thyroid and ovarian peptides with alpha-lipoic acid.",
    ingredients: ["Peptide complexes (per the product description): epiphysis, cerebrum, vascular, liver, thyroid and ovarian; plus alpha-lipoic acid."],
    labelLines: [],
    focusHeading: "Female endocrine & reproductive systems",
    focus: "The thyroid sets the pace of metabolism, and the ovaries produce estrogen and progesterone.",
    contains: "six peptide complexes and alpha-lipoic acid",
  },
  "gpl-man": {
    form: "unknown", subline: "Peptide Bioregulators",
    snapshot: "A multi-peptide formula for men that combines pineal, brain, vascular, liver, pancreas and testicular peptides with alpha-lipoic acid.",
    ingredients: ["Peptide complexes (per the product description): epiphysis, cerebrum, vascular, liver, pancreatic and testicular; plus alpha-lipoic acid."],
    labelLines: [],
    focusHeading: "Male endocrine & reproductive systems",
    focus: "The testes produce testosterone, and the pancreas produces hormones that help the body use energy from food.",
    contains: "six peptide complexes and alpha-lipoic acid",
  },
};

const COSMETIC_LEAD = (name: string) =>
  `${name} is a cosmetic, not a medicine. Review the complete product label, including all ingredients and any warnings, before use.`;

function build(id: string, d: Draft): FormulaPdpContent {
  const f = PRODUCT_FACTS[id];
  const name = f?.name ?? id;
  const md = f?.manufacturerDirections;
  const source = md?.status === "verified" && md.text ? manufacturer(md.text) : undefined;
  const isSl = id.startsWith("revilab-sl-");
  const second = isSl
    ? `These are the biological systems associated with ${name}'s peptide complexes, not established effects of the finished product.`
    : `This is the biological area associated with the listed ingredients of ${name}, not an established effect of the finished product.`;
  const copy: FormulaPdpContent = {
    title: name,
    subline: d.subline,
    snapshot: d.snapshot,
    ingredients: d.ingredients,
    biologicalFocus: { heading: d.focusHeading, body: `${d.focus} ${second}` },
    manufacturerDirections: { line: LINE, ...(source ? { source } : {}) },
    research: `${name} contains ${d.contains}. Research on individual ingredients or on related peptides does not necessarily establish benefits for this combination. Evidence establishing ${name}'s effectiveness and long-term safety in humans remains limited.`,
    importantInformation: "",
    dosageCourse: !d.noDosage,
    legacyTitle: true,
    labelLines: d.labelLines,
    size: d.size,
    form: d.form,
  };
  const out = streamline(name, copy, f?.pdp?.safety);
  if (d.form === "cosmetic") {
    const lead = COSMETIC_LEAD(name);
    out.importantInformation = lead;
    out.streamlined = { ...out.streamlined!, safety: [lead, ...out.streamlined!.safety.slice(1)] };
  }
  return out;
}

/**
 * Meta descriptions where the Snapshot's tissue/ingredient words ("bronchi", "prostate") would read as
 * condition terms in search snippets; same facts, complexes counted instead of named.
 */
const META: Record<string, string> = {
  // "L-cysteine" trips the snippet claim filter (cyst\w*); left out of the meta only.
  "complex-3d": "Complex 3D: an antioxidant formula with vitamins C, E and A, selenium yeast, dihydroquercetin, catalase, barley sprout extract and glutathione.",
  ensil: "Ensil: a capsule formula with coenzyme Q10, nicotinamide, folic acid, echinacea, succinic acid, L-carnitine and a broad range of vitamins.",
  "revilab-sl-06": "Revilab SL 06: Revilab SL drops taken under the tongue, combining three peptide complexes with plant extracts, essential oils and dihydroquercetin.",
  "revilab-sl-09": "Revilab SL 09: Revilab SL drops for men taken under the tongue, combining four peptide complexes with plant extracts, essential oils and dihydroquercetin.",
};

export const PHASE2_COPY: Record<string, FormulaPdpContent> = Object.fromEntries(
  Object.entries(DRAFTS).map(([id, d]) => [id, { ...build(id, d), ...(META[id] ? { metaDescription: META[id] } : {}) }]),
);

/** Report lists (never rendered). */
export const PHASE2_GAPS = {
  noVerifiedDirections: Object.keys(DRAFTS).filter((id) => PRODUCT_FACTS[id]?.manufacturerDirections.status !== "verified"),
  noSizeInData: Object.keys(DRAFTS).filter((id) => !DRAFTS[id].size),
  noNamedIngredients: Object.keys(DRAFTS).filter((id) => DRAFTS[id].ingredients.length === 0),
  formUnclear: Object.keys(DRAFTS).filter((id) => DRAFTS[id].form === "unknown"),
};
