# Customer reviews

- Storage: Firestore `reviews/{id}`, written only through `/api/admin/reviews` (Admin SDK, same admin auth as products).
  Browsers never write it; Firestore rules stay locked.
- Admin UI: **Admin → Manage Reviews** (`/admin/reviews`). Enter reviews customers sent, exactly as written.
- Fields: productId, firstName, lastInitial, date (YYYY-MM-DD), text, rating (1–5), verified, approved, permission.
- Public: `GET /api/reviews` returns only reviews where `approved === true`, `permission === true`, and the
  text has no health-claim wording (cure/treat/fix/heal/reverse/disease/off my meds/… — `shared/reviews.ts`).
  The server also refuses to *save* a review as approved without permission or with health-claim wording.
- Shown as "First L.", with the date and a "Verified buyer" tag when `verified` is set.
- Where it shows: product page section (`#reviews`), stars + count on product cards (from #31), and the homepage
  strip directly under the hero. Every one renders **nothing** while there are zero approved reviews.
- No sample or placeholder reviews are committed.
- The old "Pending Reviews" tab in Admin reads a different, client-side collection (`product_reviews`) and is left
  untouched; it is not used by the public site.
