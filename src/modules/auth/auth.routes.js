const { Router } = require("express");
const { register, login, verify, verifyEmail, resendCode, forgotPassword, resetPassword } = require("./auth.controller");
const { authLimiter } = require("../../shared/middlewares/rate-limit.middleware");

const router = Router();

// Apply rate limiting to prevent brute force attacks
router.post("/auth/register", authLimiter, register);
router.post("/auth/login", authLimiter, login);
router.get("/auth/verify", verify);
router.post("/auth/verify-email", authLimiter, verifyEmail);
router.post("/auth/resend-code", authLimiter, resendCode);
router.post("/auth/forgot-password", authLimiter, forgotPassword);
router.post("/auth/reset-password", authLimiter, resetPassword);

module.exports = { authRoutes: router };
