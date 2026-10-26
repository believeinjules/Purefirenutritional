import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMail = vi.fn(async (_m: any) => ({}));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: (m: any) => sendMail(m) }) },
}));

import {
  buildOwnerOrderEmail,
  sendOwnerOrderNotification,
  sendOrderConfirmation,
  orderNotifyAddress,
  type OwnerOrderNotification,
} from "./email";

const order = (o: Partial<OwnerOrderNotification> = {}): OwnerOrderNotification => ({
  orderNumber: "ORD-1700000000000-ABC123XYZ",
  customerName: "Jane Buyer",
  customerEmail: "jane@example.com",
  items: [
    { name: "Bonomarlot (20 Capsules)", size: "20", quantity: 2, price: 155.98 },
    { name: "Vladonix", size: null, quantity: 1, price: 58.99 },
  ],
  subtotal: 214.97,
  shipping: 5,
  tax: 9.02,
  total: 228.99,
  currency: "USD",
  shippingName: "Jane Buyer",
  shippingAddress: { line1: "1 Main St", line2: "Apt 2", city: "New York", state: "NY", postal_code: "10001", country: "US" },
  ...o,
});

describe("owner order notification", () => {
  beforeEach(() => {
    sendMail.mockReset();
    sendMail.mockImplementation(async () => ({}));
    process.env.EMAIL_USER = "store@example.com";
    process.env.EMAIL_PASS = "x";
    delete process.env.ORDER_NOTIFY_EMAIL;
  });

  it("sends to purefiren@gmail.com with subject and all fields", async () => {
    expect(await sendOwnerOrderNotification(order())).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const m = sendMail.mock.calls[0][0];
    expect(m.to).toBe("purefiren@gmail.com");
    expect(m.replyTo).toBe("jane@example.com");
    expect(m.subject).toBe("New Pure Fire order #ORD-1700000000000-ABC123XYZ");
    for (const s of [
      "ORD-1700000000000-ABC123XYZ", "Customer: Jane Buyer", "Email: jane@example.com",
      "- Bonomarlot (20 Capsules) (size 20) x2 - $155.98", "- Vladonix x1 - $58.99",
      "Subtotal: $214.97", "Shipping: $5.00", "Tax: $9.02", "Total: $228.99",
      "1 Main St", "Apt 2", "New York, NY 10001", "US",
    ]) expect(m.text).toContain(s);
    expect(m.html).toContain("<td>Bonomarlot (20 Capsules)</td><td>20</td>");
    expect(m.html).toContain("Total: $228.99");
  });

  it("recipient overridable via ORDER_NOTIFY_EMAIL", async () => {
    process.env.ORDER_NOTIFY_EMAIL = " other@example.com ";
    expect(orderNotifyAddress()).toBe("other@example.com");
    await sendOwnerOrderNotification(order());
    expect(sendMail.mock.calls[0][0].to).toBe("other@example.com");
  });

  it("HTML-escapes customer-provided values", () => {
    const { html } = buildOwnerOrderEmail(
      order({
        customerName: `<script>alert("x")</script>`,
        customerEmail: `a&b@example.com`,
        items: [{ name: `<b>Evil</b>`, size: `"20"`, quantity: 1, price: 1 }],
        shippingName: "O'Brien <img>",
        shippingAddress: { line1: "<i>1 Main</i>", city: "A&B" },
      })
    );
    expect(html).not.toMatch(/<script>|<b>Evil|<img>|<i>1 Main/);
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("a&amp;b@example.com");
    expect(html).toContain("&lt;b&gt;Evil&lt;/b&gt;");
    expect(html).toContain("&quot;20&quot;");
    expect(html).toContain("O&#39;Brien &lt;img&gt;");
    expect(html).toContain("A&amp;B");
  });

  it("returns false (no throw) and logs without PII when transport fails", async () => {
    sendMail.mockImplementation(async () => { throw new Error("SMTP down"); });
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendOwnerOrderNotification(order())).toBe(false);
    const logged = JSON.stringify(err.mock.calls);
    expect(logged).toContain("SMTP down");
    expect(logged).not.toContain("jane@example.com");
    expect(logged).not.toContain("1 Main St");
    err.mockRestore();
  });

  it("owner failure doesn't break the customer confirmation send", async () => {
    sendMail.mockImplementationOnce(async () => { throw new Error("owner fail"); });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendOwnerOrderNotification(order())).toBe(false);
    expect(
      await sendOrderConfirmation({
        orderId: "ORD-1", customerName: "Jane", customerEmail: "jane@example.com",
        items: [], total: 1, orderDate: new Date().toISOString(),
      })
    ).toBe(true);
    expect(sendMail.mock.calls[1][0].to).toBe("jane@example.com");
  });

  it("skips (false) when EMAIL_USER/EMAIL_PASS missing", async () => {
    delete process.env.EMAIL_PASS;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await sendOwnerOrderNotification(order())).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("handles missing name/email/address", () => {
    const { text } = buildOwnerOrderEmail(order({ customerName: null, customerEmail: null, shippingName: null, shippingAddress: null }));
    expect(text).toContain("Customer: (no name)");
    expect(text).toContain("(no shipping address)");
  });
});
