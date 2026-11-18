/**
 * "Daily Fire" popup: one question → a server-picked discount code (5–25%).
 * Overlay only (no page content changes), client-only mount so prerendered
 * HTML/SEO is untouched. Radix Dialog gives the focus trap, Esc, aria-modal
 * and labelling; animations are off for prefers-reduced-motion (index.css).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, Copy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DAILY_FIRE_CODE_TTL_DAYS,
  DAILY_FIRE_CONSENT_TEXT,
  DAILY_FIRE_NAME,
  isDailyFireExcludedPath,
  pickQuestion,
  type QuizQuestion,
} from "@shared/daily-fire";
import { isValidEmail } from "@shared/email-address";
import { isPopupEligible, markClaimed, markDismissed, readDailyFire } from "@/lib/dailyFire";

export const DAILY_FIRE_SPIN_URL = "/api/stripe/create-checkout-session?op=discount-spin";

/** Popup opens after this delay, at 50% scroll depth, or on desktop exit intent (whichever is first). */
export const DAILY_FIRE_DELAY_MS = 12_000;
const MIN_ENGAGED_MS = 4_000;

type Revealed = { code: string; percentOff: number; expiresAt: number; existing?: boolean };

/** Client-side copy of the server's 400 messages (api/_lib/daily-fire-subscriber.ts). */
export const EMAIL_STEP_ERRORS = {
  emailMissing: "Enter your email address to reveal your code.",
  emailInvalid: "Enter a valid email address, like name@example.com.",
  consent: "Check the box to join our email list and reveal your code.",
} as const;

function useOpenTrigger(enabled: boolean, onTrigger: () => void, delayMs: number) {
  useEffect(() => {
    if (!enabled) return;
    const start = Date.now();
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      onTrigger();
    };
    const timer = window.setTimeout(fire, delayMs);
    const onScroll = () => {
      if (Date.now() - start < MIN_ENGAGED_MS) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) fire();
    };
    const finePointer = window.matchMedia?.("(pointer: fine)").matches ?? false;
    const onMouseOut = (e: MouseEvent) => {
      if (!finePointer || Date.now() - start < MIN_ENGAGED_MS) return;
      if (!e.relatedTarget && e.clientY <= 0) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [enabled, onTrigger, delayMs]);
}

