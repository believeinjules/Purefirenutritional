import type { PeppyResponse } from "@shared/peppy/types";
import { HEALTH_FOOTER, withoutGenericDoctorLines } from "@shared/peppy/product-notes";
import { ShieldCheck } from "lucide-react";
import PepitaProtocol from "./PepitaProtocol";
import { inline, buildMentions } from "./RichText";
import SafetyCallout from "./SafetyCallout";
import StudyCitation from "./StudyCitation";
import PepitaProductCard from "./PepitaProductCard";
import { EVIDENCE_CATEGORY, answerProducts, nextQuestions, shortAnswer } from "@/lib/pepitaPreview";

interface Props {
  answer: PeppyResponse;
  /** The shopper's question this answers (decides whether a product card helps). */
  question?: string;
  onAsk: (question: string) => void;
  disabled?: boolean;
  headingId: string;
  /** Offered only after a medically relevant question (opens Questions for my doctor). */
  onDoctorQuestions?: () => void;
  /** Tapping a follow-up question puts it in the input so the shopper can answer it. */
  onAnswerFollowUp?: (question: string) => void;
}

/** Inline research links under the answer (hover/tap for the lay summary). */
const MAX_RESEARCH_LINKS = 2;

/**
 * One Pepita answer (v10): up to 3 product cards first (price, size, Add to Cart, inline
 * details), then a short answer (2–3 sentences, 40–65 words), inline research links, 1–2 follow-up questions as chips,
 * and the deeper science (physiology, mechanisms, how the products differ, what each study
 * investigated, manufacturer protocols) in a collapsed "Learn more". Always ends with the doctor line.
 */
export default function PeppyAnswer({ answer, question, onAsk, disabled, headingId, onDoctorQuestions, onAnswerFollowUp }: Props) {
  const urgent = answer.mode === "urgent";
  const text = shortAnswer(withoutGenericDoctorLines(answer.summary), 3);
  const cards = urgent ? [] : answerProducts(answer.products, question);
  const mentions = buildMentions(cards.map(c => c.product));
  const followUps = urgent ? [] : answer.followUps.slice(0, 1);
  const medicalFirst = !!answer.safety && answer.safety.level !== "info" && cards.length === 0;
  const learnMore = urgent ? [] : (answer.learnMore ?? []);
  const hasLearnMore = learnMore.length > 0 || cards.length > 1 || answer.research.length > 0;
  const research = answer.research.slice(0, MAX_RESEARCH_LINKS);
  const chips = urgent ? [] : nextQuestions(answer.suggestions).slice(0, 3);
  const worth = !urgent && !medicalFirst && answer.safety ? answer.safety : null;

  return (
    <article className="space-y-3 text-[15px] leading-relaxed text-gray-800" aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        Pepita's answer
      </h2>
      {answer.safety && (urgent || medicalFirst) && <SafetyCallout notice={answer.safety} />}

      {cards.length > 0 && (
        <ul className="space-y-2" data-testid="pepita-product-cards" aria-label="Suggested products">
          {cards.map(c => (
            <li key={c.product.id} className="min-w-0">
              <PepitaProductCard suggestion={c} fallbackResearch={answer.research} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-gray-900" data-testid="pepita-answer-text">
        {inline(text, mentions)}
      </p>

      {answer.protocol && <PepitaProtocol protocol={answer.protocol} />}

      {research.length > 0 && (
        <details className="text-sm" data-testid="pepita-research-links">
          <summary className="inline-flex min-h-[44px] cursor-pointer select-none items-center text-xs font-medium text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
            Research ({research.length})
          </summary>
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {research.map((s, i) => (
              <StudyCitation key={s.id} source={s} n={i + 1} />
            ))}
          </div>
        </details>
      )}

      {worth && (
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700" data-testid="pepita-worth-knowing">
          <p className="font-medium text-gray-900">Worth knowing</p>
          <p>{worth.body}</p>
        </div>
      )}

      {followUps.length > 0 && (
        <div data-testid="pepita-follow-ups">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">To narrow it down</p>
          <div className="flex flex-wrap gap-2">
            {followUps.map(q => (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() => (onAnswerFollowUp ? onAnswerFollowUp(q) : onAsk(q))}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-left text-xs text-gray-800 transition-colors hover:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasLearnMore && (
        <details className="group rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700" data-testid="pepita-learn-more">
          <summary className="cursor-pointer select-none font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
            Learn more: the science
          </summary>
          <div className="mt-2 space-y-3">
            {learnMore.map((sec, i) => (
              <div key={i}>
                {sec.heading && <p className="font-medium text-gray-900">{sec.heading}</p>}
                <p>{shortAnswer(sec.body, 12)}</p>
              </div>
            ))}
            {cards.length > 0 && (
              <div>
                <p className="font-medium text-gray-900">Why these products</p>
                <ul className="mt-1 space-y-1.5">
                  {cards.map(c => (
                    <li key={c.product.id}>
                      <span className="font-medium text-gray-900">{c.product.name}:</span> {c.why}{" "}
                      <span className="text-gray-500">{c.evidenceNote}</span>
                      {c.protocol && <span className="mt-0.5 block text-xs text-gray-600">{c.protocol}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {answer.research.length > 0 && (
              <div>
                <p className="font-medium text-gray-900">What the studies investigated</p>
                <ul className="mt-1 space-y-1.5">
                  {answer.research.map(s => (
                    <li key={s.id}>
                      <span className="mr-1 rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-orange-800 ring-1 ring-orange-200">
                        {EVIDENCE_CATEGORY[s.studyType] ?? EVIDENCE_CATEGORY.other}
                      </span>
                      {s.finding}{" "}
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-orange-700 underline underline-offset-2">
                        Read it<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
                {answer.evidenceNote && <p className="mt-1.5 text-xs text-gray-500">{answer.evidenceNote}</p>}
              </div>
            )}
          </div>
        </details>
      )}

      {(chips.length > 0 || onDoctorQuestions) && (
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">You might also want to know</p>
          <div className="flex flex-wrap gap-2">
            {chips.map(q => (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() => onAsk(q)}
                className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-left text-xs text-gray-700 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
            {onDoctorQuestions && (
              <button
                type="button"
                disabled={disabled}
                onClick={onDoctorQuestions}
                data-testid="pepita-offer-doctor-questions"
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-left text-xs font-medium text-orange-800 transition-colors hover:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50"
              >
                Make a list of questions for my doctor
              </button>
            )}
          </div>
        </div>
      )}

      <aside
        className="flex items-start gap-2 rounded-lg bg-gray-50 px-2.5 py-2 text-[11px] leading-snug text-gray-500"
        data-testid="pepita-health-footer"
      >
        <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
        <span>{HEALTH_FOOTER}</span>
      </aside>
    </article>
  );
}
