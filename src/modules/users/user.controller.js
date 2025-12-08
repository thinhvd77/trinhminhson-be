const { UserService } = require("./user.service");
const { createUserSchema, updateUserSchema, userIdSchema, paginationSchema } = require("./user.dtos");

const userService = new UserService();

async function getAllUsers(req, res, next) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await userService.getAllUsers(page, limit);
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
    const result = await userService.deleteUser(id);
    res.status(200).json(result);
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
};
