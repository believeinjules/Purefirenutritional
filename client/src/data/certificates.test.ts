import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  certificateFailureReasons,
  certificateRecords,
  publishedCertificates,
  withheldCertificates,
} from "./certificates";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const publicDir = path.join(root, "client/public");

const FORBIDDEN = [
  "fda approved",
  "fda certified",
  "clinically approved",
  "clinically proven",
  "government proven",
  "medical certification",
  "proof of efficacy",
];

describe("certificate records", () => {
  it("publishes only records whose identifiers agree", () => {
    expect(withheldCertificates).toEqual([]);
    expect(publishedCertificates).toHaveLength(certificateRecords.length);
    for (const record of certificateRecords) {
      expect(certificateFailureReasons(record)).toEqual([]);
    }
  });

  it("keeps each translation on the image named by that registration number", () => {
    const numbers = new Set<string>();
    for (const record of publishedCertificates) {
      expect(numbers.has(record.registrationNumber)).toBe(false);
      numbers.add(record.registrationNumber);
      const file = path.join(publicDir, record.imageSrc.replace(/^\//, ""));
      const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
      expect(hash).toBe(record.imageSha256);
      expect(record.imageSrc).toContain(record.registrationNumber);
      expect(record.translationRegistrationNumber).toBe(record.registrationNumber);
      expect(record.appendixSupplied).toBe(false);
      expect(record.documentKind).toBe("state-registration");
    }
  });

  it("does not use approval or efficacy language in the translation fields", () => {
    const blob = JSON.stringify(publishedCertificates).toLowerCase();
    for (const phrase of FORBIDDEN) {
      expect(blob).not.toContain(phrase);
    }
  });

  it("does not pair Joint by catalog name", () => {
    const joint = publishedCertificates.find((record) => record.slug === "prime-peptide-joint");
    expect(joint?.productNameOnCertificate).toBe("Prime Peptide Joint");
    expect(joint?.siteProductId).toBe("prime-peptide-joints");
    expect(joint?.catalogNameDifference).toBeTruthy();
    expect(joint?.registrationNumber).toBe("AM.01.01.01.003.R.000333.05.24");
  });
});
