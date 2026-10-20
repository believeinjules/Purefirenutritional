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
