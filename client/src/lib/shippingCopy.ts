/** Shopper-facing shipping copy, built from shared/commerce-config.ts (never hard-coded). */
import { COMMERCE_CONFIG } from "@shared/commerce-config";

export function formatUSD(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export const FREE_SHIPPING_THRESHOLD_LABEL = formatUSD(COMMERCE_CONFIG.freeShippingThresholdUSD);
export const STANDARD_SHIPPING_LABEL = `$${COMMERCE_CONFIG.standardShippingUSD.toFixed(2)}`;

/** "Shipping is $19.95, and it is free when the merchandise subtotal is $150 or more." */
export const SHIPPING_RULE_SENTENCE = `Shipping is ${STANDARD_SHIPPING_LABEL}, and it is free when the merchandise subtotal is ${FREE_SHIPPING_THRESHOLD_LABEL} or more.`;
