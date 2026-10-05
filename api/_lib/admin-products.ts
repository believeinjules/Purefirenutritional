/**
 * Validation for admin product writes (POST/PATCH /api/admin/products).
 * Pure — no Firebase imports — so it is unit-testable.
 */

export const PRODUCT_CATEGORIES = [
  "PEPTIDE BIOREGULATORS",
  "ANTI AGING-LONGEVITY",
  "NUTRITIONAL SUPPLEMENTS",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductVariantDoc = {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  image: string | null;
  imageAlt: string | null;
  inStock: boolean;
};

/** Shape written to Firestore products/{id} — same as seed-products. */
export type ProductDoc = {
  name: string;
  description: string;
  category: ProductCategory;
  priceUSD: number;
  priceEUR: number;
  rating: number;
  sizes: number;
  image: string | null;
  imageAlt: string | null;
  benefits: string[];
  ingredients: string[];
  usage: string | null;
  seriesInfo: string | null;
  variants: ProductVariantDoc[];
  in_stock: boolean;
};

/** Legacy snake_case fields older admin builds wrote; removed on every save. */
export const LEGACY_PRODUCT_FIELDS = ["price_usd", "price_eur", "image_alt", "series_info"] as const;

export const PRODUCT_ID_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const VARIANT_ID_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}

function fail(message: string): never {
  throw new ProductValidationError(message);
}

function str(value: unknown, field: string, max: number, required = false): string {
  if (value === undefined || value === null) {
    if (required) fail(`${field} is required`);
    return "";
  }
  if (typeof value !== "string") fail(`${field} must be text`);
  const v = value.trim();
  if (required && !v) fail(`${field} is required`);
  if (v.length > max) fail(`${field} is too long (max ${max} characters)`);
  return v;
}

function nullableStr(value: unknown, field: string, max: number): string | null {
  const v = str(value, field, max);
  return v ? v : null;
}

function money(value: unknown, field: string, { allowZero }: { allowZero: boolean }): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) fail(`${field} must be a number`);
  if (allowZero ? n < 0 : n <= 0) fail(`${field} must be ${allowZero ? "0 or more" : "more than 0"}`);
  if (n > 100000) fail(`${field} is unrealistically high`);
  return Math.round(n * 100) / 100;
}

function imageUrl(value: unknown, field: string): string | null {
  const v = nullableStr(value, field, 2000);
  if (v === null) return null;
  if (!/^https:\/\//i.test(v) && !v.startsWith("/")) {
    fail(`${field} must be an https:// URL or a site path starting with /`);
  }
  return v;
}

function stringList(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail(`${field} must be a list`);
  if (value.length > 100) fail(`${field} has too many entries`);
  return value
    .map((item, i) => str(item, `${field}[${i}]`, 1000))
    .filter(Boolean);
}

function variants(value: unknown): ProductVariantDoc[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail("variants must be a list");
  if (value.length > 10) fail("Too many variants (max 10)");
  const seen = new Set<string>();
  return value.map((raw, i) => {
    if (!raw || typeof raw !== "object") fail(`variants[${i}] is invalid`);
    const v = raw as Record<string, unknown>;
    const id = str(v.id, `variants[${i}].id`, 50, true);
    if (!VARIANT_ID_RE.test(id)) fail(`variants[${i}].id must be lowercase letters, numbers and dashes`);
    if (seen.has(id)) fail(`Duplicate variant id "${id}"`);
    seen.add(id);
    return {
      id,
      name: str(v.name, `variants[${i}].name`, 100, true),
      priceUSD: money(v.priceUSD, `variants[${i}].priceUSD`, { allowZero: false }),
      priceEUR: money(v.priceEUR ?? 0, `variants[${i}].priceEUR`, { allowZero: true }),
      image: imageUrl(v.image, `variants[${i}].image`),
      imageAlt: nullableStr(v.imageAlt, `variants[${i}].imageAlt`, 500),
      inStock: v.inStock !== false,
    };
  });
}

