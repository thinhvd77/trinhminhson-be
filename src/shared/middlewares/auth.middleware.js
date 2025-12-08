const { AuthService } = require("../../modules/auth/auth.service");

const authService = new AuthService();

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

module.exports = { authMiddleware };
