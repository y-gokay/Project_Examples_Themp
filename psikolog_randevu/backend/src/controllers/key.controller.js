'use strict';

const keyService = require('../services/key.service');
const { setupKeySchema } = require('../validations/key.validation');
const { sendSuccess, zodFirstMessage } = require('../utils/response');

const setup = async (req, res, next) => {
  try {
    const parsed = setupKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }
    const key = await keyService.setupKey(req.user.id, parsed.data);
    return sendSuccess(res, key, 'Anahtar kaydedildi', 201);
  } catch (err) {
    next(err);
  }
};

const getMine = async (req, res, next) => {
  try {
    const key = await keyService.getMyKey(req.user.id);
    return sendSuccess(res, key);
  } catch (err) {
    next(err);
  }
};

const getPublicForPsychologist = async (req, res, next) => {
  try {
    const psychologistId = Number(req.params.id);
    if (!psychologistId) {
      return res.status(400).json({ success: false, message: 'Geçersiz psikolog kimliği' });
    }
    const pub = await keyService.getPublicKeyByPsychologistId(psychologistId);
    return sendSuccess(res, pub);
  } catch (err) {
    next(err);
  }
};

module.exports = { setup, getMine, getPublicForPsychologist };
