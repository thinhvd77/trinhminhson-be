/**
 * Comment Reaction Routes
 * API endpoints for comment reactions
 */

const { Router } = require("express");
const { optionalAuthMiddleware } = require("../../shared/middlewares/auth.middleware");
const {
    getReactions,
    toggleReaction,
    getReactors,
} = require("./commentReaction.controller");

const router = Router();

// Get reactions for a comment
router.get("/comments/:commentId/reactions", optionalAuthMiddleware, getReactions);

// Toggle reaction on a comment
router.post("/comments/:commentId/reactions", optionalAuthMiddleware, toggleReaction);

// Get list of users who reacted with a specific emoji
router.get("/comments/:commentId/reactors", getReactors);

module.exports = { commentReactionRoutes: router };
