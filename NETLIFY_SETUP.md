# Netlify Deployment Setup

## Required Environment Variables for Production

To make the billing system work on https://repoinfo.netlify.app/, you need to set the following environment variables in your Netlify dashboard:

### 1. Access Netlify Environment Variables
1. Go to https://app.netlify.com
2. Select your site: **repoinfo**
3. Go to **Site configuration** → **Environment variables**

### 2. Add These Environment Variables

#### App Configuration
```
NEXT_PUBLIC_APP_URL=https://repoinfo.netlify.app
```

#### API Keys
```
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GITHUB_TOKEN=your_github_token_here
```

#### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_PRO_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_PRO_YEARLY=price_your_yearly_price_id
```

#### Email Configuration (for receipts)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Database/Cache (Optional - for production persistence)
```
REDIS_URL=redis://your-redis-host:6379
```
Or use Vercel KV:
```
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### 3. Stripe Webhook Configuration

⚠️ **Important**: Update your Stripe webhook endpoint to point to production:

1. Go to https://dashboard.stripe.com/webhooks
2. Find your webhook or create a new one
3. Set the endpoint URL to: `https://repoinfo.netlify.app/api/billing/webhook`
4. Make sure these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the new webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in Netlify

### 4. Redeploy

After setting all environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

Or simply push a new commit to trigger automatic deployment.

### 5. Verify

Test the billing flow:
1. Visit https://repoinfo.netlify.app/pricing
2. Click on a plan to purchase
3. Complete test checkout (use Stripe test card: `4242 4242 4242 4242`)
4. Verify you're redirected back to: `https://repoinfo.netlify.app/billing/success`

## Notes

- The `NEXT_PUBLIC_APP_URL` variable is crucial for proper redirect URLs in Stripe checkout
- Without it, users will be redirected to localhost after payment
- Make sure to use your production Stripe keys when going live
- For now, test keys are fine for testing
