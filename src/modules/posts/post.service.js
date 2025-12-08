const { PostRepository } = require("./post.repository");
const { UserRepository } = require("../users/user.repository");

const postRepository = new PostRepository();
const userRepository = new UserRepository();

class PostService {
  async getAllPosts(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const posts = await postRepository.findAll(limit, offset, filters);
    const total = await postRepository.count(filters);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }
    return post;
  }

  async getPostBySlug(slug) {
    const post = await postRepository.findBySlug(slug);
    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }
    return post;
  }

  async createPost(postData) {
    const userExists = await userRepository.findById(postData.userId);
    if (!userExists) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const slugExists = await postRepository.existsBySlug(postData.slug);
    if (slugExists) {
      const error = new Error("Slug already exists");
      error.status = 409;
      throw error;
    }

    const post = await postRepository.create(postData);
    return await this.getPostById(post.id);
  }

  async updatePost(id, postData, requestUserId = null) {
    const existingPost = await postRepository.findById(id);
    if (!existingPost) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    if (requestUserId && existingPost.userId !== requestUserId) {
      const error = new Error("You are not authorized to update this post");
      error.status = 403;
      throw error;
    }

    if (postData.slug && postData.slug !== existingPost.slug) {
      const slugExists = await postRepository.existsBySlug(postData.slug);
      if (slugExists) {
        const error = new Error("Slug already exists");
        error.status = 409;
        throw error;
      }
    }

    const updatedPost = await postRepository.update(id, postData);
    return await this.getPostById(updatedPost.id);
  }

  async deletePost(id, requestUserId = null) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    if (requestUserId && post.userId !== requestUserId) {
      const error = new Error("You are not authorized to delete this post");
      error.status = 403;
      throw error;
    }

    await postRepository.delete(id);
    return { message: "Post deleted successfully" };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = { PostService };
