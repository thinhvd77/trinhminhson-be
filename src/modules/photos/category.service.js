/**
 * Photo Category Service
 * Business logic for photo categories and subcategories
 */

const categoryRepository = require("./category.repository");

/**
 * Generate slug from name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ========== CATEGORIES ==========

/**
 * Get all categories with subcategories
 */
async function getAllCategories(includeInactive = false) {
  return categoryRepository.getAllCategories(includeInactive);
}

/**
 * Get category by ID
 */
async function getCategoryById(id) {
  const category = await categoryRepository.getCategoryById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
}

/**
 * Create a new category
 */
async function createCategory(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error("Category name is required");
  }

  const slug = data.slug || generateSlug(data.name);

  return categoryRepository.createCategory({
    name: data.name.trim(),
    slug,
    description: data.description?.trim() || null,
    displayOrder: data.displayOrder || 0,
    isActive: data.isActive !== false,
  });
}

/**
 * Update a category
 */
async function updateCategory(id, data) {
  const existing = await categoryRepository.getCategoryById(id);
  if (!existing) {
    throw new Error("Category not found");
  }

  const updateData = {};
  if (data.name !== undefined) {
    updateData.name = data.name.trim();
    if (!updateData.name) {
      throw new Error("Category name cannot be empty");
    }
  }
  if (data.slug !== undefined) {
    updateData.slug = data.slug || generateSlug(data.name || existing.name);
  }
  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }
  if (data.displayOrder !== undefined) {
    updateData.displayOrder = data.displayOrder;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  return categoryRepository.updateCategory(id, updateData);
}

/**
 * Delete a category
 */
async function deleteCategory(id) {
  const category = await categoryRepository.getCategoryById(id);
  if (!category) {
    throw new Error("Category not found");
  }

  await categoryRepository.deleteCategory(id);
  return { success: true };
}

// ========== SUBCATEGORIES ==========

/**
 * Get subcategory by ID
 */
async function getSubcategoryById(id) {
  const subcategory = await categoryRepository.getSubcategoryById(id);
  if (!subcategory) {
    throw new Error("Subcategory not found");
  }
  return subcategory;
}

/**
 * Create a new subcategory
 */
async function createSubcategory(data) {
  if (!data.categoryId) {
    throw new Error("Category ID is required");
  }
  if (!data.name || !data.name.trim()) {
    throw new Error("Subcategory name is required");
  }

  // Verify category exists
  const category = await categoryRepository.getCategoryById(data.categoryId);
  if (!category) {
    throw new Error("Parent category not found");
  }

  const slug = data.slug || generateSlug(data.name);

  return categoryRepository.createSubcategory({
    categoryId: data.categoryId,
    name: data.name.trim(),
    slug,
    description: data.description?.trim() || null,
    displayOrder: data.displayOrder || 0,
    isActive: data.isActive !== false,
  });
}

/**
 * Update a subcategory
 */
async function updateSubcategory(id, data) {
  const existing = await categoryRepository.getSubcategoryById(id);
  if (!existing) {
    throw new Error("Subcategory not found");
  }

  const updateData = {};
  if (data.categoryId !== undefined) {
    // Verify new category exists
    const category = await categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new Error("Parent category not found");
    }
    updateData.categoryId = data.categoryId;
  }
  if (data.name !== undefined) {
    updateData.name = data.name.trim();
    if (!updateData.name) {
      throw new Error("Subcategory name cannot be empty");
    }
  }
  if (data.slug !== undefined) {
    updateData.slug = data.slug || generateSlug(data.name || existing.name);
  }
  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }
  if (data.displayOrder !== undefined) {
    updateData.displayOrder = data.displayOrder;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  return categoryRepository.updateSubcategory(id, updateData);
}

/**
 * Delete a subcategory
 */
async function deleteSubcategory(id) {
  const subcategory = await categoryRepository.getSubcategoryById(id);
  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  await categoryRepository.deleteSubcategory(id);
  return { success: true };
}

