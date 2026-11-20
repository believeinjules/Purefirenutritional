// Lives in api/_lib/ (not api/stripe/): every non-underscore file under api/ becomes a Vercel function.
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn(async () => ({ id: "cs_test_1", url: "https://checkout.example/cs_test_1" }));
const firestoreProducts = new Map();

vi.mock("./stripe.js", () => ({
  getStripe: () => ({ checkout: { sessions: { create } } }),
  getSiteOrigin: () => "https://example.test",
}));
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

describe("POST /api/stripe/create-checkout-session — storefront packs", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    create.mockClear();
    firestoreProducts.clear();
  });

  it("rejects Khavinson 3 × 60 and 2 × 60 packs with 400 (deals are Prime Peptide only)", async () => {
    for (const bundle of ["3x60", "2x60"]) {
      const res = await call({ items: [{ productId: "cerluten", size: "60", quantity: 1, bundle }] });
      expect(res.statusCode).toBe(400);
    }
    expect(create).not.toHaveBeenCalled();
  });

  it("still charges a Khavinson 60-cap single bottle at $180", async () => {
    const res = await call({ items: [{ productId: "cerluten", size: "60", quantity: 1 }] });
    expect(res.statusCode).toBe(200);
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(18000);
  });

  it("rejects the retired 60 + 20 pack with 400", async () => {
    const res = await call({ items: [{ productId: "cerluten", size: "60", quantity: 1, bundle: "60+20" }] });
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a 3 × 20 pack on a 20/60 product with 400", async () => {
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects 3 × 60 when the selected size is 20", async () => {
    const res = await call({ items: [{ productId: "cerluten", size: "20", quantity: 1, bundle: "3x60" }] });
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("still accepts a Prime Peptide 2-bottle cycle bundle (legacy)", async () => {
    const res = await call({ items: [{ productId: "prime-peptide-brain", quantity: 1, bundle: 2 }] });
    expect(res.statusCode).toBe(200);
    // $324 × 0.956 = $309.74 → $309
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(30900);
  });
});
