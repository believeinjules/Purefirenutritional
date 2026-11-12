/**
 * Structured data for /about/authorized-retailer. Same @ids as the About page
 * Organization and the Returns page OnlineStore (#organization) and the home
 * page WebSite (#website), so search engines merge them into one entity.
 *
 * Deliberately NOT used: hasCredential / EducationalOccupationalCredential /
 * recognizedBy. No document on file names the issuer, a credential number or a
 * public registry, and schema.org credentials imply a verifiable third-party
 * credential. The authorization is stated in plain words (description) only.
 * No. 296389 is Julia's registration, so it sits on her Person node (founder),
 * not on the store (Julia, 2026-11-12: "the number is associated with my name").
 */
import { SITE_NAME, SITE_URL, DEFAULT_SHARE_IMAGE, canonicalUrl } from "./index";
import {
  AUTHORIZED_RETAILER_PATH,
  AUTHORIZED_RETAILER_TITLE,
  PARTNER_REGISTRATION,
  RETAILER_NUMBER,
} from "@/data/retailerAuthorization";

export const AUTHORIZED_RETAILER_DESCRIPTION =
  "Pure Fire Nutritional is an authorized U.S. retailer of Khavinson peptide bioregulators, based in Brooklyn, NY. Our retailer details, documentation and how to check them.";

export function authorizedRetailerJsonLd(): Record<string, unknown> {
  const url = canonicalUrl(AUTHORIZED_RETAILER_PATH);
  const orgId = `${SITE_URL}/#organization`;
  const store: Record<string, unknown> = {
    "@type": "OnlineStore",
    "@id": orgId,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}${DEFAULT_SHARE_IMAGE}`,
    description:
      "Authorized U.S. retailer of Khavinson peptide bioregulators (Cytomax and Cytogen). Sources directly from the manufacturer.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      addressCountry: "US",
    },
  };
  store.founder = {
    "@type": "Person",
    name: PARTNER_REGISTRATION.name,
    jobTitle: "Co-Founder",
    identifier: {
      "@type": "PropertyValue",
      name: "Peptides Company Consultant ID",
      value: RETAILER_NUMBER,
    },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: AUTHORIZED_RETAILER_TITLE,
        description: AUTHORIZED_RETAILER_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": orgId },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      store,
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
