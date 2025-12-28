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
    const existingUser = await userRepository.findByUsername(userData.username);
    if (existingUser) {
      const error = new Error("Username already exists");
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

    if (userData.username && userData.username !== existingUser.username) {
      const usernameExists = await userRepository.findByUsername(userData.username);
      if (usernameExists) {
        const error = new Error("Username already exists");
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

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      const error = new Error("Current password is incorrect");
      error.status = 401;
      throw error;
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(userId, { password: hashedPassword });
    
    return { message: "Password changed successfully" };
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = { UserService };
