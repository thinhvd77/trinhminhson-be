const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { config } = require("./shared/config/env");
const { requestLogger } = require("./shared/middlewares/request-logger");
const { notFoundHandler, errorHandler } = require("./shared/middlewares/error.middleware");
const { generalLimiter } = require("./shared/middlewares/rate-limit.middleware");
const { routes } = require("./routes");

// CORS whitelist - configure allowed origins
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (origins) {
    return origins.split(',').map(o => o.trim());
  }
  // Default origins for development
  if (config.nodeEnv === 'development') {
    return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  }
  // In production, require explicit configuration
  return [];
};

function createApp() {
  const app = express();

  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security & basic middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "*"],
        "script-src": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));

  // CORS with whitelist
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();
      // Allow requests with no origin (mobile apps, curl, etc.) in development
      if (!origin && config.nodeEnv === 'development') {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // General rate limiting
  app.use(generalLimiter);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(requestLogger);

  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Routes
  app.use("/api", routes);

  // Health root redirect for convenience
  app.get("/health", (_req, res) => res.redirect(301, "/api/health"));

  // 404 & error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
