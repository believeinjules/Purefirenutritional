// AI Assistant keyword-to-product recommendation mapping
// Maps health concerns/keywords to relevant product recommendations

export interface AIRecommendation {
  productIds: string[];
  explanation: string;
  priority: number; // Higher = more relevant
}

// Keyword patterns mapped to product recommendations
export const healthKeywordMap: Record<string, AIRecommendation> = {
  // Anti-aging & longevity
  "anti-aging": {
    productIds: ["revilab-sl-01", "revilab-ml-01", "nmn-powder", "revilab-anti-age"],
    explanation: "Comprehensive anti-aging support with peptide bioregulators and NAD+ boosters",
    priority: 10
  },
  "aging": {
    productIds: ["revilab-sl-01", "revilab-ml-01", "nmn-powder", "coq10-ubiquinol"],
    explanation: "Cellular rejuvenation and longevity optimization",
    priority: 10
  },
  "wrinkles": {
    productIds: ["anti-wrinkle-serum-7", "revilab-anti-age", "collagen-peptides"],
    explanation: "Topical and internal wrinkle reduction with peptides and collagen",
    priority: 9
  },
  "longevity": {
    productIds: ["nmn-powder", "resveratrol-trans", "revilab-ml-01", "coq10-ubiquinol"],
    explanation: "Science-backed longevity stack for healthy aging",
    priority: 10
  },

  // Cardiovascular health
  "heart": {
    productIds: ["chelohart", "revilab-ml-04", "coq10-ubiquinol", "omega-3-triglyceride"],
    explanation: "Comprehensive cardiovascular support with heart peptides and CoQ10",
    priority: 10
  },
  "cardiovascular": {
    productIds: ["chelohart", "revilab-ml-04", "coq10-ubiquinol", "omega-3-triglyceride"],
    explanation: "Heart health optimization with peptide bioregulators",
    priority: 10
  },
  "blood pressure": {
    productIds: ["chelohart-lingual", "revilab-sl-04", "omega-3-triglyceride"],
    explanation: "Cardiovascular support for healthy blood pressure",
    priority: 9
  },
  "circulation": {
    productIds: ["chelohart", "revilab-ml-04", "coq10-ubiquinol"],
    explanation: "Enhanced blood flow and circulatory system support",
    priority: 9
  },

  // Brain & cognitive
  "brain": {
    productIds: ["pinealon", "revilab-ml-07", "nmn-powder", "omega-3-triglyceride"],
    explanation: "Cognitive enhancement with brain peptides and omega-3",
    priority: 10
  },
  "memory": {
    productIds: ["pinealon", "revilab-ml-07", "nmn-powder"],
    explanation: "Memory support and cognitive function optimization",
    priority: 9
  },
  "focus": {
    productIds: ["pinealon-lingual", "revilab-sl-07", "coq10-ubiquinol"],
    explanation: "Mental clarity and concentration enhancement",
    priority: 9
  },
  "cognitive": {
    productIds: ["pinealon", "revilab-ml-07", "nmn-powder", "omega-3-triglyceride"],
    explanation: "Comprehensive cognitive performance support",
    priority: 10
  },
  "alzheimer": {
    productIds: ["pinealon", "revilab-ml-07", "omega-3-triglyceride"],
    explanation: "Neuroprotective support for brain health",
    priority: 10
  },

  // Energy & metabolism
  "energy": {
    productIds: ["revilab-ml-02", "revilab-sl-02", "coq10-ubiquinol", "nmn-powder"],
    explanation: "Cellular energy production and metabolic optimization",
    priority: 10
  },
  "fatigue": {
    productIds: ["revilab-ml-02", "coq10-ubiquinol", "nmn-powder"],
    explanation: "Combat fatigue with mitochondrial support",
    priority: 9
  },
  "metabolism": {
    productIds: ["revilab-ml-02", "revilab-sl-02", "nmn-powder"],
    explanation: "Metabolic optimization and energy boost",
    priority: 9
  },

  // Immune system
  "immune": {
    productIds: ["crystagen", "revilab-ml-03", "thymalin", "revilab-sl-03"],
    explanation: "Immune system strengthening with thymus peptides",
    priority: 10
  },
  "immunity": {
    productIds: ["crystagen", "revilab-ml-03", "thymalin"],
    explanation: "Enhanced immune defense and cellular protection",
    priority: 10
  },
  "infection": {
    productIds: ["crystagen", "thymalin", "revilab-ml-03"],
    explanation: "Immune support for infection resistance",
    priority: 9
  },

  // Joint & musculoskeletal
  "joint": {
    productIds: ["cartalax", "revilab-ml-09", "collagen-peptides", "revilab-sl-06"],
    explanation: "Joint health and cartilage support",
    priority: 10
  },
  "joints": {
    productIds: ["cartalax", "revilab-ml-09", "collagen-peptides"],
    explanation: "Comprehensive musculoskeletal support",
    priority: 10
  },
  "arthritis": {
    productIds: ["cartalax", "collagen-peptides", "revilab-ml-09"],
    explanation: "Joint inflammation and mobility support",
    priority: 9
  },
  "cartilage": {
    productIds: ["cartalax", "collagen-peptides"],
    explanation: "Cartilage regeneration and joint structure",
    priority: 9
  },
  "bone": {
    productIds: ["revilab-ml-09", "collagen-peptides", "cartalax"],
    explanation: "Bone density and skeletal health",
    priority: 9
  },

  // Digestive & liver
  "liver": {
    productIds: ["svetinorm", "revilab-ml-06", "revilab-sl-05"],
    explanation: "Liver function optimization and detoxification",
    priority: 10
  },
  "digestive": {
    productIds: ["revilab-ml-06", "revilab-sl-05", "probiotics-blend"],
    explanation: "Digestive system health and gut support",
    priority: 9
  },
  "gut": {
    productIds: ["revilab-sl-05", "probiotics-blend", "revilab-ml-06"],
    explanation: "Gut health and microbiome balance",
    priority: 9
  },
  "detox": {
    productIds: ["svetinorm", "revilab-ml-06"],
    explanation: "Liver detoxification and cleansing support",
    priority: 8
  },

  // Stress & nervous system
  "stress": {
    productIds: ["revilab-sl-07", "revilab-ml-07", "pinealon"],
    explanation: "Stress response optimization and nervous system support",
    priority: 9
  },
  "anxiety": {
    productIds: ["revilab-sl-07", "pinealon-lingual"],
    explanation: "Calm and nervous system balance",
    priority: 9
  },
  "sleep": {
    productIds: ["revilab-sl-07", "pinealon"],
    explanation: "Sleep quality and nervous system regulation",
    priority: 9
  },

  // Hormonal & endocrine
  "hormone": {
    productIds: ["revilab-ml-08", "revilab-sl-08", "thymalin"],
    explanation: "Hormonal balance and endocrine system support",
    priority: 9
  },
  "hormonal": {
    productIds: ["revilab-ml-08", "revilab-sl-08"],
    explanation: "Endocrine optimization and hormonal wellness",
    priority: 9
  },
  "thyroid": {
    productIds: ["revilab-ml-08", "thymalin"],
    explanation: "Thyroid and endocrine health support",
    priority: 9
  },

  // Men's health
  "testosterone": {
    productIds: ["testagen", "revilab-sl-09", "revilab-ml-08"],
    explanation: "Testosterone support and men's vitality",
    priority: 9
  },
  "prostate": {
    productIds: ["testagen", "revilab-sl-09"],
    explanation: "Prostate health and urogenital support",
    priority: 9
  },
  "mens health": {
    productIds: ["testagen", "revilab-sl-09", "revilab-ml-08"],
    explanation: "Comprehensive men's health optimization",
    priority: 9
  },

  // Skin health
  "skin": {
    productIds: ["anti-wrinkle-serum-7", "collagen-peptides", "revilab-anti-age"],
    explanation: "Skin rejuvenation and anti-aging support",
    priority: 9
  },
  "collagen": {
    productIds: ["collagen-peptides", "anti-wrinkle-serum-7"],
    explanation: "Collagen production for skin and joints",
    priority: 9
  }
};

