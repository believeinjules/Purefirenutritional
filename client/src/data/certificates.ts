/**
 * One record per original certificate. The registration number is the id.
 * The English fields below were read from that record's own image.
 * Do not copy a translation onto a different registration number.
 * Records that fail assertCertificateRecord() are withheld from the public list.
 */

export type DocumentKind =
  | "state-registration"
  | "coa"
  | "manufacturer"
  | "ingredient-spec"
  | "batch";

export type ProductLine = "Prime Peptide" | "Revilab" | "Other";

export type BasisEntry = {
  /** What the certificate itself calls this item. */
  label: "Test protocol" | "Expert conclusion" | "Listed number";
  number: string;
  date: string;
  issuedBy: string;
  accreditation?: string;
};

export type CertificateRecord = {
  /** Primary id. Must equal the number printed on the image. */
  registrationNumber: string;
  /** Same number, stored on the translation so a mismatch can be detected. */
  translationRegistrationNumber: string;
  slug: string;
  productLine: ProductLine;
  documentKind: DocumentKind;
  /** English product name printed on this certificate, not the shop catalog name. */
  productNameOnCertificate: string;
  /** Name as printed, including the Russian form on the same line. */
  productNameAsPrinted: string;
  siteProductId: string | null;
  /** Catalog name, when it is not identical to the certificate. Null if it matches. */
  catalogNameDifference: string | null;
  registrationDateOnDocument: string;
  registrationDateISO: string;
  registrationDateDisplay: string;
  originalLanguage: "Russian";
  imageSrc: string;
  imageSha256: string;
  formOfRelease: string;
  manufacturedAccordingTo: string;
  appendixReference: string;
  appendixSupplied: false;
  manufacturer: string;
  manufacturerCountry: string;
  licensor: string;
  commissioningCompany: string;
  applicant: string;
  applicantOgrn: string;
  issuingAuthority: string;
  issuingLaboratory: string;
  standards: string[];
  basisIntro: string;
  basis: BasisEntry[];
  validity: string;
  signatoryRole: string;
  signatoryName: string;
  signatoryRoleNote: string;
  certificateSerialNumber: string;
  seoTitle: string;
  /** Identifiers checked against the supplied image before this record was written. */
  crossCheck: {
    productName: string;
    registrationNumber: string;
    registrationDateISO: string;
  };
  /** Words or numbers that could not be read confidently on this image. */
  unreadable: string[];
};

const ISSUING_AUTHORITY =
  'CJSC "National Institute of Health named after Academician S.Kh. Avdalbekyan" of the Ministry of Health of the Republic of Armenia';

const ISSUING_LABORATORY = "Sanitary-hygienic testing laboratory";

const ISSUING_ROLE =
  "(authorized body of a member state of the Eurasian Economic Union)";

const STANDARDS = [
  'TR CU 021/2011 "On the safety of food products"',
  'TR CU 022/2011 "Food products in terms of their labeling"',
  'TR CU 029/2012 "Safety requirements for food additives, flavorings and processing aids"',
];

const APPLICANT =
  'LLC "Feniks", 198096, Saint Petersburg, Zaitseva St., bldg. 9, letter A, premises 3-N, office 21, Russian Federation.';

const MANUFACTURER =
  "PNK Farmaceutici SpA: Nazionale Str. 150, 64100 Villa Vomano (TE), Italy. Under license: Ideal Pharma Peptide GmbH, Ferdinandstr. 11, D-61348 Bad Homburg v.d. Höhe. Commissioned by: NPCRIZ Europe SIA, address: Alberta Street 2-9, Riga, Latvia, LV-1010.";

const NAREK =
  'Testing laboratory of physical-chemical and microbiological research of Research CJSC "NAREK"';

const NAREK_ACCREDITATION = "Accreditation certificate No. 032/Т-108, until 05.05.2027";

const SANITARY_LAB =
  'Sanitary-hygienic testing laboratory of CJSC "National Institute of Health named after Academician S.Kh. Avdalbekyan" of the Ministry of Health of the Republic of Armenia';

