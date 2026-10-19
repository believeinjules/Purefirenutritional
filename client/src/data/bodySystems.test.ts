import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { allProducts, products } from "@/data/products";
import { getPdpContent } from "@shared/product-facts";
import { isHiddenProduct } from "@shared/hidden-products";
import { CATEGORY_COPY } from "@/content/categoryCopy";
import { PUBLIC_STATIC_ROUTES, UNLISTED_ROUTES } from "@/lib/seo/sitemap";
import { productBreadcrumbJsonLd } from "@/lib/seo";
import { PRODUCT_TAGS, tagsFor } from "./productTags";
import {
  ALL_BROWSE_PAGES,
  BODY_SYSTEMS,
  CATEGORY_EXCLUDED_IDS,
  CATEGORY_PAGES_LIVE,
  CATEGORY_ROUTES,
  COLLECTIONS,
  GOALS,
  MENU_BODY_SYSTEMS,
  RETIRED_BROWSE_PATHS,
  LIST_PAGE_PATH,
  RETIRED_SYSTEM_SLUGS,
  SYSTEMS_LANDING_PATH,
  getBodySystem,
  listPageGroups,
  pageProducts,
  systemsForProduct,
  tagOf,
} from "./bodySystems";

const NEVER = ["indosine", "calsil-t", "panaxod", "olecap"];
const knownTags = new Set([...ALL_BROWSE_PAGES.map(tagOf), "list:eyes-vision", "list:general"]);

