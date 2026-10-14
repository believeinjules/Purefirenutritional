import type { PeppyResponse } from "@shared/peppy/types";
import { CONSULT_LINE, HEALTH_FOOTER, SYMPTOM_FOOTER, withoutGenericDoctorLines } from "@shared/peppy/product-notes";
import { AlertTriangle, CalendarDays, FileText, Leaf, Pill, Sparkles, Stethoscope, Sun } from "lucide-react";
import PepitaAccordions from "./PepitaAccordions";
import PepitaProtocol, { KindLabel } from "./PepitaProtocol";
import { inline, buildMentions } from "./RichText";
import SafetyCallout from "./SafetyCallout";
import StudyCitation from "./StudyCitation";
import PepitaProductCard from "./PepitaProductCard";
import { EVIDENCE_CATEGORY, answerProducts, shortAnswer } from "@/lib/pepitaPreview";

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
  // 0–2 contextual questions; no generic chips.
  const followUps = urgent ? [] : answer.followUps.slice(0, 2);
  const learnMore = urgent ? [] : (answer.learnMore ?? []);
  const hasLearnMore = learnMore.length > 0 || answer.research.length > 0;
  const research = answer.research.slice(0, MAX_RESEARCH_LINKS);
  const medicalFirst = !!answer.safety && answer.safety.level !== "info";
  const substantive = answer.showDisclaimer || urgent;
  const facts = answer.dosingFacts;
  const protocols = urgent ? [] : (answer.protocols ?? []);
  const layout = urgent ? undefined : answer.layout;
  const accordions = urgent ? [] : (answer.accordions ?? []);
  const curated = !!layout; // mockup layouts: References live in the accordions, no "Learn more"

  return (
    <article className="space-y-3 text-[15px] leading-relaxed text-gray-800" aria-labelledby={headingId} data-testid="pepita-answer">
      <h2 id={headingId} className="sr-only">
        Pepita's answer
      </h2>
      {substantive && (
        <p className="font-medium text-gray-900" data-testid="pepita-consult-line">{CONSULT_LINE}</p>
      )}
      {answer.safety && medicalFirst && layout !== "symptom" && <SafetyCallout notice={answer.safety} />}

      {facts && (
        <dl className="space-y-3 rounded-2xl bg-orange-50 px-4 py-3.5 text-[15px] ring-1 ring-orange-100" data-testid="pepita-dosing-facts" aria-label={`How to take ${facts.product}`}>
          {([
            ["Dose", facts.dose, Pill],
            ["Timing", facts.timing, Sun],
            ["Course length", facts.course, CalendarDays],
            ["Source", facts.source, FileText],
          ] as const).filter(([, v]) => !!v).map(([k, v, Icon]) => (
            <div key={k} className="flex items-start gap-2">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-800" aria-hidden="true" />
              <div className="min-w-0"><dt className="inline font-semibold text-gray-900">{k}: </dt><dd className="inline">{v}</dd></div>
            </div>
          ))}
        </dl>
      )}

      <p className="text-gray-900" data-testid="pepita-answer-text">
        {inline(text, mentions)}
      </p>

      {protocols.map(pr => <PepitaProtocol key={pr.id} protocol={pr} />)}

      {cards.length > 0 && layout === "symptom" && (
        <section className="rounded-2xl border border-orange-100 bg-orange-50/40 p-2.5" aria-label="Peptides that may be helpful">
          <p className="mb-2 flex items-center gap-2 px-1 font-semibold text-orange-600" data-testid="pepita-helpful-heading">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Peptides that may be helpful
          </p>
          <ul className="space-y-2" data-testid="pepita-product-cards" aria-label="Suggested products">
            {cards.map(c => (
              <li key={c.product.id} className="min-w-0">
                <PepitaProductCard suggestion={c} fallbackResearch={answer.research} variant="row" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {cards.length > 0 && layout !== "symptom" && (
        <ul className="space-y-1.5" data-testid="pepita-product-cards" aria-label="Suggested products">
          {cards.map(c => (
            <li key={c.product.id} className="min-w-0">
              <PepitaProductCard suggestion={c} fallbackResearch={answer.research} variant={layout === "dosing" && cards.length === 1 ? "hero" : "card"} />
            </li>
          ))}
        </ul>
      )}

      {answer.supportive && answer.supportive.length > 0 && (
        <section className="rounded-2xl bg-orange-50/60 px-4 py-3 text-sm ring-1 ring-orange-100" data-testid="pepita-supportive">
          <p className="mb-1.5 flex items-center gap-2 font-semibold text-gray-900">
            <Leaf className="h-4 w-4 text-green-700" aria-hidden="true" /> Other supportive approaches
          </p>
          <ul className="list-disc space-y-0.5 pl-5 text-gray-700">
            {answer.supportive.map(x => <li key={x}>{x}</li>)}
          </ul>
        </section>
      )}

      {curated && (accordions.length > 0 || research.length > 0) && <PepitaAccordions items={accordions} research={research} />}

      {!curated && research.length > 0 && (
        <details className="text-sm" data-testid="pepita-research-links">
          <summary className="inline-flex min-h-[44px] cursor-pointer select-none items-center text-xs font-medium text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
            References ({research.length})
          </summary>
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {research.map((s, i) => (
              <StudyCitation key={s.id} source={s} n={i + 1} />
            ))}
          </div>
        </details>
      )}

      {!curated && hasLearnMore && (
        <details className="group rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700" data-testid="pepita-learn-more">
          <summary className="flex min-h-[44px] cursor-pointer select-none items-center font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
            Learn more
          </summary>
          <div className="mb-2 space-y-3">
            {learnMore.map((sec, i) => (
              <div key={i}>
                {sec.heading && <p className="font-medium text-gray-900">{sec.heading}</p>}
                <p>{shortAnswer(sec.body, 12)}</p>
              </div>
            ))}
            {answer.research.length > 0 && (
              <div>
                <p className="flex items-center gap-2 font-medium text-gray-900">What the studies investigated <KindLabel kind="research" /></p>
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

      {(followUps.length > 0 || onDoctorQuestions) && (
        <div className="flex flex-wrap gap-2" data-testid="pepita-follow-ups">
          {followUps.map(q => (
            <button
              key={q}
              type="button"
              disabled={disabled}
              onClick={() => (onAnswerFollowUp ? onAnswerFollowUp(q) : onAsk(q))}
              className="min-h-[44px] rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-left text-xs text-gray-800 transition-colors hover:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50"
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
              className="min-h-[44px] rounded-full border border-orange-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-orange-800 transition-colors hover:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-50"
            >
              Make a list of questions for my doctor
            </button>
          )}
        </div>
      )}

      {substantive && (layout === "symptom" ? (
        <aside
          className="flex items-start gap-3 rounded-2xl bg-pink-50 px-4 py-3 text-xs leading-snug text-gray-700 ring-1 ring-pink-100"
          data-testid="pepita-health-footer"
          data-variant="symptom"
        >
          <Stethoscope className="mt-px h-5 w-5 shrink-0 text-pink-700" aria-hidden="true" />
          <span>{SYMPTOM_FOOTER}</span>
        </aside>
      ) : (
        <aside
          className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-snug text-gray-700 ring-1 ring-amber-100"
          data-testid="pepita-health-footer"
        >
          <AlertTriangle className="mt-px h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <span>{HEALTH_FOOTER}</span>
        </aside>
      ))}
    </article>
  );
}
