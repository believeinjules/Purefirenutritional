/**
 * "Daily Fire" popup: one question → a server-picked discount code (5–25%).
 * Overlay only (no page content changes), client-only mount so prerendered
 * HTML/SEO is untouched. Radix Dialog gives the focus trap, Esc, aria-modal
 * and labelling; animations are off for prefers-reduced-motion (index.css).
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
/** Pause after tapping a standard answer so the check mark registers before the email step. */
export const DAILY_FIRE_AUTO_ADVANCE_MS = 280;
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const advanceTimer = useRef<number | null>(null);
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
  const clearAdvance = () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };
  useEffect(() => clearAdvance, []);

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
      clearAdvance();
      setSelectedId(null);
      setOtherText("");
    }
    setOpen(next);
  };

  // Step 1: any answer moves on to the email step (nothing is revealed yet).
  // A standard option auto-advances after a short pause; "Other" (when
  // question.allowOther) shows an optional one-line note plus Continue.
  // The free text is never sent or stored.
  const otherId = question?.allowOther
    ? question.options.find((o) => o.label === "Other")?.id
    : undefined;
  const otherSelected = Boolean(otherId) && selectedId === otherId;

  const answer = (optionId: string) => {
    if (!question || loading || revealed) return;
    clearAdvance();
    setOtherText("");
    setAnswerId(optionId);
    setError(null);
    window.setTimeout(focusEmail, 0);
  };

  const selectOption = (optionId: string) => {
    if (!question || loading || revealed || advanceTimer.current !== null) return;
    setSelectedId(optionId);
    if (otherId && optionId === otherId) {
      window.setTimeout(() => document.getElementById("daily-fire-other")?.focus(), 0);
      return;
    }
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      answer(optionId);
    }, DAILY_FIRE_AUTO_ADVANCE_MS);
  };

  // Radio-group keyboard pattern: arrows/Home/End move focus and the check
  // (without advancing); Space/Enter (native button click) confirms.
  const onOptionKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!question || advanceTimer.current !== null) return;
    const n = question.options.length;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (index + 1) % n
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (index - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    const id = question.options[next].id;
    setSelectedId(id);
    document.getElementById(`daily-fire-opt-${id}`)?.focus();
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

  const rovingId = selectedId ?? question.options[0]?.id;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="grid-cols-[minmax(0,1fr)] max-w-[calc(100%-2.5rem)] gap-3 rounded-2xl p-5 sm:max-w-[26rem] sm:p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto focus:outline-none motion-reduce:animate-none"
        data-testid="daily-fire-popup"
        aria-modal="true"
        // Focus the dialog itself (not the first answer) so no option looks pre-selected;
        // Tab still moves through the answers and the close button, trapped inside.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <Flame className="h-3.5 w-3.5 text-[#E06050]" aria-hidden="true" />
          <span className="gradient-text">{DAILY_FIRE_NAME}</span>
        </div>

        {!revealed && !answerId ? (
          <>
            <div className="grid gap-1 pr-6">
              <DialogTitle className="text-xl leading-tight">{question.prompt}</DialogTitle>
              <DialogDescription className="text-[13px] text-gray-500">
                Answer one question to unlock 5–25% off.
              </DialogDescription>
            </div>
            <div role="radiogroup" aria-label="Answer options" className="-mx-1.5 grid gap-0.5">
              {question.options.map((o, i) => {
                const checked = selectedId === o.id;
                return (
                  <button
                    key={o.id}
                    id={`daily-fire-opt-${o.id}`}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    tabIndex={o.id === rovingId ? 0 : -1}
                    onClick={() => selectOption(o.id)}
                    onKeyDown={(e) => onOptionKeyDown(e, i)}
                    className={`group flex min-h-10 w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left text-sm transition-colors hover:bg-orange-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 ${checked ? "bg-orange-50/70 font-medium text-gray-900" : "text-gray-700"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${checked ? "border-transparent bg-brand-gradient" : "border-gray-300 bg-white group-hover:border-orange-400"}`}
                    >
                      {checked ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
                    </span>
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
            {otherSelected && otherId ? (
              <form
                className="-mt-1 flex items-end gap-2 pl-[30px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  answer(otherId);
                }}
              >
                <label htmlFor="daily-fire-other" className="sr-only">Tell us (optional)</label>
                <input
                  id="daily-fire-other"
                  type="text"
                  maxLength={100}
                  autoComplete="off"
                  placeholder="Tell us (optional)"
                  className="h-8 w-0 min-w-0 flex-1 rounded-none border-0 border-b border-gray-300 bg-transparent px-0 text-base text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-0 sm:text-sm"
                  value={otherText}
                  aria-describedby="daily-fire-other-hint"
                  onChange={(e) => setOtherText(e.target.value.slice(0, 100))}
                />
                <p id="daily-fire-other-hint" className="sr-only">
                  Optional. This note is not sent or stored.
                </p>
                <Button type="submit" size="sm" className="h-8 shrink-0 rounded-full bg-brand-gradient px-4 text-xs text-white">
                  Continue
                </Button>
              </form>
            ) : null}
            <p className="text-[11px] text-gray-500">For fun and education, not medical advice.</p>
          </>
        ) : !revealed ? (
          <>
            <div className="grid gap-1.5 pr-6">
              <DialogTitle className="text-xl leading-tight">Subscribe for more discounts</DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
                We dislike inboxes full of spam as much as you do, so we&apos;ll only email the occasional special offer or important update. Enter your email below, and your Daily Fire discount will be revealed!
              </DialogDescription>
            </div>
            <form className="grid gap-3" onSubmit={reveal} noValidate aria-busy={loading}>
              <div className="grid gap-1">
                <Label htmlFor="daily-fire-email" className="sr-only">Email</Label>
                <Input
                  id="daily-fire-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Your email"
                  className="h-10 focus-visible:border-orange-400 focus-visible:ring-orange-200"
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
                  <p id="daily-fire-email-error" className="text-xs text-red-600" role="alert">
                    {emailError}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="daily-fire-consent"
                    className="mt-px data-[state=checked]:border-transparent data-[state=checked]:bg-[#E06050]"
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
                  <p className="text-xs leading-snug text-gray-600">
                    <Label htmlFor="daily-fire-consent" className="inline text-xs font-normal leading-snug text-gray-600">
                      {DAILY_FIRE_CONSENT_TEXT}
                    </Label>{" "}
                    <Link href="/privacy" className="whitespace-nowrap text-gray-500 underline hover:text-gray-600" onClick={() => setOpen(false)}>
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                {consentError ? (
                  <p id="daily-fire-consent-error" className="text-xs text-red-600" role="alert">
                    {consentError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="h-10 w-full rounded-full bg-brand-gradient text-white" disabled={loading}>
                {loading ? "Revealing your code…" : "Reveal my code"}
              </Button>
              {loading ? (
                <p className="sr-only" role="status">Revealing your code…</p>
              ) : null}
              {error ? (
                <p className="text-xs text-red-600" role="alert">{error}</p>
              ) : null}
            </form>
          </>
        ) : (
          <>
            <div className="grid gap-1.5 pr-6">
              <DialogTitle className="text-xl leading-tight">
                {revealed.existing ? `Your ${revealed.percentOff}% off code` : `You unlocked ${revealed.percentOff}% off`}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
                {revealed.existing ? "This email already has an active Daily Fire code, so here it is again. " : null}
                {isTrivia
                  ? correct
                    ? "Correct! "
                    : `Good guess. The answer is ${correctLabel}. `
                  : "Thanks for sharing. "}
                {question.fact ?? ""}
              </DialogDescription>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/70 py-2 pl-4 pr-2">
              <p className="select-all font-mono text-lg font-semibold tracking-wider text-gray-900" data-testid="daily-fire-code">
                {revealed.code}
              </p>
              <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs text-gray-600 hover:bg-orange-100" onClick={copy}>
                {copied ? <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="mr-1 h-3.5 w-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <span className="sr-only" aria-live="polite">{copied ? "Code copied" : ""}</span>
            </div>
            <p className="text-[11px] leading-snug text-gray-500">
              Saved to your cart and applied at checkout. Single use, expires
              {expiresLabel ? ` ${expiresLabel}` : ` in ${DAILY_FIRE_CODE_TTL_DAYS} days`}. Can&apos;t be combined with other codes.
            </p>
            <Link href="/products" onClick={() => setOpen(false)}>
              <Button className="h-10 w-full rounded-full bg-brand-gradient text-white">Shop now</Button>
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
