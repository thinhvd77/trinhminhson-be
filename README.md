# Express API with PostgreSQL and Drizzle ORM

A feature-based Express.js API using PostgreSQL database and Drizzle ORM.

## Project Structure

```
my-express-api/
├── .env                    # Environment variables
├── .gitignore
├── package.json
├── drizzle.config.js       # Drizzle ORM configuration
├── README.md
├── src/
│   ├── app.js              # Express App setup
│   ├── server.js           # Entry point
│   ├── routes.js           # Central route aggregator
│   │
│   ├── shared/             # Shared resources
│   │   ├── config/         # Configuration files
│   │   │   ├── env.js
│   │   │   └── logger.js
│   │   ├── core/           # Core functionality
│   │   │   └── db.js       # Database connection
│   │   ├── middlewares/    # Global middlewares
│   │   │   ├── error.middleware.js
│   │   │   └── request-logger.js
│   │   └── utils/          # Utility functions
│   │       ├── apiResponse.js
│   │       └── logger.js
│   │
│   └── modules/            # Feature modules
│       ├── health/         # Health check feature
│       │   ├── health.controller.js
│       │   ├── health.service.js
│       │   └── health.routes.js
│       │
│       └── users/          # Users feature
│           ├── user.model.js       # Database schema
│           ├── user.repository.js  # Data access layer
│           ├── user.service.js     # Business logic
│           ├── user.controller.js  # HTTP handlers
│           ├── user.routes.js      # Route definitions
│           └── user.dtos.js        # Validation schemas
```

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```

   Update the `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   ```

3. **Generate and run migrations:**
   ```bash
   # Generate migration files
   pnpm db:generate

   # Apply migrations to database
   pnpm db:migrate
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   pnpm dev

   # Production mode
   pnpm start
   ```

## Available Scripts

- `pnpm dev` - Start development server with nodemon
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate migration files from schema
- `pnpm db:migrate` - Apply migrations to database
- `pnpm db:push` - Push schema changes directly (dev only)
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

## API Endpoints

### Health Check
- `GET /api/health` - Check API health status

### Users
- `GET /api/users` - Get all users (with pagination)
  - Query params: `page` (default: 1), `limit` (default: 10)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
  - Body: `{ email, name, password }`
- `PUT /api/users/:id` - Update user
  - Body: `{ email?, name?, password?, isActive? }`
- `DELETE /api/users/:id` - Delete user

### Posts
- `GET /api/posts` - Get all posts (with pagination & filters)
  - Query params: `page` (default: 1), `limit` (default: 10), `userId` (optional), `search` (optional)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create new post
  - Body: `{ title, content, slug, userId }`
- `PUT /api/posts/:id` - Update post
  - Body: `{ title?, content?, slug? }`
- `DELETE /api/posts/:id` - Delete post

## Tech Stack

- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Password Hashing:** bcrypt
- **Logging:** Morgan

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Development

### Adding a New Feature Module

1. Create a new folder in `src/modules/`
2. Add the following files:
   - `<feature>.model.js` - Database schema
   - `<feature>.repository.js` - Data access
   - `<feature>.service.js` - Business logic
   - `<feature>.controller.js` - HTTP handlers
   - `<feature>.routes.js` - Route definitions
   - `<feature>.dtos.js` - Validation schemas (optional)

3. Register routes in `src/routes.js`

### Database Migrations

After modifying schema files:
```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate
```

## License

MIT
