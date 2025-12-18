# Pure Fire Nutritional - Deployment Guide

Complete guide for deploying to GitHub and Vercel with Supabase backend.

---

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- Git installed locally
- Node.js 18+ and pnpm installed

---

## Part 1: Supabase Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: pure-fire-nutritional
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 2. Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned" - this is correct!

### 3. Get Supabase Credentials

1. Go to **Project Settings** → **API** (left sidebar)
2. Copy these values (you'll need them later):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long JWT token)

---

## Part 2: GitHub Repository Setup

### 1. Download Project Files

1. In Manus, go to the **Code** panel in Management UI
2. Click "Download All Files"
3. Extract the ZIP file to a folder on your computer

### 2. Initialize Git Repository

Open terminal in the project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Pure Fire Nutritional e-commerce site"
```

### 3. Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Fill in:
   - **Repository name**: pure-fire-nutritional
   - **Description**: Premium peptide bioregulator e-commerce platform
   - **Visibility**: Private (recommended) or Public
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### 4. Push to GitHub

Copy the commands from GitHub's "push an existing repository" section:

```bash
git remote add origin https://github.com/YOUR_USERNAME/pure-fire-nutritional.git
git branch -M main
git push -u origin main
```

---

## Part 3: Vercel Deployment

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository:
   - Click "Import" next to your pure-fire-nutritional repo
   - If not listed, click "Adjust GitHub App Permissions" to grant access

### 2. Configure Build Settings

Vercel should auto-detect settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `pnpm build`
- **Output Directory**: `client/dist`
- **Install Command**: `pnpm install`

### 3. Add Environment Variables

Click "Environment Variables" and add these:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API |

### 4. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like `https://pure-fire-nutritional.vercel.app`

---

## Part 4: Post-Deployment Setup

### 1. Test Your Site

Visit your Vercel URL and test:

- ✅ Homepage loads
- ✅ Products page displays all products
- ✅ Product detail pages work
- ✅ Add to cart functionality
- ✅ AI Assistant responds
- ✅ Reviews can be submitted (requires Supabase)

### 2. Custom Domain (Optional)

#### Option A: Use Vercel Domain

1. In Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### Option B: Use Manus Domain

If you prefer Manus hosting:
1. Use the "Publish" button in Manus Management UI
2. Configure custom domain in Settings → Domains

### 3. Enable Email Notifications (Optional)

To enable order confirmation and abandoned cart emails:

1. In Vercel project → Settings → Environment Variables
2. Add these variables:

| Name | Value | Description |
|------|-------|-------------|
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP server (example: Gmail) |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | `your-email@gmail.com` | Sending email address |
| `EMAIL_PASS` | `your-app-password` | Email password or app password |

**Gmail Setup**:
1. Enable 2-factor authentication
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the generated 16-character password

---

## Part 5: Ongoing Maintenance

### Making Updates

```bash
# Make your changes locally
git add .
git commit -m "Description of changes"
git push

# Vercel will automatically rebuild and deploy
```

### Monitoring

- **Vercel Analytics**: Project → Analytics (track visitors)
- **Supabase Dashboard**: Monitor database usage
- **Error Logs**: Vercel → Deployments → View Function Logs

### Database Backups

Supabase automatically backs up your database daily. To download:
1. Supabase → Database → Backups
2. Click "Download" on any backup

---

## Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found` or `Cannot find package`
- **Fix**: Ensure `package.json` includes all dependencies
- Run `pnpm install` locally to verify

**Error**: `Build exceeded maximum duration`
- **Fix**: Upgrade Vercel plan or optimize build

### Reviews Not Saving

**Error**: Reviews don't appear after submission
- **Fix**: Check Supabase connection:
  1. Verify environment variables are set correctly
  2. Check Supabase → SQL Editor → run: `SELECT * FROM product_reviews;`
  3. Ensure RLS policies are enabled (they're in the schema)

### Supabase Connection Errors

**Error**: `Could not find table 'products'`
- **Fix**: Run the `supabase-schema.sql` script in Supabase SQL Editor

**Error**: `Invalid API key`
- **Fix**: Double-check environment variables match Supabase → Settings → API

---

## Environment Variables Reference

### Required for Production

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Development Only

```env
# These are automatically set by Manus and don't need to be added to Vercel
VITE_APP_TITLE=Pure Fire Nutritional
VITE_APP_LOGO=/logo.png
```

---

## Support

- **Manus Help**: [help.manus.im](https://help.manus.im)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## Security Checklist

Before going live:

- [ ] Supabase Row Level Security (RLS) policies enabled
- [ ] Environment variables set in Vercel (not hardcoded)
- [ ] Email credentials use app passwords (not main password)
- [ ] GitHub repository is private (if containing sensitive data)
- [ ] Custom domain has SSL enabled (automatic with Vercel)
- [ ] Test checkout flow end-to-end
- [ ] Set up error monitoring (Vercel Analytics or Sentry)

---

## Quick Start Summary

```bash
# 1. Setup Supabase
# - Create project at supabase.com
# - Run supabase-schema.sql in SQL Editor
# - Copy URL and anon key

# 2. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pure-fire-nutritional.git
git push -u origin main

# 3. Deploy to Vercel
# - Import GitHub repo at vercel.com
# - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# - Click Deploy

# Done! Your site is live 🎉
```
