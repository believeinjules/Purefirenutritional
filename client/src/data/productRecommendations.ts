// Product recommendation logic for "Frequently Bought Together"
// Maps product IDs to recommended complementary products.
// All productIds MUST exist in products.ts.

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
    { productId: "olecap", reason: "Heart energy & protection" }
  ],
  "revilab-ml-04": [
    { productId: "chelohart", reason: "Targeted heart peptides" },
    { productId: "olecap", reason: "Mitochondrial support" }
  ],
  "revilab-sl-04": [
    { productId: "chelohart", reason: "Fast-acting heart support" },
    { productId: "prime-peptide-omega", reason: "Cardiovascular health" }
  ],
  "ventfort": [
    { productId: "chelohart", reason: "Heart + vessel pairing" },
    { productId: "revilab-ml-04", reason: "Cardiovascular complex" }
  ],

  // Brain & cognitive support
  "prime-peptide-brain": [
    { productId: "revilab-ml-07", reason: "Comprehensive brain support" },
    { productId: "endoluten", reason: "Cognitive energy boost" }
  ],
  "endoluten": [
    { productId: "vladonix", reason: "Foundational longevity pairing" },
    { productId: "revilab-anti-age", reason: "Anti-glycation support" }
  ],
  "revilab-ml-07": [
    { productId: "prime-peptide-brain", reason: "Brain peptide bioregulator" },
    { productId: "endoluten", reason: "Mental clarity & focus" }
  ],
  "revilab-sl-07": [
    { productId: "endoluten", reason: "Nervous system support" },
    { productId: "prime-peptide-omega", reason: "Brain health" }
  ],

  // Immune system support
  "crystagen": [
    { productId: "revilab-ml-03", reason: "Enhanced immune defense" },
    { productId: "vladonix", reason: "Thymus support" }
  ],
  "vladonix": [
    { productId: "endoluten", reason: "Foundational longevity pairing" },
    { productId: "crystagen", reason: "Immune bioregulation" }
  ],
  "revilab-ml-03": [
    { productId: "crystagen", reason: "Immune bioregulation" },
    { productId: "revilab-sl-03", reason: "Respiratory & immune" }
  ],
  "revilab-sl-03": [
    { productId: "crystagen", reason: "Immune system strength" },
    { productId: "vladonix", reason: "Thymus health" }
  ],

  // Joint & musculoskeletal
  "cartalax": [
    { productId: "revilab-ml-09", reason: "Comprehensive joint support" },
    { productId: "prime-peptide-collagen", reason: "Connective tissue" }
  ],
  "prime-peptide-joints": [
    { productId: "cartalax", reason: "Cartilage bioregulation" },
    { productId: "prime-peptide-collagen", reason: "Joint structure" }
  ],
  "revilab-ml-09": [
    { productId: "cartalax", reason: "Cartilage bioregulation" },
    { productId: "prime-peptide-collagen", reason: "Joint structure" }
  ],
  "revilab-sl-06": [
    { productId: "cartalax", reason: "Musculoskeletal health" },
    { productId: "prime-peptide-collagen", reason: "Joint support" }
  ],

  // Digestive & liver support
  "digemax": [
    { productId: "revilab-ml-06", reason: "Liver optimization" },
    { productId: "revilab-sl-05", reason: "Digestive health" }
  ],
  "revilab-ml-06": [
    { productId: "digemax", reason: "Digestive support" },
    { productId: "prime-peptide-omega", reason: "Liver health" }
  ],
  "revilab-sl-05": [
    { productId: "digemax", reason: "Gut health" },
    { productId: "revilab-ml-06", reason: "Liver function" }
  ],

  // Longevity & energy stacks
  "olecap": [
    { productId: "endoluten", reason: "Longevity + vascular support" },
    { productId: "panaxod", reason: "Adaptogenic energy" }
  ],
  "panaxod": [
    { productId: "revilab-ml-02", reason: "Metabolic energy" },
    { productId: "olecap", reason: "Cardiovascular support" }
  ],

  // Comprehensive anti-aging (Revilab SL 01 & ML 01)
  "revilab-sl-01": [
    { productId: "revilab-ml-01", reason: "Multi-level anti-aging" },
    { productId: "endoluten", reason: "Cellular rejuvenation" }
  ],
  "revilab-ml-01": [
    { productId: "revilab-sl-01", reason: "Fast-acting anti-aging" },
    { productId: "olecap", reason: "Energy & longevity" }
  ],

  // Metabolic & energy (Revilab SL 02 & ML 02)
  "revilab-sl-02": [
    { productId: "revilab-ml-02", reason: "Metabolic optimization" },
    { productId: "panaxod", reason: "Energy production" }
  ],
  "revilab-ml-02": [
    { productId: "revilab-sl-02", reason: "Rapid energy boost" },
    { productId: "endoluten", reason: "Cellular energy" }
  ],

  // Endocrine & hormonal
  "thyreogen": [
    { productId: "revilab-ml-08", reason: "Endocrine optimization" },
    { productId: "revilab-sl-08", reason: "Hormonal balance" }
  ],
  "revilab-ml-08": [
    { productId: "revilab-sl-08", reason: "Hormonal balance" },
    { productId: "thyreogen", reason: "Thyroid support" }
  ],
  "revilab-sl-08": [
    { productId: "revilab-ml-08", reason: "Endocrine optimization" },
    { productId: "thyreogen", reason: "Thyroid health" }
  ],

  // Reproductive health (men)
  "testoluten": [
    { productId: "revilab-sl-09", reason: "Urogenital support" },
    { productId: "revilab-ml-08", reason: "Hormonal balance" }
  ],
  "revilab-sl-09": [
    { productId: "testoluten", reason: "Testosterone support" },
    { productId: "revilab-ml-08", reason: "Men's endocrine support" }
  ],

  // Respiratory system
  "revilab-ml-05": [
    { productId: "ventfort", reason: "Vessel + respiratory support" },
    { productId: "crystagen", reason: "Immune & respiratory" }
  ]
};

export const getRecommendations = (productId: string, maxRecommendations: number = 2): ProductRecommendation[] => {
  return productRecommendations[productId]?.slice(0, maxRecommendations) || [];
};
