/**
 * Comment Vote Service
 * Business logic for comment votes (like/dislike)
 */

const { commentVoteRepository } = require("./commentVote.repository");
const { commentRepository } = require("./comment.repository");
const { VOTE_TYPES } = require("./commentVote.model");

class CommentVoteService {
    /**
     * Get votes for a comment with counts
     */
    async getVotes(commentId, userId = null, guestToken = null) {
        const votes = await commentVoteRepository.getVotesByCommentId(commentId);
        
        // Get user's own vote
        let userVote = null;
        if (userId) {
            userVote = await commentVoteRepository.getUserVote(commentId, userId);
        } else if (guestToken) {
            userVote = await commentVoteRepository.getGuestVote(commentId, guestToken);
        }

        // Format response
        const result = {
            likes: 0,
            dislikes: 0,
            userVote: userVote,
        };

        for (const vote of votes) {
            if (vote.voteType === "like") {
                result.likes = Number(vote.count);
            } else if (vote.voteType === "dislike") {
                result.dislikes = Number(vote.count);
            }
        }

        return result;
    }

    /**
     * Get votes for multiple comments (optimized batch query)
     */
    async getVotesForComments(commentIds, userId = null, guestToken = null) {
        const votes = await commentVoteRepository.getVotesByCommentIds(commentIds);
        
        // Initialize result map
        const votesByComment = {};
        for (const commentId of commentIds) {
            votesByComment[commentId] = {
                likes: 0,
                dislikes: 0,
                userVote: null,
            };
        }

        // Populate counts
        for (const vote of votes) {
            if (!votesByComment[vote.commentId]) {
                votesByComment[vote.commentId] = { likes: 0, dislikes: 0, userVote: null };
            }
            if (vote.voteType === "like") {
                votesByComment[vote.commentId].likes = Number(vote.count);
            } else if (vote.voteType === "dislike") {
                votesByComment[vote.commentId].dislikes = Number(vote.count);
            }
        }

        // Get user's votes for each comment if authenticated
        if (userId) {
            const userVotes = await commentVoteRepository.getUserVotesForComments(commentIds, userId);
            for (const commentId of commentIds) {
                if (userVotes[commentId]) {
                    votesByComment[commentId].userVote = userVotes[commentId];
                }
            }
        } else if (guestToken) {
            const guestVotes = await commentVoteRepository.getGuestVotesForComments(commentIds, guestToken);
            for (const commentId of commentIds) {
                if (guestVotes[commentId]) {
                    votesByComment[commentId].userVote = guestVotes[commentId];
                }
            }
        }

        return votesByComment;
    }

    /**
     * Toggle a vote (add if not exists, switch if different, remove if same)
     */
    async toggleVote(commentId, voteType, userId = null, guestToken = null) {
        // Verify comment exists
        const comment = await commentRepository.getCommentById(commentId);
        if (!comment) {
            const error = new Error("Comment not found");
            error.statusCode = 404;
            throw error;
        }

        // Validate vote type
        if (!VOTE_TYPES.includes(voteType)) {
            const error = new Error(`Invalid vote type. Allowed: ${VOTE_TYPES.join(", ")}`);
            error.statusCode = 400;
            throw error;
        }

        // Must have either userId or guestToken
        if (!userId && !guestToken) {
            const error = new Error("Authentication or guest token required to vote");
            error.statusCode = 401;
            throw error;
        }

        // Check if vote exists
        let existingVote = null;
        if (userId) {
            existingVote = await commentVoteRepository.findUserVote(commentId, userId);
        } else if (guestToken) {
            existingVote = await commentVoteRepository.findGuestVote(commentId, guestToken);
        }

        let action;
        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Same vote type - remove it (toggle off)
                await commentVoteRepository.deleteVote(existingVote.id);
                action = "removed";
            } else {
                // Different vote type - switch it (auto-switching)
                await commentVoteRepository.updateVote(existingVote.id, voteType);
                action = "switched";
            }
        } else {
            // No existing vote - create new
            await commentVoteRepository.createVote({
                commentId,
                userId,
                guestToken,
                voteType,
            });
            action = "added";
        }

        // Return updated vote counts
        const votes = await this.getVotes(commentId, userId, guestToken);
        return {
            action,
            votes,
        };
    }
}

const commentVoteService = new CommentVoteService();

module.exports = {
    commentVoteService,
    CommentVoteService,
};
