-- Migration: Add avatar field to users table

ALTER TABLE users
ADD COLUMN avatar VARCHAR(255);

COMMENT ON COLUMN users.avatar IS 'URL hoặc path đến ảnh avatar của user';
