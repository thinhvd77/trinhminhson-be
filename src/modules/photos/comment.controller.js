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
        const guestToken = req.query.guestToken || null;
        const comments = await commentService.getComments(
            parseInt(photoId),
            req.user || null,
            guestToken
        );
        res.json(comments);
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new comment (or reply)
 */
async function createComment(req, res, next) {
    try {
        const { photoId } = req.params;
        const { content, guestName, isAnonymous, parentId } = req.body;
        const file = req.file;

        if (!req.user && file) {
            return res.status(403).json({ error: "Only logged-in users can post image comments" });
        }

        const comment = await commentService.addComment(
            parseInt(photoId),
            {
                content,
                guestName,
                isAnonymous,
                file,
                parentId: parentId ? parseInt(parentId) : null,
            },
            req.user || null
        );

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
}

/**
 * Update an existing comment within edit window
 */
async function updateComment(req, res, next) {
    try {
        const { photoId, commentId } = req.params;
        const { content, guestToken } = req.body;

        const updated = await commentService.updateComment(
            parseInt(photoId),
            parseInt(commentId),
            { content, guestToken },
            req.user || null
        );

        res.json(updated);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a comment
 * Accepts guestToken in request body for guest comment deletion
 */
async function deleteComment(req, res, next) {
    try {
        const { commentId } = req.params;
        const { guestToken } = req.body;
        const result = await commentService.deleteComment(
            parseInt(commentId),
            req.user || null,
            guestToken || null
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
};
