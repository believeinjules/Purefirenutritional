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

  it("charges Cerluten 60 + 20 at $177.49 and names the line clearly", async () => {
    const res = await call({ items: [{ productId: "cerluten", size: "60", quantity: 1, bundle: "60+20" }] });
    expect(res.statusCode).toBe(200);
    const line = (create.mock.calls[0] as any)[0].line_items[0];
    expect(line.price_data.unit_amount).toBe(17749);
    expect(line.price_data.product_data.name).toBe("Cerluten 60 + 20 capsules");
    expect(line.price_data.product_data.metadata.bundle_kind).toBe("60+20");
  });

  it("charges Cerluten 2 × 60 at $279.00", async () => {
    const res = await call({ items: [{ productId: "cerluten", size: "60", quantity: 1, bundle: "2x60" }] });
    expect(res.statusCode).toBe(200);
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(27900);
  });

  it("rejects a 3 × 20 pack on a 20/60 product with 400", async () => {
    const res = await call({ items: [{ productId: "gotratix", size: "20", quantity: 1, bundle: 3 }] });
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects 60 + 20 when the selected size is 20", async () => {
    const res = await call({ items: [{ productId: "cerluten", size: "20", quantity: 1, bundle: "60+20" }] });
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("still accepts a Prime Peptide 2-bottle cycle bundle (legacy)", async () => {
    const res = await call({ items: [{ productId: "prime-peptide-brain", quantity: 1, bundle: 2 }] });
    expect(res.statusCode).toBe(200);
    // $139.99 − $4, times 2
    expect((create.mock.calls[0] as any)[0].line_items[0].price_data.unit_amount).toBe(2 * (13999 - 400));
  });
});
