# Production Setup Guide

## 🚀 Quick Start for Vercel Deployment

### Step 1: Set Up Local Development Environment

1. **Copy the example env file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to https://supabase.com/dashboard
   - Select your project → Settings → API
   - Copy `Project URL` and `Anon Key`
   - Add to `.env.local`:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGc...
     ```

3. **Get your Stripe keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy `Secret Key` and `Publishable Key`
   - Add to `.env.local`:
     ```
     STRIPE_SECRET_KEY=sk_test_xxx
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
     ```

4. **Get your Stripe Webhook Secret:**
   - Go to https://dashboard.stripe.com/webhooks
   - Create a webhook for: `https://yourdomain.com/api/stripe/webhook`
   - Copy the signing secret
   - Add to `.env.local`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_test_xxx
     ```

5. **Gmail is already configured:**
   - EMAIL_USER: `purefiren@gmail.com`
   - EMAIL_PASS: Your app password (already in `.env.local.example`)
   - No action needed!

### Step 2: Test Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# In another terminal, test the backend
pnpm run test-backend
```

### Step 3: Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Set Environment Variables in Vercel:**
   - Go to Settings → Environment Variables
   - Add **all** variables from `.env.local.example`:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `EMAIL_HOST=smtp.gmail.com`
     - `EMAIL_PORT=587`
     - `EMAIL_USER=purefiren@gmail.com`
     - `EMAIL_PASS=hbhk moyx pcpy yqio`
   - **IMPORTANT:** Select all three checkboxes (Production, Preview, Development)
   - Click "Save"

4. **Update Stripe Webhook URL:**
   - Go to https://dashboard.stripe.com/webhooks
   - Edit the webhook
   - Change URL to: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
   - Save

5. **Trigger a redeployment:**
   - Make a small change to your code and push
   - Or click "Redeploy" in Vercel dashboard
   - Vercel will now use the environment variables

### Step 4: Test Production Deployment

1. **Test checkout with Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`

2. **Check that:**
   - ✅ Payment processes successfully
   - ✅ Order appears in Supabase `orders` table
   - ✅ Email sent to customer
   - ✅ Order confirmation visible in Stripe Dashboard

3. **Check email:**
   - An order confirmation email should be sent to the customer
   - Check if it went to spam (Gmail sometimes marks transactional emails as spam initially)

### Step 5: Switch to Production Mode (When Ready)

**⚠️ Only do this when you're confident everything works!**

1. **Get Stripe Live Keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Switch toggle to "Live data"
   - Copy live keys (start with `sk_live_` and `pk_live_`)

2. **Update Vercel Environment Variables:**
   - Replace test keys with live keys
   - Update webhook secret to live one
   - Click "Save"

3. **Stripe Webhook for Live:**
   - Create new webhook for production URL
   - Use live signing secret

## 📧 Email Configuration Details

### How Emails Work

1. **Order Confirmations:** Sent automatically when customer completes checkout
   - Triggered by Stripe webhook: `checkout.session.completed`
   - Email template in [server/email.ts](server/email.ts)

2. **Abandoned Cart Recovery:** Sent from Admin Dashboard
   - Admin can send recovery emails to customers who abandoned carts
   - Triggered manually in Admin Dashboard

3. **Newsletter Confirmations:** Sent via mailing list
   - Customers can subscribe on homepage
   - Stored in Supabase `mailing_list` table

### Gmail Troubleshooting

**Emails not being sent?**

1. Check Vercel logs:
   ```bash
   # In Vercel Dashboard → Deployments → [Your Deploy] → Logs
   ```

2. Verify Gmail credentials:
   - Make sure app password is correct (no spaces!)
   - Verify 2FA is enabled on Gmail
   - Regenerate app password if needed

3. Check if emails are in spam:
   - Gmail sometimes flags automated emails as spam
   - Mark as "Not spam" to improve future deliverability

4. Test manually:
   - Make a test purchase with Stripe test card
   - Check your inbox for order confirmation

## 🔒 Security Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Stripe keys are live keys (not test)
- [ ] Gmail app password is in Vercel (not committed to GitHub)
- [ ] Stripe webhook URL is set to your live domain
- [ ] Database backup enabled in Supabase
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (optional but recommended)

## 📞 Need Help?

- **Vercel docs:** https://vercel.com/docs
- **Supabase docs:** https://supabase.com/docs
- **Stripe docs:** https://stripe.com/docs
