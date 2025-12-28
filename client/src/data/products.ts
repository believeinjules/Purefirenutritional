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
  reviews?: number;
  sizes: number;
  image?: string;
  imageAlt?: string;
  images?: string[];
  variants?: ProductVariant[];
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
}

export const products: Product[] = [
  {
    id: "bonomarlot",
    image: "/products/Banomarlot.png",
    imageAlt: "Bonomarlot bone marrow peptide supplement bottle",
    name: "Bonomarlot",
    description: "Bone marrow peptide complex for immune system and hematopoietic support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 3,
    benefits: ["Immune system support", "Blood cell production", "Bone marrow health"],
    variants: [
      {
        id: "20-capsules",
        name: "20 Capsules",
        priceUSD: 46.50,
        priceEUR: 19.00,
        image: "/products/Banomarlot.png",
        imageAlt: "Bonomarlot 20 capsules",
        inStock: true
      },
      {
        id: "60-capsules",
        name: "60 Capsules",
        priceUSD: 93.01,
        priceEUR: 37.99,
        image: "/products/bonomarlot-a-20-20-capsules__00163.1738113876.jpg",
        imageAlt: "Bonomarlot 60 capsules",
        inStock: true
      },
      {
        id: "lingual",
        name: "Lingual (Sublingual)",
        priceUSD: 104.64,
        priceEUR: 42.99,
        image: "/products/bonomarlot_sublingual_bone_marrow_peptide__93190.1759968734.jpg",
        imageAlt: "Bonomarlot Lingual sublingual",
        inStock: false
      }
    ]
  },
  {
    id: "cartalax",
    image: "/products/cartalax.jpg.webp",
    imageAlt: "Cartalax cartilage peptide bioregulator for joint health",
    name: "Cartalax",
    description: "Cartilage peptide bioregulator for joint health and connective tissue support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Joint health", "Cartilage support", "Connective tissue"]
  },
  {
    id: "chelohart",
    image: "/products/chelohart-a-14-20-capsules__83804.1738112709.jpg",
    imageAlt: "Chelohart heart peptide bioregulator capsules",
    name: "Chelohart",
    description: "Heart peptide bioregulator for cardiac muscle and cardiovascular function.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Heart health", "Cardiac muscle support", "Cardiovascular function"]
  },
  {
    id: "chelohart-lingual",
    image: "/products/chelohart_lingual_natural_peptide_complex__51766.1684187002.jpg",
    imageAlt: "Chelohart Lingual sublingual heart peptide complex",
    name: "Chelohart Lingual",
    description: "Sublingual heart peptide for enhanced cardiac support and absorption.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 104.64,
    priceEUR: 42.99,
    rating: 4.8,
    sizes: 1,
    benefits: ["Rapid absorption", "Heart support", "Cardiovascular health"]
  },
  {
    id: "crystagen",
    image: "/products/Crystagen_peptide_side_2021_vita_stream__36125.1628292022.png",
    imageAlt: "Crystagen immune system peptide bioregulator",
    name: "Crystagen",
    description: "Immune system peptide bioregulator for enhanced defense and cellular immunity.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Immune defense", "Cellular immunity", "Overall health"]
  },
  {
    id: "cytogen-aedg",
    name: "Cytogen AEDG",
    description: "Synthetic tetrapeptide for epigenetic regulation and longevity enhancement.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 232.54,
    priceEUR: 94.99,
    rating: 4.8,
    sizes: 2,
    benefits: ["Epigenetic regulation", "Longevity support", "Anti-aging"]
  },
  {
    id: "cytogen-khavinson-complex",
    name: "Cytogen Khavinson Complex",
    description: "Multi-peptide complex combining several Khavinson bioregulators for comprehensive support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 348.82,
    priceEUR: 139.99,
    rating: 4.8,
    sizes: 2,
    benefits: ["Comprehensive support", "Multi-system health", "Premium formula"]
  },
  
  
  {
    id: "endoluten",
    image: "/products/endoluten(1).jpeg",
    imageAlt: "Endoluten pineal gland peptide for circadian rhythm",
    name: "Endoluten",
    description: "Pineal gland peptide bioregulator for circadian rhythm and hormonal balance.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Circadian rhythm", "Hormonal balance", "Sleep support"]
  },
  {
    id: "gotratix",
    image: "/products/gotratix-a-18-20-capsules__87331.jpg",
    imageAlt: "Gotratix muscle peptide bioregulator capsules",
    name: "Gotratix",
    description: "Muscle peptide bioregulator for strength, recovery, and muscle tissue health.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Muscle strength", "Recovery", "Tissue health"]
  },
  {
    id: "gotratix-lingual",
    image: "/products/gotratix_lingual.jpg(1).webp",
    imageAlt: "Gotratix Lingual sublingual muscle peptide",
    name: "Gotratix Lingual",
    description: "Sublingual muscle peptide for enhanced athletic performance and recovery.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 104.64,
    priceEUR: 42.99,
    rating: 4.8,
    sizes: 1,
    benefits: ["Athletic performance", "Fast recovery", "Muscle support"]
  },
  
  
  
  {
    id: "pielotax",
    image: "/products/pielotax.jpeg",
    imageAlt: "Pielotax kidney peptide bioregulator supplement",
    name: "Pielotax",
    description: "Kidney peptide bioregulator for renal function and urinary system health.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Renal function", "Urinary health", "Kidney support"]
  },
  {
    id: "prime-peptide-brain",
    name: "Prime Peptide Brain",
    image: "/products/pp-brain.png",
    imageAlt: "Prime Peptide Brain - IPH AGAP peptide complex for cognitive support and brain health",
    description: "Contains IPH AGAP peptide complex (Ala-Glu-Asp-Pro), a natural tetrapeptide that penetrates the blood-brain barrier to regulate neurometabolic processes and activate neuronal repair. Stimulates neurotransmitter synthesis, activates neuroplasticity, and protects nerve cells from oxidative stress. Clinically proven to enhance memory, improve concentration, and support mental clarity during high cognitive demand and aging.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 114.0,
    priceEUR: 108,
    rating: 4.8,
    sizes: 1,
    benefits: ["Mental clarity", "Brain health", "Cognitive support"]
  },
  {
    id: "prime-peptide-collagen",
    name: "Prime Peptide Collagen",
    image: "/products/pp-collagen.png",
    description: "IPH peptide complex for integumentary system. Premium formula utilizing IPH technology for comprehensive skin, hair, nail, and connective tissue support with enhanced cellular regeneration.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 114.0,
    priceEUR: 108,
    rating: 4.8,
    sizes: 1,
    benefits: ["Skin health", "Hair & nails", "Connective tissue"]
  },
  {
    id: "prime-peptide-joints",
    name: "Prime Peptide Joints",
    image: "/products/pp-joints.png",
    description: "IPH peptide complex for musculoskeletal system. Advanced joint support utilizing IPH technology to promote mobility, flexibility, and connective tissue health with targeted cellular support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 95.0,
    priceEUR: 90,
    rating: 4.8,
    sizes: 1,
    benefits: ["Joint mobility", "Flexibility", "Connective tissue"]
  },
  {
    id: "prime-peptide-omega",
    name: "Prime Peptide Omega",
    image: "/products/pp-omega.png",
    description: "IPH peptide complex for cardiovascular and metabolic health. Essential fatty acid formula enhanced with IPH technology for comprehensive heart, brain, and metabolic support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 95.0,
    priceEUR: 90,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular health", "Brain function", "Essential fatty acids"]
  },
  {
    id: "prime-peptide-protect",
    name: "Prime Peptide Protect",
    image: "/products/pp-protect.png",
    description: "IPH peptide complex for cell protection. Contains IPH REG and IPH EP complexes with bioactive mushroom peptides. Provides powerful oncoprotective defense, antioxidant protection, and tissue regeneration support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 114.0,
    priceEUR: 108,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune function", "Cellular protection", "Defense support"]
  },
  
  
  {
    id: "revilab-ml-01",
    image: "/products/RevilabML1.jpg",
    imageAlt: "Revilab ML 01 multi-level peptide complex",
    name: "Revilab ML 01",
    description: "Multi-level peptide complex for comprehensive cellular rejuvenation.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cellular rejuvenation", "Multi-level support", "Comprehensive"]
  },
  {
    id: "revilab-ml-02",
    image: "/products/RevilabML2.jpg",
    imageAlt: "Revilab ML 02 metabolic optimization formula",
    name: "Revilab ML 02",
    description: "Advanced formula for metabolic optimization and energy production.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Metabolic optimization", "Energy production", "Vitality"]
  },
  {
    id: "revilab-ml-03",
    image: "/products/RevilabML3.jpg",
    imageAlt: "Revilab ML 03 immune enhancement complex",
    name: "Revilab ML 03",
    description: "Immune system enhancement and cellular defense support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune enhancement", "Cellular defense", "Protection"]
  },
  {
    id: "revilab-ml-04",
    image: "/products/RevilabML4.jpg",
    imageAlt: "Revilab ML 04 cardiovascular support formula",
    name: "Revilab ML 04",
    description: "Cardiovascular health and blood vessel support formula.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular health", "Blood vessel support", "Heart function"]
  },
  {
    id: "revilab-ml-05",
    image: "/products/RevilabML5.jpg",
    imageAlt: "Revilab ML 05 liver and digestive support",
    name: "Revilab ML 05",
    description: "Liver and digestive system optimization complex.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Liver optimization", "Digestive support", "Detoxification"]
  },
  {
    id: "revilab-ml-06",
    image: "/products/RevilabML6.jpg",
    imageAlt: "Revilab ML 06 bone and joint health complex",
    name: "Revilab ML 06",
    description: "Bone, joint, and connective tissue health support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Bone health", "Joint support", "Connective tissue"]
  },
  {
    id: "revilab-ml-07",
    image: "/products/RevilabML7.jpg",
    imageAlt: "Revilab ML 07 neurological support formula",
    name: "Revilab ML 07",
    description: "Neurological function and cognitive performance enhancement.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Neurological function", "Cognitive performance", "Brain health"]
  },
  {
    id: "revilab-ml-08",
    image: "/products/RevilabML8.jpg",
    imageAlt: "Revilab ML 08 hormonal balance complex",
    name: "Revilab ML 08",
    description: "Hormonal balance and endocrine system support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Hormonal balance", "Endocrine support", "Wellness"]
  },
  {
    id: "revilab-ml-09",
    image: "/products/RevilabML9.jpg",
    imageAlt: "Revilab ML 09 urogenital health formula",
    name: "Revilab ML 09",
    description: "Reproductive health and urogenital system support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 241.86,
    priceEUR: 94.55,
    rating: 4.8,
    sizes: 1,
    benefits: ["Reproductive health", "Urogenital support", "Vitality"]
  },
  {
    id: "revilab-pro-elements",
    name: "Revilab Pro Elements",
    description: "New-generation biologically active complex developed to support key body systems at the cellular level. Contains balanced combination of micro- and macroelements, vitamins, and bioactive compounds including glycine, calcium citrate, magnesium citrate, zinc citrate, vitamins A, E, D3, B6, and chromium picolinate. Strengthens immune resilience, protects against stress, slows aging processes, and promotes deep cellular restoration.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 95.00,
    priceEUR: 86.36,
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
    ]
  },
  {
    id: "mesotel-neo",
    name: "Mesotel Neo",
    description: "Advanced anti-aging liquid formula based on choline, enriched with gotu kola and wolfberry extracts, zinc, vitamins and resveratrol. Powerful antioxidant with antiviral and antimicrobial properties. Promotes detoxification, strengthens immunity, improves cardiovascular and nervous system function, prevents atherosclerosis, and stimulates cellular regeneration for youthful skin.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 38.00,
    priceEUR: 29.00,
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
    imageAlt: "Revilab SL 01 sublingual anti-aging peptide",
    name: "Revilab SL 01",
    description: "Sublingual peptide complex for comprehensive anti-aging support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Anti-aging", "Rapid absorption", "Comprehensive support"]
  },
  {
    id: "revilab-sl-02",
    image: "/products/sl_2-228x228.jpg",
    imageAlt: "Revilab SL 02 sublingual metabolic support",
    name: "Revilab SL 02",
    description: "Sublingual formula targeting metabolic and energy support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Metabolic support", "Energy boost", "Fast absorption"]
  },
  {
    id: "revilab-sl-03",
    image: "/products/RevilabSL3.jpg",
    imageAlt: "Revilab SL 03 sublingual immune complex",
    name: "Revilab SL 03",
    description: "Peptide complex for immune system and respiratory health.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Immune system", "Respiratory health", "Defense"]
  },
  {
    id: "revilab-sl-04",
    image: "/products/RevilabSL4.png",
    imageAlt: "Revilab SL 04 sublingual cardiovascular formula",
    name: "Revilab SL 04",
    description: "Cardiovascular and circulatory system support formula.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Cardiovascular support", "Circulation", "Heart health"]
  },
  {
    id: "revilab-sl-05",
    image: "/products/RevilabSL5.jpg",
    imageAlt: "Revilab SL 05 sublingual digestive support",
    name: "Revilab SL 05",
    description: "Digestive system and liver function support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Digestive health", "Liver function", "Gut support"]
  },
  {
    id: "revilab-sl-06",
    image: "/products/sl_6-228x228.jpg",
    imageAlt: "Revilab SL 06 sublingual musculoskeletal complex",
    name: "Revilab SL 06",
    description: "Musculoskeletal system and joint health support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Musculoskeletal health", "Joint support", "Mobility"]
  },
  {
    id: "revilab-sl-07",
    image: "/products/RevilabSL7.jpg",
    imageAlt: "Revilab SL 07 sublingual nervous system support",
    name: "Revilab SL 07",
    description: "Nervous system and stress response support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Nervous system", "Stress response", "Calm & balance"]
  },
  {
    id: "revilab-sl-08",
    image: "/products/RevilabSL8.jpg",
    imageAlt: "Revilab SL 08 sublingual endocrine formula",
    name: "Revilab SL 08",
    description: "Endocrine system and hormonal balance support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Endocrine health", "Hormonal balance", "Wellness"]
  },
  {
    id: "revilab-sl-09",
    image: "/products/RevilabSL99.jpg",
    imageAlt: "Revilab SL 09 sublingual reproductive health",
    name: "Revilab SL 09",
    description: "Urogenital system and reproductive health support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Urogenital health", "Reproductive support", "Vitality"]
  },
  {
    id: "spermidine-longevity",
    name: "Spermidine Longevity",
    description: "Natural spermidine supplement to support autophagy, cellular renewal, and healthy aging.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 209.28,
    priceEUR: 84.99,
    rating: 4.8,
    sizes: 1,
    benefits: ["Autophagy support", "Cellular renewal", "Healthy aging"]
  },
  {
    id: "testoluten",
    image: "/products/testoluten.jpeg",
    imageAlt: "Testoluten testicular peptide for male health",
    name: "Testoluten",
    description: "Testicular peptide complex for male reproductive health and hormonal balance.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Male reproductive health", "Hormonal balance", "Vitality"]
  },
  {
    id: "ventfort",
    name: "Ventfort",
    image: "/products/ventfort.png",
    description: "Vascular peptide complex for blood vessel health and circulation support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Blood vessel health", "Circulation", "Vascular support"]
  },
  {
    id: "ventfort-lingual",
    name: "Ventfort Lingual",
    image: "/products/ventfort.png",
    description: "Sublingual vascular peptide for rapid absorption and cardiovascular support.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 104.64,
    priceEUR: 42.99,
    rating: 4.8,
    sizes: 1,
    benefits: ["Rapid absorption", "Cardiovascular support", "Vascular health"]
  },
  {
    id: "vesugen",
    image: "/products/Vesugen_peptide_side_2021_vita_stream__14678.1628291284.png",
    imageAlt: "Vesugen blood vessel peptide bioregulator",
    name: "Vesugen",
    description: "Blood vessel peptide bioregulator for vascular health and circulation.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Vascular health", "Circulation", "Blood vessel support"]
  },
  {
    id: "crystagen-lingual",
    image: "/products/crystagen-lingual-peptide-supplements-fact-new-2023__58097.1690241162.JPG",
    imageAlt: "Crystagen Lingual sublingual immune peptide",
    name: "Crystagen Lingual",
    description: "Sublingual blood vessel peptide for enhanced absorption and bioavailability.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 104.64,
    priceEUR: 42.99,
    rating: 4.8,
    sizes: 1,
    benefits: ["Enhanced absorption", "Bioavailability", "Vascular support"]
  },
  {
    id: "visoluten",
    name: "Visoluten",
    image: "/products/visoluten.png",
    description: "Eye peptide bioregulator for vision support and ocular health.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Vision support", "Eye health", "Ocular function"]
  },
  {
    id: "vladonix",
    name: "Vladonix",
    image: "/products/vladonix.png",
    description: "Thymus peptide complex for immune system regulation and cellular defense.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 46.50,
    priceEUR: 19.00,
    rating: 4.8,
    sizes: 2,
    benefits: ["Immune regulation", "Cellular defense", "Thymus support"]
  },
  {
    id: "vladonix-lingual",
    name: "Vladonix Lingual",
    image: "/products/vladonix.png",
    description: "Sublingual thymus peptide for enhanced immune support and rapid absorption.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 104.64,
    priceEUR: 42.99,
    rating: 4.8,
    sizes: 1,
    benefits: ["Enhanced immune support", "Rapid absorption", "Thymus health"]
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
    imageAlt: "Revilab SL 10 sublingual skin health formula",
    name: "Revilab SL 10",
    description: "Skin health and beauty support formula.",
    category: "PEPTIDE BIOREGULATORS",
    priceUSD: 116.28,
    priceEUR: 45.45,
    rating: 4.8,
    sizes: 1,
    benefits: ["Skin health", "Beauty support", "Anti-aging"]
  },
  {
    id: "revilab-anti-age",
    name: "Revilab Anti-A.G.E.",
    description: "Powerful anti-glycation supplement with deglycating and antioxidant effects. Contains carnosine, astaxanthin, and alpha-lipoic acid to prevent protein degradation.",
    category: "ANTI AGING-LONGEVITY",
    priceUSD: 151.00,
    priceEUR: 137.27,
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
    usage: "Take 1 capsule per day during meals. Course duration: 4-6 weeks. Can be repeated as necessary throughout the year."
  },
  {
    id: "test-product-free",
    name: "Test Product - FREE",
    description: "Free test product for checkout testing. Price: $0.00. Remove before going live!",
    category: "NUTRITIONAL SUPPLEMENTS",
    priceUSD: 0.00,
    priceEUR: 0.00,
    rating: 5.0,
    sizes: 1,
    image: "/products/test.png",
    imageAlt: "Test product for checkout testing",
    benefits: ["For testing checkout only", "Removes payment requirement", "Complete transaction without charges"],
    usage: "Use this product to test the entire checkout flow without needing to make a real payment or use test API keys."
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "All Products") return products;
  return products.filter(p => p.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
};

export const categories = [
  "All Products",
  "PEPTIDE BIOREGULATORS",
  "ANTI AGING-LONGEVITY",
  "NUTRITIONAL SUPPLEMENTS"
];
