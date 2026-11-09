/**
 * Khavinson Cytomax® product page copy (PROPOSAL, local only). Written per product from
 * shared/product-facts.json (composition, pdp copy) and the brochure notes
 * (/workspace/sources/khavinson-brochure-dosing-notes.md). Bonomarlot is Julia's template, verbatim.
 */
import { brochure, manufacturer, MANUFACTURER_DIRECTIONS_LINE as LINE, type FormulaPdpContent } from "./shared";

const SUBLINE = "Khavinson Cytomax® | Focused Formula";
const FOCUSED = "Formulation type: Focused peptide complex.";
const REVIEW = "Review the complete product label and consult a qualified healthcare professional before use.";

export const BONOMARLOT_BROCHURE_DIRECTIONS = brochure(
  7,
  "Bonomarlot® instructions: 1-2 capsules or tablets 1-2 times a day with meals. The duration of administration is 30 days. It is advisable to repeat the course in 3-6 months.",
);

export const CYTOMAX_COPY: Record<string, FormulaPdpContent> = {
  bonomarlot: {
    title: "Bonomarlot® — A-20 Bone Marrow Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A bone marrow-derived peptide complex from the original Khavinson Cytomax collection, associated with research into blood cell formation and cellular regulation.",
    // Snapshot is 161 characters, so the meta drops its last clause ("and cellular regulation").
    metaDescription:
      "Bonomarlot®: a bone marrow-derived peptide complex from the original Khavinson Cytomax collection, associated with research into blood cell formation.",
    ingredients: ["Active complex: A-20, derived from bone marrow."],
    // TODO(julia): brochure p. 7 prints "Release form: 20 capsules or tablets containing 10 mg of BONOMARLOT®"; not verified against our label.
    biologicalFocus: {
      heading: "Bone marrow & hematopoietic system",
      body: "Bone marrow produces red and white blood cells and platelets, which are involved in oxygen transport, immune defense, and clotting. This is the biological system associated with Bonomarlot's tissue-derived peptide complex, not an established clinical effect of the finished product.",
    },
    // Round 3: "About This Product" removed; the separate Manufacturer Directions section is folded into
    // Dosage & Course Information (streamlined.labeledDirections). `line` is kept for the data model only.
    manufacturerDirections: { source: BONOMARLOT_BROCHURE_DIRECTIONS, line: LINE },
    compareIntro:
      "Explore combination formulas with potentially related bone marrow peptide ingredients. Exact overlap should be confirmed from their ingredient lists.",
    research:
      "Khavinson peptide research has explored tissue-derived peptides and their possible role in cellular regulatory processes. Bonomarlot's research association centers on bone marrow and blood cell formation. Laboratory and animal findings on related peptides do not establish benefits for the finished product, and human evidence on Bonomarlot itself is limited.",
    importantInformation:
      "Bonomarlot is not a medicine. Review the complete product label, including other ingredients and any warnings, and consult a qualified healthcare professional before use, especially if you take medications or have a medical condition.",
    dosageCourse: true,
    streamlined: {
      ingredientsNote: "Full ingredient list and amounts available on the product label.",
      labeledDirections: {
        heading: "Manufacturer's Labeled Directions",
        // TODO(julia): quote is from the brochure (p. 7); unconfirmed against the package label.
        attribution: "As printed in the Cytomax and Cytogen product brochure (p. 7):",
        text: `"${BONOMARLOT_BROCHURE_DIRECTIONS.text}"`,
      },
      safety: [
        // Important Information (round 2) merged with the product-facts safety paragraph and the
        // generic stop-use line; "consult … before use" appears once.
        "Bonomarlot is not a medicine. Review the complete product label, including other ingredients and any warnings, and consult a qualified healthcare professional before use, especially if you take medications or have a medical condition.",
        "Not recommended during pregnancy or breastfeeding unless your doctor advises it. Do not use if you are allergic or sensitive to any component. Keep out of reach of children.",
        "If you have an allergic reaction, an adverse effect, or a concern, discontinue use and seek medical care.",
      ],
      omitDoctorQuestions: [
        "Should I take this preventively or restoratively?",
        "How long should one cycle be for me?",
      ],
    },
    flags: [
      "Amount per capsule not published: brochure p. 7 prints 10 mg per capsule or tablet; not verified against our label.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 7 quoted instead.",
      "Labeled directions quote is from the brochure; unconfirmed against the package label.",
    ],
  },

  bonothyrk: {
    title: "Bonothyrk® — A-21 Parathyroid Gland Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytomax peptide bioregulator built around one natural extract: the A-21 peptide complex from parathyroid gland tissue.",
    ingredients: ["Primary ingredient: A-21 parathyroid gland-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Parathyroid glands & calcium balance",
      body: "The four parathyroid glands sit behind the thyroid and release parathyroid hormone, which helps keep blood calcium steady by acting on bone, the kidneys and the gut. Steady calcium levels matter for bones, muscles and nerves. Bonothyrk's tissue association places it within the broader research context of parathyroid function and mineral balance. This association does not establish that taking the product changes parathyroid hormone, calcium levels or bone density.",
    },
    about:
      "Bonothyrk contains A-21, a naturally derived peptide complex obtained from the parathyroid glands of young animals. It is one of the Khavinson Cytomax formulas, each of which pairs a tissue-derived peptide complex with a specific organ or gland. Bonothyrk centers on that one parathyroid complex; its listed composition contains no calcium, vitamin D or other active ingredients.",
    manufacturerDirections: {
      source: brochure(11, "Bonothyrk® instructions: 1-2 capsules or tablets with meals 1-2 times a day. The duration of administration is 30 days. It is advisable to repeat the course in 3-6 months."),
      line: LINE,
    },
    research:
      "Khavinson peptide research has explored whether short peptides from a given tissue interact with the cells of that same tissue. For Bonothyrk, the topics of interest have been parathyroid tissue peptides and gland cell activity in laboratory models, calcium and mineral balance, and bone health with age. Laboratory findings and research on related peptides do not necessarily establish clinical benefits for the finished product. Evidence establishing Bonothyrk's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Bonothyrk is not presented as a treatment for osteoporosis, parathyroid disorders, calcium imbalances or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 11 prints 10 mg per capsule or tablet; existing card text says 0.215 g capsules. Not verified against our label.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 11 quoted instead.",
    ],
  },

  cerluten: {
    title: "Cerluten® — A-5 Brain Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytomax peptide bioregulator containing a single natural extract, the A-5 peptide complex obtained from brain tissue.",
    ingredients: ["Primary ingredient: A-5 brain-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Brain & nervous system",
      body: "The brain coordinates thought, memory, mood, sleep and movement, and its nerve cells use a large share of the body's energy. Those cells are also sensitive to stress and oxidative strain. Cerluten's tissue association places it within the broader research context of nerve-cell activity and the ageing nervous system. This association does not establish that taking the product improves memory, focus or any other brain function.",
    },
    about:
      "Cerluten contains A-5, a naturally derived peptide complex obtained from brain tissue. It belongs to the Khavinson Cytomax collection of tissue-derived peptide complexes, each associated with a particular organ or system. Cerluten is not the same product as Pinealon: Pinealon is a Khavinson Cytogen formula with a synthetic brain peptide complex (AC-5), while Cerluten is a natural extract.",
    manufacturerDirections: {
      source: brochure(81, "CERLUTEN® is recommended to be taken 10-15 minutes before meals, 1-3 tablets or capsules 2-3 times a day for 10-20 days. A second course is advised in 3 - 6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab ML 03 and Revilab SL 02 are related combination formulations containing brain-associated peptide ingredients. Unlike Cerluten, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Researchers in the Khavinson program have studied brain tissue peptides and nerve-cell activity in laboratory models, along with questions such as how nerve cells respond to oxidative stress and how the nervous system changes with age. Much of this work is cell and animal research published in Russian-language literature. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Cerluten's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Cerluten is not presented as a treatment for stroke, brain injury, dementia, memory disorders or other neurological conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Directions: product-facts.json \"conflicting\". Brochure p. 81 quoted as an excerpt (dosing sentences only; the same block lists disease uses, not reproduced). Its 1-3 × 2-3/day, 10-20 days differs from the 1-2 × 1-2/day storefront text. Julia to confirm.",
      "Existing Safety text says \"possible allergy to the gelatin capsule shell or to lactose\", but the Other ingredients line lists a hydroxypropyl methylcellulose shell. Conflict, not resolved here.",
    ],
  },

  chelohart: {
    title: "Chelohart® — A-14 Heart Muscle Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator centered on A-14, a natural peptide complex from heart muscle tissue.",
    ingredients: ["Primary ingredient: A-14 heart muscle-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Heart muscle & cardiovascular system",
      body: "The heart muscle contracts roughly 100,000 times a day to move oxygen- and nutrient-rich blood around the body, and its cells depend on a constant energy supply. Chelohart's tissue association places it within the broader research context of heart muscle cell activity and energy metabolism. This association does not establish that taking the product affects heart rate, blood pressure or heart function.",
    },
    about:
      "Chelohart contains A-14, a naturally derived peptide complex obtained from the heart muscle of young animals. It is part of the Khavinson Cytomax collection, in which each formula is linked to one organ or tissue. Within that collection, Chelohart relates to the heart muscle itself, while Ventfort relates to the blood vessels.",
    manufacturerDirections: {
      source: brochure(86, "Take 1-2 capsules or tablets of CHELOHART® 1-2 times a day with meals. Duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab ML 04 is a related combination formulation containing heart muscle-associated peptide ingredients. Unlike Chelohart, this product combines multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Khavinson peptide research has looked at heart muscle peptides and cardiac cell activity in laboratory models, including energy metabolism in heart muscle cells and how cardiac tissue changes with age. This is largely cell and animal work, and findings from related peptides do not necessarily establish clinical benefits for the finished product. Evidence establishing Chelohart's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Chelohart is not presented as a treatment for heart disease, high blood pressure, arrhythmias or other cardiovascular conditions, and it is not a substitute for prescribed heart medication. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 86 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 86 quoted (\"Take1-2\" spacing fixed).",
    ],
  },

  chitomur: {
    title: "Chitomur® — A-12 Bladder Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator with one active component: the A-12 peptide complex from urinary bladder tissue.",
    ingredients: ["Primary ingredient: A-12 bladder-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Urinary bladder",
      body: "The bladder is a muscular organ that stores urine and releases it. Its wall stretches and contracts thousands of times a year, while its inner lining protects the tissue beneath. Chitomur's tissue association places it within the broader research context of bladder wall cells and the coordination of the urinary system. This association does not establish that taking the product changes bladder control, urinary frequency or urinary comfort.",
    },
    about:
      "Chitomur contains A-12, a naturally derived peptide complex obtained from the bladder wall of young animals. As a Khavinson Cytomax formula, it is linked to one tissue. Within the urinary system it relates to the bladder, which stores urine, whereas Pielotax relates to the kidneys, which filter the blood.",
    manufacturerDirections: {
      source: brochure(91, "Take 1-2 capsules or tablets of CHITOMUR® 1-2 times a day with meals. Duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab SL 08 and Revilab SL 09 are related combination formulations containing bladder-associated peptide ingredients. Unlike Chitomur, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Studies in the Khavinson program have examined bladder tissue peptides and bladder cell activity in laboratory models, as well as how the bladder wall and lining change with age. These are mainly laboratory investigations, and they do not necessarily establish clinical benefits for the finished product. Evidence establishing Chitomur's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Chitomur is not presented as a treatment for overactive bladder, incontinence, urinary tract infections, prostate conditions or other urological conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 91 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 91 quoted.",
    ],
  },

  endoluten: {
    title: "Endoluten® — A-8 Pineal Gland Peptide Complex",
    subline: SUBLINE,
    snapshot:
      "A Khavinson Cytomax peptide bioregulator centered on A-8, a natural peptide complex from pineal gland (epiphysis) tissue. It does not contain melatonin.",
    ingredients: ["Primary ingredient: A-8 pineal gland-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Pineal gland & daily rhythms",
      body: "The pineal gland is a small gland deep in the brain that releases melatonin at night, helping to set the internal clock that times sleep, hormone release and other daily rhythms. Its activity tends to decline with age. Endoluten's tissue association places it within the broader research context of circadian rhythms and the neuroendocrine system. This association does not establish that taking the product changes melatonin levels, sleep or ageing.",
    },
    about:
      "Endoluten contains A-8, a naturally derived peptide complex obtained from the pineal gland tissue of young animals. It belongs to the Khavinson Cytomax collection of tissue-derived complexes. Despite the similar name, it is not the same product as Pinealon, which is a Khavinson Cytogen formula with a synthetic brain peptide complex. Endoluten centers on its single pineal complex and does not contain melatonin.",
    manufacturerDirections: {
      source: manufacturer("Adults: 1 capsule every 3 days, in the morning or at midday. Course: 20 days to 2 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab SL 09 is a related combination formulation containing pineal gland-associated peptide ingredients. Unlike Endoluten, this product combines multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Researchers have investigated pineal peptide preparations in small studies looking at night-time melatonin; those studies used injectable extracts, not these capsules. Laboratory analysis has also detected the short peptide AEDG (the sequence known as Epitalon) in the pineal polypeptide complex. Research on related peptides does not necessarily establish clinical benefits for the finished product, and Endoluten itself has no published human trials. Evidence establishing Endoluten's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Endoluten is not presented as a treatment for insomnia, sleep disorders, hormonal disorders or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Directions: Julia-confirmed (2026-10-14) peptid.ru label text, kept as the page shows it today. product-facts.json status is \"blocked\"; peptideproduct.com (1–2 capsules 2×/day, 1 month) and brochure p. 98 (1-2 capsules 1-3×/day, 30 days) differ.",
      "Amount per capsule not published: brochure p. 98 prints 10 mg per capsule or tablet; not verified.",
    ],
  },

  glandokort: {
    title: "Glandokort® — A-17 Adrenal Gland Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator built on A-17, a natural peptide complex from adrenal gland tissue.",
    ingredients: ["Primary ingredient: A-17 adrenal gland-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Adrenal glands & stress response",
      body: "The two adrenal glands sit on top of the kidneys and produce hormones such as cortisol and adrenaline, which help the body respond to stress, manage energy and keep blood pressure and fluid balance steady. Glandokort's tissue association places it within the broader research context of adrenal cell activity and the body's normal stress response. This association does not establish that taking the product changes cortisol or other hormone levels, energy or stress.",
    },
    about:
      "Glandokort contains A-17, a naturally derived peptide complex obtained from the adrenal glands of young animals, developed within Prof. Vladimir Khavinson's peptide bioregulator program. Like the other Khavinson Cytomax formulas, it is built on the idea that short, organ-specific peptides may act selectively on the cells of the tissue they come from. Its only listed active ingredient is the adrenal complex.",
    manufacturerDirections: {
      source: brochure(28, "Glandokort® instructions: 1-2 capsules or tablets with meals 1-2 times a day. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Khavinson researchers have studied adrenal tissue peptides and adrenal cell activity in laboratory models, along with the hormones of the stress response and how hormone-producing tissue changes with age. These laboratory findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Glandokort's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Glandokort is not presented as a treatment for adrenal insufficiency, chronic fatigue, anxiety or other endocrine or medical conditions, and it is not a substitute for prescribed hormone therapy. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 28 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 28 quoted.",
    ],
  },

  gotratix: {
    title: "Gotratix® — A-18 Muscle Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator containing one natural extract, the A-18 peptide complex from muscle tissue.",
    ingredients: ["Primary ingredient: A-18 muscle-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Skeletal muscle",
      body: "Skeletal muscles move the body, hold posture and use much of the energy from food. Muscle tissue adapts to training and recovers after effort, while mass and strength tend to decline gradually with age. Gotratix's tissue association places it within the broader research context of muscle cell activity and recovery after physical effort. This association does not establish that taking the product increases strength, endurance or muscle mass.",
    },
    about:
      "Gotratix contains A-18, a naturally derived peptide complex obtained from the muscle tissue of young animals. It is part of the Khavinson Cytomax collection, where each formula is associated with one tissue. Gotratix relates to muscle, whereas Sigumir and Cartalax relate to cartilage and the joints. Its only listed active ingredient is the muscle peptide complex.",
    manufacturerDirections: {
      source: brochure(32, "GOTRATIX® is recommended: 1-2 capsules or tablets 2-3 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab SL 04 is a related combination formulation containing muscle-associated peptide ingredients. Unlike Gotratix, this product combines multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "The Khavinson program has examined muscle tissue peptides and muscle cell activity in laboratory models, along with recovery after physical effort and muscle function with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Gotratix's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Gotratix is not presented as a treatment for muscle-wasting conditions, injuries or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Directions: product-facts.json \"conflicting\". Brochure p. 32 quoted (prints the name with a Cyrillic \"Х\"; shown with a Latin X). Its 2-3×/day differs from the 1–2×/day storefront text.",
      "Amount per capsule not published: brochure p. 32 prints 10 mg per capsule or tablet; not verified.",
    ],
  },

  libidon: {
    title: "Libidon® — A-16 Prostate Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator for men, centered on A-16, a natural peptide complex from prostate tissue.",
    ingredients: ["Primary ingredient: A-16 prostate-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Prostate & male urogenital system",
      body: "The prostate is a small gland below the bladder that produces part of the seminal fluid and surrounds the urethra, so it is involved in both reproductive and urinary function. It changes naturally with age. Libidon's tissue association places it within the broader research context of prostate cell activity and male urogenital function. This association does not establish that taking the product changes prostate size, urinary flow or sexual function.",
    },
    about:
      "Libidon contains A-16, a naturally derived peptide complex obtained from the prostate gland of young animals. It belongs to the Khavinson Cytomax collection, in which each formula is associated with a single organ. Libidon relates to the prostate; Testoluten, another Cytomax formula for men, relates to the testes.",
    manufacturerDirections: {
      source: brochure(42, "It is recommended to take LIBIDON® 1-2 capsules or tablets 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab SL 09 is a related combination formulation containing prostate-associated peptide ingredients. Unlike Libidon, this product combines multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Khavinson researchers have looked at prostate tissue peptides and prostate cell activity in laboratory models, and at tissue-specific peptide signalling in glandular tissue. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Libidon's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Libidon is not presented as a treatment for prostatitis, benign prostatic hyperplasia, prostate cancer, erectile dysfunction or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 42 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 42 quoted.",
    ],
  },

  pielotax: {
    title: "Pielotax® — A-9 Kidney Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator containing A-9, a natural peptide complex obtained from kidney tissue.",
    ingredients: ["Primary ingredient: A-9 kidney-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Kidneys & fluid balance",
      body: "The kidneys filter the blood many times a day, removing waste into the urine and keeping water, salts and blood pressure in balance. They also play a part in red blood cell production and bone health. Pielotax's tissue association places it within the broader research context of kidney cell activity, filtration and fluid balance. This association does not establish that taking the product changes kidney function or any kidney test result.",
    },
    about:
      "Pielotax contains A-9, a naturally derived peptide complex obtained from the kidneys of young animals. It is one of the Khavinson Cytomax formulas, each associated with a single organ. Pielotax relates to the kidneys, which filter the blood; Chitomur relates to the bladder, which stores urine.",
    manufacturerDirections: {
      source: brochure(46, "Take 1-2 capsules or tablets of PIELOTAX® 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "The Khavinson program has investigated kidney tissue peptides and kidney cell activity in laboratory models, along with how kidney tissue changes with age. Laboratory findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Pielotax's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Pielotax is not presented as a treatment for kidney disease, kidney stones, urinary infections or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 46 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 46 quoted.",
    ],
  },

  sigumir: {
    title: "Sigumir® — A-4 Cartilage and Bone Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator centered on A-4, a natural peptide complex obtained from cartilage and bone tissue.",
    ingredients: ["Primary ingredient: A-4 cartilage and bone-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Cartilage, bone, joints & spine",
      body: "Cartilage cushions the joints and the spine, while bone gives the body its structure and stores minerals. Both are living tissues that renew slowly and respond to movement, load and age. Sigumir's tissue association places it within the broader research context of cartilage and bone cell activity. This association does not establish that taking the product changes joint comfort, mobility or bone density.",
    },
    about:
      "Sigumir contains A-4, a naturally derived peptide complex isolated from cartilage and bone tissue. The manufacturer associates it with the function of the joints and the spine. It is the natural, tissue-derived Khavinson Cytomax formula for this tissue group; Cartalax is a Khavinson Cytogen formula with a synthetic cartilage peptide complex (AC-4).",
    manufacturerDirections: { line: LINE },
    research:
      "Khavinson researchers have studied cartilage and bone peptides and the activity of these cells in laboratory models, along with joint and spine mobility and tissue renewal with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Sigumir's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Sigumir is not presented as a treatment for osteoarthritis, osteoporosis, back conditions or other musculoskeletal conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "\"See your package\" page: no general directions. product-facts.json \"conflicting\"; brochure p. 54 gives only condition-specific regimens (osteoarthritis, osteochondrosis, osteoporosis), not published.",
    ],
  },

  stamakort: {
    title: "Stamakort® — A-10 Stomach Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator containing A-10, a natural peptide complex obtained from the stomach lining.",
    ingredients: ["Primary ingredient: A-10 stomach-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Stomach lining & digestion",
      body: "The stomach breaks food down with acid and enzymes, and its inner lining protects the stomach wall from that acid while constantly renewing itself. Stamakort's tissue association places it within the broader research context of gastric cell activity and renewal of the stomach lining. This association does not establish that taking the product changes digestion, stomach acid or digestive comfort.",
    },
    about:
      "Stamakort contains A-10, a naturally derived peptide complex obtained from the gastric mucosa (stomach lining) of young animals. As a Khavinson Cytomax formula, it is associated with one tissue, and its listed composition contains no digestive enzymes or other active ingredients besides that complex.",
    manufacturerDirections: {
      source: brochure(58, "Take 1-2 capsules or tablets of STAMAKORT® 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Khavinson research has examined stomach-lining peptides and gastric cell activity in laboratory models, including renewal of the stomach's protective lining and digestive function with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Stamakort's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Stamakort is not presented as a treatment for gastritis, ulcers, reflux or other digestive conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 58 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 58 quoted.",
    ],
  },

  suprefort: {
    title: "Suprefort® — A-1 Pancreas Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator built on A-1, a natural peptide complex isolated from pancreas tissue.",
    ingredients: ["Primary ingredient: A-1 pancreas-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Pancreas: digestion & metabolism",
      body: "The pancreas has two roles. It releases digestive enzymes into the intestine to break down fats, proteins and carbohydrates, and it produces hormones, including insulin, that help the body use energy from food. Suprefort's tissue association places it within the broader research context of pancreatic cell activity and metabolic function. This association does not establish that taking the product changes blood sugar, insulin or digestive enzyme levels.",
    },
    about:
      "Suprefort contains A-1, a naturally derived peptide complex isolated from the pancreas. It is part of the Khavinson Cytomax collection of single-tissue peptide formulas, and the pancreas complex is its only listed active ingredient.",
    manufacturerDirections: { line: LINE },
    compareIntro:
      "Revilab ML 06 and Revilab SL 05 are related combination formulations containing pancreas-associated peptide ingredients. Unlike Suprefort, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Researchers in the Khavinson program have studied pancreas tissue peptides and pancreatic cell activity in laboratory models, with interest in digestive enzyme production and metabolic function with age. Laboratory findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Suprefort's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Suprefort is not presented as a treatment for diabetes, pancreatitis or other pancreatic, digestive or metabolic conditions, and it is not a substitute for insulin or other prescribed medication. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "\"See your package\" page: no directions. product-facts.json \"conflicting\"; brochure p. 62 prints no directions for Suprefort.",
    ],
  },

  svetinorm: {
    title: "Svetinorm® — A-7 Liver Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator centered on A-7, a natural peptide complex obtained from liver tissue.",
    ingredients: ["Primary ingredient: A-7 liver-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Liver & metabolism",
      body: "The liver processes nutrients from food, stores energy, makes proteins and bile, and clears substances the body no longer needs. Diet, alcohol, medication and age all place demands on it. Svetinorm's tissue association places it within the broader research context of liver cell activity and metabolic pathways. This association does not establish that taking the product protects the liver or changes liver function or liver test results.",
    },
    about:
      "Svetinorm contains A-7, a naturally derived peptide complex obtained from liver tissue. It belongs to the Khavinson Cytomax collection of tissue-derived complexes. Several Revilab combination formulas also list a liver peptide complex alongside other ingredients; Svetinorm contains the liver complex on its own.",
    manufacturerDirections: {
      source: brochure(50, "It is recommended to take SVETINORM® 10-15 minutes before meals, 1-2 tablets or capsules 2-3 times a day for 15-20 days. It is advisable to repeat the course in 3 - 6 months."),
      line: LINE,
    },
    compareIntro:
      "Revilab ML 01, Revilab ML 02, Revilab ML 06 and Revilab SL 05 are related combination formulations containing liver-associated peptide ingredients. Unlike Svetinorm, these products combine multiple ingredients within a single formulation. Compare their verified ingredients, quantities, and manufacturer directions to understand the differences. A shared tissue association does not establish identical composition or effects.",
    research:
      "Khavinson research on liver tissue peptides has looked at liver cell activity in laboratory models, metabolic pathways in the liver and how liver tissue changes with age. Findings from this laboratory work do not necessarily establish clinical benefits for the finished product. Evidence establishing Svetinorm's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Svetinorm is not presented as a treatment for liver disease, hepatitis, fatty liver or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Directions: product-facts.json \"conflicting\". Brochure p. 50 quoted as an excerpt (dosing sentences only; the same block lists disease uses including cancer patients after radiation or chemotherapy, not reproduced). Its 2-3×/day, 15-20 days, before meals differs from the storefront text. Julia to confirm.",
    ],
  },

  taxorest: {
    title: "Taxorest® — A-19 Bronchial Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator containing A-19, a natural peptide complex obtained from bronchial tissue.",
    ingredients: ["Primary ingredient: A-19 bronchial tissue-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Bronchi & airway lining",
      body: "The bronchi are the branching airways that carry air from the windpipe into the lungs. Their lining produces mucus and moves it along with tiny hair-like cells, trapping dust and particles before they reach deeper into the lungs. Taxorest's tissue association places it within the broader research context of airway lining cells and the natural clearing function of the airways. This association does not establish that taking the product changes breathing or protects the airways.",
    },
    about:
      "Taxorest contains A-19, a naturally derived peptide complex obtained from the bronchial mucosa of young animals. It is one of the Khavinson Cytomax formulas, each associated with a single tissue, and the bronchial complex is its only listed active ingredient.",
    manufacturerDirections: {
      source: brochure(66, "Instructions for TAXOREST®: take 1-2 capsules or tablets 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "The Khavinson program has investigated bronchial tissue peptides and airway lining cells in laboratory models, as well as how the respiratory lining changes with age and environmental exposure. This research does not necessarily establish clinical benefits for the finished product. Evidence establishing Taxorest's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Taxorest is not presented as a treatment for asthma, bronchitis, COPD, respiratory infections or other respiratory conditions, and it is not a substitute for inhalers or other prescribed medication. ${REVIEW}`,
    dosageCourse: true,
    flags: ["product-facts.json marks directions \"conflicting\"; brochure p. 66 quoted. Brochure prints no per-capsule amount for Taxorest."],
  },

  testoluten: {
    title: "Testoluten® — A-13 Testicular Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator for men, built on A-13, a natural peptide complex obtained from testicular tissue.",
    ingredients: ["Primary ingredient: A-13 testicular tissue-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Testes & male reproductive system",
      body: "The testes produce sperm and most of the body's testosterone, a hormone involved in energy, muscle, bone, libido and mood. Testicular activity tends to change gradually with age. Testoluten's tissue association places it within the broader research context of testicular cell activity and male reproductive function. This association does not establish that taking the product raises testosterone or changes fertility or sexual function.",
    },
    about:
      "Testoluten contains A-13, a naturally derived peptide complex obtained from the testes of young animals. It belongs to the Khavinson Cytomax collection of single-tissue formulas. Testoluten relates to the testes, while Libidon, another Cytomax formula for men, relates to the prostate.",
    manufacturerDirections: {
      source: brochure(71, "It is recommended to take TESTOLUTEN® 1-2 capsules or tablets 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Khavinson researchers have studied testicular tissue peptides and cell activity in laboratory models, along with male reproductive and hormonal function with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Testoluten's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Testoluten is not presented as a treatment for low testosterone, infertility, erectile dysfunction or other medical conditions, and it is not a substitute for prescribed hormone therapy. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 71 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 71 quoted. Julia's \"10–20 days / 1–2 months\" pack wording (pf-endoluten 6c6f34a) is not used.",
    ],
  },

  thyreogen: {
    title: "Thyreogen® — A-2 Thyroid Gland Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator centered on A-2, a natural peptide complex obtained from thyroid gland tissue.",
    ingredients: ["Primary ingredient: A-2 thyroid gland-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Thyroid gland & metabolism",
      body: "The thyroid is a butterfly-shaped gland at the front of the neck. Its hormones set the pace of metabolism, influencing how quickly the body uses energy and keeps warm, as well as heart rate and mood. Thyreogen's tissue association places it within the broader research context of thyroid cell activity and metabolic regulation. This association does not establish that taking the product changes thyroid hormone levels or metabolism.",
    },
    about:
      "Thyreogen contains A-2, a naturally derived peptide complex obtained from thyroid gland tissue. It is part of the Khavinson Cytomax collection, and the thyroid complex is its only listed active ingredient.",
    manufacturerDirections: { line: LINE },
    research:
      "The Khavinson program has looked at thyroid tissue peptides and thyroid cell activity in laboratory models, and at how hormone-producing tissue changes with age. This research does not necessarily establish clinical benefits for the finished product. Evidence establishing Thyreogen's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Thyreogen is not presented as a treatment for hypothyroidism, hyperthyroidism, goiter or other thyroid conditions, and it is not a substitute for prescribed thyroid medication. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "\"See your package\" page: no directions shown. product-facts.json \"conflicting\"; the brochure p. 75 block is written as thyroid-disease recommendations (\"course of treatment\", endemic areas), so it is not quoted.",
    ],
  },

  ventfort: {
    title: "Ventfort® — A-3 Vascular Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator containing A-3, a natural peptide complex obtained from blood-vessel wall tissue.",
    ingredients: ["Primary ingredient: A-3 vascular tissue-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Blood vessels & circulation",
      body: "Blood vessels carry blood to every organ. Their walls need to stay flexible, and their inner lining helps control blood flow and the passage of nutrients into tissues; vessel walls naturally stiffen with age. Ventfort's tissue association places it within the broader research context of vessel-wall cells and vascular tone. This association does not establish that taking the product changes blood pressure, circulation or vessel health.",
    },
    about:
      "Ventfort contains A-3, a naturally derived peptide complex obtained from the blood vessels of young animals. It is the Khavinson Cytomax formula associated with the vascular system. Vesugen is a Khavinson Cytogen formula with a synthetic vascular peptide complex (AC-2), and Chelohart relates to the heart muscle rather than the vessels.",
    manufacturerDirections: {
      source: brochure(15, "It is recommended to take 1-2 capsules of Ventfort® 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Khavinson researchers have examined vascular tissue peptides and vessel-wall cells in laboratory models, along with circulation and how blood vessels change with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Ventfort's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Ventfort is not presented as a treatment for high blood pressure, varicose veins, atherosclerosis or other vascular conditions, and it is not a substitute for prescribed medication. ${REVIEW}`,
    dosageCourse: true,
    flags: ["product-facts.json marks directions \"conflicting\"; brochure p. 15 quoted (release form: 20 or 60 capsules of 0.2 g; no per-capsule peptide amount)."],
  },

  visoluten: {
    title: "Visoluten® — A-11 Eye Tissue Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator built on A-11, a natural peptide complex obtained from eye tissue.",
    ingredients: ["Primary ingredient: A-11 eye tissue-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Eyes & visual tissue",
      body: "The eyes turn light into signals the brain can read. The retina at the back of the eye is packed with light-sensitive cells that work constantly and need a steady supply of nutrients and oxygen. Visoluten's tissue association places it within the broader research context of retinal cell activity and visual function. This association does not establish that taking the product improves eyesight or protects the eyes.",
    },
    about:
      "Visoluten contains A-11, a naturally derived peptide complex obtained from the eye tissues of young animals; the manufacturer's description refers to tissues of the retina, lens and cornea. It is part of the Khavinson Cytomax collection, and the eye tissue complex is its only listed active ingredient.",
    manufacturerDirections: {
      source: brochure(20, "VISOLUTEN® instructions: 1-2 capsules or tablets of VISOLUTEN® 1-3 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "The Khavinson program has studied eye tissue peptides and retinal cell activity in laboratory models, along with visual function and how eye tissue changes with age. Laboratory findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Visoluten's effectiveness and long-term safety in humans remains limited.",
    importantInformation:
      "Visoluten is not presented as a treatment for macular degeneration, cataracts, glaucoma, retinal disease or other eye conditions. Review the complete product label and consult a qualified healthcare professional, such as your eye-care professional, before use.",
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 20 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 20 quoted (1-3×/day differs from the 1–2×/day storefront text).",
    ],
  },

  vladonix: {
    title: "Vladonix® — A-6 Thymus Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator containing A-6, a natural peptide complex obtained from thymus tissue.",
    ingredients: ["Primary ingredient: A-6 thymus-derived peptide complex.", FOCUSED],
    biologicalFocus: {
      heading: "Thymus & immune system",
      body: "The thymus is a small gland behind the breastbone where T cells, a key type of immune cell, mature. It is most active in childhood and gradually shrinks with age, one reason immune responses change over a lifetime. Vladonix's tissue association places it within the broader research context of immune-cell activity and the ageing thymus. This association does not establish that taking the product changes immune function or immune-cell counts.",
    },
    about:
      "Vladonix contains A-6, a naturally derived peptide complex that the manufacturer's brochure describes as isolated from the thymus of calves aged 6–12 months. It belongs to the Khavinson Cytomax collection. Crystagen, a Khavinson Cytogen formula, also relates to the thymus and immune system but uses a synthetic peptide complex; Bonomarlot relates to the bone marrow, where blood cells are made.",
    manufacturerDirections: { line: LINE },
    research:
      "Khavinson research has examined thymus peptides and immune-cell activity in laboratory models, the balance between different immune-cell populations and how the thymus changes with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Vladonix's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Vladonix is not presented as a treatment for immune deficiencies, autoimmune conditions, infections or other medical conditions. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "\"See your package\" page: no directions shown. product-facts.json \"conflicting\"; brochure p. 24 contradicts itself (\"taken for 10-20 days\" and \"The duration of admission is 30 days\"), so it is not quoted.",
    ],
  },

  zhenoluten: {
    title: "Zhenoluten® — A-15 Ovarian Peptide Complex",
    subline: SUBLINE,
    snapshot: "A Khavinson Cytomax peptide bioregulator for women, centered on A-15, a natural peptide complex obtained from ovarian tissue.",
    ingredients: ["Primary ingredient: A-15 ovarian tissue-derived peptide complex (natural extract).", FOCUSED],
    biologicalFocus: {
      heading: "Ovaries & female reproductive system",
      body: "The ovaries produce eggs and the hormones estrogen and progesterone, which shape the menstrual cycle and affect bone, skin, mood and energy. Ovarian activity changes considerably over a woman's life, especially around menopause. Zhenoluten's tissue association places it within the broader research context of ovarian cell activity and female hormonal balance. This association does not establish that taking the product changes hormone levels, fertility or the menopausal transition.",
    },
    about:
      "Zhenoluten contains A-15, a naturally derived peptide complex obtained from the ovaries of young animals. It is part of the Khavinson Cytomax collection of single-tissue formulas, and the ovarian complex is its only listed active ingredient.",
    manufacturerDirections: {
      source: brochure(37, "It is recommended to take ZHENOLUTEN® 1-2 capsules or tablets 1-2 times a day with meals. The duration of admission is 30 days. It is advisable to repeat the course in 4-6 months."),
      line: LINE,
    },
    research:
      "Khavinson researchers have studied ovarian tissue peptides and ovarian cell activity in laboratory models, along with female hormonal balance across life stages and how reproductive tissue changes with age. These findings do not necessarily establish clinical benefits for the finished product. Evidence establishing Zhenoluten's effectiveness and long-term safety in humans remains limited.",
    importantInformation: `Zhenoluten is not presented as a treatment for menopausal symptoms, infertility, hormonal disorders or other medical conditions, and it is not a substitute for prescribed hormone therapy. ${REVIEW}`,
    dosageCourse: true,
    flags: [
      "Amount per capsule not published: brochure p. 37 prints 10 mg per capsule or tablet; not verified.",
      "product-facts.json marks directions \"conflicting\"; brochure p. 37 quoted.",
    ],
  },
};
