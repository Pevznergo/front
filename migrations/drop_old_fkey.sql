-- Drop obsolete foreign key constraint from user_prizes table
-- This constraint references the old app_users table which has been replaced by the User table

-- First, check if the constraint exists
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name = 'user_prizes_telegram_id_fkey';

-- Drop the constraint (safe - uses IF EXISTS)
ALTER TABLE user_prizes DROP CONSTRAINT IF EXISTS user_prizes_telegram_id_fkey;

-- Verify it's gone
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name = 'user_prizes_telegram_id_fkey';

-- Expected result: No rows (constraint removed)
