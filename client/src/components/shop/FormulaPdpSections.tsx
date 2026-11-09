import { isPrimePeptide } from "@/data/formulaType";
import {
  DOSAGE_COURSE_HEADING,
  DOSAGE_COURSE_PARAGRAPHS,
  FDA_DISCLAIMER,
  type FormulaPdpContent,
} from "@/data/formulaPreviewContent";
import { CompareRelatedFormulas } from "@/components/shop/FormulaTypeParts";

const h2 = "text-lg font-semibold text-gray-900 mb-3 pb-2 border-b";
const body = "text-gray-600 leading-relaxed";

/**
 * Shared "Dosage & Course Information" for capsule products. Never renders for Prime
 * Peptide products. (In this mock it is only mounted on the Bonomarlot page.)
 */
export function DosageCourseInfo({ productId, isCapsuleProduct }: { productId: string; isCapsuleProduct: boolean }) {
  if (isPrimePeptide(productId) || !isCapsuleProduct) return null;
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
  isCapsuleProduct,
}: {
  productId: string;
  content: FormulaPdpContent;
  /** Existing label line(s) such as "Other ingredients: …", kept as they are on the page today. */
  otherIngredients: string[];
  isCapsuleProduct: boolean;
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

      <section data-testid="pdp-overview">
        <h2 className={h2}>About This Product</h2>
        <p className={body}>{content.about}</p>
      </section>

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

      <DosageCourseInfo productId={productId} isCapsuleProduct={isCapsuleProduct} />
    </>
  );
}
