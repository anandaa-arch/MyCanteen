-- 🔧 CREATE UPSERT FUNCTION FOR POLL RESPONSES

CREATE OR REPLACE FUNCTION upsert_poll_response(
  p_user_id UUID,
  p_date DATE,
  p_present BOOLEAN,
  p_portion_size TEXT,
  p_meal_slot meal_slot_type,
  p_confirmation_status TEXT
)
RETURNS SETOF poll_responses
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO poll_responses (user_id, date, present, portion_size, meal_slot, confirmation_status)
  VALUES (p_user_id, p_date, p_present, p_portion_size, p_meal_slot, p_confirmation_status)
  ON CONFLICT (user_id, date, meal_slot)
  DO UPDATE SET
    present = EXCLUDED.present,
    portion_size = EXCLUDED.portion_size,
    confirmation_status = EXCLUDED.confirmation_status,
    updated_at = NOW()
  RETURNING *;
END;
$$;

-- Test the function (optional)
-- SELECT * FROM upsert_poll_response(
--   'your-user-id'::UUID,
--   '2025-11-14'::DATE,
--   true,
--   'full',
--   'lunch'::meal_slot_type,
--   'pending_customer_response'
-- );

SELECT '✅ Function created! Now the app will use this function to submit polls.' AS status;
