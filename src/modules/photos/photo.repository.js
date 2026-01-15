/**
 * Photo Repository
 * Handles all database operations for photos
 */

const { db } = require("../../shared/core/db");
const { photos } = require("./photo.model");
const { users } = require("../users/user.model");
const { eq, desc, sql, and, like, or, inArray } = require("drizzle-orm");

class PhotoRepository {
  /**
   * Get all photos with optional filtering
   */
  async getAllPhotos({ photoIds, isPublic = true, limit, offset } = {}) {
    let query = db
      .select({
        id: photos.id,
        title: photos.title,
        filename: photos.filename,
        originalName: photos.originalName,
        dateTaken: photos.dateTaken,
        aspectRatio: photos.aspectRatio,
        width: photos.width,
        height: photos.height,
        fileSize: photos.fileSize,
        mimeType: photos.mimeType,
        uploadedBy: photos.uploadedBy,
        isPublic: photos.isPublic,
        displayOrder: photos.displayOrder,
        createdAt: photos.createdAt,
        updatedAt: photos.updatedAt,
      })
      .from(photos);

    // Build where conditions
    const conditions = [];
    if (isPublic !== undefined) {
      conditions.push(eq(photos.isPublic, isPublic));
    }
    if (photoIds && photoIds.length > 0) {
      conditions.push(inArray(photos.id, photoIds));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(photos.displayOrder, desc(photos.createdAt));

    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.offset(offset);
    }

    const result = await query;
    return result.map(this.mapPhotoToResponse);
  }

  /**
   * Get photo by ID
   */
  async getPhotoById(id) {
    const [photo] = await db
      .select()
      .from(photos)
      .where(eq(photos.id, id));

    if (!photo) return null;
    return this.mapPhotoToResponse(photo);
  }

  /**
   * Create a new photo
   */
  async createPhoto(photoData) {
    const [result] = await db
      .insert(photos)
      .values({
        title: photoData.title,
        filename: photoData.filename,
        originalName: photoData.originalName,
        dateTaken: photoData.dateTaken ? new Date(photoData.dateTaken) : null,
        aspectRatio: photoData.aspectRatio || "landscape",
        width: photoData.width,
        height: photoData.height,
        fileSize: photoData.fileSize,
        mimeType: photoData.mimeType,
        uploadedBy: photoData.uploadedBy,
        isPublic: photoData.isPublic !== false,
      })
      .returning();

    return this.mapPhotoToResponse(result);
  }

  /**
   * Update a photo
   */
  async updatePhoto(id, photoData) {
    const updateData = {
      updatedAt: new Date(),
    };

    if (photoData.title !== undefined) updateData.title = photoData.title;
    if (photoData.dateTaken !== undefined) updateData.dateTaken = new Date(photoData.dateTaken);
    if (photoData.aspectRatio !== undefined) updateData.aspectRatio = photoData.aspectRatio;
    if (photoData.isPublic !== undefined) updateData.isPublic = photoData.isPublic;
    if (photoData.displayOrder !== undefined) updateData.displayOrder = photoData.displayOrder;

    const [result] = await db
      .update(photos)
      .set(updateData)
      .where(eq(photos.id, id))
      .returning();

    if (!result) return null;
    return this.mapPhotoToResponse(result);
  }

  /**
   * Delete a photo
   */
  async deletePhoto(id) {
    const [result] = await db
      .delete(photos)
      .where(eq(photos.id, id))
      .returning();

    return result ? this.mapPhotoToResponse(result) : null;
  }

  /**
   * Get photo count
   */
  async getPhotoCount({ photoIds, isPublic = true } = {}) {
    const conditions = [];
    if (isPublic !== undefined) {
      conditions.push(eq(photos.isPublic, isPublic));
    }
    if (photoIds && photoIds.length > 0) {
      conditions.push(inArray(photos.id, photoIds));
    }

    const [result] = await db
      .select({ count: sql`COUNT(*)` })
      .from(photos)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result.count);
  }

  /**
   * Map database row to response format
   */
  mapPhotoToResponse(photo) {
    return {
      id: photo.id,
      title: photo.title,
      filename: photo.filename,
      original_name: photo.originalName,
      date_taken: photo.dateTaken,
      aspect_ratio: photo.aspectRatio,
      width: photo.width,
      height: photo.height,
      file_size: photo.fileSize,
      mime_type: photo.mimeType,
      uploaded_by: photo.uploadedBy,
      is_public: photo.isPublic,
      display_order: photo.displayOrder,
      created_at: photo.createdAt,
      updated_at: photo.updatedAt,
    };
  }
}

module.exports = { photoRepository: new PhotoRepository() };
