import { getPdpContent } from "@shared/product-facts";

/**
 * Recommendation cards for these three products were still showing the old
 * catalog sentences. The product page body uses the pdp overview and
 * formulatedFor lines in shared/product-facts.json. Cards use those same
 * lines. Prices, variants, and other catalog fields are not read or written.
 */
const CARD_COPY_IDS = new Set(["prime-peptide-brain", "prime-peptide-joints", "anti-wrinkle-serum-7"]);

export function recommendationCardCopy(product: {
  id: string;
  description?: string | null;
  benefits?: string[] | null;
}): { description: string; benefits: string[] } {
  const pdp = CARD_COPY_IDS.has(product.id) ? getPdpContent(product.id) : undefined;
  const overview = pdp?.overview?.[0]?.trim();
  return {
    description: overview || product.description || "",
    benefits: pdp?.formulatedFor?.length ? [...pdp.formulatedFor] : [...(product.benefits ?? [])],
  };
}
