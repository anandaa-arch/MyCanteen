-- Migration: Enhance poll_responses table with new confirmation workflow
-- Run this in Supabase SQL Editor to update your existing poll_responses table
-- Date: October 17, 2025

-- Step 1: Add new columns to poll_responses table
ALTER TABLE public.poll_responses
ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
DROP CONSTRAINT IF EXISTS poll_responses_confirmation_status_check,
ADD CONSTRAINT poll_responses_confirmation_status_check CHECK (
    confirmation_status IN (
        'pending_customer_response',    -- Waiting for customer to mark attended/not attending
        'awaiting_admin_confirmation',  -- Customer marked attended, waiting for admin to verify
        'confirmed_attended',           -- Admin confirmed they ate
        'no_show',                      -- Customer said yes but didn't come
        'rejected',                     -- Admin rejected the response
        'cancelled'                     -- Customer cancelled their response
    )
);

-- Step 2: Update existing records to use new status values
UPDATE public.poll_responses
SET confirmation_status = CASE
    WHEN confirmation_status = 'pending' THEN 'pending_customer_response'
    WHEN confirmation_status = 'confirmed' THEN 'confirmed_attended'
    WHEN confirmation_status = 'rejected' THEN 'rejected'
    ELSE 'pending_customer_response'
END
WHERE confirmation_status IN ('pending', 'confirmed', 'rejected');

-- Step 3: Update the default value for confirmation_status
ALTER TABLE public.poll_responses
ALTER COLUMN confirmation_status SET DEFAULT 'pending_customer_response';

-- Step 4: Add index for attended_at queries
CREATE INDEX IF NOT EXISTS idx_poll_responses_attended_at ON public.poll_responses(attended_at);

-- Step 5: Create index for admin confirmation lookups
CREATE INDEX IF NOT EXISTS idx_poll_responses_confirmation_status ON public.poll_responses(confirmation_status);

-- Step 6: Update the RLS policy to reflect new confirmation statuses
-- (Note: Policies should already exist, this ensures they work with new statuses)

COMMIT;

-- Verification queries:
-- 1. Check the updated table structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'poll_responses';

-- 2. Check the updated records:
-- SELECT id, user_id, date, confirmation_status, attended_at, confirmed_by, confirmed_at, admin_notes FROM public.poll_responses LIMIT 5;

-- 3. Check the constraint:
-- SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'poll_responses';
