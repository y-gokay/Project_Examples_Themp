'use strict';

const rateLimit = require('express-rate-limit');

/** Auth endpoint'leri: 15 dk'da 10 istek/IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Çok fazla istek. 15 dakika sonra tekrar deneyin.' },
});

/** Slot sorgulama: 1 dk'da 60 istek/IP */
const slotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Çok fazla istek.' },
});

/** Arama/filtreleme: 1 dk'da 60 istek/IP */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Çok fazla istek.' },
});

module.exports = { authLimiter, slotLimiter, searchLimiter };
