# Daily Fire discount popup

Visitors answer one question (any answer counts) and get a unique single-use
code worth 5–25% off. **The server picks the tier; Stripe enforces the code.**

## How it works

| Piece | Where |
|---|---|
| Name, tiers/weights, question pool, code format | `shared/daily-fire.ts` |
| Popup (client-only overlay, Radix Dialog) | `client/src/components/promo/DailyFirePopup.tsx`, mounted in `App.tsx` |
| Browser state (one reveal per browser, 30-day snooze) | `client/src/lib/dailyFire.ts` (`localStorage.pf_daily_fire_v1`) |
| "Code … applied" + Remove, estimated discount line | `client/src/components/promo/AppliedDiscount.tsx` (Cart + Checkout) |
| Mint code / validate code / per-IP limit | `api/_lib/discount.ts` |
| Endpoint | `POST /api/stripe/create-checkout-session?op=discount-spin` (folded into the checkout function: the plan caps api/ at 12 functions) |
| Checkout pre-apply | `api/stripe/create-checkout-session.ts` + `api/_lib/checkout-session.ts` |
| Order record + emails | `api/stripe/webhook.ts` (`discount`, `discount_code`, `discount_percent`), `api/_lib/email.ts` |

Weights: 5% → 40, 10% → 35, 15% → 15, 20% → 7, 25% → 3 (out of 100).

Each reveal calls `stripe.promotionCodes.create({ promotion: { type: "coupon", coupon: "pf-daily-fire-<pct>" }, code: "FIRE<pct>-XXXXXX", max_redemptions: 1, expires_at: now + 7 days })`.
There is no shared `FIRE25` code to pass around. A Firestore counter
(`discount_spin_limits/{sha256(ip)}`, Admin SDK only) allows 3 reveals per IP per 24 h; it fails open.

Checkout: with a stored code the session sets `discounts: [{ promotion_code }]`
(the code is looked up in Stripe first; unknown / expired / used → HTTP 400
`promoError`, the cart drops the code and the shopper can retry). Without a
code the session keeps `allow_promotion_codes: true` so any code can be typed
on Stripe's page. Stripe rejects sessions that set both (verified in the sandbox:
"You may only specify one of these parameters: allow_promotion_codes, discounts").

Free shipping is unchanged: it uses the merchandise subtotal **before** the
code (the same rule that already applied to codes typed on Stripe's page).
Stripe's coupon only reduces line items, never the fixed shipping rate.

## Go-live setup (not done; needs Julia's OK)

1. In the **live** Stripe account create five coupons (Dashboard → Product catalog → Coupons, or API), with these exact IDs:

   | ID | Percent off | Duration |
   |---|---|---|
   | `pf-daily-fire-5` | 5 | once |
   | `pf-daily-fire-10` | 10 | once |
   | `pf-daily-fire-15` | 15 | once |
   | `pf-daily-fire-20` | 20 | once |
   | `pf-daily-fire-25` | 25 | once |

   No promotion codes need to be created by hand. The site creates one per reveal.
2. Env vars: none required. Optional `DAILY_FIRE_COUPON_PREFIX` (default `pf-daily-fire-`).
   Uses the existing `STRIPE_SECRET_KEY` (needs write access to promotion codes)
   and the existing Firebase Admin credentials for the rate limit.
3. Until the coupons exist, the endpoint returns 503 and the popup says codes
   aren't available. So create the coupons **before** deploying.

Preview/QA: add `?daily-fire=1` to any page URL to open the popup at once.
