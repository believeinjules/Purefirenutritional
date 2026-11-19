/**
 * Batch Passport data: one row per batch we have on hand, read from the
 * package stamps on Julia's box photos/videos (2026-11-19). Every value is
 * copied exactly as printed. Nothing here is computed, estimated or taken
 * from a lab document: no COAs, no test results.
 *
 * Batches are keyed by product slug + lot, because the same lot number can be
 * printed on more than one product (e.g. 20126 on Chelohart, Cerluten,
 * Pinealon and Ventfort).
 *
 * `catalogProductId` is the catalog product id, or null when the product is not
 * in the catalog. The batch card links to /products/<id> only while that
 * product is visible (not hidden), so we never link to a page that does not
 * exist. `productSlug` names the batch page /batch-passport/<slug>-<lot>.
 *
 * Moving this to Firestore later: keep this shape as a `batches` collection
 * (doc id = batchKey), read it in prerender.mjs with the Admin SDK the same
 * way approved reviews are read, and fall back to this file when credentials
 * are missing. Admin edits would go through the existing admin API route
 * (no new serverless function).
 */

export type Batch = {
  /** Storefront product id, or a stable slug when the product is not in the catalog. */
  productSlug: string;
  /** Catalog product id (may be hidden); null = not in the catalog. */
  catalogProductId: string | null;
  /** Name shown to customers. */
  productName: string;
  /** Code printed on the package, e.g. "A-5" or "IPH T" (empty when none). */
  packageCode: string;
  /** Size as printed. */
  size: string;
  /** Lot / series exactly as printed. */
  lot: string;
  /** Manufacture date exactly as printed (DD.MM.YY or DD.MM.YYYY), or null when not printed. */
  madePrinted: string | null;
  /** Best-before date exactly as printed (DD.MM.YY, DD.MM.YYYY or MM/YYYY), or null when not printed. */
  expiryPrinted: string | null;
  /** Printed shelf-life line, used only when no dated best-before is printed. */
  shelfLife?: string;
  /** Where the lot is printed on this package. */
  lotLocation: string;
};

export const BATCHES: readonly Batch[] = [
  {
    productSlug: "endoluten",
    catalogProductId: "endoluten",
    productName: "Endoluten",
    packageCode: "A-8",
    size: "20 capsules",
    lot: "10225",
    madePrinted: "27.02.25",
    expiryPrinted: null,
    shelfLife: "3-year shelf life",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "chelohart",
    catalogProductId: "chelohart",
    productName: "Chelohart",
    packageCode: "A-14",
    size: "60 capsules",
    lot: "20126",
    madePrinted: "07.01.2026",
    expiryPrinted: "06.01.2029",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "chitomur",
    catalogProductId: "chitomur",
    productName: "Chitomur",
    packageCode: "A-12",
    size: "60 capsules",
    lot: "20825",
    madePrinted: "04.08.25",
    expiryPrinted: "03.08.28",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "cerluten",
    catalogProductId: "cerluten",
    productName: "Cerluten",
    packageCode: "A-5",
    size: "60 capsules",
    lot: "20126",
    madePrinted: "07.01.2026",
    expiryPrinted: "06.01.2029",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "prime-peptide-omega",
    catalogProductId: "prime-peptide-omega",
    productName: "Prime Peptide Omega",
    packageCode: "IPH T",
    size: "90 capsules",
    lot: "29423-01",
    madePrinted: null,
    expiryPrinted: "03/2030",
    lotLocation: "bottom of the bottle",
  },
  {
    productSlug: "svetinorm",
    catalogProductId: "svetinorm",
    productName: "Svetinorm",
    packageCode: "A-7",
    size: "60 capsules",
    lot: "31125",
    madePrinted: "05.11.2025",
    expiryPrinted: "04.11.2028",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "pinealon",
    catalogProductId: "pinealon",
    productName: "Pinealon",
    packageCode: "AC-5",
    size: "60 capsules",
    lot: "20126",
    madePrinted: "07.01.2026",
    expiryPrinted: "06.01.2029",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "glandokort",
    catalogProductId: "glandokort",
    productName: "Glandokort",
    packageCode: "A-17",
    size: "60 capsules",
    lot: "71125",
    madePrinted: "05.11.2025",
    expiryPrinted: "04.11.2028",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "revilab-ml-03",
    catalogProductId: "revilab-ml-03",
    productName: "Revilab ML 03",
    packageCode: "",
    size: "30 capsules",
    lot: "1225",
    madePrinted: "05.12.2025",
    expiryPrinted: "04.12.2028",
    lotLocation: "end panel stamp",
  },
  {
    productSlug: "ventfort",
    catalogProductId: "ventfort",
    productName: "Ventfort",
    packageCode: "A-3",
    size: "60 capsules",
    lot: "20126",
    madePrinted: "07.01.2026",
    expiryPrinted: "06.01.2029",
    lotLocation: "box flap stamp",
  },
  {
    productSlug: "prime-peptide-brain",
    catalogProductId: "prime-peptide-brain",
    productName: "Prime Peptide Brain",
    packageCode: "IPH AGAP",
    size: "90 capsules",
    lot: "29421-02",
    madePrinted: null,
    expiryPrinted: "04/2030",
    lotLocation: "bottom of the bottle",
  },
  {
    // Size per the printed English box label (the bottle front read as 4.06 in the
    // video was motion-blurred). Drafted in the catalog but hidden until Julia OKs it; the batch page
    // links to /products/mesotel-ultra automatically once it is un-hidden.
    productSlug: "mesotel-ultra",
    catalogProductId: "mesotel-ultra",
    productName: "Mesotel Ultra",
    packageCode: "",
    size: "120 ml / 4.05 fl. oz.",
    lot: "001",
    madePrinted: "07.04.2026",
    expiryPrinted: "06.04.2028",
    lotLocation: "bottle label stamp",
  },
];

