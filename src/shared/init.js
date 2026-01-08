const bcrypt = require("bcrypt");
const { UserRepository } = require("../modules/users/user.repository");
const { logger } = require("./utils/logger");

const userRepository = new UserRepository();
const SALT_ROUNDS = 10;

// Default admin credentials - should be changed via environment variables in production
const DEFAULT_ADMIN = {
  name: process.env.ADMIN_NAME || "Admin",
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "Th16119153",
};

async function initializeAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await userRepository.findByUsername(DEFAULT_ADMIN.username);
    
    if (existingAdmin) {
      logger.info(`Admin account '${DEFAULT_ADMIN.username}' already exists`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, SALT_ROUNDS);

    // Create admin user
    const admin = await userRepository.create({
      name: DEFAULT_ADMIN.name,
      username: DEFAULT_ADMIN.username,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    logger.info(`Admin account created successfully: ${admin.username}`);
    
    // Log warning if using default credentials
    if (!process.env.ADMIN_PASSWORD) {
      logger.warn("⚠️  Using default admin password. Please set ADMIN_PASSWORD environment variable in production!");
    }
  } catch (error) {
    logger.error("Failed to initialize admin account:", error);
    throw error;
  }
}

module.exports = { initializeAdmin };
