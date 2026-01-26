/**
 * Photo Comment Service
 * Business logic for photo comments
 */

const { commentRepository } = require("./comment.repository");
const { commentReactionService } = require("./commentReaction.service");
const { randomUUID } = require("crypto");

const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DELETE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

class CommentService {
    /**
     * Get comments for a photo
     * Hides anonymous user identities unless requester is admin
     * Returns top-level comments with nested replies
     */
    async getComments(photoId, requestingUser = null, guestToken = null) {
        const comments = await commentRepository.getCommentsByPhotoId(photoId);
        const isAdmin = requestingUser?.role === "admin";

        // Get reactions for all comments
        const commentIds = comments.map(c => c.id);
        const reactionsMap = await commentReactionService.getReactionsForComments(
            commentIds,
            requestingUser?.id || null,
            guestToken
        );

        // Transform comments to response format
        const transformComment = (comment) => {
            const isGuest = !comment.userId;
            const isAnonymous = comment.isAnonymous;
            const isOwner = requestingUser && comment.userId === requestingUser.id;
            const hasGuestToken = guestToken && comment.guestToken === guestToken;

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
                parentId: comment.parentId,
                authorName,
                content: comment.content,
                imageUrl: comment.imageUrl,
                isAnonymous,
                isGuest,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                isOwner: Boolean(isOwner) || hasGuestToken,
                reactions: reactionsMap[comment.id] || {},
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
        };

        // Separate top-level comments and replies
        const topLevelComments = [];
        const repliesMap = new Map();

        for (const comment of comments) {
            if (comment.parentId) {
                if (!repliesMap.has(comment.parentId)) {
                    repliesMap.set(comment.parentId, []);
                }
                repliesMap.get(comment.parentId).push(transformComment(comment));
            } else {
                topLevelComments.push(transformComment(comment));
            }
        }

        // Sort replies by createdAt ascending and attach to parent comments
        for (const topComment of topLevelComments) {
            const replies = repliesMap.get(topComment.id) || [];
            // Sort replies by createdAt ascending (oldest first)
            replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            topComment.replies = replies;
        }

        return topLevelComments;
    }

    /**
     * Add a new comment
     * Supports both guest and logged-in users
     * Supports reply comments (1 level nesting only)
     */
    async addComment(photoId, data, user = null) {
        const { content, guestName, file, parentId } = data;
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

        // Validate parent comment if replying
        if (parentId) {
            const parentComment = await commentRepository.getCommentById(parentId);

            if (!parentComment || parentComment.photoId !== photoId) {
                const error = new Error("Parent comment not found");
                error.status = 404;
                throw error;
            }

            // Only allow 1 level of nesting
            if (parentComment.parentId) {
                const error = new Error("Cannot reply to a reply");
                error.status = 400;
                throw error;
            }
        }

        const guestToken = user ? null : randomUUID();

        const commentData = {
            photoId,
            parentId: parentId || null,
            content: content.trim(),
            userId: user?.id || null,
            guestName: !user ? guestName.trim() : null,
            isAnonymous: user ? isAnonymous : false,
            imageUrl: file ? `/uploads/comments/${file.filename}` : null,
            guestToken,
        };

        const comment = await commentRepository.createComment(commentData);

        const result = {
            id: comment.id,
            photoId: comment.photoId,
            parentId: comment.parentId,
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
            updatedAt: comment.updatedAt,
            guestToken,
            isOwner: Boolean(user),
        };

        // Include avatar for non-anonymous logged-in users
        if (user && !isAnonymous && user.avatar) {
            result.authorAvatar = user.avatar;
        }

        return result;
    }

    /**
     * Update a comment within the edit window
     */
    async updateComment(photoId, commentId, data, user = null) {
        const { content, guestToken } = data;

        if (!content || content.trim().length === 0) {
            const error = new Error("Comment content is required");
            error.status = 400;
            throw error;
        }

        const comment = await commentRepository.getCommentById(commentId);
        if (!comment || comment.photoId !== photoId) {
            const error = new Error("Comment not found");
            error.status = 404;
            throw error;
        }

        const now = Date.now();
        const createdAt = new Date(comment.createdAt).getTime();
        if (now - createdAt > EDIT_WINDOW_MS) {
            const error = new Error("Edit window has expired");
            error.status = 403;
            throw error;
        }

        const isGuestComment = !comment.userId;
        const isOwnerUser = user && comment.userId === user.id;

        if (isOwnerUser) {
            // ok
        } else if (isGuestComment) {
            if (!guestToken || guestToken !== comment.guestToken) {
                const error = new Error("Not authorized to edit this comment");
                error.status = 403;
                throw error;
            }
        } else {
            const error = new Error("Not authorized to edit this comment");
            error.status = 403;
            throw error;
        }

        const trimmedContent = content.trim();

        const updated = await commentRepository.updateComment(commentId, {
            content: trimmedContent,
            updatedAt: new Date(),
        });

        const isAnonymous = comment.isAnonymous;
        const response = {
            id: comment.id,
            photoId: comment.photoId,
            authorName: isGuestComment
                ? comment.guestName || "Guest"
                : isAnonymous
                ? "Anonymous"
                : user?.name || user?.username,
            content: updated.content,
            imageUrl: comment.imageUrl,
            isAnonymous,
            isGuest: isGuestComment,
            createdAt: comment.createdAt,
            updatedAt: updated.updatedAt,
            isOwner: Boolean(isOwnerUser),
        };

        if (!isGuestComment && !isAnonymous && user?.avatar) {
            response.authorAvatar = user.avatar;
        }

        return response;
    }

    /**
     * Delete a comment
     * Admin can delete anytime, owner can delete within 1 week
     * Guest users can delete their own comments with valid guestToken within 1 week
     */
    async deleteComment(commentId, user, guestToken = null) {
        const comment = await commentRepository.getCommentById(commentId);
        if (!comment) {
            const error = new Error("Comment not found");
            error.status = 404;
            throw error;
        }

        const isAdmin = user?.role === "admin";
        const isGuestComment = !comment.userId;
        const isOwnerUser = user && comment.userId === user.id;
        const isGuestOwner = isGuestComment && guestToken && guestToken === comment.guestToken;

        // Admin can always delete any comment
        if (isAdmin) {
            await commentRepository.deleteComment(commentId);
            return { message: "Comment deleted successfully" };
        }

        // Check authorization
        if (!isOwnerUser && !isGuestOwner) {
            const error = new Error("Not authorized to delete this comment");
            error.status = 403;
            throw error;
        }

        // Both owner and guest owner are limited to 1-week window
        const now = Date.now();
        const createdAt = new Date(comment.createdAt).getTime();
        if (now - createdAt > DELETE_WINDOW_MS) {
            const error = new Error("Delete window has expired (1 week limit)");
            error.status = 403;
            throw error;
        }

        await commentRepository.deleteComment(commentId);
        return { message: "Comment deleted successfully" };
    }
}

module.exports = { commentService: new CommentService() };
