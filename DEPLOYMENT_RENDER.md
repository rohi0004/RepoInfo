# Deployment Guide - Render

This guide will help you deploy RepoInfo to Render.

## Prerequisites

1. **GitHub Account** - Repository must be on GitHub
2. **Render Account** - Sign up at [https://render.com](https://render.com)
3. **API Keys** - You'll need:
   - GitHub Personal Access Token
   - Google Gemini API Key
   - OpenAI API Key (optional)
   - Redis credentials (if using external Redis)

## Step-by-Step Deployment

### 1. Prepare API Keys

Before deploying, gather these environment variables:

- **GITHUB_TOKEN**: Create at https://github.com/settings/tokens
  - Scopes: `repo`, `read:user`
  
- **GEMINI_API_KEY**: Get from https://ai.google.dev/
  
- **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys (optional)

- **Redis** (one of the following):
  - Use Render's Redis database (recommended for free tier)
  - Use Vercel KV: https://vercel.com/docs/storage/vercel-kv
  - Use external Redis service

### 2. Connect GitHub Repository to Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Connect your GitHub account and authorize Render
5. Select the `RepoInfo` repository
6. Click **"Connect"**

### 3. Configure Web Service

**Basic Settings:**
- **Name**: `repoinfo` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Plan**: Start with **Free** tier
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Add Environment Variables

In the Render dashboard, add all required environment variables:

```
NODE_ENV=production
GITHUB_TOKEN=<your_github_token>
GEMINI_API_KEY=<your_gemini_api_key>
OPENAI_API_KEY=<your_openai_api_key>
```

**For Redis/Caching:**

**Option A: Use Render Redis (Recommended)**
1. Create a Redis database in Render
2. Use the provided `REDIS_URL`

**Option B: Use Vercel KV**
```
KV_URL=<your_kv_url>
KV_REST_API_URL=<your_kv_rest_api_url>
KV_REST_API_TOKEN=<your_kv_rest_api_token>
KV_REST_API_READ_ONLY_TOKEN=<your_kv_rest_api_read_only_token>
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the Next.js app
   - Deploy your service

3. Monitor the deployment in the **"Logs"** tab
4. Once deployment is complete, your app will be live at: `https://repoinfo.onrender.com`

## Using render.yaml for One-Click Deployment

For future deployments, you can use the `render.yaml` file:

1. Push the `render.yaml` to your GitHub repository
2. Go to Render Dashboard
3. Click **"New +"** → **"Blueprint"**
4. Select your GitHub repository
5. Render will automatically detect and use `render.yaml`
6. Add required environment variables
7. Click **"Deploy"**

## Updating Environment Variables Later

To update environment variables after deployment:

1. Go to your service in Render Dashboard
2. Click **"Environment"**
3. Update the variables
4. Click **"Save"** (service will auto-redeploy)

## Troubleshooting

### Build Fails with npm install errors
- Check that all dependencies are in `package.json`
- Ensure Node.js version compatibility (18+ recommended)

### Application crashes after deployment
1. Check **"Logs"** tab for error messages
2. Verify all required environment variables are set
3. Check if Redis is accessible

### Database Connection Issues
- Verify Redis URL is correct
- Check if firewall allows connections
- For Vercel KV, ensure tokens are valid

### Performance Issues on Free Tier
- Free tier services sleep after 15 minutes of inactivity
- Upgrade to Starter plan for always-on service
- Consider caching strategies

## Monitoring & Logs

Access your application logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time deployment and runtime logs

## Next Steps

- **Custom Domain**: Add your domain in **"Settings"** → **"Custom Domain"**
- **Upgrade Plan**: Go to **"Settings"** → **"Plan"** for better performance
- **CI/CD**: Render auto-deploys on push to your branch
- **Webhook**: Configure GitHub webhook for auto-redeploy

## Support

- Render Docs: https://render.com/docs
- Discord Support: https://render.com/community

## Quick Reference

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Web Service | $0 (with limits) | $7+/month |
| Redis Database | $0 (with limits) | $15+/month |
| Deployment | Auto | Auto |
| Sleep | Yes (15 min) | No |

---

**Happy Deploying! 🚀**
