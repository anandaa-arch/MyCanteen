-- IMMEDIATE ACTION REQUIRED
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This adds the new columns to your existing poll_responses table

-- Step 1: Add new columns
ALTER TABLE public.poll_responses
ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Step 2: Migrate existing data from old status values to new ones
-- This converts old data to new status format
UPDATE public.poll_responses
SET confirmation_status = 
  CASE 
    WHEN confirmation_status = 'pending' THEN 'pending_customer_response'
    WHEN confirmation_status = 'confirmed' THEN 'confirmed_attended'
    WHEN confirmation_status = 'rejected' THEN 'rejected'
    ELSE 'pending_customer_response'
  END
WHERE confirmation_status IN ('pending', 'confirmed', 'rejected');

-- Step 3: Drop the old constraint before adding new one
ALTER TABLE public.poll_responses
DROP CONSTRAINT IF EXISTS poll_responses_confirmation_status_check;

-- Step 4: Add new constraint with all 6 statuses
ALTER TABLE public.poll_responses
ADD CONSTRAINT poll_responses_confirmation_status_check CHECK (
    confirmation_status IN (
        'pending_customer_response',
        'awaiting_admin_confirmation',
        'confirmed_attended',
        'no_show',
        'rejected',
        'cancelled'
    )
);

-- Step 5: Update default value
ALTER TABLE public.poll_responses
ALTER COLUMN confirmation_status SET DEFAULT 'pending_customer_response';

-- Step 6: Add new indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_poll_responses_attended_at 
ON public.poll_responses(attended_at);

CREATE INDEX IF NOT EXISTS idx_poll_responses_confirmation_status 
ON public.poll_responses(confirmation_status);

-- DONE! Verify with these queries:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'poll_responses' ORDER BY ordinal_position;
-- SELECT COUNT(*) as total, confirmation_status FROM public.poll_responses GROUP BY confirmation_status;
