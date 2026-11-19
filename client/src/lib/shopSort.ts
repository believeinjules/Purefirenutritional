import { isKhavinsonAuthorizedProduct } from "@/data/retailerAuthorization";

export const SHOP_SORT_FEATURED = "featured";

export type ShopSortId =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc";

export type ShopSortProduct = { id: string; name: string; priceUSD: number };
export type ShopReviewSummary = { average?: number; count?: number };

/** Khavinson authorized line first, then A–Z within each group. */
export function compareFeatured<T extends { id: string; name: string }>(a: T, b: T): number {
  const ka = isKhavinsonAuthorizedProduct(a.id) ? 0 : 1;
  const kb = isKhavinsonAuthorizedProduct(b.id) ? 0 : 1;
  return ka - kb || a.name.localeCompare(b.name);
}

export function sortProducts<T extends ShopSortProduct>(
  products: T[],
  sortBy: string,
  reviewSummaries: Record<string, ShopReviewSummary> = {},
): T[] {
  const result = [...products];
  switch (sortBy) {
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      result.sort((a, b) => a.priceUSD - b.priceUSD);
      break;
    case "price-desc":
      result.sort((a, b) => b.priceUSD - a.priceUSD);
      break;
    case "rating-desc":
      result.sort((a, b) => {
        const ra = reviewSummaries[a.id];
        const rb = reviewSummaries[b.id];
        return (
          (rb?.average ?? 0) - (ra?.average ?? 0) ||
          (rb?.count ?? 0) - (ra?.count ?? 0) ||
          a.name.localeCompare(b.name)
        );
      });
      break;
    case "featured":
    default:
      result.sort(compareFeatured);
      break;
  }
  return result;
}
