import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { products } from "@/data/products";
import { getUnitPriceUSD } from "@shared/product-prices";
import {
  absoluteUrl,
  canonicalUrl,
  hasClaimLanguage,
  PRIVATE_ROUTES,
  productHead,
  productJsonLd,
  productMetaDescription,
  routeHead,
  splitSentences,
} from "./index";
import { SPOT_A_FAKE } from "@/content/spotAFake";
import { LEARN_ARTICLES } from "@/content/learnArticles";
import { buildSitemapXml, PUBLIC_STATIC_ROUTES, UNLISTED_ROUTES } from "./sitemap";

const root = path.resolve(__dirname, "../../../..");

describe("product meta descriptions", () => {
  it.each(products.map((p) => [p.id, p] as const))("%s: short, non-empty, no claim wording", (_id, p) => {
    const d = productMetaDescription(p);
    expect(d.length).toBeGreaterThan(30);
    expect(d.length).toBeLessThanOrEqual(160);
    expect(hasClaimLanguage(d)).toBe(false);
  });

  it("drops disease / clinical sentences and keeps the safe lead sentence", () => {
    const d = productMetaDescription({
      name: "Testex",
      description:
        "Testex is a heart peptide bioregulator. Clinically studied for heart disease. Available in 20-capsule and 60-capsule formats.",
    });
    expect(d).toBe("Testex is a heart peptide bioregulator.");
  });

  it("does not split sentences on St. / Prof.", () => {
    expect(splitSentences("Developed by Prof. Khavinson in St. Petersburg. Second.")).toEqual([
      "Developed by Prof. Khavinson in St. Petersburg.",
      "Second.",
    ]);
  });
});

