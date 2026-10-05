/**
 * Server-authoritative product price resolution.
 *
 * Pure helpers (safe in the browser and on the server). The live price source is
 * the Firestore `products` collection; the code catalog
 * (`client/src/data/products.ts`) is the fallback when Firestore is unavailable
 * or a product doc is missing / malformed. Server code injects the Firestore
 * lookup via `resolveCheckoutLinesWith` (see api/_lib/catalog.ts).
 *
 * Never trust client-sent `price`.
 */
import { products } from "../client/src/data/products.js";

/** Cart convention: "20" = 20-count, "60" = 60-count. */
export type CartSize = "20" | "60";

export type PriceableVariant = {
  id: string;
  name: string;
  priceUSD: number;
  image?: string | null;
  inStock?: boolean;
};

export type PriceableProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  image?: string | null;
  variants?: PriceableVariant[] | null;
};

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
  variantId?: string;
};

/** Thrown for bad client input — callers should map this to HTTP 400. */
export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

const MAX_QUANTITY_PER_LINE = 99;
const MAX_LINES = 50;

function isValidPrice(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Map a variant to the cart size it represents ("20" / "60"), if any. */
export function variantCartSize(variant: { id: string; name: string }): CartSize | undefined {
  if (variant.id === "60-count" || /\b60\b/.test(variant.name)) return "60";
  if (variant.id === "20-count" || /\b20\b/.test(variant.name)) return "20";
  return undefined;
}

/** Code-catalog lookup by id (exact) or name (exact, then prefix for legacy clients). */
export function findProduct(input: {
  productId?: string;
  name?: string;
}): PriceableProduct | undefined {
  if (input.productId) {
    const byId = products.find((p) => p.id === input.productId);
    if (byId) return byId;
  }
  if (input.name) {
    const needle = input.name.trim().toLowerCase();
    return (
      products.find((p) => p.name.toLowerCase() === needle) ||
      products.find((p) => needle.startsWith(p.name.toLowerCase()))
    );
  }
  return undefined;
}

/**
 * Find the variant for a size / variantId. Strict: no substring matching, so
 * "20" can never match a "120-count" variant.
 */
export function resolveVariant(
  product: PriceableProduct,
  size?: string,
  variantId?: string
): PriceableVariant | undefined {
  const variants = product.variants ?? [];
  if (variants.length === 0) return undefined;

  if (variantId) {
    const byId = variants.find((v) => v.id === variantId);
    if (byId) return byId;
  }

  if (size) {
    const needle = String(size);
    return (
      variants.find((v) => v.id === `${needle}-count`) ||
      variants.find((v) => variantCartSize(v) === needle)
    );
  }

  return undefined;
}

/**
 * Display price (browser). Variant price when the size matches a variant,
 * otherwise the product's base price. No size multipliers — a product without
 * variants has exactly one price.
 */
export function getUnitPriceUSD(
  product: PriceableProduct,
  size?: string,
  variantId?: string
): number {
  const variant = resolveVariant(product, size, variantId);
  if (variant && isValidPrice(variant.priceUSD)) return variant.priceUSD;
  return product.priceUSD;
}

/**
 * Strictly price one cart line against a known product. Throws
 * CheckoutValidationError for unknown sizes / bad quantities.
 */
export function resolveLineForProduct(
  product: PriceableProduct,
  item: CheckoutLineInput
): ResolvedCheckoutLine {
  const qty = Number(item.quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    throw new CheckoutValidationError(`Invalid quantity for ${product.id}`);
  }
  const quantity = Math.min(Math.floor(qty), MAX_QUANTITY_PER_LINE);

  const size = item.size === undefined || item.size === null || item.size === ""
    ? undefined
    : String(item.size);
  if (size !== undefined && size !== "20" && size !== "60") {
    throw new CheckoutValidationError(`Invalid size "${size}" for ${product.name}`);
  }

  const variants = product.variants ?? [];
  let variant: PriceableVariant | undefined;

  if (variants.length > 0) {
    if (item.variantId || size) {
      variant = resolveVariant(product, size, item.variantId);
      if (!variant) {
        throw new CheckoutValidationError(
          `${product.name} is not available in size ${item.variantId || size}`
        );
      }
    } else {
      // Older clients that send no size: default to the 20-count (first) option.
      variant = variants.find((v) => variantCartSize(v) === "20") ?? variants[0];
    }
  } else if (size === "60") {
    // Single-size product: never invent a 60-count price.
    throw new CheckoutValidationError(`${product.name} is only sold in one size`);
  }

  const unitPriceUSD = variant ? variant.priceUSD : product.priceUSD;
  if (!isValidPrice(unitPriceUSD)) {
    throw new CheckoutValidationError(`Price unavailable for ${product.name}`);
  }

  return {
    productId: product.id,
    name: variant ? `${product.name} (${variant.name})` : product.name,
    description: (product.description || "").slice(0, 500),
    image: (variant?.image || product.image) ?? undefined,
    unitPriceUSD,
    unitAmountCents: Math.round(unitPriceUSD * 100),
    quantity,
    variantId: variant?.id,
  };
}

function assertItems(items: unknown): asserts items is CheckoutLineInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutValidationError("Invalid or missing items");
  }
  if (items.length > MAX_LINES) {
    throw new CheckoutValidationError("Too many items in cart");
  }
}

/** Price one line from the code catalog only. */
export function resolveCheckoutLine(item: CheckoutLineInput): ResolvedCheckoutLine {
  const product = findProduct(item);
  if (!product) {
    throw new CheckoutValidationError(
      `Unknown product: ${item.productId || item.name || "(missing id/name)"}`
    );
  }
  return resolveLineForProduct(product, item);
}

/** Price a cart from the code catalog only (no Firestore). */
export function resolveCheckoutLines(items: CheckoutLineInput[]): ResolvedCheckoutLine[] {
  assertItems(items);
  return items.map(resolveCheckoutLine);
}

/**
 * Price a cart using an injected product lookup (e.g. Firestore via Admin SDK).
 * `lookup` receives the unique product ids in the cart and returns whatever it
 * found; anything it does not return falls back to the code catalog.
 */
export async function resolveCheckoutLinesWith(
  items: CheckoutLineInput[],
  lookup: (productIds: string[]) => Promise<Map<string, PriceableProduct>>
): Promise<ResolvedCheckoutLine[]> {
  assertItems(items);

  const ids = Array.from(
    new Set(
      items
        .map((i) => (typeof i?.productId === "string" ? i.productId.trim() : ""))
        .filter(Boolean)
    )
  );

  let live = new Map<string, PriceableProduct>();
  if (ids.length > 0) {
    try {
      live = await lookup(ids);
    } catch (err) {
      console.error("[product-prices] live lookup failed, using code catalog:", err);
    }
  }

  return items.map((item) => {
    const id = typeof item?.productId === "string" ? item.productId.trim() : "";
    const product = (id && live.get(id)) || findProduct(item);
    if (!product) {
      throw new CheckoutValidationError(
        `Unknown product: ${item?.productId || item?.name || "(missing id/name)"}`
      );
    }
    return resolveLineForProduct(product, item);
  });
}
