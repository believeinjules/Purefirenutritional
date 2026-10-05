import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminDb } from "../_lib/firebase.js";
import { assertAdmin } from "../_lib/admin-auth.js";
import { products } from "../../client/src/data/products.js";

type SeedError = { id: string; message: string };

type SeedResult = {
  written: number;
  failed: number;
  errors?: SeedError[];
};

function productToFirestoreDoc(product: (typeof products)[number]) {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    priceUSD: product.priceUSD,
    priceEUR: product.priceEUR,
    rating: product.rating,
    sizes: product.sizes ?? 1,
    image: product.image ?? null,
    imageAlt: product.imageAlt ?? null,
    benefits: product.benefits || [],
    ingredients: product.ingredients || [],
    usage: product.usage ?? null,
    seriesInfo: product.seriesInfo ?? null,
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      name: v.name,
      priceUSD: v.priceUSD,
      priceEUR: v.priceEUR,
      image: v.image ?? null,
      imageAlt: v.imageAlt ?? null,
      inStock: v.inStock !== false,
    })),
    in_stock: true,
  };
}

/**
 * POST /api/admin/seed-products
 * Upserts all products from client/src/data/products.ts into Firestore
 * products/{id} via Admin SDK (bypasses client rules write: if false).
 * Merge by id — does not delete Firestore-only products.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth: Firebase ID token (ADMIN_EMAILS + email_verified), or ADMIN_SEED_SECRET
  // for emergency curl — see api/_lib/admin-auth.ts and docs/import-catalog-from-code.md
  const authResult = await assertAdmin(req, { allowSeedSecret: true });
  if (!authResult.ok) {
    return res.status(authResult.status).json({ error: authResult.error });
  }

  const db = getAdminDb();
  if (!db) {
    return res.status(503).json({ error: "Firebase Admin is not configured" });
  }

  const result: SeedResult = { written: 0, failed: 0, errors: [] };

  // Admin SDK batch limit is 500; catalog (~79) fits in one batch.
  const BATCH_SIZE = 400;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const product of chunk) {
      const ref = db.collection("products").doc(product.id);
      batch.set(ref, productToFirestoreDoc(product), { merge: true });
    }
    try {
      await batch.commit();
      result.written += chunk.length;
    } catch {
      for (const product of chunk) {
        try {
          await db
            .collection("products")
            .doc(product.id)
            .set(productToFirestoreDoc(product), { merge: true });
          result.written += 1;
        } catch (docErr: unknown) {
          result.failed += 1;
          const message =
            docErr instanceof Error ? docErr.message : String(docErr);
          result.errors!.push({ id: product.id, message });
        }
      }
    }
  }

  if (result.errors!.length === 0) {
    delete result.errors;
  }

  return res.status(200).json(result);
}
