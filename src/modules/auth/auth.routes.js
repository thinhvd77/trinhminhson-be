const { Router } = require("express");
const { register, login, verify } = require("./auth.controller");
const { authLimiter } = require("../../shared/middlewares/rate-limit.middleware");

const router = Router();

// Apply rate limiting to prevent brute force attacks
router.post("/auth/register", authLimiter, register);
router.post("/auth/login", authLimiter, login);
router.get("/auth/verify", verify);

module.exports = { authRoutes: router };
