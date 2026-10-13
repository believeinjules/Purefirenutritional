import type { ReactNode } from "react";
import Tabs from "./Tabs";
import MoleculeChain from "./MoleculeChain";
import ProductLinks from "./ProductLinks";
import AskPepitaChip from "./AskPepitaChip";
import { productsInFamily } from "./learnData";
import type { Product } from "@/data/products";

function Pair({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-[#fdf8f6] p-4">
        <p className="mb-1 font-['Cormorant_Garamond',Georgia,serif] text-lg font-semibold text-gray-900">Cytomaxes</p>
        <div className="text-sm leading-relaxed text-gray-700">{left}</div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-1 font-['Cormorant_Garamond',Georgia,serif] text-lg font-semibold text-gray-900">Cytogens</p>
        <div className="text-sm leading-relaxed text-gray-700">{right}</div>
      </div>
    </div>
  );
}

/** "Two Families. One Research Tradition." — the Cytomaxes vs Cytogens comparison. */
export default function ComparisonTabs({ catalog }: { catalog?: readonly Product[] }) {
  const cytomaxes = productsInFamily("cytomaxes", catalog);
  const cytogens = productsInFamily("cytogens", catalog);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#E06050]">Cytomaxes</p>
          <p className="mb-2 text-sm text-gray-700">Natural peptide complexes — multiple peptide sequences extracted from animal tissues.</p>
          <MoleculeChain variant="complex" caption={false} />
        </div>
        <div className="rounded-2xl border border-gray-200 p-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#E06050]">Cytogens</p>
          <p className="mb-2 text-sm text-gray-700">Synthetic short peptides — a specific, defined amino-acid sequence.</p>
          <MoleculeChain variant="defined" caption={false} />
        </div>
      </div>
      <p className="mt-2 text-[11px] italic text-gray-500">Conceptual molecular illustration, not an actual chemical structure.</p>

      <Tabs
        className="mt-6"
        label="Compare Cytomaxes and Cytogens"
        items={[
          {
            id: "composition",
            label: "Composition",
            content: (
              <Pair
                left={<>A complex of many peptides from one organ or tissue, such as the pineal gland or thymus.</>}
                right={<>A defined short sequence. The manufacturer describes Cartalax, for example, as the tripeptide Ala-Glu-Asp (AED).</>}
              />
            ),
          },
          {
            id: "origin",
            label: "Origin",
            content: (
              <Pair
                left={<>Derived from young animal tissue. Developed at the St. Petersburg Institute of Bioregulation and Gerontology.</>}
                right={<>Synthesised in a laboratory, so not animal-derived — the catalog describes Cartalax as suitable for vegetarian/vegan protocols.</>}
              />
            ),
          },
          {
            id: "research",
            label: "Research",
            content: (
              <p className="rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-700">
                Both lines come from the same research program. Most of that research is in cells, animals and older Russian clinical studies, and no study of one peptide shows that a different product works.
              </p>
            ),
          },
          {
            id: "products",
            label: "Product examples",
            content: (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-900">Cytomaxes</p>
                  <ProductLinks items={cytomaxes} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-900">Cytogens</p>
                  <ProductLinks items={cytogens} />
                </div>
              </div>
            ),
          },
        ]}
      />
      <div className="mt-4">
        <AskPepitaChip question="What is the difference between Cytomaxes and Cytogens, and how do I choose?" />
      </div>
    </div>
  );
}
