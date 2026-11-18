# Daily Fire discount popup

Visitors answer one question (any answer counts), then **enter their email and
tick the mailing-list consent box**, and get a unique single-use code worth
5–25% off. **The server picks the tier; Stripe enforces the code.** No email +
consent, no code (Julia, 2026-11-18).

## How it works

| Piece | Where |
|---|---|
| Name, tiers/weights, question pool, code format | `shared/daily-fire.ts` |
| Popup (client-only overlay, Radix Dialog) | `client/src/components/promo/DailyFirePopup.tsx`, mounted in `App.tsx` |
| Browser state (one reveal per browser, 30-day snooze) | `client/src/lib/dailyFire.ts` (`localStorage.pf_daily_fire_v1`) |
| "Code … applied" + Remove, estimated discount line | `client/src/components/promo/AppliedDiscount.tsx` (Cart + Checkout) |
| Mint code / validate code / per-IP limit | `api/_lib/discount.ts` |
| Email + consent validation, `mailing_list` write, one-code-per-email, CSV | `api/_lib/daily-fire-subscriber.ts` |
| Consent wording (single source, stored as `consentText`) | `DAILY_FIRE_CONSENT_TEXT` / `DAILY_FIRE_CONSENT_VERSION` in `shared/daily-fire.ts` |
| Admin export | `GET /api/admin/subscribers-export` (in `api/admin/[collection].ts`), Admin → Customers → "Export mailing list (CSV)" |
| Endpoint | `POST /api/stripe/create-checkout-session?op=discount-spin` (folded into the checkout function: the plan caps api/ at 12 functions) |
| Checkout pre-apply | `api/stripe/create-checkout-session.ts` + `api/_lib/checkout-session.ts` |
| Order record + emails | `api/stripe/webhook.ts` (`discount`, `discount_code`, `discount_percent`), `api/_lib/email.ts` |

## Popup steps

1. **Question.** Any answer moves on (no request yet).
2. **Email step.** "Subscribe for more discounts" with a required Email field
   (client-validated with `shared/email-address.ts`, the same rule the footer
   form's server uses) and a required checkbox: *"Email me Pure Fire news and
   offers. Unsubscribe anytime."* plus a link to `/privacy`. Button: **Reveal my
   code**. Errors are announced (`role="alert"`, `aria-invalid`,
   `aria-describedby`), the button shows "Revealing your code…" while loading.
3. **Reveal.** The code, copy button, expiry, "Shop now". If the email already
   had a live code, the title is "Your N% off code" with a note that it's the
   same code again.

The email is also kept in the browser's `pf_daily_fire_v1` state and prefills
the checkout email field when that field is empty (the shopper can change it).

## Reveal request

`POST /api/stripe/create-checkout-session?op=discount-spin`
body `{ questionId, answerId, email, consent: true }`:

1. Email missing/invalid → **400** `{ error, field: "email" }`; `consent !== true`
   → **400** `{ error, field: "consent" }`. Checked before anything else, so a
   typo doesn't use up a rate-limit slot.
2. No Stripe key or no Firebase Admin → **503** (the sign-up is the price of a
   code, so no database means no code).
3. Per-IP limit (3 per 24 h, below) → **429**. Repeat requests for an email that
   already has a code count too, which also slows down email probing.
4. Subscriber saved to **`mailing_list/{normalized email}`** (merge). If that
   write fails → **500**, no code.
5. **One code per email.** If the doc holds a Daily Fire promotion code that
   Stripe still reports as active, unexpired and unredeemed, that same code is
   returned (`existing: true`). Otherwise a new code is minted and recorded on
   the doc.

### `mailing_list` document

Doc id = the email **trimmed and lower-cased** (not a hash), which is the key
the footer form (`api/mailing-list/subscribe.ts`) already uses, so one person
is one doc whichever form they used and the Admin export reads plain emails.
`isValidEmail` rejects `/`, so the id is always a valid Firestore id.

| Field | Value |
|---|---|
| `email` | normalized email |
| `consent` | `true` |
| `consentText` | exact wording shown (server constant, never browser text) |
| `consentVersion`, `consentAt` | wording version, ISO time of consent |
| `source` | `"daily-fire"` for new docs; an existing doc keeps its original (e.g. `"website"`) |
| `sources` | every form the person used, e.g. `["website", "daily-fire"]` |
| `subscribed` | `true` (an unsubscribed email is re-subscribed: fresh explicit consent); `subscribedAt` / `unsubscribedAt: null` set when it flips |
| `confirmed`, `name` | `false`, `null` on new docs (same shape as the footer form) |
| `createdAt` | ISO; existing footer docs keep their `subscribedAt` as `createdAt` |
| `lastRevealAt` | ISO time of the latest reveal |
| `dailyFireQuestionId` | question shown (the answer is deliberately **not** stored with the email; it is only in the Stripe promotion code metadata, without the email) |
| `dailyFirePercentOff`, `dailyFireCode`, `dailyFirePromoCodeId`, `dailyFireExpiresAt` | latest code (unix seconds expiry) |

Admin SDK only: `firestore.rules` has explicit deny-all blocks for
`mailing_list` and `discount_spin_limits` (rules file only; deploy separately).

### Not done on purpose

- **Stripe `restrictions`:** promotion codes can't be restricted to an email.
  The only per-person option is `customer` (a Stripe Customer id), and guest
  checkout uses `customer_email`, so that would reject guests and anyone paying
  with a different email. Codes stay usable with any email; the per-email and
  per-IP limits plus `max_redemptions: 1` are the controls.
- **Sending email:** subscribers are only stored. No newsletter/email-marketing
  tool is connected. Before the first marketing send: a working unsubscribe link
  in every email (honored within 10 business days), the postal address in every
  email, and an "advertisement" identification and honest subject line
  (CAN-SPAM). Filter on `subscribed == true`.

Weights: 5% → 40, 10% → 35, 15% → 15, 20% → 7, 25% → 3 (out of 100).

Each reveal calls `stripe.promotionCodes.create({ promotion: { type: "coupon", coupon: "pf-daily-fire-<pct>" }, code: "FIRE<pct>-XXXXXX", max_redemptions: 1, expires_at: now + 7 days })`.
There is no shared `FIRE25` code to pass around. A Firestore counter
(`discount_spin_limits/{sha256(ip)}`, Admin SDK only) allows 3 reveals per IP per 24 h; it fails open
if the counter transaction errors (but Firebase Admin itself is now required, see above).

Checkout: with a stored code the session sets `discounts: [{ promotion_code }]`
(the code is looked up in Stripe first; unknown / expired / used → HTTP 400
`promoError`, the cart drops the code and the shopper can retry). Without a
code the session keeps `allow_promotion_codes: true` so any code can be typed
on Stripe's page. Stripe rejects sessions that set both (verified in the sandbox:
"You may only specify one of these parameters: allow_promotion_codes, discounts").

Free shipping is unchanged: it uses the merchandise subtotal **before** the
code (the same rule that already applied to codes typed on Stripe's page).
Stripe's coupon only reduces line items, never the fixed shipping rate.

## Go-live setup

Julia reported the five live coupons created in the Stripe Dashboard on
2026-11-18. Push/deploy still needs her OK.

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
   and the existing Firebase Admin credentials for the rate limit and `mailing_list`.
3. Until the coupons exist, the endpoint returns 503 and the popup says codes
   aren't available. So create the coupons **before** deploying.

Preview/QA: add `?daily-fire=1` to any page URL to open the popup at once.
