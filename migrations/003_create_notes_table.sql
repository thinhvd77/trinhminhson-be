-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#FEF3C7',
  text_color VARCHAR(20) NOT NULL DEFAULT '#1F2937',
  font_family VARCHAR(100) NOT NULL DEFAULT '''Work Sans'', sans-serif',
  font_weight VARCHAR(10) NOT NULL DEFAULT '400',
  font_size VARCHAR(10) NOT NULL DEFAULT '14px',
  x DOUBLE PRECISION NOT NULL DEFAULT 100,
  y DOUBLE PRECISION NOT NULL DEFAULT 100,
  rotation DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
