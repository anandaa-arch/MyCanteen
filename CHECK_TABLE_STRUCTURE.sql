-- 📋 CHECK POLL_RESPONSES TABLE STRUCTURE

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'poll_responses'
ORDER BY ordinal_position;

-- You should see columns: id, user_id, date, present, portion_size, meal_slot, actual_meal_time, confirmation_status, created_at, updated_at
