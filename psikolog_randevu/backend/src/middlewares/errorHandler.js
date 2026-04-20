'use strict';

const { UniqueConstraintError, ValidationError } = require('sequelize');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.error(err.stack);
  }

  // Multer — dosya yükleme hataları
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'Dosya boyutu çok büyük.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, message: err.field || 'Desteklenmeyen dosya tipi.' });
    }
    return res.status(400).json({ success: false, message: 'Dosya yüklenemedi.' });
  }

  // Sequelize unique constraint → 409
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ success: false, message: 'Bu kayıt zaten mevcut.' });
  }

  // Sequelize validation → 400 (kolon adı sızdırmadan Türkçe mesaj)
  if (err instanceof ValidationError) {
    const FIELD_MESSAGES = {
      email: 'Bu e-posta adresi zaten kullanılıyor.',
      phone: 'Bu telefon numarası zaten kullanılıyor.',
    };
    const firstField = err.errors?.[0]?.path;
    const message = FIELD_MESSAGES[firstField] || 'Doğrulama hatası. Lütfen girdiğiniz bilgileri kontrol edin.';
    return res.status(400).json({ success: false, message });
  }

  const statusCode = err.statusCode || 500;
  // Prod'da 500 hatalar için generic mesaj — stack trace veya internal path sızdırmaz
  const message = (isProd && statusCode === 500)
    ? 'Sunucu hatası. Lütfen tekrar deneyin.'
    : (err.message || 'Sunucu hatası');

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
