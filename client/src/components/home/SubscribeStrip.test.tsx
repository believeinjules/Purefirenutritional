// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscribeStrip from "./SubscribeStrip";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function reply(ok: boolean, body: unknown) {
  fetchMock.mockResolvedValueOnce({ ok, json: async () => body });
}

describe("SubscribeStrip", () => {
  it("expands in place, focuses the labelled email input, and toggles aria-expanded", async () => {
    const user = userEvent.setup();
    render(<SubscribeStrip />);
    const toggle = screen.getByRole("button", { name: "Subscribe" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe("home-subscribe-panel");
    expect(document.getElementById("home-subscribe-panel")!.hidden).toBe(true);

    await user.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById("home-subscribe-panel")!.hidden).toBe(false);
    const input = screen.getByLabelText("Email address") as HTMLInputElement;
    expect(input.type).toBe("email");
    expect(input.required).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
  });

  it("posts the same payload as the footer form and announces success", async () => {
    const user = userEvent.setup();
    reply(true, { success: true });
    render(<SubscribeStrip />);
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await user.type(screen.getByLabelText("Email address"), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Successfully subscribed to our newsletter!"));
    expect(fetchMock).toHaveBeenCalledWith("/api/mailing-list/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.co" }),
    });
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("");
  });

  it("shows the server error in the live region and keeps the email", async () => {
    const user = userEvent.setup();
    reply(false, { error: "Mailing list unavailable" });
    render(<SubscribeStrip />);
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await user.type(screen.getByLabelText("Email address"), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Mailing list unavailable"));
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("a@b.co");
  });

  it("shows a network error and does not submit an invalid email", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<SubscribeStrip />);
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await user.type(screen.getByLabelText("Email address"), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Failed to subscribe. Please try again."));
  });

  it("does not call the API for an empty/invalid email", async () => {
    const user = userEvent.setup();
    render(<SubscribeStrip />);
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
