const express = require("express");
const noteController = require("./note.controller");

const router = express.Router();

// Public routes - no authentication required
router.get("/notes", noteController.getAllNotes.bind(noteController));
router.get("/notes/:id", noteController.getNoteById.bind(noteController));
router.post("/notes", noteController.createNote.bind(noteController));
router.put("/notes/:id", noteController.updateNote.bind(noteController));
router.post("/notes/reorder", noteController.reorderNotes.bind(noteController));
router.delete("/notes/:id", noteController.deleteNote.bind(noteController));
router.delete("/notes", noteController.deleteAllNotes.bind(noteController));

module.exports = { noteRoutes: router };