describe("product structured data", () => {
  it.each(products.map((p) => [p.id, p] as const))("%s: prices match checkout pricing", (_id, p) => {
    const ld = JSON.parse(JSON.stringify(productJsonLd(p))) as any;
    expect(ld["@type"]).toBe("Product");
    expect(ld.sku).toBe(p.id);
    expect(ld.url).toBe(`https://www.purefirenutritional.com/products/${p.id}`);
    expect(ld.image[0]).toMatch(/^https:\/\/www\.purefirenutritional\.com\//);
    expect(ld.description).toBe(productMetaDescription(p));

    const sized = (p.variants ?? []).length > 1;
    if (sized) {
      const p20 = getUnitPriceUSD(p, "20");
      const p60 = getUnitPriceUSD(p, "60");
      expect(ld.offers["@type"]).toBe("AggregateOffer");
      expect(ld.offers.priceCurrency).toBe("USD");
      expect(ld.offers.lowPrice).toBe(Math.min(p20, p60).toFixed(2));
      expect(ld.offers.highPrice).toBe(Math.max(p20, p60).toFixed(2));
      expect(ld.offers.offers.map((o: any) => o.price)).toEqual([p20.toFixed(2), p60.toFixed(2)]);
    } else {
      expect(ld.offers["@type"]).toBe("Offer");
      expect(ld.offers.priceCurrency).toBe("USD");
      expect(ld.offers.price).toBe(getUnitPriceUSD(p).toFixed(2));
      expect(ld.offers.availability).toBe("https://schema.org/InStock");
    }
  });

  it("marks out-of-stock variants", () => {
    const ld = productJsonLd({
      id: "x",
      name: "X",
      priceUSD: 10,
      variants: [
        { id: "20-count", name: "20 Capsules", priceUSD: 10, inStock: false },
        { id: "60-count", name: "60 Capsules", priceUSD: 25, inStock: false },
      ],
    }) as any;
    expect(ld.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("product head uses the canonical /products/<id> path", () => {
    const head = productHead(products[0]!);
    expect(head.path).toBe(`/products/${products[0]!.id}`);
    expect(head.title).toBe(`${products[0]!.name} | Pure Fire Nutritional`);
  });
});

describe("urls", () => {
  it("canonical URLs are on www with no trailing slash or query", () => {
    expect(canonicalUrl("/")).toBe("https://www.purefirenutritional.com/");
    expect(canonicalUrl("/products/")).toBe("https://www.purefirenutritional.com/products");
    expect(canonicalUrl("/products?category=X")).toBe("https://www.purefirenutritional.com/products");
  });

  it("absolute image URLs are encoded once", () => {
    expect(absoluteUrl("/products/a b.png")).toBe("https://www.purefirenutritional.com/products/a%20b.png");
    expect(absoluteUrl("/products/a%20b.png")).toBe("https://www.purefirenutritional.com/products/a%20b.png");
    expect(absoluteUrl("https://cdn.example.com/x.png")).toBe("https://cdn.example.com/x.png");
  });
});

describe("routes, robots and sitemap", () => {
  const app = fs.readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
  const appRoutes = new Set(Array.from(app.matchAll(/<Route path="([^"]+)"/g), (m) => m[1]));

  it("every sitemap / unlisted / private route is a real route in App.tsx", () => {
    for (const r of [...PUBLIC_STATIC_ROUTES, ...UNLISTED_ROUTES, ...Object.keys(PRIVATE_ROUTES)]) {
      expect(appRoutes.has(r), r).toBe(true);
    }
  });

  it("every route in App.tsx is served by the build (prerendered or redirected), so no real page 404s", () => {
    // There is no catch-all rewrite: a URL with no prerendered file gets dist/404.html with HTTP 404.
    const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
    const redirected = new Set<string>(vercel.redirects.map((r: { source: string }) => r.source));
    // Dynamic routes prerendered from data in prerender.mjs (catalog products, published certificates).
    const prerenderedFromData = new Set(["/products/:id", "/authenticity/:slug"]);
    const prerendered = new Set([...PUBLIC_STATIC_ROUTES, ...UNLISTED_ROUTES, ...Object.keys(PRIVATE_ROUTES)]);
    const unserved = Array.from(appRoutes).filter(
      (r) => r !== "/404" && !prerendered.has(r) && !prerenderedFromData.has(r) && !redirected.has(r)
    );
    expect(unserved).toEqual([]);
  });

  it("admin pages are private (noindex, not in the sitemap)", () => {
    const adminRoutes = Array.from(appRoutes).filter((r) => r === "/admin" || r.startsWith("/admin/"));
    expect(adminRoutes).toEqual(expect.arrayContaining(["/admin", "/admin/products", "/admin/reviews"]));
    for (const r of adminRoutes) {
      expect(PRIVATE_ROUTES[r]?.noindex, r).toBe(true);
      expect(PUBLIC_STATIC_ROUTES).not.toContain(r);
    }
  });

  it("/how-to-spot-a-fake is a real page, but unlisted and noindex while it is a draft", () => {
    if (SPOT_A_FAKE.published) {
      expect(PUBLIC_STATIC_ROUTES).toContain("/how-to-spot-a-fake");
      expect(UNLISTED_ROUTES).not.toContain("/how-to-spot-a-fake");
    } else {
      expect(UNLISTED_ROUTES).toContain("/how-to-spot-a-fake");
      expect(PUBLIC_STATIC_ROUTES).not.toContain("/how-to-spot-a-fake");
      expect(routeHead("/how-to-spot-a-fake")).toBeUndefined(); // the page sets its own title + noindex
    }
  });

  it("Peptalk stays public and indexable", () => {
    expect(PUBLIC_STATIC_ROUTES).toContain("/peptalk");
    expect(routeHead("/peptalk")?.noindex).toBeFalsy();
  });

  it("private routes are noindex and never in the sitemap", () => {
    for (const [r, head] of Object.entries(PRIVATE_ROUTES)) {
      expect(head.noindex).toBe(true);
      expect(PUBLIC_STATIC_ROUTES).not.toContain(r);
    }
  });

  it("robots.txt disallows private paths and points to the sitemap", () => {
    const robots = fs.readFileSync(path.join(root, "client/public/robots.txt"), "utf8");
    for (const p of ["/admin", "/api/", "/cart", "/checkout", "/wishlist", "/dashboard", "/auth/"]) {
      expect(robots).toContain(`Disallow: ${p}\n`);
    }
    expect(robots).not.toMatch(/Disallow: \/products/);
    expect(robots).not.toMatch(/Disallow: \/peptalk/);
    expect(robots).toContain("Sitemap: https://www.purefirenutritional.com/sitemap.xml");
  });

  it("sitemap XML dedupes and escapes", () => {
    const xml = buildSitemapXml([
      { path: "/", lastmod: "2026-10-06" },
      { path: "/products/a&b" },
      { path: "/products/a&b/" },
    ]);
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml).toContain("<loc>https://www.purefirenutritional.com/products/a&amp;b</loc>");
    expect(xml).toContain("<lastmod>2026-10-06</lastmod>");
  });
});

describe("vercel.json redirects", () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));

  it("old -n20 / -n60 slugs redirect (301) for exactly the products sold in 20/60 sizes", () => {
    const rule = vercel.redirects.find((r: any) => r.source.includes(":size(n20|n60)"));
    expect(rule.statusCode).toBe(301);
    expect(rule.destination).toBe("/products/:id");
    const ids = rule.source.match(/:id\(([^)]+)\)/)[1].split("|").sort();
    const sized = products
      .filter((p) => (p.variants ?? []).some((v) => v.id === "60-count"))
      .map((p) => p.id)
      .sort();
    expect(ids).toEqual(sized);
  });

  it("/product/:id is a 301 to /products/:id and there is no catch-all rewrite", () => {
    expect(vercel.redirects).toContainEqual({
      source: "/product/:id",
      destination: "/products/:id",
      statusCode: 301,
    });
    expect(vercel.rewrites ?? []).toEqual([]);
  });
});

