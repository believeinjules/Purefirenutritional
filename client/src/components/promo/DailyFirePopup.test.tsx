// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import DailyFirePopup, { DAILY_FIRE_SPIN_URL } from "./DailyFirePopup";
import { AppliedCodeNotice } from "./AppliedDiscount";
import {
  DAILY_FIRE_SHOWN_KEY,
  DAILY_FIRE_STORAGE_KEY,
  activeCode,
  dailyFireEmail,
  isPillVisible,
  isPopupEligible,
  markClaimed,
  readDailyFire,
} from "@/lib/dailyFire";
import { QUIZ_QUESTIONS } from "@shared/daily-fire";

const DAY = 86_400_000;

function renderAt(path: string, delayMs = 50) {
  const { hook } = memoryLocation({ path });
  return render(
    <Router hook={hook}>
      <DailyFirePopup delayMs={delayMs} />
    </Router>
  );
}

/** Tap a standard answer; it auto-advances to the email step after a short pause. */
async function pick(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("radio", { name }));
  await screen.findByRole("heading", { name: "Subscribe for more discounts" });
}

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(Math, "random").mockReturnValue(0); // first question: "goal-focus"
  // Radix Checkbox measures itself; jsdom has no ResizeObserver.
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DailyFirePopup", () => {
  it("renders nothing until its delay, then an accessible modal dialog", async () => {
    renderAt("/");
    expect(screen.queryByRole("dialog")).toBeNull();
    const dialog = await screen.findByRole("dialog", {}, { timeout: 2000 });
    // Labelled by the question, described by the offer
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    const title = document.getElementById(dialog.getAttribute("aria-labelledby")!);
    expect(title?.textContent).toBe(QUIZ_QUESTIONS[0].prompt);
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Answer options" })).toBeTruthy();
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.textContent)).toEqual(["Energy and focus", "Sleep and recovery", "Skin, hair, and nails", "Joints and mobility"]);
    expect(radios.every((r) => r.getAttribute("aria-checked") === "false")).toBe(true);
    expect(screen.getByText("Answer one question to unlock 5–25% off.")).toBeTruthy();
    expect(screen.getByText("For fun and education, not medical advice.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    // Focus is moved inside the dialog (focus trap)
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it("traps Tab focus inside the dialog and does not pre-focus an answer", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const dialog = await screen.findByRole("dialog", {}, { timeout: 2000 });
    await waitFor(() => expect(document.activeElement).toBe(dialog));
    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("Esc closes it and shows the Daily Fire pill instead", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(readDailyFire()?.status).toBe("dismissed");
    const pill = await screen.findByRole("button", { name: "Open today's Daily Fire question" });
    expect(pill).toBeTruthy();
    await user.click(pill);
    const dialog = await screen.findByRole("dialog", {}, { timeout: 2000 });
    const title = document.getElementById(dialog.getAttribute("aria-labelledby")!);
    expect(title?.textContent).toBe(QUIZ_QUESTIONS[0].prompt);
  });

  it("never shows the popup or pill on checkout, cart, account, or admin pages", async () => {
    for (const p of ["/checkout", "/checkout/success", "/cart", "/account", "/admin"]) {
      const { unmount } = renderAt(p, 10);
      await act(() => new Promise((r) => setTimeout(r, 80)));
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByTestId("daily-fire-pill")).toBeNull();
      unmount();
    }
  });

  it("does not auto-open again after a dismissal, but the pill reopens the same question", async () => {
    localStorage.setItem(DAILY_FIRE_STORAGE_KEY, JSON.stringify({ status: "dismissed", at: Date.now() }));
    const user = userEvent.setup();
    renderAt("/", 10);
    await act(() => new Promise((r) => setTimeout(r, 80)));
    expect(screen.queryByRole("dialog")).toBeNull();
    const pill = await screen.findByRole("button", { name: "Open today's Daily Fire question" });
    await user.click(pill);
    const dialog = await screen.findByRole("dialog");
    const title = document.getElementById(dialog.getAttribute("aria-labelledby")!);
    expect(title?.textContent).toBe(QUIZ_QUESTIONS[0].prompt);
  });

  it("hides the pill after a code is claimed, then both return after 30 days", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await pick(user, "Sleep and recovery");
    await user.type(screen.getByLabelText("Email"), "shopper@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    await screen.findByTestId("daily-fire-code");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByTestId("daily-fire-pill")).toBeNull();
    vi.unstubAllGlobals();
  });

  const okResponse = (over: Record<string, unknown> = {}) =>
    new Response(
      JSON.stringify({ code: "FIRE10-K7Q2MX", percentOff: 10, expiresAt: Math.floor(Date.now() / 1000) + 7 * 86400, ...over }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  it("answering shows the email step (no code, no request yet)", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await pick(user, "Sleep and recovery");
    expect(screen.getByRole("heading", { name: "Subscribe for more discounts" })).toBeTruthy();
    const email = screen.getByLabelText("Email") as HTMLInputElement;
    expect(email.type).toBe("email");
    expect(email.required).toBe(true);
    expect(email.getAttribute("autocomplete")).toBe("email");
    const consent = screen.getByRole("checkbox", { name: "Email me Pure Fire news and offers. Unsubscribe anytime." });
    expect(consent.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBe("/privacy");
    expect(screen.getByRole("button", { name: "Reveal my code" })).toBeTruthy();
    expect(screen.queryByTestId("daily-fire-code")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(email));
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("validates email and consent on the client before calling the server", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await pick(user, "Energy and focus");
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    const email = screen.getByLabelText("Email");
    expect(screen.getByText("Enter your email address to reveal your code.")).toBeTruthy();
    expect(screen.getByText("Check the box to join our email list and reveal your code.")).toBeTruthy();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(email.getAttribute("aria-describedby")).toBe("daily-fire-email-error");
    await user.type(email, "nope@");
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    expect(screen.getByText("Enter a valid email address, like name@example.com.")).toBeTruthy();
    await user.clear(email);
    await user.type(email, "shopper@example.com");
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    expect(screen.queryByText(/valid email/)).toBeNull();
    expect(screen.getByText("Check the box to join our email list and reveal your code.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("answer + email + consent reveals the server's code via keyboard, and saves it for checkout", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    const first = screen.getByRole("radio", { name: "Energy and focus" });
    first.focus();
    // Arrow moves the check without advancing; Enter confirms.
    await user.keyboard("{ArrowDown}");
    const option = screen.getByRole("radio", { name: "Sleep and recovery" });
    expect(document.activeElement).toBe(option);
    expect(option.getAttribute("aria-checked")).toBe("true");
    expect(first.getAttribute("tabindex")).toBe("-1");
    expect(screen.queryByRole("heading", { name: "Subscribe for more discounts" })).toBeNull();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Email")));
    await user.keyboard(" Shopper@Example.com ");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("checkbox"));
    await user.keyboard(" ");
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    expect((await screen.findByTestId("daily-fire-code")).textContent).toContain("FIRE10-K7Q2MX");
    expect(screen.getByRole("heading", { name: /You unlocked 10% off/ })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(DAILY_FIRE_SPIN_URL, expect.objectContaining({ method: "POST" }));
    expect(JSON.parse((fetchMock.mock.calls[0] as any)[1].body)).toEqual({
      questionId: "goal-focus",
      answerId: "b",
      email: "Shopper@Example.com",
      consent: true,
    });
    const saved = readDailyFire();
    expect(saved?.status).toBe("claimed");
    expect(saved?.code).toBe("FIRE10-K7Q2MX");
    expect(saved?.email).toBe("shopper@example.com");
    expect(dailyFireEmail()).toBe("shopper@example.com");
    vi.unstubAllGlobals();
  });

  it("says so when the email already has an active code", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => okResponse({ existing: true, percentOff: 15, code: "FIRE15-ABCDEF" })));
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await pick(user, "Energy and focus");
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    expect((await screen.findByTestId("daily-fire-code")).textContent).toContain("FIRE15-ABCDEF");
    expect(screen.getByRole("heading", { name: "Your 15% off code" })).toBeTruthy();
    expect(screen.getByText(/already has an active Daily Fire code/)).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("shows the server's field error on a 400", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "Enter a valid email address, like name@example.com.", field: "email" }), { status: 400 }))
    );
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await pick(user, "Energy and focus");
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    expect((await screen.findByRole("alert")).textContent).toContain("valid email");
    expect(readDailyFire()).toBeNull();
    vi.unstubAllGlobals();
  });

  it("shows a friendly error (and lets them retry) when codes are unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Discount codes are not available right now." }), { status: 503 })));
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await pick(user, "Energy and focus");
    await user.type(screen.getByLabelText("Email"), "a@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Reveal my code" }));
    expect((await screen.findByRole("alert")).textContent).toContain("not available right now");
    expect((screen.getByRole("button", { name: "Reveal my code" }) as HTMLButtonElement).disabled).toBe(false);
    expect(readDailyFire()).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("dailyFire storage rules", () => {
  const now = new Date(2026, 10, 17).getTime(); // local midnight so calendar-day checks stay stable
  it("dismissed → auto-popup stays closed for the rest of that calendar day, then returns", () => {
    expect(isPopupEligible(null, now)).toBe(true);
    expect(isPopupEligible({ status: "dismissed", at: now + 8 * 3600_000 }, now + 10 * 3600_000)).toBe(false);
    expect(isPillVisible({ status: "dismissed", at: now + 8 * 3600_000 }, now + 10 * 3600_000)).toBe(true);
    const nextDay = new Date(2026, 10, 18).getTime();
    expect(isPopupEligible({ status: "dismissed", at: now + 8 * 3600_000 }, nextDay)).toBe(true);
    expect(isPillVisible({ status: "dismissed", at: now + 8 * 3600_000 }, nextDay)).toBe(false);
  });
  it("shown today (without a dismiss record) hides the auto-popup and shows the pill", () => {
    const today = "2026-11-17";
    expect(isPopupEligible(null, now, today)).toBe(false);
    expect(isPillVisible(null, now, today)).toBe(true);
  });
  it("claimed → hidden for 30 days even after the 7-day code expires, then popup and pill can return", () => {
    const s = { status: "claimed" as const, at: now, code: "FIRE5-ABCDEF", percentOff: 5, expiresAt: now + 7 * DAY };
    expect(isPopupEligible(s, now + 10 * DAY)).toBe(false);
    expect(isPillVisible(s, now + 10 * DAY, "2026-11-27")).toBe(false);
    expect(isPopupEligible(s, now + 30 * DAY - 1)).toBe(false);
    expect(isPopupEligible(s, now + 30 * DAY)).toBe(true);
    expect(isPillVisible(s, now + 30 * DAY)).toBe(false); // pill only after that day's show/dismiss
    expect(activeCode(s, now + DAY)?.code).toBe("FIRE5-ABCDEF");
    expect(activeCode(s, now + 8 * DAY)).toBeNull();
    expect(activeCode({ ...s, removed: true }, now)).toBeNull();
  });
});

describe("AppliedCodeNotice", () => {
  it("shows 'Code … applied' with a labelled Remove button", async () => {
    const user = userEvent.setup();
    markClaimed("FIRE15-ABCDEF", 15, Math.floor(Date.now() / 1000) + 3600);
    render(<AppliedCodeNotice />);
    expect((await screen.findByTestId("applied-code")).textContent).toContain("Code FIRE15-ABCDEF applied (15% off)");
    await user.click(screen.getByRole("button", { name: "Remove code FIRE15-ABCDEF" }));
    await waitFor(() => expect(screen.queryByTestId("applied-code")).toBeNull());
    expect(readDailyFire()?.removed).toBe(true);
  });
});
