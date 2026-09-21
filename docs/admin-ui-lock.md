# Admin UI lock (`/admin`)

Client-side gate so `/admin` and `/admin/products` only render when:

1. The visitor is signed in with Firebase Auth
2. Their email is on `VITE_ADMIN_EMAILS`

Unauthorized users are sent to `/login?next=…` (if logged out) or `/` (if signed in but not an admin). Admin dashboard markup is not rendered until the check passes.

**`emailVerified` is not required for the Admin UI.** Firebase Console sometimes will not open user rows to mark email verified; the SPA gate therefore only checks sign-in + allowlist so admins can reach the screens.

**This is UI-only.** Firestore rules still block product writes from the client; order/customer APIs and `POST /api/admin/seed-products` use server `ADMIN_EMAILS`. Keep both lists in sync.

## Import catalog vs UI unlock

`POST /api/admin/seed-products` (the **Import catalog from code** button) still requires `email_verified === true` on the Firebase ID-token path (PR #21), or custom claim `admin: true`. If the Auth console will not let you mark the email verified:

- You can still open Admin UI after this change (UI unlock is the priority).
- Import may return **403** (“admin email must be verified”) until the email is verified or you use the emergency `ADMIN_SEED_SECRET` curl path documented in `import-catalog-from-code.md` (do not put that secret in the browser).

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
3. Sign in as `julesxshulman@gmail.com` (allowlisted; **email need not be verified**) → `/admin` and `/admin/products` should load.
4. Optional: manage products → **Import catalog from code** still uses server `ADMIN_EMAILS` + `email_verified` via ID token (or `ADMIN_SEED_SECRET` for ops).

## Security note

`VITE_ADMIN_EMAILS` is public in the JS bundle (expected for SPA allowlists). Do **not** put `ADMIN_SEED_SECRET` or service-account keys in any `VITE_` variable.
