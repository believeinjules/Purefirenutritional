import { Fragment } from "react";
import type { PeppyResponse } from "@shared/peppy/types";
import { ASSISTANT_DISCLAIMER } from "@shared/peppy/claims";
import { DOCTOR_CONSULT_LINE } from "@shared/peppy/product-notes";
import RichText, { buildMentions, inline } from "./RichText";
import SafetyCallout from "./SafetyCallout";
import StudyCitation from "./StudyCitation";
import { ProductMention, ProductThumbRow } from "./ProductPreview";
import {
  conciseParagraphs,
  splitCitations,
  visibleSuggestions,
} from "@/lib/pepitaPreview";

interface Props {
  answer: PeppyResponse;
  onAsk: (question: string) => void;
  disabled?: boolean;
  headingId: string;
}

/** Studies shown as inline numbers when the text has no [n] markers. */
const INLINE_CITES = 3;

/**
 * One Pepita answer for a first-time shopper: a short paragraph with numbered study links
 * (hover/tap for a plain summary) and product links (hover/tap to zoom), a row of product
 * thumbnails, small next-question chips and a brief note. Extra detail stays one tap away.
 */
export default function PeppyAnswer({ answer, onAsk, disabled, headingId }: Props) {
  const urgent = answer.mode === "urgent";
  // Render-time guard on top of the pipeline filter: hidden products never render.
  const suggestions = visibleSuggestions(answer.products);
  const products = suggestions.map(s => s.product);
  const mentions = buildMentions(products);
  const research = answer.research;
  const paras = conciseParagraphs(answer.summary);
  const hasMarkers = /\[\d+(?:\s*,\s*\d+)*\]/.test(answer.summary);
  const prose = paras.join(" ").toLowerCase();
  const unnamed = products.filter(p => !prose.includes(p.name.toLowerCase()));
  const details = answer.sections.filter(s => s.body.trim());

  return (
    <article className="space-y-3 text-[15px] leading-relaxed text-gray-800" aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        Pepita's answer
      </h2>
      {answer.safety && urgent && <SafetyCallout notice={answer.safety} />}

      <div className="space-y-2 text-gray-900">
        {paras.map((p, pi) => (
          <p key={pi}>
            {splitCitations(p, research.length).map((piece, i) =>
              piece.type === "text" ? (
                <Fragment key={i}>{inline(piece.text, mentions)}</Fragment>
              ) : (
                <StudyCitation key={i} source={research[piece.index]} n={piece.index + 1} />
              )
            )}
            {!hasMarkers && pi === paras.length - 1 && research.length > 0 && (
              <span className="whitespace-nowrap">
                {" "}
                {research.slice(0, INLINE_CITES).map((s, i) => (
                  <StudyCitation key={s.id} source={s} n={i + 1} />
                ))}
              </span>
            )}
          </p>
        ))}
        {!urgent && unnamed.length > 0 && (
          <p className="text-sm text-gray-700">
            Related in our shop:{" "}
            {unnamed.map((p, i) => (
              <Fragment key={p.id}>
                {i > 0 && (i === unnamed.length - 1 ? " and " : ", ")}
                <ProductMention product={p}>{p.name}</ProductMention>
              </Fragment>
            ))}
            . Tap a name for a closer look.
          </p>
        )}
      </div>

      {!urgent && answer.safety && <SafetyCallout notice={answer.safety} />}

      {suggestions.length > 0 && (
        <>
          <ProductThumbRow products={products} />
          <p className="text-xs text-gray-500">
            Research is on the ingredients, not these exact products. {DOCTOR_CONSULT_LINE}
          </p>
        </>
      )}

      {answer.followUps.length > 0 && (
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-900">To tailor this, tell me: </span>
          {answer.followUps.join(" ")}
        </p>
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

      {(details.length > 0 || research.length > 0) && (
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          {details.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer select-none rounded-sm font-medium text-gray-600 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                More detail
              </summary>
              <div className="mt-2 space-y-2 border-l-2 border-orange-100 pl-3 text-sm text-gray-700">
                {details.map((s, i) => (
                  <section key={i}>
                    {s.heading && <h3 className="text-xs font-semibold text-gray-900">{s.heading}</h3>}
                    <RichText text={s.body} products={products} />
                  </section>
                ))}
              </div>
            </details>
          )}
          {research.length > 0 && (
            <details>
              <summary className="cursor-pointer select-none rounded-sm font-medium text-gray-600 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                Sources ({research.length})
              </summary>
              {answer.evidenceNote && <p className="mt-1">{answer.evidenceNote}</p>}
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                {research.map(s => (
                  <li key={s.id} className="[overflow-wrap:anywhere]">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 underline decoration-gray-300 hover:text-orange-700">
                      {s.title}
                    </a>
                    {s.year ? ` (${s.year})` : ""}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}

      {answer.showDisclaimer && (
        <p className="text-[11px] leading-snug text-gray-400">
          {ASSISTANT_DISCLAIMER.replace("\n", " ")}
        </p>
      )}
    </article>
  );
}
