/**
 * Photo Comment Routes
 * API endpoints for photo comments
 */

const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
    authMiddleware,
    optionalAuthMiddleware,
} = require("../../shared/middlewares/auth.middleware");
const {
    getComments,
    createComment,
    deleteComment,
} = require("./comment.controller");

const router = Router();

const uploadDir = "uploads/comments";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const safeExt = ['.jpeg', '.jpg', '.png'].includes(ext) ? ext : '.jpg';
    cb(null, "comment-" + uniqueSuffix + safeExt);
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

router.get("/photos/:photoId/comments", optionalAuthMiddleware, getComments);

router.post("/photos/:photoId/comments", optionalAuthMiddleware, upload.single("image"), createComment);

router.delete(
    "/photos/:photoId/comments/:commentId",
    authMiddleware,
    deleteComment
);

module.exports = { commentRoutes: router };
