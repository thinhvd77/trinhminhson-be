const dotenv = require("dotenv");
const crypto = require("crypto");

// Load environment variables once at startup
dotenv.config();

// Generate a random fallback secret for development only
// In production, JWT_SECRET MUST be set via environment variable
const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  
  if (process.env.NODE_ENV === "production") {
    console.error("\x1b[31m%s\x1b[0m", "CRITICAL: JWT_SECRET environment variable is not set in production!");
    console.error("\x1b[31m%s\x1b[0m", "Generate a secure secret with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
    process.exit(1);
  }
  
  // Development fallback - generate random secret per server restart
  console.warn("\x1b[33m%s\x1b[0m", "⚠️  WARNING: Using auto-generated JWT secret. Set JWT_SECRET for persistent sessions.");
  return crypto.randomBytes(64).toString("hex");
};

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  logLevel: process.env.LOG_LEVEL || "info",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  allowedOrigins: process.env.ALLOWED_ORIGINS || "",
};

module.exports = { config };
