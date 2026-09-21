import { describe, it, expect } from "vitest";
import { parseAdminEmails, isAdminEmail, isAdminUser } from "./adminAllowlist";

describe("parseAdminEmails", () => {
  it("parses comma-separated emails and lowercases", () => {
    expect(parseAdminEmails("Jules@Example.com, other@x.com")).toEqual([
      "jules@example.com",
      "other@x.com",
    ]);
  });

  it("trims whitespace and drops empties", () => {
    expect(parseAdminEmails("  a@b.com ,  , c@d.com ")).toEqual([
      "a@b.com",
      "c@d.com",
    ]);
  });

  it("returns empty for unset", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
    expect(parseAdminEmails("")).toEqual([]);
    expect(parseAdminEmails(null)).toEqual([]);
  });
});

describe("isAdminEmail", () => {
  const allowlist = parseAdminEmails(
    "julesxshulman@gmail.com, other@purefire.com"
  );

  it("matches allowlisted email case-insensitively", () => {
    expect(isAdminEmail("JulesXShulman@gmail.com", allowlist)).toBe(true);
    expect(isAdminEmail("stranger@example.com", allowlist)).toBe(false);
    expect(isAdminEmail(null, allowlist)).toBe(false);
  });

  it("fails closed when allowlist is empty", () => {
    expect(isAdminEmail("julesxshulman@gmail.com", [])).toBe(false);
  });
});

describe("isAdminUser", () => {
  const allowlist = ["julesxshulman@gmail.com"];

  it("requires emailVerified and allowlisted email", () => {
    expect(
      isAdminUser(
        { email: "julesxshulman@gmail.com", emailVerified: true } as any,
        allowlist
      )
    ).toBe(true);
    expect(
      isAdminUser(
        { email: "julesxshulman@gmail.com", emailVerified: false } as any,
        allowlist
      )
    ).toBe(false);
    expect(
      isAdminUser(
        { email: "stranger@example.com", emailVerified: true } as any,
        allowlist
      )
    ).toBe(false);
    expect(isAdminUser(null, allowlist)).toBe(false);
  });
});
