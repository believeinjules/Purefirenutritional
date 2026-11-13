/**
 * Search-engine / link-preview metadata helpers.
 *
 * Pure functions only (no React, no browser globals) so the same code runs in
 * the browser, in the SSR prerender (prerender.mjs) and in tests. Product
 * prices are resolved with the same helpers checkout uses
 * (shared/product-prices.ts), so rich-result prices match what Stripe charges.
 */
import { variantCartSize } from "@shared/product-prices";
import { getPdpContent, getProductFacts } from "@shared/product-facts";
import { isFormulaPreviewPdp } from "@/data/formulaType";
import { FORMULA_PDP_CONTENT, isInjectableFaq, isPreviewRemovedFaq } from "@/data/formulaPreviewContent";
import { tagsFor } from "@/data/productTags";
import { COMMERCE_CONFIG } from "@shared/commerce-config";
import { resolveFulfillment } from "@shared/fulfillment";
import { CATEGORY_PAGES_LIVE, systemPath, systemsForProduct } from "@/data/bodySystems";
import { RETAILER_NUMBER } from "@/data/retailerAuthorization";
import { CONTACT_EMAIL, SUPPORT_EMAIL } from "@shared/contact-emails";

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
  "/review": { title: `Write a Review | ${SITE_NAME}`, noindex: true },
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

const ABBREVIATIONS = ["U.S.", "St.", "Prof.", "Dr.", "No.", "e.g.", "i.e.", "vs.", "approx.", "Inc.", "Ltd."];

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
  id?: string;
  name: string;
  description?: string | null;
  category?: string | null;
}): string {
  const written = product.id ? getPdpContent(product.id)?.metaDescription : undefined;
  if (written) return written;
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
  /** Stock line (shared/fulfillment.ts); unset → code default → ships_2_weeks. */
  fulfillment?: string | null;
  variants?: SeoVariant[] | null;
};

const IN_STOCK = "https://schema.org/InStock";
const OUT_OF_STOCK = "https://schema.org/OutOfStock";
/** Purchasable now but ships in ~2 weeks (shared/fulfillment.ts): Merchant Center "backorder". */
const BACK_ORDER = "https://schema.org/BackOrder";

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

/**
 * Manufacturer brand for JSON-LD, from the collection tags in productTags.ts. Pure Fire
 * Nutritional is the seller, not the brand. Unknown → undefined (brand omitted).
 */
export function productBrand(id: string): string | undefined {
  const tags = tagsFor(id);
  if (tags.includes("collection:khavinson-cytomaxes")) return "Khavinson Cytomax";
  if (tags.includes("collection:khavinson-cytogens")) return "Khavinson Cytogen";
  if (tags.includes("collection:prime-peptide")) return "Prime Peptide";
  if (tags.includes("collection:revilab")) return "Revilab";
  return undefined;
}

/** Countries checkout ships to (api/_lib/checkout-session.ts allowed_countries; Shipping policy page). */
export const SHIP_TO_COUNTRIES = ["US", "CA", "GB", "AU", "NZ", "IE"] as const;

/**
 * Offer shipping from the Shipping policy (shared/commerce-config.ts): flat
 * $19.95, free at a $150+ merchandise subtotal, same charge for every country.
 * Delivery times only for in-stock items (ship in 1–3 business days; US transit
 * 3–7, international 7–21 business days); "ships in about 2 weeks" items get no
 * delivery time rather than a guessed one.
 */
export function offerShippingDetails(priceUSD: number, inStockNow: boolean): Record<string, unknown>[] {
  const rate = priceUSD >= COMMERCE_CONFIG.freeShippingThresholdUSD ? 0 : COMMERCE_CONFIG.standardShippingUSD;
  const days = (min: number, max: number) => ({ "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" });
  const businessDays = {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => `https://schema.org/${d}`),
  };
  const detail = (countries: readonly string[], transit: [number, number]) => {
    const d: Record<string, unknown> = {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: rate.toFixed(2), currency: "USD" },
      shippingDestination: countries.map((c) => ({ "@type": "DefinedRegion", addressCountry: c })),
    };
    if (inStockNow) {
      d.deliveryTime = {
        "@type": "ShippingDeliveryTime",
        businessDays,
        handlingTime: days(1, 3),
        transitTime: days(transit[0], transit[1]),
      };
    }
    return d;
  };
  return [detail(["US"], [3, 7]), detail(SHIP_TO_COUNTRIES.filter((c) => c !== "US"), [7, 21])];
}

