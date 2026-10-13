/** Lazy-loaded lower half of the Khavinson article (product-family and body-system explorers). */
import Section from "./Section";
import ProductFamilyExplorer from "./ProductFamilyExplorer";
import BodySystemExplorer from "./BodySystemExplorer";

export default function BelowFold() {
  return (
    <>
      <Section id="product-families" eyebrow="Explore" title="The product families" topic="Cytomaxes, Cytogens, Revilab and Prime Peptide product families">
        <p className="mb-5 text-gray-700">
          Four families, four ways of putting peptides together. Pick one to see how it's built and which products belong to it.
        </p>
        <ProductFamilyExplorer />
      </Section>

      <Section id="body-systems" eyebrow="Explore" title="By body system" topic="Peptide bioregulators by body system">
        <p className="mb-5 text-gray-700">
          Pick a system to see the products whose own descriptions name it.
        </p>
        <BodySystemExplorer />
      </Section>

    </>
  );
}
