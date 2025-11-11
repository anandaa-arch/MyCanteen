-- ============================================================
-- MyCanteen Test Data Seed Script (Simplified Version)
-- ============================================================
-- Run this in your Supabase SQL Editor to populate test data
-- WARNING: This will add test data to your database
--
-- IMPORTANT: This script is designed to work with the Node.js seeder.
-- For best results, use: npm run seed
--
-- If running this SQL manually:
-- 1. First create auth users in Supabase Dashboard > Authentication
-- 2. Replace the UUIDs below with actual auth user IDs
-- 3. Then run this script
-- ============================================================

-- Note: profiles_new inserts are handled by the Node.js seeder
-- which creates both auth users and profiles automatically

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. This SQL script requires manual UUID replacement
-- 2. For automated seeding, use: npm run seed
-- 3. The Node.js seeder is RECOMMENDED as it handles:
--    - Auth user creation
--    - Profile creation
--    - Automatic UUID management
--    - Error handling
--
-- ============================================
-- To use this SQL script manually:
-- ============================================
-- Step 1: Create users in Supabase Dashboard
-- Step 2: Get their UUIDs from auth.users table
-- Step 3: Replace 'user-uuid-X' and 'admin-uuid-1' below
-- Step 4: Run this entire script
-- ============================================

BEGIN;

-- Since tables may not all exist, we'll comment out sections
-- Uncomment only the sections for tables that exist in your database

/*
-- EXAMPLE: If you have auth users with these IDs, uncomment and update:
-- ============================================
-- 1. CREATE TEST USER PROFILES
-- ============================================
INSERT INTO profiles_new (id, email, full_name, contact_number, role, dept, year, created_at)
VALUES 
  ('YOUR-ACTUAL-UUID-HERE', 'student1@test.com', 'Rahul Sharma', '9876543210', 'user', 'CS', 'TE', NOW())
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- 2. RECOMMENDED: USE NODE.JS SEEDER INSTEAD
-- ============================================
-- Run this command for automatic setup:
--   npm run seed
--
-- The Node.js seeder will:
-- ✅ Create auth users automatically
-- ✅ Create profiles with correct UUIDs
-- ✅ Insert all test data
-- ✅ Handle errors gracefully
-- ============================================

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- After running npm run seed, verify data with these queries:

-- Check users by role
SELECT role, COUNT(*) as count FROM profiles_new GROUP BY role;

-- Check today's poll responses
SELECT confirmation_status, COUNT(*) as count 
FROM poll_responses 
WHERE date = CURRENT_DATE 
GROUP BY confirmation_status;

-- Check billing summary
SELECT payment_status, COUNT(*) as count, SUM(total_amount) as total
FROM monthly_bills 
WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND year = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY payment_status;

-- Check inventory by category
SELECT category, COUNT(*) as items, SUM(current_stock) as stock
FROM inventory_items
GROUP BY category;

-- Check this month's expenses
SELECT category, SUM(amount) as total
FROM expenses
WHERE incurred_on >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category
ORDER BY total DESC;
