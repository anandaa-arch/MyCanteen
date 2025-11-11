-- COMPLETE THE MIGRATION - Run this next!
-- You've done Steps 1-3, now run Steps 4-7

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

-- Step 7: Verify the migration - RUN THIS TO SEE THE COUNT
SELECT 
  'Total Records' as check_type, 
  COUNT(*) as count 
FROM public.poll_responses

UNION ALL

SELECT 
  'Status: ' || confirmation_status as check_type,
  COUNT(*) as count
FROM public.poll_responses
GROUP BY confirmation_status
ORDER BY check_type;

-- You should now see output like:
-- check_type                                 | count
-- ─────────────────────────────────────────┼───────
-- Status: awaiting_admin_confirmation      | 0
-- Status: cancelled                        | 0
-- Status: confirmed_attended               | 3
-- Status: no_show                          | 0
-- Status: pending_customer_response        | some
-- Status: rejected                         | 2
-- Total Records                            | 5
