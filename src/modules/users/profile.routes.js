/**
 * Profile Routes
 * Routes for current user's profile management
 */

const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require("../../shared/middlewares/auth.middleware");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
} = require("./profile.controller");

const router = Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
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
router.post("/profile/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", authMiddleware, deleteAvatar);
router.patch("/profile/password", authMiddleware, changePassword);

module.exports = { profileRoutes: router };
