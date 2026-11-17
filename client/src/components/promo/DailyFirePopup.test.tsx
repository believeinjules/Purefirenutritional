// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import DailyFirePopup, { DAILY_FIRE_SPIN_URL } from "./DailyFirePopup";
import { AppliedCodeNotice } from "./AppliedDiscount";
import {
  DAILY_FIRE_STORAGE_KEY,
  activeCode,
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

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(Math, "random").mockReturnValue(0); // first question: "goal-focus"
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
    expect(screen.getByRole("group", { name: "Answer options" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Energy and focus|Sleep and recovery|Skin, hair, and nails|Joints and mobility/ })).toHaveLength(4);
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

  it("Esc closes it and snoozes it for 30 days", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(readDailyFire()?.status).toBe("dismissed");
  });

  it("never shows on checkout, success, or admin pages", async () => {
    for (const p of ["/checkout", "/checkout/success", "/admin"]) {
      const { unmount } = renderAt(p, 10);
      await act(() => new Promise((r) => setTimeout(r, 80)));
      expect(screen.queryByRole("dialog")).toBeNull();
      unmount();
    }
  });

  it("does not show again after a dismissal", async () => {
    localStorage.setItem(DAILY_FIRE_STORAGE_KEY, JSON.stringify({ status: "dismissed", at: Date.now() }));
    renderAt("/", 10);
    await act(() => new Promise((r) => setTimeout(r, 80)));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("any answer reveals the server's code via keyboard, and saves it for checkout", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: "FIRE10-K7Q2MX", percentOff: 10, expiresAt: Math.floor(Date.now() / 1000) + 7 * 86400 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    const option = screen.getByRole("button", { name: "Sleep and recovery" });
    option.focus();
    await user.keyboard("{Enter}");
    expect((await screen.findByTestId("daily-fire-code")).textContent).toContain("FIRE10-K7Q2MX");
    expect(screen.getByRole("heading", { name: /You unlocked 10% off/ })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(DAILY_FIRE_SPIN_URL, expect.objectContaining({ method: "POST" }));
    expect(JSON.parse((fetchMock.mock.calls[0] as any)[1].body)).toEqual({ questionId: "goal-focus", answerId: "b" });
    const saved = readDailyFire();
    expect(saved?.status).toBe("claimed");
    expect(saved?.code).toBe("FIRE10-K7Q2MX");
    vi.unstubAllGlobals();
  });

  it("shows a friendly error (and lets them retry) when codes are unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Discount codes are not available right now." }), { status: 503 })));
    renderAt("/");
    await screen.findByRole("dialog", {}, { timeout: 2000 });
    await user.click(screen.getByRole("button", { name: "Energy and focus" }));
    expect((await screen.findByRole("alert")).textContent).toContain("not available right now");
    expect((screen.getByRole("button", { name: "Energy and focus" }) as HTMLButtonElement).disabled).toBe(false);
    expect(readDailyFire()).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("dailyFire storage rules", () => {
  const now = Date.UTC(2026, 10, 17);
  it("dismissed → hidden for 30 days", () => {
    expect(isPopupEligible(null, now)).toBe(true);
    expect(isPopupEligible({ status: "dismissed", at: now }, now + 29 * DAY)).toBe(false);
    expect(isPopupEligible({ status: "dismissed", at: now }, now + 31 * DAY)).toBe(true);
  });
  it("claimed → hidden while the code is valid and for 30 days", () => {
    const s = { status: "claimed" as const, at: now, code: "FIRE5-ABCDEF", percentOff: 5, expiresAt: now + 7 * DAY };
    expect(isPopupEligible(s, now + 10 * DAY)).toBe(false);
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
