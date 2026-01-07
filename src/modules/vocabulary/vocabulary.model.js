/**
 * Vocabulary Model - Drizzle Schema
 * Defines the database schema for vocabulary sets and flashcards
 */

const { pgTable, serial, text, varchar, integer, timestamp, boolean } = require("drizzle-orm/pg-core");
const { users } = require("../users/user.model");

// Vocabulary Sets table
const vocabularySets = pgTable("vocabulary_sets", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  defaultFace: integer("default_face").default(0),
  faceCount: integer("face_count").default(5),
  isShared: boolean("is_shared").default(false).notNull(),
  sharedAt: timestamp("shared_at"),
  clonedFromSetId: integer("cloned_from_set_id").references(() => vocabularySets.id, { onDelete: "set null" }),
  originalOwnerId: integer("original_owner_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Flashcards table
const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  setId: integer("set_id")
    .notNull()
    .references(() => vocabularySets.id, { onDelete: "cascade" }),
  face1: text("face_1"),
  face2: text("face_2"),
  face3: text("face_3"),
  face4: text("face_4"),
  face5: text("face_5"),
  face6: text("face_6"),
  face7: text("face_7"),
  face8: text("face_8"),
  face9: text("face_9"),
  face10: text("face_10"),
  learned: boolean("learned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

module.exports = {
  vocabularySets,
  flashcards,
};
