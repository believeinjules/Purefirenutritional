// AI Assistant keyword-to-product recommendation mapping
// Maps health concerns/keywords to relevant product recommendations.
// All productIds MUST exist in products.ts (enforced by aiRecommendations.test.ts).

export interface AIRecommendation {
  productIds: string[];
  explanation: string;
  priority: number; // Higher = more relevant
}

// Keyword patterns mapped to product recommendations
export const healthKeywordMap: Record<string, AIRecommendation> = {
  // Anti-aging & longevity
  "anti-aging": {
    productIds: ["revilab-sl-01", "revilab-ml-01", "endoluten", "revilab-anti-age"],
    explanation: "Comprehensive anti-aging support with peptide bioregulators and pineal longevity peptides",
    priority: 10
  },
  "aging": {
    productIds: ["revilab-sl-01", "revilab-ml-01", "endoluten", "olecap"],
    explanation: "Cellular rejuvenation and longevity optimization",
    priority: 10
  },
  "wrinkles": {
    productIds: ["anti-wrinkle-serum-7", "revilab-anti-age", "prime-peptide-collagen"],
    explanation: "Topical and internal wrinkle reduction with peptides and collagen support",
    priority: 9
  },
  "longevity": {
    productIds: ["endoluten", "revilab-anti-age", "revilab-ml-01", "vladonix"],
    explanation: "Science-backed longevity stack for healthy aging",
    priority: 10
  },

  // Cardiovascular health
  "heart": {
    productIds: ["chelohart", "revilab-ml-04", "olecap", "prime-peptide-omega"],
    explanation: "Comprehensive cardiovascular support with heart peptides and omega nutrition",
    priority: 10
  },
  "cardiovascular": {
    productIds: ["chelohart", "revilab-ml-04", "olecap", "prime-peptide-omega"],
    explanation: "Heart health optimization with peptide bioregulators",
    priority: 10
  },
  // Softened: disease-style "blood pressure" → vascular / circulatory structure-function
  "vascular": {
    productIds: ["chelohart", "revilab-sl-04", "ventfort", "prime-peptide-omega"],
    explanation: "Supports healthy vascular function and circulatory wellness",
    priority: 9
  },
  "blood pressure": {
    productIds: ["chelohart", "revilab-sl-04", "ventfort"],
    explanation: "Supports healthy vascular function and circulatory wellness",
    priority: 9
  },
  "circulation": {
    productIds: ["chelohart", "revilab-ml-04", "ventfort", "olecap"],
    explanation: "Enhanced blood flow and circulatory system support",
    priority: 9
  },

  // Brain & cognitive
  "brain": {
    productIds: ["prime-peptide-brain", "revilab-ml-07", "endoluten", "prime-peptide-omega"],
    explanation: "Cognitive enhancement with brain peptides and omega nutrition",
    priority: 10
  },
  "memory": {
    productIds: ["prime-peptide-brain", "revilab-ml-07", "endoluten"],
    explanation: "Memory support and cognitive function optimization",
    priority: 9
  },
  "focus": {
    productIds: ["prime-peptide-brain", "revilab-sl-07", "endoluten"],
    explanation: "Mental clarity and concentration enhancement",
    priority: 9
  },
  "cognitive": {
    productIds: ["prime-peptide-brain", "revilab-ml-07", "endoluten", "prime-peptide-omega"],
    explanation: "Comprehensive cognitive performance support",
    priority: 10
  },
  // Softened: "alzheimer" → cognitive aging / neural structure-function
  "cognitive aging": {
    productIds: ["prime-peptide-brain", "revilab-ml-07", "endoluten"],
    explanation: "Supports healthy cognitive function and neural communication with age",
    priority: 10
  },
  "alzheimer": {
    productIds: ["prime-peptide-brain", "revilab-ml-07", "endoluten"],
    explanation: "Supports healthy cognitive function and neural communication with age",
    priority: 10
  },

  // Energy & metabolism
  "energy": {
    productIds: ["revilab-ml-02", "revilab-sl-02", "panaxod", "endoluten"],
    explanation: "Cellular energy production and metabolic optimization",
    priority: 10
  },
  "fatigue": {
    productIds: ["revilab-ml-02", "panaxod", "endoluten"],
    explanation: "Combat fatigue with mitochondrial and adaptogenic support",
    priority: 9
  },
  "metabolism": {
    productIds: ["revilab-ml-02", "revilab-sl-02", "endoluten"],
    explanation: "Metabolic optimization and energy boost",
    priority: 9
  },

  // Immune system
  "immune": {
    productIds: ["crystagen", "revilab-ml-03", "vladonix", "revilab-sl-03"],
    explanation: "Immune system strengthening with thymus peptides",
    priority: 10
  },
  "immunity": {
    productIds: ["crystagen", "revilab-ml-03", "vladonix"],
    explanation: "Enhanced immune defense and cellular protection",
    priority: 10
  },
  // Softened: "infection" → immune resilience / seasonal wellness
  "immune resilience": {
    productIds: ["crystagen", "vladonix", "revilab-ml-03"],
    explanation: "Supports immune system resilience and seasonal wellness",
    priority: 9
  },
  "infection": {
    productIds: ["crystagen", "vladonix", "revilab-ml-03"],
    explanation: "Supports immune system resilience and seasonal wellness",
    priority: 9
  },

  // Joint & musculoskeletal
  "joint": {
    productIds: ["cartalax", "revilab-ml-09", "prime-peptide-collagen", "revilab-sl-06"],
    explanation: "Joint health and cartilage support",
    priority: 10
  },
  "joints": {
    productIds: ["cartalax", "revilab-ml-09", "prime-peptide-joints"],
    explanation: "Comprehensive musculoskeletal support",
    priority: 10
  },
  // Softened: "arthritis" → mobility / joint comfort structure-function
  "mobility": {
    productIds: ["cartalax", "prime-peptide-joints", "revilab-ml-09"],
    explanation: "Supports joint comfort, flexibility, and connective tissue",
    priority: 9
  },
  "arthritis": {
    productIds: ["cartalax", "prime-peptide-joints", "revilab-ml-09"],
    explanation: "Supports joint comfort, flexibility, and connective tissue",
    priority: 9
  },
  "cartilage": {
    productIds: ["cartalax", "prime-peptide-collagen"],
    explanation: "Cartilage regeneration and joint structure",
    priority: 9
  },
  "bone": {
    productIds: ["revilab-ml-09", "bonomarlot", "cartalax"],
    explanation: "Bone density and skeletal health",
    priority: 9
  },

  // Digestive & liver
  "liver": {
    productIds: ["revilab-ml-06", "digemax", "revilab-sl-05"],
    explanation: "Liver function optimization and digestive support",
    priority: 10
  },
  "digestive": {
    productIds: ["revilab-ml-06", "revilab-sl-05", "digemax"],
    explanation: "Digestive system health and gut support",
    priority: 9
  },
  "gut": {
    productIds: ["revilab-sl-05", "digemax", "revilab-ml-06"],
    explanation: "Gut health and microbiome balance",
    priority: 9
  },
  "detox": {
    productIds: ["revilab-ml-06", "digemax"],
    explanation: "Liver detoxification and cleansing support",
    priority: 8
  },

  // Stress & nervous system
  "stress": {
    productIds: ["revilab-sl-07", "revilab-ml-07", "endoluten"],
    explanation: "Stress response optimization and nervous system support",
    priority: 9
  },
  "anxiety": {
    productIds: ["revilab-sl-07", "endoluten"],
    explanation: "Calm and nervous system balance",
    priority: 9
  },
  "sleep": {
    productIds: ["revilab-sl-07", "endoluten"],
    explanation: "Sleep quality and nervous system regulation",
    priority: 9
  },

  // Hormonal & endocrine
  "hormone": {
    productIds: ["revilab-ml-08", "revilab-sl-08", "thyreogen"],
    explanation: "Hormonal balance and endocrine system support",
    priority: 9
  },
  "hormonal": {
    productIds: ["revilab-ml-08", "revilab-sl-08"],
    explanation: "Endocrine optimization and hormonal wellness",
    priority: 9
  },
  "thyroid": {
    productIds: ["thyreogen", "revilab-ml-08"],
    explanation: "Thyroid and endocrine health support",
    priority: 9
  },

  // Men's health
  "testosterone": {
    productIds: ["testoluten", "revilab-sl-09", "revilab-ml-08"],
    explanation: "Testosterone support and men's vitality",
    priority: 9
  },
  "prostate": {
    productIds: ["testoluten", "revilab-sl-09"],
    explanation: "Prostate health and urogenital support",
    priority: 9
  },
  "mens health": {
    productIds: ["testoluten", "revilab-sl-09", "revilab-ml-08"],
    explanation: "Comprehensive men's health optimization",
    priority: 9
  },

  // Skin health
  "skin": {
    productIds: ["anti-wrinkle-serum-7", "prime-peptide-collagen", "revilab-anti-age"],
    explanation: "Skin rejuvenation and anti-aging support",
    priority: 9
  },
  "collagen": {
    productIds: ["prime-peptide-collagen", "anti-wrinkle-serum-7"],
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
