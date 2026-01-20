/**
 * Comment Reaction Service
 * Business logic for comment reactions
 */

const { commentReactionRepository } = require("./commentReaction.repository");
const { commentRepository } = require("./comment.repository");
const { ALLOWED_REACTIONS } = require("./commentReaction.model");

class CommentReactionService {
    /**
     * Get reactions for a comment with counts
     */
    async getReactions(commentId, userId = null, guestToken = null) {
        const reactions = await commentReactionRepository.getReactionsByCommentId(commentId);
        
        // Get user's own reactions
        let userReactions = [];
        if (userId) {
            userReactions = await commentReactionRepository.getUserReactions(commentId, userId);
        } else if (guestToken) {
            userReactions = await commentReactionRepository.getGuestReactions(commentId, guestToken);
        }

        // Format response
        const reactionMap = {};
        for (const reaction of reactions) {
            reactionMap[reaction.emoji] = {
                count: Number(reaction.count),
                hasReacted: userReactions.includes(reaction.emoji),
            };
        }

        return reactionMap;
    }

    /**
     * Get reactions for multiple comments (optimized batch query)
     */
    async getReactionsForComments(commentIds, userId = null, guestToken = null) {
        const reactions = await commentReactionRepository.getReactionsByCommentIds(commentIds);
        
        // Group by comment
        const reactionsByComment = {};
        for (const commentId of commentIds) {
            reactionsByComment[commentId] = {};
        }

        for (const reaction of reactions) {
            if (!reactionsByComment[reaction.commentId]) {
                reactionsByComment[reaction.commentId] = {};
            }
            reactionsByComment[reaction.commentId][reaction.emoji] = {
                count: Number(reaction.count),
                hasReacted: false,
            };
        }

        // Get user's reactions for each comment if authenticated
        if (userId || guestToken) {
            for (const commentId of commentIds) {
                let userReactions = [];
                if (userId) {
                    userReactions = await commentReactionRepository.getUserReactions(commentId, userId);
                } else if (guestToken) {
                    userReactions = await commentReactionRepository.getGuestReactions(commentId, guestToken);
                }

                for (const emoji of userReactions) {
                    if (reactionsByComment[commentId][emoji]) {
                        reactionsByComment[commentId][emoji].hasReacted = true;
                    }
                }
            }
        }

        return reactionsByComment;
    }

    /**
     * Toggle a reaction (add if not exists, remove if exists)
     */
    async toggleReaction(commentId, emoji, userId = null, guestToken = null) {
        // Verify comment exists
        const comment = await commentRepository.getCommentById(commentId);
        if (!comment) {
            const error = new Error("Comment not found");
            error.statusCode = 404;
            throw error;
        }

        // Validate emoji
        if (!ALLOWED_REACTIONS.includes(emoji)) {
            const error = new Error(`Invalid reaction. Allowed: ${ALLOWED_REACTIONS.join(", ")}`);
            error.statusCode = 400;
            throw error;
        }

        // Check if reaction exists
        let existingReaction = null;
        if (userId) {
            existingReaction = await commentReactionRepository.findUserReaction(commentId, userId, emoji);
        } else if (guestToken) {
            existingReaction = await commentReactionRepository.findGuestReaction(commentId, guestToken, emoji);
        } else {
            const error = new Error("Authentication required to react");
            error.statusCode = 401;
            throw error;
        }

        let action;
        if (existingReaction) {
            // Remove reaction
            await commentReactionRepository.deleteReaction(existingReaction.id);
            action = "removed";
        } else {
            // Add reaction
            await commentReactionRepository.createReaction({
                commentId,
                userId,
                guestToken,
                emoji,
            });
            action = "added";
        }

        // Return updated reactions
        const updatedReactions = await this.getReactions(commentId, userId, guestToken);
        return { action, reactions: updatedReactions };
    }

    /**
     * Get list of users who reacted with a specific emoji
     */
    async getReactors(commentId, emoji) {
        const reactors = await commentReactionRepository.getReactorsByEmoji(commentId, emoji);
        return reactors.map((r) => ({
            name: r.userName || "Guest",
            isGuest: !r.userId,
        }));
    }
}

module.exports = { commentReactionService: new CommentReactionService() };
