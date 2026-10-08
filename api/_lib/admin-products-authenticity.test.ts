import { describe, expect, it } from "vitest";
import { validateProductPatch } from "./admin-products";

describe("authenticity fields", () => {
  it("accepts manufacturer, lot, expiry and COA, and clears with empty values", () => {
    expect(
      validateProductPatch({
        manufacturer: " Peptides LLC ",
        lotNumber: "A123",
        expiryDate: "2027-05",
        coaUrl: "https://example.com/coa.pdf",
      })
    ).toEqual({ manufacturer: "Peptides LLC", lotNumber: "A123", expiryDate: "2027-05", coaUrl: "https://example.com/coa.pdf" });
    expect(validateProductPatch({ lotNumber: "", coaUrl: null })).toEqual({ lotNumber: null, coaUrl: null });
  });

  it("rejects bad expiry dates and non-https COA links", () => {
    expect(() => validateProductPatch({ expiryDate: "05/2027" })).toThrow(/YYYY-MM/);
    expect(() => validateProductPatch({ expiryDate: "2027-13" })).toThrow(/YYYY-MM/);
    expect(() => validateProductPatch({ coaUrl: "http://example.com/coa.pdf" })).toThrow(/https/);
  });
});
