// Email notification service for order confirmations and updates
// Uses nodemailer for email delivery

import nodemailer from 'nodemailer';
import { logError } from './logger.js';

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  orderDate: string;
}

// Generic email sending function
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@purefirenutritional.com',
      to,
      subject,
      text,
      html: html || text,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logError({
      error: error instanceof Error ? error.message : String(error),
      context: 'Generic email send',
    });
    return false;
  }
}

// Email transporter configuration
// In production, use environment variables for credentials
const createTransporter = () => {
  // Check if email credentials are configured
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');

  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// Order confirmation email template
function getOrderConfirmationHTML(order: OrderDetails): string {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f97316 0%, #f43f5e 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔥 Pure Fire Nutritional</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Order Confirmation</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">Thank you for your order!</h2>
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Hi ${order.customerName},
                  </p>
                  <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    We've received your order and are preparing it for shipment. You'll receive another email with tracking information once your order ships.
                  </p>
                  
                  <!-- Order Details -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Order Number</p>
                    <p style="margin: 0; color: #111827; font-size: 18px; font-weight: bold;">#${order.orderId}</p>
                    <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">Order Date: ${order.orderDate}</p>
                  </div>
                  
                  <!-- Order Items -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px; font-weight: 600;">Product</th>
                        <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 14px; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHTML}
                      <tr>
                        <td colspan="2" style="padding: 20px 12px 12px 12px; text-align: right; font-weight: bold; color: #111827; font-size: 16px;">Total:</td>
                        <td style="padding: 20px 12px 12px 12px; text-align: right; font-weight: bold; color: #f97316; font-size: 18px;">$${order.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <!-- Call to Action -->
                  <div style="text-align: center; margin-top: 40px;">
                    <a href="https://purefire.com/orders/${order.orderId}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Order Details</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    Questions? Contact us at <a href="mailto:support@purefire.com" style="color: #f97316; text-decoration: none;">support@purefire.com</a>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Pure Fire Nutritional. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Plain text version for email clients that don't support HTML
function getOrderConfirmationText(order: OrderDetails): string {
  const itemsText = order.items
    .map((item) => `${item.name} x${item.quantity} - $${item.price.toFixed(2)}`)
    .join('\n');

  return `
Pure Fire Nutritional - Order Confirmation

Thank you for your order, ${order.customerName}!

Order Number: #${order.orderId}
Order Date: ${order.orderDate}

Order Items:
${itemsText}

Total: $${order.total.toFixed(2)}

We've received your order and are preparing it for shipment. You'll receive another email with tracking information once your order ships.

Questions? Contact us at support@purefire.com

© ${new Date().getFullYear()} Pure Fire Nutritional. All rights reserved.
  `.trim();
}

export async function sendOrderConfirmation(order: OrderDetails): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping email notification.');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Pure Fire Nutritional" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmation #${order.orderId} - Pure Fire Nutritional`,
      text: getOrderConfirmationText(order),
      html: getOrderConfirmationHTML(order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError({
      error: errorMessage,
      context: 'Email notification',
      endpoint: 'sendOrderConfirmation',
    });
    return false;
  }
}

// Shipping notification email
export async function sendShippingNotification(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
  carrier: string;
}): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return false;
  }

  try {
    const mailOptions = {
      from: `"Pure Fire Nutritional" <${process.env.EMAIL_USER}>`,
      to: data.customerEmail,
      subject: `Your Order #${data.orderId} Has Shipped!`,
      html: `
        <h2>Your order is on its way!</h2>
        <p>Hi ${data.customerName},</p>
        <p>Great news! Your order #${data.orderId} has been shipped.</p>
        <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        <p><strong>Carrier:</strong> ${data.carrier}</p>
        <p>Thank you for choosing Pure Fire Nutritional!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logError({
      error: error instanceof Error ? error.message : String(error),
      context: 'Shipping notification',
    });
    return false;
  }
}
