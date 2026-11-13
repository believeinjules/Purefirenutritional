import nodemailer from "nodemailer";
import { FOUNDER_EMAIL, SUPPORT_EMAIL } from "../../shared/contact-emails.js";

const SITE_ORIGIN = "https://www.purefirenutritional.com";
const LOGO_URL = `${SITE_ORIGIN}/logo.jpeg`;

export type OrderEmailItem = {
  name: string;
  size?: string | null;
  quantity: number;
  price: number;
};

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  total: number;
  /** Dollars off from a promotion code (omitted when none). */
  discount?: number;
  discountCode?: string | null;
  orderDate: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  currency?: string;
  shippingName?: string | null;
  shippingAddress?: OwnerOrderAddress | null;
}

/** "Discount (FIRE10-K7Q2MX): -$12.34", or "" when there is no discount. */
export function discountLine(discount?: number, code?: string | null): string {
  if (typeof discount !== "number" || !(discount > 0)) return "";
  return `Discount${code ? ` (${code})` : ""}: -$${discount.toFixed(2)}`;
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
    // Port 587 (e.g. iCloud smtp.mail.me.com) must upgrade with STARTTLS before auth.
    ...(emailPort === 587 ? { requireTLS: true } : {}),
    auth: { user: emailUser, pass: emailPass },
  });
}

/**
 * From header for every store email: EMAIL_FROM (e.g.
 * `Pure Fire Nutritional <orders@purefirenutritional.com>`) when set, else the
 * SMTP sign-in address with the store display name.
 */
export function fromHeader(env: NodeJS.ProcessEnv = process.env): string {
  return env.EMAIL_FROM?.trim() || `"Pure Fire Nutritional" <${env.EMAIL_USER}>`;
}

/** Only recipient the owner email test may ever send to. */
export const EMAIL_TEST_RECIPIENT = "purefiren@gmail.com";

export type EmailTestResult =
  | { ok: true; messageId: string | null; accepted: string[]; rejected: string[]; response: string | null; from: string }
  | { ok: false; error: string; from: string | null };

/** Sends "Pure Fire email test" to EMAIL_TEST_RECIPIENT only. Never includes secrets in the result. */
export async function sendEmailTest(): Promise<EmailTestResult> {
  const transporter = createTransporter();
  if (!transporter) return { ok: false, error: "email credentials not configured", from: null };
  const from = fromHeader();
  const sentAt = new Date().toISOString();
  try {
    const info = await transporter.sendMail({
      from,
      to: EMAIL_TEST_RECIPIENT,
      replyTo: SUPPORT_EMAIL,
      subject: "Pure Fire email test",
      text: `This is a test of the Pure Fire Nutritional order email settings.\n\nSent ${sentAt}.`,
      html: `<p>This is a test of the Pure Fire Nutritional order email settings.</p><p>Sent ${escapeHtml(sentAt)}.</p>`,
    });
    const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(typeof x === "object" && x && "address" in x ? (x as { address: string }).address : x)) : []);
    console.log(`[email] test sent: messageId=${info.messageId ?? "?"} response=${info.response ?? "?"}`);
    return {
      ok: true,
      messageId: info.messageId ?? null,
      accepted: list(info.accepted),
      rejected: list(info.rejected),
      response: typeof info.response === "string" ? info.response : null,
      from,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] sendEmailTest failed:", message);
    return { ok: false, error: message, from };
  }
}

