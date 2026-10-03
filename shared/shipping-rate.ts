/**
 * FedEx Rates and Transit Times quote for a US zip.
 * Origin is Germany. No street address is stored here.
 * If the FedEx account env vars are missing, this returns
 * "shipping rate unavailable" and never invents a dollar amount.
 */

export const FEDEX_REQUIRED_ENV = [
  "FEDEX_API_KEY",
  "FEDEX_SECRET_KEY",
  "FEDEX_ACCOUNT_NUMBER",
  "FEDEX_ORIGIN_POSTAL_CODE",
  "FEDEX_PACKAGE_WEIGHT_LB",
] as const;

export type ShippingQuote =
  | {
      available: true;
      amountUSD: number;
      amountCents: number;
      serviceName: string;
      currency: "usd";
    }
  | {
      available: false;
      message: "shipping rate unavailable";
      missing?: string[];
    };

const UNAVAILABLE = "shipping rate unavailable" as const;

export function missingFedExEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  const missing: string[] = [];
  for (const key of FEDEX_REQUIRED_ENV) {
    const value = env[key];
    if (typeof value !== "string" || value.trim() === "") missing.push(key);
  }
  if (!missing.includes("FEDEX_PACKAGE_WEIGHT_LB")) {
    const weight = Number(env.FEDEX_PACKAGE_WEIGHT_LB);
    if (!Number.isFinite(weight) || weight <= 0) missing.push("FEDEX_PACKAGE_WEIGHT_LB");
  }
  return missing;
}

/** 5-digit US zip, optional +4. Returns the 5-digit form or null. */
export function normalizeUsZip(input: string): string | null {
  const match = String(input || "").trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1] : null;
}

type RatedDetail = {
  totalNetCharge?: number;
  currency?: string;
  rateType?: string;
  shipmentRateDetail?: { totalNetCharge?: number; currency?: string };
};

type RateReplyDetail = {
  serviceName?: string;
  serviceType?: string;
  ratedShipmentDetails?: RatedDetail[];
};

/** Lowest positive USD FedEx charge. Account rates win over list rates. Never returns 0. */
export function pickFedExUsdQuote(
  body: unknown
): { amountUSD: number; serviceName: string } | null {
  const details = (body as { output?: { rateReplyDetails?: RateReplyDetail[] } } | null)
    ?.output?.rateReplyDetails;
  if (!Array.isArray(details)) return null;

  const candidates: { amount: number; service: string; account: boolean }[] = [];
  for (const detail of details) {
    const service = detail.serviceName || detail.serviceType || "FedEx";
    for (const rated of detail.ratedShipmentDetails || []) {
      const currency = String(
        rated.currency || rated.shipmentRateDetail?.currency || ""
      ).toUpperCase();
      const amount = rated.totalNetCharge ?? rated.shipmentRateDetail?.totalNetCharge;
      if (currency !== "USD") continue;
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) continue;
      candidates.push({
        amount,
        service,
        account: String(rated.rateType || "").toUpperCase() === "ACCOUNT",
      });
    }
  }
  if (candidates.length === 0) return null;
  const pool = candidates.some((c) => c.account)
    ? candidates.filter((c) => c.account)
    : candidates;
  pool.sort((a, b) => a.amount - b.amount);
  return { amountUSD: pool[0].amount, serviceName: pool[0].service };
}

