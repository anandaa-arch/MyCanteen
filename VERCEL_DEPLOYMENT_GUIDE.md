# 🚀 MyCanteen Vercel Deployment Guide

## Prerequisites

✅ GitHub account
✅ Vercel account (sign up at https://vercel.com)
✅ Supabase project (already configured)
✅ All code committed to GitHub repository

---

## Step 1: Prepare Your Repository

### 1.1 Commit All Changes

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify .gitignore

Ensure `.env.local` is NOT committed (it should be in `.gitignore`):
```
.env*
```

✅ **Your `.gitignore` is already configured correctly!**

---

## Step 2: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Use "Continue with GitHub"

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `anandaa-arch/MyCanteen`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables** (CRITICAL!)
   
   Click "Environment Variables" and add these **3 variables**:

   | Key | Value | Source |
   |-----|-------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://vbjyqgfdjolgtdqblvpc.supabase.co` | From your .env.local |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | From your .env.local |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | From your .env.local |

   **⚠️ IMPORTANT**: 
   - Copy the FULL keys from your `.env.local` file
   - Select "Production", "Preview", and "Development" for all variables

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://my-canteen-xxxxx.vercel.app`

---

### Method 2: Using Vercel CLI (For Developers)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd d:\MyCanteen
vercel

# Follow the prompts:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# Project name? mycanteen (or your preferred name)
# In which directory is your code located? ./
# Want to override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Deploy to production
vercel --prod
```

---

## Step 3: Configure Supabase for Production

### 3.1 Update Supabase Redirect URLs

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `vbjyqgfdjolgtdqblvpc`
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Site URL** and **Redirect URLs**:

   **Site URL:**
   ```
   https://your-project-name.vercel.app
   ```

   **Redirect URLs (Add these):**
   ```
   https://your-project-name.vercel.app/auth/callback
   https://your-project-name.vercel.app/login
   https://your-project-name.vercel.app/admin/dashboard
   https://your-project-name.vercel.app/user/dashboard
   ```

5. Click **Save**

### 3.2 Verify CORS Settings

Supabase should automatically allow requests from your Vercel domain. If you encounter CORS issues:

1. Go to **Settings** → **API**
2. Check **CORS Allowed Origins**
3. Ensure `*` is enabled OR add your Vercel URL explicitly

---

## Step 4: Post-Deployment Verification

### 4.1 Check Build Logs

In Vercel Dashboard:
- Go to your project → **Deployments**
- Click on the latest deployment
- Check **Build Logs** for any errors

### 4.2 Test Your Application

Visit your deployed URL and test:

✅ **Landing Page**: Should load with "Today's Students"
✅ **Login**: Test with admin@test.com / admin123
✅ **Admin Dashboard**: Should show users and stats
✅ **User Dashboard**: Test with user@test.com / user123
✅ **Poll Responses**: Submit and verify
✅ **Billing**: Check billing management
✅ **QR Code**: Generate and scan QR codes

### 4.3 Check Console for Errors

- Open browser DevTools (F12)
- Check Console tab for any errors
- Verify API calls are going to your Vercel domain

---

## Step 5: Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel Dashboard → **Settings** → **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `mycanteen.com`)
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with new domain

---

## Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys!
```

### Preview Deployments

Every pull request gets a preview URL:
- Create a branch: `git checkout -b feature-branch`
- Push: `git push origin feature-branch`
- Create PR on GitHub
- Vercel creates preview: `https://my-canteen-git-feature-branch-xxxxx.vercel.app`

---

## Troubleshooting

### Build Fails

**Error**: `Module not found: Can't resolve '@/...'`
**Solution**: Check `jsconfig.json` has correct path aliases

**Error**: `Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined`
**Solution**: Add environment variables in Vercel Dashboard

### Runtime Errors

**Error**: `Failed to fetch` or CORS errors
**Solution**: Update Supabase redirect URLs

**Error**: `Invalid Refresh Token`
**Solution**: Clear cookies and re-login

### Database Connection Issues

**Error**: `relation "profiles_new" does not exist`
**Solution**: Verify Supabase database tables exist

---

## Environment Variables Quick Reference

Copy these values from your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vbjyqgfdjolgtdqblvpc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZianlxZ2Zkam9sZ3RkcWJsdnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjMzNzAsImV4cCI6MjA3NTQ5OTM3MH0.6Aep_XzT6FdbtcHoPOBqTO96pavBAEt94IC_V4zzYGs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZianlxZ2Zkam9sZ3RkcWJsdnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkyMzM3MCwiZXhwIjoyMDc1NDk5MzcwfQ.dwjzglDUC-XiH90Za0EwX2GTJN72AT084Ot6XOt_wZU
```

---

## Security Checklist

✅ `.env.local` is in `.gitignore`
✅ Service role key is ONLY in Vercel environment variables
✅ Supabase RLS policies are enabled
✅ API routes validate user authentication
✅ Middleware protects admin routes

---

## Performance Optimization

Already configured in your project:

✅ Next.js Image Optimization
✅ Automatic code splitting
✅ Server-side rendering
✅ API route caching
✅ Database query optimization

---

## Monitoring & Analytics

Vercel provides built-in analytics:
- **Speed Insights**: Already added via `@vercel/speed-insights`
- **Error Tracking**: Available in Vercel Dashboard
- **Usage Stats**: Monitor bandwidth and function invocations

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: https://vercel.com/support

---

## Quick Deploy Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Vercel account created and linked to GitHub
- [ ] Project imported in Vercel
- [ ] All 3 environment variables added
- [ ] Successful deployment (green checkmark)
- [ ] Supabase redirect URLs updated
- [ ] Login tested on production
- [ ] Admin dashboard accessible
- [ ] User dashboard accessible
- [ ] Poll responses working
- [ ] QR code generation working

---

## 🎉 You're Ready!

Once deployed, your MyCanteen app will be live at:
`https://your-project-name.vercel.app`

Share this URL with your institution for canteen management! 🍽️

