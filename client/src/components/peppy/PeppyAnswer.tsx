import type { PeppyResponse } from "@shared/peppy/types";
import { ASSISTANT_DISCLAIMER } from "@shared/peppy/claims";
import RichText from "./RichText";
import SourceCard from "./SourceCard";
import ProductSuggestionCard from "./ProductSuggestionCard";
import SafetyCallout from "./SafetyCallout";

interface Props {
  answer: PeppyResponse;
  onAsk: (question: string) => void;
  disabled?: boolean;
  headingId: string;
}

/**
 * One structured Peppy answer: direct answer → details → research (with limitations) →
 * optional related products → follow-ups / next questions → compact FDA note.
 */
export default function PeppyAnswer({
  answer,
  onAsk,
  disabled,
  headingId,
}: Props) {
  const urgent = answer.mode === "urgent";
  return (
    <article
      className="space-y-4 text-[15px] leading-relaxed text-gray-800"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="sr-only">
        Peppy's answer
      </h2>
      {urgent && answer.safety ? (
        <SafetyCallout notice={answer.safety} />
      ) : null}
      <RichText
        text={answer.summary}
        className={urgent ? "text-gray-900" : "text-base text-gray-900"}
      />

      {!urgent && answer.safety && <SafetyCallout notice={answer.safety} />}

      {answer.sections.map((s, i) => (
        <section key={i}>
          {s.heading && (
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {s.heading}
            </h3>
          )}
          <RichText text={s.body} />
        </section>
      ))}

      {answer.research.length > 0 && (
        <section aria-label="Research sources">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Sources
          </h3>
          {answer.evidenceNote && (
            <p className="mb-2 text-sm text-gray-600">{answer.evidenceNote}</p>
          )}
          <ul className="space-y-2">
            {answer.research.map(s => (
              <SourceCard key={s.id} source={s} />
            ))}
          </ul>
        </section>
      )}

      {answer.products.length > 0 && (
        <section aria-label="Related products">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Related products (optional)
          </h3>
          <p className="mb-2 text-xs text-gray-500">
            Evidence above is for ingredients or related preparations, not these
            exact products.
          </p>
          <ul className="space-y-2">
            {answer.products.map(p => (
              <ProductSuggestionCard key={p.product.id} suggestion={p} />
            ))}
          </ul>
        </section>
      )}

      {answer.followUps.length > 0 && (
        <section
          aria-label="Questions to tailor this answer"
          className="rounded-lg bg-orange-50/60 p-3"
        >
          <h3 className="mb-1 text-sm font-semibold text-gray-900">
            To tailor this, tell me:
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm marker:text-orange-400">
            {answer.followUps.map(q => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      {answer.suggestions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Ask next</p>
          <div className="flex flex-wrap gap-2">
            {answer.suggestions.map(q => (
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
          </div>
        </div>
      )}

      {answer.showDisclaimer && (
        <p className="border-t border-gray-100 pt-2 text-[11px] leading-snug text-gray-400">
          {ASSISTANT_DISCLAIMER.replace("\n", " ")}
        </p>
      )}
    </article>
  );
}
