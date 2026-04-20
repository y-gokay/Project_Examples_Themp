'use strict';

const sendSuccess = (res, data = {}, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, message = 'Hata oluştu', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/** Zod 4+: `ZodError` mesajı `issues` üzerinden gelir (`errors` yok). */
const zodFirstMessage = (zodError) =>
  zodError?.issues?.[0]?.message || 'Geçersiz veri';

module.exports = { sendSuccess, sendError, createError, zodFirstMessage };
