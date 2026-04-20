"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, PasswordReset, RefreshToken } = require("../models");
const { createError } = require("../utils/response");
const { normalizePhone } = require("../utils/phone");
const { sendMail } = require("../utils/mailer");

const RESET_TOKEN_TTL_MINUTES = 60;
const REFRESH_TOKEN_TTL_DAYS = parseInt(
  process.env.REFRESH_TOKEN_TTL_DAYS || "7",
  10,
);

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const createRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(40).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await RefreshToken.create({ userId, tokenHash: hash, expiresAt });
  return raw;
};

const register = async ({ name, email, phone, password, kvkkAccepted }) => {
  if (!kvkkAccepted) {
    throw createError("KVKK Aydınlatma Metnini onaylamanız gerekir", 400);
  }

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw createError("Bu e-posta adresi zaten kullanılıyor", 409);
  }

  const normalizedPhone = phone ? normalizePhone(phone) : null;
  if (normalizedPhone) {
    const existingPhone = await User.findOne({
      where: { phone: normalizedPhone },
    });
    if (existingPhone) {
      throw createError("Bu telefon numarası zaten kullanılıyor", 409);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    phone: normalizedPhone,
    password: hashedPassword,
    role: "user",
    kvkkAcceptedAt: new Date(),
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken, user: formatUser(user) };
};

const login = async ({ identifier, password }) => {
  const isPhone = /^(\+90|0)?[5][0-9]{9}$/.test(identifier.replace(/\s/g, ""));

  let user;
  if (isPhone) {
    const normalized = normalizePhone(identifier);
    user = await User.findOne({ where: { phone: normalized } });
  } else {
    user = await User.findOne({ where: { email: identifier } });
  }

  if (!user) throw createError("E-posta/telefon veya şifre hatalı", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError("E-posta/telefon veya şifre hatalı", 401);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken, user: formatUser(user) };
};

const refresh = async (rawToken) => {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await RefreshToken.findOne({
    where: {
      tokenHash: hash,
      revokedAt: null,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw createError("Geçersiz veya süresi dolmuş oturum", 401);

  // Rotation: eski token revoke, yeni çift üret
  await record.update({ revokedAt: new Date() });
  const accessToken = generateAccessToken(record.userId);
  const newRefreshToken = await createRefreshToken(record.userId);
  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (rawToken) => {
  if (!rawToken) return;
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { tokenHash: hash, revokedAt: null } },
  );
};

/**
 * Forgot password: her zaman 200 döner (e-posta varlığını sızdırmaz).
 * Token ham hali sadece e-postaya gönderilir; DB'de SHA-256 hash saklanır.
 */
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { sent: true };
  }

  await PasswordReset.update(
    { usedAt: new Date() },
    { where: { userId: user.id, usedAt: null } },
  );

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await PasswordReset.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const link = `${frontendUrl}/sifre-sifirla/${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "PDR — Şifre sıfırlama talebi",
    text: `Merhaba ${user.name},

Hesabınız için şifre sıfırlama talebi aldık. Aşağıdaki bağlantı ${RESET_TOKEN_TTL_MINUTES} dakika boyunca geçerlidir:

${link}

Eğer bu talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmeyecektir.

— Atakum Belediyesi PDR Danışmanlık`,
  });

  return { sent: true };
};

const resetPassword = async ({ token, password }) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await PasswordReset.findOne({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) {
    throw createError("Bağlantı geçersiz veya süresi dolmuş", 400);
  }

  const user = await User.findByPk(record.userId);
  if (!user) throw createError("Kullanıcı bulunamadı", 404);

  const hashedPassword = await bcrypt.hash(password, 12);
  await user.update({ password: hashedPassword });
  await record.update({ usedAt: new Date() });

  return { reset: true };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) throw createError("Kullanıcı bulunamadı", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw createError("Mevcut şifreniz hatalı", 400);

  if (currentPassword === newPassword) {
    throw createError("Yeni şifre mevcut şifre ile aynı olamaz", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await user.update({ password: hashedPassword });
  return { changed: true };
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const updateProfile = async (userId, { name, phone }) => {
  const user = await User.findByPk(userId);
  if (!user) throw createError("Kullanıcı bulunamadı", 404);

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) {
    const normalizedPhone = phone ? normalizePhone(phone) : null;
    if (normalizedPhone) {
      const clash = await User.findOne({
        where: { phone: normalizedPhone, id: { [Op.ne]: userId } },
      });
      if (clash)
        throw createError("Bu telefon numarası zaten kullanılıyor", 409);
    }
    updates.phone = normalizedPhone;
  }

  await user.update(updates);
  await user.reload();
  return formatUser(user);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  formatUser,
};
