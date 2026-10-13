/**
 * Data for the Khavinson intro page (Julia's light version, 2026-10-13).
 * Products come only from the public catalog and are filtered again with isHiddenProduct.
 */
import { isHiddenProduct } from "@shared/hidden-products";
import { products as catalog, type Product } from "@/data/products";
import { SHOP_SYSTEMS, type ShopSystemId } from "@/data/systems";

/** One Cytogen and one Cytomax shown under the Two Types visual (ids from the catalog). */
export const TYPE_EXAMPLES = [
  { type: "Cytogen", id: "cartalax" },
  { type: "Cytomax", id: "endoluten" },
] as const;

export function visibleProducts(list: readonly Product[] = catalog): Product[] {
  return list.filter((p) => !isHiddenProduct(p));
}

/** Example products, skipping any that are hidden, missing or fully out of stock. */
export function typeExamples(list: readonly Product[] = catalog): { type: string; product: Product }[] {
  const visible = visibleProducts(list);
  return TYPE_EXAMPLES.flatMap(({ type, id }) => {
    const product = visible.find((p) => p.id === id);
    if (!product) return [];
    if (product.variants?.length && !product.variants.some((v) => v.inStock)) return [];
    return [{ type, product }];
  });
}

export function productHref(id: string): string {
  return `/products/${id}`;
}

/** Body-system tiles: the store's existing "Shop by system" filter (/products?system=<id>). */
export function systemHref(id: ShopSystemId): string {
  return `/products?system=${id}`;
}

export const BODY_SYSTEM_TILES = SHOP_SYSTEMS.map((s) => ({ id: s.id, name: s.name, href: systemHref(s.id) }));

/** "Ask Pepita" suggestions per section in view; prefilled via /ai-assistant?q=. */
export const PEPITA_SUGGESTIONS: Record<"intro" | "types" | "systems", string[]> = {
  intro: [
    "What are Khavinson peptide bioregulators, in simple terms?",
    "How are peptides different from proteins?",
    "Where should I start if I'm new to peptides?",
  ],
  types: [
    "What's the difference between Cytogens and Cytomaxes?",
    "How do I choose between a Cytogen and a Cytomax?",
    "Can Cytogens and Cytomaxes be used together?",
  ],
  systems: [
    "Which products relate to the body system I'm interested in?",
    "What should I look at when comparing products for one body system?",
  ],
};

export function askPepitaHref(question: string): string {
  return `/ai-assistant?${new URLSearchParams({ q: question }).toString()}`;
}
