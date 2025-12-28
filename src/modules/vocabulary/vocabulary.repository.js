/**
 * Vocabulary Repository
 * Handles all database operations for vocabulary sets and flashcards
 */

const { db } = require("../../shared/core/db");
const { vocabularySets, flashcards } = require("./vocabulary.model");
const { users } = require("../users/user.model");
const { eq, sql, and, or, isNull, inArray, ne, desc } = require("drizzle-orm");
const { alias } = require("drizzle-orm/pg-core");

class VocabularyRepository {
    // ============= Vocabulary Sets =============

    /**
     * Get all vocabulary sets with card count
     */
    async getAllSets({ viewerUserId = null, scope = "community" } = {}) {
        // scope:
        // - personal: only sets owned by viewer
        // - community: shared sets (visible to guests)
        const isPersonal = scope === "personal";

        // Guests cannot fetch personal sets
        if (isPersonal && !viewerUserId) {
            return [];
        }

        let whereClause;
        if (isPersonal) {
            whereClause = eq(vocabularySets.ownerId, viewerUserId);
        } else {
            // Community: only shared sets; for logged-in users, hide their own sets
            whereClause = and(
                eq(vocabularySets.isShared, true),
                viewerUserId ? or(isNull(vocabularySets.ownerId), ne(vocabularySets.ownerId, viewerUserId)) : sql`TRUE`
            );
        }

        // Create alias for original owner
        const originalOwner = alias(users, 'original_owner');

        const sets = await db
            .select({
                id: vocabularySets.id,
                ownerId: vocabularySets.ownerId,
                name: vocabularySets.name,
                description: vocabularySets.description,
                sortOrder: vocabularySets.sortOrder,
                defaultFace: vocabularySets.defaultFace,
                isShared: vocabularySets.isShared,
                sharedAt: vocabularySets.sharedAt,
                clonedFromSetId: vocabularySets.clonedFromSetId,
                originalOwnerId: vocabularySets.originalOwnerId,
                createdAt: vocabularySets.createdAt,
                updatedAt: vocabularySets.updatedAt,
                ownerName: users.name,
                originalOwnerName: originalOwner.name,
            })
            .from(vocabularySets)
            .leftJoin(users, eq(vocabularySets.ownerId, users.id))
            .leftJoin(originalOwner, eq(vocabularySets.originalOwnerId, originalOwner.id))
            .where(whereClause)
            .orderBy(
                // Personal sets keep existing ordering; community sets show newest shared first
                isPersonal ? vocabularySets.sortOrder : desc(vocabularySets.sharedAt),
                isPersonal ? vocabularySets.createdAt : desc(vocabularySets.createdAt)
            );

        // Get card counts for all sets
        const cardCounts = await db
            .select({
                setId: flashcards.setId,
                count: sql`COUNT(*)`.as('count'),
            })
            .from(flashcards)
            .groupBy(flashcards.setId);

        // Create a map of setId -> count
        const countMap = new Map();
        cardCounts.forEach((c) => countMap.set(c.setId, Number(c.count)));

        return sets.map((row) => ({
            id: row.id,
            owner_id: row.ownerId,
            owner_name: row.ownerName || null,
            name: row.name,
            description: row.description,
            original_owner_id: row.originalOwnerId,
            original_owner_name: row.originalOwnerName || null,
            is_shared: row.isShared,
            shared_at: row.sharedAt,
            cloned_from_set_id: row.clonedFromSetId,
            sort_order: row.sortOrder,
            // Community sets always use default face (0), personal sets keep owner's setting
            default_face: isPersonal ? row.defaultFace : 0,
            created_at: row.createdAt,
            updated_at: row.updatedAt,
            card_count: countMap.get(row.id) || 0,
        }));
    }

    /**
     * Get a vocabulary set by ID
     */
    async getSetById(id) {
        const originalOwner = alias(users, 'original_owner');

        const [row] = await db
            .select({
                id: vocabularySets.id,
                ownerId: vocabularySets.ownerId,
                name: vocabularySets.name,
                description: vocabularySets.description,
                sortOrder: vocabularySets.sortOrder,
                defaultFace: vocabularySets.defaultFace,
                isShared: vocabularySets.isShared,
                sharedAt: vocabularySets.sharedAt,
                clonedFromSetId: vocabularySets.clonedFromSetId,
                originalOwnerId: vocabularySets.originalOwnerId,
                createdAt: vocabularySets.createdAt,
                updatedAt: vocabularySets.updatedAt,
                ownerName: users.name,
                originalOwnerName: originalOwner.name,
            })
            .from(vocabularySets)
            .leftJoin(users, eq(vocabularySets.ownerId, users.id))
            .leftJoin(originalOwner, eq(vocabularySets.originalOwnerId, originalOwner.id))
            .where(eq(vocabularySets.id, id));

        if (!row) return null;

        return {
            id: row.id,
            owner_id: row.ownerId,
            owner_name: row.ownerName || null,
            name: row.name,
            description: row.description,
            original_owner_id: row.originalOwnerId,
            original_owner_name: row.originalOwnerName || null,
            is_shared: row.isShared,
            shared_at: row.sharedAt,
            cloned_from_set_id: row.clonedFromSetId,
            sort_order: row.sortOrder,
            default_face: row.defaultFace,
            created_at: row.createdAt,
            updated_at: row.updatedAt,
        };
    }

