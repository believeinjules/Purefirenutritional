import { isHiddenProduct } from "@shared/hidden-products";
import { isPreorderProduct } from "@shared/preorder";
import { getCartLineUnitUSD } from "@shared/product-prices";
import type { Product } from "@/data/products";
import { type CartSize, type SizeOption } from "@/lib/productSize";

/**
 * Pepita product cards: what the buy button may do, using the same price and size
 * logic as the shop cards (productSize + shared/product-prices).
 *  - "available": Add to Cart
 *  - "preorder": liquids sold by pre-order; same cart add, labelled "Pre-order" (shop labelling)
 *  - "out-of-stock" / "unavailable": no buy button, More Info only
 */
export type PurchaseState = "available" | "preorder" | "out-of-stock" | "unavailable";

/** Size choices for a card: in-stock variants only (never a sold-out size). */
export function cardSizeOptions(product: Product): SizeOption[] {
  const all = product.variants ?? [];
  if (all.length === 0) {
    return [{ size: "20", label: "Standard", priceUSD: product.priceUSD, priceEUR: product.priceEUR }];
  }
  return all
    .filter(v => v.inStock !== false)
    .map(v => ({
      size: (v.id === "60-count" || /\b60\b/.test(v.name) ? "60" : "20") as CartSize,
      label: v.name,
      priceUSD: v.priceUSD,
      priceEUR: v.priceEUR,
      variantId: v.id,
    }));
}

export function purchaseState(product: Product | null | undefined): PurchaseState {
  if (!product || isHiddenProduct(product)) return "unavailable";
  if ((product as { inStock?: boolean }).inStock === false) return "out-of-stock";
  const options = cardSizeOptions(product);
  if (options.length === 0) return "out-of-stock";
  if (options.every(o => getCartLineUnitUSD(product, o.size) === undefined)) return "unavailable";
  return isPreorderProduct(product) ? "preorder" : "available";
}

/** Card price for the chosen size: exactly what the cart line will cost (single bottle). */
export function cardPrice(product: Product, size: CartSize): number | undefined {
  return getCartLineUnitUSD(product, size);
}

type AddFn = (product: Product, quantity: number, size?: CartSize) => void;

/**
 * One add per click: a second add for the same product while one is in flight is ignored
 * (prevents double-tap duplicates). Single bottle, quantity 1, no bundle: bundles are only
 * offered on the product page, which owns the larger-size bundle guard.
 */
export function createCardAdder(addToCart: AddFn) {
  const inFlight = new Set<string>();
  return async function add(product: Product, size: CartSize): Promise<"added" | "busy" | "blocked"> {
    const state = purchaseState(product);
    if (state !== "available" && state !== "preorder") return "blocked";
    if (!cardSizeOptions(product).some(o => o.size === size)) return "blocked";
    if (cardPrice(product, size) === undefined) return "blocked";
    if (inFlight.has(product.id)) return "busy";
    inFlight.add(product.id);
    try {
      addToCart(product, 1, size);
      // Let the cart state commit before re-enabling the button.
      await new Promise(r => setTimeout(r, 400));
      return "added";
    } finally {
      inFlight.delete(product.id);
    }
  };
}

/** Words in an answer's main text (for the 40–65 word target). */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