export default function DailyFirePopup({ delayMs = DAILY_FIRE_DELAY_MS }: { delayMs?: number }) {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [pendingOther, setPendingOther] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const focusEmail = () => document.getElementById("daily-fire-email")?.focus();
  const [copied, setCopied] = useState(false);
  const shownThisVisit = useRef(false);

  // Client-only: never renders during prerender/SSR.
  useEffect(() => {
    setMounted(true);
    setEligible(isPopupEligible(readDailyFire(), Date.now()));
    // ?daily-fire=1 opens it at once (for review/screenshots); still one claim per browser.
    if (new URLSearchParams(window.location.search).get("daily-fire") === "1") {
      setQuestion(pickQuestion());
      setOpen(true);
      shownThisVisit.current = true;
    }
  }, []);

  const excluded = isDailyFireExcludedPath(location);
  const onTrigger = useCallback(() => {
    if (shownThisVisit.current) return;
    shownThisVisit.current = true;
    setQuestion(pickQuestion());
    setOpen(true);
  }, []);
  useOpenTrigger(mounted && eligible && !excluded && !shownThisVisit.current, onTrigger, delayMs);

  // Navigating to checkout/admin while open closes it without counting as a dismissal.
  useEffect(() => {
    if (excluded && open && !revealed) setOpen(false);
  }, [excluded, open, revealed]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (!revealed) markDismissed();
      setEligible(false);
      setPendingOther(false);
      setOtherText("");
    }
    setOpen(next);
  };

  // Step 1: any answer moves on to the email step (nothing is revealed yet).
  // "Other" (when question.allowOther) first shows an optional text field;
  // Continue then advances. The free text is never sent or stored.
  const answer = (optionId: string) => {
    if (!question || loading || revealed) return;
    setPendingOther(false);
    setOtherText("");
    setAnswerId(optionId);
    setError(null);
    window.setTimeout(focusEmail, 0);
  };

  const selectOption = (optionId: string) => {
    const otherId = question?.allowOther
      ? question.options.find((o) => o.label === "Other")?.id
      : undefined;
    if (otherId && optionId === otherId) {
      setPendingOther(true);
      window.setTimeout(() => document.getElementById("daily-fire-other")?.focus(), 0);
      return;
    }
    answer(optionId);
  };

  // Step 2: email + consent → server saves the subscriber and returns the code.
  const reveal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answerId || loading || revealed) return;
    const trimmed = email.trim();
    const eErr = !trimmed
      ? EMAIL_STEP_ERRORS.emailMissing
      : !isValidEmail(trimmed)
        ? EMAIL_STEP_ERRORS.emailInvalid
        : null;
    const cErr = consent ? null : EMAIL_STEP_ERRORS.consent;
    setEmailError(eErr);
    setConsentError(cErr);
    setError(null);
    if (eErr || cErr) {
      if (eErr) focusEmail();
      else document.getElementById("daily-fire-consent")?.focus();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(DAILY_FIRE_SPIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerId, email: trimmed, consent: true }),
      });
      const body = (await res.json().catch(() => ({}))) as Partial<Revealed> & {
        error?: string;
        field?: "email" | "consent";
      };
      if (res.status === 400 && body.field === "email") {
        setEmailError(body.error || EMAIL_STEP_ERRORS.emailInvalid);
        focusEmail();
        return;
      }
      if (res.status === 400 && body.field === "consent") {
        setConsentError(body.error || EMAIL_STEP_ERRORS.consent);
        return;
      }
      if (!res.ok || typeof body.code !== "string" || typeof body.percentOff !== "number") {
        throw new Error(body.error || "Could not reveal a code right now. Please try again.");
      }
      const r = {
        code: body.code,
        percentOff: body.percentOff,
        expiresAt: Number(body.expiresAt) || 0,
        existing: body.existing === true,
      };
      markClaimed(r.code, r.percentOff, r.expiresAt, Date.now(), trimmed.toLowerCase());
      setRevealed(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reveal a code right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the code is visible and selectable */
    }
  };

  if (!mounted || !question) return null;

  const isTrivia = Boolean(question.answerId);
  const correct = isTrivia && answerId === question.answerId;
  const correctLabel = question.options.find((o) => o.id === question.answerId)?.label;
  const expiresLabel = revealed?.expiresAt
    ? new Date(revealed.expiresAt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto focus:outline-none motion-reduce:animate-none"
        data-testid="daily-fire-popup"
        aria-modal="true"
        // Focus the dialog itself (not the first answer) so no option looks pre-selected;
        // Tab still moves through the answers and the close button, trapped inside.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white" aria-hidden="true">
            <Flame className="h-4 w-4" />
          </span>
          <span className="gradient-text">{DAILY_FIRE_NAME}</span>
        </div>

        {!revealed && !answerId ? (
          <>
            <DialogTitle className="text-2xl leading-snug">{question.prompt}</DialogTitle>
            <DialogDescription>
              Answer one quick question to reveal your code: 5% to 25% off your order.
            </DialogDescription>
            <div role="group" aria-label="Answer options" className="grid gap-2">
              {question.options.map((o) => {
                const otherSelected = pendingOther && o.label === "Other" && Boolean(question.allowOther);
                return (
                  <Button
                    key={o.id}
                    type="button"
                    variant="outline"
                    className={`h-auto min-h-11 justify-start whitespace-normal py-3 text-left font-normal hover:border-orange-400 hover:bg-orange-50${otherSelected ? " border-orange-400 bg-orange-50" : ""}`}
                    aria-pressed={otherSelected}
                    onClick={() => selectOption(o.id)}
                  >
                    {o.label}
                  </Button>
                );
              })}
            </div>
            {pendingOther && question.allowOther ? (
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const otherId = question.options.find((o) => o.label === "Other")?.id;
                  if (otherId) answer(otherId);
                }}
              >
                <div className="grid gap-1.5">
                  <Label htmlFor="daily-fire-other">Tell us (optional)</Label>
                  <Input
                    id="daily-fire-other"
                    type="text"
                    maxLength={100}
                    autoComplete="off"
                    className="h-11"
                    value={otherText}
                    aria-describedby="daily-fire-other-hint"
                    onChange={(e) => setOtherText(e.target.value.slice(0, 100))}
                  />
                  <p id="daily-fire-other-hint" className="sr-only">
                    Optional. This note is not sent or stored.
                  </p>
                </div>
                <Button type="submit" className="h-11 w-full bg-brand-gradient text-white">
                  Continue
                </Button>
              </form>
            ) : null}
            <p className="text-xs text-gray-500">
              Just for fun and general education, not medical advice. One code per visitor.
            </p>
          </>
        ) : !revealed ? (
          <>
            <DialogTitle className="text-2xl leading-snug">Subscribe for more discounts</DialogTitle>
            <DialogDescription>
              We dislike inboxes full of spam as much as you do, so we&apos;ll only email the occasional special offer or important update. Enter your email below, and your Daily Fire discount will be revealed!
            </DialogDescription>
            <form className="grid gap-4" onSubmit={reveal} noValidate aria-busy={loading}>
              <div className="grid gap-1.5">
                <Label htmlFor="daily-fire-email">Email</Label>
                <Input
                  id="daily-fire-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="h-11"
                  value={email}
                  required
                  aria-required="true"
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "daily-fire-email-error" : undefined}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                />
                {emailError ? (
                  <p id="daily-fire-email-error" className="text-sm text-red-600" role="alert">
                    {emailError}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="daily-fire-consent"
                    className="mt-0.5"
                    checked={consent}
                    aria-required="true"
                    aria-invalid={consentError ? true : undefined}
                    aria-describedby={consentError ? "daily-fire-consent-error" : undefined}
                    disabled={loading}
                    onCheckedChange={(v) => {
                      setConsent(v === true);
                      if (v === true) setConsentError(null);
                    }}
                  />
                  <Label htmlFor="daily-fire-consent" className="text-sm font-normal leading-snug text-gray-700">
                    {DAILY_FIRE_CONSENT_TEXT}
                  </Label>
                </div>
                <p className="pl-7 text-xs text-gray-500">
                  See our{" "}
                  <Link href="/privacy" className="underline hover:text-gray-700" onClick={() => setOpen(false)}>
                    Privacy Policy
                  </Link>
                  .
                </p>
                {consentError ? (
                  <p id="daily-fire-consent-error" className="text-sm text-red-600" role="alert">
                    {consentError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="h-11 w-full bg-brand-gradient text-white" disabled={loading}>
                {loading ? "Revealing your code…" : "Reveal my code"}
              </Button>
              {loading ? (
                <p className="sr-only" role="status">Revealing your code…</p>
              ) : null}
              {error ? (
                <p className="text-sm text-red-600" role="alert">{error}</p>
              ) : null}
            </form>
            <p className="text-xs text-gray-500">
              Just for fun and general education, not medical advice. One code per email.
            </p>
          </>
        ) : (
          <>
            <DialogTitle className="text-2xl leading-snug">
              {revealed.existing ? `Your ${revealed.percentOff}% off code` : `You unlocked ${revealed.percentOff}% off`}
            </DialogTitle>
            <DialogDescription>
              {revealed.existing ? "This email already has an active Daily Fire code, so here it is again. " : null}
              {isTrivia
                ? correct
                  ? "Correct! "
                  : `Good guess. The answer is ${correctLabel}. `
                : "Thanks for sharing. "}
              {question.fact ?? ""}
            </DialogDescription>
            <div className="rounded-lg border border-dashed border-orange-400 bg-orange-50 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-600">Your code</p>
              <p className="mt-1 select-all font-mono text-2xl font-semibold tracking-wider" data-testid="daily-fire-code">
                {revealed.code}
              </p>
              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={copy}>
                {copied ? <Check className="mr-1 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-1 h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy code"}
              </Button>
              <span className="sr-only" aria-live="polite">{copied ? "Code copied" : ""}</span>
            </div>
            <p className="text-sm text-gray-600">
              It's saved to your cart and applied automatically at checkout. Single use, expires
              {expiresLabel ? ` ${expiresLabel}` : ` in ${DAILY_FIRE_CODE_TTL_DAYS} days`}. Can't be combined with other codes.
            </p>
            <Link href="/products" onClick={() => setOpen(false)}>
              <Button className="w-full bg-brand-gradient text-white">Shop now</Button>
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
