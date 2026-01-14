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
   * Get all photos with their subcategories
   */
  async getAllPhotos({ category, isPublic, limit, offset } = {}) {
    const photos = await photoRepository.getAllPhotos({ category, isPublic, limit, offset });

    // Fetch subcategories for each photo
    const photosWithSubcategories = await Promise.all(
      photos.map(async (photo) => {
        const subcategories = await categoryRepository.getPhotoSubcategories(photo.id);
        return {
          ...photo,
          subcategories: subcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
          })),
        };
      })
    );

    return photosWithSubcategories;
  }

  /**
   * Get photo by ID with subcategories
   */
  async getPhotoById(id) {
    const photo = await photoRepository.getPhotoById(id);
    if (!photo) {
      const error = new Error("Photo not found");
      error.status = 404;
      throw error;
    }

    // Get subcategories for this photo
    const subcategories = await categoryRepository.getPhotoSubcategories(id);
    return {
      ...photo,
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

      // Generate optimized versions
      const baseName = path.parse(file.filename).name;
      const uploadDir = "uploads/photos";

      // Thumbnail (400px width)
      await sharp(file.path)
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(path.join(uploadDir, `${baseName}_thumb.jpg`));

      // Medium (800px width) for gallery
      await sharp(file.path)
        .resize(800, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(path.join(uploadDir, `${baseName}_medium.jpg`));

      // Large (1600px width) for lightbox
      await sharp(file.path)
        .resize(1600, null, { withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(path.join(uploadDir, `${baseName}_large.jpg`));

    } catch (err) {
      console.error("Failed to process image:", err);
    }

    const photo = await photoRepository.createPhoto({
      title: photoData.title,
      filename: file.filename,
      originalName: file.originalname,
      category: photoData.category,
      dateTaken: photoData.dateTaken,
      aspectRatio: aspectRatio || photoData.aspectRatio || "landscape",
      width,
      height,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
      isPublic: photoData.isPublic !== false,
    });

    // Link subcategories if provided
    if (photoData.subcategoryIds && photoData.subcategoryIds.length > 0) {
      try {
        await categoryRepository.setPhotoSubcategories(photo.id, photoData.subcategoryIds);
      } catch (err) {
        console.error("Failed to link subcategories:", err);
      }
    }

    return photo;
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

    // Update subcategories if provided
    if (photoData.subcategoryIds !== undefined) {
      try {
        await categoryRepository.setPhotoSubcategories(id, photoData.subcategoryIds || []);
      } catch (err) {
        console.error("Failed to update subcategories:", err);
      }
    }

    // Fetch updated subcategories to return
    const subcategories = await categoryRepository.getPhotoSubcategories(id);
    return {
      ...photo,
      subcategories: subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
      })),
    };
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
   * Get all categories
   */
  async getCategories() {
    return await photoRepository.getCategories();
  }
}

module.exports = { photoService: new PhotoService() };
