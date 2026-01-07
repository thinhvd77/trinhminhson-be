/**
 * Vocabulary Service
 * Business logic for vocabulary sets and flashcards
 */

const { vocabularyRepository } = require("./vocabulary.repository");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const MAX_FACES = 10;

class VocabularyService {
    /**
     * Get all vocabulary sets
     */
    async getAllSets({ viewerUserId = null, scope } = {}) {
        const resolvedScope = scope || (viewerUserId ? "personal" : "community");
        return await vocabularyRepository.getAllSets({ viewerUserId, scope: resolvedScope });
    }

    /**
     * Get a vocabulary set with flashcards
     */
    async getSetWithFlashcards(id, { viewerUserId = null, includeAll = false } = {}) {
        const setMeta = await vocabularyRepository.getSetById(id);
        if (!setMeta) {
            throw new Error("Vocabulary set not found");
        }

        const isOwner = !!viewerUserId && setMeta.owner_id === viewerUserId;

        // Private sets are only visible to their owner
        if (!isOwner && !setMeta.is_shared) {
            throw new Error("Vocabulary set not found");
        }

        const effectiveIncludeAll = isOwner ? includeAll : true;
        const full = await vocabularyRepository.getSetWithFlashcards(id, effectiveIncludeAll);
        if (!full) {
            throw new Error("Vocabulary set not found");
        }

        // For non-owners, return preview-only data (no learned tracking, default settings)
        if (!isOwner) {
            return {
                ...full,
                is_owner: false,
                default_face: 0, // Community sets always use default face order
                learnedCount: 0,
                flashcards: (full.flashcards || []).map((c) => ({
                    ...c,
                    learned: false,
                })),
            };
        }

        return {
            ...full,
            is_owner: true,
        };
    }

    /**
     * Upload Excel file and create vocabulary set
     */
    async uploadAndCreateSet(file, name, description = "", ownerId) {
        if (!file) {
            throw new Error("No file uploaded");
        }

        if (!ownerId) {
            const error = new Error("Authentication required");
            error.status = 401;
            throw error;
        }

        const filePath = file.path;
        const setName = name || path.parse(file.originalname).name;

        try {
            // Read Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (rawData.length < 2) {
                throw new Error("Excel file must have at least one row of data");
            }

            const headerRow = rawData[0];
            const dataRows = rawData.slice(1);

            const faceCount = Math.min(MAX_FACES, headerRow.length);

            if (faceCount == 0) {
                throw new Error("Excel file has no data columns");
            }

            // Create vocabulary set
            const setId = await vocabularyRepository.createSet({
                name: setName,
                description,
                ownerId,
                isShared: false,
                faceCount,
            });

            const cards = dataRows
            .filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ""))
            .map((row) => {
                const card = {};
                for (let i = 0; i < faceCount; i++) {
                    card[`face${i + 1}`] = row[i] !== undefined ? String(row[i]) : "";
                }
                return card;
            });

            if (cards.length === 0) {
                throw new Error("Excel file contains no valid data rows");
            }

            await vocabularyRepository.createFlashcards(setId, cards, faceCount);

            return {
                setId,
                cardCount: cards.length,
                faceCount,
            };
        } finally {
            // Clean up uploaded file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    /**
     * Update a vocabulary set (owner-only)
     */
    async updateSet(id, data, ownerId) {
        const success = await vocabularyRepository.updateSetOwnedBy(id, ownerId, data);
        if (!success) {
            const error = new Error("Vocabulary set not found");
            error.status = 404;
            throw error;
        }
        return await vocabularyRepository.getSetById(id);
    }

    /**
     * Delete a vocabulary set (owner-only)
     */
    async deleteSet(id, ownerId) {
        const success = await vocabularyRepository.deleteSetOwnedBy(id, ownerId);
        if (!success) {
            const error = new Error("Vocabulary set not found");
            error.status = 404;
            throw error;
        }
    }

    /**
     * Reorder vocabulary sets (owner-only)
     */
    async reorderSets(orderedIds, ownerId) {
        if (!Array.isArray(orderedIds)) {
            throw new Error("orderedIds must be an array");
        }
        await vocabularyRepository.reorderSetsOwnedBy(orderedIds, ownerId);
    }

    /**
     * Mark a flashcard as learned (owner-only)
     */
    async markFlashcardLearned(id, learned, ownerId) {
        const success = await vocabularyRepository.updateFlashcardLearnedOwnedBy(id, learned, ownerId);
        if (!success) {
            const error = new Error("Flashcard not found");
            error.status = 404;
            throw error;
        }
        return { learned: !!learned };
    }

    /**
     * Reset all flashcards in a set (owner-only)
     */
    async resetSet(id, ownerId) {
        const count = await vocabularyRepository.resetSetFlashcardsOwnedBy(id, ownerId);
        return { count };
    }

    /**
     * Clone a shared (community) set into the user's personal sets.
     */
    async cloneSharedSet(sourceSetId, ownerId) {
        const payload = await vocabularyRepository.getSetWithAllFlashcardsForClone(sourceSetId);
        if (!payload) {
            const error = new Error("Vocabulary set not found");
            error.status = 404;
            throw error;
        }

        const { set, flashcards: sourceCards } = payload;
        const isSourceOwner = set.owner_id === ownerId;
        if (!set.is_shared && !isSourceOwner) {
            const error = new Error("Vocabulary set not found");
            error.status = 404;
            throw error;
        }

        const newSetName = `${set.name} (Copy)`;
        const newSetId = await vocabularyRepository.createSet({
            name: newSetName,
            description: set.description || "",
            ownerId,
            isShared: false,
            clonedFromSetId: set.id,
            // Lưu ID tác giả gốc: nếu bộ từ đã được clone thì giữ nguyên original_owner_id, 
            // ngược lại lưu owner_id của bộ từ nguồn
            originalOwnerId: set.original_owner_id || set.owner_id,
        });

        const cardsToCreate = (sourceCards || []).map((c) => ({
            kanji: c.kanji,
            meaning: c.meaning,
            pronunciation: c.pronunciation,
            sino_vietnamese: c.sinoVietnamese,
            example: c.example,
        }));

        await vocabularyRepository.createFlashcards(newSetId, cardsToCreate);

        return { setId: newSetId, cardCount: cardsToCreate.length };
    }
}

module.exports = { vocabularyService: new VocabularyService() };