    /**
     * Get a vocabulary set with its flashcards
     */
    async getSetWithFlashcards(id, includeAll = false) {
        const set = await this.getSetById(id);
        if (!set) return null;

        let flashcardsQuery = db.select().from(flashcards).where(eq(flashcards.setId, id));

        if (!includeAll) {
            flashcardsQuery = db
                .select()
                .from(flashcards)
                .where(
                    and(
                        eq(flashcards.setId, id),
                        or(eq(flashcards.learned, false), isNull(flashcards.learned))
                    )
                );
        }

        const cards = await flashcardsQuery;

        // Get total and learned count
        const [counts] = await db
            .select({
                total: sql`COUNT(*)`,
                learned: sql`SUM(CASE WHEN learned = true THEN 1 ELSE 0 END)`,
            })
            .from(flashcards)
            .where(eq(flashcards.setId, id));

        return {
            ...set,
            flashcards: cards.map((card) => ({
                ...card,
                set_id: card.setId,
                sino_vietnamese: card.sinoVietnamese,
                created_at: card.createdAt,
            })),
            totalCount: Number(counts.total),
            learnedCount: Number(counts.learned) || 0,
        };
    }

    /**
     * Create a new vocabulary set
     */
    async createSet({ name, description = "", ownerId = null, isShared = false, clonedFromSetId = null, originalOwnerId = null } = {}) {
        const [result] = await db
            .insert(vocabularySets)
            .values({
                ownerId,
                name,
                description,
                isShared,
                sharedAt: isShared ? new Date() : null,
                clonedFromSetId,
                originalOwnerId,
            })
            .returning({ id: vocabularySets.id });

        return result.id;
    }

    /**
     * Update a vocabulary set
     */
    async updateSetOwnedBy(id, ownerId, data) {
        const updateData = {
            updatedAt: new Date(),
        };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.default_face !== undefined) updateData.defaultFace = data.default_face;
        if (data.sort_order !== undefined) updateData.sortOrder = data.sort_order;
        if (data.is_shared !== undefined) {
            updateData.isShared = !!data.is_shared;
            updateData.sharedAt = data.is_shared ? new Date() : null;
        }

        const result = await db
            .update(vocabularySets)
            .set(updateData)
            .where(and(eq(vocabularySets.id, id), eq(vocabularySets.ownerId, ownerId)))
            .returning();

        return result.length > 0;
    }

    /**
     * Delete a vocabulary set
     */
    async deleteSetOwnedBy(id, ownerId) {
        const result = await db
            .delete(vocabularySets)
            .where(and(eq(vocabularySets.id, id), eq(vocabularySets.ownerId, ownerId)))
            .returning();

        return result.length > 0;
    }

    /**
     * Reorder vocabulary sets
     */
    async reorderSetsOwnedBy(orderedIds, ownerId) {
        // Ensure all sets belong to the user
        const owned = await db
            .select({ id: vocabularySets.id })
            .from(vocabularySets)
            .where(and(eq(vocabularySets.ownerId, ownerId), inArray(vocabularySets.id, orderedIds)));

        if (owned.length !== orderedIds.length) {
            const error = new Error("You can only reorder your own sets");
            error.status = 403;
            throw error;
        }

        for (let i = 0; i < orderedIds.length; i++) {
            await db
                .update(vocabularySets)
                .set({ sortOrder: i, updatedAt: new Date() })
                .where(and(eq(vocabularySets.id, orderedIds[i]), eq(vocabularySets.ownerId, ownerId)));
        }
    }

    // ============= Flashcards =============

    /**
     * Create multiple flashcards
     */
    async createFlashcards(setId, cards) {
        const values = cards.map((card) => ({
            setId,
            kanji: card.kanji || "",
            meaning: card.meaning || "",
            pronunciation: card.pronunciation || "",
            sinoVietnamese: card.sino_vietnamese || "",
            example: card.example || "",
            learned: false,
        }));

        await db.insert(flashcards).values(values);
        return cards.length;
    }

    /**
     * Update flashcard learned status
     */
    async updateFlashcardLearnedOwnedBy(id, learned, ownerId) {
        // Ensure flashcard belongs to a set owned by the user
        const [row] = await db
            .select({ cardId: flashcards.id })
            .from(flashcards)
            .leftJoin(vocabularySets, eq(flashcards.setId, vocabularySets.id))
            .where(and(eq(flashcards.id, id), eq(vocabularySets.ownerId, ownerId)));

        if (!row) return false;

        const result = await db
            .update(flashcards)
            .set({ learned: !!learned })
            .where(eq(flashcards.id, id))
            .returning();

        return result.length > 0;
    }

    /**
     * Reset all flashcards in a set
     */
    async resetSetFlashcardsOwnedBy(setId, ownerId) {
        // Ensure set belongs to the user
        const [owned] = await db
            .select({ id: vocabularySets.id })
            .from(vocabularySets)
            .where(and(eq(vocabularySets.id, setId), eq(vocabularySets.ownerId, ownerId)));

        if (!owned) {
            const error = new Error("You can only reset your own sets");
            error.status = 403;
            throw error;
        }

        const result = await db
            .update(flashcards)
            .set({ learned: false })
            .where(eq(flashcards.setId, setId))
            .returning();

        return result.length;
    }

    /**
     * Fetch a set with ALL flashcards (including learned) for cloning.
     */
    async getSetWithAllFlashcardsForClone(id) {
        const set = await this.getSetById(id);
        if (!set) return null;

        const cards = await db.select().from(flashcards).where(eq(flashcards.setId, id));
        return {
            set,
            flashcards: cards,
        };
    }
}

module.exports = { vocabularyRepository: new VocabularyRepository() };
