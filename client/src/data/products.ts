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
  sizes: number;
  image?: string;
  imageAlt?: string;
  images?: string[];
  variants?: ProductVariant[];
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  seriesInfo?: string;
}

export const products: Product[] = [
  {
    id: "bonomarlot",
    image: "/products/Banomarlot.png",
    imageAlt: "Bonomarlot bone marrow peptide supplement bottle",
    name: "Bonomarlot",
    description: "Bonomarlot® (A-20) is the Bone Marrow Peptide Bioregulator — a natural Cytomax extract containing the bone marrow peptide complex from young calves. Bone marrow produces all red blood cells, platelets, and most white blood cells. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, Bonomarlot has clinically established effectiveness for restoring functional activity of the hematopoietic system in disorders of various origins. Available in 20-capsule, 60-capsule, and sublingual lingual formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 88,
    priceEUR: 52,
    rating: 4.8,
    sizes: 2,
    benefits: ["Restoring hematopoietic function", "Blood cell production (red cells, platelets, white cells)", "Anemia of various origins", "Complex oncology treatment support", "Low-quality nutrition effects recovery", "Immune system support"],
    ingredients: ["Bone marrow peptide complex (A-20)"],
    usage: "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial (10 days). Intensive: N60 format (2 caps twice daily for 30 days).",
    seriesInfo: "Recommended combination: Vladonix + Svetinorm + Endoluten + Bonomarlot for detox/immune recovery protocols. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 88,
        priceEUR: 52,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 210,
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
    description: "Cartalax® is a synthesized cytogen tripeptide (Ala-Glu-Asp, AED peptide T-31) developed by Prof. Khavinson. Fully synthesized, non-animal-derived, suitable for vegetarian/vegan protocols. Contains the most significant short peptide of the cartilage bioregulation system. Normalizes cartilage and connective tissue metabolism. Clinically studied for spinal osteochondrosis, osteoarthrosis, osteoporosis, and post-fracture recovery. Stimulates mesenchymal stem cell proliferation and reduces p53 expression in aging cartilage. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 74,
    priceEUR: 32,
    rating: 4.8,
    sizes: 2,
    benefits: ["Normalizes cartilage/connective tissue metabolism", "Osteochondrosis and osteoarthrosis support", "Osteoporosis management", "Post-fracture recovery", "Mesenchymal stem cell proliferation", "Vegan compatible (fully synthesized)", "Reduces p53 expression in aging cartilage"],
    ingredients: ["Cartilage peptide complex (AC-4)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Recommended combination: Cartalax + Vesugen + Crystagen for the cytogen locomotor apparatus protocol. Cytogens are synthesized short peptide bioregulators — the lab-made counterparts to natural Cytomaxes — developed by the St. Petersburg Institute of Bioregulation and Gerontology. Because they are synthesized rather than extracted, Cytogens provide faster action (effects within 1.5–2 months) compared to natural Cytomaxes (4–6 months)."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 74,
        priceEUR: 32,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 175,
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
    description: "Chelohart® (A-14) is the Heart Peptide Bioregulator containing the peptide complex of the cardiac muscle from young calves. Acts selectively on myocardial cells, normalizing cardiomyocyte metabolism. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for ischemic heart disease, hypertension, myocarditis, post-infarction cardiosclerosis, myocardial dystrophy, and heart failure. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Myocardial cell support", "Cardiomyocyte metabolism normalization", "Ischemic heart disease (IHD)", "Hypertension management", "Myocarditis support", "Post-infarction cardiosclerosis", "Heart failure support"],
    ingredients: ["Heart muscle peptide complex (A-14)"],
    usage: "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial. Intensive: N60 format.",
    seriesInfo: "Recommended combination: Ventfort + Chelohart + Vladonix for the cardiovascular system protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson. Effects last 4–6 months per course."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
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
    description: "Crystagen® is a synthesized cytogen (AC-6, thymus) — copies of natural peptide fractions that normalize immune system function. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for immune function restoration after infectious diseases, radiation/chemotherapy, and psychoemotional stress. In sports medicine: 80% of the Russian rhythmic gymnastics team did not contract influenza during use. The active tripeptide stimulates T-cells, B-cells, macrophages, NK cells, and exhibits antioxidant and stress-protective effects. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 74,
    priceEUR: 32,
    rating: 4.8,
    sizes: 2,
    benefits: ["T-cell, B-cell, and NK cell activation", "Macrophage stimulation", "Antioxidant and stress-protective effects", "Immunodeficiency recovery", "Chronic intoxication support", "Cancer prevention", "80% infection reduction demonstrated in athletes"],
    ingredients: ["Thymus peptide complex (AC-6)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Recommended combinations: Ovagen + Vesugen + Crystagen (digestive protocol); Crystagen + Pinealon + Vesugen (CNS protocol). Cytogens are synthesized short peptide bioregulators — the lab-made counterparts to natural Cytomaxes — providing faster action (effects within 1.5–2 months) compared to natural Cytomaxes (4–6 months)."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 74,
        priceEUR: 32,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 175,
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
    description: "Endoluten® (A-8) is the Pineal Peptide Bioregulator — the most foundational peptide in the Khavinson longevity protocol. Contains the epiphyseal peptide complex that regulates hormonal metabolism, acts on neuroendocrine system cells, normalizes pineal cell metabolism and melatonin secretion. Analog of pharmaceutical Epithalamin. Prof. Khavinson identifies Endoluten + Vladonix as capable of extending healthy lifespan by 30–40%. Clinically proven to lengthen telomeres. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 129,
    priceEUR: 85,
    rating: 4.8,
    sizes: 2,
    benefits: ["Most foundational Khavinson longevity peptide", "Melatonin secretion normalization", "Cyclic processes regulation", "Reproductive system regulation", "Immune system support", "Telomere lengthening", "Lifespan extension 30–40% (with Vladonix)"],
    ingredients: ["Pineal gland peptide complex (A-8)"],
    usage: "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial (10 days). Intensive: N60 format.",
    seriesInfo: "Vladonix + Endoluten is the foundational pairing for every Khavinson protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson. Clinical studies have shown that long-term use can increase mean lifespan by 20–40%."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 129,
        priceEUR: 85,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 298,
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
    description: "Gotratix® (A-18) is the Muscle Peptide Bioregulator containing muscle peptide complex from triceps of young animals. Clinically proven in 37 veteran athletes: +13–14% handgrip strength, +7% standing long jump, reduced fatigue, faster recovery. In female bodybuilders: 40–47% endurance improvement. Part of the physical activity protocol. Not classified as doping — provides non-hormonal muscle mass support. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Strength improvements (+13–14% handgrip)", "Endurance boost (40–47% in studies)", "Muscle fatigue reduction", "Reserve capacity increase", "Sarcopenia prevention", "Non-hormonal muscle mass support", "Not classified as doping"],
    ingredients: ["Muscle peptide complex (A-18)"],
    usage: "1–2 capsules 1–2 times daily with meals. Maintenance: 20-capsule vial. Intensive: N60 (2 caps twice daily for 30 days).",
    seriesInfo: "Recommended combination: Sigumir + Ventfort + Vladonix + Gotratix + Cerluten for physical activity protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
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
    description: "Pielotax® (A-9) is the Kidney Peptide Bioregulator containing kidney peptide complex from kidney parenchyma. Acts with targeted selectivity on kidney cells, normalizes metabolism and urinary system function. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for nephropathies, chronic pyelonephritis, glomerulonephritis, urolithiasis, and renal failure. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Nephropathy support", "Chronic pyelonephritis", "Glomerulonephritis", "Urolithiasis management", "Renal failure support", "Kidney cell metabolism normalization"],
    ingredients: ["Kidney peptide complex (A-9)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Recommended combination: Vladonix + Chitomur + Pielotax for urinary system protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson. Effects last 4–6 months per course."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
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
    description: "Built around IPH AGAP tetrapeptide — penetrates the blood-brain barrier, regulates neurometabolic processes, activates neuronal repair, and enhances cognitive functions. Enriched with magnesium N-acetyltaurate, choline bitartrate, GABA, nervonic acid, vitamin C, zinc, and biotin. Stimulates neurotransmitter synthesis, increases serotonin levels, and activates neuroplasticity genes in the hippocampus. Clinically proven to enhance memory, improve concentration, and support mental clarity during high cognitive demand and aging.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 140,
    priceEUR: 90,
    rating: 4.8,
    sizes: 1,
    benefits: ["Crosses blood-brain barrier", "Neuroplasticity activation", "Serotonin increase", "Neuroprotective antioxidant", "Myelin support", "Memory formation enhancement"],
    usage: "1–2 capsules daily. Course: 1–2 months."
  },
  {
    id: "prime-peptide-collagen",
    name: "Prime Peptide Collagen",
    image: "/products/pp-collagen.png",
    description: "Built around IPH AEN peptide — increases collagen and hyaluronic acid synthesis by 67%, boosts cellular reparative properties by 41%. Enriched with 800mg marine collagen, calcium bisglycinate, vitamin C, copper gluconate, and biotin. Premium formula utilizing IPH technology for comprehensive skin, hair, nail, and connective tissue support with enhanced cellular regeneration. Slows age-related changes by 18%.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 125,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["67% collagen/hyaluronic acid synthesis increase", "41% cellular repair boost", "Skin firmness restoration", "Hair growth support", "Nail strength", "Slows age-related changes 18%"],
    usage: "1–2 capsules daily with meals. Course: 1–2 months."
  },
  {
    id: "prime-peptide-joints",
    name: "Prime Peptide Joints",
    image: "/products/pp-joints.png",
    description: "Built around IPH AEN (increases hyaluronic acid synthesis 67%, cartilage regeneration 41%, activates COL2A1 gene) and IPH ESM (reduces joint pain and stiffness). Enriched with liposomal glucosamine, MSM with SNL technology, PEA, and ascorbyl palmitate. Advanced joint support utilizing IPH technology for deep cartilage penetration and targeted cellular repair.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 170,
    priceEUR: 110,
    rating: 4.8,
    sizes: 1,
    benefits: ["Inhibits cartilage degeneration 18%", "Type II collagen synthesis increase 16%", "Hyaluronic acid synthesis 67%", "Joint pain and stiffness reduction", "Deep cartilage penetration", "COL2A1 gene activation"],
    usage: "1–2 capsules daily with meals. Course: 1–2 months."
  },
  {
    id: "prime-peptide-omega",
    name: "Prime Peptide Omega",
    image: "/products/pp-omega.png",
    description: "Built around IPH T peptide — activates T-lymphocyte differentiation, restores thymus structure, and expands thymic growth zones by 28%. Enriched with Omega 3-6-9, vitamins C, E, D3, and zinc. Provides comprehensive immune and cardiovascular support with anti-inflammatory omega balance for healthy aging.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 125,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["T-cell activation and differentiation", "Thymus structure restoration", "Thymic growth zone expansion 28%", "Oncostatic effect", "Anti-inflammatory omega balance", "Cardiovascular support"],
    usage: "1–2 capsules daily with meals. Course: 1–2 months."
  },
  {
    id: "prime-peptide-protect",
    name: "Prime Peptide Protect",
    image: "/products/pp-protect.png",
    description: "Built around IPH REG (oncoprotective — reduces catalase 59.4%, SOD 72.2%) and IPH EP (increases p53 tumor suppressor by 61.9%, boosts melatonin 39–49%, reduces anxiety 58.9%). Enriched with broccoli/I3C, bioactive mushroom peptides, PEA, choline, zinc, selenium, and vitamin K2. Provides powerful oncoprotective defense, antioxidant protection, and tissue regeneration support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 170,
    priceEUR: 110,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant protection 44–72%", "p53 tumor suppressor increase 61.9%", "Apoptosis activation in mutated cells", "Melatonin boost 39–49%", "Anxiety reduction 58.9%", "Oncoprotective defense"],
    usage: "1–2 capsules daily with meals. Course: 1–2 months."
  },
  {
    id: "revilab-ml-01",
    image: "/products/RevilabML1.jpg",
    imageAlt: "Revilab ML 01 peptide complex for nervous system, immune, and cardiovascular support",
    name: "Revilab ML 01",
    description: "Multifunctional peptide complex combining epiphysis, immune B-cell, and liver peptides with resveratrol, choline, omega-3 fatty acids, and vitamins E, A, and C. Designed to support antioxidant protection, cerebral circulation, central nervous system function, immune system balance, and cardiovascular health. The peptide complexes send targeted signals to support the pineal gland's timing functions, the immune system's antibody production, and the liver's filtering capacity. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant protection", "Cerebral circulation", "CNS function", "Immune balance", "Cardiovascular health", "Liver support"],
    ingredients: ["Epiphysis peptide complex (AA-1)", "B-link immune peptide complex (AA-3)", "Liver peptide complex (AA-10)", "Resveratrol", "Choline bitartrate", "Omega-3 polyunsaturated fatty acids", "Vitamins E, A, C"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-02",
    image: "/products/RevilabML2.jpg",
    imageAlt: "Revilab ML 02 hematopoietic and immune support formula",
    name: "Revilab ML 02",
    description: "Peptide-based formula designed to support the hematopoietic (blood-forming) system, immune function, and metabolic balance. Combines T-cell immune peptides, B-cell immune peptides, bone marrow peptides, and liver peptides with omega-3 fatty acids and vitamins E, B6, and B9. Particularly beneficial during oncological treatments — supports the body's tolerance to chemotherapy and radiotherapy and helps maintain resistance to toxins and infections. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Hematopoietic support", "Immune function", "Metabolic balance", "Chemotherapy tolerance", "Toxin resistance", "Blood cell production"],
    ingredients: ["T-link immune peptide complex (AA-2)", "B-link immune peptide complex (AA-3)", "Bone marrow peptide complex (AA-4)", "Liver peptide complex (AA-10)", "Omega-3 polyunsaturated fatty acids", "Vitamins E, B6, B9"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-03",
    image: "/products/RevilabML3.jpg",
    imageAlt: "Revilab ML 03 nervous system and eye health formula",
    name: "Revilab ML 03",
    description: "Formulation combining brain, retina, and vascular wall peptides with astaxanthin, choline, omega-3 fatty acids, B vitamins, and marigold extract. Supports nervous system and eye health, including recovery after brain injuries and maintenance of visual function. Astaxanthin and marigold extract (rich in lutein and zeaxanthin) provide antioxidant protection for sensitive neural and retinal tissues. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nervous system support", "Eye and retinal health", "Brain recovery", "Visual function", "Antioxidant protection", "Nerve metabolism"],
    ingredients: ["Brain peptide complex (AA-5)", "Retina peptide complex (AA-6)", "Vascular wall peptide complex (AA-7)", "Astaxanthin", "Choline bitartrate", "Omega-3 polyunsaturated fatty acids", "Vitamins B1, B2, B6", "Marigold extract (lutein, zeaxanthin)"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-04",
    image: "/products/RevilabML4.jpg",
    imageAlt: "Revilab ML 04 cardiovascular support formula",
    name: "Revilab ML 04",
    description: "Cardiovascular support formula combining epiphysis, vascular wall, and heart muscle peptides with resveratrol, rutin, omega-3 fatty acids, and Vitamin PP (Niacin). Supports vascular integrity, heart muscle function, and healthy circulation. Resveratrol and rutin provide antioxidant and vascular support, while omega-3s and niacin contribute to cardiovascular function and healthy cholesterol metabolism. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular health", "Vascular integrity", "Heart muscle support", "Circulation", "Cholesterol metabolism", "Antioxidant protection"],
    ingredients: ["Epiphysis peptide complex (AA-1)", "Vascular wall peptide complex (AA-7)", "Heart muscle peptide complex (AA-8)", "Resveratrol", "Rutin", "Omega-3 polyunsaturated fatty acids", "Vitamin PP (Niacin)"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-05",
    image: "/products/RevilabML5.jpg",
    imageAlt: "Revilab ML 05 respiratory system support formula",
    name: "Revilab ML 05",
    description: "Respiratory system support formula featuring T-cell immune peptides, bronchi peptides, and lung/stomach wall peptides combined with omega-3 fatty acids, vitamins E and A, and licorice root extract. Supports respiratory function and immune defense in the lungs and bronchi. Vitamins and omega-3s provide antioxidant and anti-inflammatory support, while licorice root extract helps maintain respiratory tract comfort. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Respiratory health", "Bronchial support", "Immune defense", "Lung tissue integrity", "Anti-inflammatory", "Antioxidant protection"],
    ingredients: ["T-link immune peptide complex (AA-2)", "Bronchi peptide complex (AA-14)", "Lungs and stomach wall peptide complex (AA-15)", "Omega-3 polyunsaturated fatty acids", "Vitamins E, A", "Licorice root extract"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-06",
    image: "/products/RevilabML6.jpg",
    imageAlt: "Revilab ML 06 gastrointestinal and liver support formula",
    name: "Revilab ML 06",
    description: "Gastrointestinal and liver support formula combining liver, pancreas, and stomach wall peptides with omega-3 fatty acids, licorice root extract, artichoke fruit extract, plantain leaves extract, and strawberry leaves extract. Supports digestive health and metabolic balance. Botanical extracts provide soothing and antioxidant effects, while omega-3s support overall tissue health. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver health", "Digestive support", "Pancreatic function", "Metabolic balance", "Detoxification", "Gastric mucosa protection"],
    ingredients: ["Liver peptide complex (AA-10)", "Pancreas peptide complex (AA-11)", "Lungs and stomach wall peptide complex (AA-15)", "Omega-3 polyunsaturated fatty acids", "Licorice root extract", "Artichoke fruit extract", "Plantain leaves extract", "Strawberry leaves extract"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-07",
    image: "/products/RevilabML7.jpg",
    imageAlt: "Revilab ML 07 male reproductive and urinary system support",
    name: "Revilab ML 07",
    description: "Male reproductive and urinary system support formula combining epiphysis, vascular wall, testes, and bladder peptides with omega-3 fatty acids, L-carnitine, and zinc citrate. Supports hormonal balance, sperm function, and urinary health. L-carnitine supports energy metabolism in sperm cells, while zinc is essential for reproductive health and hormone regulation. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Male reproductive health", "Hormonal balance", "Sperm motility", "Urinary health", "Testosterone support", "Vascular health"],
    ingredients: ["Epiphysis peptide complex (AA-1)", "Vascular wall peptide complex (AA-7)", "Testes peptide complex (AA-12)", "Bladder peptide complex (AA-13)", "Omega-3 polyunsaturated fatty acids", "L-carnitine", "Zinc citrate"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-08",
    image: "/products/RevilabML8.jpg",
    imageAlt: "Revilab ML 08 female reproductive and skeletal system support",
    name: "Revilab ML 08",
    description: "Female reproductive, neuroendocrine, urinary, and skeletal system support formula combining epiphysis, vascular wall, cartilage, and bladder peptides with omega-3 fatty acids, resveratrol, and arginine. Supports hormonal balance, fertility, bone health, and urinary function. Resveratrol provides antioxidant support and hormonal balance, while arginine helps maintain healthy circulation and tissue repair. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Female reproductive health", "Hormonal balance", "Bone and cartilage health", "Urinary function", "Neuroendocrine support", "Antioxidant protection"],
    ingredients: ["Epiphysis peptide complex (AA-1)", "Vascular wall peptide complex (AA-7)", "Cartilage peptide complex (AA-9)", "Bladder peptide complex (AA-13)", "Omega-3 polyunsaturated fatty acids", "Resveratrol", "Arginine"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-ml-09",
    image: "/products/RevilabML9.jpg",
    imageAlt: "Revilab ML 09 musculoskeletal and joint support formula",
    name: "Revilab ML 09",
    description: "Musculoskeletal support formula combining B-cell immune, vascular wall, and cartilage peptides with chondroitin sulfate, omega-3 fatty acids, superoxide dismutase (SOD), catalase, and carnosine. Chondroitin sulfate and omega-3s help maintain joint mobility and reduce inflammation, while antioxidant enzymes SOD and catalase protect tissues from oxidative stress. Carnosine supports antioxidant protection and tissue repair. Take 1 capsule daily in the morning on an empty stomach.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 185,
    priceEUR: 80,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint health", "Cartilage integrity", "Connective tissue support", "Anti-inflammatory", "Antioxidant defense", "Immune balance"],
    ingredients: ["B-link immune peptide complex (AA-3)", "Vascular wall peptide complex (AA-7)", "Cartilage peptide complex (AA-9)", "Chondroitin sulfate", "Omega-3 polyunsaturated fatty acids", "Superoxide dismutase (SOD)", "Catalase", "Carnosine"],
    usage: "Take 1 capsule daily in the morning on an empty stomach. Course: 4–6 weeks. May be repeated 1–2 times per year.",
    seriesInfo: "The Revilab ML series features multifunctional peptide capsules that take an all-in-one approach to healthy aging. Each capsule combines targeted short peptides (2–10 amino acids) with antioxidants, essential fatty acids, vitamins, and botanical extracts — all working together to support natural organ function, maintain metabolic balance, and assist the body's recovery processes. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, these formulas are designed to support various internal systems including the nervous, immune, cardiovascular, respiratory, gastrointestinal, reproductive, and musculoskeletal systems."
  },
  {
    id: "revilab-pro-elements",
    name: "Revilab Pro Elements",
    description: "New-generation biologically active complex developed to support key body systems at the cellular level. Contains balanced combination of micro- and macroelements, vitamins, and bioactive compounds including glycine, calcium citrate, magnesium citrate, zinc citrate, vitamins A, E, D3, B6, and chromium picolinate. Strengthens immune resilience, protects against stress, slows aging processes, and promotes deep cellular restoration.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 155,
    priceEUR: 70,
    rating: 4.8,
    sizes: 1,
    image: "/products/revilab-pro-elements.jpg",
    imageAlt: "Revilab Pro Elements vitamin-mineral complex with micro-elements premix",
    benefits: [
      "Deep cellular restoration",
      "Comprehensive nutritional support",
      "Antioxidant protection",
      "Replenishes collagen deficiency",
      "Optimal mineral balance",
      "Increased vitality"
    ],
    seriesInfo: "The Revilab Preparation series represents advanced nutraceuticals developed for anti-aging and systemic support. Each product is enriched with active components that work at the cellular level to support internal restoration, slow aging processes, normalize organ and system functions, balance metabolism, and activate detoxification pathways. For enhanced rejuvenating effects, these products are recommended for combined use."
  },
  {
    id: "mesotel-neo",
    name: "Mesotel Neo",
    description: "Advanced anti-aging liquid formula based on choline, enriched with gotu kola and wolfberry extracts, zinc, vitamins and resveratrol. Powerful antioxidant with antiviral and antimicrobial properties. Promotes detoxification, strengthens immunity, improves cardiovascular and nervous system function, prevents atherosclerosis, and stimulates cellular regeneration for youthful skin.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 44.44,
    priceEUR: 23,
    rating: 4.8,
    sizes: 1,
    image: "/products/mesotel-neo.png",
    imageAlt: "Mesotel Neo anti-aging liquid supplement with gotu kola, wolfberry, and resveratrol",
    benefits: [
      "Improves cerebral circulation",
      "Prevents atherosclerosis",
      "Antioxidant protection",
      "Enhances immunity",
      "Prevents aging",
      "Stimulates cell regeneration"
    ]
  },
  {
    id: "revilab-sl-01",
    image: "/products/sl_1-228x228.jpg",
    imageAlt: "Revilab SL 01 sublingual cardiovascular support",
    name: "Revilab SL 01",
    description: "Sublingual cardiovascular support complex delivering peptides directly into the bloodstream through the mucous membrane for rapid absorption. Combines vascular wall and cardiac muscle peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides signal heart and vascular cells to maintain their natural function. Dihydroquercetin supports blood vessel integrity and elasticity. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular support", "Heart muscle health", "Vascular integrity", "Rapid sublingual absorption", "Antioxidant protection", "Circulation support"],
    ingredients: ["Vascular wall peptide complex (AA-7)", "Cardiac muscle peptide complex (AA-8)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-02",
    image: "/products/sl_2-228x228.jpg",
    imageAlt: "Revilab SL 02 sublingual nervous system and eye support",
    name: "Revilab SL 02",
    description: "Sublingual complex for nervous system and eye health. Combines brain, retina, and vascular wall peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Brain and retina peptides support neural and visual cells, while vascular peptides help maintain the blood vessels that nourish these tissues. Supports cerebral circulation, retinal function, and visual comfort. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nervous system support", "Eye and retinal health", "Cerebral circulation", "Visual comfort", "Rapid absorption", "Neuroprotection"],
    ingredients: ["Brain peptide complex (AA-5)", "Retina peptide complex (AA-6)", "Vascular wall peptide complex (AA-7)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-03",
    image: "/products/RevilabSL3.jpg",
    imageAlt: "Revilab SL 03 sublingual immune and neuroendocrine support",
    name: "Revilab SL 03",
    description: "Sublingual complex for immune system regulation and neuroendocrine balance. Combines pineal gland, T-cell immune, and B-cell immune peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Pineal peptides support biological rhythm regulation and immune signaling. T- and B-cell peptides help maintain immune balance and antibody production. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune regulation", "Neuroendocrine balance", "Biological rhythm support", "T-cell and B-cell function", "Rapid absorption", "Antioxidant defense"],
    ingredients: ["Pineal gland peptide complex (AA-1)", "T-cell immune peptide complex (AA-2)", "B-cell immune peptide complex (AA-3)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-04",
    image: "/products/RevilabSL4.png",
    imageAlt: "Revilab SL 04 sublingual musculoskeletal support",
    name: "Revilab SL 04",
    description: "Sublingual complex for joint, muscle, and bone health. Combines B-cell immune, cartilage, and muscle peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides act as signals to cartilage, muscle, and immune cells to support their natural maintenance. Plant extracts and antioxidants help protect tissues and support metabolic balance. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint health", "Muscle support", "Cartilage maintenance", "Bone health", "Rapid absorption", "Anti-inflammatory"],
    ingredients: ["B-cell immune peptide complex (AA-3)", "Cartilage peptide complex (AA-9)", "Muscle peptide complex (AA-17)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-05",
    image: "/products/RevilabSL5.jpg",
    imageAlt: "Revilab SL 05 sublingual gastrointestinal support",
    name: "Revilab SL 05",
    description: "Sublingual complex for liver, pancreas, stomach, and gallbladder health. Combines liver, pancreas, and stomach wall peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides support the natural function of digestive and detoxification organs. Plant extracts and antioxidants provide additional support to maintain healthy metabolic processes. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver health", "Pancreatic support", "Digestive function", "Detoxification", "Gastric mucosa protection", "Rapid absorption"],
    ingredients: ["Liver peptide complex (AA-10)", "Pancreas peptide complex (AA-11)", "Lungs and stomach wall peptide complex (AA-15)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-06",
    image: "/products/sl_6-228x228.jpg",
    imageAlt: "Revilab SL 06 sublingual respiratory support",
    name: "Revilab SL 06",
    description: "Sublingual complex for respiratory system health and immune response in the lungs and bronchi. Combines B-cell immune, bronchi, and lung/stomach wall peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides help maintain immune and tissue health in the respiratory tract. Plant extracts and antioxidants support respiratory comfort and tissue resilience. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Respiratory health", "Bronchial support", "Lung tissue integrity", "Immune defense", "Rapid absorption", "Anti-inflammatory"],
    ingredients: ["B-cell immune peptide complex (AA-3)", "Bronchi peptide complex (AA-14)", "Lungs and stomach wall peptide complex (AA-15)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-07",
    image: "/products/RevilabSL7.jpg",
    imageAlt: "Revilab SL 07 sublingual hematopoietic support",
    name: "Revilab SL 07",
    description: "Sublingual complex for healthy blood formation and immune function. Combines B-cell immune, bone marrow, and vascular wall peptides with Vitamins B1 (thiamine) and B12 (cobalamin), licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Bone marrow peptides support blood cell production, B vitamins aid energy and nerve function, and vascular peptides support circulatory health. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Hematopoietic support", "Blood cell production", "Immune function", "Energy metabolism", "Nerve health", "Rapid absorption"],
    ingredients: ["B-cell immune peptide complex (AA-3)", "Bone marrow peptide complex (AA-4)", "Vascular wall peptide complex (AA-7)", "Vitamin B1 (thiamine)", "Vitamin B12 (cobalamin)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-08",
    image: "/products/RevilabSL8.jpg",
    imageAlt: "Revilab SL 08 sublingual urinary system support",
    name: "Revilab SL 08",
    description: "Sublingual complex for urinary tract health and function. Combines T-cell immune, vascular wall, and bladder peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides support immune and vascular health related to the urinary system. Plant extracts and antioxidants help maintain tissue comfort and function. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Urinary tract health", "Bladder support", "Immune defense", "Vascular health", "Rapid absorption", "Tissue comfort"],
    ingredients: ["T-cell immune peptide complex (AA-2)", "Vascular wall peptide complex (AA-7)", "Bladder peptide complex (AA-13)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-sl-09",
    image: "/products/RevilabSL99.jpg",
    imageAlt: "Revilab SL 09 sublingual male reproductive support",
    name: "Revilab SL 09",
    description: "Sublingual complex for male reproductive system function and prostate health. Combines pineal gland, testes, bladder, and prostate peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides signal the reproductive organs and neuroendocrine system to support natural function. Plant extracts and antioxidants help maintain tissue health and hormonal balance. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Male reproductive health", "Prostate support", "Hormonal balance", "Testicular function", "Urinary health", "Rapid absorption"],
    ingredients: ["Pineal gland peptide complex (AA-1)", "Testes peptide complex (AA-12)", "Bladder peptide complex (AA-13)", "Prostate peptide complex (AA-16)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "testoluten",
    image: "/products/testoluten.jpeg",
    imageAlt: "Testoluten testicular peptide for male health",
    name: "Testoluten",
    description: "Testicular peptide bioregulator (A-13) developed by the St. Petersburg Institute of Bioregulation and Gerontology. Supports male reproductive system cells by increasing functional activity and enhancing sperm motility. Helps maintain metabolic balance and functional activity in the testes, supporting natural reproductive processes and testosterone production. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Male reproductive health", "Sperm motility", "Testosterone support", "Testicular function", "Hormonal balance", "Vitality"],
    ingredients: ["Testicular peptide complex (A-13)"],
    usage: "Prevention: 1 capsule twice daily with meals for 30 days. Repeat every 4–6 months.",
    seriesInfo: "Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research at the St. Petersburg Institute of Bioregulation and Gerontology under Prof. Vladimir Khavinson. Each Cytomax contains a tissue-specific peptide complex that acts as a biological messenger, signaling the corresponding organ's cells to normalize their metabolism and restore functional activity. Clinical studies have shown that long-term use of Cytomaxes can increase mean lifespan by 20–40%, slow age-related biomarker changes, and significantly decrease mortality rates in aging populations. Effects last 4–6 months per course."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "ventfort",
    name: "Ventfort",
    image: "/products/ventfort.png",
    description: "Ventfort® (A-3) is the Blood Vessel Peptide Bioregulator. Prof. Khavinson recommends including Ventfort in EVERY peptide combination protocol. Acts on vascular wall cells, normalizes metabolism, and regulates vascular functions. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for hypertension, atherosclerosis, ischemic heart disease, varicose disease, and hemorrhoids. In bodybuilders: 40–47% endurance improvement when combined with Gotratix Lingual. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Most universally recommended peptide bioregulator", "Hypertension management", "Atherosclerosis support", "Ischemic heart disease (IHD)", "Varicose disease", "Include in every peptide protocol"],
    ingredients: ["Vascular peptide complex (A-3)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Include Ventfort in every peptide protocol. Recommended combination: Ventfort + Chelohart + Vladonix for cardiovascular system. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
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
    description: "Vesugen® is a synthesized cytogen for the vascular system. Normalizes vessels of circulatory and lymphatic channels. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for atherosclerosis of heart, brain, and lower extremity vessels, as well as impaired microcirculation. Used by the Russian Olympic rhythmic gymnastics team for vascular health maintenance. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 74,
    priceEUR: 32,
    rating: 4.8,
    sizes: 2,
    benefits: ["Atherosclerosis management", "Microcirculation improvement", "Varicose veins support", "Hypertension", "Thrombophlebitis prevention", "Lymphatic vessel normalization"],
    ingredients: ["Vascular peptide complex (AS-2)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Universal cytogen — appears in all major protocol stacks. Cytogens are synthesized short peptide bioregulators — the lab-made counterparts to natural Cytomaxes — providing faster action (effects within 1.5–2 months) compared to natural Cytomaxes (4–6 months)."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 74,
        priceEUR: 32,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 175,
        priceEUR: 86,
        inStock: true
      }
    ]
  },
  {
    id: "visoluten",
    name: "Visoluten",
    image: "/products/visoluten.png",
    description: "Visoluten® (A-11) is the Retina Peptide Bioregulator with targeted effect on retina, ciliary muscles, and conjunctiva. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for degenerative-dystrophic retinal diseases, glaucoma, cataracts (initial stages), diabetic retinal angiopathy, and post-traumatic corneal dystrophy. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Visual organ restoration", "Retina, ciliary muscle, and conjunctiva support", "Glaucoma management", "Cataract prevention (initial stages)", "Diabetic retinal angiopathy", "Post-traumatic corneal dystrophy"],
    ingredients: ["Eye tissue peptide complex (A-11)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Recommended combination: Visoluten + Cerluten + Ventfort for visual organ support protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "vladonix",
    name: "Vladonix",
    image: "/products/vladonix.png",
    description: "Vladonix® (A-6) is one of the two most important Khavinson peptides alongside Endoluten. Contains thymus peptide complex — analog of pharmaceutical Thymalin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology. Clinically established for complex immunity restoration. Vladonix + Endoluten can extend healthy lifespan by 30–40%. Core component of virtually every Khavinson combination protocol. Available in 20-capsule and 60-capsule formats.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Most foundational immune peptide", "Thymalin analog", "Immunodeficiency restoration", "Oncology prevention", "Chronic intoxication recovery", "Post-stroke/heart attack rehabilitation", "Lifespan extension 30–40% (with Endoluten)"],
    ingredients: ["Thymus peptide complex (A-6)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 30 days. Repeat every 3–6 months.",
    seriesInfo: "Endoluten + Vladonix is the foundational pairing for every Khavinson protocol. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson."
  ,
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
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
    priceUSD: 117.00,
    priceEUR: 106.36,
    rating: 4.9,
    sizes: 1,
    image: "/products/anti-wrinkle-serum-7-a.jpg",
    benefits: [
      "Instant lifting effect",
      "Smooths deep wrinkles",
      "Restores collagen skeleton",
      "Improves skin elasticity",
      "Deep moisturization",
      "Tightens facial oval"
    ],
    ingredients: [
      "Matrixyl® synthe'6™ (palmitoyl tripeptide-38)",
      "Progeline™ (acetyl tripeptide-2)",
      "Liftessense™ (Cyathea cumingii extract)",
      "Low molecular weight hyaluronic acid",
      "CO2 pomegranate extract",
      "Evening primrose oil"
    ],
    usage: "Apply a few drops to clean skin on face, neck, and décolleté. Use 1-2 times daily. For best results, use regularly for 28-30 days, 3-4 times per year."
  },
  {
    id: "revilab-sl-10",
    image: "/products/RevilabSL10.jpg",
    imageAlt: "Revilab SL 10 sublingual female reproductive support",
    name: "Revilab SL 10",
    description: "Sublingual complex for female neuroendocrine and reproductive system health, including cyclic regulation and menopausal support. Combines pineal gland, vascular wall, and bladder peptides with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Peptides support neuroendocrine signaling and reproductive tissue maintenance. Plant extracts and antioxidants provide supportive effects for overall female health and comfort. Place 4–6 drops on the mucous membrane of the mouth in the morning.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 86,
    priceEUR: 30,
    rating: 4.8,
    sizes: 1,
    benefits: ["Female reproductive health", "Hormonal cycle regulation", "Menopausal support", "Neuroendocrine balance", "Urinary health", "Rapid absorption"],
    ingredients: ["Pineal gland peptide complex (AA-1)", "Vascular wall peptide complex (AA-7)", "Bladder peptide complex (AA-13)", "Licorice extract", "Propolis extract", "Mint extract", "Essential oils of chamomile and clove", "Dihydroquercetin"],
    usage: "Place 4–6 drops on the mucous membrane of the mouth in the morning. Course: 4–6 weeks. May be repeated as needed.",
    seriesInfo: "The Revilab SL series is a pioneering line of sublingual peptide complexes that deliver active peptides and plant extracts directly into the bloodstream through the mucous membrane under the tongue. This method bypasses digestion and liver metabolism, allowing for faster and more efficient absorption — with effects typically within 2–5 minutes. Each 10 ml bottle combines targeted peptide complexes with licorice extract, propolis extract, mint extract, essential oils of chamomile and clove, and dihydroquercetin. Developed by the St. Petersburg Institute of Bioregulation and Gerontology, each formula targets a specific body system for focused support."
  },
  {
    id: "revilab-anti-age",
    name: "Revilab Anti-A.G.E.",
    description: "Powerful anti-glycation supplement with deglycating and antioxidant effects. Contains carnosine, astaxanthin, and alpha-lipoic acid to prevent protein degradation.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 250,
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
      "Normalizes cellular metabolism"
    ],
    ingredients: [
      "Carnosine (beta-alanyl-L-histidine)",
      "Astaxanthin (100x more effective than vitamin E)",
      "Alpha-lipoic acid (vitamin N)",
      "Rosemary extract",
      "Taurine"
    ],
    usage: "Take 1 capsule per day during meals. Course duration: 4-6 weeks. Can be repeated as necessary throughout the year.",
    seriesInfo: "The Revilab Preparation series represents advanced nutraceuticals developed for anti-aging and systemic support. Each product is enriched with active components that work at the cellular level to support internal restoration, slow aging processes, normalize organ and system functions, balance metabolism, and activate detoxification pathways. For enhanced rejuvenating effects, these products are recommended for combined use."
  },
  {
    id: "alvenorm-forte",
    name: "Alvenorm Forte",
    description: "Advanced formula for brain health and sleep architecture support. Helps normalize healthy sleep patterns, supports deep restorative sleep, and promotes optimal brain function during rest. Beneficial for those experiencing sleep disturbances, irregular sleep-wake cycles, or reduced sleep quality due to stress and aging.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 83,
    priceEUR: 33,
    rating: 4.8,
    sizes: 1,
    benefits: ["Healthy sleep architecture", "Deep restorative sleep", "Brain health during rest", "Sleep-wake cycle normalization", "Stress-related sleep support"]
  },
  {
    id: "volustom",
    name: "Volustom",
    image: "/products/Volustom.jpg",
    imageAlt: "Volustom gastrointestinal health supplement",
    description: "Adsorbent dietary fiber complex for detoxification and weight management. Comprehensive gastrointestinal support formula that helps normalize digestive function, supports the gastric mucosa, promotes healthy gut microbiome balance, and facilitates the body's natural detox pathways through fiber-based adsorption.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 72,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Adsorbent detoxification", "Weight management support", "Gastric mucosa protection", "Digestive normalization", "Gut microbiome balance", "Dietary fiber supplementation"]
  },
  {
    id: "getrufline",
    name: "Getrufline",
    description: "Europe's first herbal truffle-form antiparasitic complex, developed in conjunction with leading experts at the Institute of Innovative Biomedical Technology. 100% natural composition, EU-certified, GMO-free, and low in fat. Getrufline provides a threefold benefit in one truffle: anthelmintic action (interferes with reproduction of the majority of helminths), antibacterial action (against intestinal bacteria), and fungistatic action (effective against Candida fungi). The truffle form is uniquely effective — chewing creates a 'lump' that treats the intestinal mucosa along its entire length, while the bitterness activates non-specific immunity and triggers bile secretion with bacteriostatic properties. Also beneficial for dysbacteriosis following antibiotic therapy.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 63,
    priceEUR: 22,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antiparasitic (anthelmintic)", "Antibacterial", "Antifungal (Candida)", "Gut microbiome support", "Immune activation", "Post-antibiotic recovery"],
    usage: "Chew 1 truffle thoroughly per day for 6–12 days. Wash down with water. Honey may be added to reduce bitterness."
  },
  {
    id: "gelmigon",
    name: "Gelmigon",
    description: "Natural antiparasitic complex with choleretic, antispasmodic, anti-toxic, and anti-inflammatory effects. Contains plant extracts for prevention and support against helminthiasis. Supports liver and digestive tract health during and after antiparasitic protocols.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antiparasitic support", "Choleretic action", "Anti-inflammatory", "Digestive protection", "Detoxification"]
  },
  {
    id: "digemax",
    name: "Digemax",
    description: "Digestive enzyme and support complex for optimal gastrointestinal function. Helps normalize digestion, supports nutrient absorption, and reduces digestive discomfort. Beneficial for those with digestive insufficiency or irregular digestive function.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Digestive enzyme support", "Nutrient absorption", "Gut comfort", "Gastrointestinal health"]
  },
  {
    id: "imusil",
    name: "Imusil",
    description: "Immune and skin support complex with immunomodulatory and adaptogenic properties. Strengthens natural defense mechanisms, supports cellular immunity, promotes healthy skin barrier function, and helps the body adapt to physical and environmental stress. Beneficial for those with weakened immunity or skin health concerns.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune modulation", "Skin health support", "Cellular immunity", "Skin barrier function", "Stress adaptation", "Natural defense support"]
  },
  {
    id: "indosine",
    name: "Indosine",
    description: "Complex bioregulator for cancer prevention combining indole-3-carbinol, broccoli extract, Coenzyme Q10, superoxide dismutase, catalase, and milky white iris grass. Regulates cell proliferation, modulates immunity, reduces risk of gastrointestinal and respiratory tumors, and prevents hormone-dependent tumor development. Provides powerful antioxidant and oncoprotective defense.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 94,
    priceEUR: 37,
    rating: 4.8,
    sizes: 1,
    benefits: ["Oncoprotective defense", "Immune regulation", "Cell proliferation control", "Antioxidant protection", "Hormone balance"],
    ingredients: ["Indole-3-carbinol", "Broccoli extract", "Coenzyme Q10", "Superoxide dismutase", "Catalase", "Milky white iris grass extract"],
    usage: "Take 1-2 tablets once daily before meals. Prophylactic course: minimum 1 month. Therapeutic course: 2 months or more."
  },
  {
    id: "calsil-t",
    name: "Calsil-T",
    description: "Potent, balanced calcium and magnesium formula for bone, teeth, muscle, and nervous system health. Calcium strengthens bones and teeth and supports muscle function. Magnesium promotes energy metabolism and nervous system balance. A solid foundation for structural and functional health.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 45,
    priceEUR: 13,
    rating: 4.8,
    sizes: 1,
    benefits: ["Bone and teeth strength", "Muscle function", "Nervous system support", "Energy metabolism", "Calcium-magnesium balance"]
  },
  {
    id: "complex-3d",
    name: "Complex 3D",
    description: "Advanced cellular detoxification complex based on powerful detoxifiers and antioxidants, designed to accelerate the second phase of detoxification. Reduces oxidative stress at the cellular level, prevents intoxication caused by glycation, reduces chronic inflammation in connective tissue and the vascular wall, and provides immunoprotective and hepatoprotective effects. Contains ascorbyl palmitate (Vitamin C), selenium yeast, L-cysteine (glutathione precursor), dihydroquercetin, catalase, Vitamin E, barley sprout extract (superoxide dismutase, cytochrome oxidase), retinol palmitate (Vitamin A), and glutathione. Especially beneficial when the body's natural detox capacity is reduced by lack of sleep, stress, chronic disease, or nutritional deficiencies.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 110,
    priceEUR: 43,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cellular detoxification", "Oxidative stress reduction", "Anti-glycation", "Hepatoprotective action", "Immunoprotection", "Anti-inflammatory", "DNA protection"],
    ingredients: ["Ascorbyl palmitate (Vitamin C)", "Selenium yeast", "L-cysteine", "Dihydroquercetin", "Catalase", "Vitamin E", "Barley sprout extract", "Retinol palmitate (Vitamin A)", "Glutathione"],
    usage: "Take 1 capsule daily with meals. Duration: 4–6 weeks. Course may be repeated throughout the year."
  },
  {
    id: "complex-3r",
    name: "Complex 3R",
    description: "Multi-component antioxidant bioregulator combining three of the most powerful antioxidants: dihydroquercetin, resveratrol, and Coenzyme Q10. Dihydroquercetin impedes lipid peroxidation in cell membranes, protects vascular endothelium, enhances vascular elasticity, reduces edema, and prevents early cellular aging. Resveratrol binds and removes free radicals, exhibits anti-inflammatory and cancer-protective properties, regulates blood lipid levels and cholesterol, and reduces blood viscosity for unobstructed blood flow. Coenzyme Q10 is a natural immunomodulator that restores immune function, exerts antihypertensive effects, maintains energy metabolism in the heart muscle, and possesses geroprotective properties. Recommended for immunodeficiencies, chronic diseases, frequent viral infections, lipid metabolism disorders, cardiovascular prevention, and oncoprophylaxis.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 72,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant defense", "Cardiovascular protection", "Immune restoration", "Anti-inflammatory", "Cholesterol regulation", "Oncoprotection", "Geroprotective action"],
    ingredients: ["Dihydroquercetin", "Resveratrol", "Coenzyme Q10"],
    usage: "Take as directed. Recommended for immunodeficiencies, chronic diseases, lipid metabolism disorders, and cardiovascular prevention."
  },
  {
    id: "levain",
    name: "Levain",
    description: "Modern adaptogenic complex from Peptides' oncoprotection line, combining nine powerful plant-based adaptogens. Activates the body's internal immune defenses while improving lymphatic circulation to reduce inflammation and stagnation. Has antidepressant, immunoregulatory, and sedative effects. Increases the performance of tired skeletal muscles, improves lipid metabolism, normalizes blood pressure, and boosts immunity. Designed for those recovering under intense stress, frequent illness, weakened immunity, and chronic fatigue. Whether dealing with a cold brought on by overwork or recovering from a serious condition, Levain delivers targeted support where the body needs it most.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 72,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Adaptogenic immune support", "Lymphatic circulation", "Anti-inflammatory", "Antidepressant effect", "Muscle performance", "Lipid metabolism", "Blood pressure normalization", "Stress resilience"]
  },
  {
    id: "likam",
    name: "Likam",
    description: "Comprehensive liver and bile duct support complex. Strengthens hepatic function, supports bile flow optimization, promotes liver cell regeneration, and helps normalize metabolic processes for sustained energy and vitality. Beneficial for those with biliary dysfunction or seeking preventive liver care.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 72,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver health", "Bile duct support", "Hepatic regeneration", "Bile flow optimization", "Metabolic normalization"]
  },
  {
    id: "mamiton",
    name: "Mamiton",
    description: "Natural oncoprotector designed specifically for the female reproductive system, combining the best of herbal tradition and modern science. Offers protective benefits against cancer, fights oxidative stress, slows abnormal cell division, and helps balance estrogen levels. Reduces risks linked to hormonal imbalances and aging. Active ingredients include resveratrol (oncoprotective and antioxidant), motherwort and mint (sedative and antispasmodic), rosehip, nettle and knotweed (anti-inflammatory and regenerative), hops and laminaria (hormonal homeostasis and thyroid support), vitamins A and E (antioxidant and immune modulation), field horsetail (vascular and connective tissue strength), and Juglans regia pericarp (immunostimulatory and antiparasitic). Recommended for women over 35 seeking oncoprotection, during menopause and perimenopause, for PMS, and during recovery after gynecological procedures.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 78,
    priceEUR: 27,
    rating: 4.8,
    sizes: 1,
    benefits: ["Oncoprotective defense", "Hormonal balance", "Estrogen regulation", "Menopause symptom relief", "PMS prevention", "Antioxidant protection", "Skin, hair and nail health", "Bone health (osteoporosis prevention)"],
    ingredients: ["Resveratrol", "Motherwort extract", "Mint extract", "Rosehip extract", "Nettle extract", "Knotweed extract", "Hops extract", "Laminaria extract", "Vitamin A", "Vitamin E", "Field horsetail extract", "Juglans regia pericarp extract"]
  },
  {
    id: "mesotel",
    name: "Mesotel",
    description: "Foundational choline-based revitalization formula for brain, liver, and cardiovascular health. Supports cellular membrane integrity, promotes healthy neurotransmitter function, and provides antioxidant and antiviral protection for deep systemic renewal.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 55,
    priceEUR: 19,
    rating: 4.8,
    sizes: 1,
    benefits: ["Brain health", "Liver support", "Cardiovascular protection", "Antioxidant action", "Cellular renewal"]
  },
  {
    id: "mesotel-beauty",
    name: "Mesotel Beauty",
    description: "Choline-based antioxidant and neurotransmitter complex enriched with gotu kola extract, wolfberry (goji), zinc, and vitamins. Provides pronounced antioxidant, antiviral, and antimicrobial effects. Enhances immunity, reduces cancer risk, supports skin beauty, and promotes youthful cellular regeneration.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 44.44,
    priceEUR: 21,
    rating: 4.8,
    sizes: 1,
    benefits: ["Antioxidant protection", "Skin beauty support", "Immune enhancement", "Antiviral action", "Cellular regeneration"]
  },
  {
    id: "olecap",
    name: "Olecap",
    description: "Omega-3 angiorestorer combining premium salmon oil and flaxseed oil for comprehensive cardiovascular and metabolic health. Rich in EPA, DHA, and alpha-linolenic acid for arterial flexibility, healthy cholesterol levels, and anti-inflammatory vascular protection. Supports healthy endothelium function and promotes optimal blood flow.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 63,
    priceEUR: 22,
    rating: 4.8,
    sizes: 1,
    benefits: ["Omega-3 angiorestoration", "Cardiovascular protection", "Cholesterol support", "Anti-inflammatory vascular action", "Arterial flexibility", "Salmon and flaxseed oil formula"]
  },
  {
    id: "panaxod",
    name: "Panaxod",
    description: "Premium ginseng adaptogen complex based on Panax ginseng and complementary botanicals. Enhances physical and mental performance, supports adrenal function, boosts immune resilience, and promotes healthy stress response. Helps combat fatigue, supports overall vitality, and promotes sustained energy through adaptogenic mechanisms.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 94,
    priceEUR: 37,
    rating: 4.8,
    sizes: 1,
    benefits: ["Ginseng adaptogenic support", "Physical and mental performance", "Immune resilience", "Healthy stress response", "Anti-fatigue action", "Sustained energy"]
  },
  {
    id: "pinalex-tab",
    name: "Pinalex Tab",
    description: "Innovative pineal gland bioregulator in tablet form for sleep optimization and circadian rhythm support. Promotes healthy melatonin production, supports deep restorative sleep architecture, and helps normalize the body's natural sleep-wake cycle. Designed for those with pineal gland dysfunction, sleep disturbances, jet lag, and age-related sleep changes.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 86,
    priceEUR: 34,
    rating: 4.8,
    sizes: 1,
    benefits: ["Pineal gland support", "Sleep optimization", "Melatonin production", "Circadian rhythm normalization", "Deep restorative sleep"]
  },
  {
    id: "pangluin",
    name: "Pangluin",
    description: "Pancreatic and metabolic support complex for healthy glucose metabolism and insulin sensitivity. Supports normal pancreatic function, promotes balanced blood sugar levels throughout the day, and helps maintain insulin receptor sensitivity. Beneficial for metabolic syndrome, pre-diabetes prevention, and those seeking optimal pancreatic health.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Pancreatic function support", "Insulin sensitivity improvement", "Blood sugar balance", "Glucose metabolism optimization", "Metabolic syndrome prevention"]
  },
  {
    id: "previn",
    name: "Previn",
    description: "Natural and safe cardio- and vasoprotective nutraceutical containing two key active components: hesperidin and niacinamide (Vitamin B3/PP). Hesperidin is a bioflavonoid from citrus fruits that normalizes blood pressure, improves endothelium function, strengthens blood vessel walls, maintains vascular tone and contractility, provides a sugar-reducing effect, reduces 'bad' cholesterol, and normalizes free fatty acid levels. Niacinamide mitigates oxidative stress, prevents heart failure, ischemic heart disease, and atrial fibrillation, slows premature cell senescence, and reduces the risk of myocardial fibrosis and endothelial dysfunction. Recommended for arterial hypertension, ischemic heart disease, arrhythmia, cardiomyopathy, diabetes, obesity, dyslipidemia, and as preventive care for cognitive impairment in the elderly.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 49,
    priceEUR: 17,
    rating: 4.8,
    sizes: 1,
    benefits: ["Blood pressure normalization", "Endothelium protection", "Cholesterol reduction", "Heart failure prevention", "Antioxidant defense", "Anti-arrhythmic support", "Cognitive protection"],
    ingredients: ["Hesperidin (citrus bioflavonoid)", "Niacinamide (Vitamin B3/PP)"],
    usage: "Take 1 tablet per day during meals. Course duration: 4–6 weeks."
  },
  {
    id: "revimite",
    name: "Revimite",
    description: "Innovative nutraceutical for those who want to preserve natural energy, strong vitality, and active longevity. Its formula combines natural extracts, B vitamins, and iron to restore nutrient balance and support the hematopoietic system. Contains pomegranate, green tea, echinacea, oats, grape seeds, ginger, soy, iron, B vitamins, and soy lecithin. These ingredients saturate the body with antioxidants, increase stress resistance, strengthen blood vessels, and help cells generate energy. Iron and B vitamins support blood formation and metabolism, while soy lecithin contributes to healthy brain and nervous system function. Recommended for anemia, weight loss, physical or emotional strain, reduced productivity, and recovery after exertion.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 49,
    priceEUR: 17,
    rating: 4.8,
    sizes: 1,
    benefits: ["Iron and B-vitamin replenishment", "Hematopoietic support", "Antioxidant protection", "Stress resilience", "Immune modulation", "Brain and nervous system support", "Energy restoration"],
    ingredients: ["Pomegranate extract", "Green tea extract", "Echinacea extract", "Oat extract", "Grape seed extract", "Ginger extract", "Soy extract", "Iron", "B vitamins (B1, B6, B12)", "Soy lecithin"]
  },
  {
    id: "reviplant",
    name: "Reviplant",
    description: "Premium phytonutrient complex for liver and immune system support. Combines powerful botanical extracts to promote cellular regeneration, enhance hepatic detoxification pathways, support immune function, and provide broad-spectrum antioxidant and anti-inflammatory protection for systemic wellness.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 135,
    priceEUR: 53,
    rating: 4.8,
    sizes: 1,
    benefits: ["Phytonutrient liver support", "Immune system enhancement", "Cellular regeneration", "Hepatic detoxification", "Anti-inflammatory protection", "Broad-spectrum antioxidant"]
  },
  {
    id: "reviform-cocktail",
    name: "Reviform Cocktail",
    image: "/products/Reviform.jpg",
    imageAlt: "Reviform Cocktail nutritional supplement",
    description: "Anti-aging nutritional shake combining high-quality protein, essential vitamins, and minerals for comprehensive body composition support and metabolic optimization. Supports healthy weight management, promotes lean muscle maintenance, and provides essential nutrients for active lifestyle, physical performance, and cellular renewal.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 72,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Anti-aging nutritional support", "Protein/vitamin/mineral complex", "Body composition optimization", "Lean muscle maintenance", "Active lifestyle nutrition", "Cellular renewal"]
  },
  {
    id: "revifort",
    name: "Revifort",
    description: "Broad-spectrum oncoprotector combining four medicinal mushrooms — Shiitake, Reishi, Maitake, and Cordyceps — for the first time in a single formula. Contains glucans that stimulate the immune system and lead to active multi-phase destruction of cancer cells. Promotes liver and cellular recovery after damage, stimulates the immune system, supports hematopoiesis, and provides bacteriostatic effects with natural detoxification support. Part of the immunity and energy activation trio alongside Ensil and Pinalex Tab. Clinically supported for oncoprophylaxis and immune fortification.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 225,
    priceEUR: 88,
    rating: 4.8,
    sizes: 1,
    benefits: ["Oncoprotective defense", "Immune fortification", "Liver recovery", "Hematopoiesis support", "Detoxification", "Bacteriostatic action", "Multi-phase cancer cell defense"],
    ingredients: ["Shiitake mushroom extract", "Reishi mushroom extract", "Maitake mushroom extract", "Cordyceps extract", "Beta-glucans"]
  },
  {
    id: "regenart",
    name: "Regenart",
    description: "Joint regeneration complex for cartilage tissue repair and musculoskeletal health. Supports cartilage matrix restoration, promotes collagen synthesis in joint structures, provides anti-inflammatory protection, and helps maintain joint mobility and comfort. Beneficial for osteoarthritis, post-injury recovery, and age-related joint changes.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint regeneration", "Cartilage tissue repair", "Collagen synthesis in joints", "Anti-inflammatory protection", "Post-injury recovery", "Joint mobility"]
  },
  {
    id: "renefort",
    name: "Renefort",
    description: "Nephroprotective complex for kidney health and renal function support. Helps maintain healthy kidney filtration, supports kidney tissue regeneration, protects against oxidative stress in renal tissue, and promotes balanced urinary system function. Beneficial for those with chronic kidney concerns or seeking preventive renal care.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nephroprotective action", "Kidney tissue support", "Renal filtration health", "Urinary system balance", "Oxidative stress defense"]
  },
  {
    id: "retisil",
    name: "Retisil",
    description: "Advanced eye health formula with lutein, zeaxanthin, and complementary nutrients for comprehensive visual protection. Supports retinal health, protects against blue light and oxidative damage, maintains macular integrity, and promotes visual acuity. Beneficial for those with high screen exposure, age-related vision changes, or seeking preventive eye care.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 46,
    priceEUR: 16,
    rating: 4.8,
    sizes: 1,
    benefits: ["Retinal protection (lutein/zeaxanthin)", "Blue light defense", "Macular integrity", "Visual acuity support", "Age-related vision protection"]
  },
  {
    id: "rinolax",
    name: "Rinolax",
    description: "Natural upper respiratory and ENT health complex for sinus, nasal, and throat support. Helps normalize nasal breathing, reduces inflammation in the respiratory mucosa, supports healthy sinus function, and strengthens immune defense of the upper airways. Beneficial for chronic rhinitis, sinusitis, and frequent upper respiratory infections.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 94,
    priceEUR: 37,
    rating: 4.8,
    sizes: 1,
    benefits: ["Upper respiratory/ENT support", "Nasal breathing normalization", "Sinus health", "Respiratory mucosa protection", "Upper airway immune defense"]
  },
  {
    id: "temero-genero",
    name: "Temero Genero",
    description: "Daily anti-aging formula combining two complementary complexes that together create a strong foundation for health and active longevity. Supports cellular renewal, hormonal balance, and systemic rejuvenation for sustained vitality.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 83,
    priceEUR: 33,
    rating: 4.8,
    sizes: 1,
    benefits: ["Daily anti-aging", "Cellular renewal", "Hormonal balance", "Active longevity", "Systemic rejuvenation"]
  },
  {
    id: "trezvon",
    name: "Trezvon",
    description: "Natural support formula for alcohol metabolism and liver protection. Helps accelerate alcohol breakdown, reduces toxic acetaldehyde accumulation, supports liver detoxification pathways, and promotes faster recovery after alcohol consumption. Essential for those seeking rapid alcohol recovery and hepatoprotective support.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 21,
    priceEUR: 6,
    rating: 4.8,
    sizes: 1,
    benefits: ["Alcohol metabolism acceleration", "Liver protection", "Acetaldehyde reduction", "Detoxification pathway support", "Rapid recovery"]
  },
  {
    id: "felicita",
    name: "Felicita",
    description: "Mood, serotonin, and dopamine support complex with adaptogenic and anxiolytic properties. Promotes healthy neurotransmitter balance for positive mood, supports stress resilience, and helps maintain emotional stability. Formulated to enhance serotonin and dopamine pathways for sustained wellbeing and mental clarity.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 72,
    priceEUR: 25,
    rating: 4.8,
    sizes: 1,
    benefits: ["Serotonin/dopamine balance", "Mood enhancement", "Emotional stability", "Stress resilience", "Anxiolytic support", "Mental clarity"]
  },
  {
    id: "femalin",
    name: "Femalin",
    description: "Comprehensive female health formula that normalizes functions of the female organism. Supports hormonal balance, promotes healthy menstrual cycle regulation, and provides immune and metabolic support tailored to women's physiological needs.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 49,
    priceEUR: 17,
    rating: 4.8,
    sizes: 1,
    benefits: ["Female hormonal balance", "Menstrual cycle support", "Immune support", "Metabolic health", "Women's wellness"]
  },
  {
    id: "zinsil-t",
    name: "Zinsil-T",
    description: "Comprehensive zinc, glycine, and pyridoxine (Vitamin B6) complex for prolonging active longevity. Affects key links in the pathogenesis of accelerated aging, corrects the work of many enzymes and hormones, and restores disturbed immune and antioxidant status. A proven means of cancer prevention. Glycine (500mg) reduces psycho-emotional stress, aggressiveness, and conflict; enhances mood; facilitates and normalizes sleep; increases mental performance; reduces toxic effects of alcohol; and significantly improves zinc absorption. Zinc (8.6mg) is required for healthy functioning of all body cells, inhibits viral infection, stimulates leukocyte production, supports T-lymphocytes and natural killer cells, corrects blood sugar levels, helps the pancreas produce insulin, reduces high cholesterol, improves skin conditions, and supports protein synthesis. Vitamin B6 ensures substance exchange, participates in neurotransmitter metabolism (serotonin, dopamine), supports red blood cell production, and is essential for protein, fat, and carbohydrate metabolism.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 48,
    priceEUR: 14,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune defense and anti-tumor activity", "Hormonal balance", "Mood and sleep improvement", "Blood sugar regulation", "Cholesterol reduction", "Skin health", "Antioxidant status restoration", "Longevity support"],
    ingredients: ["Glycine (500mg)", "Zinc (8.6mg)", "Pyridoxine / Vitamin B6 (1.5mg)"],
    usage: "Take 1 tablet 2 times daily, chewing during meals. Duration: 1 month. May be repeated as needed."
  },
  {
    id: "ensil",
    name: "Ensil",
    description: "Powerful oncoprotector of the latest generation, developed over more than six years of research. Markedly enhances tissue respiration processes and facilitates regeneration. Clinically evidenced for cancer prevention. Contains Coenzyme Q10 (cellular energizer, antioxidant, antitumor, anti-atherosclerotic, antiarrhythmic, hypotensive, immunomodulatory, hepatoprotective), nicotinamide (vital for NAD/NADPH coenzymes, tissue respiration, fat/protein/amino acid metabolism), folic acid (DNA replication, hematopoiesis, immune system development), echinacea (immune system fortification, anti-inflammatory), amber acid/succinic acid (prevents tumor emergence, inhibits existing tumor growth, strengthens immunity, stimulates insulin production, normalizes nervous system, counteracts stress, neutralizes toxins), L-carnitine (fatty acid transport, cardiac muscle and immune support), B vitamins B1/B5/B6 (energy metabolism, immune and nervous system function), and Vitamins C and E (antioxidants, tissue regeneration). Part of the immunity and energy activation trio.",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 83,
    priceEUR: 33,
    rating: 4.8,
    sizes: 1,
    benefits: ["Oncoprotection", "Tissue respiration enhancement", "Cellular energy metabolism", "Immune fortification", "Hematopoietic support", "Antioxidant defense", "Hepatoprotective action", "Nervous system support"],
    ingredients: ["Coenzyme Q10", "Nicotinamide (Vitamin PP)", "Folic acid", "Echinacea extract", "Succinic acid (amber acid)", "L-carnitine", "Vitamins B1, B5, B6", "Vitamins C and E"],
    usage: "Take 1 capsule 3 times daily with meals. Course duration: 1 month."
  },
  {
    id: "anti-age-nb-activity",
    name: "Anti-Age Complex NB Activity",
    description: "Energy concentrate and collagen activator from the Anti-Age Complex NB line. Stimulates collagen production, boosts cellular energy metabolism, and provides comprehensive anti-aging support for skin, connective tissue, and overall vitality.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 175,
    priceEUR: 70,
    rating: 4.9,
    sizes: 1,
    benefits: ["Collagen activation", "Cellular energy boost", "Anti-aging", "Skin vitality", "Connective tissue support"]
  },
  {
    id: "anti-age-nb-health",
    name: "Anti-Age Complex NB Health",
    description: "AGE protector from the Anti-Age Complex NB line. Provides advanced protection against advanced glycation end-products (AGEs), the primary drivers of accelerated aging. Supports protein structure integrity, reduces oxidative damage, and promotes deep cellular rejuvenation.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 330,
    priceEUR: 130,
    rating: 4.9,
    sizes: 1,
    benefits: ["AGE protection", "Anti-glycation", "Protein structure integrity", "Oxidative damage reduction", "Cellular rejuvenation"]
  },
  {
    id: "thyreogen",
    name: "Thyreogen",
    description: "Tyreogen® (A-2) is the Thyroid Peptide Bioregulator containing the thyroid gland peptide complex from young calves. The isolated peptides act selectively on thyroid gland cells, normalizing their metabolism and regulating thyroid functions. Clinically established for complex restoration of thyroid function after diseases, extreme environmental factor exposure, malnutrition, and aging. Part of the female hormonal protocol: Zhenoluten + Tyreogen + Ventfort.",
    category: "PEPTIDE BIOREGULATORS",
    image: "/products/Thyreogen.jpg",
    imageAlt: "Thyreogen thyroid peptide bioregulator",
    priceUSD: 68,
    priceEUR: 40,
    rating: 4.8,
    sizes: 2,
    benefits: ["Thyroid function restoration", "Hypo/hyperthyroidism support", "Goiter management", "Autoimmune thyroiditis", "Female hormonal health", "Metabolic normalization"],
    ingredients: ["Thyroid gland peptide complex (A-2)"],
    usage: "1–2 capsules 1–2 times daily with meals. Course: 10–30 days. Repeat in 4–6 months.",
    seriesInfo: "Recommended combination: Zhenoluten + Tyreogen + Ventfort for female health. Cytomaxes are natural peptide bioregulators extracted from specific animal organs and tissues, developed over 40+ years of research under Prof. Vladimir Khavinson.",
    variants: [
      {
        id: "20-count",
        name: "20 Capsules",
        priceUSD: 68,
        priceEUR: 40,
        inStock: true
      },
      {
        id: "60-count",
        name: "60 Capsules",
        priceUSD: 160,
        priceEUR: 110,
        inStock: true
      }
    ]
  },
  {
    id: "gpl-femme",
    name: "GPL Femme",
    description: "Comprehensive female health protocol containing 65mg peptides per capsule: Epiphysis + Cerebrum + Vascular + Liver + Thyroid + Ovarian peptides + Alpha-lipoic acid. Designed to restore and maintain optimal function of the female reproductive, endocrine, cardiovascular, and nervous systems. Provides broad-spectrum support for hormonal balance, immune resilience, and active longevity.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 420,
    priceEUR: 280,
    rating: 4.9,
    sizes: 1,
    benefits: ["65mg multi-peptide complex per capsule", "Female reproductive system restoration", "Thyroid and ovarian peptide support", "Cardiovascular and nervous system health", "Hormonal balance", "Active longevity"],
    seriesInfo: "GPL Femme contains six targeted peptide complexes (Epiphysis, Cerebrum, Vascular, Liver, Thyroid, Ovarian) plus alpha-lipoic acid for comprehensive female health restoration."
  },
  {
    id: "gpl-man",
    name: "GPL Man",
    description: "Comprehensive male health protocol containing 65mg peptides per capsule: Epiphysis + Cerebrum + Vascular + Liver + Pancreatic + Testicular peptides + Alpha-lipoic acid. Minimizes post-illness changes and disorders in the male body, restoring normal functioning of the cardiovascular, nervous, endocrine, and reproductive systems. Provides broad-spectrum support for male vitality and active longevity.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 420,
    priceEUR: 280,
    rating: 4.9,
    sizes: 1,
    benefits: ["65mg multi-peptide complex per capsule", "Male reproductive system restoration", "Pancreatic and testicular peptide support", "Cardiovascular and nervous system health", "Endocrine balance", "Active longevity"],
    seriesInfo: "GPL Man contains six targeted peptide complexes (Epiphysis, Cerebrum, Vascular, Liver, Pancreatic, Testicular) plus alpha-lipoic acid for comprehensive male health restoration."
  },
];

// Helper function to find a product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}
