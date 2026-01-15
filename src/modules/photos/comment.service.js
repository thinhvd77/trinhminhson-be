/**
 * Photo Comment Service
 * Business logic for photo comments
 */

const { commentRepository } = require("./comment.repository");

class CommentService {
    /**
     * Get comments for a photo
     * Hides anonymous user identities unless requester is admin
     */
    async getComments(photoId, requestingUser = null) {
        const comments = await commentRepository.getCommentsByPhotoId(photoId);
        const isAdmin = requestingUser?.role === "admin";

        return comments.map((comment) => {
            const isGuest = !comment.userId;
            const isAnonymous = comment.isAnonymous;

            let authorName;
            if (isGuest) {
                authorName = comment.guestName || "Guest";
            } else if (isAnonymous) {
                authorName = "Anonymous";
            } else {
                authorName = comment.userName || comment.userUsername;
            }

            const result = {
                id: comment.id,
                photoId: comment.photoId,
                authorName,
                content: comment.content,
                imageUrl: comment.imageUrl,
                isAnonymous,
                isGuest,
                createdAt: comment.createdAt,
            };

            if (isAdmin && isAnonymous && comment.userId) {
                result.realAuthor = {
                    id: comment.userId,
                    name: comment.userName,
                    username: comment.userUsername,
                };
            }

            if (!isGuest && !isAnonymous && comment.userAvatar) {
                result.authorAvatar = comment.userAvatar;
            }

            return result;
        });
    }

    /**
     * Add a new comment
     * Supports both guest and logged-in users
     */
    async addComment(photoId, data, user = null) {
        const { content, guestName, file } = data;
        const isAnonymous = data.isAnonymous === true || data.isAnonymous === "true";

        if (!content || content.trim().length === 0) {
            const error = new Error("Comment content is required");
            error.status = 400;
            throw error;
        }

        if (!user && (!guestName || guestName.trim().length === 0)) {
            const error = new Error("Guest name is required");
            error.status = 400;
            throw error;
        }

        const commentData = {
            photoId,
            content: content.trim(),
            userId: user?.id || null,
            guestName: !user ? guestName.trim() : null,
            isAnonymous: user ? isAnonymous : false,
            imageUrl: file ? `/uploads/comments/${file.filename}` : null,
        };

        const comment = await commentRepository.createComment(commentData);

        const result = {
            id: comment.id,
            photoId: comment.photoId,
            authorName: user
                ? isAnonymous
                    ? "Anonymous"
                    : user.name
                : guestName.trim(),
            content: comment.content,
            imageUrl: comment.imageUrl,
            isAnonymous: comment.isAnonymous,
            isGuest: !user,
            createdAt: comment.createdAt,
        };

        // Include avatar for non-anonymous logged-in users
        if (user && !isAnonymous && user.avatar) {
            result.authorAvatar = user.avatar;
        }

        return result;
    }

    /**
     * Delete a comment
     * Only admin or comment owner can delete
     */
    async deleteComment(commentId, user) {
        if (!user) {
            const error = new Error("Authentication required");
            error.status = 401;
            throw error;
        }

        const comment = await commentRepository.getCommentById(commentId);
        if (!comment) {
            const error = new Error("Comment not found");
            error.status = 404;
            throw error;
        }

        // Only owner or admin can delete
        const isOwner = comment.userId === user.id;
        const isAdmin = user.role === "admin";

        if (!isOwner && !isAdmin) {
            const error = new Error("Not authorized to delete this comment");
            error.status = 403;
            throw error;
        }

        await commentRepository.deleteComment(commentId);
        return { message: "Comment deleted successfully" };
    }
}

module.exports = { commentService: new CommentService() };
