const { Router } = require("express");
const { healthRoutes } = require("./modules/health/health.routes");
const { userRoutes } = require("./modules/users/user.routes");
const { postRoutes } = require("./modules/posts/post.routes");
const { authRoutes } = require("./modules/auth/auth.routes");
const { noteRoutes } = require("./modules/notes/note.routes");

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(postRoutes);
router.use(noteRoutes);

module.exports = { routes: router };
