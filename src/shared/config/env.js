const dotenv = require("dotenv");

// Load environment variables once at startup
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  logLevel: process.env.LOG_LEVEL || "info",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

module.exports = { config };
