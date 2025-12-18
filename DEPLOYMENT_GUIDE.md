# Pure Fire Nutritional - Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Deploy to Production

**Using Manus Publish Button (Recommended)**
1. Click the **"Publish"** button in the Management UI header (top-right)
2. Your site will be automatically deployed with:
   - Automatic SSL certificate
   - Global CDN distribution
   - Environment variables configured
   - Custom domain support

Your site will be live at: `https://your-project.manus.space`

### 2. Configure Stripe Webhooks

After deployment, you need to set up Stripe webhooks to process payments:

#### Step 1: Get Your Webhook URL
Your webhook endpoint will be:
```
https://your-production-domain.com/api/stripe/webhook
```

#### Step 2: Add Webhook in Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**

#### Step 3: Get Webhook Signing Secret
1. After creating the webhook, click on it
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

#### Step 4: Update Environment Variables
1. In Manus Management UI, go to **Settings** → **Secrets**
2. Update `STRIPE_WEBHOOK_SECRET` with your new webhook signing secret
3. Save changes

### 3. Test Payment Flow

1. Visit your production site
2. Add a product to cart
3. Go to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any 5-digit ZIP code
5. Complete the payment
6. Check your email for order confirmation

## 🔧 Environment Variables

The following environment variables are automatically configured:

### Stripe (Already Set)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key  
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (update after deployment)

### Application
- `VITE_APP_TITLE` - Pure Fire Nutritional
- `VITE_APP_LOGO` - /logo-flame.jpeg
- `JWT_SECRET` - Auto-generated
- `OWNER_NAME` - Your name
- `OWNER_OPEN_ID` - Your user ID

## 📊 Admin Dashboard

Access your admin dashboard at: `https://your-domain.com/admin`

### Product Manager
- **URL**: `/admin/products`
- **Features**:
  - Upload product images
  - Add new products
  - Edit prices and descriptions
  - Manage product variants
  - Update stock status
  - Search and filter products

### Review Moderation
- Approve/reject customer reviews
- View pending reviews
- Manage review content

### Abandoned Cart Recovery
- View abandoned carts
- Track recovery metrics
- Send recovery emails

## 🔐 Security Notes

1. **Stripe Test Mode**: Currently using test API keys
   - Switch to live keys when ready for production
   - Update both `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`

2. **Webhook Security**: The webhook endpoint verifies all requests using the signing secret

3. **Admin Access**: Implement proper authentication for `/admin` routes in production

## 📝 Post-Deployment Checklist

- [ ] Verify site loads correctly at production URL
- [ ] Test product browsing and search
- [ ] Complete a test purchase with Stripe test card
- [ ] Verify order confirmation email received
- [ ] Check webhook events in Stripe Dashboard
- [ ] Test admin dashboard access
- [ ] Test product manager functionality
- [ ] Configure custom domain (optional)
- [ ] Switch to Stripe live mode when ready

## 🆘 Troubleshooting

### Payments Not Processing
- Check Stripe webhook is configured correctly
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook events in Stripe Dashboard → Webhooks → Events

### Order Emails Not Sending
- Verify webhook is receiving `checkout.session.completed` events
- Check server logs for email sending errors
- Ensure email service is configured

### Product Images Not Loading
- Verify images are in `/public/products/` directory
- Check image paths in products data
- Clear browser cache

## 📞 Support

For deployment issues or questions:
- Check Manus documentation at https://help.manus.im
- Review Stripe documentation at https://stripe.com/docs

---

**Congratulations!** Your Pure Fire Nutritional e-commerce site is ready for production! 🎉
