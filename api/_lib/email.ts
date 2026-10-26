import nodemailer from "nodemailer";
import { FOUNDER_EMAIL, SUPPORT_EMAIL } from "../../shared/contact-emails.js";

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  orderDate: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);

  if (!emailUser || !emailPass) {
    console.warn("[email] credentials not configured — skipping send");
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: { user: emailUser, pass: emailPass },
  });
}

export async function sendOrderConfirmation(
  order: OrderDetails
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const itemsText = order.items
    .map((i) => `${i.name} x${i.quantity} - $${i.price.toFixed(2)}`)
    .join("\n");

  try {
    await transporter.sendMail({
      from: `"Pure Fire Nutritional" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      replyTo: SUPPORT_EMAIL,
      subject: `Order Confirmation #${order.orderId} - Pure Fire Nutritional`,
      text: `Thank you for your order, ${order.customerName}!\n\nOrder #${order.orderId}\n${itemsText}\n\nTotal: $${order.total.toFixed(2)}\n\nQuestions about your order? Email ${SUPPORT_EMAIL} with your order number.`,
      html: `<p>Hi ${escapeHtml(order.customerName)},</p><p>We've received order <strong>#${escapeHtml(order.orderId)}</strong>.</p><p>Total: <strong>$${order.total.toFixed(2)}</strong></p><p>Thank you for choosing Pure Fire Nutritional.</p><p>Questions about your order? Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> with your order number.</p>`,
    });
    return true;
  } catch (err) {
    console.error("[email] sendOrderConfirmation failed:", err);
    return false;
  }
}

/** Where new-review notifications go: REVIEW_NOTIFY_EMAIL if set, else Julia (FOUNDER_EMAIL). */
export function reviewNotifyAddress(): string {
  return (process.env.REVIEW_NOTIFY_EMAIL || "").trim() || FOUNDER_EMAIL;
}

export type ReviewNotification = {
  kindLabel: string;
  productName: string;
  rating: number;
  text: string;
  displayName: string;
  email: string;
  serviceText: string;
};

/** Plain notification to Julia for each /review submission. Returns false when email isn't configured. */
export async function sendReviewNotification(n: ReviewNotification): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;
  const stars = n.rating ? `${"★".repeat(n.rating)}${"☆".repeat(5 - n.rating)} (${n.rating}/5)` : "";
  const lines: string[] = [
    `New ${n.kindLabel} review (pending approval)`,
    `Product: ${n.productName}`,
    ...(stars ? [`Rating: ${stars}`] : []),
    `From: ${n.displayName}${n.email ? ` <${n.email}> (private)` : ""}`,
    "",
    n.text,
    ...(n.serviceText ? ["", "Buying experience (separate service review):", n.serviceText] : []),
    "",
    "Approve or reject in Admin → Reviews: https://www.purefirenutritional.com/admin/reviews",
  ];
  try {
    await transporter.sendMail({
      from: `"Pure Fire Nutritional" <${process.env.EMAIL_USER}>`,
      to: reviewNotifyAddress(),
      ...(n.email ? { replyTo: n.email } : {}),
      subject: `New review: ${n.productName}${n.rating ? ` (${n.rating}★)` : ""} from ${n.displayName}`,
      text: lines.join("\n"),
      html: lines.map((l) => (l ? `<p>${escapeHtml(l).replace(/\n/g, "<br>")}</p>` : "")).join(""),
    });
    return true;
  } catch (err) {
    console.error("[email] sendReviewNotification failed:", err);
    return false;
  }
}

/** Default store-owner inbox for new-order notifications. */
export const DEFAULT_ORDER_NOTIFY_EMAIL = "purefiren@gmail.com";

/** Where new-order notifications go: ORDER_NOTIFY_EMAIL if set, else purefiren@gmail.com. */
export function orderNotifyAddress(): string {
  return (process.env.ORDER_NOTIFY_EMAIL || "").trim() || DEFAULT_ORDER_NOTIFY_EMAIL;
}

export type OwnerOrderAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type OwnerOrderNotification = {
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  items: Array<{ name: string; size?: string | null; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
  shippingName: string | null;
  shippingAddress: OwnerOrderAddress | null;
};

const money = (n: number) => `$${n.toFixed(2)}`;

function addressLines(name: string | null, a: OwnerOrderAddress | null): string[] {
  if (!a) return name ? [name] : [];
  const cityLine = [[a.city, a.state].filter(Boolean).join(", "), a.postal_code]
    .filter(Boolean)
    .join(" ");
  return [name, a.line1, a.line2, cityLine, a.country].filter(
    (l): l is string => !!l && l.trim() !== ""
  );
}

/** Builds the owner email (pure; exported for tests). */
export function buildOwnerOrderEmail(o: OwnerOrderNotification) {
  const subject = `New Pure Fire order #${o.orderNumber}`;
  const name = o.customerName || "(no name)";
  const email = o.customerEmail || "(no email)";
  const itemLine = (i: OwnerOrderNotification["items"][number]) =>
    `${i.name}${i.size ? ` (size ${i.size})` : ""} x${i.quantity} - ${money(i.price)}`;
  const addr = addressLines(o.shippingName, o.shippingAddress);
  const cur = o.currency && o.currency !== "USD" ? ` ${o.currency}` : "";

  const text = [
    `New order #${o.orderNumber}`,
    "",
    `Customer: ${name}`,
    `Email: ${email}`,
    "",
    "Items:",
    ...o.items.map((i) => `- ${itemLine(i)}`),
    "",
    `Subtotal: ${money(o.subtotal)}`,
    `Shipping: ${money(o.shipping)}`,
    `Tax: ${money(o.tax)}`,
    `Total: ${money(o.total)}${cur}`,
    "",
    "Ship to:",
    ...(addr.length ? addr : ["(no shipping address)"]),
  ].join("\n");

  const e = escapeHtml;
  const html =
    `<h2>New order #${e(o.orderNumber)}</h2>` +
    `<p><strong>Customer:</strong> ${e(name)}<br><strong>Email:</strong> ${e(email)}</p>` +
    `<table cellpadding="4" style="border-collapse:collapse"><tr><th align="left">Item</th><th align="left">Size</th><th>Qty</th><th align="right">Price</th></tr>` +
    o.items
      .map(
        (i) =>
          `<tr><td>${e(i.name)}</td><td>${e(i.size || "")}</td><td align="center">${i.quantity}</td><td align="right">${money(i.price)}</td></tr>`
      )
      .join("") +
    `</table>` +
    `<p>Subtotal: ${money(o.subtotal)}<br>Shipping: ${money(o.shipping)}<br>Tax: ${money(o.tax)}<br><strong>Total: ${money(o.total)}${e(cur)}</strong></p>` +
    `<p><strong>Ship to:</strong><br>${(addr.length ? addr : ["(no shipping address)"]).map(e).join("<br>")}</p>`;

  return { subject, text, html };
}

/** Notify the store owner of a new order. Returns false when email isn't configured or the send fails. */
export async function sendOwnerOrderNotification(o: OwnerOrderNotification): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;
  const { subject, text, html } = buildOwnerOrderEmail(o);
  try {
    await transporter.sendMail({
      from: `"Pure Fire Nutritional" <${process.env.EMAIL_USER}>`,
      to: orderNotifyAddress(),
      ...(o.customerEmail ? { replyTo: o.customerEmail } : {}),
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error(
      `[email] sendOwnerOrderNotification failed for ${o.orderNumber}:`,
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}
