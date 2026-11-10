import { useId, useState } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { getProductById } from "@/data/products";
import {
  COMPARE_BUTTON_CLOSE,
  COMPARE_BUTTON_OPEN,
  COMPARE_HEADING,
  COMPARE_INTRO,
  COMPARE_NONE_OTHER,
  COMPARE_NOT_LISTED,
  COMPARE_NOTE,
  COMPARE_NOT_ESTABLISHED,
  COMPARE_ROW_LABELS,
  EXPLAINER_HEADING,
  EXPLAINER_TEXT,
  FORMULA_EXPLAINER_ID,
  FORMULA_TYPE_FILTERS,
  FORMULA_TYPE_LABEL,
  compareColumns,
  counterpartsFor,
  formulaTagText,
  formulaTypeFor,
  type FormulaType,
} from "@/data/formulaType";

/** "Focused Formula · Cytomax" pill. Text label (not colour-only), with a screen-reader prefix. */
export function FormulaTypeTag({ productId, className = "" }: { productId: string; className?: string }) {
  const text = formulaTagText(productId);
  if (!text) return null;
  return (
    <span
      className={`inline-block text-xs font-medium text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 ${className}`}
      data-testid="formula-type-tag"
      data-formula-type={formulaTypeFor(productId)}
    >
      <span className="sr-only">Formula type: </span>
      {text}
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
    focused: ids.filter((id) => matchesFormulaType(id, "focused")).length,
    combination: ids.filter((id) => matchesFormulaType(id, "combination")).length,
  };
}

/** Pill-styled radio option (same look as the existing shop pills). */
export function PillRadio({
  name,
  value,
  checked,
  onChange,
  label,
  count,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only peer" />
      <span className="inline-flex items-center min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-2">
        {label}
        {typeof count === "number" && <span className="ml-2 opacity-70">{count}</span>}
      </span>
    </label>
  );
}

export const filterLegend = "block text-xs uppercase tracking-widest text-gray-500 mb-2";

export function FormulaTypeFilter({
  value,
  onChange,
  counts,
  onExplain,
}: {
  value: FormulaTypeFilterValue;
  onChange: (v: FormulaTypeFilterValue) => void;
  counts: Record<FormulaTypeFilterValue, number>;
  onExplain?: () => void;
}) {
  return (
    <fieldset data-testid="formula-type-filter">
      <legend className={filterLegend}>Formula type</legend>
      <div className="flex flex-wrap items-center gap-2">
        {FORMULA_TYPE_FILTERS.map((f) => (
          <PillRadio
            key={f.value}
            name="formula-type"
            value={f.value}
            checked={value === f.value}
            onChange={() => onChange(f.value)}
            label={f.label}
            count={counts[f.value]}
          />
        ))}
        <a href={`#${FORMULA_EXPLAINER_ID}`} onClick={onExplain} className="text-xs text-orange-600 hover:underline ml-1 py-3">
          What's the difference?
        </a>
      </div>
    </fieldset>
  );
}

/** Small expandable panel (native details/summary). */
export function FormulaExplainer({
  open,
  onToggle,
  className = "",
}: {
  open: boolean;
  onToggle: (open: boolean) => void;
  className?: string;
}) {
  return (
    <details
      id={FORMULA_EXPLAINER_ID}
      open={open}
      onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)}
      className={`bg-white rounded-2xl border border-gray-100 scroll-mt-24 ${className}`}
      data-testid="formula-explainer"
    >
      <summary className="cursor-pointer select-none px-5 py-3 min-h-[44px] flex items-center text-sm font-semibold text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-2xl">
        {EXPLAINER_HEADING}
      </summary>
      <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed max-w-3xl">{EXPLAINER_TEXT}</p>
    </details>
  );
}

const storefrontName = (id: string) => getProductById(id)?.name ?? id;

/**
 * "Compare Related Formulas": related products (both directions) + an inline,
 * expandable side-by-side built only from each product's listed composition.
 */
