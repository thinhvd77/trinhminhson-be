/**
 * Photo Category Routes
 * API endpoints for managing photo categories and subcategories
 */

const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { authGuard, adminGuard } = require("../../shared/middlewares/auth.middleware");

// ========== PUBLIC ROUTES ==========

// Get all categories (with subcategories)
router.get("/", categoryController.getAllCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Get subcategory by ID
router.get("/subcategory/:id", categoryController.getSubcategoryById);

// Get subcategories for a photo
router.get("/photo/:photoId", categoryController.getPhotoSubcategories);

// ========== ADMIN ROUTES ==========

// Initialize default categories (admin only)
router.post("/initialize", authGuard, adminGuard, categoryController.initializeCategories);

// Create category (admin only)
router.post("/", authGuard, adminGuard, categoryController.createCategory);

// Update category (admin only)
router.put("/:id", authGuard, adminGuard, categoryController.updateCategory);

// Delete category (admin only)
router.delete("/:id", authGuard, adminGuard, categoryController.deleteCategory);

// Create subcategory (admin only)
router.post("/subcategory", authGuard, adminGuard, categoryController.createSubcategory);

// Update subcategory (admin only)
router.put("/subcategory/:id", authGuard, adminGuard, categoryController.updateSubcategory);

// Delete subcategory (admin only)
router.delete("/subcategory/:id", authGuard, adminGuard, categoryController.deleteSubcategory);

// Set subcategories for a photo (admin only)
router.put("/photo/:photoId", authGuard, adminGuard, categoryController.setPhotoSubcategories);

module.exports = router;
