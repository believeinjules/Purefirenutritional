/**
 * Choose which sitemap URLs to submit to IndexNow after a production deploy.
 *
 * Prefer a precise set: sitemap URL/lastmod diffs plus a map from changed
 * files to routes. Fall back to the full current sitemap only when the
 * change is site-wide or cannot be mapped confidently (e.g. nav, CSS,
 * prerender, or an unmapped source file). A uniform lastmod bump — every
 * page stamped with a new build date — is treated as noise, not a content
 * change.
 */
export const INDEXNOW_HOST = "www.purefirenutritional.com";
export const INDEXNOW_BASE = `https://${INDEXNOW_HOST}`;

/** Page files that map to one or more fixed sitemap paths. */
export const FILE_ROUTES = {
  "client/src/pages/Index.tsx": ["/"],
  "client/src/pages/Home.tsx": ["/"],
  "client/src/pages/Products.tsx": ["/products"],
  "client/src/pages/SystemsLanding.tsx": ["/products/system"],
  "client/src/pages/KhavinsonPeptidesList.tsx": ["/khavinson-peptides-list"],
  "client/src/pages/AIAssistant.tsx": ["/ai-assistant"],
  "client/src/pages/FAQ.tsx": ["/faq"],
  "client/src/pages/Science.tsx": ["/science"],
  "client/src/pages/About.tsx": ["/about"],
  "client/src/pages/AuthorizedRetailer.tsx": ["/about/authorized-retailer"],
  "client/src/pages/Documentation.tsx": ["/authenticity"],
  "client/src/pages/Peptalk.tsx": ["/peptalk"],
  "client/src/pages/Journal.tsx": ["/learn"],
  "client/src/pages/HowToSpotAFake.tsx": ["/how-to-spot-a-fake"],
  "client/src/pages/policies/Privacy.tsx": ["/privacy"],
  "client/src/pages/policies/Terms.tsx": ["/terms"],
  "client/src/pages/policies/Shipping.tsx": ["/shipping"],
  "client/src/pages/policies/Returns.tsx": ["/returns"],
  "client/src/components/policy/PolicyPage.tsx": ["/privacy", "/terms", "/shipping", "/returns"],
  "client/src/pages/learn/WhatAreKhavinsonPeptides.tsx": ["/learn/what-are-khavinson-peptide-bioregulators"],
  "client/src/pages/learn/BuyKhavinsonUSA.tsx": ["/learn/buy-khavinson-peptides-usa"],
  "client/src/pages/learn/PeptidesInContext.tsx": ["/learn/peptides-in-context-systems-view"],
  "client/src/pages/learn/PerimenopauseOralEvidence.tsx": ["/learn/khavinson-bioregulators-perimenopause-oral-evidence"],
  "client/src/pages/learn/WhyBuyFromPureFire.tsx": ["/learn/why-buy-khavinson-peptides-from-pure-fire"],
  "client/src/pages/learn/ResearchVsFdaApproval.tsx": ["/learn/khavinson-peptide-bioregulators-research-vs-fda-approval"],
  "client/src/pages/learn/OralVsInjectableDelivery.tsx": ["/learn/oral-vs-injectable-peptide-bioregulators-digestion-delivery"],
  "client/src/pages/learn/BioregulatorOrganPairings.tsx": ["/learn/bioregulator-organ-pairings-mechanism-vs-evidence"],
  "client/src/pages/learn/CytomaxesCytogensGlossary.tsx": ["/learn/cytomaxes-cytogens-a-numbers-glossary"],
  "client/src/pages/learn/RegistrationVsCoa.tsx": ["/learn/registration-certificate-vs-certificate-of-analysis"],
  "client/src/pages/learn/HowToChooseRetailer.tsx": ["/learn/how-to-choose-a-peptide-bioregulator-retailer"],
  "client/src/pages/learn/VesugenResearchSafety.tsx": ["/learn/vesugen-research-safety"],
};

const PATH_PREFIX_FILES = {
  "client/src/pages/ProductDetail.tsx": ["/products/"],
  "client/src/pages/DocumentationDetail.tsx": ["/authenticity/"],
  "client/src/pages/BrowseCategoryPage.tsx": ["/products/system/", "/products/collection/", "/products/goal/"],
  "client/src/data/products.ts": ["/products", "/products/"],
  "client/src/data/bodySystems.ts": ["/products/system/", "/products/collection/", "/products/goal/", "/khavinson-peptides-list"],
};

const AMBIGUOUS_FILES = [
  /^client\/src\/App\.tsx$/,
  /^client\/src\/main\.tsx$/,
  /^client\/src\/index\.css$/,
  /^client\/index\.html$/,
  /^index\.html$/,
  /^prerender\.mjs$/,
  /^tailwind\.config\.js$/,
  /^vite\.config\.ts$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^pnpm-lock\.yaml$/,
  /^client\/src\/components\/Navigation\.tsx$/,
  /^client\/src\/components\/Footer\.tsx$/,
  /^client\/src\/components\/shop\/FreeShippingBanner\.tsx$/,
  /^client\/src\/lib\/seo\//,
  /^shared\/seo/,
];

