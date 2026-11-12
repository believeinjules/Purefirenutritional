import { useEffect } from "react";
import { PEPTIDES_COMPANY_HREF } from "@/components/trust/PeptidesCompanyVerification";

/**
 * "Our Supplier Relationship" section on /about (Julia, 2026-11-12).
 *
 * - All facts render as HTML text so crawlers and the prerender see them.
 * - No supplier website, domain or referral link appears here (Julia, 2026-11-12).
 * - Documentation image: Julia's partner-profile screenshot, cropped, at
 *   client/public/images/sourcing/partner-profile.webp (+ partner-profile.jpg),
 *   1082 × 695 (supplied 2026-11-12; right edge trimmed 3 px, metadata stripped).
 */
export const SUPPLIER_SECTION_ID = "supplier-relationship";
export const SUPPLIER_SECTION_HREF = `/about#${SUPPLIER_SECTION_ID}`;
export const SUPPLIER_LINK_TEXT = "Verified Sourcing & Partner Information";

export const PARTNER_DOC_WEBP = "/images/sourcing/partner-profile.webp";
export const PARTNER_DOC_JPG = "/images/sourcing/partner-profile.jpg";
export const PARTNER_DOC_ALT =
  "Partner profile screenshot from the supplier partner dashboard showing Julia Shulman, partner number 296389, registered April 21, 2023";

export const PARTNER_DETAILS: Array<[string, string]> = [
  ["Registered partner", "Julia Shulman"],
  ["Partner number", "296389"],
  ["Registration date", "April 21, 2023"],
];

/** Scrolls to the section when the page loads with #supplier-relationship. */
function useScrollToHash() {
  useEffect(() => {
    const go = () => {
      if (window.location.hash !== `#${SUPPLIER_SECTION_ID}`) return;
      requestAnimationFrame(() => document.getElementById(SUPPLIER_SECTION_ID)?.scrollIntoView());
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);
}

export default function SupplierRelationship() {
  useScrollToHash();
  return (
    <section id={SUPPLIER_SECTION_ID} className="py-20 scroll-mt-24" data-testid="supplier-relationship">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">Our Supplier Relationship</h2>
        <p className="text-lg text-gray-600 mb-6">
          Pure Fire Nutritional sources directly from the manufacturer, with an established purchasing relationship dating back to April 2023.
        </p>
        <p className="text-lg text-gray-600 mb-6">
          Our co-founder, Julia Shulman, is registered under Partner No. 296389, with documented ongoing purchasing activity through the supplier’s partner system.
        </p>
        <p className="text-lg text-gray-600 mb-6">
          We believe transparency about sourcing is essential to helping customers make informed purchasing decisions.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          No. 296389 is also our Authorized Khavinson Peptide Retailer number.{" "}
          <a href={PEPTIDES_COMPANY_HREF} className="text-gray-800 underline underline-offset-2 hover:text-amber-600" data-testid="peptides-company-link">
            Pure Fire Nutritional maintains a direct, independently verifiable consultant relationship with Peptides Company.
          </a>
        </p>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">Partner details</p>
          <dl className="text-sm text-gray-600 space-y-1 ml-4">
            {PARTNER_DETAILS.map(([label, value]) => (
              <div key={label} className="flex flex-wrap gap-x-1">
                <dt>{label}:</dt>
                <dd className="font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <details className="mt-8" data-testid="partner-documentation">
          <summary className="cursor-pointer text-sm font-medium text-gray-800 underline hover:text-amber-600">
            View Partner Documentation
          </summary>
          <figure className="mt-4">
            <picture>
              <source srcSet={PARTNER_DOC_WEBP} type="image/webp" />
              <img
                src={PARTNER_DOC_JPG}
                alt={PARTNER_DOC_ALT}
                width={1082}
                height={695}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-lg border border-gray-200"
              />
            </picture>
            <figcaption className="mt-2 text-sm text-gray-600">
              Partner profile screenshot from the supplier’s partner dashboard (Russian). Translation: Full name: Shulman Julia; Partner number: 296389; Activity threshold: Met; Registration date: April 21, 2023.
            </figcaption>
          </figure>
        </details>
      </div>
    </section>
  );
}
