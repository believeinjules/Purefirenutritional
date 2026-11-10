// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareRelatedFormulas, FormulaTypeTag } from "./FormulaTypeParts";
import { DosageCourseInfo, FormulaPdpBody, StreamlinedPdpBody } from "./FormulaPdpSections";
import { ProductGridCard } from "@/components/ProductListingCard";
import { getProductById } from "@/data/products";
import { COMPARE_NOT_ESTABLISHED, counterpartsFor } from "@/data/formulaType";
import {
  DOSAGE_COURSE_PARAGRAPHS, DOSAGE_COURSE_SHORT, FDA_DISCLAIMER, FORMULA_PDP_CONTENT, RECOMMENDED_COMBINATION_IDS, recommendedCombinationLine,
} from "@/data/formulaPreviewContent";
import { INGREDIENTS_NOTE } from "@/data/pdpCopy/shared";
import { PHASE2_COPY, PHASE2_GAPS } from "@/data/pdpCopy/phase2";
import { PRODUCT_FACTS } from "@shared/product-facts";

vi.mock("@/components/QuickAddToCart", () => ({ default: () => null }));

afterEach(cleanup);

describe("Compare Related Formulas", () => {
  it("Bonomarlot: list with tags + chevron links, expandable side-by-side with a Not established row", async () => {
    const user = userEvent.setup();
    render(<CompareRelatedFormulas productId="bonomarlot" intro={FORMULA_PDP_CONTENT.bonomarlot.compareIntro} />);
    const list = screen.getByTestId("compare-related-list");
    const links = within(list).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(["Revilab ML 02", "Revilab SL 07"]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/products/revilab-ml-02", "/products/revilab-sl-07"]);
    expect(list.querySelectorAll('svg[aria-hidden="true"]').length).toBe(2);
    expect(within(list).getAllByText(/Combination Formula · Revilab (ML|SL)/)).toHaveLength(2);

    const button = screen.getByRole("button", { name: "See how they compare" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByTestId("compare-table").hidden).toBe(true);
    await user.click(button);
    expect(screen.getByRole("button", { name: "Hide comparison" }).getAttribute("aria-expanded")).toBe("true");
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("rowheader").map((h) => h.textContent)).toEqual([
      "Formula type", "Shared listed ingredient(s)", "Other listed ingredients", "Quantities", "Manufacturer directions", "Not established",
    ]);
    expect(within(screen.getByTestId("compare-not-established")).getByText(COMPARE_NOT_ESTABLISHED)).toBeTruthy();
    expect(within(table).getAllByText("Not listed").length).toBeGreaterThanOrEqual(3);
    expect(table.textContent).not.toMatch(/stronger|better|maintenance|short-term/i);
  });

  it("works the other way for Revilab ML 02 (neutral intro)", () => {
    render(<CompareRelatedFormulas productId="revilab-ml-02" />);
    expect(within(screen.getByTestId("compare-related-list")).getAllByRole("link").map((a) => a.textContent)).toEqual(["Bonomarlot", "Svetinorm"]);
    expect(screen.getByTestId("compare-intro").textContent).toBe("These formulas list a peptide complex with the same name in their composition.");
  });

  it("renders nothing for Prime, hidden or unmapped products", () => {
    for (const id of ["prime-peptide-brain", "calsil-t", "indosine", "panaxod", "vladonix", "mamiton"]) {
      const { container } = render(<CompareRelatedFormulas productId={id} />);
      expect(container.innerHTML, id).toBe("");
      cleanup();
    }
  });
});

describe("gating and shared parts", () => {
  it("tag has the screen-reader prefix", () => {
    render(<FormulaTypeTag productId="prime-peptide-brain" />);
    expect(screen.getByTestId("formula-type-tag").textContent).toBe("Formula type: Combination Formula · Prime Peptide");
  });

  it("product cards: tag only with formulaPreview; package line is capsule count only everywhere", () => {
    const p = getProductById("bonomarlot")!;
    render(<ProductGridCard product={p} />);
    expect(screen.queryByTestId("formula-type-tag")).toBeNull();
    expect(screen.getByTestId("product-facts").textContent).toBe("20 or 60 Capsules");
    cleanup();
    render(<ProductGridCard product={p} formulaPreview />);
    expect(screen.getByTestId("formula-type-tag").textContent).toContain("Focused Formula · Cytomax");
    expect(screen.getByTestId("product-facts").textContent).toBe("20 or 60 Capsules");
    // Key Benefits were removed from the Bonomarlot preview, so its card hides them as well.
    const b = p.benefits?.[0];
    if (b) expect(document.body.textContent).not.toContain(b);
    cleanup();
    render(<ProductGridCard product={p} />);
    if (b) expect(document.body.textContent).toContain(b);
  });

  it("Dosage & Course Information never renders for Prime or non-capsule products", () => {
    const { container } = render(<DosageCourseInfo productId="prime-peptide-brain" show />);
    expect(container.innerHTML).toBe("");
    cleanup();
    const r2 = render(<DosageCourseInfo productId="bonomarlot" show={false} />);
    expect(r2.container.innerHTML).toBe("");
    cleanup();
    render(<DosageCourseInfo productId="bonomarlot" show />);
    expect(screen.getByRole("heading", { name: "Dosage & Course Information" })).toBeTruthy();
    expect(screen.getByTestId("pdp-dosage-course").querySelectorAll("p")).toHaveLength(4);
  });

  it("every rolled-out page body renders Important Information + FDA disclaimer, in Julia's order, with internal links only", () => {
    for (const id of Object.keys(FORMULA_PDP_CONTENT)) {
      if (FORMULA_PDP_CONTENT[id].streamlined) continue; // streamlined layout tested below
      const { container, unmount } = render(
        <FormulaPdpBody productId={id} content={FORMULA_PDP_CONTENT[id]} otherIngredients={[]} showDosageCourse={FORMULA_PDP_CONTENT[id].dosageCourse} />,
      );
      const text = container.textContent ?? "";
      expect(text, id).toContain("Important Information");
      expect(screen.getByTestId("pdp-fda").textContent, id).toBe(FDA_DISCLAIMER);
      const order = ["Ingredients", "Biological Focus", "About This Product", "Manufacturer Directions", "Research & Biological Context", "Important Information"];
      const at = order.map((h) => text.indexOf(h));
      expect([...at].sort((a, b) => a - b), id).toEqual(at);
      expect(at.every((i) => i >= 0), id).toBe(true);
      for (const a of Array.from(container.querySelectorAll("a"))) expect(a.getAttribute("href") ?? "", id).toMatch(/^\//);
      expect(Boolean(screen.queryByTestId("compare-related-formulas")), id).toBe(counterpartsFor(id).length > 0);
      unmount();
    }
  });

  it("streamlined Bonomarlot: essentials, then collapsed Research & Evidence and Safety & FAQs, FDA disclaimer once at the end", () => {
    const c = FORMULA_PDP_CONTENT.bonomarlot!;
    expect(c.streamlined).toBeDefined();
    const faqs = [{ q: "Can I take Bonomarlot with other supplements?", a: "Ask your doctor." }];
    const { container, unmount } = render(
      <StreamlinedPdpBody productId="bonomarlot" productName="Bonomarlot" content={c} labelLines={["Bone marrow peptide complex (A-20)", "Other ingredients: x"]} faqs={faqs} />,
    );
    const text = container.textContent ?? "";
    const order = ["Ingredients", "Full ingredients listed below or on label.", "Biological Focus", "Dosage & Course Information", DOSAGE_COURSE_SHORT, "Manufacturer's Labeled Directions", "Compare Related Formulas", "Research & Evidence", "Safety & FAQs", FDA_DISCLAIMER, "Label Information", "Other ingredients: x"];
    const at = order.map((h) => text.indexOf(h));
    expect(at.every((i) => i >= 0), JSON.stringify(at)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(text.split(FDA_DISCLAIMER)).toHaveLength(2);
    expect(text.match(/not intended to diagnose/g)).toHaveLength(1);
    for (const gone of ["About This Product", "Important Information", "preventively", "How long should one cycle", "Ingredient overlap is based", "Recommended combination"]) {
      expect(text, gone).not.toContain(gone);
    }
    // Collapsed by default, content still in the DOM.
    for (const tid of ["pdp-research", "pdp-safety-faqs"]) {
      const d = screen.getByTestId(tid) as HTMLDetailsElement;
      expect(d.tagName).toBe("DETAILS");
      expect(d.open).toBe(false);
    }
    expect(text).toContain(c.research);
    expect(text).toContain("Can I take Bonomarlot with other supplements?");
    for (const p4 of DOSAGE_COURSE_PARAGRAPHS) expect(text).not.toContain(p4);
    for (const a of Array.from(container.querySelectorAll("a"))) expect(a.getAttribute("href") ?? "").toMatch(/^\//);
    unmount();
  });
});

describe("round 3 on every rolled-out capsule page", () => {
  const MISSING_DIRECTIONS = ["sigumir", "suprefort", "thyreogen", "vladonix", ...PHASE2_GAPS.noVerifiedDirections];
  const PHASE2 = new Set(Object.keys(PHASE2_COPY));
  const ML_PACKAGE_TEXT = "Adults: 1 capsule once a day with meals. Course duration: 4–6 weeks; the course can be repeated within a year if needed.";

  it("rolled out: 21 Cytomax + 6 Cytogen + 9 Revilab ML + 42 phase 2; never Prime or hidden products", () => {
    const ids = Object.keys(FORMULA_PDP_CONTENT);
    expect(ids).toHaveLength(36 + 42);
    expect(PHASE2.size).toBe(42);
    for (const id of ids) expect(id, id).not.toMatch(/^prime-peptide-|^(calsil-t|indosine|panaxod)$/);
    for (const id of ids) expect(FORMULA_PDP_CONTENT[id].streamlined, id).toBeDefined();
  });

  it("directions: brochure page, package text (Revilab ML) or Endoluten's confirmed line; the others have no expander", () => {
    const without = Object.keys(FORMULA_PDP_CONTENT).filter((id) => !FORMULA_PDP_CONTENT[id].streamlined!.labeledDirections).sort();
    expect(without).toEqual([...MISSING_DIRECTIONS].sort());
    for (const [id, c] of Object.entries(FORMULA_PDP_CONTENT)) {
      const ld = c.streamlined!.labeledDirections;
      if (!ld) continue;
      const src = c.manufacturerDirections.source!;
      if (/^revilab-ml-0\d$/.test(id)) {
        expect(src.kind, id).toBe("package");
        expect(ld.heading, id).toBe("Manufacturer's Labeled Directions");
        expect(ld.attribution, id).toBe("As listed on the package:");
        expect(ld.text, id).toBe(ML_PACKAGE_TEXT);
        continue;
      }
      if (id === "endoluten") {
        expect(src.kind).toBe("confirmed");
        expect(ld.heading).toBe("Directions");
        expect(ld.attribution).toBeUndefined();
        expect(ld.text).toBe("Adults: 1 capsule every 3 days, in the morning or at midday. Course: 20 days to 2 months.");
        expect(ld.note).toBe("Please confer with your doctor before use.");
        continue;
      }
      if (PHASE2.has(id)) {
        // Phase 2: only product-facts directions marked verified (manufacturer source), quoted exactly.
        const md = PRODUCT_FACTS[id].manufacturerDirections;
        expect(md.status, id).toBe("verified");
        expect(src.kind, id).toBe("manufacturer");
        expect(ld.attribution, id).toBe("As listed by the manufacturer:");
        expect(ld.text, id).toBe(md.text);
        continue;
      }
      expect(src.kind, id).toBe("brochure");
      expect(ld.attribution, id).toBe(`As printed in the Cytomax and Cytogen product brochure (p. ${src.page}):`);
      expect(ld.text, id).toBe(`"${src.text}"`);
    }
    expect(JSON.stringify(FORMULA_PDP_CONTENT.bonomarlot)).not.toMatch(/unconfirmed|TODO/i);
  });

  it("each page renders the streamlined body: order, FDA once, no doctor-cycle questions, recommended line kept word for word", () => {
    for (const [id, c] of Object.entries(FORMULA_PDP_CONTENT)) {
      const p = getProductById(id)!;
      const rec = recommendedCombinationLine(id, p.seriesInfo);
      const { container, unmount } = render(
        <StreamlinedPdpBody productId={id} productName={p.name} content={c} labelLines={p.ingredients ?? []} faqs={[]} recommendedCombination={rec} />,
      );
      const text = container.textContent ?? "";
      const hasLabel = (c.labelLines ?? p.ingredients ?? []).some((x) => !/^See the full ingredient list/i.test(x));
      const order = [
        "Ingredients",
        hasLabel ? "Full ingredients listed below or on label." : INGREDIENTS_NOTE,
        "Biological Focus",
        ...(c.dosageCourse ? ["Dosage & Course Information", DOSAGE_COURSE_SHORT] : []),
        "Research & Evidence",
        "Safety & FAQs",
        FDA_DISCLAIMER,
        "Label Information",
        ...(hasLabel ? [INGREDIENTS_NOTE] : []),
      ];
      if (!c.dosageCourse) expect(text, id).not.toContain(DOSAGE_COURSE_SHORT);
      if (c.form === "cosmetic") expect(text, id).not.toMatch(/capsule|serving|Questions for your doctor|Dosage/i);
      const at = order.map((h) => text.indexOf(h));
      expect(at.every((i) => i >= 0), `${id} ${JSON.stringify(at)}`).toBe(true);
      expect([...at].sort((a, b) => a - b), id).toEqual(at);
      expect(text.split(FDA_DISCLAIMER), id).toHaveLength(2);
      expect(text, id).not.toMatch(/preventively|How long should one cycle|About This Product/);
      const ldh = c.streamlined!.labeledDirections;
      expect(text.includes("Manufacturer's Labeled Directions"), id).toBe(Boolean(ldh) && id !== "endoluten");
      if (ldh) expect(text, id).toContain(ldh.text);
      if (id === "endoluten") expect(text).not.toMatch(/brochure/i);
      for (const p4 of DOSAGE_COURSE_PARAGRAPHS) expect(text, id).not.toContain(p4);
      expect(text, id).not.toMatch(/inject/i);
      expect(Boolean(screen.queryByTestId("compare-related-formulas")), id).toBe(counterpartsFor(id).length > 0);
      if (RECOMMENDED_COMBINATION_IDS.has(id)) {
        expect(rec, id).toBeDefined();
        expect(p.seriesInfo!.includes(rec!), id).toBe(true);
        expect(screen.getByTestId("pdp-recommended-combination").textContent, id).toBe(rec);
      } else {
        expect(screen.queryByTestId("pdp-recommended-combination"), id).toBeNull();
      }
      for (const a of Array.from(container.querySelectorAll("a"))) expect(a.getAttribute("href") ?? "", id).toMatch(/^\//);
      unmount();
    }
  });
});
