import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { adminFetch } from "./adminApi";
import { products as localProducts } from "@/data/products";
import { readBundleOverrides } from "@shared/bundle-pricing";

export interface ProductVariant {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  image?: string;
  imageAlt?: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "PEPTIDE BIOREGULATORS" | "ANTI AGING-LONGEVITY" | "NUTRITIONAL SUPPLEMENTS";
  priceUSD: number;
  priceEUR: number;
  rating: number;
  /** Optional cycle-bundle overrides (shared/commerce-config.ts). */
  bundlesEnabled?: boolean;
  bundleDiscountsUSD?: Partial<Record<"2" | "3", number | null>> | null;
  sizes: number;
  image?: string;
  imageAlt?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  seriesInfo?: string;
  in_stock?: boolean;
  variants?: ProductVariant[];
  /** Authenticity data — rendered only when filled. */
  manufacturer?: string;
  lotNumber?: string;
  expiryDate?: string;
  coaUrl?: string;
}

// ─── Firestore doc → Product ──────────────────────────────────────────────────

function docToProduct(id: string, data: any): Product {
  return {
    id,
    name: data.name,
    description: data.description,
    category: data.category,
    priceUSD: parseFloat(data.priceUSD ?? data.price_usd) || 0,
    priceEUR: parseFloat(data.priceEUR ?? (data.price_eur ?? 0)) || 0,
    rating: parseFloat(data.rating) || 0,
    ...readBundleOverrides(data),
    sizes: data.sizes ?? 1,
    image: data.image ?? undefined,
    imageAlt: data.imageAlt ?? data.image_alt ?? undefined,
    benefits: data.benefits || [],
    ingredients: data.ingredients || [],
    usage: data.usage || undefined,
    seriesInfo: (data.seriesInfo ?? data.series_info) || undefined,
    in_stock: data.in_stock !== false,
    variants: data.variants || [],
    manufacturer: data.manufacturer || undefined,
    lotNumber: data.lotNumber || undefined,
    expiryDate: data.expiryDate || undefined,
    coaUrl: data.coaUrl || undefined,
  };
}

// ─── fetchProducts ────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, using local product data");
    return localProducts;
  }

  // Wrap with a timeout so a hanging Firestore connection never blocks the UI
  const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);

  try {
    const q = query(collection(db, "products"), orderBy("name"));
    const snapshot = await withTimeout(getDocs(q), 6000, null as any);

    if (!snapshot || snapshot.empty) {
      console.log("No products in Firestore (empty or timed out), using local product data");
      return localProducts;
    }

    return snapshot.docs.map((d: { id: string; data: () => any }) => docToProduct(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching products from Firestore, falling back to local data:", err);
    return localProducts;
  }
}

// ─── fetchProductById ─────────────────────────────────────────────────────────

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isFirebaseConfigured()) {
    return localProducts.find((p) => p.id === id) || null;
  }

  try {
    const snapPromise = getDoc(doc(db, "products", id));
    const snap = await Promise.race([
      snapPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);
    if (!snap || !snap.exists()) {
      return localProducts.find((p) => p.id === id) || null;
    }
    return docToProduct(snap.id, snap.data());
  } catch (err) {
    console.error("Error fetching product by ID from Firestore:", err);
    return localProducts.find((p) => p.id === id) || null;
  }
}

// ─── fetchProductsByCategory ──────────────────────────────────────────────────

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (!isFirebaseConfigured()) {
    return localProducts.filter((p) => p.category === category);
  }

  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("name")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return localProducts.filter((p) => p.category === category);
    }

    return snapshot.docs.map((d: { id: string; data: () => any }) => docToProduct(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching products by category from Firestore:", err);
    return localProducts.filter((p) => p.category === category);
  }
}

// ─── Admin writes (server API, Admin SDK) ─────────────────────────────────────
// Browsers cannot write products (`allow write: if false`). These call
// /api/admin/products with the signed-in admin's ID token.

/** Fields the admin form sends; the server validates and normalizes them. */
export type ProductInput = Omit<
  Product,
  "id" | "variants" | "image" | "imageAlt" | "usage" | "seriesInfo" | "manufacturer" | "lotNumber" | "expiryDate" | "coaUrl"
> & {
  manufacturer?: string | null;
  lotNumber?: string | null;
  expiryDate?: string | null;
  coaUrl?: string | null;
  variants?: ProductVariant[];
  // null clears the field
  image?: string | null;
  imageAlt?: string | null;
  usage?: string | null;
  seriesInfo?: string | null;
};

/** Fresh list straight from Firestore via the admin API (no local fallback). */
export async function adminListProducts(): Promise<Product[]> {
  const body = await adminFetch<{ products: Array<{ id: string } & Record<string, unknown>> }>(
    "/api/admin/products"
  );
  return (body.products || []).map((p) => docToProduct(p.id, p));
}

export async function createProduct(id: string, product: ProductInput): Promise<Product> {
  const body = await adminFetch<{ product: { id: string } & Record<string, unknown> }>(
    "/api/admin/products",
    { method: "POST", body: JSON.stringify({ id, ...product }) }
  );
  return docToProduct(body.product.id, body.product);
}

export async function updateProduct(id: string, updates: Partial<ProductInput>): Promise<Product> {
  const body = await adminFetch<{ product: { id: string } & Record<string, unknown> }>(
    `/api/admin/products?id=${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(updates) }
  );
  return docToProduct(body.product.id, body.product);
}

export async function deleteProduct(id: string): Promise<void> {
  await adminFetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── importCatalogFromCode ────────────────────────────────────────────────────
// Calls POST /api/admin/seed-products (Firebase Admin SDK) so writes succeed
// even when Firestore rules have `allow write: if false` on products.
// Client never holds ADMIN_SEED_SECRET — uses the signed-in user's ID token.
// Server checks ADMIN_EMAILS + email_verified (see docs/import-catalog-from-code.md).

export type ImportCatalogResult = {
  written: number;
  failed: number;
  errors: { id: string; message: string }[];
};

export async function importCatalogFromCode(): Promise<ImportCatalogResult> {
  const body = await adminFetch<{
    written?: number;
    failed?: number;
    errors?: { id: string; message: string }[];
  }>("/api/admin/seed-products", { method: "POST" });

  return {
    written: body.written ?? 0,
    failed: body.failed ?? 0,
    errors: body.errors ?? [],
  };
}
