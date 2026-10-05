/**
 * Helpers for listing-page size selection (20 / 60 capsules).
 * CartContext stores size as "20" | "60".
 */

export type CartSize = "20" | "60";

export type SizeOption = {
  size: CartSize;
  label: string;
  priceUSD: number;
  priceEUR: number;
  variantId?: string;
};

type SizeCapableProduct = {
  priceUSD: number;
  priceEUR: number;
  sizes?: number;
  variants?: Array<{
    id: string;
    name: string;
    priceUSD: number;
    priceEUR: number;
    inStock?: boolean;
  }>;
};

/** True when the shopper must pick a size before add-to-cart. */
export function hasMultipleSizes(product: SizeCapableProduct): boolean {
  return getSizeOptions(product).length > 1;
}

export function variantToCartSize(variant: {
  id: string;
  name: string;
}): CartSize {
  if (variant.id === "60-count" || /\b60\b/.test(variant.name)) return "60";
  if (variant.id === "20-count" || /\b20\b/.test(variant.name)) return "20";
  // Prefer parsing any leading digits in the id (e.g. "60-count")
  const idMatch = variant.id.match(/(\d+)/);
  if (idMatch?.[1] === "60") return "60";
  if (idMatch?.[1] === "20") return "20";
  return "20";
}

/** Size choices for the on-page chooser (variants preferred). */
export function getSizeOptions(product: SizeCapableProduct): SizeOption[] {
  const all = product.variants ?? [];
  const inStock = all.filter((v) => v.inStock !== false);
  // If every variant is marked out of stock, still offer them (orders for
  // out-of-stock items ship ~2 weeks later) rather than inventing a price.
  const stocked = inStock.length > 0 ? inStock : all;

  if (stocked.length > 0) {
    return stocked.map((v) => ({
      size: variantToCartSize(v),
      label: v.name,
      priceUSD: v.priceUSD,
      priceEUR: v.priceEUR,
      variantId: v.id,
    }));
  }

  // No variants → one price, one option. (Never invent a 60-count price;
  // checkout rejects size "60" for products without a 60-count variant.)
  return [
    {
      size: "20",
      label: "Standard",
      priceUSD: product.priceUSD,
      priceEUR: product.priceEUR,
    },
  ];
}

export function getDefaultCartSize(product: SizeCapableProduct): CartSize {
  const options = getSizeOptions(product);
  return options[0]?.size ?? "20";
}
