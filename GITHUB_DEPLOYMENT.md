# 🚀 GitHub Deployment Guide

## Overview
This guide will help you deploy your Prescription Analysis App using GitHub Pages (frontend) and Railway (backend).

## 📋 Prerequisites
- GitHub account
- Railway account (for backend)
- Your code pushed to a GitHub repository

## 🎯 Step-by-Step Deployment

### 1. **Prepare Your Repository**

First, make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. **Update Configuration Files**

#### Frontend Configuration
Update `frontend/package.json` with your actual GitHub username and repository name:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

#### Backend Configuration
The backend is already configured for Railway deployment with the files in the `backend/` directory.

### 3. **Deploy Frontend to GitHub Pages**

#### Option A: Manual Deployment
```bash
cd frontend
npm run deploy
```

#### Option B: Automatic Deployment (Recommended)
1. Go to your GitHub repository
2. Go to **Settings** → **Pages**
3. Set **Source** to "GitHub Actions"
4. The workflow will automatically deploy when you push to main

### 4. **Deploy Backend to Railway**

#### Option A: Manual Deployment
1. Go to [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub repo"
3. Select your repository
4. Set **Root Directory** to `backend`
5. Set **Build Command** to: `pip install -r requirements.txt`
6. Set **Start Command** to: `gunicorn --bind 0.0.0.0:$PORT app:app`

#### Option B: Automatic Deployment (Recommended)
1. Get your Railway token:
   - Go to Railway dashboard
   - Go to **Account** → **Tokens**
   - Create a new token
2. Add the token to GitHub secrets:
   - Go to your GitHub repository
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add new secret: `RAILWAY_TOKEN` with your Railway token value

### 5. **Update Frontend API Configuration**

Once your backend is deployed, update `frontend/src/config.js`:

```javascript
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5001',
    UPLOAD_BASE_URL: 'http://localhost:5001'
  },
  production: {
    API_BASE_URL: 'https://your-railway-backend-url.railway.app',
    UPLOAD_BASE_URL: 'https://your-railway-backend-url.railway.app'
  }
};
```

### 6. **Set Environment Variables**

In Railway, add these environment variables:
- `DATABASE_URL` (Railway will provide this)
- `GEMINI_API_KEY` (your Google Gemini API key)
- `FLASK_ENV=production`

## 🔄 **Automatic Deployment**

The GitHub Actions workflow will:
1. **Frontend**: Build and deploy to GitHub Pages
2. **Backend**: Deploy to Railway

Every time you push to the `main` branch, both will be automatically deployed.

## 🌐 **Access Your App**

- **Frontend**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`
- **Backend**: `https://your-railway-backend-url.railway.app`

## 🛠️ **Troubleshooting**

### Common Issues:

1. **Frontend not loading**: Check if GitHub Pages is enabled in repository settings
2. **Backend not working**: Verify Railway deployment and environment variables
3. **CORS errors**: Make sure frontend URL is added to CORS origins in backend
4. **API calls failing**: Check if backend URL is correct in frontend config

### Manual Deployment Commands:

```bash
# Frontend
cd frontend
npm run build
npm run deploy

# Backend (if using Railway CLI)
cd backend
railway login
railway up
```

## 📝 **Notes**

- GitHub Pages is free and perfect for static sites
- Railway offers a free tier (500 hours/month)
- The workflow automatically handles builds and deployments
- Environment variables are securely stored in GitHub secrets

## 🎉 **Success!**

Once deployed, your app will be accessible worldwide through GitHub Pages and Railway!
