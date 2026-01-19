const { z } = require("zod");

const loginSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự").regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự").regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số"),
});

const verifyEmailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  code: z.string().length(6, "Mã xác nhận phải có 6 chữ số").regex(/^[0-9]+$/, "Mã xác nhận chỉ chứa số"),
});

const resendCodeSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

module.exports = {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendCodeSchema,
};
