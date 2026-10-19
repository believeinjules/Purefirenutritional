/** JSON-LD for the list + body-system pages (CollectionPage > ItemList, BreadcrumbList). Pure functions. */
import { SITE_URL, canonicalUrl, productPath } from "./index";

export type Crumb = { name: string; path: string };

export function collectionPageJsonLd(opts: {
  name: string;
  path: string;
  description: string;
  items: ReadonlyArray<{ id: string; name: string }>;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    url: canonicalUrl(opts.path),
    description: opts.description,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonicalUrl(productPath(p.id)),
        name: p.name,
      })),
    },
  };
}

export function breadcrumbJsonLd(crumbs: ReadonlyArray<Crumb>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonicalUrl(c.path),
    })),
  };
}
