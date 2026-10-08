/**
 * Peppy catalog: Firestore `products` (Admin SDK) merged over the code catalog
 * (client/src/data/products.ts). Firestore wins per field so admin edits (price, stock,
 * hidden) show up; without Admin credentials or on error the code catalog is used alone.
 * Cached per warm instance for 10 minutes.
 */
import { products as codeProducts } from "../../../client/src/data/products.js";
import {
  buildCatalog,
  mergeCatalog,
  type RawCatalogProduct,
} from "../../../shared/peppy/catalog.js";
import type { PeppyProduct } from "../../../shared/peppy/types.js";
import { getAdminDb } from "../firebase.js";

const TTL_MS = 10 * 60 * 1000;
let cached: {
  at: number;
  catalog: Map<string, PeppyProduct>;
  source: "firestore+code" | "code";
} | null = null;

export function codeCatalog(): Map<string, PeppyProduct> {
  return buildCatalog(codeProducts as unknown as RawCatalogProduct[]);
}

type DbLike = {
  collection(name: string): {
    limit(n: number): {
      get(): Promise<{
        docs: { id: string; data(): Record<string, unknown> }[];
      }>;
    };
  };
};

export async function loadPeppyCatalog(
  opts: { db?: DbLike | null; timeoutMs?: number; now?: number } = {}
): Promise<{
  catalog: Map<string, PeppyProduct>;
  source: "firestore+code" | "code";
}> {
  const now = opts.now ?? Date.now();
  if (cached && now - cached.at < TTL_MS) return cached;
  const db =
    opts.db === undefined
      ? (getAdminDb() as unknown as DbLike | null)
      : opts.db;
  const code = codeProducts as unknown as RawCatalogProduct[];
  if (!db) {
    cached = { at: now, catalog: buildCatalog(code), source: "code" };
    return cached;
  }
  try {
    const snap = await Promise.race([
      db.collection("products").limit(500).get(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), opts.timeoutMs ?? 2500)
      ),
    ]);
    const firestore: RawCatalogProduct[] = snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
    }));
    cached = {
      at: now,
      catalog: mergeCatalog(code, firestore),
      source: "firestore+code",
    };
  } catch {
    cached = { at: now, catalog: buildCatalog(code), source: "code" };
  }
  return cached;
}

export function resetCatalogCache(): void {
  cached = null;
}
