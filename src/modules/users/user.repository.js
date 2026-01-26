const { db } = require("../../shared/core/db");
const { users } = require("./user.model");
const { eq, count, or, like, and, desc } = require("drizzle-orm");

class UserRepository {
  async findAll(limit = 10, offset = 0) {
    return await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
  }

  async findAllWithFilters({ limit = 10, offset = 0, search, role, status }) {
    const conditions = [];

    // Search by username, name, or email
    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    // Filter by role
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }

    // Filter by status
    if (status && status !== 'all') {
      conditions.push(eq(users.isActive, status === 'active'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
  }

  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async findByVerificationCode(code) {
    const result = await db.select().from(users).where(eq(users.verificationCode, code));
    return result[0] || null;
  }

  async findByPasswordResetToken(token) {
    const result = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return result[0] || null;
  }

  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async update(id, userData) {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0] || null;
  }

  async count() {
    const result = await db.select({ count: count() }).from(users);
    return Number(result[0]?.count) || 0;
  }

  async countWithFilters({ search, role, status }) {
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }

    if (status && status !== 'all') {
      conditions.push(eq(users.isActive, status === 'active'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    return Number(result[0]?.count) || 0;
  }

  async countAdmins() {
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));
    return Number(result[0]?.count) || 0;
  }
}

module.exports = { UserRepository };