/** "20 Capsules" from a variant name, as the page shows it; otherwise the variant name. */
function variantSizeLabel(v: SeoVariant): string {
  const m = v.name.match(/\b(\d{1,4})\s*(capsules|caps|tablets|tabs)\b/i);
  if (!m) return v.name;
  return `${m[1]} ${/^tab/i.test(m[2]!) ? "Tablets" : "Capsules"}`;
}

export function productJsonLd(product: SeoProduct): Record<string, unknown> {
  const url = canonicalUrl(productPath(product.id));
  const offers = productOffers(product);
  const fulfillment = resolveFulfillment(product.id, product.fulfillment);
  const sellable = fulfillment === "in_stock" ? IN_STOCK : BACK_ORDER;
  const avail = (inStock: boolean) => (inStock ? sellable : OUT_OF_STOCK);
  const seller = ORGANIZATION_REF;
  const images = productImageUrls(product);
  const brandName = productBrand(product.id);
  const rolled = FORMULA_PDP_CONTENT[product.id];
  const name = rolled ? rolled.title : product.name;

  const offerLd = (o: { sku: string; price: number; inStock: boolean }) => ({
    "@type": "Offer",
    url,
    sku: o.sku,
    priceCurrency: "USD",
    price: money(o.price),
    availability: avail(o.inStock),
    itemCondition: "https://schema.org/NewCondition",
    seller,
    shippingDetails: offerShippingDetails(o.price, o.inStock && fulfillment === "in_stock"),
  });

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@id": `${url}#product`,
    name,
    description: productSnippet(product),
    url,
  };
  if (brandName) base.brand = { "@type": "Brand", name: brandName };
  if (images.length) base.image = images;
  if (product.category) base.category = product.category;

  // Several sizes: ProductGroup + one variant Product (own sku, size, Offer) per size.
  // Variant URLs are the bare PDP: the page does not preselect a size from the URL.
  const variants = (product.variants ?? []).filter((v) => validPrice(v.priceUSD));
  if (offers.length > 1 && variants.length > 1) {
    const byId = new Map(variants.map((v) => [`${product.id}-${v.id}`, v]));
    return {
      ...base,
      "@type": "ProductGroup",
      productGroupID: product.id,
      variesBy: ["https://schema.org/size"],
      hasVariant: offers.map((o) => {
        const v = byId.get(o.sku)!;
        const size = variantSizeLabel(v);
        const vImages = [v.image, ...(v.images ?? [])].filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => absoluteUrl(x.trim()));
        const variant: Record<string, unknown> = {
          "@type": "Product",
          "@id": `${url}#${o.sku}`,
          sku: o.sku,
          name: `${product.name} ${size}`,
          size,
          url,
          offers: offerLd(o),
        };
        if (brandName) variant.brand = { "@type": "Brand", name: brandName };
        const img = vImages.length ? vImages : images.slice(0, 1);
        if (img.length) variant.image = img;
        return variant;
      }),
    };
  }

  const ld: Record<string, unknown> = { ...base, "@type": "Product", sku: product.id };
  if (offers.length >= 1) ld.offers = offerLd(offers[0]!);
  return ld;
}

/**
 * Organization-level return policy, from the Returns & Refunds page (2026-10-08):
 * unopened, sealed products within 30 days of delivery, by mail, refund of the
 * price paid; the customer pays return shipping unless it was our mistake.
 */
