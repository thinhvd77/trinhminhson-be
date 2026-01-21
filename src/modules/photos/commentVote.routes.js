/**
 * Comment Vote Routes
 * API endpoints for comment votes (like/dislike)
 */

const { Router } = require("express");
const { optionalAuthMiddleware } = require("../../shared/middlewares/auth.middleware");
const {
    getVotes,
    toggleVote,
    getVotesForComments,
} = require("./commentVote.controller");

const router = Router();

// Get votes for a comment
router.get("/comments/:commentId/votes", optionalAuthMiddleware, getVotes);

// Toggle vote on a comment (like/dislike)
router.post("/comments/:commentId/votes", optionalAuthMiddleware, toggleVote);

// Get votes for multiple comments (batch)
router.post("/comments/votes/batch", optionalAuthMiddleware, getVotesForComments);

module.exports = { commentVoteRoutes: router };
