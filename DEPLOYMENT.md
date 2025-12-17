# Deployment Guide for Render.com

This app is deployed on Render.com using Docker with MongoDB and Redis.

## 🚀 Quick Deploy

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `rohi0004/RepoInfo`
4. Render will automatically detect `render.yaml` and create:
   - ✅ Web service (Docker-based Next.js app)
   - ✅ MongoDB database (free 1GB)
   - ✅ Redis instance (free 25MB)

## Critical Environment Variables

You **MUST** set these environment variables in your Render dashboard for the app to work:

### Required Variables

1. **GEMINI_API_KEY** (CRITICAL - without this, all chat features will fail)
   - Get from: https://aistudio.google.com/apikey
   - Example: `AIzaSyAi1s-RtDw52CaaB80FeNC9DiBe8F5G75Q`

2. **GITHUB_TOKEN** (Optional but recommended)
   - Get from: https://github.com/settings/tokens
   - Increases API rate limits from 60 to 5000 requests/hour

3. **OPENROUTER_API_KEY** (Optional - for AI routing)
   - Get from: https://openrouter.ai/keys

### Stripe Configuration (Required for billing)

4. **Stripe API Keys**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_PRICE_PRO_YEARLY=price_...
   ```

**Note:** `NEXT_PUBLIC_APP_URL` is already configured in `render.yaml` as `https://repoinfo.onrender.com`

## How to Set Environment Variables on Render

1. Go to your Render dashboard
2. Select your `repoinfo` web service
3. Click **Environment** tab
4. Add each variable with its key and value
5. Click **Save Changes**
6. Render will automatically redeploy

## Stripe Webhook Setup

After deployment:

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://repoinfo.onrender.com/api/billing/webhook`
4. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **webhook signing secret** (starts with `whsec_...`)
6. Add it to Render: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Verifying Deployment

After deploying, check:
- Visit: `https://repoinfo.onrender.com/api/health`
- You should see: `hasGemini: true`
- If it shows `false`, the GEMINI_API_KEY is not set correctly

## Common Issues

### 502 Bad Gateway Errors
- **Cause**: Missing or invalid GEMINI_API_KEY
- **Solution**: Add GEMINI_API_KEY in Render environment variables

### Payment redirects to wrong URL
- **Cause**: `NEXT_PUBLIC_APP_URL` misconfigured
- **Solution**: Ensure `render.yaml` has `https://repoinfo.onrender.com`

### Cold starts (slow first load)
- **Cause**: Render free tier sleeps after 15 minutes of inactivity
- **Solution**: Upgrade to paid tier or accept ~30s cold start

### MongoDB connection issues
- **Cause**: MongoDB service not started or connection string wrong
- **Solution**: Check Render dashboard → Database service is running

## Free Tier Limits

- ✅ Web service sleeps after 15 minutes of inactivity
- ✅ 750 hours/month free (enough for 24/7 if you only run one service)
- ✅ MongoDB: 1GB storage
- ✅ Redis: 25MB storage

## Production URL

Your app will be available at: **https://repoinfo.onrender.com**
