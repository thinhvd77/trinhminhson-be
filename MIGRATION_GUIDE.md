# Database Migration Guide - Posts Table Update

## Overview

The posts table has been updated to include additional fields required by the frontend:
- `excerpt` - Short description for preview
- `image` - Cover image URL
- `tags` - Comma-separated tags
- `read_time` - Estimated reading time

## Migration Steps

### Option 1: Fresh Database (Recommended for Development)

If you're starting fresh or can afford to lose existing data:

```bash
cd server

# 1. Drop existing tables (if any)
# Connect to your database and run:
# DROP TABLE IF EXISTS posts CASCADE;
# DROP TABLE IF EXISTS users CASCADE;

# 2. Generate new migration
pnpm db:generate

# 3. Run migration
pnpm db:migrate

# 4. Create admin user
pnpm create-admin

# 5. Restart server
pnpm dev
```

### Option 2: Migrate Existing Data

If you have existing posts you want to keep:

```bash
cd server

# 1. Generate migration
pnpm db:generate

# This will create an ALTER TABLE migration
# The migration will fail because new fields are NOT NULL

# 2. Manually update the migration file
# Location: drizzle/[timestamp]_*.sql
# Change the migration to:

ALTER TABLE posts ADD COLUMN excerpt text;
ALTER TABLE posts ADD COLUMN image text;
ALTER TABLE posts ADD COLUMN tags text;
ALTER TABLE posts ADD COLUMN read_time varchar(50);

-- Set default values for existing rows
UPDATE posts SET 
  excerpt = SUBSTRING(content, 1, 200) || '...',
  image = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
  tags = 'General',
  read_time = '5 phút đọc'
WHERE excerpt IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE posts ALTER COLUMN excerpt SET NOT NULL;
ALTER TABLE posts ALTER COLUMN image SET NOT NULL;
ALTER TABLE posts ALTER COLUMN tags SET NOT NULL;
ALTER TABLE posts ALTER COLUMN read_time SET NOT NULL;
ALTER TABLE posts ALTER COLUMN read_time SET DEFAULT '5 phút đọc';

# 3. Run migration
pnpm db:migrate

# 4. Restart server
pnpm dev
```

### Option 3: Using Drizzle Push (Development Only)

For quick development iterations:

```bash
cd server

# This will sync schema directly without migrations
pnpm db:push

# ⚠️ WARNING: This may lose data!
# Only use in development
```

## Verification

After migration, verify the schema:

```sql
-- Connect to your PostgreSQL database
\d posts

-- Should show:
-- Column     | Type          | Nullable | Default
-- -----------|---------------|----------|------------------
-- id         | integer       | not null | nextval('...')
-- title      | varchar(255)  | not null |
-- excerpt    | text          | not null |
-- content    | text          | not null |
-- image      | text          | not null |
-- slug       | varchar(255)  | not null |
-- tags       | text          | not null |
-- read_time  | varchar(50)   | not null | '5 phút đọc'
-- user_id    | integer       | not null |
-- created_at | timestamp     | not null | now()
-- updated_at | timestamp     | not null | now()
```

## Test Creating a Post

After migration, test the complete flow:

```bash
# 1. Create a user (if not exists)
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@blog.com",
    "name": "Test User",
    "password": "password123"
  }'

# 2. Create a post with all new fields
curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "excerpt": "This is a test post excerpt",
    "content": "<p>Full content here</p>",
    "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    "slug": "test-post",
    "tags": "Test, Tutorial",
    "readTime": "5 phút đọc",
    "userId": 1
  }'

# 3. Verify response includes all fields
curl http://localhost:4000/api/posts
```

## Frontend Testing

After backend migration:

```bash
cd client

# 1. Start frontend
pnpm dev

# 2. Login to admin
# Navigate to http://localhost:5173/login
# Email: admin@blog.com
# Password: admin123

# 3. Create a post via UI
# All fields should now be saved properly

# 4. View on blog page
# http://localhost:5173/blog
# Posts should display with images, excerpts, and tags
```

## Troubleshooting

### Error: "column does not exist"
```
Solution: Run migration again
cd server && pnpm db:migrate
```

### Error: "violates not-null constraint"
```
Solution: Use Option 2 (manual migration with default values)
```

### Error: "relation does not exist"
```
Solution: Drop and recreate tables (Option 1)
```

### Posts not showing in frontend
```
Check:
1. Backend returns all fields in API response
2. Frontend transforms data correctly
3. Browser console for errors
4. Network tab for API responses
```

## Rollback (Emergency)

If you need to rollback:

```sql
-- Remove new columns
ALTER TABLE posts DROP COLUMN excerpt;
ALTER TABLE posts DROP COLUMN image;
ALTER TABLE posts DROP COLUMN tags;
ALTER TABLE posts DROP COLUMN read_time;

-- Revert code changes
git checkout HEAD -- src/modules/posts/
```

## Summary

The posts model now matches the frontend requirements with all necessary fields for a complete blog experience. All existing functionality remains intact while adding support for rich post metadata.

---

**Last Updated:** 2025-12-08  
**Status:** ✅ Migration Required
