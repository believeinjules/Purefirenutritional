# Environment Variables Documentation

## Required Variables for Deployment

### Supabase Database (REQUIRED)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to get these:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Navigate to Settings → API
4. Copy "Project URL" and "anon/public key"

### Email Notifications (OPTIONAL)

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate a new app password
4. Use the 16-character password (no spaces)

**Other SMTP Providers:**
- **SendGrid**: `smtp.sendgrid.net` (port 587)
- **Mailgun**: `smtp.mailgun.org` (port 587)
- **AWS SES**: `email-smtp.us-east-1.amazonaws.com` (port 587)

## Auto-Configured Variables

These are automatically set and don't need manual configuration:

```
VITE_APP_TITLE=Pure Fire Nutritional
VITE_APP_LOGO=/logo.png
```

## Setting Variables in Different Environments

### Local Development

Create `.env.local` file in project root:

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Vercel Deployment

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production, Preview, Development
4. Click "Save"
5. Redeploy for changes to take effect

### Manus Deployment

1. Click Settings → Secrets in Management UI
2. Add each variable
3. Click "Publish" to deploy

## Security Best Practices

- ✅ **Never commit** `.env` or `.env.local` files to Git
- ✅ **Use app passwords** for email (not your main password)
- ✅ **Rotate keys** if accidentally exposed
- ✅ **Use different keys** for development and production
- ✅ **Enable Row Level Security** in Supabase (included in schema)

## Troubleshooting

### "Supabase is not configured" Error

**Cause**: Environment variables not set or incorrect

**Fix**:
1. Verify variables are set in your deployment platform
2. Check for typos in variable names (they're case-sensitive)
3. Ensure no extra spaces in values
4. Redeploy after adding variables

### Email Not Sending

**Cause**: Invalid SMTP credentials or blocked by provider

**Fix**:
1. Test credentials with a simple SMTP test tool
2. For Gmail: Ensure 2FA is enabled and using App Password
3. Check if your hosting provider blocks port 587
4. Try port 465 with SSL instead

### Reviews Not Saving

**Cause**: Supabase tables not created

**Fix**:
1. Run `supabase-schema.sql` in Supabase SQL Editor
2. Verify tables exist: `SELECT * FROM product_reviews;`
3. Check RLS policies are enabled
