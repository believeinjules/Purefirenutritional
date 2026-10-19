// Curated companions for the product page's "Pairs well with" box
// (components/FrequentlyBoughtTogether.tsx). Hand-picked, not purchase data.
// Maps product IDs to recommended complementary products.
// All productIds MUST exist in products.ts (storefront, not hidden).
// Pair products that share a body system, and keep each reason a plain label
// for the companion taken from that companion's own description
// (checked by productRecommendations.test.ts).

export interface ProductRecommendation {
  productId: string;
  reason?: string;
}

export const productRecommendations: Record<string, ProductRecommendation[]> = {
  // Anti-Aging Cosmetics - pair with supplements
  "anti-wrinkle-serum-7": [
    { productId: "revilab-anti-age", reason: "Internal anti-aging support" },
    { productId: "prime-peptide-collagen", reason: "Collagen for skin structure" }
  ],
  "revilab-anti-age": [
    { productId: "anti-wrinkle-serum-7", reason: "Topical wrinkle reduction" },
    { productId: "endoluten", reason: "Pineal longevity support" }
  ],

  // Cardiovascular support combinations
  "chelohart": [
    { productId: "revilab-ml-04", reason: "Enhanced cardiovascular support" },
    { productId: "ventfort", reason: "Blood vessel peptide bioregulator" }
  ],
  "revilab-ml-04": [
    { productId: "chelohart", reason: "Targeted heart peptides" },
    { productId: "ventfort", reason: "Blood vessel peptide bioregulator" }
  ],
  "revilab-sl-01": [
    { productId: "revilab-ml-04", reason: "Cardiovascular capsule formula" },
    { productId: "chelohart", reason: "Heart peptide bioregulator" }
  ],
  "ventfort": [
    { productId: "chelohart", reason: "Heart + vessel pairing" },
    { productId: "revilab-ml-04", reason: "Cardiovascular complex" }
  ],
  // Olecap is hidden from the storefront; kept for when it returns.
  "olecap": [
    { productId: "ventfort", reason: "Blood vessel peptide bioregulator" },
    { productId: "revilab-ml-04", reason: "Cardiovascular capsule formula" }
  ],

  // Brain, nervous system & eyes
  "prime-peptide-brain": [
    { productId: "cerluten", reason: "Natural brain peptide complex" },
    { productId: "pinealon", reason: "Synthesized brain peptide complex" }
  ],
  "revilab-ml-03": [
    { productId: "revilab-sl-02", reason: "Sublingual nervous system & eye complex" },
    { productId: "visoluten", reason: "Retina peptide bioregulator" }
  ],
  "revilab-sl-02": [
    { productId: "revilab-ml-03", reason: "Nervous system & eye capsule formula" },
    { productId: "visoluten", reason: "Retina peptide bioregulator" }
  ],

  // Pineal & foundational pairings
  "endoluten": [
    { productId: "vladonix", reason: "Foundational longevity pairing" },
    { productId: "revilab-anti-age", reason: "Anti-glycation support" }
  ],
  "revilab-ml-01": [
    { productId: "endoluten", reason: "Pineal peptide bioregulator" },
    { productId: "revilab-sl-03", reason: "Sublingual pineal & immune complex" }
  ],

  // Immune system support
  "crystagen": [
    { productId: "revilab-sl-03", reason: "Sublingual immune complex" },
    { productId: "vladonix", reason: "Thymus support" }
  ],
  "vladonix": [
    { productId: "endoluten", reason: "Foundational longevity pairing" },
    { productId: "crystagen", reason: "Immune bioregulation" }
  ],
  "revilab-sl-03": [
    { productId: "crystagen", reason: "Immune system strength" },
    { productId: "vladonix", reason: "Thymus health" }
  ],

  // Blood formation (hematopoietic) & immune
  "revilab-ml-02": [
    { productId: "revilab-sl-07", reason: "Sublingual blood-formation complex" },
    { productId: "bonomarlot", reason: "Bone marrow peptide bioregulator" }
  ],
  "revilab-sl-07": [
    { productId: "bonomarlot", reason: "Bone marrow peptide bioregulator" },
    { productId: "revilab-ml-02", reason: "Blood-formation capsule formula" }
  ],

  // Joint & musculoskeletal
  "cartalax": [
    { productId: "revilab-ml-09", reason: "Comprehensive joint support" },
    { productId: "prime-peptide-collagen", reason: "Connective tissue" }
  ],
  "prime-peptide-joints": [
    { productId: "cartalax", reason: "Cartilage bioregulation" },
    { productId: "prime-peptide-collagen", reason: "Connective tissue" }
  ],
  "revilab-ml-09": [
    { productId: "cartalax", reason: "Cartilage bioregulation" },
    { productId: "prime-peptide-collagen", reason: "Connective tissue" }
  ],
  "revilab-sl-04": [
    { productId: "cartalax", reason: "Cartilage peptide bioregulator" },
    { productId: "revilab-ml-09", reason: "Musculoskeletal capsule formula" }
  ],

  // Respiratory system
  "revilab-ml-05": [
    { productId: "revilab-sl-06", reason: "Sublingual respiratory complex" },
    { productId: "chonluten", reason: "Bronchopulmonary peptide bioregulator" }
  ],
  "revilab-sl-06": [
    { productId: "revilab-ml-05", reason: "Respiratory capsule formula" },
    { productId: "chonluten", reason: "Bronchopulmonary peptide bioregulator" }
  ],

  // Digestive & liver support
  "digemax": [
    { productId: "revilab-ml-06", reason: "Liver optimization" },
    { productId: "revilab-sl-05", reason: "Digestive health" }
  ],
  "revilab-ml-06": [
    { productId: "digemax", reason: "Digestive support" },
    { productId: "svetinorm", reason: "Liver peptide bioregulator" }
  ],
  "revilab-sl-05": [
    { productId: "digemax", reason: "Gut health" },
    { productId: "revilab-ml-06", reason: "Liver function" }
  ],

  // Adaptogen / immune (Panaxod is hidden from the storefront; kept for when it returns)
  "panaxod": [
    { productId: "levain", reason: "Adaptogenic immune complex" },
    { productId: "revilab-ml-02", reason: "Immune & metabolic balance" }
  ],

  // Endocrine & female hormonal
  "thyreogen": [
    { productId: "zhenoluten", reason: "Ovarian peptide bioregulator" },
    { productId: "ventfort", reason: "Blood vessel peptide bioregulator" }
  ],
  "revilab-ml-08": [
    { productId: "revilab-sl-10", reason: "Sublingual female reproductive complex" },
    { productId: "thyreogen", reason: "Thyroid support" }
  ],

  // Urinary system
  "revilab-sl-08": [
    { productId: "chitomur", reason: "Bladder peptide bioregulator" },
    { productId: "pielotax", reason: "Kidney peptide bioregulator" }
  ],

  // Reproductive health (men)
  "revilab-ml-07": [
    { productId: "testoluten", reason: "Testicular peptide bioregulator" },
    { productId: "revilab-sl-09", reason: "Sublingual male reproductive complex" }
  ],
  "testoluten": [
    { productId: "revilab-sl-09", reason: "Urogenital support" },
    { productId: "revilab-ml-07", reason: "Male reproductive & urinary formula" }
  ],
  "revilab-sl-09": [
    { productId: "testoluten", reason: "Testosterone support" },
    { productId: "revilab-ml-07", reason: "Male reproductive & urinary formula" }
  ]
};

export const getRecommendations = (productId: string, maxRecommendations: number = 2): ProductRecommendation[] => {
  return productRecommendations[productId]?.slice(0, maxRecommendations) || [];
};
