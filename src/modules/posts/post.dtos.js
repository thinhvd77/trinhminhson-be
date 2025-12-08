const { z } = require("zod");

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title is too long"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  image: z.string().url("Image must be a valid URL"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(255, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  tags: z.string().min(1, "At least one tag is required"),
  readTime: z.string().optional().default("5 phút đọc"),
  userId: z.number().int().positive("User ID must be a positive integer"),
});

const updatePostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title is too long").optional(),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters").optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(255, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  tags: z.string().min(1, "At least one tag is required").optional(),
  readTime: z.string().optional(),
});

const postIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

const postSlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

const postQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  postSlugSchema,
  postQuerySchema,
};
