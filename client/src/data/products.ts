import { isHiddenProduct } from "../../../shared/hidden-products.js";
import { applyProductFacts } from "../../../shared/product-facts.js";
import { resolveFulfillment, type Fulfillment } from "../../../shared/fulfillment.js";

export interface ProductVariant {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  image?: string;
  imageAlt?: string;
  images?: string[];
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "PEPTIDE BIOREGULATORS" | "ANTI AGING-LONGEVITY" | "NUTRITIONAL SUPPLEMENTS";
  priceUSD: number;
  priceEUR: number;
  rating: number;
  /** Optional cycle-bundle overrides (shared/commerce-config.ts). Omit = store defaults. */
  bundlesEnabled?: boolean;
  bundleDiscountsUSD?: Partial<Record<"2" | "3", number | null>> | null;
  sizes: number;
  image?: string;
  imageAlt?: string;
  images?: string[];
  variants?: ProductVariant[];
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  seriesInfo?: string;
  /** Authenticity data — each renders on the product page ONLY when filled. Never guessed. */
  manufacturer?: string;
  lotNumber?: string;
  /** YYYY-MM or YYYY-MM-DD */
  expiryDate?: string;
  /** Certificate of analysis link (https:// or /path) */
  coaUrl?: string;
  /** Stock line (shared/fulfillment.ts). Resolved for every product; default ships_2_weeks. */
  fulfillment?: Fulfillment;
}

