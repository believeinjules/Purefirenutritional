// Lives in api/_lib/ (not api/stripe/): every non-underscore file under api/ becomes a Vercel function.
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn(async () => ({ id: "cs_test_1", url: "https://checkout.example/cs_test_1" }));
const firestoreProducts = new Map();

vi.mock("./stripe.js", () => ({
  getStripe: () => ({ checkout: { sessions: { create } } }),
  getSiteOrigin: () => "https://example.test",
}));
// Empty map → the handler falls back to the code catalog. A test can put a live
// product in the map to override catalog prices (same path as Firestore).
vi.mock("./catalog.js", () => ({ loadFirestoreProducts: async () => firestoreProducts }));

import handler from "../stripe/create-checkout-session";

function call(body: unknown) {
  const res: { statusCode?: number; body?: any; status: (c: number) => any; json: (b: unknown) => any; setHeader: () => void } = {
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(b: unknown) {
      this.body = b;
      return this;
    },
    setHeader() {},
  };
  return handler({ method: "POST", body, headers: {} } as any, res as any).then(() => res);
}

describe("POST /api/stripe/create-checkout-session — bundles", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    create.mockClear();
    firestoreProducts.clear();
  });

  it("accepts Gotratix 3 × 20 caps now that the 20-cap price is above the 60-cap bottle", async () => {
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(200);
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(15597);
  });

  it("accepts an offered bundle and charges the server-computed price", async () => {
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 2 }] });
    expect(res.statusCode).toBe(200);
    const params = (create.mock.calls[0] as any)[0];
    expect(params.line_items[0].price_data.unit_amount).toBe(11198);
  });

  it("keeps a bundle that stays above the bigger bottle (Cartalax 3 × 20 caps)", async () => {
    const res = await call({ items: [{ productId: "cartalax", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(200);
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(11997);
  });

  it("rejects a bundle that would undercut a larger bottle (safety net) with 400", async () => {
    // Previous $58.99 20-cap / $153.99 60-cap pair, as if still live in Firestore.
    firestoreProducts.set("gotratix", {
      id: "gotratix",
      name: "Gotratix",
      priceUSD: 58.99,
      variants: [
        { id: "20-count", name: "20 Capsules", priceUSD: 58.99 },
        { id: "60-count", name: "60 Capsules", priceUSD: 153.99 },
      ],
    });
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/3-bottle bundle is not available for Gotratix/);
    expect(create).not.toHaveBeenCalled();
  });
});
