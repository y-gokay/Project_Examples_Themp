'use strict';

const VALID_ROLES = new Set(['user', 'psychologist', 'admin']);

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Giriş yapmanız gerekiyor' });
    }

    if (!VALID_ROLES.has(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Geçersiz kullanıcı rolü' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz bulunmuyor' });
    }

    next();
  };
};

module.exports = roleMiddleware;
