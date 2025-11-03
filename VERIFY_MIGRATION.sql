-- Verification Queries for Poll Responses Migration
-- Run these AFTER executing RUN_THIS_IN_SUPABASE.sql

-- ===== CHECK 1: Table Structure =====
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'poll_responses'
ORDER BY ordinal_position;

-- Expected columns:
-- id, user_id, date, present, portion_size, attended_at (NEW), 
-- confirmation_status, confirmed_by, confirmed_at, admin_notes (NEW), 
-- created_at, updated_at

-- ===== CHECK 2: Data Migration Success =====
SELECT 
  confirmation_status, 
  COUNT(*) as count,
  MAX(updated_at) as last_updated
FROM public.poll_responses
GROUP BY confirmation_status
ORDER BY count DESC;

-- Expected results: Should show new status values like:
-- pending_customer_response
-- awaiting_admin_confirmation
-- confirmed_attended
-- rejected
-- cancelled

-- ===== CHECK 3: Sample Record =====
SELECT 
  id,
  user_id,
  date,
  present,
  portion_size,
  attended_at,
  confirmation_status,
  confirmed_by,
  confirmed_at,
  admin_notes,
  created_at,
  updated_at
FROM public.poll_responses 
LIMIT 1;

-- ===== CHECK 4: New Indexes Exist =====
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'poll_responses'
ORDER BY indexname;

-- Expected indexes:
-- idx_poll_responses_user_id (existing)
-- idx_poll_responses_date (existing)
-- idx_poll_responses_user_date (existing)
-- idx_poll_responses_attended_at (NEW)
-- idx_poll_responses_confirmation_status (NEW)

-- ===== CHECK 5: Constraints =====
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'poll_responses'
ORDER BY constraint_name;

-- Expected: poll_responses_confirmation_status_check with all 6 values

-- ===== CHECK 6: RLS Policies Still Intact =====
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'poll_responses'
ORDER BY policyname;

-- Expected: All 7 RLS policies still exist

-- ===== CHECK 7: Total Records =====
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT date) as unique_dates,
  COUNT(attended_at) as records_with_attended_at,
  COUNT(admin_notes) as records_with_admin_notes
FROM public.poll_responses;

-- ===== ALL CHECKS PASSED? =====
-- If all queries run without errors and show expected results:
-- ✅ Migration successful!
-- ✅ Ready to use new API endpoints
-- ✅ Ready to test UI changes
