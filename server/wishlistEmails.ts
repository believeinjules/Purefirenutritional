import { sendEmail } from './email';

interface Product {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  image: string;
}

// Send sale notification email
export async function sendSaleNotification(
  customerEmail: string,
  product: Product,
  oldPrice: number,
  newPrice: number,
  discountPercent: number
) {
  const subject = `🔥 Price Drop Alert: ${product.name} is now ${discountPercent}% off!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #FD7A74, #FB7185); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .product { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .product-image { width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px; }
        .price-box { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
        .new-price { color: #DC2626; font-size: 32px; font-weight: bold; }
        .discount-badge { background: #DC2626; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        .cta-button { background: #16A34A; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔥 Price Drop Alert!</h1>
          <p>A product on your wishlist is now on sale</p>
        </div>
        <div class="content">
          <div class="product">
            <img src="${product.image}" alt="${product.name}" class="product-image" />
            <h2>${product.name}</h2>
            
            <div class="price-box">
              <div class="old-price">Was: $${oldPrice.toFixed(2)}</div>
              <div class="new-price">Now: $${newPrice.toFixed(2)}</div>
              <span class="discount-badge">Save ${discountPercent}%</span>
            </div>
            
            <p>This product from your wishlist is now on sale! Don't miss out on this limited-time offer.</p>
            
            <a href="https://purefirenutritional.com/product/${product.id}" class="cta-button">
              Shop Now
            </a>
          </div>
          
          <p><strong>Why wait?</strong> Sale prices are limited and stock may run out quickly. Get yours today!</p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you added this product to your wishlist and opted in for sale notifications.</p>
          <p>Pure Fire Nutritional | Premium Peptide Bioregulators</p>
          <p><a href="https://purefirenutritional.com/wishlist">Manage Wishlist</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Price Drop Alert!

${product.name}

Was: $${oldPrice.toFixed(2)}
Now: $${newPrice.toFixed(2)}
Save ${discountPercent}%!

This product from your wishlist is now on sale. Shop now at:
https://purefirenutritional.com/product/${product.id}

---
Pure Fire Nutritional
  `;

  return sendEmail(customerEmail, subject, text, html);
}

// Send restock notification email
export async function sendRestockNotification(
  customerEmail: string,
  product: Product
) {
  const subject = `✨ Back in Stock: ${product.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #FD7A74, #FB7185); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .product { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .product-image { width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px; }
        .price { color: #DC2626; font-size: 28px; font-weight: bold; margin: 15px 0; }
        .stock-badge { background: #16A34A; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
        .cta-button { background: #16A34A; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Back in Stock!</h1>
          <p>Your wishlist item is available again</p>
        </div>
        <div class="content">
          <div class="product">
            <img src="${product.image}" alt="${product.name}" class="product-image" />
            <h2>${product.name}</h2>
            
            <span class="stock-badge">✓ In Stock Now</span>
            
            <div class="price">$${product.priceUSD.toFixed(2)}</div>
            <p style="color: #666;">€${product.priceEUR.toFixed(2)}</p>
            
            <p>Great news! This product from your wishlist is back in stock and ready to ship.</p>
            
            <a href="https://purefirenutritional.com/product/${product.id}" class="cta-button">
              Add to Cart
            </a>
          </div>
          
          <p><strong>Act fast!</strong> Popular items sell out quickly. Secure yours today before it's gone again.</p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you added this product to your wishlist and opted in for restock notifications.</p>
          <p>Pure Fire Nutritional | Premium Peptide Bioregulators</p>
          <p><a href="https://purefirenutritional.com/wishlist">Manage Wishlist</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Back in Stock!

${product.name}

$${product.priceUSD.toFixed(2)} (€${product.priceEUR.toFixed(2)})

✓ In Stock Now

This product from your wishlist is back in stock and ready to ship. Shop now at:
https://purefirenutritional.com/product/${product.id}

---
Pure Fire Nutritional
  `;

  return sendEmail(customerEmail, subject, text, html);
}

// Send low stock warning (for admin/internal use)
export async function sendLowStockAlert(
  adminEmail: string,
  product: Product,
  currentStock: number,
  threshold: number
) {
  const subject = `⚠️ Low Stock Alert: ${product.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .alert-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; }
        .stock-info { font-size: 24px; font-weight: bold; color: #DC2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <h2>${product.name}</h2>
            <p class="stock-info">Current Stock: ${currentStock} units</p>
            <p>Threshold: ${threshold} units</p>
          </div>
          <p>This product has reached the low stock threshold. Consider restocking soon to avoid running out.</p>
          <p><a href="https://purefirenutritional.com/admin">Manage Inventory</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Low Stock Alert

${product.name}

Current Stock: ${currentStock} units
Threshold: ${threshold} units

This product has reached the low stock threshold. Consider restocking soon.

Manage inventory at: https://purefirenutritional.com/admin
  `;

  return sendEmail(adminEmail, subject, text, html);
}
