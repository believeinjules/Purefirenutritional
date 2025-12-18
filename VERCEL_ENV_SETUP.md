# Vercel Environment Variables Setup

When deploying to Vercel, you need to configure the following environment variables in your Vercel project settings.

## Required Environment Variables

### Supabase Configuration
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy "Project URL" → use as `VITE_SUPABASE_URL`
4. Copy "anon public" key → use as `VITE_SUPABASE_ANON_KEY`

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**How to get these:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy "Secret key" → use as `STRIPE_SECRET_KEY`
3. Copy "Publishable key" → use as `VITE_STRIPE_PUBLISHABLE_KEY`
4. For webhook secret, see "Configure Stripe Webhooks" section below

## Optional Environment Variables

### Email Configuration (for order confirmations)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Pure Fire Nutritional <noreply@purefirenutritional.com>
```

**Note:** If you don't configure email, orders will still work but customers won't receive email confirmations.

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. For each variable:
   - Enter the **Key** (e.g., `VITE_SUPABASE_URL`)
   - Enter the **Value** (e.g., `https://your-project.supabase.co`)
   - Select environments: **Production**, **Preview**, and **Development**
   - Click "Save"

## Configure Stripe Webhooks

After deploying to Vercel, you need to configure Stripe webhooks:

1. Get your deployed URL (e.g., `https://your-app.vercel.app`)
2. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
3. Click "Add endpoint"
4. Enter webhook URL: `https://your-app.vercel.app/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click "Add endpoint"
7. Click on the new webhook to reveal the signing secret
8. Copy the signing secret (starts with `whsec_`)
9. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
10. Redeploy your app for the new secret to take effect

## Testing

After setting up all environment variables:

1. Redeploy your Vercel app (if already deployed)
2. Visit your deployed site
3. Test the newsletter signup in the footer
4. Test adding a product to cart and checking out
5. Use Stripe test card: `4242 4242 4242 4242`
6. Verify order is saved in Supabase
7. Check if order confirmation email is received (if email is configured)

## Troubleshooting

### "Supabase is not configured" error
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy the app after adding variables

### Payments not working
- Verify Stripe keys are correct
- Check webhook is configured with correct URL
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check Stripe dashboard → Webhooks → Events for errors

### Newsletter signup not working
- Verify Supabase connection is working
- Check that `mailing_list` table exists in Supabase
- Run the `supabase-schema-complete.sql` script if tables don't exist

## Database Setup

Before deploying, make sure you've set up your Supabase database:

1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema-complete.sql`
5. Paste into the editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. Verify tables are created by going to "Table Editor"

You should see these tables:
- `mailing_list`
- `customers`
- `orders`
- `product_reviews`
- `abandoned_carts`
- `product_inventory`
- `customer_wishlist`
- And more...

## Security Notes

- Never commit `.env` files to Git
- Use different Stripe keys for test and production
- Keep your Supabase service role key secret (not needed for this app)
- Rotate API keys regularly
- Enable Row Level Security (RLS) in Supabase (already configured in schema)
