/**
 * Comment Reaction Repository
 * Database operations for comment reactions
 */

const { db } = require("../../shared/core/db");
const { commentReactions } = require("./commentReaction.model");
const { users } = require("../users/user.model");
const { eq, and, sql, inArray } = require("drizzle-orm");

class CommentReactionRepository {
    /**
     * Get all reactions for a comment with aggregated counts
     */
    async getReactionsByCommentId(commentId) {
        const reactions = await db
            .select({
                emoji: commentReactions.emoji,
                count: sql`COUNT(*)`.as("count"),
            })
            .from(commentReactions)
            .where(eq(commentReactions.commentId, commentId))
            .groupBy(commentReactions.emoji);

        return reactions;
    }

    /**
     * Get reactions for multiple comments (batch query)
     */
    async getReactionsByCommentIds(commentIds) {
        if (commentIds.length === 0) return [];

        const reactions = await db
            .select({
                commentId: commentReactions.commentId,
                emoji: commentReactions.emoji,
                count: sql`COUNT(*)`.as("count"),
            })
            .from(commentReactions)
            .where(inArray(commentReactions.commentId, commentIds))
            .groupBy(commentReactions.commentId, commentReactions.emoji);

        return reactions;
    }

    /**
     * Get user's reactions for a comment
     */
    async getUserReactions(commentId, userId) {
        const reactions = await db
            .select({
                emoji: commentReactions.emoji,
            })
            .from(commentReactions)
            .where(
                and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.userId, userId)
                )
            );

        return reactions.map((r) => r.emoji);
    }

    /**
     * Get guest's reactions for a comment
     */
    async getGuestReactions(commentId, guestToken) {
        const reactions = await db
            .select({
                emoji: commentReactions.emoji,
            })
            .from(commentReactions)
            .where(
                and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.guestToken, guestToken)
                )
            );

        return reactions.map((r) => r.emoji);
    }

    /**
     * Check if a user has reacted with a specific emoji
     */
    async findUserReaction(commentId, userId, emoji) {
        const [reaction] = await db
            .select()
            .from(commentReactions)
            .where(
                and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.userId, userId),
                    eq(commentReactions.emoji, emoji)
                )
            )
            .limit(1);

        return reaction;
    }

    /**
     * Check if a guest has reacted with a specific emoji
     */
    async findGuestReaction(commentId, guestToken, emoji) {
        const [reaction] = await db
            .select()
            .from(commentReactions)
            .where(
                and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.guestToken, guestToken),
                    eq(commentReactions.emoji, emoji)
                )
            )
            .limit(1);

        return reaction;
    }

    /**
     * Add a reaction
     */
    async createReaction(data) {
        const [reaction] = await db
            .insert(commentReactions)
            .values({
                commentId: data.commentId,
                userId: data.userId || null,
                guestToken: data.guestToken || null,
                emoji: data.emoji,
            })
            .returning();

        return reaction;
    }

    /**
     * Remove a reaction
     */
    async deleteReaction(id) {
        await db.delete(commentReactions).where(eq(commentReactions.id, id));
    }

    /**
     * Get users who reacted with a specific emoji
     */
    async getReactorsByEmoji(commentId, emoji) {
        const reactors = await db
            .select({
                userId: commentReactions.userId,
                guestToken: commentReactions.guestToken,
                userName: users.name,
            })
            .from(commentReactions)
            .leftJoin(users, eq(commentReactions.userId, users.id))
            .where(
                and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.emoji, emoji)
                )
            );

        return reactors;
    }
}

module.exports = { commentReactionRepository: new CommentReactionRepository() };
