# 🚀 Quick Setup Guide for Test Data

## ⚠️ Before Running the Seeder

You need to set up your environment variables first!

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the root directory (`D:\MyCanteen\.env.local`) with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your MyCanteen project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` ⚠️ (Keep this secret!)

### Step 3: Run the Seeder

```bash
npm run seed
```

---

## 📋 What the Seeder Will Create

- ✅ **10 Test Users** (9 students + 1 admin)
  - Email: `student1@test.com` through `student9@test.com`
  - Email: `admin@test.com`
  - Password: `Test@123` (all users)

- ✅ **Poll Responses** for today, yesterday, and last week
- ✅ **Menu Items** for 3 days
- ✅ **Billing Records** (₹675 - ₹1080 in various states)
- ✅ **Inventory Items** (12 items)
- ✅ **Expenses** (6 records)
- ✅ **Revenue** (4 records)

---

## 🔍 Troubleshooting

### "Missing environment variables"
**Solution:** Create `.env.local` file with your Supabase credentials (see Step 1 above)

### "User already exists"
**Solution:** This is normal if you've run the seeder before. It will skip existing users.

### "Column does not exist" error
**Solution:** Make sure your database tables are created. Check Supabase Dashboard → Table Editor.

### Need to start fresh?
**Solution:** See cleanup SQL queries in `scripts/QUICK-REFERENCE.md`

---

## 📚 Additional Resources

- Full Documentation: `scripts/README.md`
- Quick Reference: `scripts/QUICK-REFERENCE.md`
- SQL Script (manual): `scripts/seed-test-data.sql`

---

## 🎯 After Setup

Once seeding is complete, you can:

1. **Login as Student:**
   ```
   Email: student1@test.com
   Password: Test@123
   ```

2. **Login as Admin:**
   ```
   Email: admin@test.com
   Password: Test@123
   ```

3. **Test Real-time Features:**
   - Open two browser tabs
   - Login as student in one, admin in another
   - Submit a poll as student
   - Watch it appear instantly on admin side ⚡

Happy coding! 🚀
