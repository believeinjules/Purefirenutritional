// Lives in api/_lib/ (not api/stripe/): every non-underscore file under api/ becomes a Vercel function.
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn(async () => ({ id: "cs_test_1", url: "https://checkout.example/cs_test_1" }));

vi.mock("./stripe.js", () => ({
  getStripe: () => ({ checkout: { sessions: { create } } }),
  getSiteOrigin: () => "https://example.test",
}));
// No Firestore in tests → the handler falls back to the code catalog (same prices as live).
vi.mock("./catalog.js", () => ({ loadFirestoreProducts: async () => new Map() }));

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
  });

  it("rejects a hidden bundle (Gotratix 3 × 20 caps would undercut the 60-cap bottle) with 400", async () => {
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/3-bottle bundle is not available for Gotratix/);
    expect(create).not.toHaveBeenCalled();
  });

  it("accepts an offered bundle and charges the server-computed price", async () => {
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 2 }] });
    expect(res.statusCode).toBe(200);
    const params = (create.mock.calls[0] as any)[0];
    expect(params.line_items[0].price_data.unit_amount).toBe(10998);
  });

  it("keeps a bundle that stays above the bigger bottle (Cartalax 3 × 20 caps)", async () => {
    const res = await call({ items: [{ productId: "cartalax", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(200);
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(11997);
  });
});
