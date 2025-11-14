# 🎯 COPY & PASTE THIS SQL INTO SUPABASE NOW

```sql
-- Add meal slots support (breakfast, lunch, dinner)
-- Step 1: Create enum type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE meal_slot_type AS ENUM ('breakfast', 'lunch', 'dinner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add columns to poll_responses table (this table exists)
ALTER TABLE poll_responses
  ADD COLUMN IF NOT EXISTS meal_slot meal_slot_type DEFAULT 'lunch',
  ADD COLUMN IF NOT EXISTS actual_meal_time TIMESTAMPTZ;

-- Step 3: Set existing data to 'lunch'
UPDATE poll_responses SET meal_slot = 'lunch' WHERE meal_slot IS NULL;

-- Step 4: Make meal_slot required
ALTER TABLE poll_responses ALTER COLUMN meal_slot SET NOT NULL;

-- Step 5: Update constraints (allow 3 responses per user per day - one per meal slot)
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_user_date_unique;
ALTER TABLE poll_responses ADD CONSTRAINT poll_responses_unique_user_date_meal_slot UNIQUE (user_id, date, meal_slot);

-- Step 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_poll_responses_date_meal_slot ON poll_responses(date, meal_slot);
CREATE INDEX IF NOT EXISTS idx_poll_responses_user_meal_slot ON poll_responses(user_id, meal_slot, date);

SELECT 'Done! 3 meal slots enabled.' AS status;
SELECT 'Your database now supports Breakfast, Lunch, and Dinner!' AS message;
```

**Note**: Your database doesn't have a `polls` table, only `poll_responses`. This is fine - the system works without a separate polls table. Run this corrected SQL!
