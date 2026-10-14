import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { products } from "../client/src/data/products";
import DATA from "./peppy/product-data.json";

/**
 * Regression for 47d997e (2026-06-07): the N20/N60 merge script deleted every
 * -n20/-n60 listing but only re-added sizes to products that already had a base
 * listing, silently dropping these. They must stay in the storefront catalog.
 */
const RESTORED = ["bonothyrk", "cerluten", "chitomur", "chonluten", "glandokort", "libidon", "ovagen", "pinealon", "sigumir", "stamakort", "suprefort", "svetinorm", "taxorest", "zhenoluten"];
const MERGED = ["bonomarlot", "cartalax", "chelohart", "crystagen", "endoluten", "gotratix", "pielotax", "testoluten", "thyreogen", "ventfort", "vesugen", "visoluten", "vladonix"];

describe("restored products", () => {
  it.each([...RESTORED, ...MERGED])("%s is in the storefront with 20- and 60-capsule sizes", id => {
    const p = products.find(x => x.id === id);
    expect(p, id).toBeDefined();
    expect(p!.variants?.map(v => v.id)).toEqual(["20-count", "60-count"]);
    expect(p!.image && existsSync(`client/public${p!.image}`), `${id} image`).toBe(true);
  });
  it.each(RESTORED)("%s is priced $58.99/€40 and $153.99/€110 and in stock", id => {
    const p = products.find(x => x.id === id)!;
    expect([p.priceUSD, p.priceEUR]).toEqual([58.99, 40]);
    expect(p.variants!.map(v => [v.priceUSD, v.priceEUR, v.inStock])).toEqual([[58.99, 40, true], [153.99, 110, true]]);
  });
  it("restored copy has no lifespan/mortality/cancer figures", () => {
    for (const id of RESTORED) {
      const p = products.find(x => x.id === id)!;
      expect(`${p.description} ${p.seriesInfo} ${(p.benefits ?? []).join(" ")}`).not.toMatch(/lifespan|mortality|cancer|tumou?r|\d+\s*%|military|cosmonaut/i);
    }
  });
  it("old -n20/-n60 URLs redirect for every merged product", () => {
    const v = readFileSync("vercel.json", "utf8");
    for (const id of [...RESTORED, ...MERGED]) expect(v).toMatch(new RegExp(`[(|]${id}[|)][^"]*-:size\\(n20\\|n60\\)`));
  });
  it("Pepita product data covers them", () => {
    const ids = new Set((DATA as { products: { id: string }[] }).products.map(p => p.id));
    for (const id of RESTORED) expect(ids.has(id), id).toBe(true);
  });
});
