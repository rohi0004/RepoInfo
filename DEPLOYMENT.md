# Deployment Guide for Netlify

## Critical Environment Variables

You **MUST** set these environment variables in your Netlify dashboard for the app to work:

### Required Variables

1. **GEMINI_API_KEY** (CRITICAL - without this, all chat features will fail with 502 errors)
   - Get from: https://aistudio.google.com/apikey
   - Example: `AIzaSyAi1s-RtDw52CaaB80FeNC9DiBe8F5G75Q`

2. **NEXT_PUBLIC_APP_URL** (CRITICAL - for payment redirects)
   - Set to: `https://repoinfo.netlify.app`
   - This ensures payment redirects work correctly

3. **GITHUB_TOKEN** (Optional but recommended)
   - Get from: https://github.com/settings/tokens
   - Increases API rate limits from 60 to 5000 requests/hour

### Optional Variables (for full features)

4. **Stripe Configuration** (for billing)
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_PRICE_PRO_YEARLY=price_...
   ```

5. **Email Configuration** (for receipts)
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

## How to Set Environment Variables on Netlify

1. Go to your site dashboard on Netlify
2. Click **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each variable with its key and value
5. Click **Save**
6. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Deploy site**

## Verifying Deployment

After deploying, check:
- Visit: `https://repoinfo.netlify.app/api/health`
- You should see: `hasGemini: true`
- If it shows `false`, the GEMINI_API_KEY is not set correctly

## Common Issues

### 502 Bad Gateway Errors
- **Cause**: Missing or invalid GEMINI_API_KEY
- **Solution**: Add GEMINI_API_KEY in Netlify environment variables

### Payment redirects to localhost
- **Cause**: NEXT_PUBLIC_APP_URL not set or set to localhost
- **Solution**: Set NEXT_PUBLIC_APP_URL=https://repoinfo.netlify.app

### Users not getting free queries
- **Cause**: Caching system (Redis/KV) not configured
- **Solution**: This is normal - free queries will work without caching