const INSTITUTE_ACCREDITATION = "Accreditation certificate No. 015/Т-109, until 17.05.2027";

const SIGNATORY_NOTE =
  "(position of the head (authorized person) of the authorized body of a member state of the Eurasian Economic Union)";

function imageFor(registrationNumber: string): string {
  return `/documentation/certificates/${registrationNumber}.jpg`;
}

export const certificateRecords: CertificateRecord[] = [
  {
    registrationNumber: "AM.01.01.01.003.R.000166.03.24",
    translationRegistrationNumber: "AM.01.01.01.003.R.000166.03.24",
    slug: "prime-peptide-brain",
    productLine: "Prime Peptide",
    documentKind: "state-registration",
    productNameOnCertificate: "Prime Peptide Brain",
    productNameAsPrinted: "Prime Peptide Брайн / Prime Peptide Brain",
    siteProductId: "prime-peptide-brain",
    catalogNameDifference: null,
    registrationDateOnDocument: "20.03.2024",
    registrationDateISO: "2024-03-20",
    registrationDateDisplay: "March 20, 2024",
    originalLanguage: "Russian",
    imageSrc: imageFor("AM.01.01.01.003.R.000166.03.24"),
    imageSha256: "504ce415a08acd630eca7c548ca1e9219d1e102d0f49a7229ae4a9c0636a6acb",
    formOfRelease: "Capsules with a mass of 0.73 g; 90 capsules per package.",
    manufacturedAccordingTo: "Manufactured according to the product specification.",
    appendixReference: "See Appendix 1 (page 1).",
    appendixSupplied: false,
    manufacturer: MANUFACTURER,
    manufacturerCountry: "Italy",
    licensor: "Ideal Pharma Peptide GmbH, Ferdinandstr. 11, D-61348 Bad Homburg v.d. Höhe.",
    commissioningCompany: "NPCRIZ Europe SIA, Alberta Street 2-9, Riga, Latvia, LV-1010.",
    applicant: APPLICANT,
    applicantOgrn: "1057810193550",
    issuingAuthority: `${ISSUING_AUTHORITY}. ${ISSUING_ROLE}`,
    issuingLaboratory: ISSUING_LABORATORY,
    standards: STANDARDS,
    basisIntro: "Test protocols",
    basis: [
      {
        label: "Test protocol",
        number: "4987L-2023",
        date: "15.12.2023",
        issuedBy: NAREK,
        accreditation: NAREK_ACCREDITATION,
      },
      {
        label: "Expert conclusion",
        number: "24/33/168",
        date: "[unclear in supplied document]",
        issuedBy: SANITARY_LAB,
        accreditation: INSTITUTE_ACCREDITATION,
      },
    ],
    validity: "Not limited",
    signatoryRole: "Head of the laboratory",
    signatoryName: "Kazaryan S.A.",
    signatoryRoleNote: SIGNATORY_NOTE,
    certificateSerialNumber: "0014750",
    seoTitle: "Prime Peptide Brain — EAEU Product Registration Documentation",
    crossCheck: {
      productName: "Prime Peptide Brain",
      registrationNumber: "AM.01.01.01.003.R.000166.03.24",
      registrationDateISO: "2024-03-20",
    },
    unreadable: [
      "Expert conclusion No. 24/33/168 is legible. The date of that conclusion is under the blue stamp and is marked [unclear in supplied document]. It was not guessed.",
      "Appendix 1 (page 1) is cited and was not supplied.",
    ],
  },
  {
    registrationNumber: "AM.01.01.01.003.R.000062.02.24",
    translationRegistrationNumber: "AM.01.01.01.003.R.000062.02.24",
    slug: "prime-peptide-omega",
    productLine: "Prime Peptide",
    documentKind: "state-registration",
    productNameOnCertificate: "Prime Peptide Omega",
    productNameAsPrinted: "Prime Peptide Омега / Prime Peptide Omega",
    siteProductId: "prime-peptide-omega",
    catalogNameDifference: null,
    registrationDateOnDocument: "09.02.2024",
    registrationDateISO: "2024-02-09",
    registrationDateDisplay: "February 9, 2024",
    originalLanguage: "Russian",
    imageSrc: imageFor("AM.01.01.01.003.R.000062.02.24"),
    imageSha256: "6549c2605040cbee56bda3cb69a458de2b166a9e73c19bd93c9a2c41b09b065e",
    formOfRelease: "Capsules with a mass of 0.73 g; 90 capsules per package.",
    manufacturedAccordingTo: "Manufactured according to the product specification.",
    appendixReference: "See Appendix 1 (page 1).",
    appendixSupplied: false,
    manufacturer: MANUFACTURER,
    manufacturerCountry: "Italy",
    licensor: "Ideal Pharma Peptide GmbH, Ferdinandstr. 11, D-61348 Bad Homburg v.d. Höhe.",
    commissioningCompany: "NPCRIZ Europe SIA, Alberta Street 2-9, Riga, Latvia, LV-1010.",
    applicant: APPLICANT,
    applicantOgrn: "1057810193550",
    issuingAuthority: `${ISSUING_AUTHORITY}. ${ISSUING_ROLE}`,
    issuingLaboratory: ISSUING_LABORATORY,
    standards: STANDARDS,
    basisIntro: "Test protocols",
    basis: [
      {
        label: "Test protocol",
        number: "23MCS01859/23",
        date: "09.11.2023",
        issuedBy: 'Testing laboratory of LLC "International Certification Center"',
        accreditation: "Accreditation certificate No. 045/Т-086, until 20.05.2024",
      },
      {
        label: "Test protocol",
        number: "4466L-2023",
        date: "16.11.2023",
        issuedBy: NAREK,
        accreditation: NAREK_ACCREDITATION,
      },
      {
        label: "Expert conclusion",
        number: "24/33/041",
        date: "29.01.2024",
        issuedBy: SANITARY_LAB,
        accreditation: INSTITUTE_ACCREDITATION,
      },
    ],
    validity: "Not limited",
    signatoryRole: "Head of the laboratory",
    signatoryName: "Kazaryan S.A.",
    signatoryRoleNote: SIGNATORY_NOTE,
    certificateSerialNumber: "0014060",
    seoTitle: "Prime Peptide Omega — EAEU Product Registration Documentation",
    crossCheck: {
      productName: "Prime Peptide Omega",
      registrationNumber: "AM.01.01.01.003.R.000062.02.24",
      registrationDateISO: "2024-02-09",
    },
    unreadable: [
      "Appendix 1 (page 1) is cited and was not supplied.",
    ],
  },
  {
    registrationNumber: "AM.01.01.01.003.R.000333.05.24",
    translationRegistrationNumber: "AM.01.01.01.003.R.000333.05.24",
    slug: "prime-peptide-joint",
    productLine: "Prime Peptide",
    documentKind: "state-registration",
    productNameOnCertificate: "Prime Peptide Joint",
    productNameAsPrinted: "Prime Peptide Джойнт / Prime Peptide Joint",
    siteProductId: "prime-peptide-joints",
    catalogNameDifference:
      'The shop catalog calls this product "Prime Peptide Joints". The certificate prints "Prime Peptide Joint". Linked by this registration number, not by the catalog name.',
    registrationDateOnDocument: "10.05.2024",
    registrationDateISO: "2024-05-10",
    registrationDateDisplay: "May 10, 2024",
    originalLanguage: "Russian",
    imageSrc: imageFor("AM.01.01.01.003.R.000333.05.24"),
    imageSha256: "980caa3c839598160d48f9124e63e5dfc547e6515f8d56b3991cacd8fb844c24",
    formOfRelease: "Capsules with a mass of 0.73 g; 90 capsules per package.",
    manufacturedAccordingTo: "Manufactured according to the product specification.",
    appendixReference: "See Appendix 1 (page 1).",
    appendixSupplied: false,
    manufacturer: MANUFACTURER,
    manufacturerCountry: "Italy",
    licensor: "Ideal Pharma Peptide GmbH, Ferdinandstr. 11, D-61348 Bad Homburg v.d. Höhe.",
    commissioningCompany: "NPCRIZ Europe SIA, Alberta Street 2-9, Riga, Latvia, LV-1010.",
    applicant: APPLICANT,
    applicantOgrn: "1057810193550",
    issuingAuthority: `${ISSUING_AUTHORITY}. ${ISSUING_ROLE}`,
    issuingLaboratory: ISSUING_LABORATORY,
    standards: STANDARDS,
    basisIntro: "Test protocol",
    basis: [
      {
        label: "Test protocol",
        number: "1914L-2024",
        date: "29.04.2024",
        issuedBy: NAREK,
        accreditation: NAREK_ACCREDITATION,
      },
      {
        label: "Expert conclusion",
        number: "24/33/3[unclear in supplied document]",
        date: "06.05.2024",
        issuedBy: SANITARY_LAB,
        accreditation: INSTITUTE_ACCREDITATION,
      },
    ],
    validity: "Not limited",
    signatoryRole: "Head of the laboratory",
    signatoryName: "Kazaryan S.A.",
    signatoryRoleNote: SIGNATORY_NOTE,
    certificateSerialNumber: "0015621",
    seoTitle: "Prime Peptide Joint — EAEU Product Registration Documentation",
    crossCheck: {
      productName: "Prime Peptide Joint",
      registrationNumber: "AM.01.01.01.003.R.000333.05.24",
      registrationDateISO: "2024-05-10",
    },
    unreadable: [
      "The expert-conclusion number begins 24/33/3. The remaining digits sit under the blue stamp. Separate readings disagreed (325 and 335), so those digits are [unclear in supplied document] and were not chosen.",
      "The expert-conclusion date to the right of the stamp reads 06.05.2024.",
      "Appendix 1 (page 1) is cited and was not supplied.",
    ],
  },
  {
    registrationNumber: "AM.01.01.01.003.R.000063.02.24",
    translationRegistrationNumber: "AM.01.01.01.003.R.000063.02.24",
    slug: "prime-peptide-collagen",
    productLine: "Prime Peptide",
    documentKind: "state-registration",
    productNameOnCertificate: "Prime Peptide Collagen",
    productNameAsPrinted: "Prime Peptide Коллаген / Prime Peptide Collagen",
    siteProductId: "prime-peptide-collagen",
    catalogNameDifference: null,
    registrationDateOnDocument: "09.02.2024",
    registrationDateISO: "2024-02-09",
    registrationDateDisplay: "February 9, 2024",
    originalLanguage: "Russian",
    imageSrc: imageFor("AM.01.01.01.003.R.000063.02.24"),
    imageSha256: "c8f7a50096c2a1e7b20d695fb0c420d26175f5003a6e1bd42a561ccccd245564",
    formOfRelease: "Capsules with a mass of 0.73 g; 90 capsules per package.",
    manufacturedAccordingTo: "Manufactured according to the product specification.",
    appendixReference: "See Appendix 1 (page 1).",
    appendixSupplied: false,
    manufacturer: MANUFACTURER,
    manufacturerCountry: "Italy",
    licensor: "Ideal Pharma Peptide GmbH, Ferdinandstr. 11, D-61348 Bad Homburg v.d. Höhe.",
    commissioningCompany: "NPCRIZ Europe SIA, Alberta Street 2-9, Riga, Latvia, LV-1010.",
    applicant: APPLICANT,
    applicantOgrn: "1057810193550",
    issuingAuthority: `${ISSUING_AUTHORITY}. ${ISSUING_ROLE}`,
    issuingLaboratory: ISSUING_LABORATORY,
    standards: STANDARDS,
    basisIntro: "Test protocols",
    basis: [
      {
        label: "Test protocol",
        number: "4467L-2023",
        date: "16.11.2023",
        issuedBy: NAREK,
        accreditation: NAREK_ACCREDITATION,
      },
      {
        label: "Listed number",
        number: "2787",
        date: "13.11.2023",
        issuedBy:
          "The stamp covers the words between this number and the expert conclusion. The sentence then says both were issued by the sanitary-hygienic testing laboratory named below. No separate issuer is printed for No. 2787.",
        accreditation: INSTITUTE_ACCREDITATION,
      },
      {
        label: "Expert conclusion",
        number: "[unclear in supplied document]/042",
        date: "29.01.2024",
        issuedBy: SANITARY_LAB,
        accreditation: INSTITUTE_ACCREDITATION,
      },
    ],
    validity: "Not limited",
    signatoryRole: "Head of the laboratory",
    signatoryName: "Kazaryan S.A.",
    signatoryRoleNote: SIGNATORY_NOTE,
    certificateSerialNumber: "0014061",
    seoTitle: "Prime Peptide Collagen — EAEU Product Registration Documentation",
    crossCheck: {
      productName: "Prime Peptide Collagen",
      registrationNumber: "AM.01.01.01.003.R.000063.02.24",
      registrationDateISO: "2024-02-09",
    },
    unreadable: [
      "Expert-conclusion number: the stamp covers the middle of the number. The visible ending is /042 and the date 29.01.2024 is legible. The digits before /042 are [unclear in supplied document]. They were not filled in from the Omega certificate, which has a different number (24/33/041) and a different registration number.",
      "No. 2787 of 13.11.2023 is legible. Its own issuer line is interrupted by the stamp.",
      "Appendix 1 (page 1) is cited and was not supplied.",
    ],
  },
];

