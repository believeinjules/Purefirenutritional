# Admin API (Firebase Admin SDK)

Every Admin page write/read that Firestore rules block for browsers goes through
a server route that uses the Firebase Admin SDK. Firestore rules stay locked
(`products` → `allow write: if false`; `orders` / `customers` not listable).

## Auth (all routes)

`Authorization: Bearer <Firebase ID token>` from the signed-in user. The server
(`api/_lib/admin-auth.ts`) requires:

- the token's email is in `ADMIN_EMAILS` (comma-separated, case-insensitive), and
- `email_verified === true` (or custom claim `admin: true`).

`ADMIN_SEED_SECRET` is accepted **only** by `POST /api/admin/seed-products`
(emergency curl). It is not accepted by the routes below.

The client helper is `client/src/lib/adminApi.ts` (`adminFetch`).

## Routes

| Route | Purpose |
|-------|---------|
| `GET /api/admin/products` | List all Firestore products |
| `POST /api/admin/products` | Create (body includes `id`); 409 if it exists |
| `PATCH /api/admin/products?id=<id>` | Partial update; 404 if missing; removes legacy `price_usd`/`price_eur`/`image_alt`/`series_info` fields |
| `DELETE /api/admin/products?id=<id>` | Delete; 404 if missing |
| `GET /api/admin/inventory` | List `product_inventory` |
| `POST /api/admin/inventory` `{ productIds }` | Create default records (100 / alert at 10) for products without one |
| `PATCH /api/admin/inventory?productId=<id>` | Update stock / threshold / flags; logs `inventory_history` when stock changes |
| `GET /api/admin/inventory?productId=<id>&history=1` | Latest 50 history rows |
| `GET /api/admin/orders?limit=&after=` | Orders, newest first (`nextCursor` for the next page) |
| `GET /api/admin/customers?limit=&after=` | Customers, newest first, totals normalized to `total_orders` / `total_spent` |
| `POST /api/admin/seed-products` | Import catalog from `products.ts` (see `import-catalog-from-code.md`) |

Product writes are validated in `api/_lib/admin-products.ts` and stored in the
same camelCase shape as the catalog seed (`priceUSD`, `variants[]`, …).
Variant prices are what Stripe checkout charges for 20 / 60 capsule sizes.

## Env vars

No new variables. Uses the existing `ADMIN_EMAILS`, `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
