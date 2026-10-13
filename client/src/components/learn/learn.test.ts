import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup as rawRender } from "react-dom/server";
import { Router } from "wouter";
import type { ReactElement } from "react";
import { allProducts } from "@/data/products";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";
import { RESEARCH_REGISTRY } from "@shared/peppy/research-registry";
import Tabs, { nextTabIndex } from "./Tabs";
import ComparisonTabs from "./ComparisonTabs";
import ProductFamilyExplorer from "./ProductFamilyExplorer";
import BodySystemExplorer from "./BodySystemExplorer";
import { askPepitaHref } from "./AskPepitaChip";
import {
  BODY_SYSTEMS,
  FAMILIES,
  RESEARCH_LIST_IDS,
  researchList,
  productsForSystem,
  productsInFamily,
} from "./learnData";

const renderToStaticMarkup = (el: ReactElement) => rawRender(createElement(Router, { ssrPath: "/learn" }, el));

const HIDDEN = Array.from(HIDDEN_PRODUCT_IDS);
// A catalog that still contains every hidden product, plus a Cytogen/Revilab-looking hidden fake.
const dirty = [
  ...allProducts,
  { ...allProducts.find((p) => p.id === "cartalax")!, id: "femalin" },
  { ...allProducts.find((p) => p.id === "revilab-ml-01")!, id: "regenart" },
  { ...allProducts.find((p) => p.id === "vladonix")!, id: "olecap" },
];

function idsIn(html: string): string[] {
  return Array.from(html.matchAll(/data-product-id="([^"]+)"/g), (m) => m[1]);
}

describe("learn explorers never show hidden products", () => {
  it("family membership excludes hidden products", () => {
    for (const f of FAMILIES) {
      const ids = productsInFamily(f.id, dirty).map((p) => p.id);
      expect(ids.length).toBeGreaterThan(0);
      for (const h of HIDDEN) expect(ids).not.toContain(h);
    }
  });

  it("body systems exclude hidden products even if listed", () => {
    const sys = { ...BODY_SYSTEMS[0], productIds: ["femalin", "previn", "endoluten"] };
    expect(productsForSystem(sys, dirty).map((p) => p.id)).toEqual(["endoluten"]);
  });

  it("rendered explorers contain no hidden product links", () => {
    for (const C of [ProductFamilyExplorer, BodySystemExplorer, ComparisonTabs]) {
      const html = renderToStaticMarkup(createElement(C, { catalog: dirty }));
      const ids = idsIn(html);
      for (const h of HIDDEN) {
        expect(ids).not.toContain(h);
        expect(html).not.toContain(`/products/${h}"`);
      }
    }
  });

  it("every system product exists in the visible catalog", () => {
    for (const s of BODY_SYSTEMS) expect(productsForSystem(s).map((p) => p.id)).toEqual(s.productIds);
  });
});

describe("Tabs", () => {
  it("keyboard navigation wraps and supports Home/End", () => {
    expect(nextTabIndex("ArrowRight", 0, 4)).toBe(1);
    expect(nextTabIndex("ArrowRight", 3, 4)).toBe(0);
    expect(nextTabIndex("ArrowLeft", 0, 4)).toBe(3);
    expect(nextTabIndex("Home", 2, 4)).toBe(0);
    expect(nextTabIndex("End", 0, 4)).toBe(3);
    expect(nextTabIndex("Enter", 0, 4)).toBeNull();
  });

  it("renders an ARIA tablist with one selected tab and hidden other panels", () => {
    const html = renderToStaticMarkup(
      createElement(Tabs, {
        label: "Test",
        initial: 1,
        items: [
          { id: "a", label: "A", content: "pa" },
          { id: "b", label: "B", content: "pb" },
          { id: "c", label: "C", content: "pc" },
        ],
      }),
    );
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(3);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-selected="true"[^>]*data-testid="tab-b"|data-testid="tab-b"[^>]*aria-selected="true"/);
    expect(html.match(/role="tabpanel"[^>]*hidden=""/g)).toHaveLength(2);
    expect(html.match(/tabindex="0"[^>]*data-testid="tab-/g)).toHaveLength(1);
  });

  it("comparison has Composition / Origin / Research / Product examples tabs", () => {
    const html = renderToStaticMarkup(createElement(ComparisonTabs));
    for (const t of ["composition", "origin", "research", "products"]) expect(html).toContain(`data-testid="tab-${t}"`);
    expect(html).toContain("Conceptual molecular illustration, not an actual chemical structure.");
  });
});

describe("learn sources and copy (light page)", () => {
  it("research list = the seven approved PMIDs, registry titles verbatim", () => {
    const list = researchList();
    expect(list.map((s) => s.pmid)).toEqual(["34834147", "31598715", "14977407", "24007794", "16076145", "35887081", "36979488"]);
    for (const id of RESEARCH_LIST_IDS) {
      const reg = RESEARCH_REGISTRY.find((r) => r.id === id)!;
      expect(list.find((s) => s.id === id)!.title).toBe(reg.title);
    }
    for (const s of list) expect(s.url).toBe(`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`);
  });

  it("Ask Pepita links prefill /ai-assistant?q=", () => {
    expect(askPepitaHref("What is a peptide?")).toBe("/ai-assistant?q=What+is+a+peptide%3F");
  });

  it("explorers and comparison: no study links, figures, disease words or dosing", () => {
    const html = [ComparisonTabs, ProductFamilyExplorer, BodySystemExplorer].map((C) => renderToStaticMarkup(createElement(C))).join(" ");
    expect(html).not.toMatch(/pubmed|PMID/i);
    expect(html).not.toMatch(/\d+\s?%|mortality|lifespan|tumou?r|alzheimer|covid|atheroscl|oncoprotect|clinically proven|\bcures?\b/i);
    expect(html).not.toMatch(/\b\d+\s*(months?|weeks?|days?)\b|cycles? (per|a) year|capsules? (daily|a day)/i);
  });
});

import { parsePeppyParams } from "@/lib/peppyContext";
describe("AI assistant ?q= prefill", () => {
  it("parses, trims and caps the question", () => {
    expect(parsePeppyParams("?q=%20What%20is%20Endoluten%3F%20", () => false).question).toBe("What is Endoluten?");
    expect(parsePeppyParams("?q=" + "a".repeat(500), () => false).question).toHaveLength(300);
    expect(parsePeppyParams("?goal=preventive", () => false).question).toBeUndefined();
  });
});