// ========== PHOTO-SUBCATEGORY RELATIONS ==========

/**
 * Get subcategories for a photo
 */
async function getPhotoSubcategories(photoId) {
  return categoryRepository.getPhotoSubcategories(photoId);
}

/**
 * Set subcategories for a photo
 */
async function setPhotoSubcategories(photoId, subcategoryIds) {
  // Validate subcategory IDs exist
  if (subcategoryIds && subcategoryIds.length > 0) {
    for (const subcategoryId of subcategoryIds) {
      const subcategory = await categoryRepository.getSubcategoryById(subcategoryId);
      if (!subcategory) {
        throw new Error(`Subcategory with ID ${subcategoryId} not found`);
      }
    }
  }

  await categoryRepository.setPhotoSubcategories(photoId, subcategoryIds);
  return categoryRepository.getPhotoSubcategories(photoId);
}

/**
 * Initialize default categories
 */
async function initializeDefaultCategories() {
  const existing = await categoryRepository.getAllCategories(true);
  if (existing.length > 0) {
    console.log("Categories already exist, skipping initialization");
    return;
  }

  const defaultCategories = [
    {
      name: "Đối tượng",
      slug: "doi-tuong",
      displayOrder: 1,
      subcategories: [
        { name: "Nam", slug: "nam" },
        { name: "Nữ", slug: "nu" },
        { name: "Đơn", slug: "don" },
        { name: "Couple", slug: "couple" },
        { name: "Nhóm", slug: "nhom" },
      ],
    },
    {
      name: "Có phụ kiện",
      slug: "co-phu-kien",
      displayOrder: 2,
      subcategories: [
        { name: "Bộ trang phục", slug: "bo-trang-phuc" },
        { name: "Trang sức", slug: "trang-suc" },
        { name: "Hoa", slug: "hoa" },
        { name: "Khác", slug: "phu-kien-khac" },
      ],
    },
    {
      name: "Phong cảnh",
      slug: "phong-canh",
      displayOrder: 3,
      subcategories: [
        { name: "Theo mùa", slug: "theo-mua" },
        { name: "Đồng cỏ", slug: "dong-co" },
        { name: "Rừng núi", slug: "rung-nui" },
        { name: "Biển", slug: "bien" },
        { name: "Khác", slug: "phong-canh-khac" },
      ],
    },
    {
      name: "Concept",
      slug: "concept",
      displayOrder: 4,
      subcategories: [
        { name: "Sinh nhật", slug: "sinh-nhat" },
        { name: "Quán sá", slug: "quan-sa" },
        { name: "Đường phố", slug: "duong-pho" },
        { name: "Hóa thân", slug: "hoa-than" },
        { name: "Ảnh cưới", slug: "anh-cuoi" },
        { name: "Kỷ yếu", slug: "ky-yeu" },
        { name: "Beauty", slug: "beauty" },
        { name: "Nude", slug: "nude" },
        { name: "Khác", slug: "concept-khac" },
      ],
    },
    {
      name: "Thời gian chụp",
      slug: "thoi-gian-chup",
      displayOrder: 5,
      subcategories: [
        { name: "2025", slug: "2025" },
        { name: "2026", slug: "2026" },
        { name: "2027", slug: "2027" },
      ],
    },
  ];

  console.log("Initializing default photo categories...");

  for (const cat of defaultCategories) {
    const category = await categoryRepository.createCategory({
      name: cat.name,
      slug: cat.slug,
      displayOrder: cat.displayOrder,
    });

    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      await categoryRepository.createSubcategory({
        categoryId: category.id,
        name: sub.name,
        slug: sub.slug,
        displayOrder: i + 1,
      });
    }
  }

  console.log("Default photo categories initialized successfully");
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
  // Photo relations
  getPhotoSubcategories,
  setPhotoSubcategories,
  // Initialization
  initializeDefaultCategories,
};
