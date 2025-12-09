const noteService = require("./note.service");
const {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
} = require("./note.schema");

class NoteController {
  // Get all notes
  async getAllNotes(req, res, next) {
    try {
      const notes = await noteService.getAllNotes();
      res.json({
        success: true,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get note by ID
  async getNoteById(req, res, next) {
    try {
      const { id } = noteIdSchema.parse(req.params);
      const note = await noteService.getNoteById(id);
      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new note
  async createNote(req, res, next) {
    try {
      const noteData = createNoteSchema.parse(req.body);
      const note = await noteService.createNote(noteData);
      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update note
  async updateNote(req, res, next) {
    try {
      const { id } = noteIdSchema.parse(req.params);
      const noteData = updateNoteSchema.parse(req.body);
      const note = await noteService.updateNote(id, noteData);
      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete note
  async deleteNote(req, res, next) {
    try {
      const { id } = noteIdSchema.parse(req.params);
      await noteService.deleteNote(id);
      res.json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete all notes
  async deleteAllNotes(req, res, next) {
    try {
      await noteService.deleteAllNotes();
      res.json({
        success: true,
        message: "All notes deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NoteController();
