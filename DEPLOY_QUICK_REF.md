# 🚀 Quick Deploy to Vercel - Command Reference

## One-Command Deploy (PowerShell)

```powershell
.\deploy.ps1
```

This script will:
- ✅ Check git status
- ✅ Commit any changes
- ✅ Push to GitHub
- ✅ Prepare for Vercel deployment

---

## Manual Deploy Steps

### 1. Commit & Push Code

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Dashboard (Easiest)**
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import `anandaa-arch/MyCanteen`
4. Add environment variables
5. Click "Deploy"

**Option B: CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Environment Variables (Copy from .env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://vbjyqgfdjolgtdqblvpc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Add ALL THREE variables** in Vercel Dashboard

---

## After Deployment

### Update Supabase Redirect URLs

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your Vercel URL:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

---

## Test Your Deployment

✅ Landing page loads
✅ Login works (admin@test.com / admin123)
✅ Admin dashboard accessible
✅ User dashboard works
✅ Poll submission functional
✅ QR code generation working

---

## Troubleshooting

**Build Failed?**
- Check Vercel build logs
- Verify all dependencies in package.json
- Test locally: `npm run build`

**Login Not Working?**
- Update Supabase redirect URLs
- Clear browser cookies
- Check environment variables

**Database Errors?**
- Verify Supabase connection
- Check RLS policies
- Ensure tables exist

---

## 📖 Full Documentation

See `VERCEL_DEPLOYMENT_GUIDE.md` for complete instructions

---

## Support

- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
