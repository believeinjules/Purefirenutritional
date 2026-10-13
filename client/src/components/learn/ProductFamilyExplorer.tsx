import Tabs from "./Tabs";
import MoleculeChain from "./MoleculeChain";
import ProductLinks from "./ProductLinks";
import AskPepitaChip from "./AskPepitaChip";
import { FAMILIES, productsInFamily } from "./learnData";
import type { Product } from "@/data/products";

/** Visual explorer of the four product families. Hidden products never appear. */
export default function ProductFamilyExplorer({ catalog }: { catalog?: readonly Product[] }) {
  return (
    <Tabs
      label="Product families"
      items={FAMILIES.map((f) => {
        const items = productsInFamily(f.id, catalog);
        return {
          id: `family-${f.id}`,
          label: f.name,
          content: (
            <div className="grid gap-5 rounded-2xl border border-gray-200 p-4 sm:grid-cols-[200px_1fr] sm:p-6" data-family={f.id}>
              <MoleculeChain variant={f.art} className="mx-auto w-full max-w-[220px]" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-widest text-[#E06050]">{f.tagline}</p>
                <h3 className="mt-1 font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-gray-900">{f.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{f.body}</p>
                <p className="mb-2 mt-4 text-xs text-gray-400">{items.length} products</p>
                <ProductLinks items={items} />
                <div className="mt-4">
                  <AskPepitaChip question={`Which ${f.name} product might fit my goals, and what is the evidence behind it?`} />
                </div>
              </div>
            </div>
          ),
        };
      })}
    />
  );
}
