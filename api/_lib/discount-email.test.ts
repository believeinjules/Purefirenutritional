import { describe, expect, it } from "vitest";
import { buildOwnerOrderEmail, discountLine } from "./email";

const base = {
  orderNumber: "ORD-1",
  customerName: "Jane",
  customerEmail: "jane@example.com",
  items: [{ name: "Cerluten (60 Capsules)", quantity: 1, price: 161.09 }],
  subtotal: 178.99,
  shipping: 0,
  tax: 0,
  total: 161.09,
  shippingName: null,
  shippingAddress: null,
};

describe("order emails with a discount", () => {
  it("discountLine formats code and amount, empty when none", () => {
    expect(discountLine(17.9, "FIRE10-K7Q2MX")).toBe("Discount (FIRE10-K7Q2MX): -$17.90");
    expect(discountLine(17.9, null)).toBe("Discount: -$17.90");
    expect(discountLine(0, "X")).toBe("");
    expect(discountLine(undefined)).toBe("");
  });

  it("owner email shows the discount line before the total", () => {
    const { text, html } = buildOwnerOrderEmail({ ...base, discount: 17.9, discountCode: "FIRE10-K7Q2MX" });
    expect(text).toMatch(/Tax: \$0\.00\nDiscount \(FIRE10-K7Q2MX\): -\$17\.90\nTotal: \$161\.09/);
    expect(html).toContain("Discount (FIRE10-K7Q2MX): -$17.90<br><strong>Total: $161.09");
  });

  it("owner email is unchanged when there is no discount", () => {
    const { text } = buildOwnerOrderEmail({ ...base, total: 178.99 });
    expect(text).not.toMatch(/Discount/);
    expect(text).toMatch(/Tax: \$0\.00\nTotal: \$178\.99/);
  });
});
