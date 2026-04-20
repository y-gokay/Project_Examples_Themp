'use strict';

const authService = require('../services/auth.service');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshSchema,
} = require('../validations/auth.validation');
const { sendSuccess, zodFirstMessage } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }

    const result = await authService.register(parsed.data);
    return sendSuccess(res, result, 'Kayıt başarılı', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }

    const result = await authService.login(parsed.data);
    return sendSuccess(res, result, 'Giriş başarılı');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  return sendSuccess(res, authService.formatUser(req.user));
};

const patchMe = async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const user = await authService.updateProfile(req.user.id, parsed.data);
    return sendSuccess(res, user, 'Profil güncellendi');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    await authService.forgotPassword(parsed.data);
    return sendSuccess(res, { sent: true }, 'İşlem tamamlandı');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    await authService.resetPassword(parsed.data);
    return sendSuccess(res, { reset: true }, 'Şifreniz güncellendi');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    await authService.changePassword(req.user.id, parsed.data);
    return sendSuccess(res, { changed: true }, 'Şifre değiştirildi');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const result = await authService.refresh(parsed.data.refreshToken);
    return sendSuccess(res, result, 'Token yenilendi');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken: raw } = req.body;
    await authService.logout(raw);
    return sendSuccess(res, null, 'Çıkış yapıldı');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  me,
  patchMe,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
};
