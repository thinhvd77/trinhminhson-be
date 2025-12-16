const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số"),
});

module.exports = {
  loginSchema,
  registerSchema,
};
