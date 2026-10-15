/**
 * Build step 3 of 4 (after `vite build` + `vite build --ssr`):
 *
 *  - Prerenders every public page — static pages, certificate pages, Learn
 *    articles and one page per catalog product — so the raw HTML already has
 *    the page's own <title>, meta description, canonical, Open Graph / Twitter
 *    tags and JSON-LD (Product structured data on product pages).
 *  - Prerenders unlisted draft pages (e.g. /how-to-spot-a-fake): real pages
 *    that carry their own noindex and stay out of the sitemap.
 *  - Writes noindex shells for private routes (cart, checkout, account, admin).
 *  - Writes dist/404.html (served by Vercel with a real 404 status for any URL
 *    that is not a page) and dist/sitemap.xml generated from the same catalog.
 *
 * The browser app still mounts with createRoot, so prerendered markup is only
 * what crawlers / link previews see before JavaScript runs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");

/** Private routes that keep their current SSR body (they were prerendered before). */
const PRIVATE_WITH_BODY = new Set(["/cart", "/wishlist"]);

function outPathFor(route) {
  return route === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, route.slice(1), "index.html");
}

function writeFile(outPath, contents) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents);
}

/**
 * Approved, public reviews grouped by product id, read with the Firebase Admin
 * SDK (same FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * env the api/ routes use). Returns an empty map when credentials are missing
 * or the read fails: no AggregateRating is ever emitted without real reviews.
 */
async function loadApprovedReviews(ssr) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const byProduct = new Map();
  if (!projectId || !clientEmail || !privateKey) return { byProduct, note: "no Admin credentials, skipped" };
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    const app =
      getApps().find((a) => a.name === "prerender") ??
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, "prerender");
    const snap = await getFirestore(app).collection("reviews").where("approved", "==", true).get();
    for (const d of snap.docs) {
      const data = d.data();
      if (!ssr.isPublicReview(data)) continue;
      const r = ssr.toPublicReview(d.id, data);
      const list = byProduct.get(r.productId) ?? [];
      list.push(r);
      byProduct.set(r.productId, list);
    }
    return { byProduct, note: `${snap.size} approved docs` };
  } catch (err) {
    return { byProduct: new Map(), note: `read failed (${err.message}), skipped` };
  }
}

/** Add aggregateRating to the page's existing Product JSON-LD block (no second Product block). */
function withAggregateRating(page, summary) {
  if (!summary || summary.count < 1) return page;
  return page.replace(
    /(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,
    (whole, open, body, close) => {
      let ld;
      try {
        ld = JSON.parse(body);
      } catch {
        return whole;
      }
      if (!ld || ld["@type"] !== "Product" || ld.aggregateRating) return whole;
      ld.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: summary.average,
        reviewCount: summary.count,
        bestRating: 5,
        worstRating: 1,
      };
      return `${open}${JSON.stringify(ld).replace(/</g, "\\u003c")}${close}`;
    }
  );
}

