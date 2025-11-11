# Setup Billing Tables in Supabase

The billing system requires two tables that don't exist yet. Follow these steps to create them:

## Step 1: Go to Supabase SQL Editor

1. Open [Supabase Console](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **+ New Query**

## Step 2: Copy and Paste the SQL

Copy the entire SQL from below and paste it into the query editor:

```sql
-- Create monthly_bills table for storing generated bills
CREATE TABLE IF NOT EXISTS monthly_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  half_meal_count INTEGER NOT NULL DEFAULT 0,
  full_meal_count INTEGER NOT NULL DEFAULT 0,
  half_meal_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  full_meal_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  due_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Create payment_records table for tracking payments
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES monthly_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  recorded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_monthly_bills_user_id ON monthly_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_bills_status ON monthly_bills(status);
CREATE INDEX IF NOT EXISTS idx_monthly_bills_month_year ON monthly_bills(month, year);
CREATE INDEX IF NOT EXISTS idx_payment_records_bill_id ON payment_records(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
```

## Step 3: Run the Query

Click **Run** button (or press Ctrl+Enter)

You should see:
```
✅ Success. No rows returned
```

## Step 4: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see two new tables:
   - `monthly_bills`
   - `payment_records`

## Step 5: Test the Billing System

1. Go back to your app
2. **Refresh the page** (Ctrl+F5)
3. Go to **Admin Billing**
4. Click **"Generate Bills"**
5. Bills should now be generated! ✅

---

## What These Tables Do

### `monthly_bills`
- Stores monthly bills for each user
- One bill per user per month
- Tracks total amount, meal counts, and payment status

### `payment_records`
- Records individual payments made for bills
- Tracks payment method, date, and notes
- Links to bills via `bill_id`

---

## Need Help?

If you get an error:
- Check that you're logged into the correct Supabase project
- Make sure the SQL is copied exactly
- Try running queries one at a time if needed
