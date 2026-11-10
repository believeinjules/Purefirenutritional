import { isPrimePeptide } from "@/data/formulaType";
import {
  DOSAGE_COURSE_HEADING,
  DOSAGE_COURSE_PARAGRAPHS,
  DOSAGE_COURSE_SHORT,
  FDA_DISCLAIMER,
  INGREDIENTS_TEMPLATE_NOTE,
  LABEL_INFORMATION_HEADING,
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
 * Text styles of the product page on main (section headings with a rule, gray-600 body,
 * small gray-500 notes). The ChatGPT content template changes content and order only.
 */
export const STREAMLINED_BODY = body;
export const STREAMLINED_SMALL = "text-sm text-gray-600 leading-relaxed";
const note = "text-xs text-gray-500";

/**
 * Product page body in Julia's ChatGPT content template (2026-11-09): Ingredients (active complex
 * + pointer to the full list), Biological Focus (subheading + two sentences), Dosage & Course
 * Information (short text + collapsed labeled directions), Compare Related Formulas (compact
 * rows), then collapsed Research & Evidence and Safety & FAQs, which ends with the FDA
 * disclaimer and the label information. Native <details> keeps every word in the prerendered HTML.
 */
export function StreamlinedPdpBody({
  productId,
  productName,
  content,
  labelLines,
  faqs,
  recommendedCombination,
}: {
  productId: string;
  productName: string;
  content: FormulaPdpContent;
  /** Label information from shared/product-facts.json (composition and other ingredients), shown at the end of "Safety & FAQs". */
  labelLines: string[];
  faqs: { q: string; a: string }[];
  /** Unchanged "Recommended combination…" sentence(s) from product.seriesInfo, when present. */
  recommendedCombination?: string;
}) {
  const st = content.streamlined!;
  const questions = doctorQuestionsWithout(st.omitDoctorQuestions);
  const label = (content.labelLines ?? labelLines).filter((x) => !/^See the full ingredient list/i.test(x));
  const cosmetic = content.form === "cosmetic";
  return (
    <div className="space-y-8" data-testid="pdp-streamlined">
      <section data-testid="pdp-ingredients-section">
        <h2 className={h2}>Ingredients</h2>
        {content.ingredients[0] && <p className={body}>{content.ingredients[0]}</p>}
        <p className={content.ingredients[0] ? `mt-1 ${STREAMLINED_SMALL}` : body} data-testid="pdp-ingredients-note">
          {label.length > 0 ? INGREDIENTS_TEMPLATE_NOTE : st.ingredientsNote}
        </p>
      </section>

      <section data-testid="pdp-biological-focus">
        <h2 className={h2}>Biological Focus</h2>
        <h3 className="font-semibold text-gray-900 mb-2">{content.biologicalFocus.heading}</h3>
        <p className={body}>{content.biologicalFocus.body}</p>
      </section>

      {content.dosageCourse && !isPrimePeptide(productId) && (
        <section data-testid="pdp-dosage-course" aria-labelledby="pdp-dosage-course-h">
          <h2 id="pdp-dosage-course-h" className={h2}>{DOSAGE_COURSE_HEADING}</h2>
          <p className={body}>{DOSAGE_COURSE_SHORT}</p>
          {st.labeledDirections && (
            <div className="mt-3 border-t border-gray-200" data-testid="pdp-labeled-directions">
              <PdpAccordion title={st.labeledDirections.heading} nested>
                {st.labeledDirections.attribution && (
                  <p className={`${note} mb-1`}>{st.labeledDirections.attribution}</p>
                )}
                <p className={body}>{st.labeledDirections.text}</p>
                {st.labeledDirections.note && (
                  <p className={`${STREAMLINED_SMALL} mt-2`}>{st.labeledDirections.note}</p>
                )}
              </PdpAccordion>
            </div>
          )}
        </section>
      )}

      <CompareRelatedFormulas productId={productId} compact />

      {/* "Recommended combination" line from the catalog's product-line text, kept word for
          word (not approved for change) when the product-line section is removed. */}
      {recommendedCombination && (
        <p className={STREAMLINED_SMALL} data-testid="pdp-recommended-combination">{recommendedCombination}</p>
      )}

      <div className="border-t border-gray-200" data-testid="pdp-deeper-reading">
        <PdpAccordion title="Research & Evidence" testId="pdp-research">
          <p className={body}>{content.research}</p>
        </PdpAccordion>
        <PdpAccordion title="Safety & FAQs" testId="pdp-safety-faqs">
          <div className="text-sm text-gray-700 space-y-2" data-testid="pdp-safety">
            {st.safety.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {!cosmetic && (
            <>
              <h3 className="font-semibold text-gray-900 pt-4 mb-2">{`Questions for your doctor about ${productName}`}</h3>
              <ol className={`list-decimal pl-5 space-y-1 ${body}`} data-testid="pdp-doctor">
                {questions.map((q) => <li key={q}>{q}</li>)}
              </ol>
            </>
          )}
          {faqs.length > 0 && (
            <>
              <h3 className="font-semibold text-gray-900 pt-4 mb-2">Frequently Asked Questions</h3>
              <dl className="space-y-4" data-testid="pdp-faq">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="font-medium text-gray-900">{f.q}</dt>
                    <dd className="mt-1 text-gray-600 leading-relaxed">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          <p className={`mt-4 ${note}`} data-testid="pdp-fda">{FDA_DISCLAIMER}</p>
          <div className="pt-4" data-testid="pdp-label-information">
            <h3 className="font-semibold text-gray-900 mb-2">{LABEL_INFORMATION_HEADING}</h3>
            {label.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                {label.map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
            <p className={`mt-2 ${note}`}>{st.ingredientsNote}</p>
          </div>
        </PdpAccordion>
      </div>
    </div>
  );
}
