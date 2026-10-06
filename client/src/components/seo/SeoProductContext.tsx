import { createContext } from "react";
import type { SeoProduct } from "@/lib/seo";

/**
 * Build-time product snapshot for prerendering product pages (set only by the
 * SSR entry). In the browser this is always null and pages use live data.
 */
export const SeoProductContext = createContext<SeoProduct | null>(null);
