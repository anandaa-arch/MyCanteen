-- FIXED MIGRATION SCRIPT
-- Run this if you got the constraint violation error
-- This properly migrates old data BEFORE applying the new constraint

-- Step 1: Add new columns (safe - IF NOT EXISTS)
ALTER TABLE public.poll_responses
ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Step 2: FIRST - Drop the old constraint (remove it temporarily)
ALTER TABLE public.poll_responses
DROP CONSTRAINT IF EXISTS poll_responses_confirmation_status_check;

-- Step 3: NOW migrate old status values to new ones
UPDATE public.poll_responses
SET confirmation_status = 
  CASE 
    WHEN confirmation_status = 'pending' THEN 'pending_customer_response'
    WHEN confirmation_status = 'confirmed' THEN 'confirmed_attended'
    WHEN confirmation_status = 'rejected' THEN 'rejected'
    ELSE 'pending_customer_response'
  END
WHERE confirmation_status NOT IN (
  'pending_customer_response',
  'awaiting_admin_confirmation', 
  'confirmed_attended',
  'no_show',
  'rejected',
  'cancelled'
);

-- Step 4: NOW add the new constraint (after all data is converted)
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

-- Step 6: Add indexes
CREATE INDEX IF NOT EXISTS idx_poll_responses_attended_at 
ON public.poll_responses(attended_at);

CREATE INDEX IF NOT EXISTS idx_poll_responses_confirmation_status 
ON public.poll_responses(confirmation_status);

-- Step 7: Verify the migration
SELECT 
  'Total Records' as check_type, 
  COUNT(*) as count 
FROM public.poll_responses

UNION ALL

SELECT 
  'Status: ' || confirmation_status as check_type,
  COUNT(*) as count
FROM public.poll_responses
GROUP BY confirmation_status;

-- If you see all records with valid statuses, migration was successful! ✅
