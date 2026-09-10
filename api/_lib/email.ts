import nodemailer from "nodemailer";

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  orderDate: string;
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
      subject: `Order Confirmation #${order.orderId} - Pure Fire Nutritional`,
      text: `Thank you for your order, ${order.customerName}!\n\nOrder #${order.orderId}\n${itemsText}\n\nTotal: $${order.total.toFixed(2)}`,
      html: `<p>Hi ${order.customerName},</p><p>We've received order <strong>#${order.orderId}</strong>.</p><p>Total: <strong>$${order.total.toFixed(2)}</strong></p><p>Thank you for choosing Pure Fire Nutritional.</p>`,
    });
    return true;
  } catch (err) {
    console.error("[email] sendOrderConfirmation failed:", err);
    return false;
  }
}