export async function sendOrderConfirmation(
  order: OrderDetails
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const { subject, text, html } = buildCustomerOrderEmail(order);

  try {
    const info = await transporter.sendMail({
      from: fromHeader(),
      to: order.customerEmail,
      replyTo: SUPPORT_EMAIL,
      subject,
      text,
      html,
    });
    console.log(`[email] order confirmation sent for ${order.orderId}: messageId=${info.messageId ?? "?"}`);
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
      from: fromHeader(),
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
  discount?: number;
  discountCode?: string | null;
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

/** Builds the branded customer confirmation (pure; exported for tests). */
export function buildCustomerOrderEmail(order: OrderDetails) {
  const orderNumber = order.orderId;
  const name = order.customerName || "Customer";
  const itemLine = (i: OrderEmailItem) =>
    `${i.name}${i.size ? ` (size ${i.size})` : ""} × ${i.quantity} — ${money(i.price)}`;
  const addr = addressLines(order.shippingName || name, order.shippingAddress || null);
  const cur = order.currency && order.currency !== "USD" ? ` ${order.currency}` : "";
  const hasBreakdown =
    typeof order.subtotal === "number" ||
    typeof order.shipping === "number" ||
    typeof order.tax === "number";

  const totalsText = [
    hasBreakdown && typeof order.subtotal === "number" ? `Subtotal: ${money(order.subtotal)}` : null,
    hasBreakdown && typeof order.shipping === "number" ? `Shipping: ${money(order.shipping)}` : null,
    hasBreakdown && typeof order.tax === "number" ? `Tax: ${money(order.tax)}` : null,
    discountLine(order.discount, order.discountCode) || null,
    `Total: ${money(order.total)}${cur}`,
  ].filter((l): l is string => !!l);

  const text = [
    `Hi ${name},`,
    "",
    "Thank you for your order from Pure Fire Nutritional.",
    "",
    `Order number: ${orderNumber}`,
    "",
    "Items:",
    ...order.items.map((i) => `- ${itemLine(i)}`),
    "",
    ...totalsText,
    "",
    "Ship to:",
    ...(addr.length ? addr : ["(no shipping address)"]),
    "",
    `Questions about your order? Email ${SUPPORT_EMAIL} and include your order number.`,
    "",
    "Pure Fire Nutritional",
    "Brooklyn, NY",
    SITE_ORIGIN,
  ].join("\n");

  const e = escapeHtml;
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${e(i.name)}</td>` +
        `<td style="padding:8px 0;border-bottom:1px solid #eee">${e(i.size || "")}</td>` +
        `<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>` +
        `<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${money(i.price)}</td></tr>`
    )
    .join("");
  const totalsHtml = totalsText
    .map((l, i) =>
      i === totalsText.length - 1
        ? `<p style="margin:16px 0 0;font-size:16px"><strong>${e(l)}</strong></p>`
        : `<p style="margin:4px 0">${e(l)}</p>`
    )
    .join("");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f7f7;font-family:Georgia,Times,serif;color:#1a1a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#E8793A,#E06050,#CC4472,#B83870);padding:20px 28px;text-align:center">
<img src="${LOGO_URL}" alt="Pure Fire Nutritional" width="48" height="48" style="display:inline-block;border-radius:8px"/>
<p style="margin:8px 0 0;color:#ffffff;font-size:18px;letter-spacing:0.02em">Pure Fire Nutritional</p>
</td></tr>
<tr><td style="padding:28px">
<p style="margin:0 0 12px">Hi ${e(name)},</p>
<p style="margin:0 0 16px">Thank you for your order from Pure Fire Nutritional.</p>
<p style="margin:0 0 20px">Order number: <strong>#${e(orderNumber)}</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
<tr>
<th align="left" style="padding:8px 0;border-bottom:2px solid #eee">Item</th>
<th align="left" style="padding:8px 0;border-bottom:2px solid #eee">Size</th>
<th style="padding:8px 0;border-bottom:2px solid #eee">Qty</th>
<th align="right" style="padding:8px 0;border-bottom:2px solid #eee">Price</th>
</tr>
${rows}
</table>
${totalsHtml}
<p style="margin:20px 0 0"><strong>Ship to:</strong><br>${(addr.length ? addr : ["(no shipping address)"]).map(e).join("<br>")}</p>
<p style="margin:24px 0 0;font-size:14px;color:#444">Questions about your order? Email <a href="mailto:${SUPPORT_EMAIL}" style="color:#E06050">${SUPPORT_EMAIL}</a> and include your order number.</p>
</td></tr>
<tr><td style="padding:16px 28px;background:#fafafa;color:#666;font-size:12px;text-align:center">
Pure Fire Nutritional · Brooklyn, NY<br>
<a href="${SITE_ORIGIN}" style="color:#E06050">${SITE_ORIGIN.replace("https://", "")}</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return {
    subject: `Order Confirmation #${orderNumber} - Pure Fire Nutritional`,
    text,
    html,
  };
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
    ...(discountLine(o.discount, o.discountCode) ? [discountLine(o.discount, o.discountCode)] : []),
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
    `<p>Subtotal: ${money(o.subtotal)}<br>Shipping: ${money(o.shipping)}<br>Tax: ${money(o.tax)}<br>${discountLine(o.discount, o.discountCode) ? `${e(discountLine(o.discount, o.discountCode))}<br>` : ""}<strong>Total: ${money(o.total)}${e(cur)}</strong></p>` +
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
      from: fromHeader(),
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
