/**
 * Photo Service
 * Business logic for photos
 */

const { photoRepository } = require("./photo.repository");
const categoryRepository = require("./category.repository");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

class PhotoService {
  /**
   * Get all photos with their categories and subcategories
   */
  async getAllPhotos({ categoryId, isPublic, limit, offset } = {}) {
    // If filtering by category, get photo IDs first
    let photoIds = null;
    if (categoryId) {
      photoIds = await categoryRepository.getPhotoIdsByCategory(categoryId);
      if (photoIds.length === 0) {
        return [];
      }
    }

    const photos = await photoRepository.getAllPhotos({ photoIds, isPublic, limit, offset });

    const photosWithRelations = await Promise.all(
      photos.map(async (photo) => {
        const [categories, subcategories] = await Promise.all([
          categoryRepository.getPhotoCategories(photo.id),
          categoryRepository.getPhotoSubcategories(photo.id),
        ]);
        return {
          ...photo,
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          })),
          subcategories: subcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
          })),
        };
      })
    );

    return photosWithRelations;
  }

  /**
   * Get photo by ID with categories and subcategories
   */
  async getPhotoById(id) {
    const photo = await photoRepository.getPhotoById(id);
    if (!photo) {
      const error = new Error("Photo not found");
      error.status = 404;
      throw error;
    }

    // Get categories and subcategories for this photo
    const [categories, subcategories] = await Promise.all([
      categoryRepository.getPhotoCategories(id),
      categoryRepository.getPhotoSubcategories(id),
    ]);
    return {
      ...photo,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
      subcategories: subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
      })),
    };
  }

  /**
   * Upload and create a new photo
   * Creates optimized versions: thumbnail (400px), medium (800px), large (1600px)
   */
  async uploadPhoto(file, photoData, uploadedBy) {
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Get image dimensions using sharp
    let width, height, aspectRatio;
    try {
      const metadata = await sharp(file.path).metadata();
      width = metadata.width;
      height = metadata.height;

      // Calculate aspect ratio
      if (width && height) {
        const ratio = width / height;
        if (ratio > 1.2) {
          aspectRatio = "landscape";
        } else if (ratio < 0.8) {
          aspectRatio = "portrait";
        } else {
          aspectRatio = "square";
        }
      }

      // Generate optimized WebP versions for display
      // Original file is kept for download
      const baseName = path.parse(file.filename).name;
      const uploadDir = "uploads/photos";

      // Thumbnail (400px width) - WebP for grid
      await sharp(file.path)
        .resize(400, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, `${baseName}_thumb.webp`));

      // Medium (800px width) - WebP for gallery
      await sharp(file.path)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(uploadDir, `${baseName}_medium.webp`));

      // Large (1600px width) - WebP for lightbox
      await sharp(file.path)
        .resize(1600, null, { withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(path.join(uploadDir, `${baseName}_large.webp`));

    } catch (err) {
      console.error("Failed to process image:", err);
    }

    const photo = await photoRepository.createPhoto({
      title: photoData.title,
      filename: file.filename,
      originalName: file.originalname,
      dateTaken: photoData.dateTaken,
      aspectRatio: aspectRatio || photoData.aspectRatio || "landscape",
      width,
      height,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
      isPublic: photoData.isPublic !== false,
    });

    // Link categories
    if (photoData.categoryIds && photoData.categoryIds.length > 0) {
      try {
        await categoryRepository.setPhotoCategories(photo.id, photoData.categoryIds);
      } catch (err) {
        console.error("Failed to link categories:", err);
      }
    }

    // Link subcategories
    if (photoData.subcategoryIds && photoData.subcategoryIds.length > 0) {
      try {
        await categoryRepository.setPhotoSubcategories(photo.id, photoData.subcategoryIds);
      } catch (err) {
        console.error("Failed to link subcategories:", err);
      }
    }

    // Return photo with relations
    return this.getPhotoById(photo.id);
  }

  /**
   * Update a photo
   */
  async updatePhoto(id, photoData) {
    const photo = await photoRepository.updatePhoto(id, photoData);
    if (!photo) {
      const error = new Error("Photo not found");
      error.status = 404;
      throw error;
    }

    // Update categories if provided
    if (photoData.categoryIds !== undefined) {
      try {
        await categoryRepository.setPhotoCategories(id, photoData.categoryIds || []);
      } catch (err) {
        console.error("Failed to update categories:", err);
      }
    }

    // Update subcategories if provided
    if (photoData.subcategoryIds !== undefined) {
      try {
        await categoryRepository.setPhotoSubcategories(id, photoData.subcategoryIds || []);
      } catch (err) {
        console.error("Failed to update subcategories:", err);
      }
    }

    // Return photo with updated relations
    return this.getPhotoById(id);
  }

  /**
   * Delete a photo
   */
  async deletePhoto(id) {
    const photo = await photoRepository.getPhotoById(id);
    if (!photo) {
      const error = new Error("Photo not found");
      error.status = 404;
      throw error;
    }

    // Delete file from disk
    const filePath = path.join("uploads/photos", photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await photoRepository.deletePhoto(id);
    return { message: "Photo deleted successfully" };
  }

  /**
   * Reorder photos by updating displayOrder
   * @param {Array<{id: number, displayOrder: number}>} orderedPhotos
   */
  async reorderPhotos(orderedPhotos) {
    const updates = orderedPhotos.map(({ id, displayOrder }) =>
      photoRepository.updatePhoto(id, { displayOrder })
    );
    await Promise.all(updates);
    return { message: "Photos reordered successfully" };
  }
}

module.exports = { photoService: new PhotoService() };