/** Usage and ingredients come from shared/product-facts.json (one source for store + Pepita). */
const catalogProducts: Product[] = [
  {
    id: "bonomarlot",
    image: "/products/Banomarlot.png",
    imageAlt: "Bonomarlot bone marrow peptide supplement bottle",
    name: "Bonomarlot",
    description: "Bonomarlot® (A-20) is the Bone Marrow Peptide Bioregulator — a natural Cytomax extract containing the bone marrow peptide complex from young calves. Bone marrow produces all red blood cells, platelets, and most white blood cells. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, Bonomarlot has been studied for its role in supporting healthy blood cell formation. Available in 20-capsule, 60-capsule, and sublingual lingual formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 77.99,
    priceEUR: 52,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports normal hematopoietic function", "Blood cell production (red cells, platelets, white cells)", "Low-quality nutrition effects recovery", "Immune system support"],
    seriesInfo: "Recommended combination: Vladonix + Svetinorm + Endoluten + Bonomarlot, often used together for general immune and detox support. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 77.99,
        priceEUR: 52,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 199.99,
        priceEUR: 145,
        inStock: true
      }
    ]
  },
  {
    id: "cartalax",
    image: "/products/cartalax.jpg.webp",
    imageAlt: "Cartalax cartilage peptide bioregulator for joint health",
    name: "Cartalax",
    description: "Cartalax® is a synthesized cytogen tripeptide (Ala-Glu-Asp, AED peptide T-31) developed by Prof. Khavinson — the cartilage peptide complex AC-4. Fully synthesized, non-animal-derived, suitable for vegetarian/vegan protocols. Contains the most significant short peptide of the cartilage bioregulation system. Supports healthy cartilage and connective tissue metabolism. Studied for its role in supporting cartilage and connective tissue health. Studied for its role in supporting healthy cartilage cell function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 47.99,
    priceEUR: 32,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports healthy cartilage and connective tissue metabolism", "Supports the health of cartilage tissue", "Supports connective tissue health", "Supports the body's natural connective-tissue recovery processes", "Supports healthy cartilage cell function", "Vegan compatible (fully synthesized)"],
    seriesInfo: "Recommended combination: Cartalax + Vesugen + Crystagen for musculoskeletal wellness support. Cytogens are synthesized short peptide bioregulators — the lab-made counterparts to natural Cytomaxes — developed by the St. Petersburg Institute of Bioregulation and Gerontology. Because they are synthesized rather than extracted, Cytogens provide faster action (effects within 1.5–2 months) compared to natural Cytomaxes (4–6 months)."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 47.99,
        priceEUR: 32,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 116.99,
        priceEUR: 86,
        inStock: true
      }
    ]
  },
  {
    id: "chelohart",
    image: "/products/chelohart-a-14-20-capsules__83804.1738112709.jpg",
    imageAlt: "Chelohart heart peptide bioregulator capsules",
    name: "Chelohart",
    description: "Chelohart® (A-14) is the Heart Peptide Bioregulator containing the peptide complex of the cardiac muscle from young calves. Acts selectively on myocardial cells and supports healthy metabolic processes within heart muscle cells. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting heart muscle health. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Myocardial cell support", "Supports healthy metabolic processes within heart muscle cells", "Supports healthy cardiovascular function"],
    seriesInfo: "Recommended combination: Ventfort + Chelohart + Vladonix for cardiovascular wellness support. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson. Effects last 4–6 months per course."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "crystagen",
    image: "/products/Crystagen_peptide_side_2021_vita_stream__36125.1628292022.png",
    imageAlt: "Crystagen immune system peptide bioregulator",
    name: "Crystagen",
    description: "Crystagen® is a synthesized cytogen (AC-6, thymus) — copies of natural peptide fractions studied for their role in normal immune system function. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting immune system function during periods of psychoemotional stress. Crystagen is believed to support normal immune function, and researchers have investigated short peptides for their role in immune balance. The active tripeptide stimulates T-cells, B-cells, macrophages, NK cells, and exhibits antioxidant and stress-protective effects. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 47.99,
    priceEUR: 32,
    rating: 4.8,
    sizes: 2,
    benefits: ["T-cell, B-cell, and NK cell activation", "Macrophage stimulation", "Antioxidant and stress-protective effects", "Supports healthy immune system function", "Supports the body's natural detoxification processes", "Crystagen is believed to support normal immune function, and researchers have investigated short peptides for their role in immune balance."],
    seriesInfo: "Recommended combinations: Ovagen + Vesugen + Crystagen (digestive wellness); Crystagen + Pinealon + Vesugen (nervous system support). Cytogens are synthesized short peptide bioregulators — the lab-made counterparts to natural Cytomaxes — providing faster action (effects within 1.5–2 months) compared to natural Cytomaxes (4–6 months)."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 47.99,
        priceEUR: 32,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 116.99,
        priceEUR: 86,
        inStock: true
      }
    ]
  },
  {
    id: "endoluten",
    image: "/products/endoluten(1).jpeg",
    imageAlt: "Endoluten pineal gland peptide for circadian rhythm",
    name: "Endoluten",
    description: "Endoluten® (A-8) is the Pineal Peptide Bioregulator — the most foundational peptide in the Khavinson longevity protocol. Contains the epiphyseal peptide complex that regulates hormonal metabolism, acts on neuroendocrine system cells, and is studied for its role in pineal cell metabolism and melatonin secretion. Analog of pharmaceutical Epithalamin. Researchers have investigated pineal peptides in the context of healthy aging, and the early findings are encouraging, though larger human studies would help. Early laboratory research on pineal peptides has explored effects on telomeres, a marker scientists study in cellular aging. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 124.99,
    priceEUR: 85,
    rating: 4.8,
    sizes: 2,
    benefits: ["Most foundational Khavinson longevity peptide", "Studied for its role in melatonin secretion", "Cyclic processes regulation", "Healthy aging of the pineal gland — studied as a geroprotector", "Reproductive system regulation", "Immune system support", "Early laboratory research on pineal peptides has explored effects on telomeres, a marker scientists study in cellular aging.", "Researchers have investigated pineal peptides in the context of healthy aging, and the early findings are encouraging, though larger human studies would help."],
    seriesInfo: "Vladonix + Endoluten is the foundational pairing for every Khavinson protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 124.99,
        priceEUR: 85,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 249,
        priceEUR: 235,
        inStock: true
      }
    ]
  },
  {
    id: "gotratix",
    image: "/products/gotratix-a-18-20-capsules__87331.jpg",
    imageAlt: "Gotratix muscle peptide bioregulator capsules",
    name: "Gotratix",
    description: "Gotratix® (A-18) is the Muscle Peptide Bioregulator containing muscle peptide complex from triceps of young animals. Studied in athletes for its role in supporting muscle strength, endurance, and recovery from physical activity. Part of the physical activity protocol. Not classified as doping — provides non-hormonal muscle mass support. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports muscle strength", "Supports endurance during physical activity", "Supports recovery from muscle fatigue", "Supports muscle reserve capacity", "Supports the maintenance of healthy muscle tissue", "Non-hormonal muscle mass support", "Not classified as doping"],
    seriesInfo: "Recommended combination: Sigumir + Ventfort + Vladonix + Gotratix + Cerluten for physical activity protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "pielotax",
    image: "/products/pielotax.jpeg",
    imageAlt: "Pielotax kidney peptide bioregulator supplement",
    name: "Pielotax",
    description: "Pielotax® (A-9) is the Kidney Peptide Bioregulator containing kidney peptide complex from kidney parenchyma. Acts with targeted selectivity on kidney cells, and is studied for its role in kidney cell metabolism and urinary system function. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting kidney health. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports healthy kidney function", "Studied for its role in kidney cell metabolism"],
    seriesInfo: "Recommended combination: Vladonix + Chitomur + Pielotax for urinary system wellness support. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson. Effects last 4–6 months per course."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "prime-peptide-brain",
    name: "Prime Peptide Brain",
    image: "/products/pp-brain.png",
    imageAlt: "Prime Peptide Brain - IPH AGAP peptide complex for cognitive support and brain health",
    description: "Built around IPH AGAP tetrapeptide — penetrates the blood-brain barrier, regulates neurometabolic processes, activates neuronal repair, and enhances cognitive functions. Enriched with magnesium N-acetyltaurate, choline bitartrate, GABA, nervonic acid, vitamin C, zinc, and biotin. Stimulates neurotransmitter synthesis, increases serotonin levels, and activates neuroplasticity genes in the hippocampus. Formulated with ingredients studied to support memory, concentration, and mental clarity during high cognitive demand.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 139.99,
    priceEUR: 90,
    rating: 4.8,
    sizes: 1,
    benefits: ["Crosses blood-brain barrier", "Neuroplasticity activation", "Serotonin increase", "Neuroprotective antioxidant", "Myelin support", "Memory formation enhancement"],
  },
  {
    id: "prime-peptide-collagen",
    name: "Prime Peptide Collagen",
    image: "/products/pp-collagen.png",
    description: "Built around IPH AEN peptide. Formulated to support normal collagen and hyaluronic acid synthesis and cellular repair, drawing on peptide research the manufacturer has reported on. Enriched with 800mg marine collagen, calcium bisglycinate, vitamin C, copper gluconate, and biotin. Premium formula utilizing IPH technology for comprehensive skin, hair, nail, and connective tissue support with ingredients studied for their role in cellular renewal. Formulated to support normal aging of skin and connective tissue, drawing on peptide research the manufacturer has reported on.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 124.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Formulated to support normal collagen and hyaluronic acid synthesis, drawing on peptide research the manufacturer has reported on.", "Formulated to support normal cellular repair, drawing on peptide research the manufacturer has reported on.", "Supports skin firmness", "Hair growth support", "Nail strength", "Formulated to support normal aging of skin and connective tissue, drawing on peptide research the manufacturer has reported on."],
  },
  {
    id: "prime-peptide-joints",
    name: "Prime Peptide Joints",
    image: "/products/pp-joints.png",
    description: "Built around IPH AEN (formulated to support normal hyaluronic acid synthesis and cartilage regeneration, drawing on peptide research the manufacturer has reported on; activates COL2A1 gene) and IPH ESM (supports joint comfort, mobility, and eases everyday stiffness). Enriched with liposomal glucosamine, MSM with SNL technology, PEA, and ascorbyl palmitate. Advanced joint support utilizing IPH technology for deep cartilage penetration and targeted cellular repair.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 169.99,
    priceEUR: 110,
    rating: 4.8,
    sizes: 1,
    benefits: ["Formulated to support normal cartilage health, drawing on peptide research the manufacturer has reported on.", "Formulated to support normal type II collagen synthesis, drawing on peptide research the manufacturer has reported on.", "Formulated to support normal hyaluronic acid synthesis, drawing on peptide research the manufacturer has reported on.", "Supports joint comfort, mobility, and eases everyday stiffness", "Deep cartilage penetration", "COL2A1 gene activation"],
  },
  {
    id: "prime-peptide-omega",
    name: "Prime Peptide Omega",
    image: "/products/pp-omega.png",
    description: "Built around the manufacturer's IPH T peptide, a thymus-focused bioregulator ingredient, and enriched with Omega 3-6-9 fatty acids. Its plant-based omega complex provides omega-3 (ALA), omega-6 (linoleic acid) and omega-9 (oleic acid) fatty acids. Vitamins C, D3 and zinc contribute to normal immune function, and vitamin E helps protect cells from oxidative stress, as part of a balanced diet and healthy lifestyle.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 124.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Vitamins C, D3 and zinc to support normal immune function", "Includes IPH T, a thymus-focused peptide ingredient", "Vitamin E to help protect cells from oxidative stress", "Omega 3-6-9 fatty acids, including plant-based omega-3 ALA, an essential fatty acid the body can't make on its own"],
  },
  {
    id: "prime-peptide-protect",
    name: "Prime Peptide Protect",
    image: "/products/pp-protect.png",
    description: "Built around IPH REG and IPH EP. Formulated to support normal antioxidant enzyme activity, melatonin levels, and calm mood, drawing on peptide research the manufacturer has reported on. Enriched with broccoli/I3C, bioactive mushroom peptides, PEA, choline, zinc, selenium, and vitamin K2. Provides powerful antioxidant protection and ingredients studied for their role in tissue renewal.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 169.99,
    priceEUR: 110,
    rating: 4.8,
    sizes: 1,
    benefits: ["Formulated to support normal antioxidant protection, drawing on peptide research the manufacturer has reported on.", "Formulated to support normal melatonin levels, drawing on peptide research the manufacturer has reported on.", "Formulated to support a normal, calm mood, drawing on peptide research the manufacturer has reported on."],
  },
  {
    id: "revilab-ml-01",
    image: "/products/RevilabML1.jpg",
    imageAlt: "Revilab ML 01 peptide complex for nervous system, immune, and cardiovascular support",
    name: "Revilab ML 01",
    description: "Multifunctional peptide complex combining epiphysis, immune B-cell, and liver peptides with resveratrol, choline, omega-3 fatty acids, and vitamins E, A, and C. Designed to support antioxidant protection, cerebral circulation, central nervous system function, immune system balance, and cardiovascular health. The peptide complexes send targeted signals to support the pineal gland's timing functions, the immune system's antibody production, and the liver's filtering capacity. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant protection", "Cerebral circulation", "CNS function", "Immune balance", "Cardiovascular health", "Liver support", "Healthy aging — epiphysis peptide studied as a geroprotector"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-02",
    image: "/products/RevilabML2.jpg",
    imageAlt: "Revilab ML 02 hematopoietic and immune support formula",
    name: "Revilab ML 02",
    description: "Peptide-based formula designed to support the hematopoietic (blood-forming) system, immune function, and metabolic balance. Combines T-cell immune peptides, B-cell immune peptides, bone marrow peptides, and liver peptides with omega-3 fatty acids and vitamins E, B6, and B9. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Hematopoietic support", "Immune function", "Metabolic balance", "Toxin resistance", "Blood cell production"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-03",
    image: "/products/RevilabML3.jpg",
    imageAlt: "Revilab ML 03 nervous system and eye health formula",
    name: "Revilab ML 03",
    description: "Formulation combining brain, retina, and vascular wall peptides with astaxanthin, choline, omega-3 fatty acids, B vitamins, and marigold extract. Supports nervous system and eye health, including maintenance of visual function. Astaxanthin and marigold extract (rich in lutein and zeaxanthin) provide antioxidant protection for sensitive neural and retinal tissues. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nervous system support", "Eye and retinal health", "Brain recovery", "Visual function", "Antioxidant protection", "Nerve metabolism"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-04",
    image: "/products/RevilabML4.jpg",
    imageAlt: "Revilab ML 04 cardiovascular support formula",
    name: "Revilab ML 04",
    description: "Cardiovascular support formula combining epiphysis, vascular wall, and heart muscle peptides with resveratrol, rutin, omega-3 fatty acids, and Vitamin PP (Niacin). Supports vascular integrity, heart muscle function, and healthy circulation. Resveratrol and rutin provide antioxidant and vascular support, while omega-3s and niacin contribute to cardiovascular function and healthy cholesterol metabolism. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular health", "Vascular integrity", "Heart muscle support", "Circulation", "Cholesterol metabolism", "Antioxidant protection"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-05",
    image: "/products/RevilabML5.jpg",
    imageAlt: "Revilab ML 05 respiratory system support formula",
    name: "Revilab ML 05",
    description: "Respiratory system support formula featuring T-cell immune peptides, bronchi peptides, and lung/stomach wall peptides combined with omega-3 fatty acids, vitamins E and A, and licorice root extract. Supports respiratory function and immune defense in the lungs and bronchi. Vitamins and omega-3s provide antioxidant and anti-inflammatory support, while licorice root extract helps maintain respiratory tract comfort. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Respiratory health", "Bronchial support", "Immune defense", "Lung tissue integrity", "Anti-inflammatory", "Antioxidant protection"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-06",
    image: "/products/RevilabML6.jpg",
    imageAlt: "Revilab ML 06 gastrointestinal and liver support formula",
    name: "Revilab ML 06",
    description: "Gastrointestinal and liver support formula combining liver, pancreas, and stomach wall peptides with omega-3 fatty acids, licorice root extract, artichoke fruit extract, plantain leaves extract, and strawberry leaves extract. Supports digestive health and metabolic balance. Botanical extracts provide soothing and antioxidant effects, while omega-3s support overall tissue health. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver health", "Digestive support", "Pancreatic function", "Metabolic balance", "Detoxification", "Gastric mucosa protection"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-07",
    image: "/products/RevilabML7.jpg",
    imageAlt: "Revilab ML 07 male reproductive and urinary system support",
    name: "Revilab ML 07",
    description: "Male reproductive and urinary system support formula combining epiphysis, vascular wall, testes, and bladder peptides with omega-3 fatty acids, L-carnitine, and zinc citrate. Supports hormonal balance, sperm function, and urinary health. L-carnitine supports energy metabolism in sperm cells, while zinc is essential for reproductive health and hormone regulation. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Male reproductive health", "Hormonal balance", "Sperm motility", "Urinary health", "Testosterone support", "Vascular health"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-08",
    image: "/products/RevilabML8.jpg",
    imageAlt: "Revilab ML 08 female reproductive and skeletal system support",
    name: "Revilab ML 08",
    description: "Female reproductive, neuroendocrine, urinary, and skeletal system support formula combining epiphysis, vascular wall, cartilage, and bladder peptides with omega-3 fatty acids, resveratrol, and arginine. Supports hormonal balance, fertility, bone health, and urinary function. Resveratrol provides antioxidant support and hormonal balance, while arginine helps maintain healthy circulation and tissue repair. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Female reproductive health", "Hormonal balance", "Bone and cartilage health", "Urinary function", "Neuroendocrine support", "Antioxidant protection"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-09",
    image: "/products/RevilabML9.jpg",
    imageAlt: "Revilab ML 09 musculoskeletal and joint support formula",
    name: "Revilab ML 09",
    description: "Musculoskeletal support formula combining B-cell immune, vascular wall, and cartilage peptides with chondroitin sulfate, omega-3 fatty acids, superoxide dismutase (SOD), catalase, and carnosine. Chondroitin sulfate and omega-3s help maintain joint mobility and reduce inflammation, while antioxidant enzymes SOD and catalase protect tissues from oxidative stress. Carnosine supports antioxidant protection and tissue repair. Adults take 1 capsule once a day with meals.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 113.99,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint health", "Cartilage integrity", "Connective tissue support", "Anti-inflammatory", "Antioxidant defense", "Immune balance"],
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-pro-elements",
    name: "Revilab Pro Elements",
    description: "New-generation biologically active complex developed to support key body systems at the cellular level. Contains balanced combination of micro- and macroelements, vitamins, and bioactive compounds including glycine, calcium citrate, magnesium citrate, zinc citrate, vitamins A, E, D3, B6, and chromium picolinate. Strengthens immune resilience, protects against stress, supports healthy aging, and promotes cellular vitality.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 97.99,
    priceEUR: 70,
    rating: 4.8,
    sizes: 1,
    image: "/products/revilab-pro-elements.jpg",
    imageAlt: "Revilab Pro Elements vitamin-mineral complex with micro-elements premix",
    benefits: [
      "Supports cellular vitality",
      "Comprehensive nutritional support",
      "Antioxidant protection",
      "Replenishes collagen deficiency",
      "Optimal mineral balance",
      "Increased vitality"
    ],
    seriesInfo: "The Revilab Preparation series represents advanced nutraceuticals developed for anti-aging and systemic support. Each product is enriched with active components that work at the cellular level to support internal balance and healthy aging, with components studied for their role in normal organ and system function, balance metabolism, and activate detoxification pathways. For enhanced rejuvenating effects, these products are recommended for combined use."
  },
  {
    id: "mesotel-neo",
    name: "Mesotel Neo",
    description: "Advanced anti-aging liquid formula based on choline, enriched with gotu kola and wolfberry extracts, zinc, vitamins and resveratrol. Powerful antioxidant. Promotes detoxification, strengthens immunity, improves cardiovascular and nervous system function, and includes ingredients studied for their role in cellular renewal for youthful skin.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 33.99,
    priceEUR: 23,
    rating: 4.8,
    sizes: 1,
    image: "/products/mesotel-neo.png",
    imageAlt: "Mesotel Neo anti-aging liquid supplement with gotu kola, wolfberry, and resveratrol",
    benefits: [
      "Improves cerebral circulation",
      "Supports healthy blood vessels",
      "Antioxidant protection",
      "Enhances immunity",
      "Prevents aging",
      "Studied for its role in cell renewal"
    ]
  },
  {
    id: "revilab-sl-01",
    image: "/products/sl_1-228x228.jpg",
    imageAlt: "Revilab SL 01 sublingual cardiovascular support",
    name: "Revilab SL 01",
    description: "Sublingual cardiovascular support complex delivering peptides directly into the bloodstream through the mucous membrane for rapid absorption. Combines vascular wall and cardiac muscle peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides signal heart and vascular cells to maintain their natural function. Dihydroquercetin supports blood vessel integrity and elasticity. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular support", "Heart muscle health", "Vascular integrity", "Rapid sublingual absorption", "Antioxidant protection", "Circulation support"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-02",
    image: "/products/sl_2-228x228.jpg",
    imageAlt: "Revilab SL 02 sublingual nervous system and eye support",
    name: "Revilab SL 02",
    description: "Sublingual complex for nervous system and eye health. Combines brain, retina, and vascular wall peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Brain and retina peptides support neural and visual cells, while vascular peptides help maintain the blood vessels that nourish these tissues. Supports cerebral circulation, retinal function, and visual comfort. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nervous system support", "Eye and retinal health", "Cerebral circulation", "Visual comfort", "Rapid absorption", "Neuroprotection"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-03",
    image: "/products/RevilabSL3.jpg",
    imageAlt: "Revilab SL 03 sublingual immune and neuroendocrine support",
    name: "Revilab SL 03",
    description: "Sublingual complex for immune system regulation and neuroendocrine balance. Combines pineal gland, T-cell immune, and B-cell immune peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Pineal peptides support biological rhythm regulation and immune signaling. T- and B-cell peptides help maintain immune balance and antibody production. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune regulation", "Neuroendocrine balance", "Biological rhythm support", "T-cell and B-cell function", "Rapid absorption", "Antioxidant defense"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-04",
    image: "/products/RevilabSL4.png",
    imageAlt: "Revilab SL 04 sublingual musculoskeletal support",
    name: "Revilab SL 04",
    description: "Sublingual complex for joint, muscle, and bone health. Combines B-cell immune, cartilage, and muscle peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides act as signals to cartilage, muscle, and immune cells to support their natural maintenance. Plant extracts and antioxidants help protect tissues and support metabolic balance. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint health", "Muscle support", "Cartilage maintenance", "Bone health", "Rapid absorption", "Anti-inflammatory"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-05",
    image: "/products/RevilabSL5.jpg",
    imageAlt: "Revilab SL 05 sublingual gastrointestinal support",
    name: "Revilab SL 05",
    description: "Sublingual complex for liver, pancreas, stomach, and gallbladder health. Combines liver, pancreas, and stomach wall peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides support the natural function of digestive and detoxification organs. Plant extracts and antioxidants provide additional support to maintain healthy metabolic processes. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver health", "Pancreatic support", "Digestive function", "Detoxification", "Gastric mucosa protection", "Rapid absorption"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-06",
    image: "/products/sl_6-228x228.jpg",
    imageAlt: "Revilab SL 06 sublingual respiratory support",
    name: "Revilab SL 06",
    description: "Sublingual complex for respiratory system health and immune response in the lungs and bronchi. Combines B-cell immune, bronchi, and lung/stomach wall peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides help maintain immune and tissue health in the respiratory tract. Plant extracts and antioxidants support respiratory comfort and tissue resilience. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Respiratory health", "Bronchial support", "Lung tissue integrity", "Immune defense", "Rapid absorption", "Anti-inflammatory"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-07",
    image: "/products/RevilabSL7.jpg",
    imageAlt: "Revilab SL 07 sublingual hematopoietic support",
    name: "Revilab SL 07",
    description: "Sublingual complex for healthy blood formation and immune function. Combines B-cell immune, bone marrow, and vascular wall peptides with folic acid and vitamin B12 (cobalamin), licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Bone marrow peptides support blood cell production, B vitamins aid energy and nerve function, and vascular peptides support circulatory health. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Hematopoietic support", "Blood cell production", "Immune function", "Energy metabolism", "Nerve health", "Rapid absorption"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-08",
    image: "/products/RevilabSL8.jpg",
    imageAlt: "Revilab SL 08 sublingual urinary system support",
    name: "Revilab SL 08",
    description: "Sublingual complex for urinary tract health and function. Combines T-cell immune, vascular wall, and bladder peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides support immune and vascular health related to the urinary system. Plant extracts and antioxidants help maintain tissue comfort and function. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Urinary tract health", "Bladder support", "Immune defense", "Vascular health", "Rapid absorption", "Tissue comfort"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-09",
    image: "/products/RevilabSL99.jpg",
    imageAlt: "Revilab SL 09 sublingual male reproductive support",
    name: "Revilab SL 09",
    description: "Sublingual complex for male reproductive system function and prostate health. Combines pineal gland, testes, bladder, and prostate peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides signal the reproductive organs and neuroendocrine system to support natural function. Plant extracts and antioxidants help maintain tissue health and hormonal balance. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Male reproductive health", "Prostate support", "Hormonal balance", "Testicular function", "Urinary health", "Rapid absorption"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "testoluten",
    image: "/products/testoluten.jpeg",
    imageAlt: "Testoluten testicular peptide for male health",
    name: "Testoluten",
    description: "Testicular peptide bioregulator (A-13) developed by the St. Petersburg Institute of Bioregulation and Gerontology. Supports male reproductive system cells by increasing functional activity and enhancing sperm motility. Helps maintain metabolic balance and functional activity in the testes, supporting natural reproductive processes and testosterone production. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Male reproductive health", "Sperm motility", "Testosterone support", "Testicular function", "Hormonal balance", "Vitality"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson. Each Cytomax contains a tissue-specific peptide complex that acts as a biological messenger, studied for its role in signaling the corresponding organ's cells to support normal metabolism and functional activity. Effects last 4–6 months per course."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "bonothyrk",
    name: "Bonothyrk",
    image: "/products/bonothyrk.jpg",
    imageAlt: "Bonothyrk A-21 parathyroid peptide complex",
    description: "Bonothyrk® is a Khavinson Cytomax: a natural parathyroid gland peptide complex (A-21), developed at the St. Petersburg Institute of Bioregulation and Gerontology. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Bonothyrk is believed to support normal parathyroid gland function, which helps the body keep calcium balance in bones and tissues. Available in 20-capsule and 60-capsule formats (0.215 g capsules).",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal parathyroid gland function", "Supports the body's normal calcium balance", "Natural parathyroid peptide complex (A-21)"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "cerluten",
    name: "Cerluten",
    image: "/products/cerluten5.jpg",
    imageAlt: "Cerluten brain peptide bioregulator",
    description: "Cerluten® is a Khavinson Cytomax: a natural brain peptide complex (A-5), extracted from the tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Cerluten is believed to support normal brain and nervous-system function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal brain cell metabolism", "Supports normal nervous-system function", "Natural brain peptide complex (A-5)"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "chitomur",
    name: "Chitomur",
    image: "/products/chit9.jpg",
    imageAlt: "Chitomur bladder peptide bioregulator",
    description: "Chitomur® is a Khavinson Cytomax: a natural bladder peptide complex (A-12), extracted from the tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Chitomur is believed to support normal bladder and urinary function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal bladder function", "Supports normal urinary function", "Natural bladder peptide complex (A-12)"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "chonluten",
    name: "Chonluten",
    image: "/products/chono1.jpg",
    imageAlt: "Chonluten respiratory peptide bioregulator",
    description: "Chonluten® is a Khavinson Cytogen: a synthesized bronchopulmonary peptide complex (AC-7; glycine, glutamic acid, aspartic acid) for the respiratory system. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Chonluten is believed to support normal bronchial and lung function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal bronchial function", "Supports normal lung function", "Khavinson Cytogen"],
    seriesInfo: "Cytogens are synthesized copies of key short peptides, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "glandokort",
    name: "Glandokort",
    image: "/products/gland5.jpg",
    imageAlt: "Glandokort adrenal gland peptide bioregulator",
    description: "Glandokort® is a Khavinson Cytomax: a natural adrenal gland peptide complex (A-17). Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Glandokort is believed to support normal adrenal function and the body's everyday stress response. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal adrenal function", "Supports the body's normal stress response", "Khavinson Cytomax"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "libidon",
    name: "Libidon",
    image: "/products/libi1.jpg",
    imageAlt: "Libidon prostate peptide bioregulator",
    description: "Libidon® is a Khavinson Cytomax: a natural prostate peptide complex (A-16), extracted from the prostate tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Libidon is believed to support normal prostate and male reproductive function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal prostate function", "Supports normal male reproductive function", "Khavinson Cytomax"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "ovagen",
    name: "Ovagen",
    image: "/products/ova1.jpg",
    imageAlt: "Ovagen liver and digestive peptide bioregulator",
    description: "Ovagen® is a Khavinson Cytogen: a synthesized liver peptide complex (AC-3; leucine, glutamic acid, aspartic acid) for the liver and digestive tract. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Ovagen is believed to support normal liver function and the normal work of the digestive tract. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal liver function", "Supports normal digestive function", "Khavinson Cytogen"],
    seriesInfo: "Cytogens are synthesized copies of key short peptides, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "pinealon",
    name: "Pinealon",
    image: "/products/pinealon.jpg",
    imageAlt: "Pinealon brain peptide bioregulator",
    description: "Pinealon® is a Khavinson Cytogen: a synthesized brain peptide complex (AC-5; arginine, glutamic acid, aspartic acid), formulated for the brain and central nervous system. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Pinealon is believed to support normal brain function and everyday cognition. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal brain cell metabolism", "Supports normal cognitive function", "Khavinson Cytogen"],
    seriesInfo: "Cytogens are synthesized copies of key short peptides, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e. Same data as the Pepita-branch draft; photos supplied by Julia.
    id: "sigumir",
    image: "/products/sigumir-60.webp",
    imageAlt: "Sigumir A-4 peptides complex, 60 capsules",
    name: "Sigumir",
    description: "Sigumir® is a Khavinson Cytomax: a natural peptide complex (A-4) extracted from the cartilage and bone tissue of young animals, developed at the St. Petersburg Institute of Bioregulation and Gerontology. Researchers have investigated how organ-derived short peptides act selectively on the cells of their source tissue, and Sigumir's cartilage and bone peptides are believed to support normal joint and spine function. It is the natural-extract counterpart to Cartalax, the lab-made AED cartilage peptide. Dietary supplement; the box reads 'A-4 peptides complex'. Available in 20-capsule (0.215 g) and 60-capsule (0.2 g) formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal cartilage and bone tissue function", "Supports normal joint and spine function", "Natural cartilage and bone peptide complex (A-4)", "Natural-extract counterpart to Cartalax"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson. Sigumir (natural cartilage and bone extract) and Cartalax (the synthesized AED cartilage tripeptide) both focus on cartilage; they differ in source and formulation.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        image: "/products/sigumir-20.jpg",
        imageAlt: "Sigumir A-4 peptides complex, 20 capsules (0.215 g)",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        image: "/products/sigumir-60.webp",
        imageAlt: "Sigumir A-4 peptides complex, 60 capsules (0.2 g)",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "stamakort",
    name: "Stamakort",
    image: "/products/stamakort4.jpg",
    imageAlt: "Stamakort stomach peptide bioregulator",
    description: "Stamakort® is a Khavinson Cytomax: a natural stomach peptide complex, extracted from the tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Stamakort is believed to support normal stomach function and digestion. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal stomach function", "Supports normal digestion", "Natural stomach peptide complex"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "suprefort",
    name: "Suprefort",
    image: "/products/suprefort1.jpg",
    imageAlt: "Suprefort pancreas peptide bioregulator",
    description: "Suprefort® is a Khavinson Cytomax: a natural pancreas peptide complex (A-1), extracted from the tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Suprefort is believed to support normal pancreatic function and digestion. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal pancreatic function", "Supports normal digestion", "Natural pancreas peptide complex (A-1)"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "svetinorm",
    name: "Svetinorm",
    image: "/products/Svetinorm.jpg",
    imageAlt: "Svetinorm liver peptide bioregulator",
    description: "Svetinorm® is a Khavinson Cytomax: a natural liver peptide complex (A-7), extracted from the tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Svetinorm is believed to support normal liver function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal liver cell metabolism", "Supports normal liver function", "Natural liver peptide complex (A-7)"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "taxorest",
    name: "Taxorest",
    image: "/products/taxorest.jpeg",
    imageAlt: "Taxorest respiratory peptide bioregulator",
    description: "Taxorest® is a Khavinson Cytomax: a natural bronchial peptide complex (A-19), extracted from the bronchial tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Taxorest is believed to support normal bronchial and lung function. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal bronchial function", "Supports normal lung function", "Khavinson Cytomax"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    // Restored 2026-10-13: lost in 47d997e (N20/N60 merge had no base listing).
    id: "zhenoluten",
    name: "Zhenoluten",
    image: "/products/Zhenoluten.jpg",
    imageAlt: "Zhenoluten ovarian peptide bioregulator",
    description: "Zhenoluten® is a Khavinson Cytomax: a natural ovarian peptide complex (A-15), extracted from the tissue of young animals. Researchers have investigated how organ-specific short peptides act selectively on the cells of their source tissue, and Zhenoluten is believed to support normal ovarian function and female reproductive health. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Is believed to support normal ovarian function", "Supports female reproductive health", "Natural ovarian peptide complex (A-15)"],
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific organs and tissues, developed under Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "ventfort",
    name: "Ventfort",
    image: "/products/ventfort.png",
    description: "Ventfort® (A-3) is the Blood Vessel Peptide Bioregulator. Frequently included in multi-peptide routines. Studied for its role in vascular wall cell metabolism and vascular function. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting cardiovascular and blood vessel health. Ventfort is believed to support healthy circulation and everyday stamina, and some studies have reported encouraging results with vascular peptides. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Most universally recommended peptide bioregulator", "Supports healthy cardiovascular function", "Supports healthy blood vessels", "Supports healthy vein function", "Include in every peptide protocol"],
    seriesInfo: "Include Ventfort in every peptide protocol. Recommended combination: Ventfort + Chelohart + Vladonix for cardiovascular system. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "vesugen",
    image: "/products/Vesugen_peptide_side_2021_vita_stream__14678.1628291284.png",
    imageAlt: "Vesugen blood vessel peptide bioregulator",
    name: "Vesugen",
    description: "Vesugen® is a synthesized cytogen for the vascular system. Studied for its role in the health of circulatory and lymphatic vessels. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting healthy blood vessels and microcirculation. Used by the Russian Olympic rhythmic gymnastics team for vascular health maintenance. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 47.99,
    priceEUR: 32,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports healthy blood vessels", "Microcirculation improvement", "Supports healthy vein function", "Supports healthy cardiovascular function", "Supports healthy lymphatic vessels"],
    seriesInfo: "Universal cytogen — appears in all major protocol stacks. Cytogens are synthesized short peptide bioregulators — the lab-made counterparts to natural Cytomaxes — providing faster action (effects within 1.5–2 months) compared to natural Cytomaxes (4–6 months)."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 47.99,
        priceEUR: 32,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 116.99,
        priceEUR: 86,
        inStock: true
      }
    ]
  },
  {
    id: "visoluten",
    name: "Visoluten",
    image: "/products/visoluten.png",
    description: "Visoluten® (A-11) is the Retina Peptide Bioregulator with targeted effect on retina, ciliary muscles, and conjunctiva. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting retinal and overall eye health. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports structural integrity of the retina, ciliary muscle, and conjunctiva", "Retina, ciliary muscle, and conjunctiva support"],
    seriesInfo: "Recommended combination: Visoluten + Cerluten + Ventfort for eye health support. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "vladonix",
    name: "Vladonix",
    image: "/products/vladonix.png",
    description: "Vladonix® (A-6) is one of the two most important Khavinson peptides alongside Endoluten. Contains thymus peptide complex — based on the same thymus peptide research as Thymalin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Studied for its role in supporting immune system function. Vladonix and Endoluten are commonly paired in healthy-aging protocols. Core component of virtually every Khavinson combination protocol. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Most foundational immune peptide", "Based on the same thymus peptide research as Thymalin", "Supports healthy immune system function", "Supports the body's natural detoxification processes", "Commonly paired with Endoluten in healthy-aging protocols"],
    seriesInfo: "Endoluten + Vladonix is the foundational pairing for every Khavinson protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "anti-wrinkle-serum-7",
    name: "Anti-Wrinkle Serum №7",
    description: "Professional peptide serum with fast visible lifting effect. Contains Matrixyl® synthe'6™, Progeline™, and Liftessense™ for deep wrinkle reduction.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 116.99,
    priceEUR: 106.36,
    rating: 4.9,
    sizes: 1,
    image: "/products/anti-wrinkle-serum-7-a.jpg",
    benefits: [
      "Instant lifting effect",
      "Smooths deep wrinkles",
      "Supports the skin's collagen structure",
      "Improves skin elasticity",
      "Deep moisturization",
      "Tightens facial oval"
    ],
  },
  {
    id: "revilab-sl-10",
    image: "/products/RevilabSL10.jpg",
    imageAlt: "Revilab SL 10 sublingual female reproductive support",
    name: "Revilab SL 10",
    description: "Sublingual complex for female neuroendocrine and reproductive system health, including cyclic regulation and support during the menopausal transition. Combines pineal gland, vascular wall, and bladder peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides support neuroendocrine signaling and reproductive tissue maintenance. Plant extracts and antioxidants provide supportive effects for overall female health and comfort. Adults place 5–10 drops under the tongue 2 times a day.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 40.99,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Female reproductive health", "Hormonal cycle regulation", "Support during the menopausal transition", "Neuroendocrine balance", "Urinary health", "Rapid absorption"],
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-anti-age",
    name: "Revilab Anti-A.G.E.",
    description: "Powerful anti-glycation supplement with deglycating and antioxidant effects. Contains carnosine, astaxanthin, and alpha-lipoic acid to prevent protein degradation.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 161.99,
    priceEUR: 115,
    rating: 4.9,
    sizes: 1,
    image: "/products/revilab-anti-age.png",
    benefits: [
      "Prevents protein glycation",
      "Smooths wrinkles and increases elasticity",
      "Protects against age-related changes",
      "Rejuvenates all body protein structures",
      "Strong antioxidant protection",
      "Studied for its role in cellular metabolism"
    ],
    seriesInfo: "The Revilab Preparation series represents advanced nutraceuticals developed for anti-aging and systemic support. Each product is enriched with active components that work at the cellular level to support internal balance and healthy aging, with components studied for their role in normal organ and system function, balance metabolism, and activate detoxification pathways. For enhanced rejuvenating effects, these products are recommended for combined use."
  },
  {
    id: "alvenorm-forte",
    image: "/products/Alvenorm.jpg",
    name: "Alvenorm Forte",
    description: "Alvenorm Forte is a herbal liquid from Peptides, formulated as part of a wellness and preventative nutrition line for the lungs and bronchi. It combines Iceland moss decoction, liquorice root, thyme, nettle, broadleaf plantain, cowberry leaf, eucalyptus and calendula extracts in a red grape juice base, plants traditionally used to support the airways and normal breathing.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 49.99,
    priceEUR: 33,
    rating: 4.8,
    sizes: 1,
    benefits: ["Formulated for the lungs and bronchi", "Supports normal breathing", "Iceland moss, thyme and liquorice root", "Herbal liquid in a red grape juice base"],
  },
  {
    id: "volustom",
    name: "Volustom",
    image: "/products/Volustom.jpg",
    imageAlt: "Volustom gastrointestinal health supplement",
    description: "Adsorbent dietary fiber complex for detoxification and weight management. Comprehensive gastrointestinal support formula that supports normal digestive function and the gastric mucosa, promotes healthy gut microbiome balance, and facilitates the body's natural detox pathways through fiber-based adsorption.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Adsorbent detoxification", "Weight management support", "Gastric mucosa protection", "Supports normal digestion", "Gut microbiome balance", "Dietary fiber supplementation"]
  },
  {
    id: "getrufline",
    image: "/products/getruflineINFO.jpg",
    name: "Getrufline",
    description: "Europe's first herbal truffle-form complex, developed in conjunction with leading experts at the Institute of Innovative Biomedical Technology. 100% natural composition, EU-certified, GMO-free, and low in fat. The truffle form is uniquely effective — chewing creates a 'lump' that coats the intestinal mucosa along its entire length, while the bitterness activates non-specific immunity and triggers bile secretion. Also supports a healthy gut microbiome.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 22,
    rating: 4.8,
    sizes: 1,
    benefits: ["Gut microbiome support", "Immune activation"],
  },
  {
    id: "gelmigon",
    image: "/products/cleantestin.jpg",
    name: "Gelmigon",
    description: "Natural complex with choleretic, antispasmodic, anti-toxic, and anti-inflammatory effects. Contains plant extracts. Supports liver and digestive tract health.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Choleretic action", "Anti-inflammatory", "Digestive protection", "Detoxification"]
  },
  {
    id: "digemax",
    image: "/products/digimax2.jpg",
    name: "Digemax",
    description: "Digestive enzyme and support complex for optimal gastrointestinal function. Supports normal digestion and nutrient absorption, and reduces digestive discomfort. Beneficial for those with irregular digestive function.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Digestive enzyme support", "Nutrient absorption", "Gut comfort", "Gastrointestinal health"]
  },
  {
    id: "imusil",
    image: "/products/imusil.jpg",
    name: "Imusil",
    description: "Immune and skin support complex with immunomodulatory and adaptogenic properties. Strengthens natural defense mechanisms, supports cellular immunity, promotes healthy skin barrier function, and helps the body adapt to physical and environmental stress. Beneficial for those with weakened immunity or skin health concerns.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune modulation", "Skin health support", "Cellular immunity", "Skin barrier function", "Stress adaptation", "Natural defense support"]
  },
  {
    id: "indosine",
    image: "/products/indosine.jpg",
    name: "Indosine",
    description: "Complex bioregulator combining indole-3-carbinol, broccoli extract, Coenzyme Q10, superoxide dismutase, catalase, and milky white iris grass. Regulates cell proliferation and modulates immunity. Provides powerful antioxidant defense.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 55.99,
    priceEUR: 37,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune regulation", "Cell proliferation control", "Antioxidant protection", "Hormone balance"],
  },
  {
    id: "calsil-t",
    image: "/products/calsilt.jpg",
    name: "Calsil-T",
    description: "Potent, balanced calcium and magnesium formula for bone, teeth, muscle, and nervous system health. Calcium strengthens bones and teeth and supports muscle function. Magnesium promotes energy metabolism and nervous system balance. A solid foundation for structural and functional health.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 18.99,
    priceEUR: 13,
    rating: 4.8,
    sizes: 1,
    benefits: ["Bone and teeth strength", "Muscle function", "Nervous system support", "Energy metabolism", "Calcium-magnesium balance"]
  },
  {
    id: "complex-3d",
    image: "/products/complex3d.jpg",
    name: "Complex 3D",
    description: "Advanced cellular detoxification complex based on powerful detoxifiers and antioxidants, designed to accelerate the second phase of detoxification. Reduces oxidative stress at the cellular level, prevents intoxication caused by glycation, reduces chronic inflammation in connective tissue and the vascular wall, and provides immunoprotective and hepatoprotective effects. Contains ascorbyl palmitate (Vitamin C), selenium yeast, L-cysteine (glutathione precursor), dihydroquercetin, catalase, Vitamin E, barley sprout extract (superoxide dismutase, cytochrome oxidase), retinol palmitate (Vitamin A), and glutathione. Especially beneficial when the body's natural detox capacity is reduced by lack of sleep, stress, or nutritional deficiencies.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 63.99,
    priceEUR: 43,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cellular detoxification", "Oxidative stress reduction", "Anti-glycation", "Hepatoprotective action", "Immunoprotection", "Anti-inflammatory", "DNA protection"],
  },
  {
    id: "complex-3r",
    image: "/products/complex3r.jpg",
    name: "Complex 3R",
    description: "Multi-component antioxidant bioregulator combining three of the most powerful antioxidants: dihydroquercetin, resveratrol, and Coenzyme Q10. Dihydroquercetin impedes lipid peroxidation in cell membranes, protects vascular endothelium, enhances vascular elasticity, and prevents early cellular aging. Resveratrol binds and removes free radicals, exhibits anti-inflammatory properties, regulates blood lipid levels and cholesterol, and reduces blood viscosity for unobstructed blood flow. Coenzyme Q10 is a natural immunomodulator studied for its role in immune function, maintains energy metabolism in the heart muscle, and possesses geroprotective properties.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant defense", "Cardiovascular protection", "Supports normal immune function", "Anti-inflammatory", "Cholesterol regulation", "Geroprotective action"],
  },
  {
    id: "levain",
    image: "/products/levain.jpg",
    name: "Levain",
    description: "Modern adaptogenic complex combining nine powerful plant-based adaptogens. Activates the body's internal immune defenses while improving lymphatic circulation to reduce inflammation and stagnation. Has immunoregulatory and sedative effects. Increases the performance of tired skeletal muscles, improves lipid metabolism, is studied for its role in healthy circulation, and boosts immunity. Designed for periods of intense stress and fatigue.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Adaptogenic immune support", "Lymphatic circulation", "Anti-inflammatory", "Supports a balanced mood", "Muscle performance", "Lipid metabolism", "Supports healthy circulation", "Stress resilience"]
  },
  {
    id: "likam",
    image: "/products/likam.png",
    name: "Likam",
    description: "Comprehensive liver and bile duct support complex. Strengthens hepatic function, supports bile flow optimization, includes ingredients studied for their role in liver cell renewal, and supports normal metabolic processes for sustained energy and vitality. Beneficial for those seeking preventive liver care.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver health", "Bile duct support", "Studied for its role in liver cell renewal", "Bile flow optimization", "Supports normal metabolism"]
  },
  {
    id: "mamiton",
    image: "/products/felicita.jpg",
    name: "Mamiton",
    description: "Natural formula designed specifically for the female reproductive system, combining the best of herbal tradition and modern science. Fights oxidative stress and helps balance estrogen levels. Reduces risks linked to hormonal imbalances and aging. Active ingredients include resveratrol (antioxidant), motherwort and mint (sedative and antispasmodic), rosehip, nettle and knotweed (anti-inflammatory; studied for their role in tissue renewal), hops and laminaria (hormonal homeostasis and thyroid support), vitamins A and E (antioxidant and immune modulation), field horsetail (vascular and connective tissue strength), and Juglans regia pericarp (immunostimulatory). Recommended for women over 35, during perimenopause and the menopausal transition, and for monthly-cycle comfort.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 40.99,
    priceEUR: 27,
    rating: 4.8,
    sizes: 1,
    benefits: ["Hormonal balance", "Estrogen regulation", "Supports comfort during the menopausal transition", "PMS prevention", "Antioxidant protection", "Skin, hair and nail health", "Bone health"],
  },
  {
    id: "mesotel",
    image: "/products/mes.jpg",
    name: "Mesotel",
    description: "Foundational choline-based revitalization formula for brain, liver, and cardiovascular health. Supports cellular membrane integrity, promotes healthy neurotransmitter function, and provides antioxidant protection for deep systemic renewal.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 24.99,
    priceEUR: 19,
    rating: 4.8,
    sizes: 1,
    benefits: ["Brain health", "Liver support", "Cardiovascular protection", "Antioxidant action", "Cellular renewal"]
  },
  {
    id: "mesotel-beauty",
    image: "/products/mesbeauty.jpg",
    name: "Mesotel Beauty",
    description: "Choline-based antioxidant and neurotransmitter complex enriched with gotu kola extract, wolfberry (goji), zinc, and vitamins. Provides pronounced antioxidant effects. Enhances immunity, supports skin beauty, and includes ingredients studied for their role in cellular renewal.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 29.99,
    priceEUR: 21,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant protection", "Skin beauty support", "Immune enhancement", "Studied for its role in cellular renewal"]
  },
  {
    id: "olecap",
    image: "/products/panaxod.jpg",
    name: "Olecap",
    description: "Omega-3 angiorestorer combining premium salmon oil and flaxseed oil for comprehensive cardiovascular and metabolic health. Rich in EPA, DHA, and alpha-linolenic acid for arterial flexibility, healthy cholesterol levels, and anti-inflammatory vascular protection. Supports healthy endothelium function and promotes optimal blood flow.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 29.99,
    priceEUR: 22,
    rating: 4.8,
    sizes: 1,
    benefits: ["Omega-3 angiorestoration", "Cardiovascular protection", "Cholesterol support", "Anti-inflammatory vascular action", "Arterial flexibility", "Salmon and flaxseed oil formula"]
  },
  {
    id: "panaxod",
    image: "/products/panaxod.jpg",
    name: "Panaxod",
    description: "Premium ginseng adaptogen complex based on Panax ginseng and complementary botanicals. Enhances physical and mental performance, supports adrenal function, boosts immune resilience, and promotes healthy stress response. Helps combat fatigue, supports overall vitality, and promotes sustained energy through adaptogenic mechanisms.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 55.99,
    priceEUR: 37,
    rating: 4.8,
    sizes: 1,
    benefits: ["Ginseng adaptogenic support", "Physical and mental performance", "Immune resilience", "Healthy stress response", "Anti-fatigue action", "Sustained energy"]
  },
  {
    id: "pinalex-tab",
    image: "/products/pinalex.jpg",
    name: "Pinalex Tab",
    description: "Pinalex Tab is an eye-focused peptide bioregulator in tablet form formulated as part of the Peptides wellness and preventative nutrition line. It combines lutein (marigold extract), astaxanthin (Haematococcus microalgae), blueberry juice powder, grape peel extract, taurine, vitamin E, beta-carotene and B vitamins with the AA-6 peptide complex (lysine and glutamic acid). It is formulated to support normal visual function, help the eyes cope with intensive visual work and support eye tissues during age-related changes.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 55.99,
    priceEUR: 34,
    rating: 4.8,
    sizes: 1,
    benefits: ["Supports normal visual function", "Helps the eyes cope with intensive visual work", "Lutein, astaxanthin and blueberry with the AA-6 peptide complex", "Supports eye tissues during age-related changes"],
  },
  {
    id: "pangluin",
    image: "/products/pangluin.jpg",
    name: "Pangluin",
    description: "Pancreatic and metabolic support complex for healthy glucose metabolism and insulin sensitivity. Supports normal pancreatic function, promotes balanced blood sugar levels throughout the day, and helps maintain insulin receptor sensitivity. Beneficial for those seeking optimal pancreatic health.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Pancreatic function support", "Insulin sensitivity improvement", "Blood sugar balance", "Glucose metabolism optimization"]
  },
  {
    id: "previn",
    image: "/products/renefort.jpg",
    name: "Previn",
    description: "Natural and safe cardio- and vasoprotective nutraceutical containing two key active components: hesperidin and niacinamide (Vitamin B3/PP). Hesperidin is a bioflavonoid from citrus fruits that is studied for its role in healthy circulation, improves endothelium function, strengthens blood vessel walls, maintains vascular tone and contractility, provides a sugar-reducing effect, reduces 'bad' cholesterol, and normalizes free fatty acid levels. Niacinamide mitigates oxidative stress and slows premature cell senescence.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 24.99,
    priceEUR: 17,
    rating: 4.8,
    sizes: 1,
    benefits: ["Supports healthy circulation", "Endothelium protection", "Cholesterol reduction", "Antioxidant defense", "Cognitive protection"],
  },
  {
    id: "revimite",
    image: "/products/revimite.jpg",
    name: "Revimite",
    description: "Innovative nutraceutical for those who want to preserve natural energy, strong vitality, and active longevity. Its formula combines natural extracts, B vitamins, and iron to support nutrient balance and support the hematopoietic system. Contains pomegranate, green tea, echinacea, oats, grape seeds, ginger, soy, iron, B vitamins, and soy lecithin. These ingredients saturate the body with antioxidants, increase stress resistance, strengthen blood vessels, and help cells generate energy. Iron and B vitamins support blood formation and metabolism, while soy lecithin contributes to healthy brain and nervous system function. Recommended for weight loss, physical or emotional strain, reduced productivity, and recovery after exertion.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 24.99,
    priceEUR: 17,
    rating: 4.8,
    sizes: 1,
    benefits: ["Iron and B-vitamin replenishment", "Hematopoietic support", "Antioxidant protection", "Stress resilience", "Immune modulation", "Brain and nervous system support", "Supports everyday energy"],
  },
  {
    id: "reviplant",
    image: "/products/Reviform_3.jpg",
    name: "Reviplant",
    description: "Premium phytonutrient complex for liver and immune system support. Combines powerful botanical extracts with extracts studied for their role in cellular renewal, enhance hepatic detoxification pathways, support immune function, and provide broad-spectrum antioxidant and anti-inflammatory protection for systemic wellness.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 79.99,
    priceEUR: 53,
    rating: 4.8,
    sizes: 1,
    benefits: ["Phytonutrient liver support", "Immune system enhancement", "Studied for its role in cellular renewal", "Hepatic detoxification", "Anti-inflammatory protection", "Broad-spectrum antioxidant"]
  },
  {
    id: "reviform-cocktail",
    name: "Reviform Cocktail",
    image: "/products/Reviform.jpg",
    imageAlt: "Reviform Cocktail nutritional supplement",
    description: "Anti-aging nutritional shake combining high-quality protein, essential vitamins, and minerals for comprehensive body composition support and metabolic optimization. Supports healthy weight management, promotes lean muscle maintenance, and provides essential nutrients for active lifestyle, physical performance, and cellular renewal.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Anti-aging nutritional support", "Protein/vitamin/mineral complex", "Body composition optimization", "Lean muscle maintenance", "Active lifestyle nutrition", "Cellular renewal"]
  },
  {
    id: "revifort",
    image: "/products/Reviform.jpg",
    name: "Revifort",
    description: "Broad-spectrum formula combining four medicinal mushrooms — Shiitake, Reishi, Maitake, and Cordyceps — for the first time in a single formula. Contains glucans that stimulate the immune system. Promotes liver and cellular recovery after damage, stimulates the immune system, supports hematopoiesis, and provides natural detoxification support. Part of the immunity and energy activation trio alongside Ensil and Pinalex Tab.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 131.99,
    priceEUR: 88,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune fortification", "Liver recovery", "Hematopoiesis support", "Detoxification"],
  },
  {
    id: "regenart",
    image: "/products/renefort.jpg",
    name: "Regenart",
    description: "Joint regeneration complex for cartilage tissue repair and musculoskeletal health. Supports cartilage matrix restoration, promotes collagen synthesis in joint structures, provides anti-inflammatory protection, and helps maintain joint mobility and comfort. Beneficial for age-related joint changes.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint regeneration", "Cartilage tissue repair", "Collagen synthesis in joints", "Anti-inflammatory protection", "Supports the body's natural connective-tissue recovery processes", "Joint mobility"]
  },
  {
    id: "renefort",
    image: "/products/rene1.jpg",
    name: "Renefort",
    description: "Nephroprotective complex for kidney health and renal function support. Helps maintain healthy kidney filtration, is studied for its role in kidney tissue renewal, protects against oxidative stress in renal tissue, and promotes balanced urinary system function. Beneficial for those seeking preventive renal care.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nephroprotective action", "Kidney tissue support", "Renal filtration health", "Urinary system balance", "Oxidative stress defense"]
  },
  {
    id: "retisil",
    image: "/products/retisil4.jpg",
    name: "Retisil",
    description: "Advanced eye health formula with lutein, zeaxanthin, and complementary nutrients for comprehensive visual protection. Supports retinal health, protects against blue light and oxidative damage, maintains macular integrity, and promotes visual acuity. Beneficial for those with high screen exposure, age-related vision changes, or seeking preventive eye care.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21.99,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Retinal protection (lutein/zeaxanthin)", "Blue light defense", "Macular integrity", "Visual acuity support", "Age-related vision protection"]
  },
  {
    id: "rinolax",
    image: "/products/Alvenorm.jpg",
    name: "Rinolax",
    description: "Natural upper respiratory and ENT health complex for sinus, nasal, and throat support. Supports comfortable nasal breathing, reduces inflammation in the respiratory mucosa, supports healthy sinus function, and strengthens immune defense of the upper airways.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 55.99,
    priceEUR: 37,
    rating: 4.8,
    sizes: 1,
    benefits: ["Upper respiratory/ENT support", "Supports comfortable nasal breathing", "Sinus health", "Respiratory mucosa protection", "Upper airway immune defense"]
  },
  {
    id: "temero-genero",
    image: "/products/felicita.jpg",
    name: "Temero Genero",
    description: "Daily anti-aging formula combining two complementary complexes that together create a strong foundation for health and active longevity. Supports cellular renewal, hormonal balance, and systemic rejuvenation for sustained vitality.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 48.99,
    priceEUR: 33,
    rating: 4.8,
    sizes: 1,
    benefits: ["Daily anti-aging", "Cellular renewal", "Hormonal balance", "Active longevity", "Systemic rejuvenation"]
  },
  {
    id: "trezvon",
    image: "/products/felicita.jpg",
    name: "Trezvon",
    description: "Natural support formula for alcohol metabolism and liver protection. Helps accelerate alcohol breakdown, reduces toxic acetaldehyde accumulation, supports liver detoxification pathways, and promotes faster recovery after alcohol consumption. Essential for those seeking rapid alcohol recovery and hepatoprotective support.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 8.99,
    priceEUR: 6,
    rating: 4.8,
    sizes: 1,
    benefits: ["Alcohol metabolism acceleration", "Liver protection", "Acetaldehyde reduction", "Detoxification pathway support", "Rapid recovery"]
  },
  {
    id: "felicita",
    image: "/products/felicita.jpg",
    name: "Felicita",
    description: "Mood, serotonin, and dopamine support complex with adaptogenic and anxiolytic properties. Promotes healthy neurotransmitter balance for positive mood, supports stress resilience, and helps maintain emotional stability. Formulated to enhance serotonin and dopamine pathways for sustained wellbeing and mental clarity.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 36.99,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Serotonin/dopamine balance", "Mood enhancement", "Emotional stability", "Stress resilience", "Anxiolytic support", "Mental clarity"]
  },
  {
    id: "femalin",
    image: "/products/felicita.jpg",
    name: "Femalin",
    description: "Comprehensive female health formula that normalizes functions of the female organism. Supports hormonal balance, promotes healthy menstrual cycle regulation, and provides immune and metabolic support tailored to women's physiological needs.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 24.99,
    priceEUR: 17,
    rating: 4.8,
    sizes: 1,
    benefits: ["Female hormonal balance", "Menstrual cycle support", "Immune support", "Metabolic health", "Women's wellness"]
  },
  {
    id: "zinsil-t",
    image: "/products/zinsil1.jpg",
    name: "Zinsil-T",
    description: "Comprehensive zinc, glycine, and pyridoxine (Vitamin B6) complex for prolonging active longevity. Studied for its role in healthy aging, normal enzyme and hormone activity, and immune and antioxidant status. Glycine (500mg) reduces psycho-emotional stress, aggressiveness, and conflict; enhances mood; supports normal sleep; increases mental performance; and significantly improves zinc absorption. Zinc (8.6mg) is required for healthy functioning of all body cells, stimulates leukocyte production, supports T-lymphocytes and natural killer cells, corrects blood sugar levels, helps the pancreas produce insulin, improves skin conditions, and supports protein synthesis. Vitamin B6 ensures substance exchange, participates in neurotransmitter metabolism (serotonin, dopamine), supports red blood cell production, and is essential for protein, fat, and carbohydrate metabolism.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 19.99,
    priceEUR: 14,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune defense", "Hormonal balance", "Mood and sleep improvement", "Blood sugar regulation", "Cholesterol reduction", "Skin health", "Supports healthy antioxidant status", "Longevity support"],
  },
  {
    id: "ensil",
    image: "/products/ensil2.jpg",
    name: "Ensil",
    description: "Powerful formula of the latest generation, developed over more than six years of research. Markedly enhances tissue respiration processes and is studied for its role in tissue renewal. Contains Coenzyme Q10 (cellular energizer, antioxidant, immunomodulatory, hepatoprotective), nicotinamide (vital for NAD/NADPH coenzymes, tissue respiration, fat/protein/amino acid metabolism), folic acid (DNA replication, hematopoiesis, immune system development), echinacea (immune system fortification, anti-inflammatory), amber acid/succinic acid (strengthens immunity, stimulates insulin production, studied for its role in nervous system function, counteracts stress, neutralizes toxins), L-carnitine (fatty acid transport, cardiac muscle and immune support), B vitamins B1/B5/B6 (energy metabolism, immune and nervous system function), and Vitamins C and E (antioxidants, studied for their role in tissue renewal). Part of the immunity and energy activation trio.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 48.99,
    priceEUR: 33,
    rating: 4.8,
    sizes: 1,
    benefits: ["Tissue respiration enhancement", "Cellular energy metabolism", "Immune fortification", "Hematopoietic support", "Antioxidant defense", "Hepatoprotective action", "Nervous system support"],
  },
  {
    id: "anti-age-nb-activity",
    image: "/products/energystar3.jpg",
    name: "Anti-Age Complex NB Activity",
    description: "Energy concentrate and collagen activator from the Anti-Age Complex NB line. Stimulates collagen production, boosts cellular energy metabolism, and provides comprehensive anti-aging support for skin, connective tissue, and overall vitality.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 107.99,
    priceEUR: 70,
    rating: 4.9,
    sizes: 1,
    benefits: ["Collagen activation", "Cellular energy boost", "Anti-aging", "Skin vitality", "Connective tissue support"]
  },
  {
    id: "anti-age-nb-health",
    image: "/products/energystar1.jpg",
    name: "Anti-Age Complex NB Health",
    description: "AGE protector from the Anti-Age Complex NB line. Provides advanced protection against advanced glycation end-products (AGEs), the primary drivers of accelerated aging. Supports protein structure integrity, reduces oxidative damage, and promotes deep cellular rejuvenation.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 199.99,
    priceEUR: 130,
    rating: 4.9,
    sizes: 1,
    benefits: ["AGE protection", "Anti-glycation", "Protein structure integrity", "Oxidative damage reduction", "Cellular rejuvenation"]
  },
  {
    id: "thyreogen",
    name: "Thyreogen",
    description: "Thyreogen® (A-2) is the Thyroid Peptide Bioregulator containing the thyroid gland peptide complex from young calves. The isolated peptides act selectively on thyroid gland cells, studied for its role in thyroid cell metabolism and thyroid function. Studied for its role in supporting healthy thyroid function. Part of the female hormonal protocol: Zhenoluten + Thyreogen + Ventfort.",
    category: "PEPTIDE BIOREGULATORS",
    image: "/products/Thyreogen.jpg",
    imageAlt: "Thyreogen thyroid peptide bioregulator",
    priceUSD: 58.99,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Supports normal thyroid metabolism", "Female hormonal health", "Supports normal metabolism"],
    seriesInfo: "Recommended combination: Zhenoluten + Thyreogen + Ventfort for female health. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 58.99,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 153.99,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "gpl-femme",
    image: "/products/gplF.jpg",
    name: "GPL Femme",
    description: "Comprehensive female health protocol containing 65mg peptides per capsule: Epiphysis + Cerebrum + Vascular + Liver + Thyroid + Ovarian peptides + Alpha-lipoic acid. Formulated to support optimal function of the female reproductive, endocrine, cardiovascular, and nervous systems. Provides broad-spectrum support for hormonal balance, immune resilience, and active longevity.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 420,
    priceEUR: 280,
    rating: 4.9,
    sizes: 1,
    benefits: ["65mg multi-peptide complex per capsule", "Formulated to support the natural balance of the reproductive system", "Thyroid and ovarian peptide support", "Cardiovascular and nervous system health", "Hormonal balance", "Active longevity", "Healthy aging — epiphysis peptide studied as a geroprotector"],
    seriesInfo: "GPL Femme contains six targeted peptide complexes (Epiphysis, Cerebrum, Vascular, Liver, Thyroid, Ovarian) plus alpha-lipoic acid for comprehensive female wellness support."
  },
  {
    id: "gpl-man",
    image: "/products/GPL_M.jpg",
    name: "GPL Man",
    description: "Comprehensive male health protocol containing 65mg peptides per capsule: Epiphysis + Cerebrum + Vascular + Liver + Pancreatic + Testicular peptides + Alpha-lipoic acid. Supports systemic recovery and vitality during periods of intense physical stress or fatigue, and supports normal functioning of the cardiovascular, nervous, endocrine, and reproductive systems. Provides broad-spectrum support for male vitality and active longevity.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 420,
    priceEUR: 280,
    rating: 4.9,
    sizes: 1,
    benefits: ["65mg multi-peptide complex per capsule", "Formulated to support the natural balance of the reproductive system", "Pancreatic and testicular peptide support", "Cardiovascular and nervous system health", "Endocrine balance", "Active longevity", "Healthy aging — epiphysis peptide studied as a geroprotector"],
    seriesInfo: "GPL Man contains six targeted peptide complexes (Epiphysis, Cerebrum, Vascular, Liver, Pancreatic, Testicular) plus alpha-lipoic acid for comprehensive male wellness support."
  },
];

/** Full code catalog, including hidden products (data checks / admin import only). */
export const allProducts: Product[] = catalogProducts.map((p) => ({
  ...applyProductFacts(p),
  fulfillment: resolveFulfillment(p.id, p.fulfillment),
}));

/** Storefront catalog: everything except products hidden in shared/hidden-products.ts. */
export const products: Product[] = allProducts.filter((p) => !isHiddenProduct(p));

// Helper function to find a product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}
