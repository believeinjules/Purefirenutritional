/**
 * Search-engine / link-preview metadata helpers.
 *
 * Pure functions only (no React, no browser globals) so the same code runs in
 * the browser, in the SSR prerender (prerender.mjs) and in tests. Product
 * prices are resolved with the same helpers checkout uses
 * (shared/product-prices.ts), so rich-result prices match what Stripe charges.
 */
import { variantCartSize } from "@shared/product-prices";

export const SITE_URL = "https://www.purefirenutritional.com";
export const SITE_NAME = "Pure Fire Nutritional";
/** Square brand logo — used when a page has no image of its own. */
export const DEFAULT_SHARE_IMAGE = "/logo-flame.jpeg";

// ─── URLs ─────────────────────────────────────────────────────────────────────

/** Normalize a route path: no query/hash, leading slash, no trailing slash (except "/"). */
export function normalizePath(path: string): string {
  let p = (path || "/").split(/[?#]/)[0] || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "") || "/";
  return p;
}

/** Absolute URL on the canonical host (www). Leaves absolute http(s) URLs alone. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  let encoded = p;
  try {
    encoded = encodeURI(decodeURI(p));
  } catch {
    encoded = encodeURI(p);
  }
  return `${SITE_URL}${encoded}`;
}

export function canonicalUrl(path: string): string {
  const p = normalizePath(path);
  return p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
}

export function productPath(id: string): string {
  return `/products/${id}`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Head defaults for routes whose page component does not set its own. */
export type RouteHead = { title: string; description?: string; noindex?: boolean };

/**
 * Private / transactional pages: never indexed. Also disallowed in robots.txt
 * where crawling them is pointless (cart, checkout, admin, account).
 */
export const PRIVATE_ROUTES: Record<string, RouteHead> = {
  "/cart": { title: `Your Cart | ${SITE_NAME}`, noindex: true },
  "/wishlist": { title: `Your Wishlist | ${SITE_NAME}`, noindex: true },
  "/checkout": { title: `Checkout | ${SITE_NAME}`, noindex: true },
  "/checkout/success": { title: `Order Confirmation | ${SITE_NAME}`, noindex: true },
  "/login": { title: `Sign In | ${SITE_NAME}`, noindex: true },
  "/signup": { title: `Create Account | ${SITE_NAME}`, noindex: true },
  "/dashboard": { title: `My Account | ${SITE_NAME}`, noindex: true },
  "/auth/action": { title: `Account | ${SITE_NAME}`, noindex: true },
  "/admin": { title: `Admin | ${SITE_NAME}`, noindex: true },
  "/admin/products": { title: `Manage Products | ${SITE_NAME}`, noindex: true },
  "/admin/reviews": { title: `Manage Reviews | ${SITE_NAME}`, noindex: true },
};

/** Public pages that have no page-level head tags of their own. */
export const PUBLIC_ROUTE_DEFAULTS: Record<string, RouteHead> = {
  "/peptalk": {
    title: `Peptalk Podcast | ${SITE_NAME}`,
    // Reuses the copy shown on the Peptalk page.
    description:
      "Peptalk Podcast from Pure Fire Nutritional: engaging conversations about health, longevity, peptides, and wellness with leading experts in the field.",
  },
};

export function routeHead(path: string): RouteHead | undefined {
  const p = normalizePath(path);
  return PRIVATE_ROUTES[p] ?? PUBLIC_ROUTE_DEFAULTS[p];
}

// ─── Meta descriptions (structure/function wording only) ─────────────────────

/**
 * Words that signal a disease / treatment / clinical claim. A sentence that
 * contains any of these is never used in a meta description or rich result,
 * even though the full product copy may contain it.
 */
const CLAIM_PATTERN = new RegExp(
  "\\b(" +
    [
      "treat\\w*", "cur(e|es|ed|ing|ative)", "disease\\w*", "disorder\\w*", "illness\\w*",
      "ill", "sick\\w*", "clinical\\w*", "clinically", "therap\\w*", "diagnos\\w*",
      "prevent\\w*", "heal(s|ed|ing|er|ers)?", "symptom\\w*", "patholog\\w*", "syndrome\\w*",
      "cancer\\w*", "oncolog\\w*", "tumou?r\\w*", "carcinogen\\w*", "anemi\\w*", "anaemi\\w*",
      "diabet\\w*", "osteo\\w*", "arthr\\w*", "infect\\w*", "inflamm\\w*", "hypertens\\w*",
      "hypotens\\w*", "atheroscler\\w*", "ischemi\\w*", "ischaemi\\w*", "insufficien\\w*",
      "deficien\\w*", "dysfunction\\w*", "chronic", "acute", "recover\\w*", "fracture\\w*",
      "injur\\w*", "trauma\\w*", "surger\\w*", "postoperative", "alzheimer\\w*",
      "parkinson\\w*", "dementia", "depress\\w*", "anxiety", "insomnia", "ulcer\\w*",
      "hepatitis", "cirrhosis", "prostat\\w*", "menopaus\\w*", "impoten\\w*", "infertil\\w*",
      "glaucoma", "cataract\\w*", "retinopath\\w*", "asthma", "bronch\\w*", "pneumon\\w*",
      "allerg\\w*", "immunodeficien\\w*", "stroke", "infarct\\w*", "obes\\w*", "toxic\\w*",
      "intoxicat\\w*", "poison\\w*", "pain\\w*", "lesion\\w*", "adenoma\\w*", "cyst\\w*",
      "myopia", "dystroph\\w*", "degenerat\\w*", "failure", "virus\\w*", "viral",
      "bacteri\\w*", "medic(ine|ines|al|ation|ations)", "drug\\w*", "cardiomyopath\\w*",
      "arrhythm\\w*", "angina", "colitis", "gastritis", "pancreatitis", "nephr\\w*",
      "cystitis", "dermatitis", "psoria\\w*", "eczema", "acne", "alopecia", "baldness",
      "\\w*restor\\w*", "damage\\w*", "protects? against", "normaliz\\w*", "regenerat\\w*", "reverse\\w*", "reversal",
      "rejuvenat\\w*", "stem cell\\w*", "p53", "mortality", "lifespan", "patients?",
      "studied", "trials?", "proven", "effectiveness", "efficacy",
      "onco\\w*", "antiparasit\\w*", "parasit\\w*", "anxiolytic\\w*", "pharmaceutical\\w*",
      "detox\\w*", "repair\\w*", "reparative", "immunomodulat\\w*", "disturbance\\w*",
      "insulin", "medicinal", "safe", "\\w*protective", "\\w*protector\\w*", "protection",
      "antidepress\\w*", "sedat\\w*", "immunoregulat\\w*", "risks?",
    ].join("|") +
    ")\\b",
  "i"
);

/** Percent figures ("by 41%") are efficacy claims in this catalog's copy. */
const PERCENT_PATTERN = /\d\s?%/;

export function hasClaimLanguage(text: string): boolean {
  return CLAIM_PATTERN.test(text) || PERCENT_PATTERN.test(text);
}

const ABBREVIATIONS = ["St.", "Prof.", "Dr.", "No.", "e.g.", "i.e.", "vs.", "approx.", "Inc.", "Ltd."];

/** Split product copy into sentences without breaking on "St. Petersburg" etc. */
export function splitSentences(text: string): string[] {
  let t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return [];
  ABBREVIATIONS.forEach((abbr, i) => {
    t = t.split(abbr).join(abbr.replace(/\./g, `\u0000${i}\u0000`));
  });
  return t
    .split(/(?<=[.!?])\s+(?=["“(]?[A-Z0-9])/)
    .map((s) => s.replace(/\u0000\d+\u0000/g, ".").trim())
    .filter(Boolean);
}

const META_DESCRIPTION_MAX = 160;

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

const CATEGORY_PHRASE: Record<string, string> = {
  "PEPTIDE BIOREGULATORS": "Oral Khavinson peptide bioregulator dietary supplement",
  "ANTI AGING-LONGEVITY": "Anti-aging & longevity supplement",
  "NUTRITIONAL SUPPLEMENTS": "Nutritional supplement",
};

/** Sentences that are about formats/availability, not the product itself. */
function isAvailabilitySentence(s: string): boolean {
  return /^(available|now available|sold|comes) in\b/i.test(s) || /\bavailable in \d/i.test(s);
}

/** Directions-for-use sentences belong on the page, not in a search snippet. */
function isUsageSentence(s: string): boolean {
  return /^(take|place|use|apply|dissolve|mix|add|shake|recommended|dosage|dose|course|directions)\b/i.test(s);
}

/**
 * Meta description for a product, built only from the product's own copy:
 * leading sentences that contain no disease / treatment / clinical wording,
 * up to ~160 characters. Falls back to a neutral catalog sentence.
 */
export function productMetaDescription(product: {
  name: string;
  description?: string | null;
  category?: string | null;
}): string {
  const safe = splitSentences(product.description || "").filter(
    (s) => !hasClaimLanguage(s) && !isAvailabilitySentence(s) && !isUsageSentence(s)
  );

  let out = "";
  for (const sentence of safe) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > META_DESCRIPTION_MAX) {
      if (!out) out = truncateAtWord(sentence, META_DESCRIPTION_MAX);
      break;
    }
    out = next;
  }

  if (!out) {
    const phrase = CATEGORY_PHRASE[product.category || ""];
    return phrase
      ? `${product.name} — ${phrase}. Available from Pure Fire Nutritional, an authorized U.S. retailer.`
      : `${product.name}, available from Pure Fire Nutritional, an authorized U.S. retailer.`;
  }

  const lowerName = product.name.toLowerCase();
  // Names like "Bonomarlot" vs copy "Bonomarlot® (A-20)" — compare on the first word.
  const firstWord = lowerName.split(/\s+/)[0] ?? lowerName;
  if (!out.toLowerCase().includes(firstWord)) {
    out = truncateAtWord(`${product.name}: ${out}`, META_DESCRIPTION_MAX);
  }
  return out;
}

// ─── Product structured data ──────────────────────────────────────────────────

export type SeoVariant = {
  id: string;
  name: string;
  priceUSD: number;
  image?: string | null;
  images?: string[] | null;
  inStock?: boolean;
};

export type SeoProduct = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  priceUSD: number;
  image?: string | null;
  images?: string[] | null;
  imageAlt?: string | null;
  in_stock?: boolean;
  variants?: SeoVariant[] | null;
};

const IN_STOCK = "https://schema.org/InStock";
const OUT_OF_STOCK = "https://schema.org/OutOfStock";

function validPrice(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function money(n: number): string {
  return n.toFixed(2);
}

/** Absolute, de-duplicated product image URLs (main image first). */
export function productImageUrls(product: SeoProduct): string[] {
  const all = [
    product.image,
    ...(product.images ?? []),
    ...(product.variants ?? []).flatMap((v) => [v.image, ...(v.images ?? [])]),
  ].filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return Array.from(new Set(all.map((x) => absoluteUrl(x.trim()))));
}

/**
 * The prices a shopper can actually check out with, in the same way checkout
 * prices a line (variant price for sized products, base price otherwise).
 */
export function productOffers(product: SeoProduct): Array<{
  sku: string;
  name: string;
  price: number;
  inStock: boolean;
}> {
  const productInStock = product.in_stock !== false;
  const variants = (product.variants ?? []).filter((v) => validPrice(v.priceUSD));
  if (variants.length > 0) {
    // Same ordering checkout uses for a size-less line: 20-count first.
    const sorted = [...variants].sort((a, b) => {
      const rank = (v: SeoVariant) => (variantCartSize(v) === "20" ? 0 : variantCartSize(v) === "60" ? 1 : 2);
      return rank(a) - rank(b);
    });
    return sorted.map((v) => ({
      sku: `${product.id}-${v.id}`,
      name: `${product.name} (${v.name})`,
      price: v.priceUSD,
      inStock: productInStock && v.inStock !== false,
    }));
  }
  if (validPrice(product.priceUSD)) {
    return [{ sku: product.id, name: product.name, price: product.priceUSD, inStock: productInStock }];
  }
  return [];
}

export function productJsonLd(product: SeoProduct): Record<string, unknown> {
  const url = canonicalUrl(productPath(product.id));
  const offers = productOffers(product);
  const seller = { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` };
  const images = productImageUrls(product);

  let offersLd: Record<string, unknown> | undefined;
  if (offers.length === 1) {
    const o = offers[0]!;
    offersLd = {
      "@type": "Offer",
      url,
      sku: o.sku,
      priceCurrency: "USD",
      price: money(o.price),
      availability: o.inStock ? IN_STOCK : OUT_OF_STOCK,
      itemCondition: "https://schema.org/NewCondition",
      seller,
    };
  } else if (offers.length > 1) {
    const prices = offers.map((o) => o.price);
    offersLd = {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "USD",
      lowPrice: money(Math.min(...prices)),
      highPrice: money(Math.max(...prices)),
      offerCount: offers.length,
      availability: offers.some((o) => o.inStock) ? IN_STOCK : OUT_OF_STOCK,
      seller,
      offers: offers.map((o) => ({
        "@type": "Offer",
        url,
        sku: o.sku,
        name: o.name,
        priceCurrency: "USD",
        price: money(o.price),
        availability: o.inStock ? IN_STOCK : OUT_OF_STOCK,
        itemCondition: "https://schema.org/NewCondition",
      })),
    };
  }

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: productMetaDescription(product),
    sku: product.id,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
  };
  if (images.length) ld.image = images;
  if (product.category) ld.category = product.category;
  if (offersLd) ld.offers = offersLd;
  return ld;
}

/** Everything the <head> of a product page needs. */
export function productHead(product: SeoProduct) {
  const images = productImageUrls(product);
  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: productMetaDescription(product),
    path: productPath(product.id),
    image: images[0],
    imageAlt: product.imageAlt || product.name,
    type: "product" as const,
    jsonLd: [productJsonLd(product)],
  };
}

// ─── Site-wide structured data (home page) ────────────────────────────────────

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
  };
}
