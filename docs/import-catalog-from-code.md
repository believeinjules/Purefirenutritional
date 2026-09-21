# Import catalog from code (Firestore seed)

One-time (or anytime) way to copy every product from `client/src/data/products.ts`
into the Firestore `products` collection **without loosening security rules**.

Client SDK writes are blocked (`match /products/{id} { allow write: if false }`).
Seeding goes through **`POST /api/admin/seed-products`**, which uses the Firebase
**Admin SDK** (same credentials as the mailing-list / Stripe webhook:
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

## Env vars to set in Vercel (once)

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAILS` | Comma-separated allowlist of admin emails (required for the Admin UI button / seed API). Example: `julesxshulman@gmail.com` |
| `VITE_ADMIN_EMAILS` | Same emails for the **client** Admin UI gate (`/admin`). See `docs/admin-ui-lock.md`. Must match `ADMIN_EMAILS`; redeploy after changing. |
| `ADMIN_SEED_SECRET` | Optional shared secret for one-shot `curl` (never put this in the browser / Vite env) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Already required for Admin SDK order persistence |

In Vercel → Project → Settings → Environment Variables:

1. Add `ADMIN_EMAILS` = your Firebase Auth / Gmail address (the one you use to sign in).
2. Add `VITE_ADMIN_EMAILS` = the same comma-separated list (Admin UI lock — see `docs/admin-ui-lock.md`).
3. Optionally add `ADMIN_SEED_SECRET` = a long random string (for curl only).
4. Redeploy Production so the new env vars are live (`VITE_*` is baked in at build time).

## How to use (Admin UI — preferred)

1. Sign in on the live site with the email listed in `ADMIN_EMAILS`.
2. Open **Admin → Manage Products** (`/admin/products`).
3. Click **Import catalog from code**.
4. Confirm in the dialog.
5. Wait for the toast: it shows how many products were written (~79).
6. Refresh the shop (`/products`). It should load from Firestore instead of the local fallback.

The browser only sends your Firebase **ID token**. The secret never ships in the
client bundle. The API verifies the token with Admin Auth, checks the email
against `ADMIN_EMAILS`, and requires `email_verified === true` on the token
(or a custom claim `admin: true` as an equivalent verified-admin gate).
Unverified emails get **403**.

## One-shot curl (optional / emergency ops)

Only if you set `ADMIN_SEED_SECRET` in Vercel. This shared-secret path is for
emergency ops and **does not** require a Firebase ID token or `email_verified`
(the secret itself is the gate — keep it long, random, and server-only):

```bash
curl -X POST "https://www.purefirenutritional.com/api/admin/seed-products" \
  -H "Authorization: Bearer $ADMIN_SEED_SECRET" \
  -H "Content-Type: application/json"
```

Or:

```bash
curl -X POST "https://www.purefirenutritional.com/api/admin/seed-products" \
  -H "x-admin-seed-secret: $ADMIN_SEED_SECRET" \
  -H "Content-Type: application/json"
```

Successful response shape: `{ "written": 79, "failed": 0 }` (plus `errors` only on partial failure).

## Behavior

- Document ID = `product.id` (e.g. `bonomarlot`).
- Uses merge/overwrite by ID — **safe to run twice**.
- Does **not** delete products that exist only in Firestore.
- Does **not** change Stripe checkout pricing (`shared/product-prices.ts` still reads `products.ts`).
- Firestore security rules stay unchanged (`write: if false` for products).

## Fields written

`name`, `description`, `category`, `priceUSD`, `priceEUR`, `rating`, `sizes`,
`image`, `imageAlt`, `benefits`, `ingredients`, `usage`, `seriesInfo`,
`variants`, `in_stock` (defaults to `true` for catalog seed).

## If the button fails

| Error | Fix |
|-------|-----|
| You must be signed in… | Log in first (same account as `ADMIN_EMAILS`) |
| Forbidden — email is not in ADMIN_EMAILS | Add your email to `ADMIN_EMAILS` in Vercel and redeploy |
| Forbidden — admin email must be verified | Verify the Firebase Auth email (check inbox / Auth console), then sign in again |
| ADMIN_EMAILS is not configured | Set the env var and redeploy |
| Firebase Admin is not configured | Check `FIREBASE_*` service-account env vars |
