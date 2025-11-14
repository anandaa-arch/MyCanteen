-- 📋 CHECK EXACT CONSTRAINT NAME

SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
WHERE c.conrelid = 'poll_responses'::regclass
  AND c.contype = 'u'
ORDER BY conname;

-- Copy the exact constraint name from the results and use it in the upsert
