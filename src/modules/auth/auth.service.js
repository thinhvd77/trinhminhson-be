const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserRepository } = require("../users/user.repository");

const userRepository = new UserRepository();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

class AuthService {
  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error("Account is disabled");
      error.status = 403;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token and user info (without password)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };
  }
}

module.exports = { AuthService };