export const BATCH_PASSPORT_PATH = "/batch-passport";

/** Lot as typed by a customer → display form: trimmed, no spaces, upper case. */
export function normalizeLot(input: string): string {
  return input.trim().replace(/\s+/g, "").toUpperCase();
}

/**
 * Matching form of a lot: normalizeLot without hyphens/dashes, so "2942301"
 * matches the printed "29423-01". Within one product no two lots may share a
 * matching form (enforced by shared/batches.test.ts); across products a shared
 * form is resolved by asking the customer which product they have.
 */
export function lotMatchKey(input: string): string {
  return normalizeLot(input).replace(/[-\u2010-\u2015\u2212]/g, "");
}

/** URL-safe lot: lower case, anything other than letters/digits/hyphen dropped. */
function lotSlug(lot: string): string {
  return normalizeLot(lot).toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function batchKey(b: Pick<Batch, "productSlug" | "lot">): string {
  return `${b.productSlug}-${lotSlug(b.lot)}`;
}

export function batchPath(b: Pick<Batch, "productSlug" | "lot">): string {
  return `${BATCH_PASSPORT_PATH}/${batchKey(b)}`;
}

/** /batch-passport with a product preselected (used by "Check your batch" on product pages). */
export function batchLookupHref(productId: string): string {
  return `${BATCH_PASSPORT_PATH}?product=${encodeURIComponent(productId)}`;
}

export const BATCH_ROUTES: string[] = BATCHES.map(batchPath);

export function getBatchByKey(key: string): Batch | undefined {
  const k = key.toLowerCase();
  return BATCHES.find((b) => batchKey(b) === k);
}

/** Products that have at least one batch, in first-seen order (for the product picker). */
export function batchProducts(): Array<{ productSlug: string; productName: string }> {
  const seen = new Map<string, string>();
  for (const b of BATCHES) if (!seen.has(b.productSlug)) seen.set(b.productSlug, b.productName);
  return Array.from(seen.entries())
    .map(([productSlug, productName]) => ({ productSlug, productName }))
    .sort((a, b) => a.productName.localeCompare(b.productName));
}

/**
 * Look up a typed lot. With a product, returns at most one batch. Without a
 * product, returns every batch with that lot (the caller asks the customer to
 * pick the product when more than one matches).
 */
export function findBatches(lotInput: string, productSlug?: string | null): Batch[] {
  const lot = lotMatchKey(lotInput);
  if (!lot) return [];
  return BATCHES.filter(
    (b) => lotMatchKey(b.lot) === lot && (!productSlug || b.productSlug === productSlug)
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Printed package date → unambiguous display. "07.01.2026" → "Jan 7, 2026",
 * "27.02.25" → "Feb 27, 2025", "03/2030" → "Mar 2030". Returns null for a
 * string it cannot read (the caller then shows the raw print only).
 */
export function formatPrintedDate(printed: string): string | null {
  const s = printed.trim();
  let m = s.match(/^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${MONTHS[month - 1]} ${day}, ${year}`;
  }
  m = s.match(/^(\d{2})\/(\d{4})$/);
  if (m) {
    const month = Number(m[1]);
    if (month < 1 || month > 12) return null;
    return `${MONTHS[month - 1]} ${m[2]}`;
  }
  return null;
}

export const NOT_PRINTED = "Not printed on package";

export function madeLabel(b: Batch): { display: string; printed: string | null } {
  if (!b.madePrinted) return { display: NOT_PRINTED, printed: null };
  return { display: formatPrintedDate(b.madePrinted) ?? b.madePrinted, printed: b.madePrinted };
}

export function expiryLabel(b: Batch): { display: string; printed: string | null } {
  if (b.expiryPrinted) return { display: formatPrintedDate(b.expiryPrinted) ?? b.expiryPrinted, printed: b.expiryPrinted };
  if (b.shelfLife) return { display: b.shelfLife, printed: null };
  return { display: NOT_PRINTED, printed: null };
}

export function batchDisplayName(b: Batch): string {
  return b.packageCode ? `${b.productName} (${b.packageCode})` : b.productName;
}
