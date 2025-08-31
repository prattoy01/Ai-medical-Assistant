# Railway Deployment Guide

This guide will help you deploy your Flask + React web app to Railway for free hosting.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Prepare Your Repository

Make sure your repository has the following structure:
```
project-root/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   └── routes/
├── frontend/
│   ├── package.json
│   └── src/
├── Procfile
├── railway.json
├── runtime.txt
└── README.md
```

## Step 2: Deploy Backend to Railway

### 2.1 Connect GitHub Repository
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the branch you want to deploy (usually `main` or `master`)

### 2.2 Configure Backend Service
1. Railway will detect it's a Python project
2. Set the **Root Directory** to `backend`
3. Set the **Build Command** to: `pip install -r requirements.txt`
4. Set the **Start Command** to: `gunicorn --bind 0.0.0.0:$PORT app:app`

### 2.3 Set Environment Variables
In your Railway project, go to the "Variables" tab and add:

```
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
FLASK_ENV=production
SECRET_KEY=your_random_secret_key
```

### 2.4 Add PostgreSQL Database
1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provide the `DATABASE_URL` environment variable
4. Copy this URL and set it in your backend service variables

## Step 3: Deploy Frontend to Railway

### 3.1 Create Frontend Service
1. In your Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Choose the same repository
4. Set the **Root Directory** to `frontend`
5. Set the **Build Command** to: `npm install && npm run build`
6. Set the **Start Command** to: `npx serve -s build -l $PORT`

### 3.2 Update Frontend API Endpoints
Before deploying, update your frontend to use the Railway backend URL:

```javascript
// In your frontend API calls, replace localhost:5000 with your Railway backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app';
```

## Step 4: Configure Domains

### 4.1 Backend Domain
1. In your backend service, go to "Settings"
2. Click "Generate Domain" or use a custom domain
3. Copy the URL (e.g., `https://your-app-backend.railway.app`)

### 4.2 Frontend Domain
1. In your frontend service, go to "Settings"
2. Click "Generate Domain" or use a custom domain
3. Copy the URL (e.g., `https://your-app-frontend.railway.app`)

## Step 5: Update CORS Settings

Make sure your backend allows requests from your frontend domain:

```python
# In backend/app.py
CORS(app, origins=[
    "https://your-frontend-domain.railway.app",
    "http://localhost:3000"  # For local development
])
```

## Step 6: Test Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.railway.app/health`
2. **Frontend**: Visit your frontend Railway URL
3. **Test API Calls**: Make sure your frontend can communicate with the backend

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check the build logs in Railway
2. **Database Connection**: Ensure `DATABASE_URL` is set correctly
3. **Port Issues**: Railway automatically sets the `PORT` environment variable
4. **CORS Errors**: Verify CORS origins are set correctly

### Useful Commands:

```bash
# Check Railway CLI (optional)
npm install -g @railway/cli
railway login
railway status
```

## Free Tier Limitations

- **Monthly Usage**: 500 hours
- **Build Time**: 45 minutes per build
- **Deployments**: Unlimited
- **Custom Domains**: Supported
- **SSL**: Automatic HTTPS

## Monitoring

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor CPU, memory, and network usage
- **Deployments**: Track deployment history and rollback if needed

## Next Steps

1. Set up automatic deployments on git push
2. Configure custom domains
3. Set up monitoring and alerts
4. Implement CI/CD pipeline

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Community**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Check your repository for deployment issues

---

**Note**: Railway's free tier is generous but has usage limits. Monitor your usage to avoid unexpected charges.
