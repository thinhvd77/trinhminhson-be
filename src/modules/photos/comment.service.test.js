/**
 * Comment Service Tests - Reply Feature (1 Level Nesting)
 * TDD: Write tests FIRST, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies BEFORE any imports
const mockGetCommentsByPhotoId = vi.fn();
const mockCreateComment = vi.fn();
const mockGetCommentById = vi.fn();
const mockUpdateComment = vi.fn();
const mockDeleteComment = vi.fn();
const mockGetReactionsForComments = vi.fn();

vi.mock('./comment.repository', () => ({
    commentRepository: {
        getCommentsByPhotoId: (...args) => mockGetCommentsByPhotoId(...args),
        createComment: (...args) => mockCreateComment(...args),
        getCommentById: (...args) => mockGetCommentById(...args),
        updateComment: (...args) => mockUpdateComment(...args),
        deleteComment: (...args) => mockDeleteComment(...args),
    },
}));

vi.mock('./commentReaction.service', () => ({
    commentReactionService: {
        getReactionsForComments: (...args) => mockGetReactionsForComments(...args),
    },
}));

vi.mock('crypto', () => ({
    randomUUID: vi.fn().mockReturnValue('mock-uuid-token'),
}));

// Import service after mocks are set
const { commentService } = await import('./comment.service');

describe('CommentService - Reply Feature', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetReactionsForComments.mockResolvedValue({});
        mockGetCommentsByPhotoId.mockResolvedValue([]);
    });

    describe('addComment with parentId (Reply)', () => {
        it('should create a reply comment with parentId', async () => {
            const parentComment = {
                id: 1,
                photoId: 100,
                userId: 10,
                content: 'Parent comment',
                parentId: null,
                createdAt: new Date(),
            };

            const replyData = {
                content: 'This is a reply',
                parentId: 1,
            };

            const user = { id: 20, name: 'Replier', username: 'replier' };

            mockGetCommentById.mockResolvedValue(parentComment);
            mockCreateComment.mockResolvedValue({
                id: 2,
                photoId: 100,
                parentId: 1,
                userId: 20,
                content: 'This is a reply',
                isAnonymous: false,
                createdAt: new Date(),
            });

            const result = await commentService.addComment(100, replyData, user);

            expect(result).toHaveProperty('id', 2);
            expect(result).toHaveProperty('parentId', 1);
            expect(result).toHaveProperty('content', 'This is a reply');
            expect(mockCreateComment).toHaveBeenCalledWith(
                expect.objectContaining({
                    photoId: 100,
                    parentId: 1,
                    content: 'This is a reply',
                })
            );
        });

        it('should reject reply to non-existent parent comment', async () => {
            const replyData = {
                content: 'This is a reply',
                parentId: 999,
            };

            const user = { id: 20, name: 'Replier', username: 'replier' };

            mockGetCommentById.mockResolvedValue(null);

            await expect(
                commentService.addComment(100, replyData, user)
            ).rejects.toThrow('Parent comment not found');
        });

        it('should reject reply to a reply (only 1 level nesting allowed)', async () => {
            const parentReply = {
                id: 2,
                photoId: 100,
                parentId: 1, // This is already a reply
                userId: 10,
                content: 'This is already a reply',
                createdAt: new Date(),
            };

            const replyData = {
                content: 'Reply to a reply',
                parentId: 2,
            };

            const user = { id: 20, name: 'Replier', username: 'replier' };

            mockGetCommentById.mockResolvedValue(parentReply);

            await expect(
                commentService.addComment(100, replyData, user)
            ).rejects.toThrow('Cannot reply to a reply');
        });

        it('should reject reply to a comment from different photo', async () => {
            const parentComment = {
                id: 1,
                photoId: 200, // Different photo
                userId: 10,
                content: 'Parent on different photo',
                parentId: null,
                createdAt: new Date(),
            };

            const replyData = {
                content: 'This is a reply',
                parentId: 1,
            };

            const user = { id: 20, name: 'Replier', username: 'replier' };

            mockGetCommentById.mockResolvedValue(parentComment);

            await expect(
                commentService.addComment(100, replyData, user)
            ).rejects.toThrow('Parent comment not found');
        });

        it('should create top-level comment without parentId', async () => {
            const commentData = {
                content: 'Top level comment',
            };

            const user = { id: 10, name: 'User', username: 'user1' };

            mockCreateComment.mockResolvedValue({
                id: 1,
                photoId: 100,
                parentId: null,
                userId: 10,
                content: 'Top level comment',
                isAnonymous: false,
                createdAt: new Date(),
            });

            const result = await commentService.addComment(100, commentData, user);

            expect(result).toHaveProperty('id', 1);
            expect(result.parentId).toBeNull();
            expect(mockGetCommentById).not.toHaveBeenCalled();
        });
    });

    describe('getComments with replies', () => {
        it('should return comments with nested replies', async () => {
            const mockComments = [
                {
                    id: 1,
                    photoId: 100,
                    parentId: null,
                    userId: 10,
                    userName: 'User1',
                    userUsername: 'user1',
                    content: 'Top level comment',
                    isAnonymous: false,
                    createdAt: new Date('2024-01-01'),
                },
                {
                    id: 2,
                    photoId: 100,
                    parentId: 1,
                    userId: 20,
                    userName: 'User2',
                    userUsername: 'user2',
                    content: 'Reply to comment 1',
                    isAnonymous: false,
                    createdAt: new Date('2024-01-02'),
                },
                {
                    id: 3,
                    photoId: 100,
                    parentId: null,
                    userId: 30,
                    userName: 'User3',
                    userUsername: 'user3',
                    content: 'Another top level comment',
                    isAnonymous: false,
                    createdAt: new Date('2024-01-03'),
                },
            ];

            mockGetCommentsByPhotoId.mockResolvedValue(mockComments);

            const result = await commentService.getComments(100);

            // Should return only top-level comments with replies nested
            expect(result).toHaveLength(2);

            const firstComment = result.find(c => c.id === 1);
            expect(firstComment).toHaveProperty('replies');
            expect(firstComment.replies).toHaveLength(1);
            expect(firstComment.replies[0]).toHaveProperty('id', 2);
            expect(firstComment.replies[0]).toHaveProperty('parentId', 1);

            const secondComment = result.find(c => c.id === 3);
            expect(secondComment).toHaveProperty('replies');
            expect(secondComment.replies).toHaveLength(0);
        });

        it('should order replies by createdAt ascending', async () => {
            const mockComments = [
                {
                    id: 1,
                    photoId: 100,
                    parentId: null,
                    userId: 10,
                    userName: 'User1',
                    userUsername: 'user1',
                    content: 'Top level comment',
                    isAnonymous: false,
                    createdAt: new Date('2024-01-01'),
                },
                {
                    id: 3,
                    photoId: 100,
                    parentId: 1,
                    userId: 30,
                    userName: 'User3',
                    userUsername: 'user3',
                    content: 'Second reply',
                    isAnonymous: false,
                    createdAt: new Date('2024-01-03'),
                },
                {
                    id: 2,
                    photoId: 100,
                    parentId: 1,
                    userId: 20,
                    userName: 'User2',
                    userUsername: 'user2',
                    content: 'First reply',
                    isAnonymous: false,
                    createdAt: new Date('2024-01-02'),
                },
            ];

            mockGetCommentsByPhotoId.mockResolvedValue(mockComments);

            const result = await commentService.getComments(100);

            expect(result[0].replies[0].id).toBe(2); // First reply
            expect(result[0].replies[1].id).toBe(3); // Second reply
        });
    });

    describe('deleteComment with replies', () => {
        it('should delete parent comment (replies cascade via DB)', async () => {
            const parentComment = {
                id: 1,
                photoId: 100,
                parentId: null,
                userId: 10,
                content: 'Parent comment',
                createdAt: new Date(),
            };

            const user = { id: 10, role: 'user' };

            mockGetCommentById.mockResolvedValue(parentComment);
            mockDeleteComment.mockResolvedValue(undefined);

            const result = await commentService.deleteComment(1, user);

            expect(result).toHaveProperty('message', 'Comment deleted successfully');
            expect(mockDeleteComment).toHaveBeenCalledWith(1);
        });
    });
});