export function returnPolicyJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      "@id": `${SITE_URL}/returns#policy`,
      merchantReturnLink: canonicalUrl("/returns"),
      applicableCountry: [...SHIP_TO_COUNTRIES],
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      itemCondition: "https://schema.org/NewCondition",
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      customerRemorseReturnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      customerRemorseReturnLabelSource: "https://schema.org/ReturnLabelCustomerResponsibility",
      itemDefectReturnFees: "https://schema.org/FreeReturn",
      refundType: "https://schema.org/FullRefund",
    },
  };
}

// ─── Product titles / snippets ───────────────────────────────────────────────

/** Target organ / tissue of each Khavinson peptide bioregulator (from the catalog copy). */
import { SEO_TITLE_FOCUS } from "./productTitles";
export { SEO_TITLE_FOCUS };

export const BIOREGULATOR_ORGAN: Record<string, string> = {
  bonomarlot: "Bone Marrow",
  bonothyrk: "Parathyroid",
  cartalax: "Cartilage",
  cerluten: "Brain",
  chelohart: "Heart",
  chitomur: "Bladder",
  chonluten: "Respiratory",
  crystagen: "Immune",
  endoluten: "Pineal",
  glandokort: "Adrenal",
  gotratix: "Muscle",
  libidon: "Prostate",
  ovagen: "Liver & Digestive",
  pielotax: "Kidney",
  pinealon: "Brain",
  sigumir: "Cartilage & Bone",
  stamakort: "Stomach",
  suprefort: "Pancreas",
  svetinorm: "Liver",
  taxorest: "Respiratory",
  testoluten: "Testicular",
  thyreogen: "Thyroid",
  ventfort: "Blood Vessel",
  vesugen: "Blood Vessel",
  visoluten: "Retina",
  vladonix: "Thymus",
  zhenoluten: "Ovarian",
};

export const TITLE_MAX = 60;

/**
 * "<Product> | <Organ> Peptide Bioregulator | Pure Fire Nutritional" for every
 * bioregulator, "<Product> | <SEO_TITLE_FOCUS> | Pure Fire Nutritional" for other
 * mapped products, "<Product> | Pure Fire Nutritional" as a last resort. One consistent
 * pattern (no per-product shortening); TITLE_MAX is reported, not enforced.
 */
export function productTitle(product: { id: string; name: string }): string {
  const rolled = FORMULA_PDP_CONTENT[product.id];
  if (rolled && !rolled.legacyTitle) return rolled.seoTitle ?? rolledOutTitle(rolled.title);
  const organ = BIOREGULATOR_ORGAN[product.id];
  if (organ) return `${product.name} | ${organ} Peptide Bioregulator | ${SITE_NAME}`;
  const focus = SEO_TITLE_FOCUS[product.id];
  return focus ? `${product.name} | ${focus} | ${SITE_NAME}` : `${product.name} | ${SITE_NAME}`;
}

/**
 * Rolled-out pages: the <title> is the H1. "| Pure Fire Nutritional" is added when the
 * whole stays within TITLE_MAX; a long descriptor is cut before " with " (factual,
 * no new words). Some titles still exceed 60 characters and are reported.
 */
export function rolledOutTitle(h1: string): string {
  let core = h1;
  if (core.length > TITLE_MAX && core.includes(" with ")) core = core.slice(0, core.indexOf(" with "));
  const full = `${core} | ${SITE_NAME}`;
  return full.length <= TITLE_MAX ? full : core;
}

/**
 * Rolled-out pages: meta description written from the page's Snapshot, led by the
 * product name. No claims (the Snapshot is factual); checked with hasClaimLanguage in tests.
 */
export function rolledOutDescription(id: string, name: string): string | undefined {
  const c = FORMULA_PDP_CONTENT[id];
  if (!c) return undefined;
  if (c.metaDescription) return c.metaDescription;
  const brandMark = c.title.startsWith(`${name}®`) ? `${name}®` : name;
  const snap = c.snapshot.replace(/^A /, "a ").replace(/^An /, "an ");
  let out = `${brandMark}: ${snap}`;
  // Too long: keep whole sentences that fit before falling back to a word cut.
  if (out.length > META_DESCRIPTION_MAX) {
    let kept = "";
    for (const sentence of splitSentences(out)) {
      const next = kept ? `${kept} ${sentence}` : sentence;
      if (next.length > META_DESCRIPTION_MAX) break;
      kept = next;
    }
    if (kept) out = kept;
  }
  const tail = ` From ${SITE_NAME}.`;
  if (out.length + tail.length <= META_DESCRIPTION_MAX) out += tail;
  return out.length <= META_DESCRIPTION_MAX ? out : truncateAtWord(out, META_DESCRIPTION_MAX);
}

