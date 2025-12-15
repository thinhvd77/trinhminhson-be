/**
 * Vocabulary Controller
 * HTTP request handlers for vocabulary endpoints
 */

const { vocabularyService } = require("./vocabulary.service");

class VocabularyController {
    /**
     * GET /vocabulary/sets - Get all vocabulary sets
     */
    async getAllSets(req, res) {
        try {
            const scope = req.query.scope; // 'personal' | 'community'
            const viewerUserId = req.user?.id ?? null;
            const sets = await vocabularyService.getAllSets({ viewerUserId, scope });
            res.json(sets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /vocabulary/sets/:id - Get a vocabulary set with flashcards
     */
    async getSet(req, res) {
        try {
            const includeAll = req.query.includeAll === "true";
            const viewerUserId = req.user?.id ?? null;
            const set = await vocabularyService.getSetWithFlashcards(req.params.id, {
                viewerUserId,
                includeAll,
            });
            res.json(set);
        } catch (error) {
            if (error.message === "Vocabulary set not found") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /vocabulary/upload - Upload Excel and create vocabulary set
     */
    async uploadSet(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const result = await vocabularyService.uploadAndCreateSet(
                req.file,
                req.body.name,
                req.body.description,
                req.user.id
            );
            res.status(201).json({
                message: "Vocabulary set created successfully",
                ...result,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * POST /vocabulary/sets/:id/clone - Clone a shared set into the current user's personal sets
     */
    async cloneSet(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const cloned = await vocabularyService.cloneSharedSet(req.params.id, req.user.id);
            res.status(201).json({ message: "Set cloned successfully", ...cloned });
        } catch (error) {
            if (error.message === "Vocabulary set not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.status) {
                return res.status(error.status).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * PATCH /vocabulary/sets/:id - Update vocabulary set
     */
    async updateSet(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const updated = await vocabularyService.updateSet(req.params.id, req.body, req.user.id);
            res.json(updated);
        } catch (error) {
            if (error.message === "Vocabulary set not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.status) {
                return res.status(error.status).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * DELETE /vocabulary/sets/:id - Delete vocabulary set
     */
    async deleteSet(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            await vocabularyService.deleteSet(req.params.id, req.user.id);
            res.json({ message: "Vocabulary set deleted successfully" });
        } catch (error) {
            if (error.message === "Vocabulary set not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.status) {
                return res.status(error.status).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /vocabulary/sets/reorder - Reorder vocabulary sets
     */
    async reorderSets(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            await vocabularyService.reorderSets(req.body.orderedIds, req.user.id);
            res.json({ message: "Sets reordered successfully" });
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }

    /**
     * PATCH /vocabulary/flashcards/:id/learned - Mark flashcard as learned
     */
    async markLearned(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const result = await vocabularyService.markFlashcardLearned(
                req.params.id,
                req.body.learned,
                req.user.id
            );
            res.json({ message: "Flashcard updated successfully", ...result });
        } catch (error) {
            if (error.message === "Flashcard not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.status) {
                return res.status(error.status).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /vocabulary/sets/:id/reset - Reset all flashcards in a set
     */
    async resetSet(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const result = await vocabularyService.resetSet(req.params.id, req.user.id);
            res.json({ message: "All flashcards reset successfully", ...result });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = { vocabularyController: new VocabularyController() };
