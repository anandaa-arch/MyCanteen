-- CONSTRAINT ALREADY EXISTS - Run this instead
-- This skips Step 4 (constraint already there) and runs Steps 5-7

-- ════════════════════════════════════════════════════════════════
-- STEP 5: Update default value
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.poll_responses
ALTER COLUMN confirmation_status SET DEFAULT 'pending_customer_response';

-- ════════════════════════════════════════════════════════════════
-- STEP 6: Create indexes for better performance
-- ════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_poll_responses_attended_at 
ON public.poll_responses(attended_at);

CREATE INDEX IF NOT EXISTS idx_poll_responses_confirmation_status 
ON public.poll_responses(confirmation_status);

-- ════════════════════════════════════════════════════════════════
-- STEP 7: VERIFY THE MIGRATION WORKED
-- ════════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════════
-- EXPECTED OUTPUT (showing all 6 statuses):
-- ════════════════════════════════════════════════════════════════
-- 
-- check_type                          | count
-- ────────────────────────────────────┼──────
-- Status: awaiting_admin_confirmation | 0
-- Status: cancelled                   | 0
-- Status: confirmed_attended          | 3
-- Status: no_show                     | 0
-- Status: pending_customer_response   | 3
-- Status: rejected                    | 2
-- Total Records                       | 8
--
-- If you see this, MIGRATION IS COMPLETE! ✅
-- ════════════════════════════════════════════════════════════════
