import { useState } from "react";
import type { CertificateRecord } from "@/data/certificates";
import { DOCUMENT_KIND_LABEL } from "@/data/certificates";
import CertificateTranslation from "./CertificateTranslation";

export default function CertificateViewer({ record }: { record: CertificateRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <figure>
          <figcaption className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500 mb-3">
            Original document
          </figcaption>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full text-left group"
          >
            <img
              src={record.imageSrc}
              alt={`Original EAEU certificate ${record.registrationNumber} for ${record.productNameOnCertificate}`}
              className="w-full h-auto border border-stone-200 bg-white shadow-sm"
            />
            <span className="mt-3 inline-block text-xs tracking-[0.16em] uppercase text-stone-500 group-hover:text-stone-900">
              Tap to inspect full size
            </span>
          </button>
        </figure>

        <div className="lg:pt-0">
          <CertificateTranslation record={record} />
        </div>
      </div>

      <p className="mt-10 text-xs uppercase tracking-[0.18em] text-stone-400">
        {DOCUMENT_KIND_LABEL[record.documentKind]} · Registration No. {record.registrationNumber}
      </p>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-stone-950/80 overflow-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Original certificate"
          onClick={() => setOpen(false)}
        >
          <div className="min-h-full flex flex-col items-center p-4 md:p-10">
            <button
              type="button"
              className="mb-4 text-xs uppercase tracking-[0.2em] text-white/80 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <img
              src={record.imageSrc}
              alt={`Full-size original certificate ${record.registrationNumber}`}
              className="bg-white max-w-none w-[min(1191px,140vw)] h-auto"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
