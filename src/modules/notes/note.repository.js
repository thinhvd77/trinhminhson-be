const { db } = require("../../shared/core/db");
const { notes } = require("./note.model");
const { eq, desc, asc, max } = require("drizzle-orm");

class NoteRepository {
  async findAll() {
    return await db
      .select()
      .from(notes)
      .orderBy(desc(notes.displayOrder), desc(notes.createdAt));
  }

  async findById(id) {
    const result = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getMaxDisplayOrder() {
    const result = await db
      .select({ maxOrder: max(notes.displayOrder) })
      .from(notes);
    return result[0]?.maxOrder || 0;
  }

  async create(noteData) {
    // Get max display order and set new note at top
    const maxOrder = await this.getMaxDisplayOrder();
    const result = await db
      .insert(notes)
      .values({
        ...noteData,
        displayOrder: maxOrder + 1,
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

  async reorderNotes(noteIds) {
    // Update display order for each note based on position in array
    // Higher index = higher display order = appears on top
    const updates = noteIds.map((noteId, index) => 
      db
        .update(notes)
        .set({ 
          displayOrder: noteIds.length - index,
          updatedAt: new Date()
        })
        .where(eq(notes.id, noteId))
    );
    
    await Promise.all(updates);
    return await this.findAll();
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
