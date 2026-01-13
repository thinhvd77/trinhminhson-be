const express = require("express");
const helmet = require("helmet");
const path = require("path");
const { requestLogger } = require("./shared/middlewares/request-logger");
const { notFoundHandler, errorHandler } = require("./shared/middlewares/error.middleware");
const { generalLimiter } = require("./shared/middlewares/rate-limit.middleware");
const { routes } = require("./routes");

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
