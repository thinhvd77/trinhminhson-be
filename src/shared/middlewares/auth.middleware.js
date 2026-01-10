const { AuthService } = require("../../modules/auth/auth.service");

const authService = new AuthService();

// Require authentication and attach user
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      const error = new Error("Authentication required");
      error.status = 401;
      throw error;
    }

    const user = await authService.getUserFromToken(token);
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional auth middleware.
 * - If no Authorization header is provided: continues as guest.
 * - If a token is provided: validates it and attaches req.user.
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const user = await authService.getUserFromToken(token);
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

// Alias for clarity in route files
const authGuard = authMiddleware;

// Ensure authenticated user is admin
async function adminGuard(req, res, next) {
  try {
    if (!req.user) {
      const error = new Error("Authentication required");
      error.status = 401;
      throw error;
    }

    if (req.user.role !== "admin") {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authMiddleware, optionalAuthMiddleware, authGuard, adminGuard };
