/**
 * Comment Vote Repository
 * Database operations for comment votes (like/dislike)
 */

const { db } = require("../../shared/core/db");
const { commentVotes } = require("./commentVote.model");
const { eq, and, sql, inArray } = require("drizzle-orm");

class CommentVoteRepository {
    /**
     * Get vote counts for a comment
     */
    async getVotesByCommentId(commentId) {
        const votes = await db
            .select({
                voteType: commentVotes.voteType,
                count: sql`COUNT(*)`.as("count"),
            })
            .from(commentVotes)
            .where(eq(commentVotes.commentId, commentId))
            .groupBy(commentVotes.voteType);

        return votes;
    }

    /**
     * Get votes for multiple comments (batch query)
     */
    async getVotesByCommentIds(commentIds) {
        if (commentIds.length === 0) return [];

        const votes = await db
            .select({
                commentId: commentVotes.commentId,
                voteType: commentVotes.voteType,
                count: sql`COUNT(*)`.as("count"),
            })
            .from(commentVotes)
            .where(inArray(commentVotes.commentId, commentIds))
            .groupBy(commentVotes.commentId, commentVotes.voteType);

        return votes;
    }

    /**
     * Get user's vote for a comment
     */
    async getUserVote(commentId, userId) {
        const [vote] = await db
            .select({
                voteType: commentVotes.voteType,
            })
            .from(commentVotes)
            .where(
                and(
                    eq(commentVotes.commentId, commentId),
                    eq(commentVotes.userId, userId)
                )
            )
            .limit(1);

        return vote?.voteType || null;
    }

    /**
     * Get guest's vote for a comment
     */
    async getGuestVote(commentId, guestToken) {
        const [vote] = await db
            .select({
                voteType: commentVotes.voteType,
            })
            .from(commentVotes)
            .where(
                and(
                    eq(commentVotes.commentId, commentId),
                    eq(commentVotes.guestToken, guestToken)
                )
            )
            .limit(1);

        return vote?.voteType || null;
    }

    /**
     * Find user's existing vote
     */
    async findUserVote(commentId, userId) {
        const [vote] = await db
            .select()
            .from(commentVotes)
            .where(
                and(
                    eq(commentVotes.commentId, commentId),
                    eq(commentVotes.userId, userId)
                )
            )
            .limit(1);

        return vote || null;
    }

    /**
     * Find guest's existing vote
     */
    async findGuestVote(commentId, guestToken) {
        const [vote] = await db
            .select()
            .from(commentVotes)
            .where(
                and(
                    eq(commentVotes.commentId, commentId),
                    eq(commentVotes.guestToken, guestToken)
                )
            )
            .limit(1);

        return vote || null;
    }

    /**
     * Create a new vote
     */
    async createVote(data) {
        const [vote] = await db
            .insert(commentVotes)
            .values(data)
            .returning();

        return vote;
    }

    /**
     * Update an existing vote
     */
    async updateVote(id, voteType) {
        const [vote] = await db
            .update(commentVotes)
            .set({ voteType })
            .where(eq(commentVotes.id, id))
            .returning();

        return vote;
    }

    /**
     * Delete a vote
     */
    async deleteVote(id) {
        await db
            .delete(commentVotes)
            .where(eq(commentVotes.id, id));
    }

    /**
     * Get user votes for multiple comments (batch query)
     */
    async getUserVotesForComments(commentIds, userId) {
        if (commentIds.length === 0) return {};

        const votes = await db
            .select({
                commentId: commentVotes.commentId,
                voteType: commentVotes.voteType,
            })
            .from(commentVotes)
            .where(
                and(
                    inArray(commentVotes.commentId, commentIds),
                    eq(commentVotes.userId, userId)
                )
            );

        const voteMap = {};
        for (const vote of votes) {
            voteMap[vote.commentId] = vote.voteType;
        }
        return voteMap;
    }

    /**
     * Get guest votes for multiple comments (batch query)
     */
    async getGuestVotesForComments(commentIds, guestToken) {
        if (commentIds.length === 0) return {};

        const votes = await db
            .select({
                commentId: commentVotes.commentId,
                voteType: commentVotes.voteType,
            })
            .from(commentVotes)
            .where(
                and(
                    inArray(commentVotes.commentId, commentIds),
                    eq(commentVotes.guestToken, guestToken)
                )
            );

        const voteMap = {};
        for (const vote of votes) {
            voteMap[vote.commentId] = vote.voteType;
        }
        return voteMap;
    }
}

const commentVoteRepository = new CommentVoteRepository();

module.exports = {
    commentVoteRepository,
    CommentVoteRepository,
};
