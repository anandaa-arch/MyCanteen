-- 📋 CHECK IF FUNCTION EXISTS

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'upsert_poll_response'
  AND routine_schema = 'public';

-- If this returns a row, the function exists
-- If no rows, you need to run CREATE_UPSERT_FUNCTION.sql
