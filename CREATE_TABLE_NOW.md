# 🚨 URGENT: Create meal_payments Table

## Error You're Seeing:
```
Could not find the table 'public.meal_payments' in the schema cache
```

## ⚡ Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your MyCanteen project
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy the SQL Script
Open this file in your project:
```
MEAL_PAYMENTS_TABLE.sql
```

Copy the ENTIRE contents (all 96 lines)

### Step 3: Run in Supabase
1. In SQL Editor, click **"New query"**
2. Paste the entire SQL script
3. Click **"Run"** (or press Cmd/Ctrl + Enter)
4. Wait for: **"Success. No rows returned"**

### Step 4: Verify Table Created
Run this verification query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'meal_payments';
```

Should return:
```
table_name
meal_payments
```

### Step 5: Test Again
1. Go back to your app
2. Admin → Billing → Click "Add Payment" for Test User
3. Enter amount: ₹165 (to pay all 3 meals)
4. Click "Record Payment"
5. Go to User → Billing page
6. Should now show meals as PAID ✓

## 🎯 What This Table Does

Creates the `meal_payments` table with:
- Link to each individual meal (poll_response_id)
- User who paid
- Amount, date, method
- **UNIQUE constraint**: Only ONE payment per meal
- Row Level Security policies for user/admin access

## ⚠️ Why This Is Required

The new billing system tracks payments per meal, not per month:
- OLD: Monthly aggregation (allows duplicate payments)
- NEW: Individual meal tracking (prevents duplicates)

Without this table, the app can't store or retrieve payment status for individual meals.

## 🔍 Troubleshooting

### If you get "permission denied":
Make sure you're using the Supabase SQL Editor with admin privileges (not running from app code).

### If unique constraint error:
The table already exists! Check with:
```sql
\dt meal_payments
```

### If foreign key errors:
Make sure `poll_responses` and `profiles_new` tables exist first.

---

**After creating the table, your payments will work immediately!** 🚀
