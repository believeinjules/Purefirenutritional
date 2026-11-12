/**
 * Retailer authorization facts (Julia, 2026-11-12). One place for the homepage
 * credential, the /about/authorized-retailer page, the product-page line, the
 * footer link and the page's structured data.
 *
 * Rules:
 * - Julia, 2026-11-12 (overrides the earlier "keep partner status separate" rule):
 *   No. 296389 is the retailer number, shown on the homepage credential and the
 *   authorization page. No placeholder.
 * - No supplier website, referral URL, signature or extra personal details.
 * - Nothing here is described as independently or third-party verified.
 */
import { tagsFor } from "@/data/productTags";
import { HIDDEN_PRODUCT_IDS } from "@shared/hidden-products";

export const AUTHORIZED_RETAILER_PATH = "/about/authorized-retailer";
export const AUTHORIZED_RETAILER_TITLE = "Retailer Authorization & Product Authenticity";
export const AUTHORIZED_RETAILER_CREDENTIAL = "Authorized Khavinson Peptide Retailer";
export const PRODUCT_LINE_TEXT = "Sold by an authorized Khavinson retailer.";

/** Julia, 2026-11-12: the retailer number is 296389 (same as her partner registration). */
export const RETAILER_NUMBER = "296389";

/**
 * A public manufacturer or distributor page where customers can confirm our
 * retailer status. Empty = none available, and nothing renders (no dead link).
 * Must be the manufacturer's or distributor's own verification page; never a
 * store, never a referral URL.
 */
export const MANUFACTURER_VERIFICATION_URL = "";

/** The partner registration shown as supporting documentation (Julia's screenshot). */
export const PARTNER_REGISTRATION = {
  name: "Julia Shulman",
  number: "296389",
  registered: "April 21, 2023",
  registeredISO: "2023-04-21",
} as const;

/**
 * Products that get the "Sold by an authorized Khavinson retailer." line:
 * the Khavinson Cytomax and Cytogen collections. Revilab, GPL and Prime Peptide
 * are left out until Julia confirms the authorization covers them.
 */
const KHAVINSON_COLLECTIONS = ["collection:khavinson-cytomaxes", "collection:khavinson-cytogens"];

export function isKhavinsonAuthorizedProduct(id: string): boolean {
  if (HIDDEN_PRODUCT_IDS.has(id)) return false;
  const tags = tagsFor(id);
  return KHAVINSON_COLLECTIONS.some((t) => tags.includes(t));
}
