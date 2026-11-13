import { describe, expect, it } from "vitest";
import { emailTestTokenMatches, maskEmail } from "./admin-email.js";
import { EMAIL_TEST_RECIPIENT, fromHeader } from "./email.js";

const T = "a".repeat(40);

describe("fromHeader", () => {
  it("uses EMAIL_FROM when set", () => {
    expect(
      fromHeader({ EMAIL_FROM: " Pure Fire Nutritional <orders@purefirenutritional.com> ", EMAIL_USER: "x@mac.com" })
    ).toBe("Pure Fire Nutritional <orders@purefirenutritional.com>");
  });
  it("falls back to EMAIL_USER with the store name", () => {
    expect(fromHeader({ EMAIL_FROM: "  ", EMAIL_USER: "x@mac.com" })).toBe('"Pure Fire Nutritional" <x@mac.com>');
  });
});

describe("email test guard", () => {
  it("only ever sends to the owner inbox", () => {
    expect(EMAIL_TEST_RECIPIENT).toBe("purefiren@gmail.com");
  });
  it("is disabled without a long EMAIL_TEST_TOKEN", () => {
    expect(emailTestTokenMatches({ headers: { "x-email-test-token": T } }, {})).toBe(false);
    expect(emailTestTokenMatches({ headers: { "x-email-test-token": "short" } }, { EMAIL_TEST_TOKEN: "short" })).toBe(false);
  });
  it("matches only the exact token", () => {
    expect(emailTestTokenMatches({ headers: { "x-email-test-token": T } }, { EMAIL_TEST_TOKEN: T })).toBe(true);
    expect(emailTestTokenMatches({ headers: { "x-email-test-token": T + "b" } }, { EMAIL_TEST_TOKEN: T })).toBe(false);
    expect(emailTestTokenMatches({ headers: {} }, { EMAIL_TEST_TOKEN: T })).toBe(false);
  });
  it("masks recipients", () => {
    expect(maskEmail("john.doe@example.com")).toBe("j***@example.com");
  });
});
