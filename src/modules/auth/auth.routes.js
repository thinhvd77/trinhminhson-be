const { Router } = require("express");
const { login, verify } = require("./auth.controller");

const router = Router();

router.post("/auth/login", login);
router.get("/auth/verify", verify);

module.exports = { authRoutes: router };
