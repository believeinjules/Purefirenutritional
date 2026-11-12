import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pepitaStorefrontDirections } from "./pepitaDirections";
import STORE from "../../../../shared/peppy/storefront-directions.json";

const FILE = resolve(__dirname, "../../../../shared/peppy/storefront-directions.json");

describe("Pepita storefront directions (generated copy of the product-page directions)", () => {
  it("matches the product-page copy exactly (regenerate: PEPITA_WRITE_DIRECTIONS=1 npx vitest run pepitaDirections)", () => {
    const want = pepitaStorefrontDirections();
    if (process.env.PEPITA_WRITE_DIRECTIONS) writeFileSync(FILE, JSON.stringify(want, null, 2) + "\n");
    else expect(STORE).toEqual(want);
  });

  it("never carries hidden products, outside domains or referral text", () => {
    const text = JSON.stringify(pepitaStorefrontDirections());
    for (const id of ["calsil-t", "indosine", "panaxod"]) expect(text).not.toContain(`"${id}"`);
    expect(text).not.toMatch(/https?:|www\.|\.ru\b|ref=/i);
  });
});
