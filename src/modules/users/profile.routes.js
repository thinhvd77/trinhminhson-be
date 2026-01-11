/**
 * Profile Routes
 * Routes for current user's profile management
 */

const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require("../../shared/middlewares/auth.middleware");
const { uploadLimiter, passwordChangeLimiter } = require("../../shared/middlewares/rate-limit.middleware");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
} = require("./profile.controller");

const router = Router();

// Configure multer for avatar upload with security measures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    // Generate secure filename to prevent path traversal
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize extension and only allow safe characters
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const safeExt = ['.jpeg', '.jpg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, "avatar-" + uniqueSuffix + safeExt);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// All profile routes require authentication
router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);
router.post("/profile/avatar", authMiddleware, uploadLimiter, upload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", authMiddleware, deleteAvatar);
router.patch("/profile/password", authMiddleware, passwordChangeLimiter, changePassword);

module.exports = { profileRoutes: router };
