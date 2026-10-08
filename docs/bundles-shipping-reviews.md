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

Every bundle discount must be between **$3 and $9 per bottle** (`BUNDLE_DISCOUNT_LIMITS_USD`).
A value outside that range is never clamped; that bundle is simply not offered.

Single-bottle prices are **not** in this file and are never changed by it.

### Larger-size guard (a bundle never undercuts a bigger bottle)
`shared/bundle-pricing.ts → getBundleOffer` hides (never reprices) a bundle when its total is
**less than or equal to** the single price of a larger size of the same product whose capsule
count is the same or fewer than the bundle's total capsules. Example: 3 × 20 caps = 60 caps must cost
more than one 60-cap bottle. Used by the product page, cart, and the server checkout (a hidden bundle → HTTP 400).
A cart line holding a bundle that is no longer offered becomes the same number of single bottles.

With current prices this hides the **3 × 20-cap bundle** ($152.97 vs $153.99 for one 60-cap bottle) on:
Chelohart, Gotratix, Pielotax, Testoluten, Thyreogen, Ventfort, Visoluten, Vladonix.
All 2-bottle bundles and all 60-cap bundles stay; Bonomarlot, Cartalax, Crystagen, Endoluten and Vesugen keep every bundle.

### Per-product overrides (optional, Firestore `products/{id}` or `products.ts`)
- `bundlesEnabled: false` → no bundles for that product
- `bundleDiscountsUSD: { "2": 5, "3": 9 }` → per-bottle discount for that product (each $3–$9, `null` turns that size off)

Writable through `PATCH /api/admin/products` (validated in `api/_lib/admin-products.ts`).

## How checkout prices a bundle (server-side)
The cart sends `{ productId, size, quantity, bundle: 2 | 3 }`, **never a price**.
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
