const { UserRepository } = require("./user.repository");
const bcrypt = require("bcrypt");

const userRepository = new UserRepository();

class UserService {
  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const users = await userRepository.findAll(limit, offset);
    const total = await userRepository.count();

    const sanitizedUsers = users.map(user => this.sanitizeUser(user));

    return {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    return this.sanitizeUser(user);
  }

  async createUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error("Email already exists");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.sanitizeUser(user);
  }

  async updateUser(id, userData) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(userData.email);
      if (emailExists) {
        const error = new Error("Email already exists");
        error.status = 409;
        throw error;
      }
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await userRepository.update(id, userData);
    return this.sanitizeUser(updatedUser);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    await userRepository.delete(id);
    return { message: "User deleted successfully" };
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = { UserService };
