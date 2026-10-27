import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_PATTERN, subscribeToMailingList } from "@/lib/mailingList";

/**
 * Slim homepage subscribe strip. "Subscribe" expands an email form in place
 * (no scroll, no popup). Posts via the same helper/payload as the footer form.
 * Ids are prefixed "home-subscribe-" so they never collide with the footer form.
 */
export default function SubscribeStrip() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  // ui/Input is a plain function component in React 18 (no ref forwarding), so look the input up by id.
  const focusInput = () => document.getElementById("home-subscribe-email")?.focus();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      // The panel is un-hidden synchronously by the state update; focus after it renders.
      requestAnimationFrame(focusInput);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!email || !EMAIL_PATTERN.test(email)) {
      setMessage({ kind: "error", text: "Please enter a valid email address." });
      focusInput();
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const result = await subscribeToMailingList(email);
    setSubmitting(false);
    if (result.status === "error") {
      setMessage({ kind: "error", text: result.message });
      return;
    }
    setMessage({
      kind: "success",
      text: result.status === "already" ? "You're already subscribed!" : "Successfully subscribed to our newsletter!",
    });
    if (result.status === "subscribed") setEmail("");
  };

  return (
    <div className="py-6 px-4 bg-white border-b border-gray-100" data-testid="home-subscribe-strip">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <p className="text-sm text-gray-500">Get peptide research updates</p>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="home-subscribe-panel"
            onClick={toggle}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded border border-orange-300 text-orange-600 text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Subscribe
          </button>
        </div>

        <div id="home-subscribe-panel" hidden={!open} className="mt-4">
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="home-subscribe-email" className="sr-only">
              Email address
            </label>
            <Input
              id="home-subscribe-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              aria-describedby="home-subscribe-status"
              className="flex-1 h-11 min-h-[44px] rounded-full border-gray-200"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={submitting}
              className="h-11 min-h-[44px] rounded-full px-6 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </form>
        </div>

        <p
          id="home-subscribe-status"
          role="status"
          aria-live="polite"
          className={`text-sm mt-3 ${message?.kind === "error" ? "text-red-600" : "text-gray-600"} ${message ? "" : "sr-only"}`}
        >
          {message?.text}
        </p>
      </div>
    </div>
  );
}
