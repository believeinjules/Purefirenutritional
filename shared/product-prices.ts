/**
 * Server-authoritative product price resolution.
 * Uses the same catalog as the SPA (`client/src/data/products.ts`).
 * Never trust client-sent `price` as the sole source of truth.
 */
import { products, type Product, type ProductVariant } from "../client/src/data/products";

export type CheckoutLineInput = {
  productId?: string;
  name?: string;
  size?: string; // "20" | "60" (cart convention)
  variantId?: string;
  quantity: number;
  /** Ignored for charging — kept for backwards compatibility with older clients */
  price?: number;
  description?: string;
  image?: string;
};

export type ResolvedCheckoutLine = {
  productId: string;
  name: string;
  description: string;
  image?: string;
  unitPriceUSD: number;
  unitAmountCents: number;
  quantity: number;
};

export function findProduct(input: {
  productId?: string;
  name?: string;
}): Product | undefined {
  if (input.productId) {
    const byId = products.find((p) => p.id === input.productId);
    if (byId) return byId;
  }
  if (input.name) {
    const needle = input.name.trim().toLowerCase();
    // Exact match first, then prefix (in case client appends size to name)
    return (
      products.find((p) => p.name.toLowerCase() === needle) ||
      products.find((p) => needle.startsWith(p.name.toLowerCase()))
    );
  }
  return undefined;
}

export function resolveVariant(
  product: Product,
  size?: string,
  variantId?: string
): ProductVariant | undefined {
  if (!product.variants?.length) return undefined;

  if (variantId) {
    const byId = product.variants.find((v) => v.id === variantId);
    if (byId) return byId;
  }

  if (size) {
    const needle = String(size);
    return product.variants.find(
      (v) =>
        v.id === `${needle}-count` ||
        v.id.includes(needle) ||
        v.name.includes(needle)
    );
  }

  return undefined;
}

/** Unit price in USD from catalog (variants preferred). */
export function getUnitPriceUSD(
  product: Product,
  size?: string,
  variantId?: string
): number {
  const variant = resolveVariant(product, size, variantId);
  if (variant) return variant.priceUSD;
  // Legacy fallback used by older cart code when no variants exist
  if (size === "60") return Number((product.priceUSD * 2.5).toFixed(2));
  return product.priceUSD;
}

export function resolveCheckoutLine(item: CheckoutLineInput): ResolvedCheckoutLine {
  const product = findProduct(item);
  if (!product) {
    throw new Error(
      `Unknown product: ${item.productId || item.name || "(missing id/name)"}`
    );
  }

  const qty = Number(item.quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    throw new Error(`Invalid quantity for ${product.id}`);
  }

  const quantity = Math.min(Math.floor(qty), 99);
  const variant = resolveVariant(product, item.size, item.variantId);
  const unitPriceUSD = getUnitPriceUSD(product, item.size, item.variantId);
  const displayName = variant
    ? `${product.name} (${variant.name})`
    : product.name;

  return {
    productId: product.id,
    name: displayName,
    description: (product.description || "").slice(0, 500),
    image: variant?.image || product.image,
    unitPriceUSD,
    unitAmountCents: Math.round(unitPriceUSD * 100),
    quantity,
  };
}

export function resolveCheckoutLines(items: CheckoutLineInput[]): ResolvedCheckoutLine[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid or missing items");
  }
  return items.map(resolveCheckoutLine);
}
