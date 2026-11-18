import { describe, it, expect, afterEach, vi } from "vitest";
import {
  PASSWORD_RESET_NEUTRAL_MESSAGE,
  getPasswordResetActionCodeSettings,
  getPasswordResetContinueUrl,
  isContinueUrlError,
  passwordResetOutcome,
} from "./passwordReset";

describe("passwordReset", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("continue URL is the site sign-in page on the hosted reset flow", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "https://www.purefirenutritional.com");
    expect(getPasswordResetContinueUrl()).toBe("https://www.purefirenutritional.com/login");
    expect(getPasswordResetActionCodeSettings()).toEqual({
      url: "https://www.purefirenutritional.com/login",
      handleCodeInApp: false,
    });
  });

  it("success and unknown-account errors show the same neutral message", () => {
    expect(passwordResetOutcome(null)).toEqual({ kind: "sent", message: PASSWORD_RESET_NEUTRAL_MESSAGE });
    expect(passwordResetOutcome({ code: "auth/user-not-found" })).toEqual({
      kind: "sent",
      message: PASSWORD_RESET_NEUTRAL_MESSAGE,
    });
    expect(PASSWORD_RESET_NEUTRAL_MESSAGE).toBe("If an account exists for that email, we've sent a reset link.");
  });

  it("friendly messages for invalid email and rate limits", () => {
    expect(passwordResetOutcome({ code: "auth/invalid-email" })).toEqual({
      kind: "error",
      message: "Please enter a valid email address.",
    });
    expect(passwordResetOutcome({ code: "auth/too-many-requests" }).message).toMatch(/Too many attempts/);
    expect(passwordResetOutcome({ code: "auth/internal-error" }).kind).toBe("error");
  });

  it("detects rejected continue URLs", () => {
    expect(isContinueUrlError("auth/unauthorized-continue-uri")).toBe(true);
    expect(isContinueUrlError("auth/invalid-continue-uri")).toBe(true);
    expect(isContinueUrlError("auth/invalid-email")).toBe(false);
  });
});

describe("hostedAuthActionUrl", () => {
  it("forwards the action query to Firebase's hosted page", async () => {
    const { hostedAuthActionUrl } = await import("./passwordReset");
    expect(hostedAuthActionUrl("pure-fire.firebaseapp.com", "?mode=resetPassword&oobCode=abc")).toBe(
      "https://pure-fire.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=abc"
    );
    expect(hostedAuthActionUrl("", "?mode=resetPassword")).toBeNull();
    expect(hostedAuthActionUrl("evil.com/x?", "?mode=resetPassword")).toBeNull();
  });
});
