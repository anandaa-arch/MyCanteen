-- COPY EVERYTHING BELOW THIS LINE
-- Then paste into Supabase SQL Editor and click RUN

-- ┌─────────────────────────────────────────────────────────────┐
-- │                  FINAL 4 STEPS (Steps 4-7)                  │
-- │                                                               │
-- │ Step 4: Add Constraint (enforce 6 statuses)                 │
-- │ Step 5: Set Default (better defaults)                       │
-- │ Step 6: Create Indexes (performance)                        │
-- │ Step 7: Verify (confirm it worked)                          │
-- └─────────────────────────────────────────────────────────────┘

-- ════════════════════════════════════════════════════════════════
-- STEP 4: Add the new constraint
-- ════════════════════════════════════════════════════════════════

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
-- EXPECTED OUTPUT:
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
