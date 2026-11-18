// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const sendPasswordReset = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ sendPasswordReset }),
}));

import ForgotPasswordForm from "./ForgotPasswordForm";

const NEUTRAL = "If an account exists for that email, we've sent a reset link.";

afterEach(() => {
  cleanup();
  sendPasswordReset.mockReset();
});

async function submit(email: string) {
  render(<ForgotPasswordForm onBack={() => {}} />);
  const input = screen.getByLabelText("Email");
  await userEvent.type(input, email);
  await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));
}

describe("ForgotPasswordForm", () => {
  it("shows the neutral confirmation after a send", async () => {
    sendPasswordReset.mockResolvedValue({ error: null });
    await submit("  shopper@example.com ");
    expect(sendPasswordReset).toHaveBeenCalledWith("shopper@example.com");
    expect(await screen.findByText(NEUTRAL)).toBeTruthy();
  });

  it("does not reveal that an email has no account", async () => {
    sendPasswordReset.mockResolvedValue({ error: { code: "auth/user-not-found" } });
    await submit("nobody@example.com");
    expect(await screen.findByText(NEUTRAL)).toBeTruthy();
  });

  it("shows friendly errors for a bad email and rate limits", async () => {
    sendPasswordReset.mockResolvedValue({ error: { code: "auth/invalid-email" } });
    await submit("not-an-email");
    expect((await screen.findByRole("alert")).textContent).toBe("Please enter a valid email address.");
    cleanup();
    sendPasswordReset.mockResolvedValue({ error: { code: "auth/too-many-requests" } });
    await submit("shopper@example.com");
    expect((await screen.findByRole("alert")).textContent).toMatch(/Too many attempts/);
    expect(screen.queryByText(NEUTRAL)).toBeNull();
  });

  it("prefills the sign-in email", () => {
    render(<ForgotPasswordForm initialEmail="me@example.com" onBack={() => {}} />);
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("me@example.com");
  });
});
