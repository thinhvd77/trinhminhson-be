-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' NOT NULL;

-- Update existing users without role to 'member'
UPDATE users SET role = 'member' WHERE role IS NULL;
