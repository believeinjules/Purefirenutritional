/** Shopper-facing shipping copy, built from shared/commerce-config.ts (never hard-coded). */
import { COMMERCE_CONFIG } from "@shared/commerce-config";

import { formatUSD } from "@shared/format-price";

export { formatUSD };

export const FREE_SHIPPING_THRESHOLD_LABEL = formatUSD(COMMERCE_CONFIG.freeShippingThresholdUSD);
export const STANDARD_SHIPPING_LABEL = formatUSD(COMMERCE_CONFIG.standardShippingUSD);

/** "Shipping is $11.98, and it is free when the merchandise subtotal is $155 or more." */
export const SHIPPING_RULE_SENTENCE = `Shipping is ${STANDARD_SHIPPING_LABEL}, and it is free when the merchandise subtotal is ${FREE_SHIPPING_THRESHOLD_LABEL} or more.`;
