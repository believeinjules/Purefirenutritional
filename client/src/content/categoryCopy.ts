/**
 * Copy for the Shop browse pages. Entries with `review: true` are NEW short,
 * plain intros (no disease claims) written for Julia to review; the others
 * reuse Editorial's copy from seo-audit/list-and-category-copy.md (see `source`).
 * Intro paragraphs may contain [text](/path) links. An asterisk marks a
 * structure/function statement (DSHEA note under the intro).
 */
export type PageCopy = {
  name: string;
  title: string;
  meta: string;
  h1: string;
  intro: string[];
  /** true = new copy, pending Julia's review. */
  review: boolean;
  source: string;
};

export const DSHEA_DISCLAIMER =
  "*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export const CATEGORY_COPY: Record<string, PageCopy> = {
  "/khavinson-peptides-list": {
    "name": "Khavinson Peptides List",
    "title": "Khavinson Peptides List: Bioregulators by Organ | Pure Fire",
    "meta": "Every Khavinson peptide bioregulator we carry, listed by organ and complex code (A-5, A-8…), with what each is formulated to support. Oral formulas.",
    "h1": "Khavinson Peptides List",
    "intro": [
      "This page lists every Khavinson peptide bioregulator Pure Fire carries in one place, grouped by the organ or body system it's formulated for. Use it to compare products side by side before you open a product page.",
      "The products fall into two families. Cytomax® bioregulators are peptide complexes extracted from the matching animal tissue, and each has an A-code (Cerluten is A-5, Endoluten is A-8). Cytogen® bioregulators are short peptides synthesized to match those complexes, and they have AC-codes (Pinealon is AC-5). The code tells you which tissue a complex is linked to, so products with a matching number belong together. Below them you'll find multi-peptide complexes and nutritional formulas, each listed with the systems its own description names.",
      "Some early Khavinson research used injected preparations. Everything sold here is taken by mouth, and findings from injected forms shouldn't be assumed to apply to oral products. Each entry is described only as formulated to support normal function of its target tissue.* For background, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ],
    "review": false,
    "source": "Editorial copy (list-and-category-copy.md)"
  },
  "/products/system": {
    "name": "Shop by Body System",
    "title": "Shop Peptide Bioregulators by Body System | Pure Fire",
    "meta": "Browse Khavinson peptide bioregulators and supplements by body system, from brain and heart to digestion and joints. Authorized U.S. retailer.",
    "h1": "Shop by Body System",
    "intro": [
      "Each tile below gathers the products whose own descriptions name that part of the body. A product can appear in more than one group when its description covers more than one system.",
      "Khavinson Cytomax® and Cytogen® bioregulators are listed first on each page, followed by complexes and nutritional formulas. For every product in one table, see the [Khavinson peptides list](/khavinson-peptides-list)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/system/brain-nervous-system": {
    "name": "Brain & Nervous System",
    "title": "Brain & Nervous System Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal brain and nervous-system function, including Cerluten (A-5) and Pinealon (AC-5). Oral formulas.",
    "h1": "Brain & Nervous System Peptide Bioregulators",
    "intro": [
      "Your brain and nerves carry signals between every part of the body. They coordinate movement, attention and the steady background work you never notice. The bioregulators on this page are formulated to support normal function of that nervous tissue.*",
      "Cerluten (A-5) is the Cytomax® option, a peptide complex drawn from brain tissue. Pinealon (AC-5) is its Cytogen® counterpart, a short synthesized peptide that shares the number 5. If you want a single-tissue product, start with these two. Choose Cytomax if you prefer a natural tissue extract and Cytogen if you prefer a defined synthetic peptide.",
      "Below them are multi-ingredient options: Prime Peptide Brain, the Revilab ML and SL formulas, Felicita, Mesotel, Mesotel Neo and Ensil. These combine peptides with other nutrients, so compare the ingredient lists and the format (capsule or lingual) on each product page. To see how a nervous-system product fits with the rest of your routine, read [peptides in context: a systems view](/learn/peptides-in-context-systems-view)."
    ],
    "review": false,
    "source": "Editorial copy (list-and-category-copy.md)"
  },
  "/products/system/heart-circulation": {
    "name": "Heart & Circulation",
    "title": "Heart & Circulation Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal heart and blood-vessel function, incl. Chelohart (A-14), Ventfort (A-3), Vesugen (AC-2).",
    "h1": "Heart & Circulation Peptide Bioregulators",
    "intro": [
      "The heart pumps blood through a network of vessels that carries oxygen and nutrients to every tissue. This page brings together products formulated to support normal heart and blood-vessel function.*",
      "There are two Cytomax® complexes. Chelohart (A-14) is drawn from heart tissue, and Ventfort (A-3) from blood-vessel tissue. Vesugen (AC-2) is a Cytogen® short peptide that targets the vessels. Codes with different numbers point to different tissues, so read the code before you choose. Pick Chelohart if you want a product for heart tissue, and Ventfort or Vesugen if you want one for the vessels.",
      "Revilab ML 04, Revilab SL 01 and Complex 3R combine peptides with other nutrients for a broader approach. Check each product page for format and course length. To see how vessel and heart products relate to the whole-body view, read [peptides in context: a systems view](/learn/peptides-in-context-systems-view)."
    ],
    "review": false,
    "source": "Editorial copy (list-and-category-copy.md), from the Heart & Blood Vessels page; name changed"
  },
  "/products/system/immune-respiratory": {
    "name": "Immune & Respiratory",
    "title": "Immune & Respiratory Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal immune and respiratory function, incl. Vladonix (A-6), Taxorest (A-19), Chonluten (AC-7).",
    "h1": "Immune & Respiratory Peptide Bioregulators",
    "intro": [
      "This page brings together products formulated to support normal immune function and the airways and lungs.*",
      "The Khavinson bioregulators here are Vladonix (A-6) and Crystagen (AC-6), linked to thymus tissue, and Taxorest (A-19) and Chonluten (AC-7), linked to bronchial and lung tissue. Bonomarlot (A-20) is also listed because its own description names the immune system alongside bone marrow.",
      "The complexes and formulas below combine peptides with vitamins, minerals or plant extracts, and formats vary. Compare the ingredients and format on each product page. For background on the codes, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/system/digestion-metabolism": {
    "name": "Digestion & Metabolism",
    "title": "Digestion & Metabolism Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal liver and digestive function, incl. Svetinorm (A-7), Ovagen (AC-3), Stamakort (A-10).",
    "h1": "Digestion & Metabolism Peptide Bioregulators",
    "intro": [
      "Digestion is a team effort. The stomach breaks food down, the pancreas supplies enzymes, and the liver processes what is absorbed. Each organ has its own bioregulator here, all formulated to support normal digestive and liver function.*",
      "The Cytomax® complexes are Svetinorm (A-7) from liver tissue, Stamakort (A-10) from stomach tissue and Suprefort (A-1) from pancreas tissue. Ovagen (AC-3) is a Cytogen® short peptide aimed at the liver and the digestive tract. Because each code maps to a different organ, choose by the tissue you want to focus on rather than by the page as a whole.",
      "Revilab ML 06 and SL 05, Likam, Pangluin, Digemax, Getrufline and Volustom are broader formulas. Some combine peptides with plant extracts or dietary fibre. Compare the ingredients, the format and whether you prefer a single-organ product or a combination. For how the two bioregulator families differ, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ],
    "review": false,
    "source": "Editorial copy (list-and-category-copy.md), from the Liver, Stomach & Digestion page; name changed"
  },
  "/products/system/kidney-bladder": {
    "name": "Kidney & Bladder",
    "title": "Kidney & Bladder Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal kidney and bladder function, including Pielotax (A-9) and Chitomur (A-12). Oral formulas.",
    "h1": "Kidney & Bladder Peptide Bioregulators",
    "intro": [
      "The kidneys filter the blood and balance fluids, and the bladder stores what they remove. The products here are formulated to support normal kidney and bladder function.*",
      "Both bioregulators are Cytomax® complexes. Pielotax (A-9) is drawn from kidney tissue, and Chitomur (A-12) from bladder tissue. Their codes mark them as two separate organ complexes. Choose by the organ you want to focus on, or look at both if you want to cover the whole urinary tract.",
      "Revilab SL 08 and Renefort are broader formulas that combine peptides with other ingredients. Revilab SL is a lingual format, so check each product page for the format and course length. To learn how the A-codes are organized, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ],
    "review": false,
    "source": "Editorial copy (list-and-category-copy.md)"
  },
  "/products/system/bones-joints-muscles": {
    "name": "Bones, Joints & Muscles",
    "title": "Bones, Joints & Muscles Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal bone, joint and muscle function, incl. Sigumir (A-4), Cartalax (AC-4), Gotratix (A-18).",
    "h1": "Bones, Joints & Muscles Peptide Bioregulators",
    "intro": [
      "Bones, cartilage and muscles work together every time you move. The products here are formulated to support normal bone, joint and muscle function.*",
      "Sigumir (A-4) is a Cytomax® complex linked to cartilage and bone tissue, and Cartalax (AC-4) is its Cytogen® counterpart. Bonothyrk (A-21) is a Cytomax® parathyroid complex; its own description says it is believed to support the body's calcium balance.* Gotratix (A-18) is the Cytomax® complex linked to muscle tissue.",
      "Below them are Prime Peptide, Revilab and nutritional formulas. Compare the format and ingredients on each product page. For how the code families differ, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/system/hormonal-reproductive-health": {
    "name": "Hormonal & Reproductive Health",
    "title": "Hormonal & Reproductive Peptide Bioregulators | Pure Fire",
    "meta": "Peptide bioregulators formulated to support normal hormonal and reproductive function, incl. Thyreogen (A-2), Zhenoluten (A-15), Testoluten (A-13).",
    "h1": "Hormonal & Reproductive Health Peptide Bioregulators",
    "intro": [
      "The body's glands, including the thyroid, adrenals, pineal gland and reproductive organs, release hormones that help set its daily pace. This page lists products formulated to support normal glandular and reproductive function.*",
      "The Khavinson Cytomax® complexes here are each linked to one gland or organ: Thyreogen (A-2, thyroid), Glandokort (A-17, adrenal), Bonothyrk (A-21, parathyroid), Endoluten (A-8, pineal), Zhenoluten (A-15) for women, and Testoluten (A-13) and Libidon (A-16) for men.",
      "GPL Femme, GPL Man, Mamiton and the Revilab formulas combine peptides with other ingredients. Check each product page for format and course length. For background, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/system/blood-bone-marrow": {
    "name": "Blood & Bone Marrow",
    "title": "Blood & Bone Marrow Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal blood and bone-marrow function, including Bonomarlot (A-20) and Revimite. Oral formulas.",
    "h1": "Blood & Bone Marrow Peptide Bioregulators",
    "intro": [
      "Bone marrow is the soft tissue inside bones where new blood cells are made, and it keeps the body's blood supply renewed. This page lists products formulated to support normal blood and bone-marrow function.*",
      "Bonomarlot (A-20) is the Cytomax® bioregulator here, a peptide complex drawn from bone-marrow tissue. Like the other A-codes, its number links it to a single tissue in the Khavinson series. If you want one focused product, choose it.",
      "Revilab ML 02, Revilab SL 07 and Revimite are combination formulas, and the two Revilab products also appear on the immune page. Compare the format and ingredients on each product page before choosing a standalone or blended option. To learn how these bioregulators are made and coded, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ],
    "review": false,
    "source": "Editorial copy (list-and-category-copy.md)"
  },
  "/products/collection/khavinson-cytomaxes": {
    "name": "Khavinson Cytomaxes",
    "title": "Khavinson Cytomax® Peptide Bioregulators | Pure Fire",
    "meta": "Every Khavinson Cytomax® peptide bioregulator we carry: natural peptide complexes, each linked to one organ or tissue by its A-code. Oral capsules.",
    "h1": "Khavinson Cytomax® Bioregulators",
    "intro": [
      "Cytomax® bioregulators are peptide complexes extracted from the matching animal tissue. Each carries an A-code that links it to one organ or tissue, for example Cerluten (A-5) for brain tissue.",
      "To compare them with the synthesized Cytogen® line, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/collection/khavinson-cytogens": {
    "name": "Khavinson Cytogens",
    "title": "Khavinson Cytogen® Peptide Bioregulators | Pure Fire",
    "meta": "Every Khavinson Cytogen® peptide bioregulator we carry: short synthesized peptides matched to the Cytomax complexes, with AC-codes. Oral capsules.",
    "h1": "Khavinson Cytogen® Bioregulators",
    "intro": [
      "Cytogen® bioregulators are short peptides synthesized to match the Cytomax® complexes. Each has an AC-code; a matching number means the same target tissue, for example Pinealon (AC-5) and Cerluten (A-5).",
      "To compare the two lines, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/collection/revilab": {
    "name": "Revilab",
    "title": "Revilab ML & SL Peptide Formulas | Pure Fire Nutritional",
    "meta": "The Revilab line: ML capsule and SL lingual peptide formulas, plus Revilab Anti-A.G.E. and Pro Elements. Authorized U.S. retailer.",
    "h1": "Revilab Peptide Formulas",
    "intro": [
      "Revilab formulas combine several peptide complexes with other nutrients. ML products are capsules and SL products are lingual (taken under the tongue), so check the format on each product page.",
      "Each Revilab product is also listed on the body-system page its own description names."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/collection/prime-peptide": {
    "name": "Prime Peptide",
    "title": "Prime Peptide Capsules | Pure Fire Nutritional",
    "meta": "The Prime Peptide line: capsules that pair IPH peptides with other nutrients, for brain, joints, immune, antioxidant and skin support.",
    "h1": "Prime Peptide",
    "intro": [
      "Prime Peptide capsules pair IPH peptide complexes with vitamins, minerals or plant extracts. Each product page lists its peptides and ingredients."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/sleep-daily-rhythms": {
    "name": "Sleep & Daily Rhythms",
    "title": "Sleep & Daily Rhythm Support | Pure Fire Nutritional",
    "meta": "Products formulated to support restful sleep and healthy daily rhythms, including Endoluten (A-8), Prime Peptide Protect, Revilab SL 03 and Zinsil-T.",
    "h1": "Sleep & Daily Rhythms",
    "intro": [
      "These products are formulated to support restful sleep and the body's daily (circadian) rhythm.* Endoluten (A-8) is the Khavinson Cytomax® complex linked to the pineal gland.",
      "If sleep problems last for weeks, talk with your clinician."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/focus-cognition": {
    "name": "Focus & Cognition",
    "title": "Focus & Cognition Support | Pure Fire Nutritional",
    "meta": "Products formulated to support memory, focus and mental clarity, including Cerluten (A-5), Pinealon (AC-5), Prime Peptide Brain and Felicita.",
    "h1": "Focus & Cognition",
    "intro": [
      "These products are formulated to support memory, focus and mental clarity.* For the full nervous-system range, see [Brain & Nervous System](/products/system/brain-nervous-system)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/energy-vitality": {
    "name": "Energy & Vitality",
    "title": "Energy & Vitality Support | Pure Fire Nutritional",
    "meta": "Products whose own descriptions name everyday energy or vitality, including Ensil, Revimite, Levain, Thyreogen (A-2) and NB Activity.",
    "h1": "Energy & Vitality",
    "intro": [
      "Each product here names everyday energy, energy metabolism or vitality in its own description.* Tiredness that lasts more than a few weeks is worth checking with your clinician."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/stress-resilience": {
    "name": "Stress & Resilience",
    "title": "Stress & Resilience Support | Pure Fire Nutritional",
    "meta": "Products formulated to support the body's everyday stress response and resilience, including Glandokort (A-17), Levain, Felicita and Zinsil-T.",
    "h1": "Stress & Resilience",
    "intro": [
      "These products are formulated to support the body's everyday stress response and resilience.* Glandokort (A-17) is the Khavinson Cytomax® complex linked to adrenal tissue.",
      "Compare formats and ingredients on each product page. Low mood that lasts more than two weeks deserves support from a clinician."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/healthy-aging": {
    "name": "Healthy Aging",
    "title": "Healthy Aging Support | Pure Fire Nutritional",
    "meta": "Products whose own descriptions name healthy ageing, including Endoluten (A-8), Vladonix (A-6), Chelohart (A-14), Mesotel and GPL formulas.",
    "h1": "Healthy Aging",
    "intro": [
      "Each product here names healthy ageing in its own description, as part of a long-term routine.* For background on the research, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/recovery-mobility": {
    "name": "Recovery & Mobility",
    "title": "Recovery & Mobility Support | Pure Fire Nutritional",
    "meta": "Products whose own descriptions name recovery, joints, muscle or mobility, including Sigumir (A-4), Cartalax (AC-4) and Gotratix (A-18).",
    "h1": "Recovery & Mobility",
    "intro": [
      "Each product here names recovery, joints, muscle or mobility in its own description.* Sigumir (A-4) and Cartalax (AC-4) are the Khavinson complexes linked to cartilage tissue, and Gotratix (A-18) to muscle tissue.",
      "For the full range, see [Bones, Joints & Muscles](/products/system/bones-joints-muscles)."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  },
  "/products/goal/skin-hair-beauty": {
    "name": "Skin, Hair & Beauty",
    "title": "Skin, Hair & Beauty | Pure Fire Nutritional",
    "meta": "Products whose own descriptions name skin, hair or nails, including Prime Peptide Collagen, Mesotel Beauty, Revilab Anti-A.G.E. and Serum №7.",
    "h1": "Skin, Hair & Beauty",
    "intro": [
      "Each product here names skin, hair or nails in its own description.* Most are taken by mouth; Anti-Wrinkle Serum №7 is a cosmetic serum applied to the skin."
    ],
    "review": true,
    "source": "NEW short intro: Julia to review"
  }
};
