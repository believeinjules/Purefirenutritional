/**
 * Head tags + structured data for Prime Peptide mixed-bundle pages
 * (/bundles/<slug>, shared/mixed-bundles.ts), built to match product pages:
 * same canonical host, title pattern, OG/Twitter, Product + BreadcrumbList
 * JSON-LD, seller, shipping details and condition.
 *
 * Google (merchant listing docs, 2026-09): a retailer-made bundle is one
 * Product with its own offer. There is no schema.org bundle property
 * (Merchant Center's is_bundle is feed-only and needs a "main product", which
 * these bundles don't have), so components are linked with schema.org
 * `isRelatedTo` to each product page's Product @id. No ratings / reviews
 * (no bundle reviews exist) and no wording beyond the approved description.
 *
 * Everything is gated on `bundle.live`: drafts get noindex and no canonical.
 */
import { getProductById } from "@/data/products";
import { resolveFulfillment } from "@shared/fulfillment";
import {
  MIXED_BUNDLES,
  PRIME_PRODUCT_NAMES,
  bundleLifestyleImage,
  bundlePath,
  groupBottlesAlt,
  type MixedBundle,
} from "@shared/mixed-bundles";
import {
  ORGANIZATION_REF,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  canonicalUrl,
  offerShippingDetails,
  productBrand,
  productPath,
} from "./index";

const IN_STOCK = "https://schema.org/InStock";
const OUT_OF_STOCK = "https://schema.org/OutOfStock";
const BACK_ORDER = "https://schema.org/BackOrder";

export function bundleTitle(bundle: Pick<MixedBundle, "name">): string {
  return `${bundle.name} | ${SITE_NAME}`;
}

/** Absolute URL of the bundle's lifestyle photo (all its bottles together). */
export function bundleLifestyleUrl(bundle: MixedBundle): string {
  return absoluteUrl(bundleLifestyleImage(bundle.slug));
}

/** Absolute URLs of every bottle photo in the bundle, in display order. */
export function bundleImageUrls(bundle: MixedBundle): string[] {
  return bundle.productIds
    .map((id) => getProductById(id)?.image)
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => absoluteUrl(x.trim()));
}

/** Out of stock if any bottle is; back order if any bottle ships later; otherwise in stock. */
export function bundleAvailability(bundle: MixedBundle): string {
  const items = bundle.productIds.map((id) => getProductById(id) as { in_stock?: boolean; fulfillment?: string } | undefined);
  if (items.some((p) => !p || p.in_stock === false)) return OUT_OF_STOCK;
  const all = bundle.productIds.map((id, i) => resolveFulfillment(id, items[i]?.fulfillment));
  return all.every((f) => f === "in_stock") ? IN_STOCK : BACK_ORDER;
}

export function bundleJsonLd(bundle: MixedBundle): Record<string, unknown> {
  const url = canonicalUrl(bundlePath(bundle.slug));
  const availability = bundleAvailability(bundle);
  const brand = productBrand(bundle.productIds[0]!);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: bundle.name,
    description: bundle.metaDescription,
    url,
    sku: `bundle-${bundle.slug}`,
    // Lifestyle photo first (all bottles together), then each bottle photo.
    image: [bundleLifestyleUrl(bundle), ...bundleImageUrls(bundle)],
    category: "PEPTIDE BIOREGULATORS",
    isRelatedTo: bundle.productIds.map((id) => ({
      "@type": "Product",
      "@id": `${canonicalUrl(productPath(id))}#product`,
      name: PRIME_PRODUCT_NAMES[id] ?? id,
      url: canonicalUrl(productPath(id)),
    })),
    offers: {
      "@type": "Offer",
      url,
      sku: `bundle-${bundle.slug}`,
      priceCurrency: "USD",
      price: bundle.priceUSD.toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: ORGANIZATION_REF,
      shippingDetails: offerShippingDetails(bundle.priceUSD, availability === IN_STOCK),
    },
  };
  if (brand) ld.brand = { "@type": "Brand", name: brand };
  return ld;
}

/** Home > Shop > <Bundle>, like product pages. */
export function bundleBreadcrumbJsonLd(bundle: MixedBundle): Record<string, unknown> {
  const trail = [
    { name: "Home", item: `${SITE_URL}/` },
    { name: "Shop", item: canonicalUrl("/products") },
    { name: bundle.name, item: canonicalUrl(bundlePath(bundle.slug)) },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, ...t })),
  };
}

/** Everything PageSeo needs for a bundle page. Drafts: noindex, no canonical, no JSON-LD. */
export function bundleHead(bundle: MixedBundle) {
  return {
    title: bundleTitle(bundle),
    description: bundle.metaDescription,
    path: bundlePath(bundle.slug),
    image: bundleLifestyleUrl(bundle),
    imageAlt: groupBottlesAlt(bundle),
    type: "product" as const,
    noindex: !bundle.live,
    jsonLd: bundle.live ? [bundleJsonLd(bundle), bundleBreadcrumbJsonLd(bundle)] : [],
  };
}

/** Prerender / sitemap / llms / IndexNow source: live bundles only. */
export function liveBundleRoutes(list: readonly MixedBundle[] = MIXED_BUNDLES): string[] {
  return list.filter((b) => b.live).map((b) => bundlePath(b.slug));
}

/** Extra llms.txt section for live bundles ("" while none is live). Uses only approved text. */
export function llmsBundleSection(list: readonly MixedBundle[] = MIXED_BUNDLES): string {
  const live = list.filter((b) => b.live);
  if (!live.length) return "";
  const lines = live.map((b) => `- [${b.name}](${canonicalUrl(bundlePath(b.slug))}): ${b.metaDescription}`);
  return `\n## Bundles\n\n${lines.join("\n")}\n`;
}
