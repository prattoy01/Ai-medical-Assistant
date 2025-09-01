# 🚀 Quick Start: Deploy to Railway

## Prerequisites
- GitHub repository with your code
- Railway account at [railway.app](https://railway.app)

## ⚡ Fast Deployment (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy Backend
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set **Root Directory** to `backend`
5. Set **Build Command** to: `pip install -r requirements.txt`
6. Set **Start Command** to: `chmod +x start.sh && ./start.sh`

**Note**: The `railway.json`, `Procfile`, `start.sh`, and `wsgi.py` are now in the `backend/` directory. Railway will automatically detect the correct start command.

### 3. Add PostgreSQL Database
1. In your project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Copy the `DATABASE_URL` from the database service

### 4. Set Environment Variables
In your backend service, add these variables:
```
DATABASE_URL=<paste_from_step_3>
GEMINI_API_KEY=your_gemini_api_key
FLASK_ENV=production
```

### 5. Deploy Frontend
1. Click "New Service" in your project
2. Select "Deploy from GitHub repo" (same repo)
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to: `npm install && npm run build`
5. Set **Start Command** to: `npx serve -s build -l $PORT`

### 6. Update Frontend Config
1. Get your backend URL from Railway
2. Update `frontend/src/config.js` with your backend URL
3. Redeploy frontend

## 🔧 Manual Deployment
If you prefer manual steps, see `RAILWAY_DEPLOYMENT.md` for detailed instructions.

## 🚨 Important Notes
- **Free Tier**: 500 hours/month
- **Database**: PostgreSQL is recommended over SQLite for production
- **Environment**: Set `FLASK_ENV=production` for security
- **CORS**: Update CORS origins in backend after getting frontend URL

## 🆘 Need Help?
- Check Railway logs in dashboard
- Verify environment variables are set
- Ensure database connection is working
- Check CORS configuration

---
**Your app will be live at the URLs shown in Railway dashboard! 🎉**
