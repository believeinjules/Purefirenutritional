import type { PeppyResponse } from "@shared/peppy/types";
import { DOCTOR_CONSULT_LINE, withoutGenericDoctorLines } from "@shared/peppy/product-notes";
import { inline, buildMentions } from "./RichText";
import SafetyCallout from "./SafetyCallout";
import StudyCitation from "./StudyCitation";
import { ProductCardSmall } from "./ProductPreview";
import { nextQuestions, relevantProduct, shortAnswer } from "@/lib/pepitaPreview";

interface Props {
  answer: PeppyResponse;
  /** The shopper's question this answers (decides whether a product card helps). */
  question?: string;
  onAsk: (question: string) => void;
  disabled?: boolean;
  headingId: string;
  /** Offered only after a medically relevant question (opens Questions for my doctor). */
  onDoctorQuestions?: () => void;
}

/** Inline research links under the answer (hover/tap for the lay summary). */
const MAX_RESEARCH_LINKS = 3;

/**
 * One Pepita answer (v3): the real answer first in 2–3 natural sentences, then at most:
 * inline research links, one "Worth knowing" note, one relevant product, two next questions.
 * Always ends with the doctor line. Nothing is hidden behind collapsed sections.
 */
export default function PeppyAnswer({ answer, question, onAsk, disabled, headingId, onDoctorQuestions }: Props) {
  const urgent = answer.mode === "urgent";
  const text = shortAnswer(withoutGenericDoctorLines(answer.summary));
  const product = urgent ? null : relevantProduct(answer.products, question);
  const mentions = buildMentions(product ? [product.product] : []);
  const research = answer.research.slice(0, MAX_RESEARCH_LINKS);
  const chips = urgent ? [] : nextQuestions(answer.suggestions);
  const worth = !urgent && answer.safety ? answer.safety : null;

  return (
    <article className="space-y-3 text-[15px] leading-relaxed text-gray-800" aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        Pepita's answer
      </h2>
      {answer.safety && urgent && <SafetyCallout notice={answer.safety} />}

      <p className="text-gray-900" data-testid="pepita-answer-text">
        {inline(text, mentions)}
      </p>

      {research.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" data-testid="pepita-research-links">
          <span className="text-xs text-gray-500">Research:</span>
          {research.map((s, i) => (
            <StudyCitation key={s.id} source={s} n={i + 1} />
          ))}
        </div>
      )}

      {worth && (
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700" data-testid="pepita-worth-knowing">
          <p className="font-medium text-gray-900">Worth knowing</p>
          <p>{worth.body}</p>
        </div>
      )}

      {product && <ProductCardSmall product={product.product} />}

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

      <p className="text-[11px] leading-snug text-gray-500" data-testid="pepita-doctor-line">
        {DOCTOR_CONSULT_LINE}
      </p>
    </article>
  );
}
