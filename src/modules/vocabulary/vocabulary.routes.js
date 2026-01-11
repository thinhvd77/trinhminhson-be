/**
 * Vocabulary Routes
 * API routes for vocabulary sets and flashcards
 */

const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { vocabularyController } = require("./vocabulary.controller");
const { authMiddleware, optionalAuthMiddleware } = require("../../shared/middlewares/auth.middleware");
const { uploadLimiter } = require("../../shared/middlewares/rate-limit.middleware");

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with security measures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate secure filename to prevent path traversal
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // Sanitize extension and only allow safe characters
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
        const safeExt = ['.xlsx', '.xls'].includes(ext) ? ext : '.xlsx';
        cb(null, uniqueSuffix + safeExt);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [".xlsx", ".xls"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
        }
    },
});

// Public routes (guest allowed)
// Optional auth allows tailoring results for logged-in users without forcing login.
router.get("/vocabulary/sets", optionalAuthMiddleware, (req, res) =>
    vocabularyController.getAllSets(req, res)
);

router.get("/vocabulary/sets/:id", optionalAuthMiddleware, (req, res) =>
    vocabularyController.getSet(req, res)
);

// Protected routes (authentication required + rate limiting for uploads)
router.post("/vocabulary/upload", authMiddleware, uploadLimiter, upload.single("file"), (req, res) =>
    vocabularyController.uploadSet(req, res)
);

// Clone a shared set into the authenticated user's personal sets
router.post("/vocabulary/sets/:id/clone", authMiddleware, (req, res) =>
    vocabularyController.cloneSet(req, res)
);

router.patch("/vocabulary/sets/:id", authMiddleware, (req, res) =>
    vocabularyController.updateSet(req, res)
);

router.delete("/vocabulary/sets/:id", authMiddleware, (req, res) =>
    vocabularyController.deleteSet(req, res)
);

router.post("/vocabulary/sets/reorder", authMiddleware, (req, res) =>
    vocabularyController.reorderSets(req, res)
);

router.patch("/vocabulary/flashcards/:id/learned", authMiddleware, (req, res) =>
    vocabularyController.markLearned(req, res)
);

router.post("/vocabulary/sets/:id/reset", authMiddleware, (req, res) =>
    vocabularyController.resetSet(req, res)
);

module.exports = { vocabularyRoutes: router };
