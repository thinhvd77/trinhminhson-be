const { z } = require("zod");

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(255, "Username is too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(2, "Name must be at least 2 characters").max(255, "Name is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(255, "Username is too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(255, "Name is too long").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean().optional(),
});

const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  paginationSchema,
};
