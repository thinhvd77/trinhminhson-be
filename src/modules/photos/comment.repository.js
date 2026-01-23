/**
 * Photo Comment Repository
 * Database operations for photo comments
 */

const { db } = require("../../shared/core/db");
const { photoComments } = require("./comment.model");
const { users } = require("../users/user.model");
const { eq, desc } = require("drizzle-orm");

class CommentRepository {
    /**
     * Get all comments for a photo with user info
     */
    async getCommentsByPhotoId(photoId) {
        const comments = await db
            .select({
                id: photoComments.id,
                photoId: photoComments.photoId,
                parentId: photoComments.parentId,
                userId: photoComments.userId,
                guestName: photoComments.guestName,
                guestToken: photoComments.guestToken,
                content: photoComments.content,
                imageUrl: photoComments.imageUrl,
                isAnonymous: photoComments.isAnonymous,
                createdAt: photoComments.createdAt,
                updatedAt: photoComments.updatedAt,
                userName: users.name,
                userUsername: users.username,
                userAvatar: users.avatar,
            })
            .from(photoComments)
            .leftJoin(users, eq(photoComments.userId, users.id))
            .where(eq(photoComments.photoId, photoId))
            .orderBy(desc(photoComments.createdAt));

        return comments;
    }

    /**
     * Create a new comment
     */
    async createComment(data) {
        const [comment] = await db
            .insert(photoComments)
            .values({
                photoId: data.photoId,
                parentId: data.parentId || null,
                userId: data.userId || null,
                guestName: data.guestName || null,
                content: data.content,
                imageUrl: data.imageUrl || null,
                isAnonymous: data.isAnonymous || false,
                guestToken: data.guestToken || null,
            })
            .returning();

        return comment;
    }

    /**
     * Get comment by ID
     */
    async getCommentById(id) {
        const [comment] = await db
            .select()
            .from(photoComments)
            .where(eq(photoComments.id, id))
            .limit(1);

        return comment;
    }

    /**
     * Update comment content and updated timestamp
     */
    async updateComment(id, data) {
        const [comment] = await db
            .update(photoComments)
            .set({
                content: data.content,
                updatedAt: data.updatedAt,
            })
            .where(eq(photoComments.id, id))
            .returning();

        return comment;
    }

    /**
     * Delete a comment
     */
    async deleteComment(id) {
        await db.delete(photoComments).where(eq(photoComments.id, id));
    }
}

module.exports = { commentRepository: new CommentRepository() };
