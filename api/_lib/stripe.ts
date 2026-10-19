import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripe) {
    stripe = new Stripe(key, {
      // Must equal the installed stripe package's Stripe.LatestApiVersion
      // (stripe@20.4.1 → 2026-02-25.clover). Keep in sync with server/routes/stripe.ts.
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripe;
}

/** Public site origin for success/cancel URLs (no trailing slash). */
export function getSiteOrigin(reqOrigin?: string | string[] | null): string {
  const fromHeader = Array.isArray(reqOrigin) ? reqOrigin[0] : reqOrigin;
  if (fromHeader && /^https?:\/\//i.test(fromHeader)) {
    return fromHeader.replace(/\/$/, "");
  }
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://www.purefirenutritional.com";
}
