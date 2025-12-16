#!/bin/bash
# Quick deployment script for RepoInfo

set -e

echo "🚀 RepoInfo Docker Deployment Helper"
echo "====================================="
echo ""

# Check if user wants to deploy or run locally
echo "Choose deployment option:"
echo "1) Local development with Docker (includes MongoDB)"
echo "2) Deploy to Render.com (recommended - free tier)"
echo "3) Deploy to Railway.app"
echo "4) Deploy to Fly.io"
echo ""
read -p "Enter option (1-4): " choice

case $choice in
  1)
    echo ""
    echo "🐳 Starting local development with Docker..."
    echo ""
    echo "This will start:"
    echo "  - Next.js app on http://localhost:3000"
    echo "  - MongoDB on mongodb://localhost:27017/repoinfo"
    echo "  - Redis on redis://localhost:6379"
    echo ""
    read -p "Continue? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
      docker-compose up --build
    fi
    ;;
    
  2)
    echo ""
    echo "🎨 Deploying to Render.com..."
    echo ""
    echo "Steps:"
    echo "1. Go to https://render.com and sign up/login"
    echo "2. Click 'New +' → 'Blueprint'"
    echo "3. Connect your GitHub repository: rohi0004/RepoInfo"
    echo "4. Render will automatically detect render.yaml"
    echo "5. It will create:"
    echo "   - Web service (Next.js app)"
    echo "   - MongoDB database (free 1GB)"
    echo "   - Redis instance (free 25MB)"
    echo ""
    echo "6. Add environment variables in Render dashboard:"
    echo "   - Copy values from your .env.local file"
    echo "   - GEMINI_API_KEY, GITHUB_TOKEN, OPENROUTER_API_KEY"
    echo "   - STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE"
    echo "   - STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY"
    echo ""
    echo "7. Click 'Apply' and wait for deployment"
    echo ""
    read -p "Open Render.com in browser? (y/n): " open_browser
    if [ "$open_browser" = "y" ]; then
      if command -v xdg-open &> /dev/null; then
        xdg-open "https://render.com/deploy"
      elif command -v open &> /dev/null; then
        open "https://render.com/deploy"
      else
        echo "Open this URL: https://render.com/deploy"
      fi
    fi
    ;;
    
  3)
    echo ""
    echo "🚂 Deploying to Railway.app..."
    echo ""
    echo "Steps:"
    echo "1. Go to https://railway.app and sign up/login"
    echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
    echo "3. Select your repository: rohi0004/RepoInfo"
    echo "4. Railway will detect railway.toml and deploy"
    echo "5. Add MongoDB: Click '+' → 'Database' → 'Add MongoDB'"
    echo "6. Add environment variables (same as Render)"
    echo "7. Add: MONGODB_URI=\${MONGO_URL}"
    echo ""
    read -p "Open Railway.app in browser? (y/n): " open_browser
    if [ "$open_browser" = "y" ]; then
      if command -v xdg-open &> /dev/null; then
        xdg-open "https://railway.app/new"
      elif command -v open &> /dev/null; then
        open "https://railway.app/new"
      else
        echo "Open this URL: https://railway.app/new"
      fi
    fi
    ;;
    
  4)
    echo ""
    echo "✈️  Deploying to Fly.io..."
    echo ""
    
    # Check if Fly CLI is installed
    if ! command -v fly &> /dev/null; then
      echo "Fly CLI not found. Installing..."
      curl -L https://fly.io/install.sh | sh
      echo ""
      echo "⚠️  Add fly to your PATH:"
      echo "export PATH=\"\$HOME/.fly/bin:\$PATH\""
      echo ""
      read -p "Press Enter after adding to PATH..."
    fi
    
    echo "Fly CLI commands:"
    echo "  fly auth login              # Login to Fly.io"
    echo "  fly launch                  # Create app (detects fly.toml)"
    echo "  fly secrets set KEY=value   # Add environment variables"
    echo "  fly deploy                  # Deploy app"
    echo ""
    echo "Don't forget to set up MongoDB Atlas for database"
    echo ""
    read -p "Run 'fly launch' now? (y/n): " run_launch
    if [ "$run_launch" = "y" ]; then
      fly launch
    fi
    ;;
    
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "✅ Done! Check DOCKER_DEPLOYMENT.md for detailed instructions."
