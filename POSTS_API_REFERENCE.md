# Posts API Reference

## Endpoints

### 1. Get All Posts
```http
GET /api/posts?page=1&limit=10&userId=1&search=keyword
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `userId` (optional) - Filter posts by author ID
- `search` (optional) - Search in title and content

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "content": "Post content...",
      "slug": "post-title",
      "userId": 1,
      "createdAt": "2025-12-08T07:00:00.000Z",
      "updatedAt": "2025-12-08T07:00:00.000Z",
      "author": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 2. Get Post by ID
```http
GET /api/posts/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "Post Title",
  "content": "Post content...",
  "slug": "post-title",
  "userId": 1,
  "createdAt": "2025-12-08T07:00:00.000Z",
  "updatedAt": "2025-12-08T07:00:00.000Z",
  "author": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 3. Get Post by Slug
```http
GET /api/posts/slug/:slug
```

**Example:**
```bash
curl http://localhost:4000/api/posts/slug/my-first-post
```

**Response:** Same as Get Post by ID

---

### 4. Create Post
```http
POST /api/posts
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my first post. It must be at least 10 characters long.",
  "slug": "my-first-post",
  "userId": 1
}
```

**Validation Rules:**
- `title`: 3-255 characters
- `content`: minimum 10 characters
- `slug`: 3-255 characters, lowercase alphanumeric with hyphens only (e.g., `my-first-post`)
- `userId`: must exist in users table

**Response:** 201 Created
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content...",
  "slug": "my-first-post",
  "userId": 1,
  "createdAt": "2025-12-08T07:00:00.000Z",
  "updatedAt": "2025-12-08T07:00:00.000Z",
  "author": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 5. Update Post
```http
PUT /api/posts/:id
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "slug": "updated-slug"
}
```

**Response:** 200 OK (same structure as create)

---

### 6. Delete Post
```http
DELETE /api/posts/:id
```

**Response:** 200 OK
```json
{
  "message": "Post deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters"
    }
  ]
}
```

### 404 Not Found
```json
{
  "message": "Post not found"
}
```

### 409 Conflict
```json
{
  "message": "Slug already exists"
}
```

---

## Slug Format

Valid slugs:
- ✅ `my-first-post`
- ✅ `hello-world-2024`
- ✅ `javascript-tutorial`

Invalid slugs:
- ❌ `My First Post` (uppercase, spaces)
- ❌ `my_first_post` (underscores)
- ❌ `hello--world` (double hyphens)
- ❌ `-my-post` (leading hyphen)

---

## Usage Examples

### Create a post
```bash
curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js",
    "content": "Node.js is a JavaScript runtime built on Chrome V8 engine...",
    "slug": "getting-started-nodejs",
    "userId": 1
  }'
```

### Get all posts by a specific user
```bash
curl "http://localhost:4000/api/posts?userId=1"
```

### Search posts
```bash
curl "http://localhost:4000/api/posts?search=nodejs"
```

### Get post by slug (SEO-friendly)
```bash
curl http://localhost:4000/api/posts/slug/getting-started-nodejs
```

### Update a post
```bash
curl -X PUT http://localhost:4000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js - Updated"
  }'
```

### Delete a post
```bash
curl -X DELETE http://localhost:4000/api/posts/1
```

---

## Notes

- Posts are automatically linked to their authors via `userId`
- Deleting a user will cascade delete all their posts
- Slugs must be unique across all posts
- All post queries include author information (JOIN with users table)
- Posts are ordered by creation date (newest first)
