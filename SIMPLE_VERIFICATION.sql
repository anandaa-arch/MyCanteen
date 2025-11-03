-- SIMPLE VERIFICATION QUERIES
-- Run these one at a time to check migration success

-- CHECK 1: Do the new columns exist?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'poll_responses' 
  AND column_name IN ('attended_at', 'admin_notes')
ORDER BY column_name;

-- Expected: Should show 2 rows
-- attended_at | timestamp with time zone
-- admin_notes | text

-- ====================================

-- CHECK 2: What are the current status values in the table?
SELECT DISTINCT confirmation_status, COUNT(*) as count
FROM public.poll_responses
GROUP BY confirmation_status
ORDER BY count DESC;

-- Expected: All rows should have one of these values:
-- pending_customer_response
-- awaiting_admin_confirmation
-- confirmed_attended
-- no_show
-- rejected
-- cancelled

-- ====================================

-- CHECK 3: Do the indexes exist?
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'poll_responses' 
  AND indexname LIKE 'idx_poll_responses%';

-- Expected: Should show:
-- idx_poll_responses_user_id
-- idx_poll_responses_date
-- idx_poll_responses_user_date
-- idx_poll_responses_attended_at (NEW)
-- idx_poll_responses_confirmation_status (NEW)

-- ====================================

-- CHECK 4: View one complete record
SELECT * FROM public.poll_responses LIMIT 1;

-- Expected: All columns including attended_at and admin_notes should be present
