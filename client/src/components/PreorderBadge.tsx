import { isPreorderProduct, PREORDER_BADGE } from "@shared/preorder";

/** "Pre-order" pill for liquid/drop products. Renders nothing for other products. */
export default function PreorderBadge({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  if (!isPreorderProduct(productId)) return null;
  return (
    <span
      data-testid="preorder-badge"
      className={`inline-block text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full ${className}`}
    >
      {PREORDER_BADGE}
    </span>
  );
}
