import { useEffect, useState } from "react";
import { products as catalogProducts } from "@/data/products";
import { fetchProducts, type Product } from "@/lib/productsStorage";
import { getPdpContent } from "@shared/product-facts";
import { DESCRIPTION_SUPPRESSED_IDS } from "@/data/bodySystems";

/**
 * Storefront catalog for category pages: the code catalog (so prerendered HTML
 * lists every product link), replaced by live Firestore data in the browser.
 * Both already exclude hidden products.
 */
export function useCategoryCatalog(): Product[] {
  const [list, setList] = useState<Product[]>(catalogProducts as unknown as Product[]);
  useEffect(() => {
    fetchProducts()
      .then((p) => p.length && setList(p))
      .catch(console.error);
  }, []);
  return list;
}

/** The product's own short (meta) description; none for copy flagged for Editorial. */
export function shortDescription(id: string): string | undefined {
  if (DESCRIPTION_SUPPRESSED_IDS.has(id)) return undefined;
  return getPdpContent(id)?.metaDescription || undefined;
}
