import { Link } from "wouter";
import type { Product } from "@/data/products";
import { productHref } from "./learnData";

/** Compact product chips linking to canonical /products/<id>. Caller passes visible products only. */
export default function ProductLinks({ items, max }: { items: Product[]; max?: number }) {
  const shown = max ? items.slice(0, max) : items;
  return (
    <ul className="flex flex-wrap gap-2" data-testid="product-links">
      {shown.map((p) => (
        <li key={p.id}>
          <Link
            href={productHref(p.id)}
            data-product-id={p.id}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-800 transition-colors hover:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E06050]"
          >
            {p.name}
            {/^Revilab SL /.test(p.name) ? <span className="text-[10px] uppercase tracking-wider text-gray-400">Sublingual</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
