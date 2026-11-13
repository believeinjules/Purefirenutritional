/**
 * Every indexable prerendered route must have its own <title> and meta
 * description (Julia, 2026-11-12): no identical copy reused across pages.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { products } from "@/data/products";
import { isHiddenProduct } from "../../../../shared/hidden-products";
import { CATEGORY_COPY } from "@/content/categoryCopy";
import { POLICY_LIST } from "@/content/policies";
import { publishedCertificates } from "@/data/certificates";
import { CATEGORY_ROUTES } from "@/data/bodySystems";
import { productHead, productPath } from "./index";
import { PUBLIC_PAGE_HEADS } from "./publicHeads";
import { PUBLIC_STATIC_ROUTES } from "./sitemap";

export type CollectedHead = { path: string; title: string; description: string; source: string };

function certificateDescription(record: (typeof publishedCertificates)[number]): string {
  return `${record.productNameOnCertificate} EAEU Certificate of State Registration ${record.registrationNumber}, dated ${record.registrationDateDisplay}, with an English translation of the original.`;
}

/** Source-of-truth heads for every indexable public route the prerender writes. */
export function collectIndexableSeoHeads(): CollectedHead[] {
  const heads: CollectedHead[] = [];
  for (const [route, head] of Object.entries(PUBLIC_PAGE_HEADS)) {
    heads.push({ path: route, title: head.title, description: head.description, source: "publicHeads" });
  }
  for (const policy of POLICY_LIST) {
    heads.push({ path: policy.path, title: policy.metaTitle, description: policy.description, source: "policy" });
  }
  for (const [route, copy] of Object.entries(CATEGORY_COPY)) {
    heads.push({ path: route, title: copy.title, description: copy.meta, source: "category" });
  }
  for (const product of products.filter((p) => !isHiddenProduct(p))) {
    const head = productHead(product as never);
    heads.push({ path: productPath(product.id), title: head.title, description: head.description, source: "product" });
  }
  for (const record of publishedCertificates) {
    heads.push({
      path: `/authenticity/${record.slug}`,
      title: record.seoTitle,
      description: certificateDescription(record),
      source: "certificate",
    });
  }
  return heads;
}

function duplicates(heads: CollectedHead[], field: "title" | "description"): string[] {
  const map = new Map<string, string[]>();
  for (const h of heads) {
    const key = h[field];
    const list = map.get(key) ?? [];
    list.push(h.path);
    map.set(key, list);
  }
  return [...map.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([value, paths]) => `${JSON.stringify(value)} → ${paths.join(", ")}`);
}

const root = path.resolve(__dirname, "../../../..");

function parsePrerenderedHeads(distDir: string): Array<{
  path: string;
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  noindex: boolean;
}> {
  const unescape = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  const attr = (tag: string, name: string): string | null => {
    const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
    return m ? unescape(m[1]!) : null;
  };
  const out = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "assets") continue;
        walk(full);
        continue;
      }
      if (entry.name !== "index.html") continue;
      const rel = path.relative(distDir, path.dirname(full));
      const route = rel === "" ? "/" : `/${rel.split(path.sep).join("/")}`;
      const html = fs.readFileSync(full, "utf8");
      const titleM = html.match(/<title[^>]*>([^<]*)<\/title>/);
      let description: string | null = null;
      let ogTitle: string | null = null;
      let ogDescription: string | null = null;
      let twitterTitle: string | null = null;
      let twitterDescription: string | null = null;
      let robots = "";
      for (const m of html.matchAll(/<meta\b[^>]*>/g)) {
        const tag = m[0];
        const name = attr(tag, "name");
        const prop = attr(tag, "property");
        const content = attr(tag, "content");
        if (name === "description") description = content;
        else if (name === "robots") robots = content ?? "";
        else if (name === "twitter:title") twitterTitle = content;
        else if (name === "twitter:description") twitterDescription = content;
        else if (prop === "og:title") ogTitle = content;
        else if (prop === "og:description") ogDescription = content;
      }
      out.push({
        path: route,
        title: titleM ? unescape(titleM[1]!) : null,
        description,
        ogTitle,
        ogDescription,
        twitterTitle,
        twitterDescription,
        noindex: /noindex/i.test(robots),
      });
    }
  };
  walk(distDir);
  return out;
}

describe("unique titles and descriptions across prerendered routes", () => {
  const heads = collectIndexableSeoHeads();

  it("covers every static, category, product and certificate route once", () => {
    const paths = heads.map((h) => h.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const route of PUBLIC_STATIC_ROUTES) {
      expect(paths, route).toContain(route);
    }
    for (const route of CATEGORY_ROUTES) {
      expect(paths, route).toContain(route);
    }
  });

  it("every collected title and description is unique, non-empty and claim-sane in length", () => {
    expect(heads.length).toBeGreaterThan(50);
    for (const h of heads) {
      expect(h.title.trim(), h.path).not.toBe("");
      expect(h.description.trim(), h.path).not.toBe("");
    }
    expect(duplicates(heads, "title"), "duplicate titles").toEqual([]);
    expect(duplicates(heads, "description"), "duplicate descriptions").toEqual([]);
  });

  it("static public heads stay within the practical title/description budgets", () => {
    for (const [route, head] of Object.entries(PUBLIC_PAGE_HEADS)) {
      expect(head.title.length, `${route} title (${head.title.length}): ${head.title}`).toBeLessThanOrEqual(60);
      expect(head.description.length, `${route} description (${head.description.length})`).toBeGreaterThanOrEqual(120);
      expect(head.description.length, `${route} description (${head.description.length})`).toBeLessThanOrEqual(160);
    }
  });

  it("prerendered HTML (when dist is present) has unique indexable titles and descriptions that match og/twitter", () => {
    const distDir = path.join(root, "dist");
    if (!fs.existsSync(path.join(distDir, "index.html"))) return;
    const pages = parsePrerenderedHeads(distDir).filter((p) => !p.noindex && p.path !== "/404");
    const indexed = pages.filter((p) => p.title && p.description);
    expect(indexed.length).toBeGreaterThan(50);
    const byTitle = new Map<string, string[]>();
    const byDesc = new Map<string, string[]>();
    for (const p of indexed) {
      byTitle.set(p.title!, [...(byTitle.get(p.title!) ?? []), p.path]);
      byDesc.set(p.description!, [...(byDesc.get(p.description!) ?? []), p.path]);
      expect(p.ogTitle, p.path).toBe(p.title);
      expect(p.ogDescription, p.path).toBe(p.description);
      expect(p.twitterTitle, p.path).toBe(p.title);
      expect(p.twitterDescription, p.path).toBe(p.description);
    }
    const titleDups = [...byTitle.entries()].filter(([, paths]) => paths.length > 1);
    const descDups = [...byDesc.entries()].filter(([, paths]) => paths.length > 1);
    expect(titleDups, "duplicate prerendered titles").toEqual([]);
    expect(descDups, "duplicate prerendered descriptions").toEqual([]);
  });
});
