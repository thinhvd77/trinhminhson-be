const { db } = require("../../shared/core/db");
const { notes } = require("./note.model");
const { eq, desc } = require("drizzle-orm");

class NoteRepository {
  async findAll() {
    return await db
      .select()
      .from(notes)
      .orderBy(desc(notes.createdAt));
  }

  async findById(id) {
    const result = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(noteData) {
    const result = await db
      .insert(notes)
      .values({
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async update(id, noteData) {
    const result = await db
      .update(notes)
      .set({
        ...noteData,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id) {
    const result = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteAll() {
    return await db.delete(notes);
  }
}

module.exports = new NoteRepository();
