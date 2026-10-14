/**
 * ONE product-data source for the storefront AND Pepita (2026-10-14).
 *
 * shared/product-facts.json holds, per product:
 *  - composition            → products.ts `ingredients` (storefront, Firestore seed, Pepita)
 *  - storefrontUsage        → products.ts `usage` (PDP text) and its basis
 *  - manufacturerDirections → the label text + status (verified | conflicting | blocked | needs-approval | unverified)
 *  - alternativeProtocols   → research/course documents, educational only, never shown as the label
 *  - biologicalTarget, context, evidence, limitations, researchNote, contraindications
 *  - sources[] {url, type: label|official-doc|catalog|study|course, formulation, quote, translation}
 *  - verificationStatus, hold
 *
 * Source hierarchy: (1) physical label of the batch we sell, (2) current official manufacturer docs
 * for the exact SKU, (3) official catalog/instructions, (4) research/course protocols (educational).
 * Conflicts are recorded, never silently resolved. Pepita shows directions only when they are
 * verified AND identical to what the product page shows (see pepitaDirections).
 */
import FACTS from "./product-facts.json";

export type SourceType = "label" | "official-doc" | "catalog" | "study" | "course";
export type DirectionsStatus = "verified" | "conflicting" | "blocked" | "needs-approval" | "unverified";
export type UsageBasis = "manufacturer-label" | "page-text-matches-label" | "held-page-text" | "page-text-unaudited" | "none";
export type VerificationStatus = "verified" | "conflicting" | "blocked" | "needs-approval" | "needs-research" | "unaudited";

export interface FactSource {
  url: string;
  type: SourceType;
  formulation: string | null;
  quote: string | null;
  translation: string | null;
}

export interface ProductFacts {
  id: string;
  name: string;
  composition: string[] | null;
  biologicalTarget: string | null;
  manufacturerDirections: {
    text: string | null;
    status: DirectionsStatus;
    /** Conflicting/held candidates with their source (never displayed as the label). */
    options: { text: string; source: string }[];
    note: string | null;
  };
  storefrontUsage: { text: string | null; basis: UsageBasis };
  alternativeProtocols: { text: string; source: string; kind: string }[];
  context: { preventive?: string; maintenance?: string; restorative?: string } | null;
  evidence: string | null;
  limitations: string | null;
  /** Literature-only notes (e.g. a peptide sequence not printed on the label). Learn more only. */
  researchNote: string | null;
  contraindications: string | null;
  sources: FactSource[];
  verificationStatus: VerificationStatus;
  hold: string | null;
  auditRows: string[];
  /**
   * Pepita-only directions that intentionally differ from the storefront page (known exception,
   * approved by Julia). The storefront keeps storefrontUsage; Pepita states this text.
   */
  pepitaOverride?: { text: string; basis: string; source: string; exception: string };
}

export const PRODUCT_FACTS: Record<string, ProductFacts> = (FACTS as unknown as { products: Record<string, ProductFacts> }).products;

export function getProductFacts(id: string): ProductFacts | undefined {
  return PRODUCT_FACTS[id];
}

/** Directions Pepita may state: verified label text that is exactly what the product page shows. */
export function pepitaDirections(id: string): string | null {
  const f = PRODUCT_FACTS[id];
  if (f?.pepitaOverride) return f.pepitaOverride.text;
  if (!f || f.manufacturerDirections.status !== "verified") return null;
  const { text, basis } = f.storefrontUsage;
  if (!text || (basis !== "manufacturer-label" && basis !== "page-text-matches-label")) return null;
  return text;
}

type WithFacts = { id: string; usage?: string; ingredients?: string[] };

/** Storefront usage/ingredients always come from the facts file (products.ts carries neither). */
export function applyProductFacts<T extends WithFacts>(product: T): T {
  const f = PRODUCT_FACTS[product.id];
  if (!f) return product;
  const out: T = { ...product };
  if (f.storefrontUsage.text) out.usage = f.storefrontUsage.text;
  else delete out.usage;
  if (f.composition?.length) out.ingredients = [...f.composition];
  else delete out.ingredients;
  return out;
}

/** Products whose Pepita directions intentionally differ from the storefront (pending Julia). */
export const PEPITA_DIRECTION_EXCEPTIONS = Object.values(PRODUCT_FACTS).filter(f => f.pepitaOverride).map(f => f.id);
