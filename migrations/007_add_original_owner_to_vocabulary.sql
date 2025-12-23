-- Migration: Add original_owner_id to vocabulary_sets
-- This allows tracking the original author when a set is cloned from community

ALTER TABLE vocabulary_sets
ADD COLUMN original_owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN vocabulary_sets.original_owner_id IS 'ID của tác giả gốc khi bộ từ vựng được clone từ cộng đồng';