const DATE_ON_DOCUMENT: Record<string, string> = {
  "2024-03-20": "20.03.2024",
  "2024-02-09": "09.02.2024",
  "2024-05-10": "10.05.2024",
};

export function certificateFailureReasons(record: CertificateRecord): string[] {
  const reasons: string[] = [];
  if (record.registrationNumber !== record.crossCheck.registrationNumber) {
    reasons.push("Registration number does not match the cross-check.");
  }
  if (record.translationRegistrationNumber !== record.registrationNumber) {
    reasons.push("Translation registration number does not match the certificate number.");
  }
  if (record.productNameOnCertificate !== record.crossCheck.productName) {
    reasons.push("Product name on the certificate does not match the cross-check.");
  }
  if (record.registrationDateISO !== record.crossCheck.registrationDateISO) {
    reasons.push("Registration date does not match the cross-check.");
  }
  if (DATE_ON_DOCUMENT[record.registrationDateISO] !== record.registrationDateOnDocument) {
    reasons.push("Printed registration date does not match the ISO date.");
  }
  const expectedImage = `/documentation/certificates/${record.registrationNumber}.jpg`;
  if (record.imageSrc !== expectedImage) {
    reasons.push("Original image path is not tied to this registration number.");
  }
  if (!/^[a-f0-9]{64}$/.test(record.imageSha256)) {
    reasons.push("Original image hash is missing.");
  }
  if (record.appendixSupplied !== false && !record.appendixReference) {
    reasons.push("Appendix flag is inconsistent.");
  }
  if (record.documentKind !== "state-registration") {
    reasons.push("This file is a state-registration certificate and must not be labeled as another document type.");
  }
  return reasons;
}

export function isPublishableCertificate(record: CertificateRecord): boolean {
  return certificateFailureReasons(record).length === 0;
}

/** Public records only. A conflict drops the record instead of guessing. */
export const publishedCertificates: CertificateRecord[] = certificateRecords.filter(
  isPublishableCertificate
);

export const withheldCertificates: CertificateRecord[] = certificateRecords.filter(
  (record) => !isPublishableCertificate(record)
);

export function getPublishedCertificateBySlug(slug: string): CertificateRecord | undefined {
  return publishedCertificates.find((record) => record.slug === slug);
}

export function getPublishedCertificateByProductId(
  productId: string
): CertificateRecord | undefined {
  return publishedCertificates.find((record) => record.siteProductId === productId);
}

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  "state-registration": "EAEU Certificate of State Registration",
  coa: "Certificate of Analysis",
  manufacturer: "Manufacturer documentation",
  "ingredient-spec": "Ingredient / specification documentation",
  batch: "Batch documentation",
};
