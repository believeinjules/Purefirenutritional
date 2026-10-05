import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../_lib/firebase.js";
import { firstQueryValue, requireAdmin } from "../_lib/admin-auth.js";
import { serializeDoc } from "../_lib/serialize.js";
import {
  LEGACY_PRODUCT_FIELDS,
  ProductValidationError,
  validateProductId,
  validateProductInput,
  validateProductPatch,
} from "../_lib/admin-products.js";

function legacyFieldDeletes(): Record<string, FieldValue> {
  return Object.fromEntries(LEGACY_PRODUCT_FIELDS.map((f) => [f, FieldValue.delete()]));
}

/**
 * Admin product CRUD via Firebase Admin SDK (bypasses client rules — products
 * stay `allow write: if false` for browsers).
 *
 * Auth: Authorization: Bearer <Firebase ID token>, email in ADMIN_EMAILS and
 * verified (see api/_lib/admin-auth.ts).
 *
 *   GET    /api/admin/products            → { products: [{ id, ...doc }] }
 *   POST   /api/admin/products            → create (body: product incl. id) — 409 if id exists
 *   PATCH  /api/admin/products?id=<id>    → partial update — 404 if missing
 *   DELETE /api/admin/products?id=<id>    → delete — 404 if missing
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || "GET";
  if (!["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const db = getAdminDb();
  if (!db) {
    return res.status(503).json({ error: "Firebase Admin is not configured" });
  }
  const products = db.collection("products");

  try {
    if (method === "GET") {
      const snap = await products.get();
      const list = snap.docs
        .map((d) => serializeDoc(d.id, d.data()))
        .sort((a, b) =>
          String((a as { name?: string }).name || a.id).localeCompare(
            String((b as { name?: string }).name || b.id)
          )
        );
      return res.status(200).json({ products: list });
    }

    if (method === "POST") {
      const body = (req.body || {}) as Record<string, unknown>;
      const id = validateProductId(body.id);
      const doc = validateProductInput(body);
      const ref = products.doc(id);
      try {
        // create() fails atomically if the doc already exists
        await ref.create({
          ...doc,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
          updated_by: admin.email,
        });
      } catch (err) {
        const code = (err as { code?: number | string })?.code;
        if (code === 6 || code === "already-exists") {
          return res.status(409).json({ error: `A product with id "${id}" already exists` });
        }
        throw err;
      }
      return res.status(201).json({ product: { id, ...doc } });
    }

    const id = validateProductId(firstQueryValue(req.query.id));
    const ref = products.doc(id);

    if (method === "PATCH" || method === "PUT") {
      const patch = validateProductPatch(req.body);
      try {
        // update() fails if the doc does not exist (no accidental creates)
        await ref.update({
          ...patch,
          ...legacyFieldDeletes(),
          updated_at: FieldValue.serverTimestamp(),
          updated_by: admin.email,
        });
      } catch (err) {
        const code = (err as { code?: number | string })?.code;
        if (code === 5 || code === "not-found") {
          return res.status(404).json({ error: `Product "${id}" not found` });
        }
        throw err;
      }
      const fresh = await ref.get();
      return res.status(200).json({ product: serializeDoc(id, fresh.data()) });
    }

    // DELETE
    const existing = await ref.get();
    if (!existing.exists) {
      return res.status(404).json({ error: `Product "${id}" not found` });
    }
    await ref.delete();
    return res.status(200).json({ deleted: id });
  } catch (err) {
    if (err instanceof ProductValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("[admin/products]", err);
    return res.status(500).json({ error: "Product request failed" });
  }
}
