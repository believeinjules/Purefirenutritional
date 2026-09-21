import { describe, it, expect, afterEach, vi } from "vitest";
import {
  getEmailVerificationContinueUrl,
  getEmailVerificationActionCodeSettings,
  getSiteOrigin,
  formatVerificationSendFailureMessage,
  isEmailVerificationConfirmed,
} from "./emailVerification";

describe("emailVerification", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults continue URL to purefirenutritional auth/action", () => {
    // No VITE_PUBLIC_SITE_URL in test env; window may be jsdom origin.
    const url = getEmailVerificationContinueUrl();
    expect(url.endsWith("/auth/action")).toBe(true);
    expect(url.startsWith("http")).toBe(true);
  });

  it("uses VITE_PUBLIC_SITE_URL when set", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "https://www.purefirenutritional.com/");
    expect(getSiteOrigin()).toBe("https://www.purefirenutritional.com");
    expect(getEmailVerificationContinueUrl()).toBe(
      "https://www.purefirenutritional.com/auth/action"
    );
  });

  it("actionCodeSettings enable in-app handling", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "https://www.purefirenutritional.com");
    const settings = getEmailVerificationActionCodeSettings();
    expect(settings.handleCodeInApp).toBe(true);
    expect(settings.url).toBe(
      "https://www.purefirenutritional.com/auth/action"
    );
  });
});

describe("verification UX helpers", () => {
  it("always includes Resend guidance when send fails after signup", () => {
    const withFirebase = formatVerificationSendFailureMessage({
      message: "Firebase: Error (auth/too-many-requests).",
    });
    expect(withFirebase).toContain("auth/too-many-requests");
    expect(withFirebase.toLowerCase()).toContain("resend");

    const without = formatVerificationSendFailureMessage(null);
    expect(without.toLowerCase()).toContain("resend");
    expect(without).toContain("couldn’t send");
  });

  it("only confirms verification when emailVerified is true", () => {
    expect(isEmailVerificationConfirmed({ emailVerified: true })).toBe(true);
    expect(isEmailVerificationConfirmed({ emailVerified: false })).toBe(false);
    expect(isEmailVerificationConfirmed(null)).toBe(false);
    expect(isEmailVerificationConfirmed(undefined)).toBe(false);
  });
});
