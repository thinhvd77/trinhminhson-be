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
    kanji: text("kanji").notNull(),
    meaning: text("meaning"),
    pronunciation: text("pronunciation"),
    sinoVietnamese: text("sino_vietnamese"),
    example: text("example"),
    learned: boolean("learned").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

module.exports = {
    vocabularySets,
    flashcards,
};