describe("/journal index", () => {
  const app = fs.readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
  const page = fs.readFileSync(path.join(root, "client/src/pages/Journal.tsx"), "utf8");
  const nav = fs.readFileSync(path.join(root, "client/src/components/Navigation.tsx"), "utf8");

  it("is a real, prerendered, sitemap-listed public route", () => {
    expect(app).toContain('<Route path="/journal" component={Journal} />');
    expect(PUBLIC_STATIC_ROUTES).toContain("/journal");
    expect(UNLISTED_ROUTES).not.toContain("/journal");
    expect(PRIVATE_ROUTES["/journal"]).toBeUndefined();
    expect(buildSitemapXml(PUBLIC_STATIC_ROUTES.map((p) => ({ path: p })))).toContain(`<loc>${canonicalUrl("/journal")}</loc>`);
  });

  it("sets its own title, meta description and canonical", () => {
    expect(page).toMatch(/<PageSeo title=\{JOURNAL_TITLE\} description=\{JOURNAL_DESCRIPTION\} path="\/journal" \/>/);
    expect(page).toContain('"Longevity Journal | Pure Fire Nutritional"');
    expect(page).toContain(">Longevity Journal</h1>");
    const desc = page.match(/JOURNAL_DESCRIPTION =\s*"([^"]+)"/)![1];
    expect(desc).toContain("Longevity Journal");
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(canonicalUrl("/journal")).toBe("https://www.purefirenutritional.com/journal");
  });

  it("every listed article is a real, sitemap-listed /learn/... page with a description", () => {
    expect(LEARN_ARTICLES).toHaveLength(4);
    for (const a of LEARN_ARTICLES) {
      expect(a.href.startsWith("/learn/"), a.href).toBe(true);
      expect(app).toContain(`<Route path="${a.href}"`);
      expect(PUBLIC_STATIC_ROUTES).toContain(a.href);
      expect(a.description.length, a.href).toBeGreaterThan(20);
      expect(a.description.length, a.href).toBeLessThanOrEqual(160);
      if (a.cover) expect(fs.existsSync(path.join(root, "client/public", a.cover.jpg)), a.cover.jpg).toBe(true);
    }
  });

  it("the Science nav submenu lists 2 articles in order, then Longevity Journal (no TSP link)", () => {
    const labels = LEARN_ARTICLES.filter((a) => !a.hideFromNav).map((a) => a.navLabel ?? a.title);
    expect(labels).toEqual([
      "What Are Khavinson Peptide Bioregulators?",
      "Buying Khavinson Peptides in the U.S.",
    ]);
    // Peptides in Context is on /journal only, at its unchanged URL.
    const pic = LEARN_ARTICLES.find((a) => a.href === "/learn/peptides-in-context-systems-view");
    expect(pic?.hideFromNav).toBe(true);
    // The on-page title of the US article stays the full title.
    expect(LEARN_ARTICLES[1].title).toBe("Where to Buy Authentic Khavinson Peptides in the USA: A Complete Guide");
    expect(nav).toContain("LEARN_ARTICLES.filter((a) => !a.hideFromNav).map((a) => ({ label: a.navLabel ?? a.title, href: a.href }))");
    expect(nav).toContain('{ label: "Longevity Journal", href: "/journal" }');
    expect(nav).toMatch(/href === "\/science"/); // "Science" itself still links to /science
    expect(nav).not.toMatch(/short ?peptide|theshortpeptide/i);
    expect(nav).not.toMatch(/blog|\/articles/i);
  });

  it("/learn 301s to /journal and there is no /blog or /articles route", () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
    expect(vercel.redirects).toContainEqual({ source: "/learn", destination: "/journal", statusCode: 301 });
    expect(app).not.toContain('"/blog"');
    expect(PUBLIC_STATIC_ROUTES).not.toContain("/blog");
    expect(app).not.toContain('"/articles"');
    expect(PUBLIC_STATIC_ROUTES).not.toContain("/articles");
    expect(app).not.toContain('"/insights"');
    expect(PUBLIC_STATIC_ROUTES).not.toContain("/insights");
  });
});

