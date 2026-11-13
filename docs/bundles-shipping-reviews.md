# Cycle bundles, free shipping, product facts, review stars

## One config file
`shared/commerce-config.ts` — read by the browser AND by
`/api/stripe/create-checkout-session`, so the price shown is the price charged.

| Setting | Value | Notes |
|---|---|---|
| `standardShippingUSD` | 19.95 | flat rate |
| `freeShippingThresholdUSD` | 150 | free when merchandise subtotal (after bundle discounts) is **at or above** this |
| 2-bottle bundle | $4 off each bottle | approved |
| 3-bottle bundle | $8 off each bottle | approved |
| `minDiscountedShareOfPrice` | 0.8 | a bundle is not offered if it would take more than 20% off a bottle (protects very low-priced items, e.g. $8.99 / $19.99 products) |

### Storefront packs (20/60 products, Julia 2026-11-10)
Buy More & Save appears **only when the 60-cap size is selected**. Options:

- a single 60-cap bottle
- **2 × 60 capsules** — priced at the Cerluten ratio $279 / $298.98 (~6.7% off two 60s), rounded to the nearest whole dollar
- **60 + 20 capsules** — the 60-cap price plus ceil((20-cap price) / 2) in whole dollars (Cerluten: $154.99 + $28 = $182.99)

2 × 20, 3 × 20 and 3 × 60 packs are not offered. Single-size products (Revilab ML/SL, nutritionals, cosmetics) have no Buy More & Save control. Prime Peptide keeps its frozen 2/3-bottle card picker at $4 / $8 off each bottle.

Cerluten prices: 20-cap **$55.77**, 60-cap **$154.99**, 2 × 60 **$289.00**, 60 + 20 **$182.99**.

The larger-size guard in `getBundleOffer` still applies to Prime / legacy 2- and 3-bottle packs (hidden, never repriced; a hidden bundle at checkout → HTTP 400). Every legacy per-bottle discount must stay between **$3 and $9** (`BUNDLE_DISCOUNT_LIMITS_USD`).

Single-bottle prices are **not** in this file and are never changed by it.

### Per-product overrides (optional, Firestore `products/{id}` or `products.ts`)
- `bundlesEnabled: false` → no bundles for that product
- `bundleDiscountsUSD: { "2": 5, "3": 9 }` → per-bottle discount for that product (each $3–$9, `null` turns that size off)

Writable through `PATCH /api/admin/products` (validated in `api/_lib/admin-products.ts`).

## How checkout prices a bundle (server-side)
The cart sends `{ productId, size, quantity, bundle: "2x60" | "60+20" | 2 | 3 }`, **never a price**.
`shared/product-prices.ts → resolveLineForProduct` takes the live single-bottle price
(Firestore, code-catalog fallback), applies `shared/bundle-pricing.ts`:

```
bottleCents = singleBottleCents − discountPerBottleCents
bundleCents = bottleCents × bottles      (Stripe unit_amount; quantity = number of bundles)
```

Bad `bundle` values (anything except missing/1/2/3) or a bundle the product does not
offer → HTTP 400. Shipping is computed from the resolved merchandise total and sent as
the only Stripe `shipping_options` entry ($19.95 or $0 "Free shipping").

The Stripe line item carries `product_data.metadata` (`product_id`, `size`,
`bundle_bottles`, `single_bottle_cents`, `discount_per_bottle_cents`); the session
carries `metadata.bundles`. The webhook stores these on `orders/{sessionId}.items[]`
(`bundle_bottles`, `bottles_total`, `bundle_discount_per_bottle`, `single_bottle_price`).

## Product facts (cards + product page)
`client/src/data/dosing.ts` holds per-product `unitsPerDay`, `cycleDays`, `unitsPerBottle`
— filled ONLY where the official usage text is unambiguous (each entry quotes it).
Bottle size, cycle coverage and cost/day render only when the needed numbers exist.

## Review stars
Stars + count come only from approved reviews via `GET /api/reviews` (see `shared/reviews.ts`).
No reviews → no stars. The old static `rating` field (4.8 / 4.9 on every product) is no
longer shown to customers.

Review rules: `approved` AND `permission` must be true, and the text must not contain a
health claim (cured / treated / fixed / reversed / "off my meds" …). Reviews that make
such claims are never shown, even if approved.
