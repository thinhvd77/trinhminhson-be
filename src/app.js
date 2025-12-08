const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { config } = require("./shared/config/env");
const { requestLogger } = require("./shared/middlewares/request-logger");
const { notFoundHandler, errorHandler } = require("./shared/middlewares/error.middleware");
const { routes } = require("./routes");

function createApp() {
  const app = express();

  // Security & basic middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

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
