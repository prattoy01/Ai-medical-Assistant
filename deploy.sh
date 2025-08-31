#!/bin/bash

# Railway Deployment Script
echo "🚂 Railway Deployment Script"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI found"
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Check if we're in a Railway project
if [ ! -f "railway.json" ]; then
    echo "❌ railway.json not found. Please run this script from your project root."
    exit 1
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Check your Railway dashboard for the deployment status"
echo "🔗 Your app should be available at the URL shown in Railway"
