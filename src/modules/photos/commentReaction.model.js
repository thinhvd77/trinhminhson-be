/**
 * Comment Reaction Model - Drizzle Schema
 * Defines the database schema for comment reactions
 */

const { pgTable, serial, varchar, integer, timestamp, unique } = require("drizzle-orm/pg-core");
const { photoComments } = require("./comment.model");
const { users } = require("../users/user.model");

// Allowed reaction emojis
const ALLOWED_REACTIONS = ["😘", "☺️", "😌", "😴", "🤢", "🤣", "🥹", "😡", "🤐", "😭"];

// Comment reactions table
const commentReactions = pgTable("comment_reactions", {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id").references(() => photoComments.id, { onDelete: "cascade" }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestToken: varchar("guest_token", { length: 64 }),
    emoji: varchar("emoji", { length: 10 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    // Each user/guest can only react once per comment with the same emoji
    uniqueUserReaction: unique().on(table.commentId, table.userId, table.emoji),
    uniqueGuestReaction: unique().on(table.commentId, table.guestToken, table.emoji),
}));

module.exports = {
    commentReactions,
    ALLOWED_REACTIONS,
};
