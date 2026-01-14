/**
 * Photo Routes
 * API endpoints for photos
 */

const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../../shared/middlewares/auth.middleware");
const { uploadLimiter } = require("../../shared/middlewares/rate-limit.middleware");
const {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  getCategories,
} = require("./photo.controller");

const router = Router();

// Ensure uploads/photos directory exists
const uploadDir = "uploads/photos";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for photo upload with security measures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const safeExt = ['.jpeg', '.jpg', '.png'].includes(ext) ? ext : '.jpg';
    cb(null, "photo-" + uniqueSuffix + safeExt);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only JPG and PNG images are allowed"));
  },
});

// Public routes
router.get("/photos", getAllPhotos);
router.get("/photos/categories", getCategories);
router.get("/photos/:id", getPhotoById);

// Protected routes
router.post("/photos", authMiddleware, uploadLimiter, upload.single("file"), uploadPhoto);
router.patch("/photos/:id", authMiddleware, updatePhoto);
router.delete("/photos/:id", authMiddleware, deletePhoto);

module.exports = { photoRoutes: router };

