/** Lazy-loaded lower half of the Khavinson article (explorers + study library). */
import Section from "./Section";
import ProductFamilyExplorer from "./ProductFamilyExplorer";
import BodySystemExplorer from "./BodySystemExplorer";
import StudyReference from "./StudyReference";
import AskPepitaChip from "./AskPepitaChip";
import EvidenceBadge from "./EvidenceBadge";
import { FOUNDATION_STUDY_IDS, learnStudy } from "./learnData";

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
          Each system shows the products whose own descriptions name it, and the research on related peptides — with what was actually studied.
        </p>
        <BodySystemExplorer />
      </Section>

      <Section id="study-library" eyebrow="Sources" title="The study library" topic="Khavinson peptide research studies">
        <div className="mb-5 space-y-3 text-sm text-gray-700">
          <p>Tap a study to see what was tested, who was studied, the main finding and its limitations.</p>
          <div className="flex flex-wrap gap-1.5" aria-label="Evidence labels used on this page">
            <EvidenceBadge level="cell" />
            <EvidenceBadge level="animal" />
            <EvidenceBadge level="human" />
            <EvidenceBadge level="review" />
            <EvidenceBadge level="insufficient" />
          </div>
        </div>
        <div className="space-y-2">
          {FOUNDATION_STUDY_IDS.map((id) => (
            <StudyReference key={id} study={learnStudy(id)} />
          ))}
        </div>
        <div className="mt-4">
          <AskPepitaChip question="How should I read Khavinson peptide studies — what counts as strong evidence?" />
        </div>
      </Section>
    </>
  );
}
