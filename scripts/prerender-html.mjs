/**
 * Pure HTML helpers shared by prerender.mjs and its tests, so the checks that
 * fail the build are exactly the ones the tests exercise.
 */

/** Put the page's Helmet head tags into the template (title replaced only when the page set one). */
export function applyHead(page, helmet) {
  if (!helmet) return page;
  const title = helmet.title?.toString() ?? "";
  if (/<title[^>]*>[^<]+<\/title>/.test(title)) {
    page = page.replace(/<title>[\s\S]*?<\/title>/, title);
  }
  const extra = ["meta", "link", "script"].map((key) => helmet[key]?.toString() ?? "").join("");
  return extra ? page.replace("</head>", `${extra}</head>`) : page;
}

const unescape = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");

function metaContent(html, key, value) {
  for (const m of html.matchAll(/<meta\b[^>]*>/g)) {
    const tag = m[0];
    const k = tag.match(new RegExp(`\\b${key}="([^"]*)"`));
    if (k && k[1] === value) {
      const c = tag.match(/\bcontent="([^"]*)"/);
      return c ? unescape(c[1]) : null;
    }
  }
  return null;
}

/** Parsed JSON-LD blocks (throws on invalid JSON so a broken block fails the build). */
export function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1])
  );
}

/** Heading levels in document order, e.g. [1, 2, 2, 3]. */
export function headingLevels(html) {
  return [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
}

/**
 * Problems with a prerendered LIVE bundle page ([] = OK).
 * expected: { name, title, description, canonical, priceUSD, imageCount }
 */
export function checkLiveBundlePage(html, expected) {
  const p = [];
  const root = html.match(/<div id="root">([\s\S]*)<\/div>/)?.[1] ?? "";
  const h1s = [...root.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => unescape(m[1].replace(/<[^>]+>/g, "")).trim());
  if (h1s.length !== 1) p.push(`expected exactly one <h1>, found ${h1s.length}`);
  else if (h1s[0] !== expected.name) p.push(`<h1> is "${h1s[0]}", expected "${expected.name}"`);
  const levels = headingLevels(root);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) p.push(`heading level skips from h${levels[i - 1]} to h${levels[i]}`);
  }
  if (levels[0] !== 1) p.push("first heading is not the <h1>");

  const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1];
  if (!title || unescape(title) !== expected.title) p.push(`title is ${JSON.stringify(title && unescape(title))}`);
  const checks = [
    ["name", "description", expected.description],
    ["property", "og:title", expected.title],
    ["property", "og:description", expected.description],
    ["property", "og:url", expected.canonical],
    ["property", "og:type", "product"],
    ["name", "twitter:title", expected.title],
    ["name", "twitter:description", expected.description],
  ];
  for (const [k, v, want] of checks) {
    const got = metaContent(html, k, v);
    if (got !== want) p.push(`${v} is ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }
  if (!metaContent(html, "property", "og:image")) p.push("og:image missing");
  if (/<meta[^>]*name="robots"[^>]*noindex/.test(html)) p.push("live bundle page carries noindex");
  const canon = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
  if (canon !== expected.canonical) p.push(`canonical is ${JSON.stringify(canon)}, expected ${expected.canonical}`);

  let blocks = [];
  try {
    blocks = jsonLdBlocks(html);
  } catch (err) {
    p.push(`JSON-LD does not parse: ${err.message}`);
  }
  const products = blocks.filter((b) => b["@type"] === "Product");
  const crumbs = blocks.filter((b) => b["@type"] === "BreadcrumbList");
  if (products.length !== 1) p.push(`expected one Product JSON-LD block, found ${products.length}`);
  if (crumbs.length !== 1) p.push(`expected one BreadcrumbList JSON-LD block, found ${crumbs.length}`);
  const prod = products[0];
  if (prod) {
    if (prod["@context"] !== "https://schema.org") p.push("Product @context");
    if (prod.name !== expected.name) p.push(`Product name ${JSON.stringify(prod.name)}`);
    if (prod.description !== expected.description) p.push("Product description is not the approved meta description");
    if (prod.url !== expected.canonical) p.push("Product url != canonical");
    if (!Array.isArray(prod.image) || prod.image.length !== expected.imageCount || !prod.image.every((u) => /^https:\/\//.test(u)))
      p.push("Product image must list the lifestyle photo and every bottle photo as absolute URLs");
    if (!prod.brand?.name) p.push("Product brand missing");
    if (prod.aggregateRating || prod.review) p.push("Product must not carry ratings / reviews");
    const o = prod.offers;
    if (!o || o["@type"] !== "Offer") p.push("Product offers missing");
    else {
      if (o.price !== expected.priceUSD.toFixed(2)) p.push(`offer price ${o.price}, expected ${expected.priceUSD.toFixed(2)}`);
      if (o.priceCurrency !== "USD") p.push("offer priceCurrency");
      if (!/^https:\/\/schema\.org\/(InStock|BackOrder|OutOfStock)$/.test(o.availability ?? "")) p.push("offer availability");
      if (o.url !== expected.canonical) p.push("offer url != canonical");
      if (!o.seller) p.push("offer seller missing");
    }
  }
  const crumb = crumbs[0];
  if (crumb) {
    const items = crumb.itemListElement ?? [];
    const last = items[items.length - 1];
    if (items.length < 2 || !last || last.item !== expected.canonical || last.name !== expected.name) p.push("breadcrumb must end at this bundle");
    items.forEach((it, i) => {
      if (it.position !== i + 1 || !it.name || !/^https:\/\//.test(it.item ?? "")) p.push(`breadcrumb item ${i + 1} invalid`);
    });
  }
  return p;
}

/** Old business phone, replaced 2026-11-25; must not appear in any built page. */
export const OLD_PHONE_PATTERNS = [/315\)?[\s.-]*567[\s.-]*7931/, /\+?1?3155677931/];

/**
 * Problems with the business phone on a prerendered page ([] = OK).
 * phone: { display, href, schema }; opts.link: page must show the tel: link;
 * opts.jsonLd: the page's Organization (OnlineStore) node must carry phone.schema.
 */
export function checkBusinessPhone(html, phone, opts = {}) {
  const p = [];
  if (OLD_PHONE_PATTERNS.some((re) => re.test(html))) p.push("old phone (315) 567-7931 still present");
  if (opts.link) {
    if (!html.includes(`href="${phone.href}"`)) p.push(`missing ${phone.href} link`);
    if (!html.includes(phone.display)) p.push(`missing displayed phone ${phone.display}`);
  }
  if (opts.jsonLd) {
    let blocks = [];
    try {
      blocks = jsonLdBlocks(html);
    } catch (err) {
      p.push(`JSON-LD does not parse: ${err.message}`);
    }
    const nodes = blocks.flatMap((b) => (Array.isArray(b["@graph"]) ? b["@graph"] : [b]));
    const org = nodes.find((n) => n["@type"] === "OnlineStore" || n["@type"] === "Organization");
    if (!org) p.push("no Organization JSON-LD");
    else {
      if (org.telephone !== phone.schema) p.push(`Organization telephone is ${JSON.stringify(org.telephone)}, expected ${phone.schema}`);
      for (const c of org.contactPoint ?? []) if (c.telephone && c.telephone !== phone.schema) p.push(`ContactPoint telephone is ${c.telephone}`);
    }
  }
  return p;
}
