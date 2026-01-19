const { UserService } = require("./user.service");
const { createUserSchema, updateUserSchema, userIdSchema, paginationSchema, toggleStatusSchema, updateRoleSchema } = require("./user.dtos");

const userService = new UserService();

async function getAllUsers(req, res, next) {
  try {
    const { page, limit, search, role, status } = paginationSchema.parse(req.query);
    const result = await userService.getAllUsers(page, limit, { search, role, status });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = userIdSchema.parse(req.params);
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const userData = createUserSchema.parse(req.body);
    const user = await userService.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = userIdSchema.parse(req.params);
    const userData = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(id, userData);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = userIdSchema.parse(req.params);
    const currentUserId = req.user?.id;
    const result = await userService.deleteUser(id, currentUserId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const { id } = userIdSchema.parse(req.params);
    const { isActive } = toggleStatusSchema.parse(req.body);
    const currentUserId = req.user?.id;
    const user = await userService.toggleStatus(id, isActive, currentUserId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = userIdSchema.parse(req.params);
    const { role } = updateRoleSchema.parse(req.body);
    const currentUserId = req.user?.id;
    const user = await userService.updateRole(id, role, currentUserId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
};
