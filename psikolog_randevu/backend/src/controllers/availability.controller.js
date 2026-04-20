'use strict';

const availabilityService = require('../services/availability.service');
const { upsertAvailabilitySchema } = require('../validations/availability.validation');
const { sendSuccess, zodFirstMessage } = require('../utils/response');
const { Psychologist } = require('../models');

const getByPsychologist = async (req, res, next) => {
  try {
    const list = await availabilityService.getByPsychologist(req.params.psychologistId);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

const upsert = async (req, res, next) => {
  try {
    const parsed = upsertAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }

    const psychologist = await Psychologist.findOne({ where: { userId: req.user.id } });
    if (!psychologist) {
      return res.status(403).json({ success: false, message: 'Psikolog profili bulunamadı' });
    }

    const availability = await availabilityService.upsertDay(psychologist.id, parsed.data);
    return sendSuccess(res, availability, 'Müsaitlik güncellendi', 200);
  } catch (err) {
    next(err);
  }
};

const removeDay = async (req, res, next) => {
  try {
    const psychologist = await Psychologist.findOne({ where: { userId: req.user.id } });
    if (!psychologist) {
      return res.status(403).json({ success: false, message: 'Psikolog profili bulunamadı' });
    }

    const dayOfWeek = Number(req.params.dayOfWeek);
    if (dayOfWeek < 0 || dayOfWeek > 6 || Number.isNaN(dayOfWeek)) {
      return res.status(400).json({ success: false, message: 'Geçersiz gün' });
    }

    await availabilityService.removeDay(psychologist.id, dayOfWeek);
    return sendSuccess(res, {}, 'Gün müsaitliği temizlendi');
  } catch (err) {
    next(err);
  }
};

module.exports = { getByPsychologist, upsert, removeDay };
