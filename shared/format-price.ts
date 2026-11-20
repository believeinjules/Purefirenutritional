/**
 * Shopper-facing price text (Julia, 2026-11-20): whole-dollar amounts show no
 * cents ($180), anything with cents keeps two decimals ($11.98, $64.99).
 * Structured data keeps its own numeric format (client/src/lib/seo).
 */
export function formatUSD(amount: number): string {
  const cents = Math.round(amount * 100);
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return abs % 100 === 0 ? `${sign}$${abs / 100}` : `${sign}$${(abs / 100).toFixed(2)}`;
}

export function formatUSDCents(cents: number): string {
  return formatUSD(cents / 100);
}

/**
 * Percent saved vs buying the same bottles separately, floored to 0.1 so the
 * saving is never overstated, with a trailing ".0" dropped:
 * $351 / $360 → "2.5%", $513 / $540 → "5%", $405 / $432 → "6.2%" (6.25 floored).
 * Integer math avoids float drift. Returns null when there is no saving.
 */
export function savingsPercentLabel(regularCents: number, dealCents: number): string | null {
  const regular = Math.round(regularCents);
  const deal = Math.round(dealCents);
  if (!(regular > 0) || !(deal < regular)) return null;
  const tenths = Math.floor(((regular - deal) * 1000) / regular);
  if (tenths <= 0) return null;
  return tenths % 10 === 0 ? `${tenths / 10}%` : `${(tenths / 10).toFixed(1)}%`;
}
