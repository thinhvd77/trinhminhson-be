const { Router } = require("express");
const { healthRoutes } = require("./modules/health/health.routes");
const { userRoutes } = require("./modules/users/user.routes");
const { postRoutes } = require("./modules/posts/post.routes");
const { authRoutes } = require("./modules/auth/auth.routes");

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(postRoutes);

module.exports = { routes: router };
