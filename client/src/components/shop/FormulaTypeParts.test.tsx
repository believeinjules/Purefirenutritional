// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareRelatedFormulas, FormulaTypeTag } from "./FormulaTypeParts";
import { DosageCourseInfo } from "./FormulaPdpSections";
import { ProductGridCard } from "@/components/ProductListingCard";
import { getProductById } from "@/data/products";
import { COMPARE_NOT_ESTABLISHED } from "@/data/formulaType";
import { FORMULA_PDP_CONTENT } from "@/data/formulaPreviewContent";

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

  it("product cards show no tag and keep their facts line unless formulaPreview is set", () => {
    const p = getProductById("bonomarlot")!;
    render(<ProductGridCard product={p} />);
    expect(screen.queryByTestId("formula-type-tag")).toBeNull();
    expect(screen.getByTestId("product-facts").textContent).toMatch(/day/);
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
    const { container } = render(<DosageCourseInfo productId="prime-peptide-brain" isCapsuleProduct />);
    expect(container.innerHTML).toBe("");
    cleanup();
    const r2 = render(<DosageCourseInfo productId="bonomarlot" isCapsuleProduct={false} />);
    expect(r2.container.innerHTML).toBe("");
    cleanup();
    render(<DosageCourseInfo productId="bonomarlot" isCapsuleProduct />);
    expect(screen.getByRole("heading", { name: "Dosage & Course Information" })).toBeTruthy();
    expect(screen.getByTestId("pdp-dosage-course").querySelectorAll("p")).toHaveLength(4);
  });
});
