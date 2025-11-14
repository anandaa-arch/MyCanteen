-- 📋 CHECK CURRENT CONSTRAINTS - Run this to see what constraints exist

SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
WHERE c.conrelid = 'poll_responses'::regclass
  AND c.contype = 'u'
ORDER BY conname;

-- Expected result: You should see ONLY "poll_responses_unique_user_date_meal_slot"
-- If you see "poll_responses_user_id_date_key", that's the problem - run FIX_CONSTRAINT_NOW.sql
