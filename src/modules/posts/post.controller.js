const { PostService } = require("./post.service");
const {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  postSlugSchema,
  postQuerySchema,
} = require("./post.dtos");

const postService = new PostService();

async function getAllPosts(req, res, next) {
  try {
    const { page, limit, userId, search } = postQuerySchema.parse(req.query);
    const filters = {};
    
    if (userId) filters.userId = userId;
    if (search) filters.search = search;

    const result = await postService.getAllPosts(page, limit, filters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getPostById(req, res, next) {
  try {
    const { id } = postIdSchema.parse(req.params);
    const post = await postService.getPostById(id);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}

async function getPostBySlug(req, res, next) {
  try {
    const { slug } = postSlugSchema.parse(req.params);
    const post = await postService.getPostBySlug(slug);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  try {
    const postData = createPostSchema.parse(req.body);
    const post = await postService.createPost(postData);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const { id } = postIdSchema.parse(req.params);
    const postData = updatePostSchema.parse(req.body);
    const post = await postService.updatePost(id, postData);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const { id } = postIdSchema.parse(req.params);
    const result = await postService.deletePost(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
