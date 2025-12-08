const { Router } = require("express");
const { healthCheck } = require("./health.controller");

const router = Router();

router.get("/health", healthCheck);

module.exports = { healthRoutes: router };
