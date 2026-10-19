/**
 * Editorial copy for the list + body-system pages, verbatim from
 * seo-audit/list-and-category-copy.md (draft for Julia's review), with these edits only:
 *  - Pineal & Eyes pages dropped (SEO Director, 2026-10-19).
 *  - Joints intro: the Calsil-T clause removed (on hold; never shown).
 *  - List-page title shortened to 60 chars or fewer (copy's was 63); Muscle and Men's use the copy's short alternatives.
 *  - Thyroid & Adrenal renamed Endocrine Glands (Julia, 2026-10-19, the copy's option): Bonothyrk cross-listed;
 *    paragraph 2 gains a Bonothyrk sentence (from the joints copy), "two" -> "three"; meta adapted. Editorial to confirm.
 *  - /learn/cytomaxes-vs-cytogens (301) points at its destination anchor.
 * Intro paragraphs may contain [text](/path) links. An asterisk marks a structure/function claim (DSHEA note under the intro).
 */
export type PageCopy = { title: string; origTitle: string; meta: string; h1: string; intro: string[] };

export const DSHEA_DISCLAIMER =
  "*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export const CATEGORY_COPY: Record<string, PageCopy> = {
  "/khavinson-peptides-list": {
    "title": "Khavinson Peptides List: Bioregulators by Organ | Pure Fire",
    "origTitle": "Khavinson Peptides List: All Bioregulators by Organ | Pure Fire",
    "meta": "Every Khavinson peptide bioregulator we carry, listed by organ and complex code (A-5, A-8…), with what each is formulated to support. Oral formulas.",
    "h1": "Khavinson Peptides List",
    "intro": [
      "This page lists every Khavinson peptide bioregulator Pure Fire carries in one place, grouped by the organ or body system it's formulated for. Use it to compare products side by side before you open a product page.",
      "The products fall into two families. Cytomax® bioregulators are peptide complexes extracted from the matching animal tissue, and each has an A-code (Cerluten is A-5, Endoluten is A-8). Cytogen® bioregulators are short peptides synthesized to match those complexes, and they have AC-codes (Pinealon is AC-5). The code tells you which tissue a complex is linked to, so products with a matching number belong together. Below them you'll find multi-peptide complexes and nutritional formulas, each listed with the systems its own description names.",
      "Some early Khavinson research used injected preparations. Everything sold here is taken by mouth, and findings from injected forms shouldn't be assumed to apply to oral products. Each entry is described only as formulated to support normal function of its target tissue.* For background, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ]
  },
  "/products/system/brain-nervous-system": {
    "title": "Brain & Nervous System Peptide Bioregulators | Pure Fire",
    "origTitle": "Brain & Nervous System Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal brain and nervous-system function, including Cerluten (A-5) and Pinealon (AC-5). Oral formulas.",
    "h1": "Brain & Nervous System Peptide Bioregulators",
    "intro": [
      "Your brain and nerves carry signals between every part of the body. They coordinate movement, attention and the steady background work you never notice. The bioregulators on this page are formulated to support normal function of that nervous tissue.*",
      "Cerluten (A-5) is the Cytomax® option, a peptide complex drawn from brain tissue. Pinealon (AC-5) is its Cytogen® counterpart, a short synthesized peptide that shares the number 5. If you want a single-tissue product, start with these two. Choose Cytomax if you prefer a natural tissue extract and Cytogen if you prefer a defined synthetic peptide.",
      "Below them are multi-ingredient options: Prime Peptide Brain, the Revilab ML and SL formulas, Felicita, Mesotel, Mesotel Neo and Ensil. These combine peptides with other nutrients, so compare the ingredient lists and the format (capsule or lingual) on each product page. To see how a nervous-system product fits with the rest of your routine, read [peptides in context: a systems view](/learn/peptides-in-context-systems-view)."
    ]
  },
  "/products/system/immune-thymus": {
    "title": "Immune & Thymus Peptide Bioregulators | Pure Fire",
    "origTitle": "Immune & Thymus Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal immune and thymus function, including Vladonix (A-6) and Crystagen (AC-6). Oral formulas.",
    "h1": "Immune & Thymus Peptide Bioregulators",
    "intro": [
      "The thymus is a gland behind the breastbone where certain immune cells mature. Along with the rest of the immune system, it helps the body tell its own cells from outside invaders. The bioregulators here are formulated to support normal immune and thymus function.*",
      "Vladonix (A-6) is a Cytomax® complex drawn from thymus tissue. Crystagen (AC-6) is the Cytogen® version, made of short synthesized peptides that share the number 6. Choose Cytomax if you prefer a tissue extract and Cytogen if you prefer a defined peptide sequence.",
      "The complexes and supplements below include Prime Peptide Omega, Revilab ML 02 and SL 07, Imusil, Revifort, Zinsil-T and Reviplant. Many mix peptides with vitamins, minerals or plant extracts. Compare the ingredient panels and decide whether you want a standalone bioregulator or a broader formula. For the basics behind the codes, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ]
  },
  "/products/system/heart-blood-vessels": {
    "title": "Heart & Blood Vessels Peptide Bioregulators | Pure Fire",
    "origTitle": "Heart & Blood Vessels Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal heart and blood-vessel function, incl. Chelohart (A-14), Ventfort (A-3), Vesugen (AC-2).",
    "h1": "Heart & Blood Vessels Peptide Bioregulators",
    "intro": [
      "The heart pumps blood through a network of vessels that carries oxygen and nutrients to every tissue. This page brings together products formulated to support normal heart and blood-vessel function.*",
      "There are two Cytomax® complexes. Chelohart (A-14) is drawn from heart tissue, and Ventfort (A-3) from blood-vessel tissue. Vesugen (AC-2) is a Cytogen® short peptide that targets the vessels. Codes with different numbers point to different tissues, so read the code before you choose. Pick Chelohart if you want a product for heart tissue, and Ventfort or Vesugen if you want one for the vessels.",
      "Revilab ML 04, Revilab SL 01 and Complex 3R combine peptides with other nutrients for a broader approach. Check each product page for format and course length. To see how vessel and heart products relate to the whole-body view, read [peptides in context: a systems view](/learn/peptides-in-context-systems-view)."
    ]
  },
  "/products/system/liver-digestive": {
    "title": "Liver, Stomach & Digestion Peptide Bioregulators | Pure Fire",
    "origTitle": "Liver, Stomach & Digestion Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal liver and digestive function, incl. Svetinorm (A-7), Ovagen (AC-3), Stamakort (A-10).",
    "h1": "Liver, Stomach & Digestion Peptide Bioregulators",
    "intro": [
      "Digestion is a team effort. The stomach breaks food down, the pancreas supplies enzymes, and the liver processes what is absorbed. Each organ has its own bioregulator here, all formulated to support normal digestive and liver function.*",
      "The Cytomax® complexes are Svetinorm (A-7) from liver tissue, Stamakort (A-10) from stomach tissue and Suprefort (A-1) from pancreas tissue. Ovagen (AC-3) is a Cytogen® short peptide aimed at the liver and the digestive tract. Because each code maps to a different organ, choose by the tissue you want to focus on rather than by the page as a whole.",
      "Revilab ML 06 and SL 05, Likam, Pangluin, Digemax, Getrufline and Volustom are broader formulas. Some combine peptides with plant extracts or dietary fibre. Compare the ingredients, the format and whether you prefer a single-organ product or a combination. For how the two bioregulator families differ, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ]
  },
  "/products/system/kidney-bladder": {
    "title": "Kidney & Bladder Peptide Bioregulators | Pure Fire",
    "origTitle": "Kidney & Bladder Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal kidney and bladder function, including Pielotax (A-9) and Chitomur (A-12). Oral formulas.",
    "h1": "Kidney & Bladder Peptide Bioregulators",
    "intro": [
      "The kidneys filter the blood and balance fluids, and the bladder stores what they remove. The products here are formulated to support normal kidney and bladder function.*",
      "Both bioregulators are Cytomax® complexes. Pielotax (A-9) is drawn from kidney tissue, and Chitomur (A-12) from bladder tissue. Their codes mark them as two separate organ complexes. Choose by the organ you want to focus on, or look at both if you want to cover the whole urinary tract.",
      "Revilab SL 08 and Renefort are broader formulas that combine peptides with other ingredients. Revilab SL is a lingual format, so check each product page for the format and course length. To learn how the A-codes are organized, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ]
  },
  "/products/system/lungs-airways": {
    "title": "Lungs & Airways Peptide Bioregulators | Pure Fire",
    "origTitle": "Lungs & Airways Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal lung and airway function, including Taxorest (A-19) and Chonluten (AC-7). Oral formulas.",
    "h1": "Lungs & Airways Peptide Bioregulators",
    "intro": [
      "With every breath, air travels through the airways into the lungs, where oxygen passes into the blood. This page collects products formulated to support normal lung and airway function.*",
      "Taxorest (A-19) is a Cytomax® complex drawn from bronchial tissue. Chonluten (AC-7) is a Cytogen® short peptide aimed at the lungs and bronchi. One is a natural tissue extract and the other a defined synthesized sequence, so choose the one that fits how you like to approach bioregulators.",
      "The broader formulas are Revilab ML 05 and SL 06, Alvenorm Forte and Rinolax. They pair peptides with other ingredients, and the formats vary. Compare the ingredient lists and course lengths on each product page. To see how a lung-focused product fits a whole-body routine, read [peptides in context: a systems view](/learn/peptides-in-context-systems-view)."
    ]
  },
  "/products/system/joints-bones-cartilage": {
    "title": "Joints, Bones & Cartilage Peptide Bioregulators | Pure Fire",
    "origTitle": "Joints, Bones & Cartilage Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal joint, bone and cartilage function, incl. Sigumir (A-4), Cartalax (AC-4), Bonothyrk (A-21).",
    "h1": "Joints, Bones & Cartilage Peptide Bioregulators",
    "intro": [
      "Bones give the body its frame, cartilage cushions the joints, and the parathyroid glands help regulate the calcium bone depends on. The products here are formulated to support normal joint, bone and cartilage function.*",
      "Sigumir (A-4) is a Cytomax® complex drawn from cartilage and bone tissue. Cartalax (AC-4) is its Cytogen® counterpart, made of short synthesized peptides that share the number 4. Bonothyrk (A-21) is a Cytomax® parathyroid complex. Its own description says it's believed to support parathyroid function and the body's calcium balance, which is why it's listed here.*",
      "The supplements are Prime Peptide Joints, Revilab ML 09 and SL 04. Choose a single-tissue bioregulator if you want a focused product, or a combination formula for a wider range of ingredients. To read about the bioregulator families, see [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ]
  },
  "/products/system/muscle": {
    "title": "Muscle Peptide Bioregulators | Pure Fire Nutritional",
    "origTitle": "Muscle & Physical Performance Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal muscle function, including Gotratix (A-18), plus Revilab SL 04, Levain and Reviform Cocktail.",
    "h1": "Muscle & Physical Performance Peptide Bioregulators",
    "intro": [
      "Skeletal muscle powers every movement, from walking to lifting, and relies on a steady supply of protein and energy. The products here are formulated to support normal muscle function and an active lifestyle.*",
      "Gotratix (A-18) is the Cytomax® bioregulator on this page, a peptide complex drawn from muscle tissue. Its A-code places it in the same organ-specific series as the other Khavinson complexes. If you want a focused, single-tissue product, start with it.",
      "Revilab SL 04 is a lingual peptide formula. Levain and Reviform Cocktail add nutritional support, and Reviform Cocktail is a protein, vitamin and mineral shake. Choose between a peptide-only product and a nutrition-based one depending on your routine. For the bigger picture, read [peptides in context: a systems view](/learn/peptides-in-context-systems-view)."
    ]
  },
  "/products/system/endocrine-glands": {
    "title": "Endocrine Glands Peptide Bioregulators | Pure Fire",
    "origTitle": "Thyroid & Adrenal Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal endocrine gland function, incl. Thyreogen (A-2), Glandokort (A-17), Bonothyrk (A-21).",
    "h1": "Endocrine Glands Peptide Bioregulators",
    "intro": [
      "The thyroid in the neck and the adrenal glands above the kidneys release hormones that help set the body's pace and its response to everyday demands. The bioregulators here are formulated to support normal thyroid and adrenal function.*",
      "All three are Cytomax® complexes. Thyreogen (A-2) is drawn from thyroid tissue, and Glandokort (A-17) from adrenal tissue. Bonothyrk (A-21) is a Cytomax® parathyroid complex; its own description says it's believed to support parathyroid function and the body's calcium balance.* Different code numbers mean different glands, so choose the gland you want to focus on, or look at both for broader endocrine support.",
      "No combination formula on our shelves names these glands specifically, so this page lists the three single-tissue products. Each product page shows its format and course length. To compare the bioregulator families, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ]
  },
  "/products/system/blood-bone-marrow": {
    "title": "Blood & Bone Marrow Peptide Bioregulators | Pure Fire",
    "origTitle": "Blood & Bone Marrow Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal blood and bone-marrow function, including Bonomarlot (A-20) and Revimite. Oral formulas.",
    "h1": "Blood & Bone Marrow Peptide Bioregulators",
    "intro": [
      "Bone marrow is the soft tissue inside bones where new blood cells are made, and it keeps the body's blood supply renewed. This page lists products formulated to support normal blood and bone-marrow function.*",
      "Bonomarlot (A-20) is the Cytomax® bioregulator here, a peptide complex drawn from bone-marrow tissue. Like the other A-codes, its number links it to a single tissue in the Khavinson series. If you want one focused product, choose it.",
      "Revilab ML 02, Revilab SL 07 and Revimite are combination formulas, and the two Revilab products also appear on the immune page. Compare the format and ingredients on each product page before choosing a standalone or blended option. To learn how these bioregulators are made and coded, read [what Khavinson peptide bioregulators are](/learn/what-are-khavinson-peptide-bioregulators)."
    ]
  },
  "/products/system/womens-health": {
    "title": "Women's Hormonal Balance Peptide Bioregulators | Pure Fire",
    "origTitle": "Women's Hormonal Balance Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support women's normal hormonal balance, including Zhenoluten (A-15), GPL Femme and Mamiton. Oral formulas.",
    "h1": "Women's Hormonal Balance Peptide Bioregulators",
    "intro": [
      "The ovaries and related tissues produce hormones that shift naturally across each month and over the years. This page brings together products formulated to support women's normal hormonal balance.*",
      "Zhenoluten (A-15) is the Cytomax® bioregulator here, a peptide complex drawn from ovarian tissue. Its code places it among the organ-specific Khavinson complexes. If you want a single-tissue product, start with it.",
      "GPL Femme, Mamiton, Revilab ML 08 and Revilab SL 10 are broader formulas that combine peptides with other ingredients. Compare the ingredient lists, the formats and the course lengths on each product page, and choose between a standalone or blended approach. To see what the research on oral forms has and hasn't looked at, read [the oral evidence review for women's bioregulators](/learn/khavinson-bioregulators-perimenopause-oral-evidence)."
    ]
  },
  "/products/system/mens-health": {
    "title": "Men's Wellness Peptide Bioregulators | Pure Fire",
    "origTitle": "Men's Reproductive Wellness Peptide Bioregulators | Pure Fire",
    "meta": "Khavinson peptide bioregulators formulated to support normal male reproductive function, including Testoluten (A-13) and Libidon (A-16). Oral formulas.",
    "h1": "Men's Reproductive Wellness Peptide Bioregulators",
    "intro": [
      "The male reproductive system, including the testes and the prostate, produces hormones and supports reproductive health throughout adult life. The products here are formulated to support normal male reproductive function.*",
      "Both bioregulators are Cytomax® complexes. Testoluten (A-13) is drawn from testicular tissue, and Libidon (A-16) from prostate tissue. Their codes point to two different tissues, so choose by focus or consider both.",
      "GPL Man, Revilab ML 07 and Revilab SL 09 are combination formulas that blend peptides with other ingredients. The capsule ML and lingual SL formats differ, so check each product page for the format and course length. To compare tissue-extract and synthesized bioregulators, read [Cytomax vs Cytogen](/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens)."
    ]
  }
};
