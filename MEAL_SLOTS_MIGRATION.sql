-- Migration: Add meal slots (breakfast, lunch, dinner) support
-- This allows 3 separate meal polls per day instead of just 1

-- Step 1: Add meal_slot enum type
CREATE TYPE meal_slot_type AS ENUM ('breakfast', 'lunch', 'dinner');

-- Step 2: Add meal_slot column to polls table
ALTER TABLE polls ADD COLUMN meal_slot meal_slot_type DEFAULT 'lunch';
ALTER TABLE polls ADD COLUMN menu_details TEXT;
ALTER TABLE polls ADD COLUMN meal_time TIME; -- Expected meal time (e.g., 08:00 for breakfast)

-- Step 3: Add meal_slot column to poll_responses table
ALTER TABLE poll_responses ADD COLUMN meal_slot meal_slot_type DEFAULT 'lunch';
ALTER TABLE poll_responses ADD COLUMN actual_meal_time TIMESTAMPTZ; -- When they actually had the meal

-- Step 4: Update existing records to set default 'lunch' for all existing data
UPDATE polls SET meal_slot = 'lunch' WHERE meal_slot IS NULL;
UPDATE poll_responses SET meal_slot = 'lunch' WHERE meal_slot IS NULL;

-- Step 5: Make meal_slot NOT NULL now that defaults are set
ALTER TABLE polls ALTER COLUMN meal_slot SET NOT NULL;
ALTER TABLE poll_responses ALTER COLUMN meal_slot SET NOT NULL;

-- Step 6: Update unique constraints to include meal_slot
-- Drop old constraint (one poll per day)
ALTER TABLE polls DROP CONSTRAINT IF EXISTS polls_date_key;

-- Add new constraint (one poll per day per meal slot)
ALTER TABLE polls ADD CONSTRAINT polls_unique_date_meal_slot UNIQUE (date, meal_slot);

-- Step 7: Update poll_responses unique constraint
-- Drop old constraint (one response per user per day)
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_user_date_unique;

-- Add new constraint (one response per user per day per meal slot)
ALTER TABLE poll_responses ADD CONSTRAINT poll_responses_unique_user_date_meal_slot UNIQUE (user_id, date, meal_slot);

-- Step 8: Add comments explaining the new structure
COMMENT ON COLUMN polls.meal_slot IS 'Type of meal: breakfast, lunch, or dinner';
COMMENT ON COLUMN polls.menu_details IS 'Menu description for this specific meal slot';
COMMENT ON COLUMN polls.meal_time IS 'Expected serving time for this meal (e.g., 08:00 for breakfast)';
COMMENT ON COLUMN poll_responses.meal_slot IS 'Which meal slot this response is for';
COMMENT ON COLUMN poll_responses.actual_meal_time IS 'Actual timestamp when user had the meal (from QR scan)';

-- Step 9: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_polls_date_meal_slot ON polls(date, meal_slot);
CREATE INDEX IF NOT EXISTS idx_poll_responses_date_meal_slot ON poll_responses(date, meal_slot);
CREATE INDEX IF NOT EXISTS idx_poll_responses_user_meal_slot ON poll_responses(user_id, meal_slot, date);

-- Step 10: Update meal_payments to include meal_slot reference (optional but recommended)
ALTER TABLE meal_payments ADD COLUMN meal_slot meal_slot_type;
UPDATE meal_payments mp
SET meal_slot = pr.meal_slot
FROM poll_responses pr
WHERE mp.poll_response_id = pr.id;

-- Verification queries
SELECT 'Migration completed. Verifying structure...' AS status;

-- Check polls table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'polls' AND column_name IN ('meal_slot', 'menu_details', 'meal_time')
ORDER BY ordinal_position;

-- Check poll_responses table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'poll_responses' AND column_name IN ('meal_slot', 'actual_meal_time')
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('polls', 'poll_responses')
  AND constraint_name LIKE '%meal_slot%';
