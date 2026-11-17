/**
 * Pure builder for the Stripe Checkout Session parameters (no Stripe / Firebase
 * imports) so line-item amounts, bundle metadata and free shipping are unit
 * tested exactly as the API sends them.
 */
import type { ResolvedCheckoutLine } from "../../shared/product-prices.js";
import {
  flatStripeShippingOption,
  shippingCentsForMerchandiseCents,
} from "../../shared/shipping-rate.js";

/** Stripe metadata values are capped at 500 characters. */
export function meta(value: string): string {
  return value.length > 500 ? value.slice(0, 500) : value;
}

export type CheckoutSessionInput = {
  resolved: ResolvedCheckoutLine[];
  origin: string;
  customerEmail?: string;
  customerName?: string;
  userId?: string | number | null;
  postalCode?: string;
  /**
   * A promotion code already validated server-side (api/_lib/discount.ts).
   * Stripe rejects a session that sets both `discounts` and
   * `allow_promotion_codes`, so a pre-applied code turns off the manual
   * code box; without one, shoppers can still type a code on Stripe's page.
   */
  promotion?: { id: string; code: string; percentOff?: number | null } | null;
};

export function merchandiseCentsFor(resolved: ResolvedCheckoutLine[]): number {
  return resolved.reduce((sum, item) => sum + item.unitAmountCents * item.quantity, 0);
}

/** "productId:size:kind×qty" for every bundle line (session metadata, ≤500 chars). */
export function bundleSummary(resolved: ResolvedCheckoutLine[]): string {
  return resolved
    .filter((r) => r.bundleBottles > 1)
    .map((r) => `${r.productId}:${r.size ?? "-"}:${r.bundleKind ?? r.bundleBottles}x${r.quantity}`)
    .join(",");
}

export function buildCheckoutSessionParams(input: CheckoutSessionInput) {
  const { resolved, origin } = input;
  const merchandiseCents = merchandiseCentsFor(resolved);
  const shippingCents = shippingCentsForMerchandiseCents(merchandiseCents);
  const userId = input.userId ? String(input.userId) : "";

  const lineItems = resolved.map((item) => ({
    price_data: {
      currency: "usd" as const,
      product_data: {
        name: item.name,
        description: item.description || undefined,
        images: item.image
          ? [
              item.image.startsWith("http")
                ? item.image
                : `${origin}${item.image.startsWith("/") ? "" : "/"}${item.image}`,
            ]
          : [],
        // Read back by the webhook so order records carry bundle details.
        metadata: {
          product_id: item.productId,
          size: item.size ?? "",
          variant_id: item.variantId ?? "",
          bundle_bottles: String(item.bundleBottles),
          bundle_kind: item.bundleKind ?? "",
          single_bottle_cents: String(item.singleBottleCents),
          discount_per_bottle_cents: String(item.discountPerBottleCents),
        },
      },
      unit_amount: item.unitAmountCents,
    },
    quantity: item.quantity,
  }));

  const params = {
    payment_method_types: ["card" as const],
    line_items: lineItems,
    mode: "payment" as const,
    automatic_tax: { enabled: true },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    customer_email: input.customerEmail || undefined,
    client_reference_id: userId ? meta(userId).slice(0, 200) : undefined,
    metadata: {
      user_id: meta(userId),
      customer_email: meta(input.customerEmail || ""),
      customer_name: meta(input.customerName || ""),
      product_ids: meta(resolved.map((r) => r.productId).join(",")),
      bundles: meta(bundleSummary(resolved)),
      ship_to_zip: meta(input.postalCode || ""),
      merchandise_subtotal: (merchandiseCents / 100).toFixed(2),
      shipping_quote: (shippingCents / 100).toFixed(2),
      promo_code: meta(input.promotion?.code || ""),
      promo_percent_off:
        typeof input.promotion?.percentOff === "number" ? String(input.promotion.percentOff) : "",
    },
    // Exactly one of these two (Stripe: "You may only specify one of these parameters").
    ...(input.promotion
      ? { discounts: [{ promotion_code: input.promotion.id }] }
      : { allow_promotion_codes: true as const }),
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "NZ", "IE"] as Array<
        "US" | "CA" | "GB" | "AU" | "NZ" | "IE"
      >,
    },
    // Free shipping uses the merchandise subtotal BEFORE any promotion code,
    // the same as before codes were pre-applied (Stripe discounts only reduce
    // line items, never this fixed shipping rate).
    shipping_options: flatStripeShippingOption(merchandiseCents),
  };

  return { params, merchandiseCents, shippingCents };
}
