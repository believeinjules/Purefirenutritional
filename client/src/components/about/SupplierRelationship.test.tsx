// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import SupplierRelationship, { SUPPLIER_SECTION_ID } from "./SupplierRelationship";
import ProductAuthenticity from "@/components/trust/ProductAuthenticity";
import { aboutOrganizationJsonLd } from "@/lib/seo";

afterEach(cleanup);

describe("Our Supplier Relationship section", () => {
  it("renders the facts as text with the anchor id", () => {
    const { container } = render(<SupplierRelationship />);
    const section = container.querySelector(`section#${SUPPLIER_SECTION_ID}`);
    expect(section).not.toBeNull();
    const text = section!.textContent ?? "";
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Our Supplier Relationship");
    for (const s of [
      "sources directly from the manufacturer, with an established purchasing relationship dating back to April 2023",
      "Partner No. 296389",
      "Registered partner:Julia Shulman",
      "Partner number:296389",
      "Registration date:April 21, 2023",
      "Supplier network:peptid.ru",
      "Supplier-linked URL:peptid.ru/?ref=296389",
      "It is not itself a certification",
    ]) expect(text).toContain(s);
    expect(text).not.toMatch(/registry/i);
    expect(text).not.toMatch(/partner network/i);
  });

  it("links to no other site (the supplier URL is plain text)", () => {
    const { container } = render(<SupplierRelationship />);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("href=\"https://peptid");
  });

  it("keeps the documentation collapsed by default, with a lazy image", () => {
    const { container } = render(<SupplierRelationship />);
    const details = container.querySelector("details")!;
    expect(details.open).toBe(false);
    expect(details.querySelector("summary")!.textContent).toBe("View Partner Documentation");
    const img = details.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/images/sourcing/partner-profile.jpg");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("width")).toBe("1082");
    expect(img.getAttribute("height")).toBe("695");
  });
});

describe("authorized retailer badge", () => {
  it("links to the supplier section on /about", () => {
    render(<ProductAuthenticity />);
    const link = screen.getByRole("link", { name: "Verified Sourcing & Partner Information" });
    expect(link.getAttribute("href")).toBe("/about#supplier-relationship");
  });
});

describe("About page Organization JSON-LD", () => {
  it("uses the shared @ids and no credentials or sameAs", () => {
    const ld = aboutOrganizationJsonLd("contact@purefirenutritional.com");
    const json = JSON.stringify(ld);
    const [org, site] = (ld["@graph"] as Array<Record<string, unknown>>);
    expect(org["@id"]).toBe("https://www.purefirenutritional.com/#organization");
    expect(site["@id"]).toBe("https://www.purefirenutritional.com/#website");
    expect(site.publisher).toEqual({ "@id": org["@id"] });
    for (const k of ["hasCredential", "award", "sameAs", "peptid", "certif", "verif"]) {
      expect(json).not.toContain(k);
    }
  });
});
