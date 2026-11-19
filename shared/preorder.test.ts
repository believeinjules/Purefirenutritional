import { describe, expect, it } from "vitest";
import { PREORDER_PRODUCT_IDS, isPreorderProduct, showsPreorderBadge } from "./preorder";

describe("showsPreorderBadge", () => {
  it("hides the badge when a listed liquid is in stock, and shows it when fulfillment is delayed", () => {
    expect(PREORDER_PRODUCT_IDS.size).toBe(21);
    for (const id of PREORDER_PRODUCT_IDS) {
      expect(isPreorderProduct(id)).toBe(true);
      expect(showsPreorderBadge(id)).toBe(false);
      expect(showsPreorderBadge({ id, fulfillment: "in_stock" })).toBe(false);
      expect(showsPreorderBadge({ id, fulfillment: "ships_2_weeks" })).toBe(true);
    }
    expect(showsPreorderBadge("endoluten")).toBe(false);
    expect(showsPreorderBadge({ id: "endoluten", fulfillment: "ships_2_weeks" })).toBe(false);
    expect(showsPreorderBadge({ id: "custom", preorder: true, fulfillment: "in_stock" })).toBe(false);
    expect(showsPreorderBadge({ id: "custom", preorder: true, fulfillment: "ships_2_weeks" })).toBe(true);
  });
});
