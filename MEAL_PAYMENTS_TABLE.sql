-- Create meal_payments table for individual meal payment tracking
-- This replaces the monthly_bills aggregation system

CREATE TABLE IF NOT EXISTS meal_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_response_id UUID NOT NULL REFERENCES poll_responses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles_new(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_method VARCHAR(50) DEFAULT 'cash',
  recorded_by UUID REFERENCES profiles_new(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups by user and poll_response
CREATE INDEX IF NOT EXISTS idx_meal_payments_user_id ON meal_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_payments_poll_response_id ON meal_payments(poll_response_id);
CREATE INDEX IF NOT EXISTS idx_meal_payments_payment_date ON meal_payments(payment_date);

-- Add unique constraint to prevent duplicate payments for the same meal
ALTER TABLE meal_payments ADD CONSTRAINT unique_meal_payment UNIQUE (poll_response_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_meal_payment ON meal_payments IS 'Prevents duplicate payments for the same meal - one payment per meal only';

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meal_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meal_payments_updated_at
  BEFORE UPDATE ON meal_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_payments_updated_at();

-- Grant permissions (adjust based on your RLS policies)
ALTER TABLE meal_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own meal payments
CREATE POLICY "Users can view their own meal payments"
  ON meal_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all meal payments
CREATE POLICY "Admins can view all meal payments"
  ON meal_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles_new
      WHERE profiles_new.id = auth.uid()
      AND profiles_new.role = 'admin'
    )
  );

-- Policy: Admins can insert meal payments
CREATE POLICY "Admins can insert meal payments"
  ON meal_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles_new
      WHERE profiles_new.id = auth.uid()
      AND profiles_new.role = 'admin'
    )
  );

-- Policy: Admins can update meal payments
CREATE POLICY "Admins can update meal payments"
  ON meal_payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles_new
      WHERE profiles_new.id = auth.uid()
      AND profiles_new.role = 'admin'
    )
  );

-- Verification query: Check if table was created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_payments'
ORDER BY ordinal_position;
