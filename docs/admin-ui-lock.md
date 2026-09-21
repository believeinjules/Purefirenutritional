# Admin UI lock (`/admin`)

Client-side gate so `/admin` and `/admin/products` only render when:

1. The visitor is signed in with Firebase Auth
2. Their email is on `VITE_ADMIN_EMAILS`
3. `emailVerified` is true on the Firebase user

Unauthorized users are sent to `/login?next=…` (if logged out) or `/` (if signed in but not an admin). Admin dashboard markup is not rendered until the check passes.

**This is UI-only.** Firestore rules still block product writes from the client; order/customer APIs and `POST /api/admin/seed-products` use server `ADMIN_EMAILS` (+ `email_verified`). Keep both lists in sync.

## Configure on Vercel

Set **both** (same comma-separated emails):

| Variable | Where used |
|----------|------------|
| `ADMIN_EMAILS` | Server (seed API) — already documented in `import-catalog-from-code.md` |
| `VITE_ADMIN_EMAILS` | Client bundle (Admin UI gate) |

Example:

```
VITE_ADMIN_EMAILS=julesxshulman@gmail.com
ADMIN_EMAILS=julesxshulman@gmail.com
```

In Vercel → Project → **Settings** → **Environment Variables**:

1. Add `VITE_ADMIN_EMAILS` = `julesxshulman@gmail.com` (Production + Preview as needed).
2. Confirm `ADMIN_EMAILS` is already set to the same value.
3. **Redeploy** Production — `VITE_*` values are baked in at build time.

Locally, put the same keys in `.env.local` (see `.env.local.example`).

## How to test

1. Open an incognito window → visit `/admin` → should redirect to **Sign In**.
2. Sign in with a non-allowlisted account → after login you should land on `/admin` briefly then be redirected **home** (or go to `/admin` again and get redirected home). Admin dashboard must not appear.
3. Sign in as `julesxshulman@gmail.com` (verified email) → `/admin` and `/admin/products` should load.
4. Optional: manage products → **Import catalog from code** still uses server `ADMIN_EMAILS` via ID token.

## Security note

`VITE_ADMIN_EMAILS` is public in the JS bundle (expected for SPA allowlists). Do **not** put `ADMIN_SEED_SECRET` or service-account keys in any `VITE_` variable.
