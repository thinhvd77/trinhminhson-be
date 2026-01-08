const noteRepository = require("./note.repository");

class NoteService {
  async getAllNotes() {
    return await noteRepository.findAll();
  }

  async getNoteById(id) {
    const note = await noteRepository.findById(id);
    if (!note) {
      throw new Error("Note not found");
    }
    return note;
  }

  async createNote(noteData) {
    return await noteRepository.create(noteData);
  }

  async updateNote(id, noteData) {
    const existingNote = await noteRepository.findById(id);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    return await noteRepository.update(id, noteData);
  }

  async reorderNotes(noteIds) {
    return await noteRepository.reorderNotes(noteIds);
  }

  async deleteNote(id) {
    const existingNote = await noteRepository.findById(id);
    if (!existingNote) {
      throw new Error("Note not found");
    }

    return await noteRepository.delete(id);
  }

  async deleteAllNotes() {
    return await noteRepository.deleteAll();
  }
}

module.exports = new NoteService();