async function prerender() {
  const ssr = await import(path.join(distDir, "server/entry-server.js"));
  const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
  const buildDate = new Date().toISOString().slice(0, 10);

  function applyHead(page, helmet) {
    if (!helmet) return page;
    const title = helmet.title?.toString() ?? "";
    // Only replace the default title when the page actually set one.
    if (/<title[^>]*>[^<]+<\/title>/.test(title)) {
      page = page.replace(/<title>[\s\S]*?<\/title>/, title);
    }
    const extra = ["meta", "link", "script"]
      .map((key) => helmet[key]?.toString() ?? "")
      .join("");
    return extra ? page.replace("</head>", `${extra}</head>`) : page;
  }

  /** SSR one route. `withBody: false` keeps an empty #root (head tags only). */
  function renderRoute(route, { product = null, withBody = true } = {}) {
    let html = "";
    let helmet = null;
    try {
      const result = ssr.render(route, { product });
      html = result.html;
      helmet = result.helmet;
    } catch (err) {
      console.warn(`Warning: SSR render failed for ${route}, using shell HTML:`, err.message);
    }
    const page = withBody
      ? template.replace(`<div id="root"></div>`, `<div id="root">${html}</div>`)
      : template;
    return applyHead(page, helmet);
  }

  // ── Catalog (Firestore live prices, code-catalog fallback) ────────────────
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const catalog = await ssr.loadSeoCatalog({ projectId });
  console.log(`SEO catalog: ${catalog.entries.length} products (${catalog.note})`);

  // ── Public static pages + certificate pages ───────────────────────────────
  const certificateRoutes = ssr.publishedCertificates.map((c) => `/authenticity/${c.slug}`);
  const publicRoutes = [...ssr.PUBLIC_STATIC_ROUTES, ...certificateRoutes];
  for (const route of publicRoutes) {
    writeFile(outPathFor(route), renderRoute(route));
    console.log(`Prerendered: ${route}`);
  }

  // ── Unlisted public pages (drafts: noindex set by the page, not in sitemap) ─
  for (const route of ssr.UNLISTED_ROUTES) {
    writeFile(outPathFor(route), renderRoute(route));
    console.log(`Prerendered (unlisted): ${route}`);
  }

  // ── Product pages ─────────────────────────────────────────────────────────
  const reviews = await loadApprovedReviews(ssr);
  console.log(`Reviews for AggregateRating: ${reviews.note}`);
  const rated = [];
  const missingLd = [];
  for (const { product } of catalog.entries) {
    const route = ssr.productPath(product.id);
    let page = renderRoute(route, { product });
    const productReviews = reviews.byProduct.get(product.id);
    if (productReviews?.length) {
      page = withAggregateRating(page, ssr.summarizeReviews(productReviews));
      rated.push(product.id);
    }
    if (!page.includes('"@type":"Product"')) missingLd.push(product.id);
    writeFile(outPathFor(route), page);
  }
  console.log(`Prerendered: ${catalog.entries.length} product pages under /products/<id>`);
  console.log(`AggregateRating added for ${rated.length} product(s)${rated.length ? `: ${rated.join(", ")}` : ""}`);
  if (missingLd.length) {
    console.warn(`Warning: no Product JSON-LD rendered for: ${missingLd.join(", ")}`);
  }

  // ── Private routes (noindex) ──────────────────────────────────────────────
  for (const route of Object.keys(ssr.PRIVATE_ROUTES)) {
    writeFile(outPathFor(route), renderRoute(route, { withBody: PRIVATE_WITH_BODY.has(route) }));
    console.log(`Prerendered (noindex): ${route}`);
  }

  // ── Customer review form, one noindex shell per product (/review/<id>) ───
  // Not in the sitemap. The page sets its own noindex; without a file here
  // Vercel would serve 404.html for the link Julia sends customers.
  for (const { product } of catalog.entries) {
    const route = `/review/${product.id}`;
    writeFile(outPathFor(route), renderRoute(route, { withBody: false }));
  }
  console.log(`Prerendered (noindex): ${catalog.entries.length} review forms under /review/<id>`);

  // ── 404 page (Vercel serves dist/404.html with status 404) ───────────────
  writeFile(path.join(distDir, "404.html"), renderRoute("/404"));
  console.log("Prerendered: 404.html");

  // ── sitemap.xml ───────────────────────────────────────────────────────────
  const sitemapEntries = [
    ...publicRoutes.map((route) => ({ path: route, lastmod: buildDate })),
    ...catalog.entries.map(({ product, updatedAt }) => ({
      path: ssr.productPath(product.id),
      lastmod: updatedAt ? ssr.w3cDate(updatedAt) : buildDate,
    })),
  ];
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), ssr.buildSitemapXml(sitemapEntries));
  console.log(`Wrote sitemap.xml (${sitemapEntries.length} URLs)`);
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
