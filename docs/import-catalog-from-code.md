# Import catalog from code (Firestore seed)

One-time (or anytime) way to copy every product from `client/src/data/products.ts` into the Firestore `products` collection.

## How to use (no engineering needed)

1. Open the live site and go to **Admin → Manage Products** (`/admin/products`).
2. Click **Import catalog from code**.
3. Confirm in the dialog.
4. Wait for the toast: it shows how many products were written (about 79).
5. Refresh the shop (`/products`). It should load from Firestore instead of the local fallback.

## Behavior

- Document ID = `product.id` (e.g. `bonomarlot`).
- Uses merge/overwrite by ID — **safe to run twice**.
- Does **not** delete products that exist only in Firestore.
- Does **not** change Stripe checkout pricing (`shared/product-prices.ts` still reads `products.ts`).

## Fields written

`name`, `description`, `category`, `priceUSD`, `priceEUR`, `rating`, `sizes`, `image`, `imageAlt`, `benefits`, `ingredients`, `usage`, `seriesInfo`, `variants`, `in_stock` (defaults to `true` when missing in code).

## If the button fails

Usually Firestore security rules blocked the write. Product Manager create/edit uses the same client write path — if Add Product works, Import should too.
