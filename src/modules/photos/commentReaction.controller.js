/**
 * Comment Reaction Controller
 * HTTP request handlers for comment reactions
 */

const { commentReactionService } = require("./commentReaction.service");
const { toggleReactionDto, commentIdParam } = require("./commentReaction.dtos");

/**
 * Get reactions for a comment
 */
async function getReactions(req, res, next) {
    try {
        const { commentId } = commentIdParam.parse(req.params);
        const userId = req.user?.id || null;
        const guestToken = req.body.guestToken || req.query.guestToken || null;

        const reactions = await commentReactionService.getReactions(commentId, userId, guestToken);
        res.json(reactions);
    } catch (error) {
        next(error);
    }
}

/**
 * Toggle a reaction on a comment
 * Requires authentication - guests cannot react
 */
async function toggleReaction(req, res, next) {
    try {
        const userId = req.user?.id || null;

        // Require authentication for reactions
        if (!userId) {
            return res.status(401).json({ error: "Authentication required to react" });
        }

        const { commentId } = commentIdParam.parse(req.params);
        const { emoji } = toggleReactionDto.parse(req.body);

        const result = await commentReactionService.toggleReaction(
            commentId,
            emoji,
            userId,
            null // No guest token - only authenticated users can react
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * Get list of users who reacted with a specific emoji
 */
async function getReactors(req, res, next) {
    try {
        const { commentId } = commentIdParam.parse(req.params);
        const emoji = req.query.emoji;

        if (!emoji) {
            return res.status(400).json({ error: "emoji query parameter is required" });
        }

        const reactors = await commentReactionService.getReactors(commentId, emoji);
        res.json(reactors);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getReactions,
    toggleReaction,
    getReactors,
};