// Function to analyze user message and return product recommendations
export const getAIRecommendations = (userMessage: string, maxResults: number = 3): string[] => {
  const messageLower = userMessage.toLowerCase();
  const matches: Array<{ productIds: string[]; priority: number }> = [];

  // Check for keyword matches
  Object.entries(healthKeywordMap).forEach(([keyword, recommendation]) => {
    if (messageLower.includes(keyword)) {
      matches.push({
        productIds: recommendation.productIds,
        priority: recommendation.priority
      });
    }
  });

  // Sort by priority and deduplicate products
  matches.sort((a, b) => b.priority - a.priority);
  
  const recommendedProductIds = new Set<string>();
  matches.forEach(match => {
    match.productIds.forEach(id => recommendedProductIds.add(id));
  });

  return Array.from(recommendedProductIds).slice(0, maxResults);
};

// Get explanation for recommended products
export const getRecommendationExplanation = (userMessage: string): string => {
  const messageLower = userMessage.toLowerCase();
  let bestExplanation = "Based on your health goals, here are my recommendations:";
  let bestPriority = 0;

  Object.entries(healthKeywordMap).forEach(([keyword, recommendation]) => {
    if (messageLower.includes(keyword) && recommendation.priority > bestPriority) {
      bestExplanation = recommendation.explanation;
      bestPriority = recommendation.priority;
    }
  });

  return bestExplanation;
};
