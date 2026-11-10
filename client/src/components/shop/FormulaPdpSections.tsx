import { isPrimePeptide } from "@/data/formulaType";
import {
  DOSAGE_COURSE_HEADING,
  DOSAGE_COURSE_PARAGRAPHS,
  FDA_DISCLAIMER,
  type FormulaPdpContent,
} from "@/data/formulaPreviewContent";
import { CompareRelatedFormulas } from "@/components/shop/FormulaTypeParts";
import PdpAccordion from "@/components/shop/PdpAccordion";
import { doctorQuestionsWithout } from "@/data/doctorQuestions";

const h2 = "text-lg font-semibold text-gray-900 mb-3 pb-2 border-b";
const body = "text-gray-600 leading-relaxed";

/**
 * Shared "Dosage & Course Information" for capsule/tablet products. Never renders for
 * Prime Peptide products. Mounted only on rolled-out pages.
 */
export function DosageCourseInfo({ productId, show }: { productId: string; show: boolean }) {
  if (isPrimePeptide(productId) || !show) return null;
  return (
    <section data-testid="pdp-dosage-course" aria-labelledby="pdp-dosage-course-h">
      <h2 id="pdp-dosage-course-h" className={h2}>{DOSAGE_COURSE_HEADING}</h2>
      <div className="space-y-3">
        {DOSAGE_COURSE_PARAGRAPHS.map((p) => (
          <p key={p} className={`${body} text-sm`}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/** Below-the-fold sections of the preview template, in Julia's order. */
export function FormulaPdpBody({
  productId,
  content,
  otherIngredients,
  showDosageCourse,
}: {
  productId: string;
  content: FormulaPdpContent;
  /** Existing label line(s) such as "Other ingredients: …", kept as they are on the page today. */
  otherIngredients: string[];
  showDosageCourse: boolean;
}) {
  const { manufacturerDirections: md } = content;
  return (
    <>
      <section data-testid="pdp-ingredients-section">
        <h2 className={h2}>Ingredients</h2>
        <ul className="space-y-1.5 text-sm text-gray-700">
          {content.ingredients.map((x) => <li key={x}>{x}</li>)}
          {/* Amount per capsule: intentionally not rendered until verified (see FormulaPdpContent.amountPerCapsule). */}
          {content.amountPerCapsule && <li>{content.amountPerCapsule}</li>}
          {otherIngredients.map((x) => <li key={x} className="text-gray-500">{x}</li>)}
        </ul>
      </section>

      <section data-testid="pdp-biological-focus">
        <h2 className={h2}>Biological Focus</h2>
        <h3 className="font-semibold text-gray-900 mb-2">{content.biologicalFocus.heading}</h3>
        <p className={body}>{content.biologicalFocus.body}</p>
      </section>

      {content.about && (
        <section data-testid="pdp-overview">
          <h2 className={h2}>About This Product</h2>
          <p className={body}>{content.about}</p>
        </section>
      )}

      <section data-testid="pdp-manufacturer-directions">
        <h2 className={h2}>Manufacturer Directions</h2>
        {md.source && (
          <div className="mb-3 text-sm text-gray-700">
            <p className="text-xs text-gray-500 mb-1">{md.source.attribution}</p>
            <p>{md.source.text}</p>
          </div>
        )}
        <p className={`${body} text-sm`}>{md.line}</p>
      </section>

      <CompareRelatedFormulas
        productId={productId}
        intro={content.compareIntro}
        className="pt-4 border-t-4 border-gray-100"
      />

      <section data-testid="pdp-research">
        <h2 className={h2}>Research &amp; Biological Context</h2>
        <p className={body}>{content.research}</p>
      </section>

      <section data-testid="pdp-important-information">
        <h2 className={h2}>Important Information</h2>
        <p className={`${body} text-sm`}>{content.importantInformation}</p>
        <p className="mt-3 text-xs text-gray-500" data-testid="pdp-fda">{FDA_DISCLAIMER}</p>
      </section>

      <DosageCourseInfo productId={productId} show={showDosageCourse} />
    </>
  );
}

/**
 * Streamlined readability (round 3): darker gray-800 body text, a touch
 * larger on mobile (17px) than the 16px/gray-600 template; secondary text gray-700 at
 * 15px mobile / 14px desktop; headings without rules.
 */
export const STREAMLINED_BODY = "text-[17px] md:text-base leading-relaxed text-gray-800";
export const STREAMLINED_SMALL = "text-[15px] md:text-sm leading-relaxed text-gray-700";
const sh2 = "text-lg font-semibold text-gray-900 mb-2";

/**
 * Streamlined below-the-fold body: essentials visible (Ingredients, Biological Focus,
 * Dosage & Course Information, compact Compare card), deeper reading collapsed (Research &
 * Evidence; Safety & FAQs) with the FDA disclaimer once, at the bottom of that card.
 * Native <details> keeps every word in the prerendered HTML.
 */
export function StreamlinedPdpBody({
  productId,
  productName,
  content,
  otherIngredients,
  faqs,
  recommendedCombination,
}: {
  productId: string;
  productName: string;
  content: FormulaPdpContent;
  otherIngredients: string[];
  faqs: { q: string; a: string }[];
  /** Unchanged "Recommended combination…" sentence(s) from product.seriesInfo, when present. */
  recommendedCombination?: string;
}) {
  const st = content.streamlined!;
  const questions = doctorQuestionsWithout(st.omitDoctorQuestions);
  return (
    <div className="space-y-8" data-testid="pdp-streamlined">
      <section data-testid="pdp-ingredients-section">
        <h2 className={sh2}>Ingredients</h2>
        {content.ingredients.map((x) => (
          <p key={x} className={STREAMLINED_BODY}>{x}</p>
        ))}
        <p className={`mt-1 ${STREAMLINED_SMALL}`} data-testid="pdp-ingredients-note">{st.ingredientsNote}</p>
        {otherIngredients.map((x) => (
          <p key={x} className={`mt-2 ${STREAMLINED_SMALL}`}>{x}</p>
        ))}
      </section>

      <section data-testid="pdp-biological-focus">
        <h2 className={sh2}>Biological Focus</h2>
        <p className="font-medium text-gray-900 mb-1">{content.biologicalFocus.heading}</p>
        <p className={STREAMLINED_BODY}>{content.biologicalFocus.body}</p>
      </section>

      {content.dosageCourse && !isPrimePeptide(productId) && (
        <section data-testid="pdp-dosage-course" aria-labelledby="pdp-dosage-course-h">
          <h2 id="pdp-dosage-course-h" className={sh2}>{DOSAGE_COURSE_HEADING}</h2>
          <div className="space-y-3">
            {DOSAGE_COURSE_PARAGRAPHS.map((p) => (
              <p key={p} className={STREAMLINED_BODY}>{p}</p>
            ))}
          </div>
          {st.labeledDirections && (
            <div className="mt-4" data-testid="pdp-labeled-directions">
              <PdpAccordion title={st.labeledDirections.heading} nested>
                <p className={`${STREAMLINED_SMALL} mb-1`}>{st.labeledDirections.attribution}</p>
                <p className={STREAMLINED_BODY}>{st.labeledDirections.text}</p>
              </PdpAccordion>
            </div>
          )}
        </section>
      )}

      <CompareRelatedFormulas productId={productId} intro={content.compareIntro} compact />

      {/* "Recommended combination" line from the catalog's product-line text, kept word for
          word (not approved for change) when the product-line section is removed. */}
      {recommendedCombination && (
        <p className={STREAMLINED_SMALL} data-testid="pdp-recommended-combination">{recommendedCombination}</p>
      )}

      <div className="rounded-xl border border-gray-200 px-4 md:px-5" data-testid="pdp-deeper-reading">
        <PdpAccordion title="Research & Evidence" testId="pdp-research">
          <p className={STREAMLINED_BODY}>{content.research}</p>
        </PdpAccordion>
        <PdpAccordion title="Safety & FAQs" testId="pdp-safety-faqs">
          <div className="space-y-3" data-testid="pdp-safety">
            {st.safety.map((p) => (
              <p key={p} className={STREAMLINED_BODY}>{p}</p>
            ))}
          </div>
          <h3 className="mt-5 mb-2 font-semibold text-gray-900">{`Questions for your doctor about ${productName}`}</h3>
          <ol className={`list-decimal pl-5 space-y-1 ${STREAMLINED_BODY}`} data-testid="pdp-doctor">
            {questions.map((q) => <li key={q}>{q}</li>)}
          </ol>
          {faqs.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 font-semibold text-gray-900">Frequently Asked Questions</h3>
              <dl className="space-y-4" data-testid="pdp-faq">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-gray-900">{f.q}</dt>
                    <dd className={`mt-1 ${STREAMLINED_BODY}`}>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </PdpAccordion>
        <p className="py-4 text-xs text-gray-500" data-testid="pdp-fda">{FDA_DISCLAIMER}</p>
      </div>
    </div>
  );
}
