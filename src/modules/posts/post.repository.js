const { db } = require("../../shared/core/db");
const { posts } = require("./post.model");
const { users } = require("../users/user.model");
const { eq, desc, and, or, ilike, count } = require("drizzle-orm");

class PostRepository {
  async findAll(limit = 10, offset = 0, filters = {}) {
    let query = db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
        image: posts.image,
        slug: posts.slug,
        tags: posts.tags,
        readTime: posts.readTime,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    if (filters.userId) {
      query = query.where(eq(posts.userId, filters.userId));
    }

    if (filters.search) {
      query = query.where(
        or(
          ilike(posts.title, `%${filters.search}%`),
          ilike(posts.content, `%${filters.search}%`)
        )
      );
    }

    return await query.limit(limit).offset(offset);
  }

  async findById(id) {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
        image: posts.image,
        slug: posts.slug,
        tags: posts.tags,
        readTime: posts.readTime,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));
    
    return result[0] || null;
  }

  async findBySlug(slug) {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
        image: posts.image,
        slug: posts.slug,
        tags: posts.tags,
        readTime: posts.readTime,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.slug, slug));
    
    return result[0] || null;
  }

  async create(postData) {
    const result = await db.insert(posts).values(postData).returning();
    return result[0];
  }

  async update(id, postData) {
    const result = await db
      .update(posts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result[0] || null;
  }

  async count(filters = {}) {
    let query = db.select({ count: count() }).from(posts);

    if (filters.userId) {
      query = query.where(eq(posts.userId, filters.userId));
    }

    if (filters.search) {
      query = query.where(
        or(
          ilike(posts.title, `%${filters.search}%`),
          ilike(posts.content, `%${filters.search}%`)
        )
      );
    }

    const result = await query;
    return Number(result[0]?.count) || 0;
  }

  async existsBySlug(slug, excludeId = null) {
    let query = db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
    
    if (excludeId) {
      query = query.where(and(eq(posts.slug, slug), eq(posts.id, excludeId)));
    }

    const result = await query;
    return result.length > 0;
  }
}

module.exports = { PostRepository };
