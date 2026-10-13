import { beforeEach, describe, expect, it } from "vitest";
import { loadPeppyCatalog, resetCatalogCache } from "./products";

const fakeDb = (
  docs: { id: string; data: Record<string, unknown> }[] | Error
) => ({
  collection: () => ({
    limit: () => ({
      get: async () => {
        if (docs instanceof Error) throw docs;
        return { docs: docs.map(d => ({ id: d.id, data: () => d.data })) };
      },
    }),
  }),
});

describe("Peppy catalog", () => {
  beforeEach(() => resetCatalogCache());

  it("uses the code catalog when Firebase Admin isn't configured", async () => {
    const { catalog, source } = await loadPeppyCatalog({ db: null });
    expect(source).toBe("code");
    expect(catalog.get("endoluten")?.name).toBe("Endoluten");
    // Claim filter applied to catalog benefits.
    for (const p of Array.from(catalog.values()))
      for (const b of p.benefits)
        expect(b).not.toMatch(/\d+\s*%|lifespan|telomer/i);
  });

  it("lets Firestore override price/stock and hide products", async () => {
    const { catalog, source } = await loadPeppyCatalog({
      db: fakeDb([
        { id: "endoluten", data: { name: "Endoluten", priceUSD: 99.5 } },
        { id: "cartalax", data: { name: "Cartalax", hidden: true } },
        {
          id: "new-firestore-only",
          data: {
            name: "New Product",
            priceUSD: 20,
            description: "A new formula.",
          },
        },
      ]),
    });
    expect(source).toBe("firestore+code");
    expect(catalog.get("endoluten")?.priceUSD).toBe(99.5);
    expect(catalog.has("cartalax")).toBe(false);
    expect(catalog.get("new-firestore-only")?.name).toBe("New Product");
  });

  it("falls back to the code catalog when Firestore errors", async () => {
    const { source, catalog } = await loadPeppyCatalog({
      db: fakeDb(new Error("boom")),
    });
    expect(source).toBe("code");
    expect(catalog.size).toBeGreaterThan(50);
  });
});
