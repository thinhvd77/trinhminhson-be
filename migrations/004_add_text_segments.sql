-- Add text_segments column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS text_segments JSONB;

-- Add index for JSONB column (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_notes_text_segments ON notes USING GIN (text_segments);
