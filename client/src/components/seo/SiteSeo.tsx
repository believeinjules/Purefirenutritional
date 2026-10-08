import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { absoluteUrl, DEFAULT_SHARE_IMAGE, routeHead, SITE_NAME } from "@/lib/seo";
import PageSeo from "./PageSeo";

/**
 * Site-wide <head> defaults (rendered once, above the router). Page-level
 * <PageSeo /> / <Helmet> tags rendered later override these.
 */
export default function SiteSeo() {
  const [location] = useLocation();
  const route = routeHead(location);
  const defaultImage = absoluteUrl(DEFAULT_SHARE_IMAGE);

  return (
    <>
      <Helmet>
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={defaultImage} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={defaultImage} />
      </Helmet>
      {route && (
        <PageSeo
          title={route.title}
          description={route.description}
          path={route.noindex ? undefined : location}
          noindex={route.noindex}
        />
      )}
    </>
  );
}
