/**
 * Photo Controller
 * HTTP request handlers for photos
 */

const { photoService } = require("./photo.service");

/**
 * Get all photos
 */
async function getAllPhotos(req, res, next) {
  try {
    const { categoryId, limit, offset } = req.query;
    const photos = await photoService.getAllPhotos({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      isPublic: true,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    res.json(photos);
  } catch (error) {
    next(error);
  }
}

/**
 * Get photo by ID
 */
async function getPhotoById(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(parseInt(id));
    res.json(photo);
  } catch (error) {
    next(error);
  }
}

/**
 * Upload a new photo (single file - kept for backward compatibility)
 */
async function uploadPhoto(req, res, next) {
  try {
    const file = req.file;
    const { title, categoryIds, subcategoryIds, dateTaken, isPublic } = req.body;
    const uploadedBy = req.user?.id;

    // Parse categoryIds
    let parsedCategoryIds = [];
    if (categoryIds) {
      try {
        parsedCategoryIds = typeof categoryIds === 'string'
          ? JSON.parse(categoryIds)
          : categoryIds;
      } catch (e) {
        console.error('Failed to parse categoryIds:', e);
      }
    }

    // Parse subcategoryIds
    let parsedSubcategoryIds = [];
    if (subcategoryIds) {
      try {
        parsedSubcategoryIds = typeof subcategoryIds === 'string'
          ? JSON.parse(subcategoryIds)
          : subcategoryIds;
      } catch (e) {
        console.error('Failed to parse subcategoryIds:', e);
      }
    }

    // Auto-generate title from filename if not provided
    const photoTitle = title || file.originalname.replace(/\.[^/.]+$/, '');

    const photo = await photoService.uploadPhoto(
      file,
      {
        title: photoTitle,
        categoryIds: parsedCategoryIds,
        subcategoryIds: parsedSubcategoryIds,
        dateTaken,
        isPublic: isPublic === "true" || isPublic === true,
      },
      uploadedBy
    );

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
}

/**
 * Upload multiple photos (up to 10 files)
 * Title is auto-generated from filename for each photo
 */
async function uploadMultiplePhotos(req, res, next) {
  try {
    const files = req.files;
    const { categoryIds, subcategoryIds, dateTaken, isPublic } = req.body;
    const uploadedBy = req.user?.id;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (files.length > 10) {
      return res.status(400).json({ error: "Maximum 10 files allowed per upload" });
    }

    // Parse categoryIds
    let parsedCategoryIds = [];
    if (categoryIds) {
      try {
        parsedCategoryIds = typeof categoryIds === 'string'
          ? JSON.parse(categoryIds)
          : categoryIds;
      } catch (e) {
        console.error('Failed to parse categoryIds:', e);
      }
    }

    // Parse subcategoryIds
    let parsedSubcategoryIds = [];
    if (subcategoryIds) {
      try {
        parsedSubcategoryIds = typeof subcategoryIds === 'string'
          ? JSON.parse(subcategoryIds)
          : subcategoryIds;
      } catch (e) {
        console.error('Failed to parse subcategoryIds:', e);
      }
    }

    const uploaded = [];
    const errors = [];

    for (const file of files) {
      try {
        // Auto-generate title from filename (remove extension)
        const title = file.originalname.replace(/\.[^/.]+$/, '');

        const photo = await photoService.uploadPhoto(
          file,
          {
            title,
            categoryIds: parsedCategoryIds,
            subcategoryIds: parsedSubcategoryIds,
            dateTaken,
            isPublic: isPublic === "true" || isPublic === true,
          },
          uploadedBy
        );
        uploaded.push(photo);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      message: `Successfully uploaded ${uploaded.length} of ${files.length} photos`,
      uploaded,
      errors,
      total: files.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a photo
 */
async function updatePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const photoData = req.body;
    const photo = await photoService.updatePhoto(parseInt(id), photoData);
    res.json(photo);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a photo
 */
async function deletePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const result = await photoService.deletePhoto(parseInt(id));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Reorder photos
 */
async function reorderPhotos(req, res, next) {
  try {
    const { orderedPhotos } = req.body;
    if (!Array.isArray(orderedPhotos)) {
      return res.status(400).json({ error: "orderedPhotos must be an array" });
    }
    const result = await photoService.reorderPhotos(orderedPhotos);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  uploadMultiplePhotos,
  updatePhoto,
  deletePhoto,
  reorderPhotos,
};
