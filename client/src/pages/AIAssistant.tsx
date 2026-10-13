import { Link, useSearch } from "wouter";
import PageSeo from "@/components/seo/PageSeo";
import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type FormEvent,
} from "react";
import {
  Send,
  Bot,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getProductById } from "@/data/products";
import type { ProtocolGoal, ProtocolSex } from "@/data/protocols";
import {
  GOAL_TEXT,
  doctorQuestionsMessage,
  parsePeppyParams,
  peppyPrefill,
  peppySchedule,
} from "@/lib/peppyContext";
import { askPeppy } from "@/lib/peppyClient";
import PeppyAnswer from "@/components/peppy/PeppyAnswer";
import RichText from "@/components/peppy/RichText";
import {
  PEPPY_LIMITS,
  type PeppyHistoryTurn,
  type PeppyResponse,
} from "@shared/peppy/types";

/** Bump the suffix if the modal wording ever changes, so everyone sees it again. */
const DISCLAIMER_KEY = "pf-peppy-disclaimer-v1";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; kind: "answer"; answer: PeppyResponse }
  | { id: string; role: "assistant"; kind: "text"; text: string };

const QUICK_QUESTIONS = [
  "Why am I tired in the afternoon?",
  "What is Epitalon?",
  "Do Khavinson peptides actually work in humans?",
  "Which Pure Fire product for sleep?",
  "Can I take Endoluten with melatonin?",
  "What helps achy joints?",
];

/** Plain-text version of an answer for the conversation history sent to the server. */
function historyText(m: ChatMessage): string {
  if (m.role === "user" || m.kind === "text") return m.text;
  const a = m.answer;
  return [
    a.summary,
    ...a.sections.map(s => `${s.heading ? `${s.heading}: ` : ""}${s.body}`),
  ]
    .join("\n")
    .slice(0, PEPPY_LIMITS.maxHistoryChars);
}

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

