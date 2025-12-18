# Quick Start Guide - GitHub to Vercel Deployment

## Step 1: Set Up Supabase (5 minutes)

1. Go to https://supabase.com and create account
2. Click "New Project"
3. Name it "Pure Fire Nutritional"
4. Set a strong database password
5. Wait for project to be ready (~2 minutes)

### Run Database Schema

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `supabase-schema-complete.sql` from this project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### Get Your Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values (you'll need them soon):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 2: Push to GitHub (2 minutes)

### Create GitHub Repository

1. Go to https://github.com/new
2. Name it: `pure-fire-nutritional`
3. Keep it **Private** (recommended)
4. **DO NOT** initialize with README (we already have one)
5. Click **"Create repository"**

### Push Your Code

Run these commands in your terminal:

```bash
# Navigate to project directory
cd pure-fire-nutritional

# Add GitHub as remote
git remote add github https://github.com/YOUR_USERNAME/pure-fire-nutritional.git

# Push code to GitHub
git push github main
```

## Step 3: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com and sign in with GitHub
2. Click **"New Project"**
3. Find and import `pure-fire-nutritional` repository
4. Vercel will detect the configuration automatically
5. **DO NOT** click Deploy yet!

### Add Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard → API Keys |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Stripe Dashboard → API Keys |

**Important:** For each variable, check all three boxes:
- ✅ Production
- ✅ Preview  
- ✅ Development

Now click **"Deploy"**!

## Step 4: Configure Stripe Webhooks (2 minutes)

After deployment completes:

1. Copy your Vercel URL (looks like: `https://pure-fire-nutritional.vercel.app`)
2. Go to https://dashboard.stripe.com/webhooks
3. Click **"Add endpoint"**
4. Paste: `https://YOUR_VERCEL_URL.vercel.app/api/stripe/webhook`
5. Click **"Select events"**
6. Add these three events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
7. Click **"Add endpoint"**
8. Click on the new webhook
9. Click **"Reveal"** next to "Signing secret"
10. Copy the secret (starts with `whsec_...`)

### Add Webhook Secret to Vercel

1. Go back to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: (paste the `whsec_...` secret)
   - Check all three environments
3. Click **"Save"**
4. Go to **Deployments** tab
5. Click **"Redeploy"** on the latest deployment

## Step 5: Test Your Site (2 minutes)

Visit your Vercel URL and test:

### Test Newsletter Signup
1. Scroll to footer
2. Enter your email
3. Click "Subscribe"
4. Should see success message
5. Check Supabase → Table Editor → `mailing_list` table

### Test Payment
1. Add any product to cart
2. Go to checkout
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC, any ZIP
5. Complete payment
6. Check Supabase → `orders` table for new order

## ✅ Done!

Your site is now live! 

### Optional: Add Custom Domain

1. In Vercel, go to **Settings** → **Domains**
2. Add `purefirenutritional.com`
3. Follow Vercel's DNS instructions
4. Update Stripe webhook URL to use custom domain

### Optional: Switch to Live Stripe

When ready for real payments:

1. Get live Stripe keys from https://dashboard.stripe.com/apikeys
2. Update Vercel environment variables:
   - Replace `STRIPE_SECRET_KEY` with live key (`sk_live_...`)
   - Replace `VITE_STRIPE_PUBLISHABLE_KEY` with live key (`pk_live_...`)
3. Create new webhook for production URL with live keys
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel

## 🆘 Troubleshooting

**Newsletter signup not working?**
- Check Supabase credentials in Vercel environment variables
- Verify `mailing_list` table exists in Supabase
- Check browser console for errors

**Payments not working?**
- Verify Stripe keys are correct
- Check webhook is configured with correct URL
- Check Stripe Dashboard → Webhooks → Events for errors

**Site not loading?**
- Check Vercel deployment logs
- Verify all environment variables are set
- Make sure you clicked all three environment checkboxes

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