export async function quoteUsZipShipping(args: {
  postalCode: string;
  units: number;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
}): Promise<ShippingQuote> {
  const env = args.env ?? process.env;
  const zip = normalizeUsZip(args.postalCode);
  if (!zip) {
    return { available: false, message: UNAVAILABLE, missing: ["US zip"] };
  }

  const missing = missingFedExEnv(env);
  if (missing.length > 0) {
    return { available: false, message: UNAVAILABLE, missing };
  }

  const units = Math.max(1, Math.min(99, Math.floor(Number(args.units) || 1)));
  const unitWeight = Number(env.FEDEX_PACKAGE_WEIGHT_LB);
  const weight = Math.round(unitWeight * units * 1000) / 1000;
  const base = (env.FEDEX_API_BASE || "https://apis.fedex.com").replace(/\/$/, "");
  const fetchImpl = args.fetchImpl ?? fetch;

  try {
    const tokenRes = await fetchImpl(`${base}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: String(env.FEDEX_API_KEY),
        client_secret: String(env.FEDEX_SECRET_KEY),
      }),
    });
    if (!tokenRes.ok) return { available: false, message: UNAVAILABLE };
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) return { available: false, message: UNAVAILABLE };

    const rateRes = await fetchImpl(`${base}/rate/v1/rates/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${tokenJson.access_token}`,
        "X-locale": "en_US",
      },
      body: JSON.stringify({
        accountNumber: { value: env.FEDEX_ACCOUNT_NUMBER },
        requestedShipment: {
          shipper: {
            address: {
              postalCode: String(env.FEDEX_ORIGIN_POSTAL_CODE).trim(),
              countryCode: (env.FEDEX_ORIGIN_COUNTRY_CODE || "DE").trim(),
            },
          },
          recipient: {
            address: { postalCode: zip, countryCode: "US" },
          },
          pickupType: "DROPOFF_AT_FEDEX_LOCATION",
          packagingType: "YOUR_PACKAGING",
          rateRequestType: ["ACCOUNT", "LIST"],
          requestedPackageLineItems: [
            { weight: { units: "LB", value: weight } },
          ],
        },
      }),
    });
    if (!rateRes.ok) return { available: false, message: UNAVAILABLE };
    const picked = pickFedExUsdQuote(await rateRes.json());
    if (!picked) return { available: false, message: UNAVAILABLE };
    const amountUSD = Math.round(picked.amountUSD * 100) / 100;
    if (!(amountUSD > 0)) return { available: false, message: UNAVAILABLE };
    return {
      available: true,
      amountUSD,
      amountCents: Math.round(amountUSD * 100),
      serviceName: picked.serviceName,
      currency: "usd",
    };
  } catch {
    return { available: false, message: UNAVAILABLE };
  }
}

/** Stripe shipping_options entry, or undefined when there is no positive FedEx quote. */
export function stripeShippingOption(quote: ShippingQuote, postalCode: string) {
  if (!quote.available || !(quote.amountCents > 0)) return undefined;
  const zip = normalizeUsZip(postalCode) || postalCode.trim();
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount: quote.amountCents, currency: "usd" as const },
        display_name: `${quote.serviceName} to ${zip}`,
      },
    },
  ];
}

/**
 * Customer shipping is a flat $19.95.
 * Free only when the merchandise subtotal is strictly over $150.00.
 * $150.00 (15000 cents) pays $19.95. $150.01 (15001 cents) is free.
 * This does not call FedEx and does not use any other rate.
 */
export const STANDARD_SHIPPING_CENTS = 1995;
export const FREE_SHIPPING_OVER_CENTS = 15000;

export function shippingCentsForMerchandiseCents(merchandiseCents: number): number {
  if (!Number.isFinite(merchandiseCents) || merchandiseCents <= FREE_SHIPPING_OVER_CENTS) {
    return STANDARD_SHIPPING_CENTS;
  }
  return 0;
}

export function shippingCentsForMerchandiseUSD(subtotalUSD: number): number {
  if (typeof subtotalUSD !== "number" || !Number.isFinite(subtotalUSD)) {
    return STANDARD_SHIPPING_CENTS;
  }
  return shippingCentsForMerchandiseCents(Math.round(subtotalUSD * 100));
}

/** Always one Stripe shipping option: $19.95, or $0 when the subtotal is over $150. */
export function flatStripeShippingOption(merchandiseCents: number) {
  const amount = shippingCentsForMerchandiseCents(merchandiseCents);
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount" as const,
        fixed_amount: { amount, currency: "usd" as const },
        display_name: amount === 0 ? "Free shipping" : "Shipping",
      },
    },
  ];
}
