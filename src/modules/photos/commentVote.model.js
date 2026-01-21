/**
 * Comment Vote Model - Drizzle Schema
 * Defines the database schema for comment likes/dislikes
 */

const { pgTable, serial, varchar, integer, timestamp, unique, index } = require("drizzle-orm/pg-core");
const { photoComments } = require("./comment.model");
const { users } = require("../users/user.model");

// Allowed vote types
const VOTE_TYPES = ["like", "dislike"];

// Comment votes table
const commentVotes = pgTable("comment_votes", {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id").references(() => photoComments.id, { onDelete: "cascade" }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestToken: varchar("guest_token", { length: 64 }),
    voteType: varchar("vote_type", { length: 10 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    // Each user can only vote once per comment
    uniqueUserVote: unique().on(table.commentId, table.userId),
    // Each guest can only vote once per comment
    uniqueGuestVote: unique().on(table.commentId, table.guestToken),
    // Indexes for faster lookups
    commentIdIdx: index("comment_votes_comment_id_idx").on(table.commentId),
    userIdIdx: index("comment_votes_user_id_idx").on(table.userId),
    guestTokenIdx: index("comment_votes_guest_token_idx").on(table.guestToken),
}));

module.exports = {
    commentVotes,
    VOTE_TYPES,
};
