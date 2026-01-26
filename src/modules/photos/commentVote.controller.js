/**
 * Comment Vote Controller
 * HTTP request handlers for comment votes (like/dislike)
 */

const { commentVoteService } = require("./commentVote.service");
const { toggleVoteDto, commentIdParam } = require("./commentVote.dtos");

/**
 * Get votes for a comment
 */
async function getVotes(req, res, next) {
    try {
        const { commentId } = commentIdParam.parse(req.params);
        const userId = req.user?.id || null;
        const guestToken = req.body.guestToken || req.query.guestToken || null;

        const votes = await commentVoteService.getVotes(commentId, userId, guestToken);
        res.json(votes);
    } catch (error) {
        next(error);
    }
}

/**
 * Toggle a vote on a comment (like/dislike)
 * Requires authentication - guests cannot vote
 */
async function toggleVote(req, res, next) {
    try {
        const userId = req.user?.id || null;

        // Require authentication for voting
        if (!userId) {
            return res.status(401).json({ error: "Authentication required to vote" });
        }

        const { commentId } = commentIdParam.parse(req.params);
        const { voteType } = toggleVoteDto.parse(req.body);

        const result = await commentVoteService.toggleVote(
            commentId,
            voteType,
            userId,
            null // No guest token - only authenticated users can vote
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * Get votes for multiple comments (batch)
 */
async function getVotesForComments(req, res, next) {
    try {
        const { commentIds } = req.body;
        const userId = req.user?.id || null;
        const guestToken = req.body.guestToken || req.query.guestToken || null;

        if (!Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({ error: "commentIds array is required" });
        }

        const votes = await commentVoteService.getVotesForComments(commentIds, userId, guestToken);
        res.json(votes);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getVotes,
    toggleVote,
    getVotesForComments,
};
