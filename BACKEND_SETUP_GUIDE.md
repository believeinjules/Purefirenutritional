# 🚀 Pure Fire Nutritional - Backend Setup Guide (Production)

**Time Required:** 30-40 minutes  
**Difficulty:** Beginner-friendly (detailed step-by-step)  
**Setup Mode:** LIVE/PRODUCTION (Real API keys from the start)

---

## 📋 What You'll Set Up

This guide covers ALL backend services needed for your website to function with LIVE production keys:

1. **Supabase Database** - Stores products, orders, customers, reviews, mailing list
2. **Stripe Payments** - Processes real credit card payments
3. **Email Service** (Optional) - Sends order confirmations and notifications
4. **Stripe Webhook** - Connects Stripe to your database

---

## ✅ Required vs Optional

### **REQUIRED** (App won't work without these):
- ✅ Supabase Database (3 variables)
- ✅ Stripe Payments (3 variables) - LIVE keys

### **OPTIONAL** (Nice to have):
- ⭐ Email Service (5 variables) - Highly recommended for customer experience

---

## 🗄️ STEP 1: Set Up Supabase Database (10 minutes)

### What is Supabase?
Your database that stores all website data - products, orders, customer info, reviews, wishlists, and mailing list signups.

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email if prompted

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in: 
   - **Name:** Pure Fire Nutritional
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to your customers (e.g., US East for USA)
3. Click **"Create new project"**
4. Wait 1-2 minutes for setup to complete

### 1.3 Get Your API Keys
1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"** under Project Settings
3. You'll see two keys we need:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy this ↑

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Copy this ↑ (long string starting with eyJ)

   **service_role key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Copy this ↑ (different long string, also starts with eyJ)

4. **SAVE THESE 3 VALUES** - You'll need them later!

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

