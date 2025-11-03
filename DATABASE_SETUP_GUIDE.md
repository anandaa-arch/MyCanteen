# 🔧 Database Setup Guide - URGENT FIX

## ❌ **Current Issue:**
```
Error: "Could not find the table 'public.expenses' in the schema cache"
Status: 500 Internal Server Error
```

**Cause:** Required database tables don't exist in your Supabase database.

---

## ✅ **Quick Fix (5 minutes)**

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your **MyCanteen** project
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Create Tables
1. Click **"New Query"** button
2. Open the file: `DATABASE_SCHEMA.sql` in your project
3. **Copy ALL the SQL code** (it's ready to use!)
4. **Paste** into the SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Tables Created
1. Go to **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ `expenses`
   - ✅ `inventory_items`
   - ✅ `inventory_logs`
   - ✅ `revenues`
   - ✅ `reminders`
   - ✅ `transactions`
   - ✅ `profiles_new` (should already exist)

### Step 4: Restart Your App
```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

### Step 5: Test Again
Open browser console and run:
```javascript
fetch('http://localhost:3001/api/expenses')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected Result:** 
- ✅ `{"error":"Unauthorized - Please login"}` (401)
- ❌ NOT: 500 Internal Server Error

---

## 📋 **What Gets Created:**

### 1. **expenses** Table
```sql
- id (UUID)
- category (TEXT) - e.g., "Food", "Utilities"
- description (TEXT)
- amount (DECIMAL) - Must be positive
- vendor (TEXT)
- incurred_on (DATE)
- created_at, updated_at (TIMESTAMPTZ)
```

### 2. **inventory_items** Table
```sql
- id (UUID)
- name (TEXT) - Item name
- category (TEXT) - Item category
- unit (TEXT) - "kg", "pcs", "liter"
- unit_price (DECIMAL)
- selling_price (DECIMAL)
- current_stock (INTEGER)
- supplier (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

### 3. **inventory_logs** Table
```sql
- id (UUID)
- item_id (UUID) - Foreign key to inventory_items
- type (TEXT) - "in" or "out"
- quantity (INTEGER)
- total_amount (DECIMAL)
- note (TEXT)
- logged_at (TIMESTAMPTZ)
```

### 4. **revenues** Table
```sql
- id (UUID)
- item_id (UUID) - Foreign key to inventory_items
- quantity (INTEGER)
- unit_price (DECIMAL)
- total (DECIMAL)
- sold_at (TIMESTAMPTZ)
```

### 5. **reminders** Table
```sql
- id (UUID)
- name (TEXT)
- item_id (UUID) - Optional, foreign key
- description (TEXT)
- recurrence (TEXT) - "daily", "weekly", "monthly", "yearly"
- next_due_date (DATE)
- created_at, updated_at (TIMESTAMPTZ)
```

### 6. **transactions** Table
```sql
- id (UUID)
- user_id (UUID) - Foreign key to auth.users
- amount (DECIMAL)
- type (TEXT) - "debit" or "credit"
- description (TEXT)
- created_at (TIMESTAMPTZ)
```

---

## 🔒 **Security Features Included:**

1. **Row Level Security (RLS)** enabled on all tables
2. **Admin-only policies** on inventory tables
3. **User + Admin policies** on transactions
4. **Foreign key constraints** for data integrity
5. **Check constraints** for data validation
6. **Automatic triggers** for:
   - Stock updates when logs are created
   - Timestamp updates when records change

---

## 📊 **Sample Data Included:**

The schema includes sample inventory items:
- Rice (100 kg in stock)
- Dal (50 kg in stock)
- Oil (20 liters in stock)
- Onions (25 kg in stock)
- Potatoes (30 kg in stock)

This helps you test immediately!

---

## ✅ **Verification Checklist:**

After running the SQL:
- [ ] All 6 tables visible in Table Editor
- [ ] Sample data appears in `inventory_items`
- [ ] Server restarts without errors
- [ ] API test returns 401 (not 500)
- [ ] Can proceed with authentication testing

---

## 🐛 **Troubleshooting:**

### Issue: "permission denied for table"
**Fix:** Make sure you're using the **service_role** key in your `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Issue: "relation already exists"
**Fix:** Tables might already exist. Check Table Editor or run:
```sql
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
-- etc...
```
Then run the schema again.

### Issue: SQL syntax error
**Fix:** Make sure you copied the ENTIRE SQL file, from the first line to the last.

### Issue: Still getting 500 error
**Fix:** 
1. Check Supabase logs (Logs section in dashboard)
2. Verify RLS policies are correct
3. Make sure `profiles_new` table exists with admin users
4. Restart your dev server

---

## 🎯 **After Setup:**

Once tables are created:
1. ✅ Continue with authentication testing
2. ✅ Test admin APIs with admin login
3. ✅ Test user restrictions
4. ✅ Test input validation
5. ✅ Proceed to production deployment

---

## 📞 **Still Having Issues?**

Check:
1. Supabase project is active
2. Database is not paused
3. Environment variables are correct
4. Service role key is valid
5. Network connection is stable

---

**Status:** ⏳ WAITING FOR DATABASE SETUP  
**Next Step:** Run `DATABASE_SCHEMA.sql` in Supabase  
**Time Required:** ~5 minutes  
**Priority:** 🔴 CRITICAL - Required for testing
