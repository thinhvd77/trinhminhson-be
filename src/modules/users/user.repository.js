const { db } = require("../../shared/core/db");
const { users } = require("./user.model");
const { eq, count } = require("drizzle-orm");

class UserRepository {
  async findAll(limit = 10, offset = 0) {
    return await db.select().from(users).limit(limit).offset(offset);
  }

  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
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
}

module.exports = { UserRepository };
