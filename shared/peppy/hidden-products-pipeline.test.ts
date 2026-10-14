import { describe, expect, it } from "vitest";
import { products } from "../../client/src/data/products";
import { HIDDEN_PRODUCT_IDS, withoutHiddenProducts } from "../hidden-products";
import { buildCatalog } from "./catalog";
import { answerPeppy } from "./respond";
import type { PeppyProduct } from "./types";

const catalog = buildCatalog(products as never);
const QUESTION = "Which Pure Fire product for sleep?";

describe("Pepita answer pipeline never returns hidden products", () => {
  it("suggests products for a normal catalog (control)", async () => {
    const { response } = await answerPeppy({ message: QUESTION }, { catalog });
    expect(response.products.length).toBeGreaterThan(0);
  });

  it("drops products whose ids are hidden, even if they reach the catalog", async () => {
    const { response: control } = await answerPeppy(
      { message: QUESTION },
      { catalog }
    );
    const hiddenIds = Array.from(HIDDEN_PRODUCT_IDS);
    // Simulate a stale/unfiltered catalog: the entries the topics point at now carry hidden ids.
    const leaky = new Map<string, PeppyProduct>(catalog);
    control.products.forEach((s, i) => {
      const id = hiddenIds[i % hiddenIds.length];
      leaky.set(s.product.id, { ...s.product, id });
    });
    for (const callLlm of [
      undefined,
      async () => Promise.reject(new Error("down")),
    ]) {
      const { response } = await answerPeppy(
        { message: QUESTION },
        { catalog: leaky, callLlm }
      );
      for (const s of response.products)
        expect(HIDDEN_PRODUCT_IDS.has(s.product.id)).toBe(false);
    }
  });

  it("withoutHiddenProducts keeps visible ones and returns the same object when nothing changes", () => {
    const visible = { products: [{ product: { id: "endoluten" } }] };
    expect(withoutHiddenProducts(visible)).toBe(visible);
    const mixed = {
      products: [
        { product: { id: "femalin" } },
        { product: { id: "endoluten" } },
      ],
    };
    expect(
      withoutHiddenProducts(mixed).products.map(s => s.product.id)
    ).toEqual(["endoluten"]);
  });
});
