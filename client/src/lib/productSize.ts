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
  const variants = product.variants?.filter((v) => v.inStock !== false) ?? [];
  if (variants.length > 1) return true;
  if ((product.sizes ?? 1) > 1) return true;
  return false;
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
  const stocked =
    product.variants?.filter((v) => v.inStock !== false) ??
    product.variants ??
    [];

  if (stocked.length > 0) {
    return stocked.map((v) => ({
      size: variantToCartSize(v),
      label: v.name,
      priceUSD: v.priceUSD,
      priceEUR: v.priceEUR,
      variantId: v.id,
    }));
  }

  if ((product.sizes ?? 1) > 1) {
    return [
      {
        size: "20",
        label: "20 Capsules",
        priceUSD: product.priceUSD,
        priceEUR: product.priceEUR,
      },
      {
        size: "60",
        label: "60 Capsules",
        priceUSD: Number((product.priceUSD * 2.5).toFixed(2)),
        priceEUR: Number((product.priceEUR * 2.5).toFixed(2)),
      },
    ];
  }

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
