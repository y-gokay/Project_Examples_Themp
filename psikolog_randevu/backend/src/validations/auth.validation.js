"use strict";

const { z } = require("zod");

const passwordField = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır")
  .regex(/[a-zA-Z]/, "Şifre en az bir harf içermelidir")
  .regex(/[0-9]/, "Şifre en az bir rakam içermelidir");

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z
    .union([
      z
        .string()
        .regex(
          /^(\+90|0)?[5][0-9]{9}$/,
          "Geçerli bir Türkiye telefon numarası giriniz (05XX XXX XX XX)",
        ),
      z.literal(""),
    ])
    .optional(),
  password: passwordField,
  kvkkAccepted: z.boolean().refine((v) => v === true, {
    message: "KVKK Aydınlatma Metni ve açık rıza onayı zorunludur.",
  }),
});

// Login: email VEYA telefon ile giriş yapılabilir
const loginSchema = z.object({
  identifier: z.string().min(1, "E-posta veya telefon numarası gereklidir"),
  password: z.string().min(1, "Şifre gereklidir"),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır").optional(),
    phone: z
      .union([
        z
          .string()
          .regex(
            /^(\+90|0)?[5][0-9]{9}$/,
            "Geçerli bir Türkiye telefon numarası giriniz",
          ),
        z.literal(""),
      ])
      .optional(),
  })
  .strict()
  .refine((d) => d.name !== undefined || d.phone !== undefined, {
    message: "Güncellenecek en az bir alan gönderin",
  });

const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20, "Geçersiz bağlantı"),
  password: passwordField,
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
  newPassword: passwordField,
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token gereklidir"),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshSchema,
};