describe("shop taxonomy", () => {
  it("7 consolidated groups + Blood & Bone Marrow, 4 brand collections, 7 goals", () => {
    expect(BODY_SYSTEMS.map((s) => s.name)).toEqual([
      "Brain & Nervous System",
      "Heart & Circulation",
      "Immune & Respiratory",
      "Digestion & Metabolism",
      "Kidney & Bladder",
      "Bones, Joints & Muscles",
      "Hormonal & Reproductive Health",
      "Blood & Bone Marrow",
    ]);
    expect(MENU_BODY_SYSTEMS).toHaveLength(7);
    expect(MENU_BODY_SYSTEMS.map((s) => s.slug)).not.toContain("blood-bone-marrow");
    expect(COLLECTIONS.map((c) => c.slug)).toEqual(["khavinson-cytomaxes", "khavinson-cytogens", "revilab", "prime-peptide"]);
    expect(GOALS.map((g) => g.name)).toEqual([
      "Sleep & Daily Rhythms",
      "Focus & Cognition",
      "Energy & Vitality",
      "Stress & Resilience",
      "Healthy Aging",
      "Recovery & Mobility",
      "Skin, Hair & Beauty",
    ]);
  });

  it("every route has copy, titles are 60 chars or fewer, metas 155 or fewer (brain meta is Editorial's, 156)", () => {
    expect(Object.keys(CATEGORY_COPY).sort()).toEqual([...CATEGORY_ROUTES].sort());
    for (const [r, c] of Object.entries(CATEGORY_COPY)) {
      expect(c.title.length, r).toBeLessThanOrEqual(60);
      if (r !== "/products/system/brain-nervous-system") expect(c.meta.length, r).toBeLessThanOrEqual(155);
    }
  });

  it("every tag names a real page, and every tagged id is a real product", () => {
    const ids = new Set(allProducts.map((p) => p.id));
    for (const [id, e] of Object.entries(PRODUCT_TAGS)) {
      expect(ids.has(id), id).toBe(true);
      for (const t of e.tags) expect(knownTags.has(t), `${id}: ${t}`).toBe(true);
    }
  });

  it("every visible product has tags and a browse path (a group, collection or goal, or a list-page section)", () => {
    const onPages = new Set(ALL_BROWSE_PAGES.flatMap((pg) => pageProducts(pg, products).map((p) => p.id)));
    const listOnly: string[] = [];
    for (const p of products) {
      if (CATEGORY_EXCLUDED_IDS.has(p.id)) continue;
      expect(tagsFor(p.id).length, p.id).toBeGreaterThan(0);
      if (!onPages.has(p.id)) listOnly.push(p.id);
    }
    // Reachable only from the Khavinson Peptides List (its own section): reported to Julia.
    expect(listOnly.sort()).toEqual(["complex-3d", "pinalex-tab", "retisil"]);
  });

  it("eye products stay reachable: collections where they have one, plus the list page's Eyes & Vision section", () => {
    const eyes = listPageGroups(products).find((g) => g.name === "Eyes & Vision")!;
    expect(eyes.products.map((p) => p.id).sort()).toEqual(["pinalex-tab", "retisil", "visoluten"]);
    const cytomax = pageProducts(COLLECTIONS[0], products).map((p) => p.id);
    expect(cytomax).toContain("visoluten");
    expect(pageProducts(COLLECTIONS[2], products).map((p) => p.id)).toContain("revilab-ml-03");
  });

  it("Cytomax / Cytogen collections match each product's own line code", () => {
    for (const p of allProducts) {
      const line = getPdpContent(p.id)?.lineCode ?? "";
      expect(tagsFor(p.id).includes("collection:khavinson-cytomaxes"), p.id).toBe(/Cytomax/.test(line));
      expect(tagsFor(p.id).includes("collection:khavinson-cytogens"), p.id).toBe(/Cytogen/.test(line));
    }
  });

  it("Revilab and Prime Peptide collections match the product line ids", () => {
    for (const p of allProducts) {
      expect(tagsFor(p.id).includes("collection:revilab"), p.id).toBe(p.id.startsWith("revilab-"));
      expect(tagsFor(p.id).includes("collection:prime-peptide"), p.id).toBe(p.id.startsWith("prime-peptide-"));
    }
  });

  it("codes appear in the product's own meta description", () => {
    for (const [id, e] of Object.entries(PRODUCT_TAGS)) {
      if (!e.code || isHiddenProduct({ id })) continue;
      for (const c of e.code.split(", ")) expect(getPdpContent(id)?.metaDescription, id).toContain(c);
    }
  });

  it("never shows hidden or on-hold products", () => {
    const shown = [...ALL_BROWSE_PAGES.flatMap((s) => pageProducts(s, allProducts)), ...listPageGroups(allProducts).flatMap((g) => g.products)];
    for (const p of shown) {
      expect(isHiddenProduct(p), p.id).toBe(false);
      expect(CATEGORY_EXCLUDED_IDS.has(p.id), p.id).toBe(false);
    }
    for (const id of NEVER) expect(shown.some((p) => p.id === id), id).toBe(false);
    expect(JSON.stringify(CATEGORY_COPY)).not.toMatch(/Calsil|Indosine|Panaxod|Olecap/);
  });

  it("each browse page has at least 2 sold products", () => {
    for (const s of ALL_BROWSE_PAGES) expect(pageProducts(s, products).length, s.slug).toBeGreaterThanOrEqual(2);
  });

  it("the list page covers every sold product", () => {
    const listed = new Set(listPageGroups(products).flatMap((g) => g.products.map((p) => p.id)));
    expect(products.filter((p) => !listed.has(p.id)).map((p) => p.id)).toEqual([]);
  });

  it("blood / bone-marrow products are not filed under Heart & Circulation", () => {
    const heart = new Set(pageProducts(getBodySystem("heart-circulation")!, products).map((p) => p.id));
    for (const p of pageProducts(getBodySystem("blood-bone-marrow")!, products)) expect(heart.has(p.id), p.id).toBe(false);
  });

  it("dropped / renamed browse URLs redirect permanently (vercel.json)", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as { redirects: Array<{ source: string; destination: string; permanent?: boolean }> };
    for (const [from, to] of Object.entries(RETIRED_BROWSE_PATHS)) {
      expect(CATEGORY_ROUTES, from).not.toContain(from);
      expect([...CATEGORY_ROUTES, "/products"], to).toContain(to);
      const r = vercel.redirects.find((x) => x.source === from);
      expect(r?.destination, from).toBe(to);
      expect(r?.permanent, from).toBe(true);
    }
  });

  it("retired slugs redirect permanently (vercel.json) to a live group", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as { redirects: Array<{ source: string; destination: string; permanent?: boolean }> };
    for (const [from, to] of Object.entries(RETIRED_SYSTEM_SLUGS)) {
      expect(getBodySystem(to), to).toBeDefined();
      expect(getBodySystem(from), from).toBeUndefined();
      const r = vercel.redirects.find((x) => x.source === `/products/system/${from}`);
      expect(r?.destination, from).toBe(`/products/system/${to}`);
      expect(r?.permanent, from).toBe(true);
    }
  });

  it("browse pages are live and generated outside the static route lists", () => {
    expect(CATEGORY_PAGES_LIVE).toBe(true);
    expect(CATEGORY_ROUTES).toContain(LIST_PAGE_PATH);
    expect(CATEGORY_ROUTES).toContain(SYSTEMS_LANDING_PATH);
    expect(CATEGORY_ROUTES).toHaveLength(2 + 8 + 4 + 7);
    for (const r of CATEGORY_ROUTES) {
      expect(PUBLIC_STATIC_ROUTES).not.toContain(r);
      expect(UNLISTED_ROUTES).not.toContain(r);
    }
  });

  it("product breadcrumb gains the primary group", () => {
    const live = (productBreadcrumbJsonLd({ id: "cerluten", name: "Cerluten" }) as any).itemListElement;
    expect(live).toHaveLength(4);
    expect(live[2].item).toMatch(/\/products\/system\/brain-nervous-system$/);
    expect(systemsForProduct("bonothyrk").map((s) => s.slug)).toEqual(["bones-joints-muscles", "hormonal-reproductive-health"]);
  });

  it("no copy contains the flagged weight-management phrase", () => {
    expect(JSON.stringify(CATEGORY_COPY)).not.toMatch(/weight/i);
  });
});