export const SNIPPET_MIN = 150;

/**
 * 150–160 character search snippet: a branded lead sentence (product name,
 * organ, Pure Fire Nutritional) followed by the claim-filtered product copy.
 */
export function productSnippet(product: {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
}): string {
  // Rolled-out pages: from the Snapshot. Then per-product written meta (pdp.metaDescription).
  const rolled = rolledOutDescription(product.id, product.name);
  if (rolled) return rolled;
  const written = getPdpContent(product.id)?.metaDescription;
  if (written) return written;
  const organ = BIOREGULATOR_ORGAN[product.id];
  const lead = organ
    ? `${product.name} ${organ.toLowerCase()} peptide bioregulator from Pure Fire Nutritional.`
    : `${product.name} from Pure Fire Nutritional.`;
  const body = splitSentences(productMetaDescription(product))
    .map((s) => s.replace(/…$/, ""))
    .filter((s) => !s.toLowerCase().startsWith(product.name.toLowerCase() + ":"));
  const fillers = organ
    ? ["Authorized U.S. Khavinson retailer.", "Shop authentic peptide bioregulators online.", "Shop now."]
    : [
        "Authorized U.S. retailer of Khavinson peptides and longevity supplements.",
        "Shop authentic longevity supplements online.",
        "Shipped from the USA.",
        "Shop now.",
        "Order online.",
      ];
  let out = lead;
  // Product copy first (truncated to fit if needed), then generic fillers.
  for (const s of body) {
    const next = `${out} ${s}`;
    if (next.length <= META_DESCRIPTION_MAX) out = next;
    else {
      if (out.length < SNIPPET_MIN) out = truncateAtWord(next, META_DESCRIPTION_MAX);
      break;
    }
  }
  for (const s of fillers) {
    if (out.length >= SNIPPET_MIN) break;
    const next = `${out} ${s}`;
    if (next.length <= META_DESCRIPTION_MAX) out = next;
  }
  return out;
}

/**
 * Home > Shop > Product breadcrumb trail. Once the body-system pages are live
 * (CATEGORY_PAGES_LIVE) it becomes Home > Shop > <primary system> > Product.
 */
export function productBreadcrumbJsonLd(
  product: { id: string; name: string },
  live: boolean = CATEGORY_PAGES_LIVE
): Record<string, unknown> {
  const primary = live ? systemsForProduct(product.id)[0] : undefined;
  const trail: Array<{ name: string; item: string }> = [
    { name: "Home", item: `${SITE_URL}/` },
    { name: "Shop", item: canonicalUrl("/products") },
    ...(primary ? [{ name: primary.name, item: canonicalUrl(systemPath(primary.slug)) }] : []),
    { name: product.name, item: canonicalUrl(productPath(product.id)) },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, ...t })),
  };
}

