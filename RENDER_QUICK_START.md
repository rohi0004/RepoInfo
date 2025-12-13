# Quick Deploy to Render

## 🚀 Quick Start (5 minutes)

### Step 1: Go to Render
Visit https://dashboard.render.com and sign in with GitHub

### Step 2: Create Web Service
- Click **"New +"** → **"Web Service"**
- Select **"Build and deploy from a Git repository"**
- Choose **rohi0004/RepoInfo** repository
- Click **"Connect"**

### Step 3: Configure Service
- **Name**: `repoinfo`
- **Environment**: `Node`
- **Region**: Choose your region
- **Plan**: `Free` (you can upgrade later)
- **Branch**: `main`
- **Build Command**: `npm install && npm run build` (auto-filled)
- **Start Command**: `npm start` (auto-filled)

### Step 4: Add Environment Variables
Click **"Advanced"** and add these variables:

```
NODE_ENV = production
GITHUB_TOKEN = <your_github_token>
GEMINI_API_KEY = <your_gemini_api_key>
OPENAI_API_KEY = <your_openai_api_key>
```

**For Caching (pick one):**

**Option A - Render Redis (Recommended):**
Create a Redis database in Render and add:
```
REDIS_URL = <from_your_redis_instance>
```

**Option B - Vercel KV:**
```
KV_URL = <your_value>
KV_REST_API_URL = <your_value>
KV_REST_API_TOKEN = <your_value>
KV_REST_API_READ_ONLY_TOKEN = <your_value>
```

### Step 5: Deploy
Click **"Create Web Service"** and wait for deployment ✅

Your app will be live at: `https://repoinfo.onrender.com`

---

## 🔑 How to Get API Keys

### GitHub Token
1. Go to https://github.com/settings/tokens/new
2. Select scopes: `repo`, `read:user`
3. Copy the token

### Gemini API Key
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create new API key in Google Cloud Console

### OpenAI API Key (Optional)
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"

---

## 📝 What's Included

✅ **render.yaml** - Automatic deployment blueprint  
✅ **Dockerfile.render** - Multi-stage Docker build  
✅ **DEPLOYMENT_RENDER.md** - Full deployment guide  
✅ **package.json** - Build & start scripts ready  

---

## ❓ Troubleshooting

**Deployment fails?**
- Check logs in Render dashboard
- Ensure all env vars are set
- Verify Node.js compatibility

**App crashes after deploy?**
- Go to Logs tab to see error
- Check if Redis is connected
- Verify API keys are correct

**Want to use Custom Domain?**
- In service settings, click "Custom Domain"
- Add your domain
- Update DNS records per Render's instructions

---

## 📚 Full Guide
See **DEPLOYMENT_RENDER.md** for comprehensive deployment documentation.

**Questions?** Check Render docs: https://render.com/docs
