import { Helmet } from "react-helmet-async";
import { absoluteUrl, canonicalUrl, SITE_NAME } from "@/lib/seo";

export type PageSeoProps = {
  title: string;
  description?: string;
  /** Route path for canonical + og:url (e.g. "/products/bonomarlot"). Omit on noindex pages. */
  path?: string;
  /** Share image (site path or absolute URL). Falls back to the site default from <SiteSeo />. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Array<Record<string, unknown>>;
};

/**
 * Per-page <head> tags: title, meta description, canonical, Open Graph,
 * Twitter card and JSON-LD. Renders nothing visible. Later Helmet instances
 * override earlier ones, so this wins over the site defaults in <SiteSeo />.
 */
export default function PageSeo({
  title,
  description,
  path,
  image,
  imageAlt,
  type,
  noindex,
  jsonLd,
}: PageSeoProps) {
  const url = path && !noindex ? canonicalUrl(path) : undefined;
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, follow" />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {type && <meta property="og:type" content={type} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      {imageUrl && <meta name="twitter:card" content="summary_large_image" />}
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {(jsonLd ?? []).map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld).replace(/</g, "\\u003c")}
        </script>
      ))}
    </Helmet>
  );
}
