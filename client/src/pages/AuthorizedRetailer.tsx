import { Link } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PeptidesCompanyVerification from "@/components/trust/PeptidesCompanyVerification";
import { PARTNER_DOC_JPG, PARTNER_DOC_WEBP } from "@/components/about/SupplierRelationship";
import { SUPPORT_EMAIL, mailto } from "@shared/contact-emails";
import { isUsableUrl } from "@/data/siteConfig";
import {
  AUTHORIZED_RETAILER_PATH,
  AUTHORIZED_RETAILER_TITLE,
  MANUFACTURER_VERIFICATION_URL,
  PARTNER_REGISTRATION,
} from "@/data/retailerAuthorization";
import { AUTHORIZED_RETAILER_DESCRIPTION, authorizedRetailerJsonLd } from "@/lib/seo/authorizedRetailer";
import { requirePageHead } from "@/lib/seo/publicHeads";

/**
 * /about/authorized-retailer (Julia, 2026-11-12). Styling follows /authenticity
 * (eyebrow, serif heading, one narrow text column). Every fact is HTML text.
 */
const h2 = "text-[11px] uppercase tracking-[0.22em] text-stone-500";
const p = "mt-4 text-base leading-relaxed text-stone-700";
const a = "underline underline-offset-2 hover:text-stone-900";

export default function AuthorizedRetailer() {
  const verifyUrl = isUsableUrl(MANUFACTURER_VERIFICATION_URL) ? MANUFACTURER_VERIFICATION_URL : null;
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-stone-900">
      <PageSeo
        title={requirePageHead("/about/authorized-retailer").title}
        description={AUTHORIZED_RETAILER_DESCRIPTION}
        path={AUTHORIZED_RETAILER_PATH}
        type="website"
        jsonLd={[authorizedRetailerJsonLd()]}
      />
      <Navigation />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-16 md:py-24" data-testid="authorized-retailer-page">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
            <Link href="/about" className="hover:text-stone-900">About</Link>
            <span aria-hidden="true"> / </span>
            <span>Retailer Authorization</span>
          </nav>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl font-normal tracking-tight text-stone-900">
            {AUTHORIZED_RETAILER_TITLE}
          </h1>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-600">
            Pure Fire Nutritional is an authorized U.S. retailer of Khavinson peptide bioregulators. This page sets
            out who we are, the documentation we hold, and how you can check it.
          </p>

          {/* 1. Identity */}
          <section className="mt-14" aria-labelledby="retailer-identity">
            <h2 id="retailer-identity" className={h2}>Registered retailer</h2>
            <dl className="mt-5 divide-y divide-stone-200 border-y border-stone-200 text-sm" data-testid="retailer-identity">
              {[
                ["Retailer", "Pure Fire Nutritional"],
                ["Location", "Brooklyn, NY"],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="font-medium text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Our Relationship with Peptides Company + verification box (Julia, 2026-11-12) */}
          <PeptidesCompanyVerification />

          {/* 2. Documentation */}
          <section className="mt-14" aria-labelledby="authorization-documentation">
            <h2 id="authorization-documentation" className={h2}>Documentation</h2>
            <p className={p} data-testid="registered-to">
              Registered to {PARTNER_REGISTRATION.name}, No. {PARTNER_REGISTRATION.number}, since{" "}
              {PARTNER_REGISTRATION.registered}. The profile record, with an English translation, is below.
            </p>
            {/* Same collapsed dropdown pattern as the About page supplier section */}
            <details className="mt-6" data-testid="partner-documentation">
              <summary className="cursor-pointer text-sm font-medium text-stone-800 underline hover:text-stone-600">
                View Partner Documentation
              </summary>
              <figure className="mt-4" data-testid="partner-documentation-figure">
                <picture>
                  <source srcSet={PARTNER_DOC_WEBP} type="image/webp" />
                  <img
                    src={PARTNER_DOC_JPG}
                    alt={`Partner profile record, in Russian: ${PARTNER_REGISTRATION.name}, No. ${PARTNER_REGISTRATION.number}, registered ${PARTNER_REGISTRATION.registered}`}
                    width={1082}
                    height={695}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto rounded-lg border border-stone-200 bg-white"
                  />
                </picture>
                <figcaption className="mt-2 text-sm text-stone-600">
                  Partner profile (Russian). Translation: Full name: Shulman Julia; Partner number: {PARTNER_REGISTRATION.number};
                  Activity threshold: Met; Registration date: {PARTNER_REGISTRATION.registered}.
                </figcaption>
              </figure>
            </details>
            <p className={p}>
              Product registration documents, with English translations, are in our{" "}
              <Link href="/authenticity" className={a}>authenticity library</Link>.
            </p>
          </section>

          {/* 3. Sourcing and distribution */}
          <section className="mt-14" aria-labelledby="sourcing">
            <h2 id="sourcing" className={h2}>How we source and sell</h2>
            <p className={p}>
              Pure Fire Nutritional sources directly from the manufacturer, with an established purchasing
              relationship dating back to April 2023. We sell to customers through this website, and every product we sell
              carries a lot number, an expiry date, and a certificate of analysis.
            </p>
          </section>

          {/* 4. How to verify */}
          <section className="mt-14" aria-labelledby="verify">
            <h2 id="verify" className={h2}>How to check</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-stone-700">
              <li>Check the lot number and expiry date on your package.</li>
              <li>
                Email{" "}
                <a href={mailto(SUPPORT_EMAIL)} className={a}>{SUPPORT_EMAIL}</a>{" "}
                with the lot number to request the certificate of analysis for that batch, or with any question
                about our retailer status.
              </li>
              <li>
                Compare your product with the registration documents in our{" "}
                <Link href="/authenticity" className={a}>authenticity library</Link>.
              </li>
              {verifyUrl && (
                <li>
                  Confirm our retailer status directly with the manufacturer:{" "}
                  <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className={a}>
                    manufacturer verification
                  </a>
                  .
                </li>
              )}
            </ol>
          </section>

          <p className="mt-16 text-xs leading-relaxed text-stone-500">
            Documents are shown for transparency about sourcing. They are not FDA approval and are not evidence that
            a product is intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
