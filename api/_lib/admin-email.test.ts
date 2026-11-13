import { describe, expect, it } from "vitest";
import { maskEmail } from "./admin-email.js";
import { EMAIL_TEST_RECIPIENT, fromHeader } from "./email.js";

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
  it("masks recipients", () => {
    expect(maskEmail("john.doe@example.com")).toBe("j***@example.com");
  });
});