/** FAQPage structured data: one Question/Answer per entry, plain text exactly as the page renders it. */
export function faqPageJsonLd(items: ReadonlyArray<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** FAQPage structured data from the written PDP FAQs (same text the page renders). */
export function productFaqJsonLd(id: string): Record<string, unknown>[] {
  // Rolled-out pages hide two FAQs; the schema must match what the page shows.
  const pdp = getPdpContent(id);
  const name = getProductFacts(id)?.name ?? "";
  const faq = pdp?.faq?.filter((f) => !isInjectableFaq(f.q) && (!isFormulaPreviewPdp(id) || !isPreviewRemovedFaq(name, f.q)));
  if (!faq?.length) return [];
  return [faqPageJsonLd(faq.map((f) => ({ question: f.q, answer: f.a })))];
}

/** Everything the <head> of a product page needs. */

export function productHead(product: SeoProduct) {
  const images = productImageUrls(product);
  return {
    title: productTitle(product),
    description: productSnippet(product),
    path: productPath(product.id),
    image: images[0],
    imageAlt: product.imageAlt || product.name,
    type: "product" as const,
    jsonLd: [productJsonLd(product), productBreadcrumbJsonLd(product), ...productFaqJsonLd(product.id)],
  };
}

// ─── Site-wide structured data: one business entity ──────────────────────────

/**
 * ONE business entity for the whole site: an OnlineStore (Julia, 2026-11-12:
 * "it's an online store") with this @id on every page (home, /about,
 * /about/authorized-retailer, returns). Product sellers and article
 * publishers point to it by @id, so search engines see a single store.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const JULIA_PERSON_ID = `${SITE_URL}/#julia-shulman`;
export const BENJAMIN_PERSON_ID = `${SITE_URL}/#benjamin-peker`;

/** Reference to the store from other nodes (Offer.seller, Article.publisher/author). */
export const ORGANIZATION_REF: Record<string, unknown> = {
  "@type": "OnlineStore",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
};

/** Reference to Julia from other nodes (Article.author). Full node: PEOPLE.julia. */
export const JULIA_PERSON_REF: Record<string, unknown> = {
  "@type": "Person",
  "@id": JULIA_PERSON_ID,
  name: "Julia Shulman",
};

/**
 * The people behind the store, each with a stable @id. No. 296389 is Julia's
 * Peptides Company registration, so it sits on her Person node.
 */
export const PEOPLE = {
  julia: {
    "@type": "Person",
    "@id": JULIA_PERSON_ID,
    name: "Julia Shulman",
    jobTitle: "Co-Founder",
    worksFor: { "@id": ORGANIZATION_ID },
    identifier: {
      "@type": "PropertyValue",
      name: "Peptides Company Consultant ID",
      value: RETAILER_NUMBER,
    },
  },
  benjamin: {
    "@type": "Person",
    "@id": BENJAMIN_PERSON_ID,
    name: "Benjamin Peker",
    jobTitle: "Co-Founder",
    worksFor: { "@id": ORGANIZATION_ID },
  },
} as const satisfies Record<string, Record<string, unknown>>;
export type PersonKey = keyof typeof PEOPLE;

/**
 * Which founders each page lists. Kept as it was before the entity merge
 * (2026-11-12); change a page's list here. Pages not listed carry no founder.
 */
export const FOUNDERS_BY_PAGE: Record<"home" | "about" | "authorizedRetailer", readonly PersonKey[]> = {
  home: [],
  about: ["julia", "benjamin"],
  authorizedRetailer: ["julia"],
};

/**
 * The full store node. Facts only from the site itself: name, url, logo,
 * contact@ (general) and support@ (customer support) emails, the phone shown
 * in the footer and FAQ, Brooklyn NY (no street). No awards, certifications,
 * sameAs or third-party verification.
 */
export function organizationNode(founders: readonly PersonKey[] = []): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@type": "OnlineStore",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}${DEFAULT_SHARE_IMAGE}`,
    description:
      "Authorized U.S. retailer of Khavinson peptide bioregulators (Cytomax and Cytogen). Sources directly from the manufacturer.",
    email: CONTACT_EMAIL,
    telephone: "+1-315-567-7931",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        telephone: "+1-315-567-7931",
        availableLanguage: "English",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      addressCountry: "US",
    },
  };
  if (founders.length) node.founder = founders.map((k) => PEOPLE[k]);
  return node;
}

/** The WebSite node; its publisher is the store. */
export function websiteNode(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Home page: the store and the WebSite in one @graph. */
export function homeJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(FOUNDERS_BY_PAGE.home), websiteNode()],
  };
}

/** About page: the store (with its co-founders) and the WebSite in one @graph. */
export function aboutOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(FOUNDERS_BY_PAGE.about), websiteNode()],
  };
}
