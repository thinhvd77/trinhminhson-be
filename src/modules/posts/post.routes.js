const { Router } = require("express");
const {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} = require("./post.controller");

const router = Router();

router.get("/posts", getAllPosts);
router.get("/posts/slug/:slug", getPostBySlug);
router.get("/posts/:id", getPostById);
router.post("/posts", createPost);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

module.exports = { postRoutes: router };
