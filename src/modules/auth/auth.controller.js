const { AuthService } = require("./auth.service");
const { loginSchema, registerSchema } = require("./auth.dtos");

const authService = new AuthService();

async function register(req, res, next) {
  try {
    const { name, username, password } = registerSchema.parse(req.body);
    const result = await authService.register(name, username, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const result = await authService.login(username, password);
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
  register,
  login,
  verify,
};
