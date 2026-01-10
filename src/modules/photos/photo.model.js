/**
 * Photo Model - Drizzle Schema
 * Defines the database schema for photos
 */

const { pgTable, serial, text, varchar, integer, timestamp, boolean } = require("drizzle-orm/pg-core");
const { users } = require("../users/user.model");

// Photos table
const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  alt: text("alt"),
  location: varchar("location", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  dateTaken: timestamp("date_taken"),
  aspectRatio: varchar("aspect_ratio", { length: 20 }).default("landscape"),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  isPublic: boolean("is_public").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

module.exports = {
  photos,
};
