# Cycle bundles, free shipping, product facts, review stars

## One config file
`shared/commerce-config.ts` — read by the browser AND by
`/api/stripe/create-checkout-session`, so the price shown is the price charged.

| Setting | Value | Notes |
|---|---|---|
| `standardShippingUSD` | 11.98 | flat rate |
| `freeShippingThresholdUSD` | 155 | free when merchandise subtotal (after bundle discounts) is **at or above** this |
| 2-bottle deal (Prime Peptide only) | 4.4% off, rounded down to a whole dollar | Julia 2026-11-20 |
| 3-bottle deal (Prime Peptide only) | 8% off, rounded down to a whole dollar | Julia 2026-11-20 |
| `minDiscountedShareOfPrice` | 0.8 | a bundle is not offered if it would take more than 20% off a bottle (protects very low-priced items, e.g. $8.99 / $19.99 products) |

### Multi-bottle deals: Prime Peptide only (Julia, 2026-11-20)
Khavinson 20/60 products (including Endoluten and Bonomarlot) have **no** multi-bottle deals:
the product page shows only the size choice (20 / 60 capsules). `COMMERCE_CONFIG.bundles.sizePairPacks`
is empty and `STOREFRONT_BUNDLES` offers nothing. The "2x60", "3x60" and retired "60+20" kinds still
parse so old saved carts load, but the cart quietly turns them into the same number of single bottles
and checkout rejects them (HTTP 400). Numeric 2 / 3 bundles resolve only for `prime-peptide-*` ids
(`isMultiBottleDealProduct`), so other single-size products (Revilab ML/SL, nutritionals, cosmetics)
are rejected too. Live main (b38ebee) offered Khavinson "2 × 60" and "60 + 20" packs; this removes them.

Prime Peptide keeps its 2/3-bottle card picker: 4.4% / 8% off, rounded down to a whole dollar, so the
saving is never below 4.4% / 8%. Labels show only the percent saved, floored to 0.1
(`shared/format-price.ts → savingsPercentLabel`), e.g. "2 bottles / $309 / save 4.6%". Prices show no
cents when they are whole dollars (`formatUSD`); prices with cents keep them (Bonomarlot $81.99 / $229.99,
excluded from the 2026-11-20 update).

Prime deal prices: Collagen / Omega ($144) **$275 / $397**; Brain ($162) $309 / $447; Joints / Protect ($189) $361 / $521.
Mixed Prime bundles (draft, not built) keep their listed prices, e.g. Collagen + Omega $279.

The larger-size guard in `getBundleOffer` still applies to Prime / legacy 2- and 3-bottle packs (hidden, never repriced; a hidden bundle at checkout → HTTP 400). Every per-product dollar override must stay between **$3 and $9** (`BUNDLE_DISCOUNT_LIMITS_USD`).

Single-bottle prices are **not** in this file and are never changed by it.

### Per-product overrides (optional, Firestore `products/{id}` or `products.ts`)
- `bundlesEnabled: false` → no bundles for that product
- `bundleDiscountsUSD: { "2": 5, "3": 9 }` → per-bottle dollar discount for that product instead of the percent (none set in Firestore as of 2026-11-20) (each $3–$9, `null` turns that size off)

Writable through `PATCH /api/admin/products` (validated in `api/_lib/admin-products.ts`).

## How checkout prices a bundle (server-side)
The cart sends `{ productId, size, quantity, bundle: 2 | 3 }` (Prime Peptide only), **never a price**.
`shared/product-prices.ts → resolveLineForProduct` takes the live single-bottle price
(Firestore, code-catalog fallback), applies `shared/bundle-pricing.ts`:

```
bundleCents = floor(singleBottleCents × bottles × (1 − percentOff) / 100) × 100   (Stripe unit_amount; quantity = number of bundles)
```
A per-product `bundleDiscountsUSD` override uses (single − override) × bottles instead.

Bad `bundle` values (anything except missing/1/2/3) or a bundle the product does not
offer → HTTP 400. Shipping is computed from the resolved merchandise total and sent as
the only Stripe `shipping_options` entry ($11.98 or $0 "Free shipping").

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
