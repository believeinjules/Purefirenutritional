import { Link } from "wouter";
import { getProductById } from "@/data/products";
import {
  PRODUCT_TYPE_EXPLAINER_ID,
  PRODUCT_TYPE_FILTERS,
  PRODUCT_TYPE_LABEL,
  compareLine,
  productTypeFor,
  type ProductType,
} from "@/data/productType";

/** "Targeted" / "Broad-spectrum" pill. Text label (not colour-only), with a screen-reader prefix. */
export function ProductTypeTag({ productId, className = "" }: { productId: string; className?: string }) {
  const type = productTypeFor(productId);
  if (!type) return null;
  return (
    <span
      className={`inline-block text-xs font-medium text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 ${className}`}
      data-testid="product-type-tag"
      data-product-type={type}
    >
      <span className="sr-only">Product type: </span>
      {PRODUCT_TYPE_LABEL[type]}
    </span>
  );
}

export type ProductTypeFilterValue = "all" | ProductType;

export function matchesProductType(id: string, filter: ProductTypeFilterValue): boolean {
  return filter === "all" || productTypeFor(id) === filter;
}

/** Radio group styled like the existing shop pills. */
export function ProductTypeFilter({
  value,
  onChange,
  counts,
  explainerHref = `#${PRODUCT_TYPE_EXPLAINER_ID}`,
  name = "product-type",
}: {
  value: ProductTypeFilterValue;
  onChange: (v: ProductTypeFilterValue) => void;
  counts: Record<ProductTypeFilterValue, number>;
  explainerHref?: string;
  name?: string;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2 mb-8" data-testid="product-type-filter">
      <legend className="sr-only">Filter by product type</legend>
      <span className="text-xs uppercase tracking-widest text-gray-500 mr-1" aria-hidden="true">
        Product type
      </span>
      {PRODUCT_TYPE_FILTERS.map((f) => (
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

export const EXPLAINER_HEADING = "Targeted or broad-spectrum?";
export const EXPLAINER_PARAGRAPHS: readonly string[] = [
  "Targeted products, such as the Khavinson Cytomax® and Cytogen® singles, each contain one peptide complex associated with a single organ or tissue: Bonomarlot, for example, contains a bone marrow peptide complex.",
  "Broad-spectrum products, such as the Revilab ML and Revilab SL blends, combine several peptide complexes, often with vitamins or plant extracts, and are formulated to support more than one body system at once.",
  "Some blends contain the same type of peptide complex as a single; where the catalog shows that overlap, the product page says so under \"How it compares.\"",
  "Neither type is better: a targeted product keeps the focus on one area, while a blend covers several in one formula.",
  "A qualified healthcare professional can help you decide which suits you.",
];

export function ProductTypeExplainer({ className = "" }: { className?: string }) {
  return (
    <section
      id={PRODUCT_TYPE_EXPLAINER_ID}
      aria-labelledby={`${PRODUCT_TYPE_EXPLAINER_ID}-h`}
      className={`bg-white rounded-2xl border border-gray-100 p-6 scroll-mt-24 ${className}`}
      data-testid="product-type-explainer"
    >
      <h2 id={`${PRODUCT_TYPE_EXPLAINER_ID}-h`} className="text-lg font-semibold text-gray-900 mb-2">
        {EXPLAINER_HEADING}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{EXPLAINER_PARAGRAPHS.join(" ")}</p>
    </section>
  );
}

const storefrontName = (id: string) => getProductById(id)?.name;

/** One-line "How it compares" note on the product page. Renders nothing when there is no mapped counterpart. */
export function HowItCompares({ productId }: { productId: string }) {
  const line = compareLine(productId, storefrontName);
  if (!line) return null;
  return (
    <p className="text-sm text-gray-600 leading-relaxed" data-testid="pdp-how-it-compares">
      <span className="font-semibold text-gray-900">How it compares: </span>
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
