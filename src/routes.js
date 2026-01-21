const { Router } = require("express");
const { healthRoutes } = require("./modules/health/health.routes");
const { userRoutes } = require("./modules/users/user.routes");
const { profileRoutes } = require("./modules/users/profile.routes");
const { postRoutes } = require("./modules/posts/post.routes");
const { authRoutes } = require("./modules/auth/auth.routes");
const { noteRoutes } = require("./modules/notes/note.routes");
const { vocabularyRoutes } = require("./modules/vocabulary/vocabulary.routes");
const { photoRoutes } = require("./modules/photos/photo.routes");
const categoryRoutes = require("./modules/photos/category.routes");
const { commentRoutes } = require("./modules/photos/comment.routes");
const { commentReactionRoutes } = require("./modules/photos/commentReaction.routes");
const { commentVoteRoutes } = require("./modules/photos/commentVote.routes");

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(profileRoutes);
router.use(postRoutes);
router.use(noteRoutes);
router.use(vocabularyRoutes);
router.use(photoRoutes);
router.use(commentRoutes);
router.use(commentReactionRoutes);
router.use(commentVoteRoutes);
router.use("/categories", categoryRoutes);

module.exports = { routes: router };

