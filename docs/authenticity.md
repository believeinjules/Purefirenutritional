# Authenticity on product pages

All fields are DATA. Each renders only when filled; nothing is guessed.

| Field | Where to set | Shows as |
|---|---|---|
| `manufacturer` | Admin → Products → edit → Authenticity (Firestore `products/{id}`) | "Imported directly from {manufacturer}, St. Petersburg" |
| `lotNumber` | same | "Lot A123" |
| `expiryDate` (YYYY-MM or YYYY-MM-DD) | same | "Expires May 2027" |
| `coaUrl` (https:// or /path) | same | "Certificate of analysis" link |

Admin writes go through `PATCH /api/admin/products` (Admin SDK; Firestore rules stay locked).

## Site config — `client/src/data/siteConfig.ts`
- `authorizationDocUrl`: the manufacturer's authorization document. Until set, the
  "Authorized US Retailer" badge shows without a link; the /how-to-spot-a-fake
  "Ours is here." link is hidden.
- `founder`: photo + one line. Hidden until `approved: true` AND `photoUrl` is set.
  The line is pre-filled with Brand's approved text; Julia still has to approve it and supply the photo.

## /how-to-spot-a-fake
Copy: `client/src/content/spotAFake.ts` (Brand approved). Bracketed items are empty
fields; the page drops the half-sentence (or item) until filled, so no bracket text
can show (unit-tested). While `published: false` the page is `noindex`, not in the
nav or sitemap, and not linked from product pages. Flip `published` to `true` once
Julia confirms the packaging/seal descriptions and the authorization link.
