// Product recommendation logic for "Frequently Bought Together"
// Maps product IDs to recommended complementary products

export interface ProductRecommendation {
  productId: string;
  reason?: string;
}

export const productRecommendations: Record<string, ProductRecommendation[]> = {
  // Anti-Aging Cosmetics - pair with supplements
  "anti-wrinkle-serum-7": [
    { productId: "revilab-anti-age", reason: "Internal anti-aging support" },
    { productId: "coq10-ubiquinol", reason: "Cellular energy & antioxidants" }
  ],
  "revilab-anti-age": [
    { productId: "anti-wrinkle-serum-7", reason: "Topical wrinkle reduction" },
    { productId: "nmn-powder", reason: "NAD+ boost for longevity" }
  ],

  // Cardiovascular support combinations
  "chelohart": [
    { productId: "revilab-ml-04", reason: "Enhanced cardiovascular support" },
    { productId: "coq10-ubiquinol", reason: "Heart energy & protection" }
  ],
  "chelohart-lingual": [
    { productId: "revilab-sl-04", reason: "Sublingual cardiovascular boost" },
    { productId: "omega-3-triglyceride", reason: "Heart health & inflammation" }
  ],
  "revilab-ml-04": [
    { productId: "chelohart", reason: "Targeted heart peptides" },
    { productId: "coq10-ubiquinol", reason: "Mitochondrial support" }
  ],
  "revilab-sl-04": [
    { productId: "chelohart-lingual", reason: "Fast-acting heart support" },
    { productId: "omega-3-triglyceride", reason: "Cardiovascular health" }
  ],

  // Brain & cognitive support
  "pinealon": [
    { productId: "revilab-ml-07", reason: "Comprehensive brain support" },
    { productId: "nmn-powder", reason: "Cognitive energy boost" }
  ],
  "pinealon-lingual": [
    { productId: "revilab-sl-07", reason: "Nervous system support" },
    { productId: "coq10-ubiquinol", reason: "Brain energy" }
  ],
  "revilab-ml-07": [
    { productId: "pinealon", reason: "Brain peptide bioregulator" },
    { productId: "nmn-powder", reason: "Mental clarity & focus" }
  ],
  "revilab-sl-07": [
    { productId: "pinealon-lingual", reason: "Rapid brain support" },
    { productId: "omega-3-triglyceride", reason: "Brain health" }
  ],

  // Immune system support
  "crystagen": [
    { productId: "revilab-ml-03", reason: "Enhanced immune defense" },
    { productId: "thymalin", reason: "Thymus support" }
  ],
  "revilab-ml-03": [
    { productId: "crystagen", reason: "Immune bioregulation" },
    { productId: "revilab-sl-03", reason: "Respiratory & immune" }
  ],
  "revilab-sl-03": [
    { productId: "crystagen", reason: "Immune system strength" },
    { productId: "thymalin-lingual", reason: "Thymus health" }
  ],

  // Joint & musculoskeletal
  "cartalax": [
    { productId: "revilab-ml-09", reason: "Comprehensive joint support" },
    { productId: "collagen-peptides", reason: "Connective tissue" }
  ],
  "revilab-ml-09": [
    { productId: "cartalax", reason: "Cartilage bioregulation" },
    { productId: "collagen-peptides", reason: "Joint structure" }
  ],
  "revilab-sl-06": [
    { productId: "cartalax", reason: "Musculoskeletal health" },
    { productId: "collagen-peptides", reason: "Joint support" }
  ],

  // Digestive & liver support
  "svetinorm": [
    { productId: "revilab-ml-06", reason: "Liver optimization" },
    { productId: "revilab-sl-05", reason: "Digestive health" }
  ],
  "revilab-ml-06": [
    { productId: "svetinorm", reason: "Liver peptides" },
    { productId: "omega-3-triglyceride", reason: "Liver health" }
  ],
  "revilab-sl-05": [
    { productId: "svetinorm", reason: "Liver function" },
    { productId: "probiotics-blend", reason: "Gut health" }
  ],

  // Longevity & anti-aging stacks
  "nmn-powder": [
    { productId: "revilab-anti-age", reason: "Anti-glycation support" },
    { productId: "resveratrol-trans", reason: "Sirtuins activation" }
  ],
  "coq10-ubiquinol": [
    { productId: "nmn-powder", reason: "NAD+ & mitochondria" },
    { productId: "pqq-pyrroloquinoline", reason: "Mitochondrial biogenesis" }
  ],

  // Comprehensive anti-aging (Revilab SL 01 & ML 01)
  "revilab-sl-01": [
    { productId: "revilab-ml-01", reason: "Multi-level anti-aging" },
    { productId: "nmn-powder", reason: "Cellular rejuvenation" }
  ],
  "revilab-ml-01": [
    { productId: "revilab-sl-01", reason: "Fast-acting anti-aging" },
    { productId: "coq10-ubiquinol", reason: "Energy & longevity" }
  ],

  // Metabolic & energy (Revilab SL 02 & ML 02)
  "revilab-sl-02": [
    { productId: "revilab-ml-02", reason: "Metabolic optimization" },
    { productId: "coq10-ubiquinol", reason: "Energy production" }
  ],
  "revilab-ml-02": [
    { productId: "revilab-sl-02", reason: "Rapid energy boost" },
    { productId: "nmn-powder", reason: "Cellular energy" }
  ],

  // Endocrine & hormonal
  "revilab-ml-08": [
    { productId: "revilab-sl-08", reason: "Hormonal balance" },
    { productId: "thymalin", reason: "Endocrine support" }
  ],
  "revilab-sl-08": [
    { productId: "revilab-ml-08", reason: "Endocrine optimization" },
    { productId: "pinealon", reason: "Hormonal regulation" }
  ],

  // Reproductive health (men)
  "testagen": [
    { productId: "revilab-sl-09", reason: "Urogenital support" },
    { productId: "revilab-ml-08", reason: "Hormonal balance" }
  ],
  "revilab-sl-09": [
    { productId: "revilab-ml-07", reason: "Men's health support" },
    { productId: "testagen", reason: "Testosterone support" }
  ],

  // Respiratory system
  "ventfort": [
    { productId: "revilab-ml-05", reason: "Respiratory optimization" },
    { productId: "crystagen", reason: "Immune & respiratory" }
  ],
  "revilab-ml-05": [
    { productId: "revilab-sl-06", reason: "Fast respiratory support" },
    { productId: "omega-3-triglyceride", reason: "Anti-inflammatory" }
  ]
};

export const getRecommendations = (productId: string, maxRecommendations: number = 2): ProductRecommendation[] => {
  return productRecommendations[productId]?.slice(0, maxRecommendations) || [];
};
