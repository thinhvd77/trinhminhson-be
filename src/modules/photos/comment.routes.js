/**
 * Photo Comment Routes
 * API endpoints for photo comments
 */

const { Router } = require("express");
const {
    authMiddleware,
    optionalAuthMiddleware,
} = require("../../shared/middlewares/auth.middleware");
const {
    getComments,
    createComment,
    deleteComment,
} = require("./comment.controller");

const router = Router();

// Get comments for a photo (optional auth to reveal anonymous identities to admins)
router.get("/photos/:photoId/comments", optionalAuthMiddleware, getComments);

// Create a new comment (optional auth - allows guest commenting)
router.post("/photos/:photoId/comments", optionalAuthMiddleware, createComment);

// Delete a comment (requires auth)
router.delete(
    "/photos/:photoId/comments/:commentId",
    authMiddleware,
    deleteComment
);

module.exports = { commentRoutes: router };
