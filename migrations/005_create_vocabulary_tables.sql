-- Migration: Create vocabulary tables for PostgreSQL
-- Run this migration to add vocabulary/flashcard tables

CREATE TABLE IF NOT EXISTS vocabulary_sets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  default_face INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  set_id INTEGER NOT NULL REFERENCES vocabulary_sets(id) ON DELETE CASCADE,
  kanji TEXT NOT NULL,
  meaning TEXT,
  pronunciation TEXT,
  sino_vietnamese TEXT,
  example TEXT,
  learned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flashcards_set_id ON flashcards(set_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_learned ON flashcards(learned);
