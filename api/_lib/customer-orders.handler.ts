import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminDb } from "./firebase.js";
import { assertSignedIn } from "./user-auth.js";
import {
  EMAIL_NOT_VERIFIED,
  EMAIL_NOT_VERIFIED_MESSAGE,
  listAndAttachOrdersForVerifiedUser,
} from "./customer-orders.js";

/** GET /api/orders (also served at /api/stripe/session/my-orders to stay within the function limit). */
export async function handleCustomerOrders(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await assertSignedIn(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  if (!auth.emailVerified) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(403).json({
      code: EMAIL_NOT_VERIFIED,
      error: EMAIL_NOT_VERIFIED_MESSAGE,
      orders: [],
    });
  }

  const db = getAdminDb();
  if (!db) {
    return res.status(503).json({ error: "Firebase Admin is not configured" });
  }

  try {
    const orders = await listAndAttachOrdersForVerifiedUser(db, {
      uid: auth.uid,
      email: auth.email,
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("[orders] list failed:", error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: "Failed to load orders" });
  }
}
