import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe, getSiteOrigin } from "../_lib/stripe.js";
import {
  CheckoutValidationError,
  resolveCheckoutLinesWith,
  type PriceableProduct,
} from "../../shared/product-prices.js";
import { loadFirestoreProducts } from "../_lib/catalog.js";
import { buildCheckoutSessionParams } from "../_lib/checkout-session.js";
import {
  DiscountUnavailableError,
  PROMO_REASON_MESSAGE,
  mintDailyFireCode,
  spinClientKey,
  takeSpinSlot,
  validatePromotionCode,
} from "../_lib/discount.js";
import { getAdminDb } from "../_lib/firebase.js";

const FIRESTORE_LOOKUP_TIMEOUT_MS = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function lookupWithTimeout(ids: string[]): Promise<Map<string, PriceableProduct>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      loadFirestoreProducts(ids),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Firestore product lookup timed out")),
          FIRESTORE_LOOKUP_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * POST /api/stripe/create-checkout-session?op=discount-spin
 * Daily Fire popup: picks the discount tier server-side and returns a unique
 * single-use code. Lives in this function only because of the 12-function cap.
 */
async function handleDiscountSpin(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Discount codes are not available right now." });
  }
  const db = getAdminDb();
  if (db && !(await takeSpinSlot(db, spinClientKey(req.headers)))) {
    return res.status(429).json({ error: "You've already revealed today's codes. Please check back tomorrow." });
  }
  const { questionId, answerId } = (req.body || {}) as { questionId?: unknown; answerId?: unknown };
  try {
    const r = await mintDailyFireCode({ stripe: getStripe(), questionId, answerId });
    return res.status(200).json({ code: r.code, percentOff: r.percentOff, expiresAt: r.expiresAt });
  } catch (err) {
    if (err instanceof DiscountUnavailableError) {
      return res.status(503).json({ error: "Discount codes are not available right now." });
    }
    console.error("[daily-fire] spin failed:", err);
    return res.status(500).json({ error: "Could not create a code. Please try again." });
  }
}

/**
 * POST /api/stripe/create-checkout-session
 * Guest checkout supported (no auth required).
 * Prices are resolved server-side — client price is ignored. Bundles (items[].bundle = "2x60" | "60+20" | 2 | 3) and free shipping
 * are also computed here.
 * Source of truth: Firestore `products/{id}` (Admin SDK), falling back to the
 * code catalog (client/src/data/products.ts) when Firestore is unavailable or
 * the doc is missing / malformed.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const op = req.query?.op;
  if ((Array.isArray(op) ? op[0] : op) === "discount-spin") {
    return handleDiscountSpin(req, res);
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const {
      items,
      customerEmail: rawEmail,
      customerName: rawName,
      userId,
      postalCode,
      promoCode,
    } = req.body || {};

    const customerEmail =
      typeof rawEmail === "string" && rawEmail.trim() ? rawEmail.trim() : undefined;
    if (customerEmail && !EMAIL_RE.test(customerEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    const customerName = typeof rawName === "string" ? rawName.trim() : "";

    let resolved;
    try {
      resolved = await resolveCheckoutLinesWith(items, lookupWithTimeout);
    } catch (err) {
      if (err instanceof CheckoutValidationError) {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }

    const origin = getSiteOrigin(req.headers.origin);
    const stripe = getStripe();

    // Optional promotion code (e.g. a Daily Fire code): checked against Stripe
    // here so an expired / used / unknown code gets a clear 400 instead of a
    // Stripe error, and so nothing about the discount is trusted from the client.
    let promotion: { id: string; code: string; percentOff: number | null } | null = null;
    if (typeof promoCode === "string" && promoCode.trim()) {
      const check = await validatePromotionCode(stripe, promoCode);
      if (!check.ok) {
        return res.status(400).json({
          error: PROMO_REASON_MESSAGE[check.reason],
          promoError: check.reason,
        });
      }
      promotion = { id: check.promotionCodeId, code: check.code, percentOff: check.percentOff };
    }

    const zip = typeof postalCode === "string" ? postalCode : "";
    const { params, shippingCents } = buildCheckoutSessionParams({
      resolved,
      origin,
      customerEmail,
      customerName,
      userId,
      postalCode: zip,
      promotion,
    });

    // Bundle prices and free shipping are computed above from the live
    // catalog + shared/commerce-config.ts; nothing price-related comes from the client.
    const session = await stripe.checkout.sessions.create(params);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      promo: promotion ? { code: promotion.code, percentOff: promotion.percentOff } : null,
      shipping: {
        available: true,
        amountUSD: shippingCents / 100,
        amountCents: shippingCents,
        currency: "usd",
        free: shippingCents === 0,
      },
    });
  } catch (error) {
    console.error("[create-checkout-session]", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
