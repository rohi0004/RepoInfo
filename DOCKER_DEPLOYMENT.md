# Docker Deployment Guide

Your app is now configured for Docker-based deployment on multiple platforms.

## 🚀 Deployment Options

### Option 1: Render.com (Recommended - Free tier with MongoDB)

**Steps:**
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Blueprint"
3. Connect your GitHub repository: `rohi0004/RepoInfo`
4. Render will automatically detect `render.yaml` and create:
   - ✅ Web service (Docker-based Next.js app)
   - ✅ MongoDB database (free 1GB)
   - ✅ Redis instance (free 25MB)

**Environment Variables to Set:**
```bash
# Copy these from your .env.local file
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE=your_stripe_publishable_key_here
STRIPE_PRICE_PRO_MONTHLY=your_stripe_monthly_price_id
STRIPE_PRICE_PRO_YEARLY=your_stripe_yearly_price_id
```

**Note:** `MONGODB_URI` is auto-configured by Render from the database service.

**Free Tier Limits:**
- ✅ Web service sleeps after 15 minutes of inactivity
- ✅ 750 hours/month free (enough for 24/7 if you only run one service)
- ✅ MongoDB: 1GB storage
- ✅ Redis: 25MB storage

---

### Option 2: Railway.app (Easy setup, $5 credit)

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository: `rohi0004/RepoInfo`
4. Railway will detect `railway.toml` and deploy with Docker
5. Add MongoDB service: Click "+ New" → "Database" → "Add MongoDB"

**Environment Variables:**
Same as Render, but add:
```bash
MONGODB_URI=${MONGO_URL}  # Railway provides this automatically
```

**Pricing:**
- $5 free credit (enough for ~1 month of testing)
- After that: ~$5-10/month for hobby usage

---

### Option 3: Fly.io (Developer-friendly, free tier)

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create app: `fly launch` (it will detect `fly.toml`)
4. For MongoDB, either:
   - Use MongoDB Atlas (free tier)
   - Or create Fly MongoDB: `fly postgres create` (replace with MongoDB image)

**Set Secrets:**
```bash
# Copy values from your .env.local file
fly secrets set \
  GEMINI_API_KEY="your_gemini_key" \
  GITHUB_TOKEN="your_github_token" \
  OPENROUTER_API_KEY="your_openrouter_key" \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/" \
  STRIPE_SECRET_KEY="sk_test_your_key" \
  NEXT_PUBLIC_STRIPE_PUBLISHABLE="pk_test_your_key" \
  STRIPE_PRICE_PRO_MONTHLY="price_your_id" \
  STRIPE_PRICE_PRO_YEARLY="price_your_id"
```

**Free Tier:**
- 3 shared-cpu-1x VMs
- 160GB bandwidth/month

---

## 🐳 Local Development with Docker

Your `docker-compose.yml` now includes MongoDB:

```bash
# Start all services (app, MongoDB, Redis)
docker-compose up

# Stop all services
docker-compose down

# Clean everything and start fresh
docker-compose down -v && docker-compose up --build
```

**Access points:**
- App: http://localhost:3000
- MongoDB: mongodb://localhost:27017/repoinfo
- Redis: redis://localhost:6379

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
If you see "MONGODB_URI not set" errors:
1. Check environment variables are set correctly
2. Verify MongoDB service is running: `docker-compose ps`
3. Check logs: `docker-compose logs mongodb`

### Build Failures
```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Slow Performance
- Render free tier: Web service sleeps after 15 min inactivity (cold start ~30s)
- Railway: No sleep, but limited resources on free tier
- Fly.io: Auto-stop machines after inactivity

---

## ✅ Recommended Choice: **Render.com**

**Why Render?**
- ✅ Free MongoDB included (1GB)
- ✅ Free Redis included
- ✅ Automatic HTTPS
- ✅ Zero-config deployment from `render.yaml`
- ✅ Web dashboard for logs and monitoring
- ✅ No credit card required for free tier
- ✅ Built-in health checks

**Deploy now:** https://render.com/deploy

---

## 📊 Comparison

| Platform | MongoDB | Redis | Free Tier | Sleep | Setup Difficulty |
|----------|---------|-------|-----------|-------|------------------|
| **Render** | ✅ Free 1GB | ✅ Free 25MB | ✅ 750h/mo | 15 min | ⭐ Easy |
| Railway | Manual setup | Manual | $5 credit | No | ⭐⭐ Moderate |
| Fly.io | External only | No | 3 VMs | Auto-stop | ⭐⭐⭐ Advanced |
| Netlify | External only | No | ✅ Free | No | ⭐ Easy (but no Docker) |

---

## 🔐 Security Note

After deployment, update your webhook URL in Stripe:
```
https://your-app.onrender.com/api/billing/webhook
```

Test with: `https://your-app.onrender.com/api/health`
