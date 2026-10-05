import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../_lib/firebase.js";
import { firstQueryValue, requireAdmin } from "../_lib/admin-auth.js";
import { serializeDoc } from "../_lib/serialize.js";
import { PRODUCT_ID_RE } from "../_lib/admin-products.js";

class InventoryValidationError extends Error {}

function nonNegativeInt(value: unknown, field: string): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > 1_000_000) {
    throw new InventoryValidationError(`${field} must be a whole number of 0 or more`);
  }
  return n;
}

function productIdFrom(value: unknown): string {
  if (typeof value !== "string" || !PRODUCT_ID_RE.test(value)) {
    throw new InventoryValidationError("A valid productId is required");
  }
  return value;
}

const DEFAULTS = {
  stockQuantity: 100,
  lowStockThreshold: 10,
  isInStock: true,
  isAvailable: true,
};

/**
 * Admin inventory via Firebase Admin SDK (product_inventory + inventory_history).
 * Auth: same as /api/admin/products.
 *
 *   GET   /api/admin/inventory                         → { inventory: [...] }
 *   GET   /api/admin/inventory?productId=<id>&history=1 → { history: [...] } (latest 50)
 *   POST  /api/admin/inventory   body { productIds: string[] }
 *         → creates default records for any of those products that have none
 *   PATCH /api/admin/inventory?productId=<id>
 *         body { stockQuantity?, lowStockThreshold?, isInStock?, isAvailable?, notes? }
 *         → upserts the record and logs an inventory_history entry when stock changes
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || "GET";
  if (!["GET", "POST", "PATCH", "PUT"].includes(method)) {
    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const db = getAdminDb();
  if (!db) {
    return res.status(503).json({ error: "Firebase Admin is not configured" });
  }
  const inventory = db.collection("product_inventory");
  const history = db.collection("inventory_history");

  try {
    if (method === "GET") {
      const productId = firstQueryValue(req.query.productId);
      if (productId && firstQueryValue(req.query.history)) {
        const id = productIdFrom(productId);
        // Single-field filter (no composite index needed); sort in memory.
        const snap = await history.where("productId", "==", id).get();
        const list = snap.docs
          .map((d) => serializeDoc(d.id, d.data()))
          .sort((a, b) =>
            String((b as { createdAt?: string }).createdAt || "").localeCompare(
              String((a as { createdAt?: string }).createdAt || "")
            )
          )
          .slice(0, 50);
        return res.status(200).json({ history: list });
      }
      const snap = await inventory.get();
      return res
        .status(200)
        .json({ inventory: snap.docs.map((d) => serializeDoc(d.id, d.data())) });
    }

    if (method === "POST") {
      const ids = (req.body as { productIds?: unknown })?.productIds;
      if (!Array.isArray(ids) || ids.length === 0 || ids.length > 500) {
        throw new InventoryValidationError("productIds must be a non-empty list (max 500)");
      }
      const productIds = Array.from(new Set(ids.map(productIdFrom)));
      const refs = productIds.map((id) => inventory.doc(id));
      const snaps = await db.getAll(...refs);
      const batch = db.batch();
      let created = 0;
      snaps.forEach((snap, i) => {
        if (snap.exists) return;
        created += 1;
        batch.set(refs[i]!, {
          productId: productIds[i],
          ...DEFAULTS,
          lastRestockedAt: null,
          createdAt: FieldValue.serverTimestamp(),
          lastUpdatedAt: FieldValue.serverTimestamp(),
        });
      });
      if (created > 0) await batch.commit();
      const all = await inventory.get();
      return res.status(200).json({
        created,
        inventory: all.docs.map((d) => serializeDoc(d.id, d.data())),
      });
    }

    // PATCH / PUT
    const productId = productIdFrom(firstQueryValue(req.query.productId));
    const body = (req.body || {}) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (body.stockQuantity !== undefined) {
      updates.stockQuantity = nonNegativeInt(body.stockQuantity, "stockQuantity");
    }
    if (body.lowStockThreshold !== undefined) {
      updates.lowStockThreshold = nonNegativeInt(body.lowStockThreshold, "lowStockThreshold");
    }
    if (body.isInStock !== undefined) updates.isInStock = body.isInStock === true;
    if (body.isAvailable !== undefined) updates.isAvailable = body.isAvailable === true;
    if (Object.keys(updates).length === 0) {
      throw new InventoryValidationError("No inventory fields to update");
    }
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim().slice(0, 500)
        : null;

    const ref = inventory.doc(productId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const before = snap.exists ? (snap.data() as Record<string, unknown>) : null;
      const quantityBefore =
        typeof before?.stockQuantity === "number" ? before.stockQuantity : 0;
      const quantityAfter =
        typeof updates.stockQuantity === "number" ? updates.stockQuantity : quantityBefore;
      const restocked = quantityAfter > quantityBefore;

      tx.set(
        ref,
        {
          productId,
          ...(before ? {} : { ...DEFAULTS, createdAt: FieldValue.serverTimestamp() }),
          ...updates,
          ...(restocked ? { lastRestockedAt: FieldValue.serverTimestamp() } : {}),
          lastUpdatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      if (quantityAfter !== quantityBefore) {
        tx.set(history.doc(), {
          productId,
          changeType: restocked ? "restock" : "adjustment",
          quantityChange: quantityAfter - quantityBefore,
          quantityBefore,
          quantityAfter,
          notes,
          adminUser: admin.email,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });

    const fresh = await ref.get();
    return res.status(200).json({ inventory: serializeDoc(productId, fresh.data()) });
  } catch (err) {
    if (err instanceof InventoryValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error("[admin/inventory]", err);
    return res.status(500).json({ error: "Inventory request failed" });
  }
}
