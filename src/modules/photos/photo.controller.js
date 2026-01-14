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
    const { category, limit, offset } = req.query;
    const photos = await photoService.getAllPhotos({
      category,
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
 * Upload a new photo
 */
async function uploadPhoto(req, res, next) {
  try {
    const file = req.file;
    const { title, category, subcategoryIds, dateTaken, isPublic } = req.body;
    const uploadedBy = req.user?.id;

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

    const photo = await photoService.uploadPhoto(
      file,
      {
        title,
        category,
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
 * Get all categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = await photoService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  getCategories,
};
