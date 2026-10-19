import { describe, expect, it } from "vitest";
import { allProducts, products } from "@/data/products";
import { getPdpContent } from "@shared/product-facts";
import { isHiddenProduct } from "@shared/hidden-products";
import { CATEGORY_COPY } from "@/content/categoryCopy";
import { PUBLIC_STATIC_ROUTES, UNLISTED_ROUTES } from "@/lib/seo/sitemap";
import { productBreadcrumbJsonLd } from "@/lib/seo";
import {
  BODY_SYSTEMS,
  CATEGORY_EXCLUDED_IDS,
  CATEGORY_PAGES_LIVE,
  CATEGORY_ROUTES,
  LIST_ONLY_GROUPS,
  LIST_PAGE_PATH,
  listPageGroups,
  systemProducts,
  systemsForProduct,
} from "./bodySystems";

const allIds = new Set(allProducts.map((p) => p.id));
const NEVER = ["indosine", "calsil-t", "panaxod", "olecap"];

describe("body-system pages", () => {
  it("has 12 system pages + the list page, all with copy", () => {
    expect(BODY_SYSTEMS).toHaveLength(12);
    expect(CATEGORY_ROUTES).toHaveLength(13);
    for (const r of CATEGORY_ROUTES) expect(CATEGORY_COPY[r], r).toBeTruthy();
    expect(Object.keys(CATEGORY_COPY).sort()).toEqual([...CATEGORY_ROUTES].sort());
  });

  it("titles are 60 chars or fewer", () => {
    for (const [r, c] of Object.entries(CATEGORY_COPY)) expect(c.title.length, r).toBeLessThanOrEqual(60);
  });

  it("every mapped id exists in the catalog", () => {
    const ids = [
      ...BODY_SYSTEMS.flatMap((s) => [...s.bioregulators.map((b) => b.id), ...s.others]),
      ...LIST_ONLY_GROUPS.flatMap((g) => g.ids),
    ];
    for (const id of ids) expect(allIds.has(id), id).toBe(true);
  });

  it("bioregulator codes come from the product's own meta description", () => {
    for (const s of BODY_SYSTEMS)
      for (const b of s.bioregulators) expect(getPdpContent(b.id)?.metaDescription, b.id).toContain(b.code);
  });

  it("never shows hidden or on-hold products", () => {
    const shown = [
      ...BODY_SYSTEMS.flatMap((s) => systemProducts(s, allProducts)),
      ...listPageGroups(allProducts).flatMap((g) => g.products),
    ];
    for (const p of shown) {
      expect(isHiddenProduct(p), p.id).toBe(false);
      expect(CATEGORY_EXCLUDED_IDS.has(p.id), p.id).toBe(false);
    }
    for (const id of NEVER) expect(shown.some((p) => p.id === id), id).toBe(false);
    expect(JSON.stringify(CATEGORY_COPY)).not.toMatch(/Calsil|Indosine|Panaxod|Olecap/);
  });

  it("each system page has at least 2 sold products", () => {
    for (const s of BODY_SYSTEMS) expect(systemProducts(s, products).length, s.slug).toBeGreaterThanOrEqual(2);
  });

  it("list page covers every sold, non-excluded product", () => {
    const listed = new Set(listPageGroups(products).flatMap((g) => g.products.map((p) => p.id)));
    const missing = products.filter((p) => !CATEGORY_EXCLUDED_IDS.has(p.id) && !listed.has(p.id)).map((p) => p.id);
    expect(missing).toEqual([]);
  });

  it("Bonothyrk: joints/bones first, cross-listed on Endocrine Glands", () => {
    expect(systemsForProduct("bonothyrk").map((s) => s.slug)).toEqual(["joints-bones-cartilage", "endocrine-glands"]);
  });

  it("sitemap / noindex follow the single CATEGORY_PAGES_LIVE flag (live: Julia approved 2026-10-19)", () => {
    expect(CATEGORY_PAGES_LIVE).toBe(true);
    for (const r of CATEGORY_ROUTES) {
      expect(PUBLIC_STATIC_ROUTES).not.toContain(r);
      expect(UNLISTED_ROUTES).not.toContain(r);
    }
    expect(CATEGORY_ROUTES).toContain(LIST_PAGE_PATH);
  });

  it("product breadcrumb gains the system level only when live", () => {
    const p = { id: "cerluten", name: "Cerluten" };
    expect((productBreadcrumbJsonLd(p, false) as any).itemListElement).toHaveLength(3);
    expect((productBreadcrumbJsonLd(p) as any).itemListElement).toHaveLength(4);
    const live = (productBreadcrumbJsonLd(p, true) as any).itemListElement;
    expect(live).toHaveLength(4);
    expect(live[2].item).toMatch(/\/products\/system\/brain-nervous-system$/);
  });

  it("no copy contains the flagged weight-management phrase", () => {
    expect(JSON.stringify(CATEGORY_COPY)).not.toMatch(/weight/i);
  });
});
