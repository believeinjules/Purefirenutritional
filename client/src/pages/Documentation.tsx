import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  DOCUMENT_KIND_LABEL,
  publishedCertificates,
  type ProductLine,
} from "@/data/certificates";

const FILTERS: Array<"All Documentation" | ProductLine> = [
  "All Documentation",
  "Prime Peptide",
  "Revilab",
  "Other",
];

const ABOUT =
  "Documents are presented in their original form wherever possible. English translations are provided for accessibility and convenience. Regulatory documents reflect the classifications and requirements of the issuing jurisdiction and should not be interpreted as FDA approval or as evidence that a product is intended to diagnose, treat, cure, or prevent disease.";

export default function Documentation() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All Documentation");

  const records = useMemo(() => {
    if (filter === "All Documentation") return publishedCertificates;
    return publishedCertificates.filter((record) => record.productLine === filter);
  }, [filter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-stone-900">
      <Helmet>
        <title>Product Documentation | Pure Fire Nutritional</title>
        <meta
          name="description"
          content="Original EAEU Certificates of State Registration for Pure Fire Nutritional products, shown with English translations. Not FDA approval."
        />
        <link rel="canonical" href="https://www.purefirenutritional.com/documentation" />
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Product Documentation</p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl font-normal tracking-tight text-stone-900 max-w-3xl">
            Know what you’re buying. Know where it came from.
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-stone-600">
            We believe customers should be able to see the documentation associated with the products we carry. This library provides original product registration documents together with English translations for easier review.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-500">
            Shown here: EAEU Certificates of State Registration. A registration certificate is not a certificate of analysis, and it is not evidence of a clinical result.
          </p>

          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-b border-stone-200 pb-4">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`text-xs uppercase tracking-[0.18em] pb-1 border-b ${
                  filter === item
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                {item === "All Documentation" ? "All Documentation" : item}
              </button>
            ))}
          </div>

          {records.length === 0 ? (
            <p className="mt-16 text-stone-500">No documents in this category yet.</p>
          ) : (
            <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {records.map((record) => (
                <li key={record.registrationNumber} className="bg-white border border-stone-200 px-7 py-8 flex flex-col">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{record.productLine}</p>
                  <h2 className="mt-3 text-xl tracking-[0.08em] uppercase text-stone-900">
                    {record.productNameOnCertificate}
                  </h2>
                  <p className="mt-4 text-sm text-stone-700">{DOCUMENT_KIND_LABEL[record.documentKind]}</p>
                  <p className="text-sm text-stone-500">{record.registrationDateDisplay}</p>
                  <dl className="mt-6 text-sm">
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Registration No.</dt>
                    <dd className="mt-1 text-stone-900 break-all">{record.registrationNumber}</dd>
                    <dt className="mt-4 text-[11px] uppercase tracking-[0.18em] text-stone-400">Manufactured in {record.manufacturerCountry}</dt>
                    <dd className="mt-1 text-stone-800">PNK Farmaceutici SpA</dd>
                  </dl>
                  <p className="mt-4 text-xs text-stone-400">State registration on file</p>
                  <Link
                    href={`/documentation/${record.slug}`}
                    className="mt-8 text-xs uppercase tracking-[0.18em] text-stone-900"
                  >
                    View certificate &amp; translation →
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <section className="mt-20 max-w-2xl">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-stone-500">About these documents</h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{ABOUT}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
