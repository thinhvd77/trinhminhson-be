/**
 * Photo Category Repository
 * Database operations for photo categories and subcategories
 */

const { db } = require("../../shared/core/db");
const { photoCategories, photoSubcategories, photoSubcategoryRelations } = require("./category.model");
const { eq, asc, and } = require("drizzle-orm");

// ========== CATEGORIES ==========

/**
 * Get all categories with their subcategories
 */
async function getAllCategories(includeInactive = false) {
  const whereClause = includeInactive ? undefined : eq(photoCategories.isActive, true);
  
  const categories = await db
    .select()
    .from(photoCategories)
    .where(whereClause)
    .orderBy(asc(photoCategories.displayOrder), asc(photoCategories.name));

  // Get subcategories for each category
  const result = await Promise.all(
    categories.map(async (category) => {
      const subWhereClause = includeInactive
        ? eq(photoSubcategories.categoryId, category.id)
        : and(eq(photoSubcategories.categoryId, category.id), eq(photoSubcategories.isActive, true));

      const subcategories = await db
        .select()
        .from(photoSubcategories)
        .where(subWhereClause)
        .orderBy(asc(photoSubcategories.displayOrder), asc(photoSubcategories.name));

      return {
        ...category,
        subcategories,
      };
    })
  );

  return result;
}

/**
 * Get category by ID
 */
async function getCategoryById(id) {
  const [category] = await db
    .select()
    .from(photoCategories)
    .where(eq(photoCategories.id, id))
    .limit(1);

  if (!category) return null;

  const subcategories = await db
    .select()
    .from(photoSubcategories)
    .where(eq(photoSubcategories.categoryId, id))
    .orderBy(asc(photoSubcategories.displayOrder), asc(photoSubcategories.name));

  return { ...category, subcategories };
}

/**
 * Create a new category
 */
async function createCategory(data) {
  const [category] = await db
    .insert(photoCategories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      displayOrder: data.displayOrder || 0,
      isActive: data.isActive !== false,
    })
    .returning();

  return { ...category, subcategories: [] };
}

/**
 * Update a category
 */
async function updateCategory(id, data) {
  const [category] = await db
    .update(photoCategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(photoCategories.id, id))
    .returning();

  return category;
}

/**
 * Delete a category (cascade deletes subcategories)
 */
async function deleteCategory(id) {
  await db.delete(photoCategories).where(eq(photoCategories.id, id));
}

// ========== SUBCATEGORIES ==========

/**
 * Get subcategory by ID
 */
async function getSubcategoryById(id) {
  const [subcategory] = await db
    .select()
    .from(photoSubcategories)
    .where(eq(photoSubcategories.id, id))
    .limit(1);

  return subcategory;
}

/**
 * Create a new subcategory
 */
async function createSubcategory(data) {
  const [subcategory] = await db
    .insert(photoSubcategories)
    .values({
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      displayOrder: data.displayOrder || 0,
      isActive: data.isActive !== false,
    })
    .returning();

  return subcategory;
}

/**
 * Update a subcategory
 */
async function updateSubcategory(id, data) {
  const [subcategory] = await db
    .update(photoSubcategories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(photoSubcategories.id, id))
    .returning();

  return subcategory;
}

/**
 * Delete a subcategory
 */
async function deleteSubcategory(id) {
  await db.delete(photoSubcategories).where(eq(photoSubcategories.id, id));
}

// ========== PHOTO-SUBCATEGORY RELATIONS ==========

/**
 * Get subcategories for a photo
 */
async function getPhotoSubcategories(photoId) {
  const relations = await db
    .select({
      subcategory: photoSubcategories,
      category: photoCategories,
    })
    .from(photoSubcategoryRelations)
    .innerJoin(photoSubcategories, eq(photoSubcategoryRelations.subcategoryId, photoSubcategories.id))
    .innerJoin(photoCategories, eq(photoSubcategories.categoryId, photoCategories.id))
    .where(eq(photoSubcategoryRelations.photoId, photoId));

  return relations.map((r) => ({
    ...r.subcategory,
    category: r.category,
  }));
}

/**
 * Set subcategories for a photo (replaces existing)
 */
async function setPhotoSubcategories(photoId, subcategoryIds) {
  // Delete existing relations
  await db
    .delete(photoSubcategoryRelations)
    .where(eq(photoSubcategoryRelations.photoId, photoId));

  // Insert new relations
  if (subcategoryIds && subcategoryIds.length > 0) {
    await db.insert(photoSubcategoryRelations).values(
      subcategoryIds.map((subcategoryId) => ({
        photoId,
        subcategoryId,
      }))
    );
  }
}

/**
 * Add a subcategory to a photo
 */
async function addPhotoSubcategory(photoId, subcategoryId) {
  await db.insert(photoSubcategoryRelations).values({
    photoId,
    subcategoryId,
  });
}

/**
 * Remove a subcategory from a photo
 */
async function removePhotoSubcategory(photoId, subcategoryId) {
  await db
    .delete(photoSubcategoryRelations)
    .where(
      and(
        eq(photoSubcategoryRelations.photoId, photoId),
        eq(photoSubcategoryRelations.subcategoryId, subcategoryId)
      )
    );
}

/**
 * Get photos by subcategory
 */
async function getPhotoIdsBySubcategory(subcategoryId) {
  const relations = await db
    .select({ photoId: photoSubcategoryRelations.photoId })
    .from(photoSubcategoryRelations)
    .where(eq(photoSubcategoryRelations.subcategoryId, subcategoryId));

  return relations.map((r) => r.photoId);
}

/**
 * Get photos by category (all subcategories in that category)
 */
async function getPhotoIdsByCategory(categoryId) {
  const relations = await db
    .select({ photoId: photoSubcategoryRelations.photoId })
    .from(photoSubcategoryRelations)
    .innerJoin(photoSubcategories, eq(photoSubcategoryRelations.subcategoryId, photoSubcategories.id))
    .where(eq(photoSubcategories.categoryId, categoryId));

  return [...new Set(relations.map((r) => r.photoId))];
}

module.exports = {
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Subcategories
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  // Photo-Subcategory Relations
  getPhotoSubcategories,
  setPhotoSubcategories,
  addPhotoSubcategory,
  removePhotoSubcategory,
  getPhotoIdsBySubcategory,
  getPhotoIdsByCategory,
};
