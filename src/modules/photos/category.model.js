/**
 * Photo Category Models - Drizzle Schema
 * Defines database schema for photo categories and subcategories
 */

const { pgTable, serial, varchar, integer, timestamp, boolean } = require("drizzle-orm/pg-core");
const { photos } = require("./photo.model");

// Photo categories table (parent categories)
const photoCategories = pgTable("photo_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Photo subcategories table
const photoSubcategories = pgTable("photo_subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => photoCategories.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Junction table for photo-subcategory relationships (many-to-many)
const photoSubcategoryRelations = pgTable("photo_subcategory_relations", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  subcategoryId: integer("subcategory_id").references(() => photoSubcategories.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

module.exports = {
  photoCategories,
  photoSubcategories,
  photoSubcategoryRelations,
};
