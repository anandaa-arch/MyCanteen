-- 🔧 ADD MEAL_SLOT COLUMN IF IT DOESN'T EXIST

-- First, create the enum type if needed
DO $$ BEGIN
  CREATE TYPE meal_slot_type AS ENUM ('breakfast', 'lunch', 'dinner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add meal_slot column if it doesn't exist
ALTER TABLE poll_responses
  ADD COLUMN IF NOT EXISTS meal_slot meal_slot_type DEFAULT 'lunch';

-- Add actual_meal_time column if it doesn't exist
ALTER TABLE poll_responses
  ADD COLUMN IF NOT EXISTS actual_meal_time TIMESTAMPTZ;

-- Make meal_slot NOT NULL
ALTER TABLE poll_responses ALTER COLUMN meal_slot SET NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'poll_responses' 
  AND column_name IN ('meal_slot', 'actual_meal_time')
ORDER BY column_name;

SELECT '✅ Columns verified!' AS status;
