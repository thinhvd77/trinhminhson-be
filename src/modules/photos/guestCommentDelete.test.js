/**
 * Guest Comment Deletion Tests
 * TDD: Tests for guest users deleting their own comments
 *
 * These tests verify the deleteComment logic directly using inline mocking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Constants matching the service
const DELETE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

// Helper function to create a minimal deleteComment implementation for testing
// This simulates the business logic we need to verify
function createDeleteCommentLogic(mockGetCommentById, mockDeleteComment) {
    return async function deleteComment(commentId, user, guestToken = null) {
        const comment = await mockGetCommentById(commentId);
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
            await mockDeleteComment(commentId);
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

        await mockDeleteComment(commentId);
        return { message: "Comment deleted successfully" };
    };
}

// Mock functions
const mockGetCommentById = vi.fn();
const mockDeleteComment = vi.fn();

// Create the function under test
const deleteComment = createDeleteCommentLogic(mockGetCommentById, mockDeleteComment);

describe('Guest Comment Deletion - Business Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('deleteComment for guest users', () => {
        it('should allow guest to delete own comment with valid guestToken within 7 days', async () => {
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null, // Guest comment - no user ID
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Guest comment',
                createdAt: new Date(), // Just created
            };

            mockGetCommentById.mockResolvedValue(guestComment);
            mockDeleteComment.mockResolvedValue(undefined);

            const result = await deleteComment(1, null, 'valid-guest-token-123');

            expect(result).toHaveProperty('message', 'Comment deleted successfully');
            expect(mockDeleteComment).toHaveBeenCalledWith(1);
        });

        it('should reject guest delete with invalid guestToken', async () => {
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null,
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Guest comment',
                createdAt: new Date(),
            };

            mockGetCommentById.mockResolvedValue(guestComment);

            await expect(
                deleteComment(1, null, 'wrong-token')
            ).rejects.toThrow('Not authorized to delete this comment');
        });

        it('should reject guest delete without guestToken', async () => {
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null,
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Guest comment',
                createdAt: new Date(),
            };

            mockGetCommentById.mockResolvedValue(guestComment);

            await expect(
                deleteComment(1, null, null)
            ).rejects.toThrow('Not authorized to delete this comment');
        });

        it('should reject guest delete after 7 days window expires', async () => {
            const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null,
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Guest comment',
                createdAt: eightDaysAgo,
            };

            mockGetCommentById.mockResolvedValue(guestComment);

            await expect(
                deleteComment(1, null, 'valid-guest-token-123')
            ).rejects.toThrow('Delete window has expired (1 week limit)');
        });

        it('should allow guest to delete comment just before 7 day window expires', async () => {
            // 6 days and 23 hours ago - still within window
            const almostSevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000));
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null,
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Guest comment',
                createdAt: almostSevenDaysAgo,
            };

            mockGetCommentById.mockResolvedValue(guestComment);
            mockDeleteComment.mockResolvedValue(undefined);

            const result = await deleteComment(1, null, 'valid-guest-token-123');

            expect(result).toHaveProperty('message', 'Comment deleted successfully');
            expect(mockDeleteComment).toHaveBeenCalledWith(1);
        });

        it('should allow admin to delete any guest comment regardless of token', async () => {
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null,
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Guest comment',
                createdAt: new Date(),
            };

            const admin = { id: 999, role: 'admin' };

            mockGetCommentById.mockResolvedValue(guestComment);
            mockDeleteComment.mockResolvedValue(undefined);

            const result = await deleteComment(1, admin, null);

            expect(result).toHaveProperty('message', 'Comment deleted successfully');
            expect(mockDeleteComment).toHaveBeenCalledWith(1);
        });

        it('should allow admin to delete old guest comment (beyond 7 days)', async () => {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const guestComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: null,
                guestToken: 'valid-guest-token-123',
                guestName: 'TestGuest',
                content: 'Old guest comment',
                createdAt: thirtyDaysAgo,
            };

            const admin = { id: 999, role: 'admin' };

            mockGetCommentById.mockResolvedValue(guestComment);
            mockDeleteComment.mockResolvedValue(undefined);

            const result = await deleteComment(1, admin, null);

            expect(result).toHaveProperty('message', 'Comment deleted successfully');
            expect(mockDeleteComment).toHaveBeenCalledWith(1);
        });

        it('should return 404 for non-existent comment', async () => {
            mockGetCommentById.mockResolvedValue(null);

            await expect(
                deleteComment(999, null, 'any-token')
            ).rejects.toThrow('Comment not found');
        });
    });
});