/** Validate a full product (create). Returns the exact Firestore doc. */
export function validateProductInput(body: unknown): ProductDoc {
  if (!body || typeof body !== "object") fail("Request body must be a JSON object");
  const b = body as Record<string, unknown>;

  const category = str(b.category, "category", 100, true) as ProductCategory;
  if (!PRODUCT_CATEGORIES.includes(category)) {
    fail(`category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`);
  }

  const variantDocs = variants(b.variants);
  const rating = b.rating === undefined || b.rating === null || b.rating === "" ? 0 : Number(b.rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) fail("rating must be between 0 and 5");

  // Base price: required unless variants exist (then the first variant's price).
  const hasBase = b.priceUSD !== undefined && b.priceUSD !== null && b.priceUSD !== "" && Number(b.priceUSD) !== 0;
  const priceUSD = hasBase
    ? money(b.priceUSD, "priceUSD", { allowZero: false })
    : variantDocs[0]?.priceUSD ?? fail("priceUSD must be more than 0");

  return {
    name: str(b.name, "name", 200, true),
    description: str(b.description, "description", 20000),
    category,
    priceUSD,
    priceEUR: money(b.priceEUR ?? 0, "priceEUR", { allowZero: true }),
    rating: Math.round(rating * 10) / 10,
    sizes: Math.max(1, variantDocs.length),
    image: imageUrl(b.image, "image"),
    imageAlt: nullableStr(b.imageAlt, "imageAlt", 500),
    benefits: stringList(b.benefits, "benefits"),
    ingredients: stringList(b.ingredients, "ingredients"),
    usage: nullableStr(b.usage, "usage", 5000),
    seriesInfo: nullableStr(b.seriesInfo, "seriesInfo", 5000),
    variants: variantDocs,
    in_stock: b.in_stock !== false,
  };
}

/**
 * Validate a partial update (PATCH). Only provided fields are returned, using
 * the same rules as create. Keeps `sizes` in sync when variants change.
 */
export function validateProductPatch(body: unknown): Partial<ProductDoc> {
  if (!body || typeof body !== "object") fail("Request body must be a JSON object");
  const b = body as Record<string, unknown>;
  const out: Partial<ProductDoc> = {};
  const has = (k: string) => Object.prototype.hasOwnProperty.call(b, k) && b[k] !== undefined;

  if (has("name")) out.name = str(b.name, "name", 200, true);
  if (has("description")) out.description = str(b.description, "description", 20000);
  if (has("category")) {
    const c = str(b.category, "category", 100, true) as ProductCategory;
    if (!PRODUCT_CATEGORIES.includes(c)) fail(`category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`);
    out.category = c;
  }
  if (has("priceUSD")) out.priceUSD = money(b.priceUSD, "priceUSD", { allowZero: false });
  if (has("priceEUR")) out.priceEUR = money(b.priceEUR, "priceEUR", { allowZero: true });
  if (has("rating")) {
    const r = Number(b.rating);
    if (!Number.isFinite(r) || r < 0 || r > 5) fail("rating must be between 0 and 5");
    out.rating = Math.round(r * 10) / 10;
  }
  if (has("image")) out.image = imageUrl(b.image, "image");
  if (has("imageAlt")) out.imageAlt = nullableStr(b.imageAlt, "imageAlt", 500);
  if (has("benefits")) out.benefits = stringList(b.benefits, "benefits");
  if (has("ingredients")) out.ingredients = stringList(b.ingredients, "ingredients");
  if (has("usage")) out.usage = nullableStr(b.usage, "usage", 5000);
  if (has("seriesInfo")) out.seriesInfo = nullableStr(b.seriesInfo, "seriesInfo", 5000);
  if (has("in_stock")) out.in_stock = b.in_stock !== false;
  if (has("variants")) {
    out.variants = variants(b.variants);
    out.sizes = Math.max(1, out.variants.length);
  }

  if (Object.keys(out).length === 0) fail("No product fields to update");
  return out;
}

export function validateProductId(id: unknown): string {
  if (typeof id !== "string" || !PRODUCT_ID_RE.test(id)) {
    fail("Product id must be lowercase letters, numbers and dashes (max 100)");
  }
  return id;
}
