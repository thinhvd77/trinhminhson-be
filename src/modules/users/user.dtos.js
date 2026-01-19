const { z } = require("zod");

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(255, "Username is too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  name: z.string().min(2, "Name must be at least 2 characters").max(255, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "member"]).default("member"),
});

const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(255, "Username is too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(255, "Name is too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["admin", "member"]).optional(),
  isActive: z.boolean().optional(),
});

const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

const toggleStatusSchema = z.object({
  isActive: z.boolean(),
});

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  search: z.string().optional(),
  role: z.enum(["admin", "member", "all"]).optional(),
  status: z.enum(["active", "inactive", "all"]).optional(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  toggleStatusSchema,
  updateRoleSchema,
  paginationSchema,
};
