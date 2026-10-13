import { Link } from "wouter";
import MoleculeChain from "./MoleculeChain";
import { productHref, typeExamples } from "./learnData";
import type { Product } from "@/data/products";

/** Compact Cytogen vs Cytomax visual followed by one real catalog example of each. */
export default function TwoTypes({ catalog }: { catalog?: readonly Product[] }) {
  const examples = typeExamples(catalog);
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-3">
        <figure className="m-0 rounded-xl border border-gray-200 p-3">
          <MoleculeChain variant="defined" caption={false} className="mx-auto max-w-[180px]" />
          <figcaption className="mt-1 text-center text-xs text-gray-700">Cytogens</figcaption>
        </figure>
        <figure className="m-0 rounded-xl border border-gray-200 p-3">
          <MoleculeChain variant="complex" caption={false} className="mx-auto max-w-[180px]" />
          <figcaption className="mt-1 text-center text-xs text-gray-700">Cytomaxes</figcaption>
        </figure>
      </div>
      <p className="mt-2 text-[11px] italic text-gray-500">Conceptual molecular illustration, not an actual chemical structure.</p>
      {examples.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3" data-testid="type-examples">
          {examples.map(({ type, product }) => (
            <li key={product.id}>
              <Link
                href={productHref(product.id)}
                data-product-id={product.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-2 transition-colors hover:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
              >
                {product.image ? (
                  <img src={product.image} alt={product.imageAlt ?? product.name} width={48} height={48} loading="lazy" decoding="async" className="h-12 w-12 flex-shrink-0 rounded-lg object-contain" />
                ) : null}
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-gray-500">{type}</span>
                  <span className="block truncate text-sm text-gray-900">{product.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
