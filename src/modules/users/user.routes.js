const { Router } = require("express");
const {
  authGuard,
  adminGuard,
} = require("../../shared/middlewares/auth.middleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
} = require("./user.controller");

const router = Router();

// All user management routes require admin authentication
router.get("/users", authGuard, adminGuard, getAllUsers);
router.get("/users/:id", authGuard, adminGuard, getUserById);
router.post("/users", authGuard, adminGuard, createUser);
router.put("/users/:id", authGuard, adminGuard, updateUser);
router.delete("/users/:id", authGuard, adminGuard, deleteUser);
router.patch("/users/:id/status", authGuard, adminGuard, toggleUserStatus);
router.patch("/users/:id/role", authGuard, adminGuard, updateUserRole);

module.exports = { userRoutes: router };
