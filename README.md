# Pure Fire Nutritional - E-Commerce Website

Complete e-commerce website for Pure Fire Nutritional featuring peptide bioregulators, supplements, and anti-aging products with Stripe payment processing and Supabase backend.

## 🚀 Features

- **48 Products** with professional images and detailed descriptions
- **Stripe Checkout** integration for secure payments
- **Shopping Cart** with localStorage persistence
- **AI Assistant (Peptalk!)** with product recommendations
- **Newsletter Signup** with Supabase backend
- **Product Reviews** system with moderation
- **Abandoned Cart Recovery** tracking
- **Inventory Management** for stock tracking
- **Customer Wishlist** feature
- **Admin Dashboard** for product and order management
- **Responsive Design** optimized for all devices

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- Stripe account (test mode for development)
- Vercel account (for deployment)
- GitHub account

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pure-fire-nutritional.git
cd pure-fire-nutritional
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase project, go to **SQL Editor**
3. Click **"New Query"**
4. Copy the entire contents of `supabase-schema-complete.sql`
5. Paste into the editor and click **"Run"**
6. Verify tables are created in **Table Editor**

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:

```env
# Supabase (from https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email (optional - for order confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="Pure Fire Nutritional <noreply@purefirenutritional.com>"
```

### 5. Run Development Server

```bash
pnpm dev
```

The site will be available at `http://localhost:3000`

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click **"Deploy"**

### 3. Configure Environment Variables in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable from `.env.local.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (optional)
3. Select **Production**, **Preview**, and **Development** for each
4. Click **"Save"**

### 4. Configure Stripe Webhooks

After deployment, set up Stripe webhooks:

1. Get your deployed URL (e.g., `https://your-app.vercel.app`)
2. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
3. Click **"Add endpoint"**
4. Enter: `https://your-app.vercel.app/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
9. Redeploy your app

## 🧪 Testing

### Test Payment Flow

1. Add a product to cart
2. Go to checkout
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any 5-digit ZIP
4. Complete payment
5. Check Supabase `orders` table for the new order

### Test Newsletter Signup

1. Scroll to footer
2. Enter email and click "Subscribe"
3. Check Supabase `mailing_list` table for the entry

## 📁 Project Structure

```
pure-fire-nutritional/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Cart, Wishlist)
│   │   ├── data/          # Product data and AI recommendations
│   │   ├── lib/           # Utility libraries (Supabase, Stripe)
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Backend Express server
│   ├── routes/            # API route handlers
│   ├── lib/               # Server utilities
│   ├── email.ts           # Email notification service
│   └── index.ts           # Server entry point
├── supabase-schema-complete.sql  # Database schema
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🔐 Security Notes

- Never commit `.env.local` or `.env` files to Git
- Use Stripe test keys during development
- Switch to Stripe live keys only when ready for production
- Keep your Supabase anon key safe (it's safe for client-side use with RLS enabled)
- Use Gmail App Passwords for email (not your main password)
- Row Level Security (RLS) is enabled in Supabase for data protection

## 📊 Database Tables

The Supabase database includes:

- `mailing_list` - Newsletter subscribers
- `customers` - Customer accounts
- `orders` - Order history
- `product_reviews` - Customer reviews
- `abandoned_carts` - Cart recovery tracking
- `product_inventory` - Stock management
- `customer_wishlist` - User wishlists
- `wishlist_notifications` - Wishlist alerts
- `inventory_history` - Stock change history

## 🛠️ Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run unit tests
pnpm preview      # Preview production build locally
```

## 🤖 GitHub Copilot

This repository is fully compatible with GitHub Copilot! To check if you have Copilot enabled:

```bash
./check-copilot.sh
```

For detailed information about GitHub Copilot status, features, and setup instructions, see [COPILOT_STATUS.md](./COPILOT_STATUS.md).

## 📞 Support

For issues or questions:
- Check the deployment guides in `DEPLOYMENT.md` and `VERCEL_ENV_SETUP.md`
- Review Stripe documentation at [stripe.com/docs](https://stripe.com/docs)
- Check Supabase docs at [supabase.com/docs](https://supabase.com/docs)

## 📝 License

All rights reserved - Pure Fire Nutritional

---

**Built with:** React, TypeScript, Express, Supabase, Stripe, Tailwind CSS, Vite
