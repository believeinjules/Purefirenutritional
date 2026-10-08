import { Truck } from "lucide-react";
import { COMMERCE_CONFIG } from "@shared/commerce-config";
import { amountToFreeShippingUSD } from "@shared/shipping-rate";
import { FREE_SHIPPING_THRESHOLD_LABEL } from "@/lib/shippingCopy";

type Props = {
  /**
   * Merchandise subtotal in USD. When given, the banner shows progress
   * ("$40.02 away from free shipping"); otherwise it states the offer.
   */
  subtotalUSD?: number;
  /** "bar" = slim full-width strip; "card" = inline box (cart). */
  variant?: "bar" | "card";
  className?: string;
};

/**
 * Free-shipping message. The threshold comes from shared/commerce-config.ts —
 * the same number the server uses to set $0 shipping in the Stripe session.
 */
export default function FreeShippingBanner({ subtotalUSD, variant = "bar", className = "" }: Props) {
  const threshold = COMMERCE_CONFIG.freeShippingThresholdUSD;
  const hasSubtotal = typeof subtotalUSD === "number" && Number.isFinite(subtotalUSD);
  const remaining = hasSubtotal ? amountToFreeShippingUSD(subtotalUSD!) : threshold;
  const qualifies = hasSubtotal && remaining === 0;
  const progress = hasSubtotal ? Math.min(100, Math.max(0, (subtotalUSD! / threshold) * 100)) : 0;

  const message = !hasSubtotal
    ? `Free shipping on orders of ${FREE_SHIPPING_THRESHOLD_LABEL} or more`
    : qualifies
      ? "Your order ships free"
      : `You're $${remaining.toFixed(2)} away from free shipping`;

  if (variant === "bar") {
    return (
      <div
        className={`w-full bg-gray-50 border-b border-gray-100 text-gray-700 ${className}`}
        data-testid="free-shipping-banner"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs tracking-wide">
          <Truck className="w-3.5 h-3.5 text-orange-600" aria-hidden />
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 ${className}`}
      data-testid="free-shipping-banner"
    >
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 text-orange-600" aria-hidden />
        <span className={qualifies ? "font-medium text-green-700" : ""}>{message}</span>
      </div>
      {hasSubtotal && (
        <div
          className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={threshold}
          aria-valuenow={Math.min(threshold, Math.round(subtotalUSD! * 100) / 100)}
          aria-label="Progress toward free shipping"
        >
          <div
            className={`h-full rounded-full ${qualifies ? "bg-green-600" : "bg-orange-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
