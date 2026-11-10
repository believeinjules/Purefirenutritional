/**
 * ChatGPT content template (Julia, 2026-11-09 8:29 PM): Snapshot is one sentence; Biological
 * Focus is a system subheading plus two short sentences. Each line is tightened from the
 * product's own reviewed copy (structure/function only). The second Biological Focus sentence
 * follows Julia's approved Bonomarlot wording.
 */
export interface TemplateCopy {
  /** One sentence. Omitted = the product's current one-sentence Snapshot is kept. */
  snapshot?: string;
  /** Two short sentences. */
  focus: string;
}

const sys = (name: string, complex: string) =>
  `This is the biological system associated with ${name}'s ${complex}, not an established effect of the finished product.`;
const ml = (name: string) =>
  `These are the biological systems associated with ${name}'s peptide complexes, not established effects of the finished product.`;

export const TEMPLATE_COPY: Record<string, TemplateCopy> = {
  // Bonomarlot: Julia's approved round-3 Snapshot and Biological Focus (already two sentences).
  bonothyrk: { focus: `The parathyroid glands release parathyroid hormone, which helps keep blood calcium steady for bones, muscles and nerves. ${sys("Bonothyrk", "A-21 complex")}` },
  cerluten: { focus: `The brain coordinates thought, memory, mood, sleep and movement, and its nerve cells use a large share of the body's energy. ${sys("Cerluten", "A-5 complex")}` },
  chelohart: { focus: `The heart muscle contracts about 100,000 times a day to move oxygen-rich blood around the body, and its cells depend on a constant energy supply. ${sys("Chelohart", "A-14 complex")}` },
  chitomur: { focus: `The bladder is a muscular organ that stores and releases urine, while its inner lining shields the wall beneath. ${sys("Chitomur", "A-12 complex")}` },
  endoluten: {
    snapshot: "A Khavinson Cytomax peptide bioregulator centered on A-8, a natural peptide complex from pineal gland (epiphysis) tissue, which does not contain melatonin.",
    focus: `The pineal gland releases melatonin at night, helping to set the internal clock that times sleep and other daily rhythms. ${sys("Endoluten", "A-8 complex")}`,
  },
  glandokort: { focus: `The adrenal glands sit on top of the kidneys and produce hormones such as cortisol and adrenaline, which help the body respond to stress and manage energy. ${sys("Glandokort", "A-17 complex")}` },
  gotratix: { focus: `Skeletal muscles move the body and hold posture, adapting to training and recovering after effort. ${sys("Gotratix", "A-18 complex")}` },
  libidon: { focus: `The prostate is a small gland below the bladder that produces part of the seminal fluid and surrounds the urethra. ${sys("Libidon", "A-16 complex")}` },
  pielotax: { focus: `The kidneys filter the blood, moving waste into the urine and keeping water and salts in balance. ${sys("Pielotax", "A-9 complex")}` },
  sigumir: { focus: `Cartilage cushions the joints and spine, while bone gives the body its structure and stores minerals. ${sys("Sigumir", "A-4 complex")}` },
  stamakort: { focus: `The stomach breaks food down with acid and enzymes, and its inner lining renews itself constantly. ${sys("Stamakort", "A-10 complex")}` },
  suprefort: { focus: `The pancreas releases digestive enzymes into the intestine and produces hormones, including insulin, that help the body use energy from food. ${sys("Suprefort", "A-1 complex")}` },
  svetinorm: { focus: `The liver processes nutrients, stores energy, makes proteins and bile, and clears substances the body no longer needs. ${sys("Svetinorm", "A-7 complex")}` },
  taxorest: { focus: `The bronchi carry air into the lungs, and their lining traps and clears dust and particles. ${sys("Taxorest", "A-19 complex")}` },
  testoluten: { focus: `The testes produce sperm and most of the body's testosterone. ${sys("Testoluten", "A-13 complex")}` },
  thyreogen: { focus: `The thyroid gland's hormones set the pace of metabolism, influencing how quickly the body uses energy. ${sys("Thyreogen", "A-2 complex")}` },
  ventfort: { focus: `Blood vessels carry blood to every organ, and their flexible walls and inner lining help control blood flow. ${sys("Ventfort", "A-3 complex")}` },
  visoluten: { focus: `The retina at the back of the eye turns light into signals for the brain and needs a steady supply of nutrients and oxygen. ${sys("Visoluten", "A-11 complex")}` },
  vladonix: { focus: `The thymus is a small gland behind the breastbone where T cells, a key type of immune cell, mature, and it gradually shrinks with age. ${sys("Vladonix", "A-6 complex")}` },
  zhenoluten: { focus: `The ovaries produce eggs and the hormones estrogen and progesterone, which shape the menstrual cycle. ${sys("Zhenoluten", "A-15 complex")}` },

  cartalax: { focus: `Cartilage covers the ends of bones in the joints and cushions the spine, and it renews slowly. ${sys("Cartalax", "AC-4 complex")}` },
  crystagen: { focus: `The thymus is where T cells, white blood cells that coordinate many immune responses, mature. ${sys("Crystagen", "AC-6 complex")}` },
  ovagen: { focus: "The liver processes nutrients and makes bile, working alongside the stomach and intestines in digestion. The manufacturer associates Ovagen's AC-3 complex with this system; that is a research context, not an established effect of the finished product." },
  pinealon: { focus: `The cerebral cortex handles thinking, memory, language and attention, and its nerve cells are among the most energy-demanding in the body. ${sys("Pinealon", "AC-5 complex")}` },
  vesugen: { focus: `Arteries, veins and capillaries carry blood to every tissue, and their inner lining helps set how widely each vessel opens. ${sys("Vesugen", "AC-2 complex")}` },
  chonluten: { focus: `The bronchi and lungs bring in air so oxygen can pass into the blood, and the airway lining relies on steady cell renewal. ${sys("Chonluten", "AC-7 complex")}` },

  "revilab-ml-01": {
    snapshot: "A Revilab ML capsule combining epiphysis, B-link immune and liver peptide complexes with resveratrol, choline, omega-3 and vitamins E, A and C.",
    focus: `The epiphysis (pineal gland) helps time daily rhythms, B cells make antibodies, and the liver processes nutrients. ${ml("Revilab ML 01")}`,
  },
  "revilab-ml-02": {
    snapshot: "A Revilab ML capsule combining two immune, one bone marrow and one liver peptide complex with omega-3 fatty acids and vitamins E, B6 and B9.",
    focus: `Bone marrow produces blood cells, the immune system defends the body, and the liver processes nutrients. ${ml("Revilab ML 02")}`,
  },
  "revilab-ml-03": {
    snapshot: "A Revilab ML capsule combining brain, retina and vascular wall peptide complexes with astaxanthin, marigold extract, choline, omega-3 and B vitamins.",
    focus: `The retina is an extension of the brain, and both depend on a dense network of small blood vessels. ${ml("Revilab ML 03")}`,
  },
  "revilab-ml-04": {
    snapshot: "A Revilab ML capsule combining epiphysis, vascular wall and heart muscle peptide complexes with resveratrol, rutin, omega-3 and niacin.",
    focus: `The heart pumps blood through vessels whose walls need to stay flexible, and the pineal gland helps time daily rhythms. ${ml("Revilab ML 04")}`,
  },
  "revilab-ml-05": {
    snapshot: "A Revilab ML capsule combining T-link immune, bronchi and lungs-and-stomach-wall peptide complexes with omega-3, vitamins E and A and licorice root extract.",
    focus: `The bronchi carry air into the lungs, and T cells patrol tissues such as the airway lining. ${ml("Revilab ML 05")}`,
  },
  "revilab-ml-06": {
    snapshot: "A Revilab ML capsule combining liver, pancreas and lungs-and-stomach-wall peptide complexes with omega-3 and licorice, artichoke, plantain and strawberry leaf extracts.",
    focus: `The stomach, pancreas and liver work together in digestion, from breaking food down to processing absorbed nutrients. ${ml("Revilab ML 06")}`,
  },
  "revilab-ml-07": {
    snapshot: "A Revilab ML capsule for men combining epiphysis, vascular wall, testes and bladder peptide complexes with omega-3, L-carnitine and zinc citrate.",
    focus: `The testes produce sperm and testosterone, the bladder stores urine, and both depend on a healthy blood supply. ${ml("Revilab ML 07")}`,
  },
  "revilab-ml-08": {
    snapshot: "A Revilab ML capsule for women combining epiphysis, vascular wall, cartilage and bladder peptide complexes with omega-3, resveratrol and arginine.",
    focus: `The pineal gland helps time hormonal rhythms, cartilage cushions the joints, and the bladder stores and releases urine. ${ml("Revilab ML 08")}`,
  },
  "revilab-ml-09": {
    snapshot: "A Revilab ML capsule combining B-link immune, vascular wall and cartilage peptide complexes with chondroitin sulfate, omega-3, SOD, catalase and carnosine.",
    focus: `Cartilage cushions the joints and relies on nearby vessels and joint fluid for nutrients, and B cells are the antibody-producing immune cells. ${ml("Revilab ML 09")}`,
  },
};
