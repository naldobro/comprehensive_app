# TaskFlow Deployment Guide

This guide will help you deploy your TaskFlow app with Supabase backend and Vercel frontend.

## Prerequisites

1. **GitHub Account** - For hosting your code
2. **Supabase Account** - For the database backend
3. **Vercel Account** - For frontend hosting

## Step 1: Set up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `taskflow-backend` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### 1.2 Run Database Migration

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase/migrations/create_complete_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the migration
6. You should see "Success. No rows returned" message

### 1.3 Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (starts with `eyJ`)

## Step 2: Prepare Your Code for Deployment

### 2.1 Create Environment Variables

1. In your project root, create a `.env` file:
```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual Supabase credentials from Step 1.3

### 2.2 Update Package.json for Production

Make sure your `package.json` has the build script:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 3: Deploy to GitHub

### 3.1 Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit - TaskFlow with Supabase backend"
```

### 3.2 Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it `taskflow-app` (or any name you prefer)
3. Don't initialize with README (since you already have code)
4. Click "Create repository"

### 3.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/taskflow-app.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository (`taskflow-app`)
4. Click "Import"

### 4.2 Configure Environment Variables

1. In the deployment configuration, scroll to **Environment Variables**
2. Add these variables:
   - **Name**: `VITE_SUPABASE_URL`, **Value**: Your Supabase project URL
   - **Name**: `VITE_SUPABASE_ANON_KEY`, **Value**: Your Supabase anon key
3. Click "Deploy"

### 4.3 Wait for Deployment

- Vercel will build and deploy your app (2-3 minutes)
- You'll get a live URL like `https://taskflow-app-xyz.vercel.app`

## Step 5: Test Your Deployment

1. Open your Vercel URL
2. Try creating a topic
3. Try creating a task
4. Check if data persists after refresh
5. Test on both desktop and mobile

## Step 6: Custom Domain (Optional)

If you want a custom domain:

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **"Failed to load data" error**:
   - Check if environment variables are set correctly in Vercel
   - Verify Supabase credentials are correct
   - Check Supabase project is active

2. **Build fails**:
   - Make sure all dependencies are in `package.json`
   - Check for TypeScript errors locally first

3. **Database connection issues**:
   - Verify the SQL migration ran successfully
   - Check RLS policies are enabled
   - Ensure Supabase project is not paused

4. **Mobile responsiveness issues**:
   - Test on actual devices
   - Use browser dev tools to simulate mobile

### Getting Help:

- Check Vercel deployment logs for build errors
- Check browser console for runtime errors
- Check Supabase logs in the dashboard

## Security Notes

Since this app doesn't use authentication:
- Anyone with the URL can access your data
- Consider this when sharing the URL
- For production use, consider adding authentication

## Maintenance

### Updating Your App:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
```bash
git add .
git commit -m "Update: description of changes"
git push
```
4. Vercel will automatically redeploy

### Database Backups:

- Supabase automatically backs up your database
- You can also export data from the Supabase dashboard

## Success! 🎉

Your TaskFlow app is now live and accessible from anywhere! You can:
- Access it from any device with the URL
- All data syncs across devices
- Use all features including topics, tasks, milestones, and analytics
- Data persists permanently in Supabase

The app will work seamlessly across your laptop and mobile devices with full synchronization.