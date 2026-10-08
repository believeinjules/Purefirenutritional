import ReactDOMServer from "react-dom/server";
import { Router } from "wouter";
import helmetPkg from "react-helmet-async";
const { HelmetProvider } = helmetPkg as any;
import App from "./App";
import { SeoProductContext } from "./components/seo/SeoProductContext";
import type { SeoProduct } from "./lib/seo";

// Build-time helpers for prerender.mjs (sitemap, product pages, route lists).
export { loadSeoCatalog } from "@shared/seo-catalog";
export { publishedCertificates } from "./data/certificates";
export { PRIVATE_ROUTES, SITE_URL, productPath, productHead } from "./lib/seo";
export { PUBLIC_STATIC_ROUTES, UNLISTED_ROUTES, buildSitemapXml, w3cDate } from "./lib/seo/sitemap";

// Simple static location hook for SSR — no useSyncExternalStore needed
function makeStaticHook(path: string) {
  const hook = () => [path, () => {}] as [string, (to: string) => void];
  hook.searchHook = () => "";
  return hook;
}

export function render(
  url: string,
  options?: { product?: SeoProduct | null }
): { html: string; helmet: any } {
  const helmetContext: any = {};

  const html = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <SeoProductContext.Provider value={options?.product ?? null}>
        <Router hook={makeStaticHook(url)}>
          <App />
        </Router>
      </SeoProductContext.Provider>
    </HelmetProvider>
  );

  return { html, helmet: helmetContext.helmet };
}
