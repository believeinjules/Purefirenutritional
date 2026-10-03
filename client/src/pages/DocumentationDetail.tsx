import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CertificateViewer from "@/components/documentation/CertificateViewer";
import { getPublishedCertificateBySlug } from "@/data/certificates";

const ABOUT =
  "Documents are presented in their original form wherever possible. English translations are provided for accessibility and convenience. Regulatory documents reflect the classifications and requirements of the issuing jurisdiction and should not be interpreted as FDA approval or as evidence that a product is intended to diagnose, treat, cure, or prevent disease.";

export default function DocumentationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const record = slug ? getPublishedCertificateBySlug(slug) : undefined;

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f3ee]">
        <Navigation />
        <main className="flex-1 max-w-3xl mx-auto px-5 py-24">
          <h1 className="text-2xl text-stone-900">Document not available</h1>
          <p className="mt-4 text-stone-600">
            This page only opens a certificate whose registration number, date, product name, and original image agree.
          </p>
          <Link href="/documentation" className="mt-8 inline-block text-sm uppercase tracking-[0.16em]">
            Back to documentation
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-stone-900">
      <Helmet>
        <title>{record.seoTitle}</title>
        <meta
          name="description"
          content={`${record.productNameOnCertificate} EAEU Certificate of State Registration ${record.registrationNumber}, dated ${record.registrationDateDisplay}, with an English translation of the original.`}
        />
        <link rel="canonical" href={`https://www.purefirenutritional.com/documentation/${record.slug}`} />
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
          <Link href="/documentation" className="text-xs uppercase tracking-[0.18em] text-stone-500 hover:text-stone-900">
            Product Documentation
          </Link>
          <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            EAEU Certificate of State Registration
          </p>
          <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight">
            {record.productNameOnCertificate}
          </h1>
          <p className="mt-3 text-sm text-stone-500">
            {record.registrationDateDisplay}
            <span className="mx-2">·</span>
            <span className="break-all">{record.registrationNumber}</span>
          </p>
          {record.siteProductId ? (
            <Link
              href={`/products/${record.siteProductId}`}
              className="mt-6 inline-block text-xs uppercase tracking-[0.16em] text-stone-700 border-b border-stone-300 pb-1"
            >
              View product
            </Link>
          ) : null}

          <div className="mt-12">
            <CertificateViewer record={record} />
          </div>

          <section className="mt-16 max-w-2xl">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-stone-500">About these documents</h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{ABOUT}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
