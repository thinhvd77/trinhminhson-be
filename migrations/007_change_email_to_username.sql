-- Migration: Change email to username
-- This migration updates the users table to use username instead of email

-- Step 1: Add username column
ALTER TABLE users ADD COLUMN username VARCHAR(255);

-- Step 2: Copy email data to username (temporary, for existing users)
UPDATE users SET username = email;

-- Step 3: Make username NOT NULL and UNIQUE
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX users_username_unique ON users(username);

-- Step 4: Drop email column
ALTER TABLE users DROP COLUMN email;
