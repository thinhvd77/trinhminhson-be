/**
 * Photo Comment Controller
 * HTTP request handlers for photo comments
 */

const { commentService } = require("./comment.service");

/**
 * Get comments for a photo
 */
async function getComments(req, res, next) {
    try {
        const { photoId } = req.params;
        const comments = await commentService.getComments(
            parseInt(photoId),
            req.user || null
        );
        res.json(comments);
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new comment
 */
async function createComment(req, res, next) {
    try {
        const { photoId } = req.params;
        const { content, guestName, isAnonymous } = req.body;

        const comment = await commentService.addComment(
            parseInt(photoId),
            { content, guestName, isAnonymous },
            req.user || null
        );

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a comment
 */
async function deleteComment(req, res, next) {
    try {
        const { commentId } = req.params;
        const result = await commentService.deleteComment(
            parseInt(commentId),
            req.user
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getComments,
    createComment,
    deleteComment,
};
