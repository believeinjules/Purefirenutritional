import { Link } from "wouter";
import { getPublishedCertificateByProductId } from "@/data/certificates";

/**
 * Product-page link only. Translation text stays on the certificate record.
 */
export default function AuthenticityDocumentation({ productId }: { productId: string }) {
  const record = getPublishedCertificateByProductId(productId);
  if (!record) return null;

  return (
    <section className="mt-12 border border-stone-200 bg-[#faf8f5] px-6 py-7 md:px-8">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500">
        Authenticity &amp; Documentation
      </h2>
      <p className="mt-3 text-stone-800">Original product documentation, available for review.</p>
      <p className="mt-4 text-sm text-stone-700">EAEU State Registration Documentation</p>
      <p className="mt-1 text-sm text-stone-500">
        Registration No. <span className="text-stone-900">{record.registrationNumber}</span>
      </p>
      {record.catalogNameDifference ? (
        <p className="mt-3 text-sm text-stone-500">
          The certificate names this product “{record.productNameOnCertificate}”.
        </p>
      ) : null}
      <Link
        href={`/documentation/${record.slug}`}
        className="mt-5 inline-block text-xs uppercase tracking-[0.18em] text-stone-900 border-b border-stone-400 pb-1 hover:border-stone-900"
      >
        View certificate &amp; English translation →
      </Link>
    </section>
  );
}
