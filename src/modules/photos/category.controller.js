/**
 * Photo Category Controller
 * HTTP handlers for photo category endpoints
 */

const categoryService = require("./category.service");

// ========== CATEGORIES ==========

/**
 * Get all categories with subcategories
 */
async function getAllCategories(req, res, next) {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const categories = await categoryService.getAllCategories(includeInactive);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

/**
 * Get category by ID
 */
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(parseInt(id));
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.message === "Category not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Create a new category
 */
async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.message.includes("required") || error.message.includes("cannot be empty")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Update a category
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(parseInt(id), req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.message === "Category not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("required") || error.message.includes("cannot be empty")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Delete a category
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(parseInt(id));
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    if (error.message === "Category not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ========== SUBCATEGORIES ==========

/**
 * Get subcategory by ID
 */
async function getSubcategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const subcategory = await categoryService.getSubcategoryById(parseInt(id));
    res.json({ success: true, data: subcategory });
  } catch (error) {
    if (error.message === "Subcategory not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Create a new subcategory
 */
async function createSubcategory(req, res, next) {
  try {
    const subcategory = await categoryService.createSubcategory(req.body);
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("cannot be empty") ||
      error.message === "Parent category not found"
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Update a subcategory
 */
async function updateSubcategory(req, res, next) {
  try {
    const { id } = req.params;
    const subcategory = await categoryService.updateSubcategory(parseInt(id), req.body);
    res.json({ success: true, data: subcategory });
  } catch (error) {
    if (error.message === "Subcategory not found" || error.message === "Parent category not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("required") || error.message.includes("cannot be empty")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Delete a subcategory
 */
async function deleteSubcategory(req, res, next) {
  try {
    const { id } = req.params;
    await categoryService.deleteSubcategory(parseInt(id));
    res.json({ success: true, message: "Subcategory deleted successfully" });
  } catch (error) {
    if (error.message === "Subcategory not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ========== PHOTO-SUBCATEGORY RELATIONS ==========

/**
 * Get subcategories for a photo
 */
async function getPhotoSubcategories(req, res, next) {
  try {
    const { photoId } = req.params;
    const subcategories = await categoryService.getPhotoSubcategories(parseInt(photoId));
    res.json({ success: true, data: subcategories });
  } catch (error) {
    next(error);
  }
}

/**
 * Set subcategories for a photo
 */
async function setPhotoSubcategories(req, res, next) {
  try {
    const { photoId } = req.params;
    const { subcategoryIds } = req.body;
    const subcategories = await categoryService.setPhotoSubcategories(parseInt(photoId), subcategoryIds);
    res.json({ success: true, data: subcategories });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Initialize default categories
 */
async function initializeCategories(req, res, next) {
  try {
    await categoryService.initializeDefaultCategories();
    res.json({ success: true, message: "Categories initialized successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Subcategories
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  // Photo relations
  getPhotoSubcategories,
  setPhotoSubcategories,
  // Initialization
  initializeCategories,
};
