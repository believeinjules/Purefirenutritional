import { Link } from "wouter";
import { getProductById } from "@/data/products";
import {
  COMPARE_LEAD,
  FORMULA_TYPE_EXPLAINER_ID,
  FORMULA_TYPE_FILTERS,
  FORMULA_TYPE_LABEL,
  compareLine,
  formulaTypeFor,
  type FormulaType,
} from "@/data/formulaType";

/** "Single" / "Blend" pill. Text label (not colour-only), with a screen-reader prefix. */
export function FormulaTypeTag({ productId, className = "" }: { productId: string; className?: string }) {
  const type = formulaTypeFor(productId);
  if (!type) return null;
  return (
    <span
      className={`inline-block text-xs font-medium text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 ${className}`}
      data-testid="formula-type-tag"
      data-formula-type={type}
    >
      <span className="sr-only">Formula type: </span>
      {FORMULA_TYPE_LABEL[type]}
    </span>
  );
}

export type FormulaTypeFilterValue = "all" | FormulaType;

export function matchesFormulaType(id: string, filter: FormulaTypeFilterValue): boolean {
  return filter === "all" || formulaTypeFor(id) === filter;
}

export function formulaTypeCounts(ids: string[]): Record<FormulaTypeFilterValue, number> {
  return {
    all: ids.length,
    single: ids.filter((id) => matchesFormulaType(id, "single")).length,
    blend: ids.filter((id) => matchesFormulaType(id, "blend")).length,
  };
}

/** Radio group styled like the existing shop pills. */
export function FormulaTypeFilter({
  value,
  onChange,
  counts,
  explainerHref = `#${FORMULA_TYPE_EXPLAINER_ID}`,
  name = "formula-type",
}: {
  value: FormulaTypeFilterValue;
  onChange: (v: FormulaTypeFilterValue) => void;
  counts: Record<FormulaTypeFilterValue, number>;
  explainerHref?: string;
  name?: string;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2 mb-8" data-testid="formula-type-filter">
      <legend className="sr-only">Filter by formula type</legend>
      <span className="text-xs uppercase tracking-widest text-gray-500 mr-1" aria-hidden="true">
        Formula type
      </span>
      {FORMULA_TYPE_FILTERS.map((f) => (
        <label key={f.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={f.value}
            checked={value === f.value}
            onChange={() => onChange(f.value)}
            className="sr-only peer"
          />
          <span className="inline-flex items-center min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-2">
            {f.label}
            <span className="ml-2 opacity-70">{counts[f.value]}</span>
          </span>
        </label>
      ))}
      <a href={explainerHref} className="text-xs text-orange-600 hover:underline ml-1 py-3">
        What's the difference?
      </a>
    </fieldset>
  );
}

export const EXPLAINER_HEADING = "Single or blend?";
export const EXPLAINER_TEXT =
  "Singles, such as the Khavinson Cytomax® and Cytogen® lines, each contain one peptide or peptide complex associated with a single organ or tissue. Bonomarlot, for example, contains a bone marrow peptide complex. Blends, such as the Revilab ML and Revilab SL lines, combine several peptide complexes, often with vitamins or plant extracts. Some blends contain the same type of peptide complex as a single; where they do, the product page says so under \"How it compares.\" Neither type is better. A single contains one ingredient focus, and a blend combines several in one formula. A qualified healthcare professional can help you decide which suits you.";

export function FormulaTypeExplainer({ className = "" }: { className?: string }) {
  return (
    <section
      id={FORMULA_TYPE_EXPLAINER_ID}
      aria-labelledby={`${FORMULA_TYPE_EXPLAINER_ID}-h`}
      className={`bg-white rounded-2xl border border-gray-100 p-6 scroll-mt-24 ${className}`}
      data-testid="formula-type-explainer"
    >
      <h2 id={`${FORMULA_TYPE_EXPLAINER_ID}-h`} className="text-lg font-semibold text-gray-900 mb-2">
        {EXPLAINER_HEADING}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{EXPLAINER_TEXT}</p>
    </section>
  );
}

const storefrontName = (id: string) => getProductById(id)?.name;

/**
 * One-line "How it compares" note. Placed at the end of the purchase panel, below
 * Add to Cart and set off by a rule, so it never sits next to the facts strip
 * (size · cycle · cost/day), usage/dose text or condition copy.
 */
export function HowItCompares({ productId, className = "" }: { productId: string; className?: string }) {
  const line = compareLine(productId, storefrontName);
  if (!line) return null;
  return (
    <p className={`text-sm text-gray-600 leading-relaxed ${className}`} data-testid="pdp-how-it-compares">
      <span className="font-semibold text-gray-900">{COMPARE_LEAD}</span>
      {line.map((seg, i) =>
        "productId" in seg ? (
          <Link key={i} href={`/products/${seg.productId}`} className="text-orange-600 hover:underline">
            {seg.text}
          </Link>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}
