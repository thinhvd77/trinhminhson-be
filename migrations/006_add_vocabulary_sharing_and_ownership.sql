-- Migration: Add ownership + sharing to vocabulary sets
-- Goals:
-- - Personal sets: owned by a user and private by default
-- - Community sets: explicitly shared (visible to guests)
--
-- NOTE: owner_id is nullable to preserve legacy data.
-- Existing sets (with owner_id IS NULL) are backfilled to shared=true so guests
-- can still see the previously-public vocabulary sets.

ALTER TABLE vocabulary_sets
  ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS cloned_from_set_id INTEGER REFERENCES vocabulary_sets(id) ON DELETE SET NULL;

-- Preserve existing behavior: legacy sets become community-visible
UPDATE vocabulary_sets
SET is_shared = TRUE,
    shared_at = COALESCE(shared_at, NOW())
WHERE owner_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_vocabulary_sets_owner_id ON vocabulary_sets(owner_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_sets_is_shared ON vocabulary_sets(is_shared);
CREATE INDEX IF NOT EXISTS idx_vocabulary_sets_cloned_from ON vocabulary_sets(cloned_from_set_id);
