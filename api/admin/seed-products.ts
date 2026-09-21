import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminAuth, getAdminDb } from "../_lib/firebase.js";
import { products } from "../../client/src/data/products.js";

type SeedError = { id: string; message: string };

type SeedResult = {
  written: number;
  failed: number;
  errors?: SeedError[];
};

function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

function getSeedSecretHeader(req: VercelRequest): string | null {
  const raw = req.headers["x-admin-seed-secret"];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

/**
 * Auth:
 * 1) Preferred — Firebase Auth ID token whose email is in ADMIN_EMAILS
 *    and email_verified === true (or custom claim admin === true)
 * 2) Fallback — ADMIN_SEED_SECRET via Authorization: Bearer <secret>
 *    or x-admin-seed-secret (emergency/ops curl; skips email_verified —
 *    do not put in the browser)
 */
async function assertAuthorized(req: VercelRequest): Promise<
  { ok: true } | { ok: false; status: number; error: string }
> {
  const adminEmails = parseAdminEmails();
  const seedSecret = process.env.ADMIN_SEED_SECRET?.trim();
  const bearer = getBearerToken(req);
  const headerSecret = getSeedSecretHeader(req);

  // Shared-secret path (curl / automation only)
  if (seedSecret) {
    if (bearer === seedSecret || headerSecret === seedSecret) {
      return { ok: true };
    }
  }

  // Firebase Auth + email allowlist
  if (!bearer) {
    return {
      ok: false,
      status: 401,
      error:
        "Unauthorized — sign in as an admin and send Authorization: Bearer <Firebase ID token>, or use ADMIN_SEED_SECRET",
    };
  }

  if (adminEmails.length === 0) {
    return {
      ok: false,
      status: 503,
      error:
        "ADMIN_EMAILS is not configured on the server (and ADMIN_SEED_SECRET did not match)",
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return {
      ok: false,
      status: 503,
      error: "Firebase Admin is not configured",
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(bearer);
    const email = (decoded.email || "").toLowerCase();
    if (!email || !adminEmails.includes(email)) {
      return {
        ok: false,
        status: 403,
        error: "Forbidden — email is not in ADMIN_EMAILS",
      };
    }
    // Require verified email on the ID-token path (secret path above may skip).
    // Custom claim `admin: true` is treated as an equivalent verified-admin gate.
    const hasVerifiedAdminClaim = decoded.admin === true;
    if (!decoded.email_verified && !hasVerifiedAdminClaim) {
      return {
        ok: false,
        status: 403,
        error:
          "Forbidden — admin email must be verified (Firebase email_verified)",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized — invalid or expired Firebase ID token",
    };
  }
}

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

  const authResult = await assertAuthorized(req);
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
