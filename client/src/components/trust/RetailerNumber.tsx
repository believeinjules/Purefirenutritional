import { RETAILER_NUMBER } from "@/data/retailerAuthorization";

/** The retailer number as plain text (Julia, 2026-11-12: 296389). */
export default function RetailerNumber({ className = "" }: { className?: string }) {
  return <span className={className}>{RETAILER_NUMBER}</span>;
}