### 1.4 Create Database Tables
1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Open your file `supabase-schema-complete.sql` in VS Code
4. Copy ALL the contents (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **"Run"** or press **Cmd/Ctrl + Enter**
7. Wait for success message: "Success. No rows returned"

### 1.4b Create Missing Tables (order_items and customer_addresses)
If you don't have these tables, run this SQL:

1. Click **"SQL Editor"** → **"New Query"**
2. Paste this code:

```sql
-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  price_eur DECIMAL(10,2),
  size TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create customer_addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
```

3. Click **"Run"**
4. Wait for success message

### 1.5 Verify Tables Were Created
1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ customers
   - ✅ orders
   - ✅ order_items
   - ✅ product_reviews
   - ✅ mailing_list
   - ✅ abandoned_carts
   - ✅ product_inventory
   - ✅ customer_wishlist
   - ✅ customer_addresses
   - ✅ airesearch (for AI assistant)

✅ **Supabase setup complete!**

---

## 💳 STEP 2: Set Up Stripe (LIVE MODE) (10 minutes)

### What is Stripe?
Processes credit card payments securely. You'll use LIVE mode from the start to accept real payments.

### 2.1 Get LIVE API Keys
**Important:** Use LIVE mode from the start (no test mode switching!)

1. Log in to your Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure **"Test mode"** toggle is OFF (top right)
   - This puts you in LIVE mode
3. Click **"Developers"** in top menu
4. Click **"API keys"** in left sidebar
5. You'll see two keys:

   **Publishable key (starts with pk_live_):**
   ```
   pk_live_51H... (copy your actual key from Stripe)
   ```
   Copy this ↑

   **Secret key (starts with sk_live_):**
   ```
   sk_live_51H... (copy your actual key from Stripe)
   ```
   Click "Reveal live key", then copy ↑

6. **SAVE THESE 2 VALUES:**

   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51H...
   STRIPE_SECRET_KEY=sk_live_51H...
   ```

### 2.2 Stripe Webhook (Configure After Deployment)
**Note:** You'll set this up AFTER deploying to Vercel (Step 4)

✅ **Stripe setup complete!**

---

## 📧 STEP 3: Set Up Email Service (Optional, 10 minutes)

### What is Email Service For?
Sends automatic emails to customers:
- Order confirmations
- Abandoned cart reminders
- Wishlist notifications

**Without email setup:** Orders still work, but customers won't get confirmation emails.

### 3.1 Option A: Use Gmail (Easiest)

#### Enable 2-Factor Authentication
1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **"2-Step Verification"** if not already on
3. Follow the setup wizard

#### Generate App Password
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App:** Mail
   - **Device:** Other (Custom name)
   - Type: "Pure Fire Nutritional"
3. Click **"Generate"**
4. Copy the 16-character password (no spaces)

#### Your Gmail Settings:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  (the 16-char app password)
EMAIL_FROM=Pure Fire Nutritional <your-email@gmail.com>
```

### 3.2 Option B: Use SendGrid (More Reliable)

1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Sign up for free account (100 emails/day free)
3. Click **"Settings"** → **"API Keys"**
4. Click **"Create API Key"**
5. Name it "Pure Fire Nutritional"
6. Select **"Full Access"**
7. Copy the API key

#### Your SendGrid Settings:
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx  (the API key you copied)
EMAIL_FROM=Pure Fire Nutritional <noreply@yourdomain.com>
```

### 3.3 Option C: Skip Email (For Now)
You can skip email setup and add it later. Orders will still work!

---

## 🔧 STEP 4: Add Variables to Vercel (10 minutes)

### What is Vercel?
Your hosting platform that runs the live website. It needs all these settings to work.

### 4.1 Go to Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Log in with GitHub
3. Find your **"purefirenutritional"** project
4. Click on it

### 4.2 Open Environment Variables
1. Click **"Settings"** tab at top
2. Click **"Environment Variables"** in left sidebar
3. You'll see a page to add variables

### 4.3 Add Each Variable

For EACH variable below, do this:
1. Click **"Add New"** button
2. Enter the **Key** (exact name)
3. Enter the **Value** (your copied value)
4. **CHECK ALL 3 BOXES:**
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click **"Save"**
6. Repeat for next variable

#### REQUIRED Variables (Must Add These):

| Key | Value | Where to Get It |
|-----|-------|-----------------|
| `VITE_SUPABASE_URL` | https://xxxxx.supabase.co | Step 1.3 |
| `VITE_SUPABASE_ANON_KEY` | eyJhbGci... | Step 1.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... | Step 1.3 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | pk_live_... | Step 2.2 |
| `STRIPE_SECRET_KEY` | sk_live_... | Step 2.2 |

#### OPTIONAL Variables (Email - if you did Step 3):

| Key | Value | Example |
|-----|-------|---------|
| `EMAIL_HOST` | smtp server | smtp.gmail.com |
| `EMAIL_PORT` | port number | 587 |
| `EMAIL_USER` | your email | you@gmail.com |
| `EMAIL_PASS` | app password | abcdefghijklmnop |
| `EMAIL_FROM` | sender name+email | Pure Fire <you@gmail.com> |

### 4.4 Redeploy Your App
After adding variables, Vercel automatically redeploys. Watch for:
1. Progress bar at top of page
2. Wait for **"✅ Production"** with green checkmark
3. Takes 2-3 minutes

✅ **Vercel variables set!**

---

## 🔗 STEP 5: Configure Stripe Webhook (5 minutes)

### What is a Webhook?
Tells Stripe to notify your website when payments succeed. This creates orders in your database.

**IMPORTANT:** Do this AFTER your site is deployed!

### 5.1 Get Your Website URL
1. In Vercel dashboard, look for your production URL:
   ```
   https://purefirenutritional.vercel.app
   ```
   OR your custom domain:
   ```
   https://purefirenutritional.com
   ```
2. Copy this URL

### 5.2 Create Webhook in Stripe
1. Go to Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure **"Test mode"** toggle is OFF (top right) - You're in LIVE mode!
3. Click **"Developers"** → **"Webhooks"**
4. Click **"+ Add endpoint"** button

### 5.3 Configure Webhook Endpoint
1. **Endpoint URL:** Paste your website URL + webhook path:
   ```
   https://purefirenutritional.vercel.app/api/stripe/webhook
   ```
   OR
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

2. **Description:** (Optional) "Production webhook for order creation"

3. Click **"Select events"**

4. Find and CHECK this event:
   - ☑ **checkout.session.completed**

5. (Optional but recommended) Also check:
   - ☑ **payment_intent.succeeded**
   - ☑ **payment_intent.payment_failed**

6. Click **"Add events"**

7. Click **"Add endpoint"**

### 5.4 Get Webhook Signing Secret
1. You'll see your new endpoint in the list
2. Click on it to open details
3. Find **"Signing secret"** (starts with `whsec_live_`)
4. Click **"Reveal"**
5. Copy the secret:
   ```
   whsec_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 5.5 Add Webhook Secret to Vercel
1. Go back to Vercel: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → **"Settings"** → **"Environment Variables"**
3. Click **"Add New"**
4. Enter:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_live_...` (paste the secret)
   - **CHECK ALL 3 BOXES:** Production, Preview, Development
5. Click **"Save"**

### 5.6 Wait for Redeploy
Vercel will auto-redeploy (1-2 minutes). Watch for green checkmark.

✅ **Webhook configured!**

---

## 🧪 STEP 6: Test Everything (10 minutes)

### 6.1 Open Your Live Website
Visit your deployed URL:
```
https://purefirenutritional.vercel.app
```

### 6.2 Test Basic Functionality
1. ✅ **Homepage loads** without errors
2. ✅ **Products page** shows all products
3. ✅ **Click a product** to view details
4. ✅ **Add to cart** (select 20 or 60 capsules)
5. ✅ **View cart** - items show correct prices

### 6.3 Test Checkout with FREE Product
To avoid charges while testing:

1. Find **"Test Product - FREE"** in products
2. Add it to cart
3. Click **"Checkout"**
4. Fill in form:
   - **Email:** your-test@example.com
   - **Name:** Test User
   - **Card Number:** ANY valid card (won't be charged - price is $0)
   - **Address:** 123 Test St, Test City, ST 12345
5. Click **"Pay"** or **"Complete Purchase"**
6. You should see: **"✅ Payment successful!"**
7. **No charge** will be made since it's a $0 order

### 6.4 Test Checkout with Real Product
Once you're confident, test with a real product:

1. Add any paid product to cart
2. Click **"Checkout"**
3. **You WILL be charged real money!**
4. Use your actual payment method
5. Complete the order

### 6.5 Verify Order in Database
1. Go to Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click your project
3. Click **"Table Editor"** → **"orders"**
4. You should see your order:
   - Email: (your email)
   - Status: completed
   - Total: (product price or $0)

### 6.6 Check Email (If Configured)
1. Check the email address you used at checkout
2. Look for order confirmation email
3. Check spam folder if not in inbox

### 6.7 Test Mailing List Signup
1. Scroll to footer of homepage
2. Enter test email in newsletter signup
3. Click **"Subscribe"**
4. Check Supabase **"mailing_list"** table for entry

---

## ✅ Verification Checklist

Mark off each item as you test:

**Database:**
- [ ] Supabase project created
- [ ] All tables created (10 tables visible in Table Editor)
- [ ] API keys saved

**Payments (LIVE MODE):**
- [ ] Stripe account created
- [ ] LIVE API keys saved (pk_live_, sk_live_)
- [ ] Webhook endpoint created (LIVE mode)
- [ ] Webhook secret saved to Vercel

**Email (Optional):**
- [ ] Email service configured (Gmail/SendGrid)
- [ ] Credentials saved to Vercel
- [ ] Test order confirmation email received

**Vercel Deployment:**
- [ ] All environment variables added
- [ ] All variables have 3 checkboxes checked
- [ ] Using LIVE Stripe keys (not test keys)
- [ ] Latest deployment shows "Ready" (green)

**Functionality Tests:**
- [ ] Website loads without errors
- [ ] Products display correctly
- [ ] FREE test product checkout works without charge
- [ ] Paid product checkout accepts real payment
- [ ] Test order appears in Supabase
- [ ] Email confirmation received (if configured)

---

## 🔒 Security Best Practices

1. **Never Commit Secrets to Git**
   - ❌ Don't put API keys in code
   - ✅ Always use environment variables

2. **Use LIVE Keys Only**
   - You're using LIVE keys from the start
   - No switching between test and production modes
   - Simpler, fewer mistakes

3. **Rotate Keys Regularly**
   - Change Stripe keys every 6 months
   - Change database passwords annually

4. **Enable Row Level Security (RLS)**
   - Already enabled in your schema!
   - Prevents unauthorized data access

5. **Monitor Your Stripe Dashboard**
   - Check for unusual transactions
   - Set up fraud detection rules
   - Review all charges before shipping

6. **Test with FREE Product First**
   - Use the $0 test product to verify checkout flow
   - No money at risk
   - Once confident, test with real products

---

## 🆘 Troubleshooting

### Problem: "Supabase is not configured" error

**Cause:** Environment variables not set correctly

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist
3. Check for typos (names are case-sensitive!)
4. Make sure all 3 checkboxes are checked
5. Redeploy and wait 2 minutes

---

### Problem: Checkout doesn't work

**Cause:** Stripe keys incorrect or webhook not configured

**Fix:**
1. Verify `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
2. Make sure you're using LIVE keys (pk_live_, sk_live_), not test keys
3. Check Stripe Dashboard → Webhooks:
   - Is endpoint URL correct?
   - Is `checkout.session.completed` event selected?
4. Check browser console (F12) for error messages
5. Test with FREE product first (no payment risk)

---

### Problem: Order doesn't appear in database

**Cause:** Webhook not working or service role key missing

**Fix:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is in Vercel
2. Go to Stripe Dashboard → Webhooks → Your endpoint
3. Click **"Events"** tab
4. Look for failed events (red X)
5. Click failed event to see error details
6. Common fix: Add `STRIPE_WEBHOOK_SECRET` to Vercel

---

### Problem: Charged $0.00 order in Supabase but expected a free order

This is normal! Stripe processes $0 orders as completed without requesting payment. Your order is saved correctly.

---

### Problem: No email confirmation received

**Cause:** Email credentials incorrect or not configured

**Fix:**
1. Check spam/junk folder first!
2. Verify all 5 email variables in Vercel:
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
3. For Gmail: Make sure you're using App Password, not regular password
4. Test email separately with a tool like [MailTester](https://www.mail-tester.com)

---

### Problem: Accidentally charged real money on test

If you made a real charge and want to refund:

1. Go to Stripe Dashboard
2. Click **"Payments"** → Find the transaction
3. Click on it → **"Refund"**
4. Refund will process (1-3 business days)

---

## 📞 Need Help?

If you're stuck:
1. **Re-read the relevant step** - Often fixes 90% of issues
2. **Check the Troubleshooting section**
3. **Look for error messages** in:
   - Browser console (F12 → Console tab)
   - Vercel deployment logs (Vercel → Deployments → Click latest → Logs)
   - Stripe webhook events (Stripe → Webhooks → Events)
4. **Message me** with:
   - Screenshot of error
   - Which step you're on
   - What you've already tried

---

## 🎉 You're Live!

Your backend is fully configured with LIVE API keys! Your website can now:

✅ Store customer data in Supabase  
✅ Process real payments through Stripe  
✅ Create orders automatically  
✅ Send email confirmations  
✅ Track inventory and wishlists  
✅ Collect mailing list signups  

**Your e-commerce platform is ready for real business! 🚀**

---

## 📚 Quick Reference

### Environment Variables Summary

**Supabase (3 variables):**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Stripe LIVE (3 variables):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

**Email (5 variables - optional):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=apppassword
EMAIL_FROM=Pure Fire <your@gmail.com>
```

**Total: 11 variables (6 required + 5 optional)**

---

### Important URLs

- **Supabase Dashboard:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Stripe Dashboard (LIVE):** [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Vercel Dashboard:** [https://vercel.com/dashboard](https://vercel.com/dashboard)
- **Your Website:** `https://purefirenutritional.vercel.app` (or custom domain)

---

**Last Updated:** December 27, 2025  
**Version:** 2.0 - LIVE Mode Production Setup

## 🗄️ STEP 1: Set Up Supabase Database (10 minutes)

### What is Supabase?
Your database that stores all website data - products, orders, customer info, reviews, wishlists, and mailing list signups.

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email if prompted

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in:
   - **Name:** Pure Fire Nutritional
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to your customers (e.g., US East for USA)
3. Click **"Create new project"**
4. Wait 1-2 minutes for setup to complete

### 1.3 Get Your API Keys
1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"** under Project Settings
3. You'll see two keys we need:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy this ↑

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Copy this ↑ (long string starting with eyJ)

   **service_role key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Copy this ↑ (different long string, also starts with eyJ)

4. **SAVE THESE 3 VALUES** - You'll need them later!

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

### 1.4 Create Database Tables
1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Open your file `supabase-schema-complete.sql` in VS Code
4. Copy ALL the contents (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **"Run"** or press **Cmd/Ctrl + Enter**
7. Wait for success message: "Success. No rows returned"

### 1.5 Verify Tables Were Created
1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ customers
   - ✅ orders
   - ✅ order_items
   - ✅ product_reviews
   - ✅ mailing_list
   - ✅ abandoned_carts
   - ✅ product_inventory
   - ✅ customer_wishlist
   - ✅ customer_addresses

✅ **Supabase setup complete!**

---

## 💳 STEP 2: Set Up Stripe Payments (10 minutes)

### What is Stripe?
Processes credit card payments securely. Handles checkout, subscriptions, and refunds.

### 2.1 Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Fill in your business information
4. Verify your email

### 2.2 Get Test API Keys
**IMPORTANT:** Start with TEST mode (fake payments) before going live!

1. In Stripe Dashboard, make sure **"Test mode"** toggle is ON (top right)
2. Click **"Developers"** in top menu
3. Click **"API keys"** in left sidebar
4. You'll see two keys:

   **Publishable key (starts with pk_test_):**
   ```
   pk_test_51Hxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Copy this ↑

   **Secret key (starts with sk_test_):**
   ```
   sk_test_51Hxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Click "Reveal test key", then copy ↑

5. **SAVE THESE 2 VALUES:**

   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51H...
   STRIPE_SECRET_KEY=sk_test_51H...
   ```

### 2.3 Stripe Webhook (Configure After Deployment)
**Note:** You'll set this up AFTER deploying to Vercel (Step 4)

✅ **Stripe setup complete!** (Webhook comes later)

---

## 📧 STEP 3: Set Up Email Service (Optional, 10 minutes)

### What is Email Service For?
Sends automatic emails to customers:
- Order confirmations
- Abandoned cart reminders
- Wishlist notifications

**Without email setup:** Orders still work, but customers won't get confirmation emails.

### 3.1 Option A: Use Gmail (Easiest)

#### Enable 2-Factor Authentication
1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **"2-Step Verification"** if not already on
3. Follow the setup wizard

#### Generate App Password
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App:** Mail
   - **Device:** Other (Custom name)
   - Type: "Pure Fire Nutritional"
3. Click **"Generate"**
4. Copy the 16-character password (no spaces)

#### Your Gmail Settings:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  (the 16-char app password)
EMAIL_FROM=Pure Fire Nutritional <your-email@gmail.com>
```

### 3.2 Option B: Use SendGrid (More Reliable)

1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Sign up for free account (100 emails/day free)
3. Click **"Settings"** → **"API Keys"**
4. Click **"Create API Key"**
5. Name it "Pure Fire Nutritional"
6. Select **"Full Access"**
7. Copy the API key

#### Your SendGrid Settings:
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx  (the API key you copied)
EMAIL_FROM=Pure Fire Nutritional <noreply@yourdomain.com>
```

### 3.3 Option C: Skip Email (For Now)
You can skip email setup and add it later. Orders will still work!

---

## 🔧 STEP 4: Add Variables to Vercel (10 minutes)

### What is Vercel?
Your hosting platform that runs the live website. It needs all these settings to work.

### 4.1 Go to Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Log in with GitHub
3. Find your **"purefirenutritional"** project
4. Click on it

### 4.2 Open Environment Variables
1. Click **"Settings"** tab at top
2. Click **"Environment Variables"** in left sidebar
3. You'll see a page to add variables

### 4.3 Add Each Variable

For EACH variable below, do this:
1. Click **"Add New"** button
2. Enter the **Key** (exact name)
3. Enter the **Value** (your copied value)
4. **CHECK ALL 3 BOXES:**
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click **"Save"**
6. Repeat for next variable

#### REQUIRED Variables (Must Add These):

| Key | Value | Where to Get It |
|-----|-------|-----------------|
| `VITE_SUPABASE_URL` | https://xxxxx.supabase.co | Step 1.3 |
| `VITE_SUPABASE_ANON_KEY` | eyJhbGci... | Step 1.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... | Step 1.3 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | pk_test_... | Step 2.2 |
| `STRIPE_SECRET_KEY` | sk_test_... | Step 2.2 |

#### OPTIONAL Variables (Email - if you did Step 3):

| Key | Value | Example |
|-----|-------|---------|
| `EMAIL_HOST` | smtp server | smtp.gmail.com |
| `EMAIL_PORT` | port number | 587 |
| `EMAIL_USER` | your email | you@gmail.com |
| `EMAIL_PASS` | app password | abcdefghijklmnop |
| `EMAIL_FROM` | sender name+email | Pure Fire <you@gmail.com> |

### 4.4 Redeploy Your App
After adding variables, Vercel automatically redeploys. Watch for:
1. Progress bar at top of page
2. Wait for **"✅ Production"** with green checkmark
3. Takes 2-3 minutes

✅ **Vercel variables set!**

---

## 🔗 STEP 5: Configure Stripe Webhook (5 minutes)

### What is a Webhook?
Tells Stripe to notify your website when payments succeed. This creates orders in your database.

**IMPORTANT:** Do this AFTER your site is deployed!

### 5.1 Get Your Website URL
1. In Vercel dashboard, look for your production URL:
   ```
   https://purefirenutritional.vercel.app
   ```
   OR your custom domain:
   ```
   https://purefirenutritional.com
   ```
2. Copy this URL

### 5.2 Create Webhook in Stripe
1. Go to Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure **"Test mode"** toggle is ON (top right)
3. Click **"Developers"** → **"Webhooks"**
4. Click **"+ Add endpoint"** button

### 5.3 Configure Webhook Endpoint
1. **Endpoint URL:** Paste your website URL + webhook path:
   ```
   https://purefirenutritional.vercel.app/api/stripe/webhook
   ```
   OR
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

2. **Description:** (Optional) "Production webhook for order creation"

3. Click **"Select events"**

4. Find and CHECK this event:
   - ☑ **checkout.session.completed**

5. (Optional but recommended) Also check:
   - ☑ **payment_intent.succeeded**
   - ☑ **payment_intent.payment_failed**

6. Click **"Add events"**

7. Click **"Add endpoint"**

### 5.4 Get Webhook Signing Secret
1. You'll see your new endpoint in the list
2. Click on it to open details
3. Find **"Signing secret"** (starts with `whsec_test_`)
4. Click **"Reveal"**
5. Copy the secret:
   ```
   whsec_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 5.5 Add Webhook Secret to Vercel
1. Go back to Vercel: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → **"Settings"** → **"Environment Variables"**
3. Click **"Add New"**
4. Enter:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_test_...` (paste the secret)
   - **CHECK ALL 3 BOXES:** Production, Preview, Development
5. Click **"Save"**

### 5.6 Wait for Redeploy
Vercel will auto-redeploy (1-2 minutes). Watch for green checkmark.

✅ **Webhook configured!**

---

## 🧪 STEP 6: Test Everything (10 minutes)

### 6.1 Open Your Live Website
Visit your deployed URL:
```
https://purefirenutritional.vercel.app
```

### 6.2 Test Basic Functionality
1. ✅ **Homepage loads** without errors
2. ✅ **Products page** shows all products
3. ✅ **Click a product** to view details
4. ✅ **Add to cart** (select 20 or 60 capsules)
5. ✅ **View cart** - items show correct prices

### 6.3 Test Checkout with Stripe Test Card
1. Click **"Checkout"** in cart
2. Fill in form:
   - **Email:** test@example.com
   - **Name:** Test User
   - **Card Number:** `4242 4242 4242 4242` ← This is Stripe's test card
   - **Expiration:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **Address:** 123 Test St, Test City, ST 12345
3. Click **"Pay"** or **"Complete Purchase"**
4. You should see: **"✅ Payment successful!"**

### 6.4 Verify Order in Database
1. Go to Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click your project
3. Click **"Table Editor"** → **"orders"**
4. You should see your test order:
   - Email: test@example.com
   - Status: completed
   - Total: (product price)

### 6.5 Check Email (If Configured)
1. Check the email address you used at checkout
2. Look for order confirmation email
3. Check spam folder if not in inbox

### 6.6 Test Mailing List Signup
1. Scroll to footer of homepage
2. Enter test email in newsletter signup
3. Click **"Subscribe"**
4. Check Supabase **"mailing_list"** table for entry

---

## ✅ Verification Checklist

Mark off each item as you test:

**Database:**
- [ ] Supabase project created
- [ ] All tables created (9 tables visible in Table Editor)
- [ ] API keys saved

**Payments:**
- [ ] Stripe test account created
- [ ] Test API keys saved
- [ ] Webhook endpoint created
- [ ] Webhook secret saved to Vercel

**Email (Optional):**
- [ ] Email service configured (Gmail/SendGrid)
- [ ] Credentials saved to Vercel
- [ ] Test order confirmation email received

**Vercel Deployment:**
- [ ] All environment variables added
- [ ] All variables have 3 checkboxes checked
- [ ] Latest deployment shows "Ready" (green)

**Functionality Tests:**
- [ ] Website loads without errors
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Checkout completes successfully
- [ ] Test order appears in Supabase
- [ ] Email confirmation received (if configured)

---

## 🚀 Going Live (Production Mode)

When you're ready to accept REAL payments:

### Switch Stripe to Live Mode

1. **Get Live Keys:**
   - Go to Stripe Dashboard
   - Toggle **"Test mode"** to OFF (top right)
   - Click **"Developers"** → **"API keys"**
   - Copy your LIVE keys:
     - `pk_live_...` (publishable key)
     - `sk_live_...` (secret key)

2. **Create Live Webhook:**
   - Click **"Developers"** → **"Webhooks"**
   - Make sure you're in LIVE mode (not test)
   - Click **"+ Add endpoint"**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy the signing secret: `whsec_live_...`

3. **Update Vercel Variables:**
   - Go to Vercel → Settings → Environment Variables
   - Find `VITE_STRIPE_PUBLISHABLE_KEY` → Edit → Replace with `pk_live_...`
   - Find `STRIPE_SECRET_KEY` → Edit → Replace with `sk_live_...`
   - Find `STRIPE_WEBHOOK_SECRET` → Edit → Replace with `whsec_live_...`

4. **Redeploy and Test:**
   - Wait for deployment to finish
   - Test with a REAL card (you'll be charged!)
   - Check Stripe Dashboard for real transaction

---

## 🔒 Security Best Practices

1. **Never Commit Secrets to Git**
   - ❌ Don't put API keys in code
   - ✅ Always use environment variables

2. **Rotate Keys Regularly**
   - Change Stripe keys every 6 months
   - Change database passwords annually

3. **Use Different Keys for Test/Production**
   - Never use live Stripe keys in test mode
   - Keep separate Supabase projects for dev/prod (optional)

4. **Enable Row Level Security (RLS)**
   - Already enabled in your schema!
   - Prevents unauthorized data access

5. **Monitor Your Stripe Dashboard**
   - Check for unusual transactions
   - Set up fraud detection rules

---

## 🆘 Troubleshooting

### Problem: "Supabase is not configured" error

**Cause:** Environment variables not set correctly

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist
3. Check for typos (names are case-sensitive!)
4. Make sure all 3 checkboxes are checked
5. Redeploy and wait 2 minutes

---

### Problem: Checkout doesn't work

**Cause:** Stripe keys incorrect or webhook not configured

**Fix:**
1. Verify `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel
2. Check Stripe Dashboard → Webhooks:
   - Is endpoint URL correct?
   - Is `checkout.session.completed` event selected?
3. Check browser console (F12) for error messages
4. Test with Stripe test card: `4242 4242 4242 4242`

---

### Problem: Order doesn't appear in database

**Cause:** Webhook not working or service role key missing

**Fix:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is in Vercel
2. Go to Stripe Dashboard → Webhooks → Your endpoint
3. Click **"Events"** tab
4. Look for failed events (red X)
5. Click failed event to see error details
6. Common fix: Add `STRIPE_WEBHOOK_SECRET` to Vercel

---

### Problem: No email confirmation received

**Cause:** Email credentials incorrect or not configured

**Fix:**
1. Check spam/junk folder first!
2. Verify all 5 email variables in Vercel:
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
3. For Gmail: Make sure you're using App Password, not regular password
4. Test email separately with a tool like [MailTester](https://www.mail-tester.com)

---

### Problem: Products show wrong prices

**Cause:** Recent pricing update

**Fix:**
1. Refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Wait for latest deployment to finish

---

## 📞 Need Help?

If you're stuck:
1. **Re-read the relevant step** - Often fixes 90% of issues
2. **Check the Troubleshooting section**
3. **Look for error messages** in:
   - Browser console (F12 → Console tab)
   - Vercel deployment logs (Vercel → Deployments → Click latest → Logs)
   - Stripe webhook events (Stripe → Webhooks → Events)
4. **Message me** with:
   - Screenshot of error
   - Which step you're on
   - What you've already tried

---

## 🎉 Congratulations!

Your backend is fully configured! Your website can now:

✅ Store customer data in Supabase  
✅ Process payments through Stripe  
✅ Create orders automatically  
✅ Send email confirmations  
✅ Track inventory and wishlists  
✅ Collect mailing list signups  

**Your e-commerce platform is ready for business! 🚀**

---

## 📚 Quick Reference

### Environment Variables Summary

**Supabase (3 variables):**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Stripe (3 variables):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Email (5 variables - optional):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=apppassword
EMAIL_FROM=Pure Fire <your@gmail.com>
```

**Total: 11 variables (6 required + 5 optional)**

---

### Important URLs

- **Supabase Dashboard:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Stripe Dashboard:** [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Vercel Dashboard:** [https://vercel.com/dashboard](https://vercel.com/dashboard)
- **Your Website:** `https://purefirenutritional.vercel.app` (or custom domain)

---

**Last Updated:** December 25, 2025  
**Version:** 1.0
