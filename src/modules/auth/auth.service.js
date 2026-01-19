const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserRepository } = require("../users/user.repository");
const { config } = require("../../shared/config/env");
const { emailService } = require("../../shared/utils/email.service");
const {logger} = require("../../shared/utils/logger");

const userRepository = new UserRepository();

// Use centralized config for JWT settings
const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;
const SALT_ROUNDS = 10;
const VERIFICATION_CODE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class AuthService {
  async register(name, username, email, password) {
    // Check if username already exists
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      const error = new Error("Tên đăng nhập đã được sử dụng");
      error.status = 400;
      throw error;
    }

    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      const error = new Error("Email đã được đăng ký");
      error.status = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

    // Create user with email verification pending
    const user = await userRepository.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: "member",
      emailVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationCode, name);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      // Don't throw error - user is created, they can resend code
    }

    // Return user info without token (user must verify email first)
    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
      },
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    };
  }

  async verifyEmail(email, code) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Email không tồn tại");
      error.status = 404;
      throw error;
    }

    // Check if already verified
    if (user.emailVerified) {
      const error = new Error("Email đã được xác thực");
      error.status = 400;
      throw error;
    }

    // Check verification code
    if (user.verificationCode !== code) {
      const error = new Error("Mã xác thực không đúng");
      error.status = 400;
      throw error;
    }

    // Check if code expired
    if (new Date() > new Date(user.verificationCodeExpires)) {
      const error = new Error("Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.");
      error.status = 400;
      throw error;
    }

    // Update user as verified and clear verification code
    await userRepository.update(user.id, {
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token and user info
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        emailVerified: true,
        avatar: user.avatar || null,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async resendVerificationCode(email) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Email không tồn tại");
      error.status = 404;
      throw error;
    }

    // Check if already verified
    if (user.emailVerified) {
      const error = new Error("Email đã được xác thực");
      error.status = 400;
      throw error;
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

    // Update user with new code
    await userRepository.update(user.id, {
      verificationCode,
      verificationCodeExpires,
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationCode, user.name);

    return {
      message: "Mã xác thực mới đã được gửi đến email của bạn",
    };
  }

  async login(username, password) {
    // Find user by username
    const user = await userRepository.findByUsername(username);
    if (!user) {
      const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      const error = new Error("Vui lòng xác thực email trước khi đăng nhập");
      error.status = 403;
      error.code = "EMAIL_NOT_VERIFIED";
      error.email = user.email;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error("Tài khoản đã bị vô hiệu hóa");
      error.status = 403;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token and user info (without password)
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        avatar: user.avatar || null,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      const err = new Error("Invalid or expired token");
      err.status = 401;
      throw err;
    }
  }

  async getUserFromToken(token) {
    const decoded = this.verifyToken(token);
    const user = await userRepository.findById(decoded.userId);

    if (!user || !user.isActive) {
      const error = new Error("User not found or inactive");
      error.status = 401;
      throw error;
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar || null,
      role: user.role,
      isActive: user.isActive,
    };
  }
}

module.exports = { AuthService };
