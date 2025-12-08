const { AuthService } = require("./auth.service");
const { loginSchema } = require("./auth.dtos");

const authService = new AuthService();

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      const error = new Error("No token provided");
      error.status = 401;
      throw error;
    }

    const user = await authService.getUserFromToken(token);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  verify,
};
