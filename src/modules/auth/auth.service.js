const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserRepository } = require("../users/user.repository");

const userRepository = new UserRepository();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

class AuthService {
  async register(name, username, password) {
    // Check if user already exists
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      const error = new Error("Tên đăng nhập đã được sử dụng");
      error.status = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with member role
    const user = await userRepository.create({
      name,
      username,
      password: hashedPassword,
      role: "member", // All registered users are members
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token and user info (without password)
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async login(username, password) {
    // Find user by username
    const user = await userRepository.findByUsername(username);
    if (!user) {
      const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error("Tài khoản đã bị vô hiệu hóa");
      error.status = 403;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token and user info (without password)
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar || null,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      const err = new Error("Invalid or expired token");
      err.status = 401;
      throw err;
    }
  }

  async getUserFromToken(token) {
    const decoded = this.verifyToken(token);
    const user = await userRepository.findById(decoded.userId);

    if (!user || !user.isActive) {
      const error = new Error("User not found or inactive");
      error.status = 401;
      throw error;
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar || null,
      role: user.role,
      isActive: user.isActive,
    };
  }
}

module.exports = { AuthService };
