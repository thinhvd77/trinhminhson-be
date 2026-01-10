-- Photo Categories Migration
-- Creates tables for hierarchical photo categorization

-- Main categories table (e.g., "Đối tượng", "Concept", "Phong cảnh")
CREATE TABLE IF NOT EXISTS photo_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table (e.g., "Nam", "Nữ" under "Đối tượng")
CREATE TABLE IF NOT EXISTS photo_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES photo_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, slug)
);

-- Junction table for many-to-many relationship between photos and subcategories
CREATE TABLE IF NOT EXISTS photo_subcategory_relations (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  subcategory_id INTEGER NOT NULL REFERENCES photo_subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(photo_id, subcategory_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_photo_subcategories_category_id ON photo_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_photo_subcategory_relations_photo_id ON photo_subcategory_relations(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_subcategory_relations_subcategory_id ON photo_subcategory_relations(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_photo_categories_display_order ON photo_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_photo_subcategories_display_order ON photo_subcategories(display_order);