const IGNORE_FILES = [
  /\.test\.(ts|tsx|js|mjs)$/,
  /(^|\/)test\//,
  /^pending\//,
  /^screenshots\//,
  /^docs\//,
  /^\.github\//,
  /^\.gitignore$/,
  /\.md$/,
  /\.b64$/,
];

const SOURCE_FILE = /\.(tsx?|jsx?|mjs|css|html)$/;

export function toAbsUrl(pathOrUrl, base = INDEXNOW_BASE) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export function parseSitemap(xml) {
  if (!xml || typeof xml !== "string") return [];
  const entries = [];
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g);
  if (blocks) {
    for (const block of blocks) {
      const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
      const lastmod = block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] ?? null;
      if (loc) entries.push({ loc, lastmod });
    }
    return entries;
  }
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => ({ loc: m[1], lastmod: null }));
}

/**
 * Compare two parsed sitemaps. A near-universal lastmod change (typical of a
 * prerender that stamps every static URL with the build date) is flagged so
 * callers can ignore lastmod-only "changes".
 */
export function diffSitemaps(previous, current) {
  const prev = new Map((previous || []).map((e) => [e.loc, e.lastmod || null]));
  const curr = new Map((current || []).map((e) => [e.loc, e.lastmod || null]));
  const added = [...curr.keys()].filter((u) => !prev.has(u));
  const removed = [...prev.keys()].filter((u) => !curr.has(u));
  const lastmodChanged = [...curr.keys()].filter(
    (u) => prev.has(u) && (prev.get(u) || "") !== (curr.get(u) || "") && prev.get(u) && curr.get(u)
  );
  const overlapping = [...curr.keys()].filter((u) => prev.has(u));
  const lastmodAmbiguous = overlapping.length > 0 && lastmodChanged.length / overlapping.length >= 0.8;
  return { added, removed, lastmodChanged, lastmodAmbiguous };
}

export function isIgnoredFile(file) {
  return IGNORE_FILES.some((re) => re.test(file));
}

export function isAmbiguousFile(file) {
  return AMBIGUOUS_FILES.some((re) => re.test(file));
}

function urlsWithPrefix(currentUrls, prefixes, base) {
  const absPrefixes = prefixes.map((p) => (p.endsWith("/") ? toAbsUrl(p, base) : `${toAbsUrl(p, base)}`));
  return (currentUrls || []).filter((u) =>
    absPrefixes.some((p) => (p.endsWith("/") ? u === p.slice(0, -1) || u.startsWith(p) : u === p || u.startsWith(`${p}/`)))
  );
}

export function routesForFile(file, currentUrls = [], base = INDEXNOW_BASE) {
  if (FILE_ROUTES[file]) {
    const urls = FILE_ROUTES[file].map((p) => toAbsUrl(p, base));
    return currentUrls.length ? urls.filter((u) => currentUrls.includes(u)) : urls;
  }
  if (PATH_PREFIX_FILES[file]) return urlsWithPrefix(currentUrls, PATH_PREFIX_FILES[file], base);
  return null;
}

function uniqueSorted(urls) {
  return [...new Set(urls)].sort();
}

/**
 * @param {{ previousSitemap?: string | {loc:string,lastmod?:string|null}[], currentSitemap?: string | {loc:string,lastmod?:string|null}[], changedFiles?: string[], currentUrls?: string[], base?: string }} opts
 * @returns {{ urls: string[], reason: string, fallback: boolean }}
 */
export function selectIndexNowUrls(opts = {}) {
  const base = opts.base || INDEXNOW_BASE;
  const previous = typeof opts.previousSitemap === "string" ? parseSitemap(opts.previousSitemap) : opts.previousSitemap || null;
  const currentParsed = typeof opts.currentSitemap === "string" ? parseSitemap(opts.currentSitemap) : opts.currentSitemap || null;
  const currentUrls = (opts.currentUrls || (currentParsed ? currentParsed.map((e) => e.loc) : [])).map((u) => toAbsUrl(u, base));

  const changedFiles = (opts.changedFiles || []).map((f) => f.replace(/^\.\//, ""));
  const relevant = changedFiles.filter((f) => !isIgnoredFile(f));

  if (relevant.some(isAmbiguousFile)) {
    return { urls: uniqueSorted(currentUrls), reason: "ambiguous-files", fallback: true };
  }

  const fromFiles = new Set();
  const unmapped = [];
  for (const file of relevant) {
    const mapped = routesForFile(file, currentUrls, base);
    if (mapped !== null) mapped.forEach((u) => fromFiles.add(u));
    else if (SOURCE_FILE.test(file) || file.startsWith("client/") || file.startsWith("shared/") || file.startsWith("api/")) {
      unmapped.push(file);
    }
  }
  if (unmapped.length) {
    return { urls: uniqueSorted(currentUrls), reason: "ambiguous-files", fallback: true };
  }

  const fromSitemap = new Set();
  if (previous && currentParsed) {
    const diff = diffSitemaps(previous, currentParsed);
    diff.added.forEach((u) => fromSitemap.add(u));
    if (!diff.lastmodAmbiguous) diff.lastmodChanged.forEach((u) => fromSitemap.add(u));
  }

  const urls = uniqueSorted([...fromFiles, ...fromSitemap]);
  if (!urls.length) {
    return { urls: [], reason: "no-indexable-changes", fallback: false };
  }
  return { urls, reason: "changed", fallback: false };
}
