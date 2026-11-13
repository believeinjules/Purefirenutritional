/**
 * Structured data for /about/authorized-retailer. Same @ids as the About page
 * Organization and the Returns page OnlineStore (#organization) and the home
 * page WebSite (#website), so search engines merge them into one entity.
 *
 * Deliberately NOT used: hasCredential / EducationalOccupationalCredential /
 * recognizedBy. No document on file names the issuer, a credential number or a
 * public registry, and schema.org credentials imply a verifiable third-party
 * credential. The authorization is stated in plain words (description) only.
 * The store node is the shared organizationNode(); founders come from
 * FOUNDERS_BY_PAGE.authorizedRetailer. No. 296389 is Julia's registration, so it
 * sits on her Person node (PEOPLE.julia, @id #julia-shulman), not on the store
 * (Julia, 2026-11-12: "the number is associated with my name").
 */
import {
  SITE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  FOUNDERS_BY_PAGE,
  organizationNode,
  canonicalUrl,
} from "./index";
import { AUTHORIZED_RETAILER_PATH, AUTHORIZED_RETAILER_TITLE } from "@/data/retailerAuthorization";
import { requirePageHead } from "./publicHeads";

export const AUTHORIZED_RETAILER_DESCRIPTION = requirePageHead("/about/authorized-retailer").description;

export function authorizedRetailerJsonLd(): Record<string, unknown> {
  const url = canonicalUrl(AUTHORIZED_RETAILER_PATH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: AUTHORIZED_RETAILER_TITLE,
        description: AUTHORIZED_RETAILER_DESCRIPTION,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      organizationNode(FOUNDERS_BY_PAGE.authorizedRetailer),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "About", item: canonicalUrl("/about") },
          { "@type": "ListItem", position: 3, name: AUTHORIZED_RETAILER_TITLE, item: url },
        ],
      },
    ],
  };
}
