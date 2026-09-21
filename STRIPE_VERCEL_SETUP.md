# Stripe on Vercel (production checkout)

The SPA calls these routes. They must exist as Vercel serverless functions under `api/stripe/` (Express `server/routes/*` is **not** deployed on Vercel):

| Method | Path | File |
|--------|------|------|
| POST | `/api/stripe/create-checkout-session` | `api/stripe/create-checkout-session.ts` |
| POST | `/api/stripe/webhook` | `api/stripe/webhook.ts` (raw body) |
| GET | `/api/stripe/session/:id` | `api/stripe/session/[id].ts` |

Mailing list (`api/mailing-list/subscribe.ts`) is unchanged.

## Required Vercel environment variables

Set in Vercel → Project → Settings → Environment Variables (Production + Preview as needed):

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…` in production) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the Stripe webhook endpoint (`whsec_…`) |
| `PUBLIC_SITE_URL` | Canonical site origin for success/cancel URLs, e.g. `https://www.purefirenutritional.com` |

### Recommended (webhook order persistence + email)

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase Admin |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key (`\n` escaped newlines OK) |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | Order confirmation email (optional) |

**Do not commit secrets.** Client publishable key can stay in the SPA; never put `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` in `VITE_*` vars.

Success URL pattern used by the API:

`{PUBLIC_SITE_URL or Origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`

Cancel URL: `{origin}/cart`

## Stripe webhook endpoint

After deploy, in [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

1. Add endpoint: `https://www.purefirenutritional.com/api/stripe/webhook`
   (also add the apex host if you serve checkout there)
2. Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copy the endpoint signing secret → Vercel `STRIPE_WEBHOOK_SECRET`
4. Redeploy so the new secret is picked up

## Price integrity

Checkout line amounts are resolved from `client/src/data/products.ts` via `shared/product-prices.ts`. Client-sent `price` is ignored. Send `productId` + `size` (and optional `variantId`) from the cart.

## Guest checkout

No auth is required for `create-checkout-session` (same as the Express route).

## Admin product seed (related)

For `POST /api/admin/seed-products` (Import catalog from code):

| Variable | Notes |
|----------|--------|
| `ADMIN_EMAILS` | Comma-separated Firebase Auth emails allowed to seed (e.g. `julesxshulman@gmail.com`); ID-token path also requires `email_verified` |
| `VITE_ADMIN_EMAILS` | Same emails for Admin UI gate (`/admin`); see `docs/admin-ui-lock.md` |
| `ADMIN_SEED_SECRET` | Optional; emergency/ops curl shared secret (skips `email_verified`) — never `VITE_` |

See `docs/import-catalog-from-code.md`.
