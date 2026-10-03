import { describe, expect, it } from "vitest";
import {
  missingFedExEnv,
  normalizeUsZip,
  pickFedExUsdQuote,
  quoteUsZipShipping,
} from "./shipping-rate";

describe("FedEx zip quote", () => {
  it("does not invent a rate when credentials are missing", async () => {
    const quote = await quoteUsZipShipping({
      postalCode: "10001",
      units: 2,
      env: {},
      fetchImpl: (() => {
        throw new Error("should not call FedEx");
      }) as unknown as typeof fetch,
    });
    expect(quote.available).toBe(false);
    if (!quote.available) {
      expect(quote.message).toBe("shipping rate unavailable");
      expect(quote.missing).toEqual([
        "FEDEX_API_KEY",
        "FEDEX_SECRET_KEY",
        "FEDEX_ACCOUNT_NUMBER",
        "FEDEX_ORIGIN_POSTAL_CODE",
        "FEDEX_PACKAGE_WEIGHT_LB",
      ]);
      expect("amountUSD" in quote).toBe(false);
    }
  });

  it("rejects a non-US zip without calling FedEx", async () => {
    const quote = await quoteUsZipShipping({
      postalCode: "10115",
      units: 1,
      env: {
        FEDEX_API_KEY: "present",
        FEDEX_SECRET_KEY: "present",
        FEDEX_ACCOUNT_NUMBER: "present",
        FEDEX_ORIGIN_POSTAL_CODE: "10115",
        FEDEX_PACKAGE_WEIGHT_LB: "0.5",
      },
      fetchImpl: (() => {
        throw new Error("should not call FedEx");
      }) as unknown as typeof fetch,
    });
    expect(quote.available).toBe(false);
  });

  it("picks the lowest positive USD account rate and ignores zero and EUR", () => {
    const picked = pickFedExUsdQuote({
      output: {
        rateReplyDetails: [
          {
            serviceName: "FedEx International Priority",
            ratedShipmentDetails: [
              { rateType: "ACCOUNT", currency: "EUR", totalNetCharge: 10 },
              { rateType: "ACCOUNT", currency: "USD", totalNetCharge: 0 },
              { rateType: "LIST", currency: "USD", totalNetCharge: 40 },
              { rateType: "ACCOUNT", currency: "USD", totalNetCharge: 55.5 },
            ],
          },
          {
            serviceName: "FedEx International Economy",
            ratedShipmentDetails: [
              { rateType: "ACCOUNT", currency: "USD", totalNetCharge: 48.2 },
            ],
          },
        ],
      },
    });
    expect(picked).toEqual({ amountUSD: 48.2, serviceName: "FedEx International Economy" });
  });

  it("returns null when FedEx has no positive USD charge", () => {
    expect(pickFedExUsdQuote({ output: { rateReplyDetails: [] } })).toBeNull();
  });

  it("normalizes US zips", () => {
    expect(normalizeUsZip("10001-1234")).toBe("10001");
    expect(normalizeUsZip("ABCDE")).toBeNull();
    expect(missingFedExEnv({ FEDEX_PACKAGE_WEIGHT_LB: "0" })).toContain(
      "FEDEX_PACKAGE_WEIGHT_LB"
    );
  });
});
