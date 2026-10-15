import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { Loader2, Send, X, ExternalLink } from "lucide-react";
import PepitaAvatar from "@/components/peppy/PepitaAvatar";
import PeppyAnswer from "@/components/peppy/PeppyAnswer";
import { askPeppy } from "@/lib/peppyClient";
import { extractProfile } from "@shared/peppy/profile";
import { askPeppyHref } from "@/components/guidance/AskPeppyButton";
import { PEPPY_LIMITS, type PeppyHistoryTurn, type PeppyProfile, type PeppyResponse } from "@shared/peppy/types";

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; answer: PeppyResponse };

let seq = 0;
const nextId = () => `w${++seq}`;

function historyText(m: Msg): string {
  if (m.role === "user") return m.text;
  const a = m.answer;
  return [a.summary, ...(a.products.length ? [`Products shown: ${a.products.map((p) => p.product.name).join(", ")}`] : []), ...a.sections.map((s) => `${s.heading ? `${s.heading}: ` : ""}${s.body}`)]
    .join("\n")
    .slice(0, PEPPY_LIMITS.maxHistoryChars);
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])';

/**
 * Product-page Pepita chat: same engine as /ai-assistant (POST /api/peppy with the
 * in-browser fallback), seeded with the current product. role=dialog, focus trap,
 * Esc / close button / drag-down (mobile) to close. Stays mounted while closed so
 * the conversation survives reopening.
 */
export default function PepitaChatPanel({
  open,
  onClose,
  productId,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}) {
  const baseId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PeppyProfile>({});
  const [drag, setDrag] = useState(0);
  const dragStart = useRef<number | null>(null);

  const starters = [`How do I take ${productName}?`, "What does research say?", "Is it right for my goals?"];

  // Focus into the dialog on open; trap Tab; Esc closes.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    requestAnimationFrame(() => document.getElementById(`${baseId}-title`)?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (!panel.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Mobile sheet: stop the page scrolling underneath.
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const prev = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, baseId]);

  useEffect(() => {
    // Long answers are read top-down: bring the newest message's top into view.
    const log = logRef.current;
    const last = log?.lastElementChild as HTMLElement | null | undefined;
    if (log && last) log.scrollTop = Math.max(0, last.offsetTop - log.offsetTop - 8);
  }, [messages, loading]);

  const send = useCallback(
    async (preset?: string) => {
      const text = (preset ?? input).replace(/\s+/g, " ").trim().slice(0, PEPPY_LIMITS.maxMessageChars);
      if (!text || loading) return;
      const history: PeppyHistoryTurn[] = messages.slice(-PEPPY_LIMITS.maxHistoryTurns).map((m) => ({ role: m.role, content: historyText(m) }));
      const nextProfile = extractProfile(text, profile);
      setProfile(nextProfile);
      setMessages((p) => [...p, { id: nextId(), role: "user", text }]);
      setInput("");
      setLoading(true);
      const answer = await askPeppy({ message: text, history, productId, profile: nextProfile });
      setMessages((p) => [...p, { id: nextId(), role: "assistant", answer }]);
      setLoading(false);
    },
    [input, loading, messages, profile, productId],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  // Drag-down to dismiss (mobile); the close button is the non-drag alternative.
  const onDragStart = (e: PointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null) setDrag(Math.max(0, e.clientY - dragStart.current));
  };
  const onDragEnd = () => {
    if (drag > 90) onClose();
    dragStart.current = null;
    setDrag(0);
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div hidden={!open} className="print:hidden">
      {/* Mobile scrim (tap to close); desktop stays a light popover with the page visible. */}
      <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden="true" onClick={onClose} />
      <div
        id="pepita-widget"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        data-testid="pepita-widget"
        style={drag ? { transform: `translateY(${drag}px)` } : undefined}
        className="pepita-panel fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/10 max-sm:h-[80vh] max-sm:rounded-t-2xl sm:h-[min(600px,calc(100vh-7rem))] sm:w-[380px] sm:rounded-2xl"
      >
        {/* Drag handle (mobile) */}
        <div
          className="flex justify-center pt-2 pb-1 sm:hidden touch-none cursor-grab"
          aria-hidden="true"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <span className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <PepitaAvatar size={36} decorative />
          <div className="min-w-0 flex-1">
            <h2 id={`${baseId}-title`} tabIndex={-1} className="text-sm font-semibold text-gray-900 outline-none">
              Ask Pepita
            </h2>
            <p className="truncate text-xs text-gray-500">AI research assistant · about {productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Pepita chat"
            data-testid="pepita-widget-close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Conversation */}
        <div
          ref={logRef}
          className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversation with Pepita"
        >
          {messages.length === 0 && (
            <div className="text-sm text-gray-700">
              <p>Hi, I'm Pepita! What would you like to know about {productName}?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {starters.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    data-testid="pepita-widget-chip"
                    className="min-h-[36px] rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, mi) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-3 py-2 text-sm text-white [overflow-wrap:anywhere]">
                  <span className="sr-only">You: </span>
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="rounded-xl border bg-white p-3 text-sm shadow-sm">
                <span className="sr-only">Pepita: </span>
                <PeppyAnswer
                  answer={m.answer}
                  question={[...messages.slice(0, mi)].reverse().find((x) => x.role === "user")?.text ?? undefined}
                  onAsk={(q) => void send(q)}
                  onAnswerFollowUp={() => document.getElementById(`${baseId}-input`)?.focus()}
                  disabled={loading}
                  headingId={`${baseId}-${m.id}`}
                />
              </div>
            ),
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500" role="status">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500 motion-reduce:animate-none" aria-hidden="true" />
              Checking the research…
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-3">
          <form onSubmit={onSubmit} className="flex gap-2">
            <label htmlFor={`${baseId}-input`} className="sr-only">
              Ask Pepita a question
            </label>
            <input
              id={`${baseId}-input`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={PEPPY_LIMITS.maxMessageChars}
              placeholder={`Ask about ${productName}…`}
              autoComplete="off"
              enterKeyHint="send"
              className="h-11 min-w-0 flex-1 rounded-md border border-gray-200 px-3 text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              data-testid="pepita-widget-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="bg-brand-gradient flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-white disabled:opacity-50"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-500">
            <span>Not medical advice. Always consult a medical professional.</span>
            <Link
              href={askPeppyHref(productId)}
              className="inline-flex flex-shrink-0 items-center gap-1 font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
              data-testid="pepita-widget-full"
            >
              Open full Pepita <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
