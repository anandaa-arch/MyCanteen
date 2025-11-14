-- 🔧 FIX THE CONSTRAINT ISSUE - Run this in Supabase SQL Editor
-- The new constraint already exists, we just need to remove the old one

-- Drop the old constraint (the one causing the error)
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_user_id_date_key;

-- Also drop any other old constraint variations
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_user_date_unique;

-- Verify the fix - check which constraints exist now
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
WHERE c.conrelid = 'poll_responses'::regclass
  AND c.contype = 'u'
ORDER BY conname;

SELECT '✅ Constraint fixed! You can now submit breakfast, lunch, and dinner separately.' AS status;
