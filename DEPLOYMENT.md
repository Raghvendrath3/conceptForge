# 🚀 ConceptForge Deployment Guide

Complete guide to deploy ConceptForge to the internet using free-tier cloud services.

## 📋 Overview

- **Frontend**: Vercel (React/Vite app)
- **Backend**: Render (Node.js/Express API)
- **Database**: MongoDB Atlas (Cloud MongoDB)

**Total Cost**: $0/month (using free tiers)

---

## 🎯 Prerequisites

Before starting, ensure you have:

1. ✅ GitHub account (for code hosting)
2. ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
3. ✅ Render account (sign up at [render.com](https://render.com))
4. ✅ MongoDB Atlas account (sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
5. ✅ Google Gemini API key (get from [ai.google.dev](https://ai.google.dev))

---

## 📦 Step 1: Push Code to GitHub

If you haven't already, push your ConceptForge project to GitHub:

```bash
cd c:\Users\AC\Desktop\Workplace\Projects\ConceptForge

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ConceptForge.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Set Up MongoDB Atlas

### 2.1 Create a Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Click **"Build a Database"**
4. Select **"M0 Free"** tier
5. Choose a cloud provider and region (closest to you)
6. Name your cluster (e.g., `ConceptForge`)
7. Click **"Create"**

### 2.2 Configure Database Access

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `conceptforge-admin`
5. Click **"Autogenerate Secure Password"** and **SAVE THIS PASSWORD**
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### 2.3 Configure Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Note: This is safe because you have authentication
4. Click **"Confirm"**

### 2.4 Get Connection String

1. Go back to **"Database"** in the sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://conceptforge-admin:<password>@conceptforge.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you saved earlier
6. Add database name at the end: `...mongodb.net/conceptforge?retryWrites=true&w=majority`
7. **SAVE THIS CONNECTION STRING** - you'll need it for Render

---

## 🖥️ Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your **ConceptForge** repository
4. Configure the service:
   - **Name**: `conceptforge-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`

### Option 2: Deploy with Blueprint (Recommended)

1. Ensure you have pushed the `render.yaml` file to your repository.
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub account and select your **ConceptForge** repository
5. Render will automatically detect the configuration from `render.yaml`.
6. You will be prompted to enter the environment variables (MONGO_URI, JWT_SECRET, etc.).
7. Click **"Apply"**.

### 3.2 Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGO_URI` | Your MongoDB Atlas connection string from Step 2.4 |
| `JWT_SECRET` | Generate a random string (e.g., use [randomkeygen.com](https://randomkeygen.com)) |
| `CLIENT_URL` | `https://your-app.vercel.app` (you'll update this after Step 4) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NODE_ENV` | `production` |

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://conceptforge-api.onrender.com`
4. **SAVE THIS URL** - you'll need it for the frontend

---

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your **ConceptForge** GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.2 Add Environment Variable

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render backend URL from Step 3.3 (e.g., `https://conceptforge-api.onrender.com`) |

### 4.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://conceptforge-xyz.vercel.app`
4. **SAVE THIS URL**

### 4.4 Update Backend CLIENT_URL

1. Go back to Render dashboard
2. Select your `conceptforge-api` service
3. Go to **"Environment"**
4. Update `CLIENT_URL` to your Vercel URL (e.g., `https://conceptforge-xyz.vercel.app`)
5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## ✅ Step 5: Verify Deployment

### 5.1 Test the Application

1. Open your Vercel URL in a browser
2. **Register a new account**
3. **Create a concept node**
4. **Create a snippet** and run code
5. **Test AI auto-connect** (create multiple related nodes)
6. **View the graph**
7. **Test on mobile** to verify responsive design

### 5.2 Check for Errors

1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab to verify API calls succeed

---

## 🔧 Troubleshooting

### Frontend can't connect to backend

**Problem**: CORS errors or network failures

**Solution**:
1. Verify `VITE_API_URL` in Vercel matches your Render URL exactly
2. Verify `CLIENT_URL` in Render matches your Vercel URL exactly
3. Redeploy both services after updating environment variables

### Backend won't start

**Problem**: Application error on Render

**Solution**:
1. Check Render logs for errors
2. Verify `MONGO_URI` is correct and includes the database name
3. Verify all environment variables are set
4. Check that MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### MongoDB connection fails

**Problem**: "MongoNetworkError" or authentication errors

**Solution**:
1. Verify the password in `MONGO_URI` is correct (no special characters need URL encoding)
2. Check MongoDB Atlas Network Access allows 0.0.0.0/0
3. Verify database user exists and has correct permissions

### Render service is slow (cold starts)

**Problem**: First request takes 30+ seconds

**Explanation**: Render free tier spins down after 15 minutes of inactivity. This is normal.

**Solution**: 
- Upgrade to paid tier ($7/month) for always-on service
- Or accept the cold start delay (subsequent requests are fast)

---

## 🎉 Success!

Your ConceptForge application is now live on the internet! 

**Share your URLs**:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://conceptforge-api.onrender.com`

---

## 📝 Next Steps

### Optional Improvements

1. **Custom Domain**: Add your own domain in Vercel settings
2. **Monitoring**: Set up error tracking (e.g., Sentry)
3. **Analytics**: Add Google Analytics or Plausible
4. **CI/CD**: Automatic deployments are already set up via GitHub
5. **Backup**: MongoDB Atlas free tier includes automatic backups

### Updating Your App

Simply push changes to GitHub:

```bash
git add .
git commit -m "Your update message"
git push
```

Both Vercel and Render will automatically detect changes and redeploy!

---

## 🔒 Security Notes

- ✅ HTTPS enabled by default on both Vercel and Render
- ✅ Environment variables are encrypted
- ✅ JWT tokens for authentication
- ✅ MongoDB requires authentication
- ✅ Security headers configured in nginx/Vercel

---

## 💰 Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | ✅ Free | Unlimited bandwidth, 100GB/month |
| Render | ✅ Free | 750 hours/month, spins down after 15min |
| MongoDB Atlas | ✅ Free | 512MB storage, shared cluster |
| **Total** | **$0/month** | Perfect for personal projects |

---

**Need help?** Check the logs in Render and Vercel dashboards for detailed error messages.