export function CompareRelatedFormulas({
  productId,
  intro = COMPARE_INTRO,
  className = "",
  compact = false,
}: {
  productId: string;
  /** Compact card (streamlined Bonomarlot page): no heading rule, darker intro, no note line. */
  compact?: boolean;
  /** Product-specific intro (Bonomarlot); defaults to the neutral one-sentence intro. */
  intro?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const tableId = useId();
  const related = counterpartsFor(productId);
  const columns = compareColumns(productId);
  if (related.length === 0 || columns.length === 0) return null;
  const cell = "px-3 py-2 align-top text-sm text-gray-700 border-t border-gray-100";
  const rowHead = "px-3 py-2 align-top text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-t border-gray-100 whitespace-nowrap";
  const list = (items: string[]) =>
    items.length ? (
      <ul className="space-y-1">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    ) : (
      <span className="text-gray-500">{COMPARE_NONE_OTHER}</span>
    );
  return (
    <section
      aria-labelledby={`${tableId}-h`}
      className={className}
      data-testid="compare-related-formulas"
    >
      <h2 id={`${tableId}-h`} className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
        {COMPARE_HEADING}
      </h2>
      <p
        className="text-sm text-gray-600 leading-relaxed mb-3"
        data-testid="compare-intro"
      >
        {intro}
      </p>
      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg mb-4" data-testid="compare-related-list">
        {related.map((r) => (
          <li key={r.id}>
            {compact ? (
              // Compact row (ChatGPT template): "Name · Formula type ›".
              <Link href={`/products/${r.id}`} className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-gray-900 hover:text-orange-600 min-h-[44px]">
                <span>
                  <span className="font-semibold">{storefrontName(r.id)}</span>
                  {formulaTypeFor(r.id) && <span className="text-gray-600">{` · ${FORMULA_TYPE_LABEL[formulaTypeFor(r.id)!]}`}</span>}
                </span>
                <ChevronRight size={16} aria-hidden="true" className="text-gray-400 flex-shrink-0" />
              </Link>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="flex flex-col gap-1">
                  <Link href={`/products/${r.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-orange-600 min-h-[24px]">
                    {storefrontName(r.id)}
                    <ChevronRight size={16} aria-hidden="true" className="text-gray-400" />
                  </Link>
                  <FormulaTypeTag productId={r.id} className="w-fit" />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={tableId}
        onClick={() => setOpen((o) => !o)}
        className="min-h-[44px] px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
      >
        {open ? COMPARE_BUTTON_CLOSE : COMPARE_BUTTON_OPEN}
      </button>
      <div id={tableId} hidden={!open} className="mt-4 overflow-x-auto" data-testid="compare-table">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <caption className="sr-only">{COMPARE_HEADING}</caption>
          <thead>
            <tr>
              <td className="px-3 py-2" />
              {columns.map((c) => (
                <th key={c.id} scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                  {storefrontName(c.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className={rowHead}>{COMPARE_ROW_LABELS.type}</th>
              {columns.map((c) => <td key={c.id} className={cell}>{c.tag}</td>)}
            </tr>
            <tr>
              <th scope="row" className={rowHead}>{COMPARE_ROW_LABELS.shared}</th>
              {columns.map((c) => <td key={c.id} className={cell}>{list(c.shared)}</td>)}
            </tr>
            <tr>
              <th scope="row" className={rowHead}>{COMPARE_ROW_LABELS.other}</th>
              {columns.map((c) => <td key={c.id} className={cell}>{list(c.other)}</td>)}
            </tr>
            <tr>
              <th scope="row" className={rowHead}>{COMPARE_ROW_LABELS.quantities}</th>
              {columns.map((c) => <td key={c.id} className={cell}>{c.quantities ?? <span className="text-gray-500">{COMPARE_NOT_LISTED}</span>}</td>)}
            </tr>
            <tr>
              <th scope="row" className={rowHead}>{COMPARE_ROW_LABELS.directions}</th>
              {columns.map((c) => <td key={c.id} className={cell}>{c.directions ?? <span className="text-gray-500">{COMPARE_NOT_LISTED}</span>}</td>)}
            </tr>
            <tr data-testid="compare-not-established">
              <th scope="row" className={rowHead}>{COMPARE_ROW_LABELS.notEstablished}</th>
              <td colSpan={columns.length} className={cell}>{COMPARE_NOT_ESTABLISHED}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {!compact && <p className="mt-3 text-xs text-gray-500">{COMPARE_NOTE}</p>}
    </section>
  );
}