export default function AIAssistant() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageRefs = useRef(new Map<string, HTMLDivElement>());
  const baseId = useId();

  // First-visit disclaimer (localStorage is read after mount so prerendered HTML matches).
  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISCLAIMER_KEY) !== "accepted")
        setShowDisclaimer(true);
    } catch {
      setShowDisclaimer(true);
    }
  }, []);
  const acceptDisclaimer = () => {
    try {
      window.localStorage.setItem(DISCLAIMER_KEY, "accepted");
    } catch {
      // Private mode: the notice simply shows again next visit.
    }
    setShowDisclaimer(false);
  };

  // Bring the newest message's top into view (long answers are read top-down).
  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (!lastId) return;
    messageRefs.current
      .get(lastId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [lastId]);

  // Hand-off from a product page: /ai-assistant?product=&goal=&sex=
  const search = useSearch();
  const params = parsePeppyParams(search, id => !!getProductById(id));
  const contextProduct = params.productId
    ? getProductById(params.productId)
    : undefined;
  const [goal, setGoal] = useState<ProtocolGoal | undefined>(params.goal);
  const [sex, setSex] = useState<ProtocolSex | undefined>(params.sex);
  useEffect(() => {
    setGoal(params.goal);
    setSex(params.sex);
    if (contextProduct)
      setInput(peppyPrefill(contextProduct.name, params.goal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const schedule = contextProduct
    ? peppySchedule(contextProduct.id, goal, sex)
    : null;

  const askDoctorQuestions = () => {
    setMessages(prev => [
      ...prev,
      { id: nextId(), role: "user", text: "Questions for my doctor" },
      {
        id: nextId(),
        role: "assistant",
        kind: "text",
        text: doctorQuestionsMessage(contextProduct?.name),
      },
    ]);
  };

  const send = useCallback(
    async (preset?: string) => {
      const text = (preset ?? input)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, PEPPY_LIMITS.maxMessageChars);
      if (!text || isLoading) return;
      const history: PeppyHistoryTurn[] = messages
        .slice(-PEPPY_LIMITS.maxHistoryTurns)
        .map(m => ({ role: m.role, content: historyText(m) }));
      setMessages(prev => [...prev, { id: nextId(), role: "user", text }]);
      setInput("");
      setIsLoading(true);
      const answer = await askPeppy({
        message: text,
        history,
        productId: contextProduct?.id,
      });
      setMessages(prev => [
        ...prev,
        { id: nextId(), role: "assistant", kind: "answer", answer },
      ]);
      setIsLoading(false);
      document
        .getElementById(`${baseId}-input`)
        ?.focus({ preventScroll: true });
    },
    [input, isLoading, messages, contextProduct?.id, baseId]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="AI Health Optimizer | Pure Fire Nutritional"
        description="Ask Peppy, Pure Fire's research assistant, about peptide bioregulators, supplements and wellness goals: direct answers with linked PubMed studies, their limitations, and related products."
        path="/ai-assistant"
        type="website"
      />
      <Navigation />

      {/* Disclaimer Modal — shown on first visit; reopen from the footer link */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-6 h-6" />
              Important Medical Disclaimer
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-700 space-y-4">
            <p>
              <strong>
                This AI assistant is for informational purposes only.
              </strong>
            </p>
            <p>
              The information provided by this AI assistant is not intended to
              be a substitute for professional medical advice, diagnosis, or
              treatment. Always seek the advice of your physician or other
              qualified health provider with any questions you may have
              regarding a medical condition.
            </p>
            <p>
              Never disregard professional medical advice or delay in seeking it
              because of something you have read or received from this AI
              assistant.
            </p>
            <p>
              These products are dietary supplements and are not intended to
              diagnose, treat, cure, or prevent any disease. Individual results
              may vary.
            </p>
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={acceptDisclaimer}
              className="w-full bg-brand-gradient"
            >
              I Understand and Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-gradient text-white px-6 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Peppy 2.0</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Your Personal Health Guide
            </h1>
            <p className="text-gray-600">
              Ask about a symptom, goal, peptide or product. Peppy answers
              first, shows the research and its limits, and only then any
              related products.
            </p>
          </div>

          {/* Product context from the product page */}
          {contextProduct && (
            <Card className="mb-4" data-testid="peppy-product-context">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-gray-700">
                    Asking about{" "}
                    <Link
                      href={`/products/${contextProduct.id}`}
                      className="font-semibold text-gray-900 hover:underline"
                    >
                      {contextProduct.name}
                    </Link>
                  </p>
                  <div
                    className="flex flex-wrap gap-1.5"
                    role="group"
                    aria-label="Goal"
                  >
                    {(["preventive", "restorative"] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={goal === g}
                        onClick={() => {
                          setGoal(g);
                          setInput(peppyPrefill(contextProduct.name, g));
                        }}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          goal === g
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {GOAL_TEXT[g].charAt(0).toUpperCase() +
                          GOAL_TEXT[g].slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {schedule && (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm">
                    {schedule.sexSpecific && (
                      <div
                        className="mb-2 flex gap-1.5"
                        role="group"
                        aria-label="Schedule for"
                      >
                        {(["women", "men"] as const).map(s => (
                          <button
                            key={s}
                            type="button"
                            aria-pressed={(sex ?? "women") === s}
                            onClick={() => setSex(s)}
                            className={`rounded-full px-3 py-0.5 text-xs ${(sex ?? "women") === s ? "bg-orange-50 text-orange-800" : "text-gray-500"}`}
                          >
                            {s === "women" ? "Women's" : "Men's"}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Manufacturer protocol
                    </p>
                    <dl className="space-y-1">
                      {schedule.rows.map(r => (
                        <div
                          key={r.label}
                          className="flex justify-between gap-4"
                        >
                          <dt className="text-gray-500">{r.label}</dt>
                          <dd className="text-gray-900 text-right">
                            {r.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {schedule.note && (
                      <p className="mt-2 text-xs text-gray-500">
                        {schedule.note}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Chat */}
          <Card className="mb-4">
            <CardContent className="p-0">
              <div
                className="space-y-5 p-4 sm:p-5"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Conversation with Peppy"
                data-testid="peppy-log"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Bot
                      className="w-14 h-14 mx-auto mb-3 text-orange-300"
                      aria-hidden="true"
                    />
                    <p className="text-gray-700">
                      Hi! I'm Peppy, Pure Fire's research assistant.
                    </p>
                    <p className="text-sm">
                      Ask a question, or try one of these:
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {QUICK_QUESTIONS.map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => void send(q)}
                          className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(m => (
                  <div
                    key={m.id}
                    ref={el => {
                      if (el) messageRefs.current.set(m.id, el);
                      else messageRefs.current.delete(m.id);
                    }}
                    className={`scroll-mt-24 flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
                    data-testid={
                      m.role === "user"
                        ? "peppy-user-message"
                        : "peppy-assistant-message"
                    }
                  >
                    {m.role === "assistant" && (
                      <div
                        className="hidden sm:flex w-8 h-8 bg-brand-gradient rounded-full items-center justify-center flex-shrink-0"
                        aria-hidden="true"
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {m.role === "user" ? (
                      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-4 py-2 text-white [overflow-wrap:anywhere]">
                        <span className="sr-only">You: </span>
                        {m.text}
                      </p>
                    ) : (
                      <div className="min-w-0 flex-1 rounded-xl border bg-white p-4 shadow-sm">
                        <span className="sr-only">Peppy: </span>
                        {m.kind === "answer" ? (
                          <PeppyAnswer
                            answer={m.answer}
                            onAsk={q => void send(q)}
                            disabled={isLoading}
                            headingId={`${baseId}-${m.id}`}
                          />
                        ) : (
                          <RichText
                            text={m.text}
                            className="text-[15px] leading-relaxed text-gray-800"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div
                    className="flex items-center gap-2 text-sm text-gray-500"
                    role="status"
                  >
                    <Loader2
                      className="h-4 w-4 animate-spin text-orange-500"
                      aria-hidden="true"
                    />
                    Checking the research…
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="sticky bottom-0 rounded-b-xl border-t bg-white/95 p-3 backdrop-blur sm:p-4">
                <form onSubmit={onSubmit} className="flex gap-2">
                  <label htmlFor={`${baseId}-input`} className="sr-only">
                    Ask Peppy a question
                  </label>
                  <Input
                    id={`${baseId}-input`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    maxLength={PEPPY_LIMITS.maxMessageChars}
                    placeholder="Ask about a symptom, peptide or product…"
                    className="flex-1"
                    autoComplete="off"
                    data-testid="peppy-input"
                  />
                  <Button
                    type="submit"
                    className="bg-brand-gradient"
                    disabled={!input.trim() || isLoading}
                    aria-label="Send"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={askDoctorQuestions}
                    className="text-xs"
                    data-testid="peppy-doctor-questions"
                  >
                    <ClipboardList className="w-3.5 h-3.5 mr-1" />
                    Questions for my doctor
                  </Button>
                  {input.length > PEPPY_LIMITS.maxMessageChars - 150 && (
                    <span className="text-xs text-gray-500" aria-live="polite">
                      {PEPPY_LIMITS.maxMessageChars - input.length} characters
                      left
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer Footer */}
          <p className="text-xs text-gray-500 text-center">
            These statements have not been evaluated by the FDA. Always consult
            a medical professional.{" "}
            <button
              type="button"
              onClick={() => setShowDisclaimer(true)}
              className="underline underline-offset-2 hover:text-gray-700"
            >
              Full disclaimer
            </button>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
