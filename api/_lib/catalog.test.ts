import { describe, it, expect, vi } from "vitest";

vi.mock("./firebase.js", () => ({ getAdminDb: () => null }));

import { firestoreDocToPriceable, loadFirestoreProducts } from "./catalog";

describe("firestoreDocToPriceable", () => {
  it("normalizes a seeded product doc", () => {
    const p = firestoreDocToPriceable("bonomarlot", {
      name: "Bonomarlot",
      description: "d",
      priceUSD: 77.99,
      image: "/products/Banomarlot.png",
      variants: [
        { id: "20-count", name: "20 Capsules", priceUSD: 77.99, inStock: true },
        { id: "60-count", name: "60 Capsules", priceUSD: 204.99, inStock: true },
      ],
    });
    expect(p?.priceUSD).toBe(77.99);
    expect(p?.variants?.map((v) => v.priceUSD)).toEqual([77.99, 204.99]);
  });

  it("accepts legacy snake_case price_usd", () => {
    const p = firestoreDocToPriceable("x", { name: "X", price_usd: "12.5" });
    expect(p?.priceUSD).toBe(12.5);
  });

  it("rejects docs with no usable price (falls back to code catalog)", () => {
    expect(firestoreDocToPriceable("x", { name: "X", priceUSD: 0 })).toBeNull();
    expect(firestoreDocToPriceable("x", { name: "X" })).toBeNull();
  });

  it("rejects docs with a malformed variant", () => {
    expect(
      firestoreDocToPriceable("x", {
        name: "X",
        priceUSD: 10,
        variants: [{ id: "20-count", name: "20 Capsules", priceUSD: -1 }],
      })
    ).toBeNull();
  });

  it("rejects docs without a name", () => {
    expect(firestoreDocToPriceable("x", { priceUSD: 10 })).toBeNull();
  });
});

describe("loadFirestoreProducts", () => {
  it("returns an empty map when Admin SDK is not configured", async () => {
    const map = await loadFirestoreProducts(["bonomarlot"]);
    expect(map.size).toBe(0);
  });
});
