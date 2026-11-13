/**
 * <title> and meta description for static public pages (home, about, shop,
 * journal, articles, science, FAQ, Pepita, Peptalk, authenticity).
 * Product, category, policy and certificate pages keep their own generators.
 *
 * Each title and description must be unique, accurate to that page, and free
 * of keyword stuffing or unsupported health claims. Brand format is
 * "… | Pure Fire Nutritional" when it still fits ~60 characters.
 */
export type PageHead = { title: string; description: string };

export const PUBLIC_PAGE_HEADS: Record<string, PageHead> = {
  "/": {
    title: "Authorized U.S. Khavinson Retailer | Pure Fire Nutritional",
    description:
      "Pure Fire Nutritional is a U.S.-based authorized retailer of Khavinson peptide bioregulators, focused on cellular health, healthy aging, and longevity.",
  },
  "/about": {
    title: "About Our Store | Pure Fire Nutritional",
    description:
      "About Pure Fire Nutritional, based in Brooklyn, NY: how we source Khavinson peptide bioregulators directly from the manufacturer, and who is behind the store.",
  },
  "/about/authorized-retailer": {
    title: "Retailer Authorization | Pure Fire Nutritional",
    description:
      "How Pure Fire Nutritional is authorized as a U.S. retailer of Khavinson peptide bioregulators: Brooklyn, NY details, documentation, and how to check them.",
  },
  "/products": {
    title: "Shop Peptide Bioregulators | Pure Fire Nutritional",
    description:
      "Browse our full catalog of Khavinson peptide bioregulators, Cytomaxes, Cytogens, Revilab series, and longevity supplements. Authorized U.S. retailer.",
  },
  "/learn": {
    title: "Longevity Journal | Pure Fire Nutritional",
    description:
      "Longevity Journal from Pure Fire Nutritional: what Khavinson peptide bioregulators are, Cytomaxes vs Cytogens, U.S. sourcing, and a systems view of peptides.",
  },
  "/science": {
    title: "The Science of Khavinson Peptides | Pure Fire Nutritional",
    description:
      "Peer-reviewed research behind Khavinson peptide bioregulators, including cellular aging, neuroplasticity, and longevity science from a 40-year research line.",
  },
  "/faq": {
    title: "Frequently Asked Questions | Pure Fire Nutritional",
    description:
      "Get answers to common questions about Khavinson peptide bioregulators, ordering, shipping, and how our products support longevity and wellness.",
  },
  "/ai-assistant": {
    title: "Pepita — Peptide Research Sidekick | Pure Fire Nutritional",
    description:
      "Ask Pepita, Pure Fire's research assistant, about peptide bioregulators: direct answers with linked PubMed studies, their limits, and related products.",
  },
  "/peptalk": {
    title: "Peptalk Podcast | Pure Fire Nutritional",
    description:
      "Peptalk Podcast from Pure Fire Nutritional: engaging conversations about health, longevity, peptides, and wellness with leading experts in the field.",
  },
  "/authenticity": {
    title: "Authenticity | Pure Fire Nutritional",
    description:
      "Original EAEU Certificates of State Registration for Pure Fire Nutritional products, shown with English translations. Not FDA approval.",
  },
  "/learn/what-are-khavinson-peptide-bioregulators": {
    title: "What Are Khavinson Bioregulators? | Pure Fire Nutritional",
    description:
      "An explanation of Khavinson peptide bioregulators: short peptides and peptide complexes, Cytomaxes vs. Cytogens, and what the research does and does not show.",
  },
  "/learn/buy-khavinson-peptides-usa": {
    title: "Where to Buy Khavinson Peptides in the USA",
    description:
      "Why authentic Khavinson bioregulators are hard to find in the U.S., how oral forms differ from injectables, and how to check a seller's documents and sourcing.",
  },
  "/learn/peptides-in-context-systems-view": {
    title: "Peptides in Context: A Systems View | Pure Fire Nutritional",
    description:
      "Why we think about peptides as signals inside connected systems — from oxytocin to GLP-1 drugs — and where Khavinson's model is still a hypothesis.",
  },
  "/learn/khavinson-bioregulators-perimenopause-oral-evidence": {
    title: "Oral Bioregulators in Perimenopause | Pure Fire Nutritional",
    description:
      "What research on oral Khavinson bioregulators does and does not show for perimenopause: mostly injected forms, no verified trials, and how to check quality.",
  },
  "/learn/why-buy-khavinson-peptides-from-pure-fire": {
    title: "Why Buy From Pure Fire? | Pure Fire Nutritional",
    description:
      "Same peptide name, very different prices. What a sequence can't tell you, why the manufacturer and paperwork matter, and what to ask before you buy.",
  },
  "/learn/khavinson-peptide-bioregulators-research-vs-fda-approval": {
    title: "Khavinson Peptide Bioregulators: Research vs FDA Approval",
    description:
      "Explore Khavinson peptide bioregulators, their proposed uses, safety, evidence, and U.S. legal status—and learn why research history alone is not FDA approval.",
  },
  "/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery": {
    title: "Oral vs Injectable Bioregulators: Digestion and Delivery",
    description:
      "Explore oral peptide bioregulators, their proposed role, digestion and delivery, and Khavinson's research on tissue specificity and its evidence limits.",
  },
  "/learn/bioregulator-organ-pairings-mechanism-vs-evidence": {
    title: "Bioregulator Organ Pairings: Mechanism vs Evidence",
    description:
      "Explore Khavinson bioregulator supplements, organ pairings, proposed mechanisms, and how digestion and absorption may alter oral peptide uptake, availability.",
  },
  "/learn/cytomaxes-cytogens-a-numbers-glossary": {
    title: "Cytomaxes, Cytogens & A-Numbers: Glossary | Pure Fire",
    description:
      "Plain definitions of peptide bioregulator terms: cytamins, cytomedins, cytogens, Pure Fire's Cytomaxes and Cytogens collections, A-numbers and U.S. status.",
  },
  "/learn/registration-certificate-vs-certificate-of-analysis": {
    title: "Registration Certificate vs Certificate of Analysis (COA)",
    description:
      "What an EAEU registration certificate shows, how to read a certificate of analysis for a supplement lot, and what neither document tells you about results.",
  },
  "/learn/how-to-choose-a-peptide-bioregulator-retailer": {
    title: "How to Choose a Peptide Bioregulator Retailer (2026)",
    description:
      "A checklist for choosing a peptide bioregulator retailer: sourcing, authenticity, documents, shipping, claims, and returns, with Pure Fire as an example.",
  },
  "/learn/vesugen-research-safety": {
    title: "Vesugen Research and Safety: What the Evidence Shows",
    description:
      "Vesugen is a short synthetic peptide (Lys-Glu-Asp) studied in blood vessel cells. What the laboratory and human research shows, and what it doesn't.",
  },
};

export const JOURNAL_TITLE = PUBLIC_PAGE_HEADS["/learn"].title;
export const JOURNAL_DESCRIPTION = PUBLIC_PAGE_HEADS["/learn"].description;

export function pageHead(path: string): PageHead | undefined {
  return PUBLIC_PAGE_HEADS[path];
}

export function requirePageHead(path: string): PageHead {
  const head = PUBLIC_PAGE_HEADS[path];
  if (!head) throw new Error(`No PUBLIC_PAGE_HEADS entry for ${path}`);
  return head;
}
