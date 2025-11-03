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
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, partial, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint so we only have one bill per user per month
  UNIQUE(user_id, month, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_monthly_bills_user_id ON monthly_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_bills_status ON monthly_bills(status);
CREATE INDEX IF NOT EXISTS idx_monthly_bills_month_year ON monthly_bills(month, year);

-- Create payment_records table for tracking payments
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES monthly_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- cash, upi, card, bank_transfer
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  recorded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_records_bill_id ON payment_records(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
