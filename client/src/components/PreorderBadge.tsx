import { showsPreorderBadge, PREORDER_BADGE } from "@shared/preorder";

/** "Pre-order" pill for items that are both on the pre-order list and not in stock. */
export default function PreorderBadge({
  productId,
  fulfillment,
  className = "",
}: {
  productId: string;
  fulfillment?: unknown;
  className?: string;
}) {
  if (!showsPreorderBadge({ id: productId, fulfillment })) return null;
  return (
    <span
      data-testid="preorder-badge"
      className={`inline-block text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full ${className}`}
    >
      {PREORDER_BADGE}
    </span>
  );
}
