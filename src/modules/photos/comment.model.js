/**
 * Photo Comment Model - Drizzle Schema
 * Defines the database schema for photo comments
 */

const { pgTable, serial, text, varchar, integer, timestamp, boolean } = require("drizzle-orm/pg-core");
const { photos } = require("./photo.model");
const { users } = require("../users/user.model");

// Photo comments table
const photoComments = pgTable("photo_comments", {
    id: serial("id").primaryKey(),
    photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
    parentId: integer("parent_id"),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    guestName: varchar("guest_name", { length: 100 }),
    guestToken: varchar("guest_token", { length: 64 }),
    content: text("content").notNull(),
    imageUrl: varchar("image_url", { length: 500 }),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
});

module.exports = {
    photoComments,
};
