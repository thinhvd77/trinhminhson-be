const { AuthService } = require("./auth.service");
const { loginSchema, registerSchema, verifyEmailSchema, resendCodeSchema, forgotPasswordSchema, resetPasswordSchema } = require("./auth.dtos");

const authService = new AuthService();

async function register(req, res, next) {
  try {
    const { name, username, email, password } = registerSchema.parse(req.body);
    const result = await authService.register(name, username, email, password);
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

async function verifyEmail(req, res, next) {
  try {
    const { email, code } = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(email, code);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resendCode(req, res, next) {
  try {
    const { email } = resendCodeSchema.parse(req.body);
    const result = await authService.resendVerificationCode(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(token, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  verify,
  verifyEmail,
  resendCode,
  forgotPassword,
  resetPassword,
};