describe("Cytomaxes vs Cytogens merged into the What Are article", () => {
  const app = fs.readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
  const whatAre = fs.readFileSync(path.join(root, "client/src/pages/learn/WhatAreKhavinsonPeptides.tsx"), "utf8");
  const faq = fs.readFileSync(path.join(root, "client/src/pages/FAQ.tsx"), "utf8");
  const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  const OLD = "/learn/cytomaxes-vs-cytogens";
  const TARGET = "/learn/what-are-khavinson-peptide-bioregulators#cytomaxes-vs-cytogens";

  it("the standalone page, route, sitemap entry and index card are gone", () => {
    expect(fs.existsSync(path.join(root, "client/src/pages/learn/CytomaxesCytogens.tsx"))).toBe(false);
    expect(app).not.toContain(OLD);
    expect(PUBLIC_STATIC_ROUTES).not.toContain(OLD);
    expect(UNLISTED_ROUTES).not.toContain(OLD);
    expect(LEARN_ARTICLES.map((a) => a.href)).not.toContain(OLD);
  });

  it("the old URL 301s to the merged section", () => {
    expect(vercel.redirects).toContainEqual({ source: OLD, destination: TARGET, statusCode: 301 });
  });

  it("the What Are article has the #cytomaxes-vs-cytogens anchor on the Two Types section", () => {
    // 2026-10-14 rewrite: the anchor sits on the "2. Two types you'll find at Pure Fire" heading.
    expect(whatAre).toMatch(/<h2 id="cytomaxes-vs-cytogens"[^>]*>2\. Two types you'll find at Pure Fire<\/h2>/);
  });

  it("the FAQ has one Cytomaxes vs Cytogens entry linking to the section", () => {
    expect(faq.match(/Cytomaxes and Cytogens\?"/g)).toHaveLength(1);
    expect(faq).toContain(`question: "What's the difference between Cytomaxes and Cytogens?"`);
    expect(faq).toContain(`CYTOMAXES_VS_CYTOGENS_HREF = "${TARGET}"`);
  });
});
