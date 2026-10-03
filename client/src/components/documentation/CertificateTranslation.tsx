import type { ReactNode } from "react";
import type { CertificateRecord } from "@/data/certificates";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-stone-200 pt-5">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500 mb-2">
        {title}
      </h3>
      <div className="text-[15px] leading-relaxed text-stone-800 space-y-2">{children}</div>
    </section>
  );
}

export default function CertificateTranslation({ record }: { record: CertificateRecord }) {
  return (
    <article className="bg-white">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
        English Translation
      </p>
      <p className="mt-3 text-sm leading-relaxed text-stone-600 border border-stone-200 bg-stone-50 px-4 py-3">
        Translation provided for convenience. The original-language document shown alongside it is the source document.
      </p>

      <header className="mt-8 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
          {record.issuingLaboratory}
        </p>
        <p className="text-sm text-stone-700">{record.issuingAuthority}</p>
        <p className="pt-6 text-[12px] uppercase tracking-[0.28em] text-stone-500">
          Eurasian Economic Union
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-stone-900">
          Certificate of State Registration of a Product
        </h2>
        <dl className="pt-4 grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-y-2 gap-x-4 text-sm">
          <dt className="text-stone-500">Registration No.</dt>
          <dd className="font-medium text-stone-900 break-all">{record.translationRegistrationNumber}</dd>
          <dt className="text-stone-500">Date</dt>
          <dd className="text-stone-900">{record.registrationDateOnDocument}</dd>
          <dt className="text-stone-500">Original language</dt>
          <dd className="text-stone-900">{record.originalLanguage}</dd>
          <dt className="text-stone-500">Certificate serial No.</dt>
          <dd className="text-stone-900">{record.certificateSerialNumber}</dd>
        </dl>
      </header>

      <div className="mt-8 space-y-5">
        <Block title="Product">
          <p>Biologically active food supplement «{record.productNameAsPrinted}».</p>
          <p>Form of release: {record.formOfRelease}</p>
          <p>{record.manufacturedAccordingTo}</p>
          <p>
            {record.appendixReference}{" "}
            <span className="text-stone-500">
              Appendix 1 was not included with the supplied document. Its contents are not shown.
            </span>
          </p>
        </Block>

        <Block title="Manufacturer">
          <p>{record.manufacturer}</p>
          <p>Country of manufacture stated on the certificate: {record.manufacturerCountry}.</p>
        </Block>

        <Block title="Licensor, as stated">
          <p>{record.licensor}</p>
        </Block>

        <Block title="Commissioning company, as stated">
          <p>{record.commissioningCompany}</p>
        </Block>

        <Block title="Applicant">
          <p>{record.applicant}</p>
          <p>OGRN: {record.applicantOgrn}</p>
        </Block>

        <Block title="Complies with">
          <ul className="list-disc pl-5 space-y-1">
            {record.standards.map((standard) => (
              <li key={standard}>{standard}</li>
            ))}
          </ul>
        </Block>

        <Block title="Certificate issued on the basis of">
          <p className="text-stone-500 text-sm">{record.basisIntro}</p>
          <ol className="space-y-4 list-decimal pl-5">
            {record.basis.map((item) => (
              <li key={`${item.label}-${item.number}`}>
                <p>
                  <span className="text-stone-500">{item.label}.</span> No. {item.number}, dated {item.date}.
                </p>
                <p>{item.issuedBy}</p>
                {item.accreditation ? <p>{item.accreditation}</p> : null}
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Validity">
          <p>{record.validity}</p>
        </Block>

        <Block title="Signed">
          <p>{record.signatoryRole}</p>
          <p>{record.signatoryName}</p>
          <p className="text-stone-500 text-sm">{record.signatoryRoleNote}</p>
        </Block>
      </div>
    </article>
  );
}
