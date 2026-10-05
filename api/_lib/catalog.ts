import type { PriceableProduct, PriceableVariant } from "../../shared/product-prices.js";
import { getAdminDb } from "./firebase.js";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return NaN;
}

function isValidPrice(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/**
 * Normalize a Firestore `products/{id}` doc into a priceable product.
 * Returns null when the doc is unusable for charging (no name / bad prices),
 * so the caller falls back to the code catalog instead of charging $0.
 */
export function firestoreDocToPriceable(
  id: string,
  data: Record<string, unknown> | undefined
): PriceableProduct | null {
  if (!data) return null;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) return null;

  // Same field precedence as client/src/lib/productsStorage.ts docToProduct
  const priceUSD = toNumber(data.priceUSD ?? data.price_usd);

  const rawVariants = Array.isArray(data.variants) ? data.variants : [];
  const variants: PriceableVariant[] = [];
  for (const raw of rawVariants) {
    if (!raw || typeof raw !== "object") return null;
    const v = raw as Record<string, unknown>;
    const vid = typeof v.id === "string" ? v.id : "";
    const vname = typeof v.name === "string" ? v.name : "";
    const vprice = toNumber(v.priceUSD ?? v.price_usd);
    if (!vid || !vname || !isValidPrice(vprice)) return null;
    variants.push({
      id: vid,
      name: vname,
      priceUSD: vprice,
      image: typeof v.image === "string" ? v.image : null,
      inStock: v.inStock !== false,
    });
  }

  if (variants.length === 0 && !isValidPrice(priceUSD)) return null;

  return {
    id,
    name,
    description: typeof data.description === "string" ? data.description : "",
    priceUSD: isValidPrice(priceUSD) ? priceUSD : variants[0]!.priceUSD,
    image: typeof data.image === "string" ? data.image : null,
    variants,
  };
}

/**
 * Load live products from Firestore (Admin SDK). Missing / malformed docs are
 * simply absent from the map so pricing falls back to the code catalog.
 * Returns an empty map if Admin credentials are not configured.
 */
export async function loadFirestoreProducts(
  productIds: string[]
): Promise<Map<string, PriceableProduct>> {
  const result = new Map<string, PriceableProduct>();
  const db = getAdminDb();
  if (!db || productIds.length === 0) return result;

  // Firestore doc ids cannot contain "/" — skip anything that could not be one.
  const safeIds = productIds.filter((id) => id && !id.includes("/") && id.length <= 200);
  if (safeIds.length === 0) return result;

  const refs = safeIds.map((id) => db.collection("products").doc(id));
  const snaps = await db.getAll(...refs);
  for (const snap of snaps) {
    if (!snap.exists) continue;
    const product = firestoreDocToPriceable(snap.id, snap.data());
    if (product) {
      result.set(snap.id, product);
    } else {
      console.warn(`[catalog] products/${snap.id} is malformed — using code catalog price`);
    }
  }
  return result;
}
