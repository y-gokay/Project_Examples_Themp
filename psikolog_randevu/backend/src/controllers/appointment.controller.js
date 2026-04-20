'use strict';

const appointmentService = require('../services/appointment.service');
const {
  createAppointmentSchema,
  decisionSchema,
  historyFilterSchema,
  cancelSchema,
} = require('../validations/appointment.validation');
const { sendSuccess, zodFirstMessage } = require('../utils/response');
const { Psychologist } = require('../models');

const getSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Tarih parametresi gereklidir (?date=YYYY-MM-DD)',
      });
    }

    const slots = await appointmentService.getAvailableSlots(id, date);
    return sendSuccess(res, slots);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const parsed = createAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }

    const appointment = await appointmentService.create(req.user.id, parsed.data);
    return sendSuccess(res, appointment, 'Randevu talebiniz oluşturuldu', 201);
  } catch (err) {
    next(err);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const list = await appointmentService.getMyAppointments(req.user.id);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

const resolvePsychologist = async (userId) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) {
    const err = new Error('Psikolog profili bulunamadı');
    err.statusCode = 403;
    throw err;
  }
  return psy;
};

const getPsychologistAppointments = async (req, res, next) => {
  try {
    const psychologist = await resolvePsychologist(req.user.id);
    const scope = req.query.scope || 'upcoming';
    const list = await appointmentService.getPsychologistAppointments(psychologist.id, scope);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

const getPending = async (req, res, next) => {
  try {
    const psychologist = await resolvePsychologist(req.user.id);
    const list = await appointmentService.getPsychologistAppointments(psychologist.id, 'pending');
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const parsed = historyFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }
    const psychologist = await resolvePsychologist(req.user.id);
    const list = await appointmentService.listHistory(psychologist.id, parsed.data);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

const decide = async (req, res, next) => {
  try {
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }
    const psychologist = await resolvePsychologist(req.user.id);
    const appointment = await appointmentService.decideAppointment(
      req.params.id,
      psychologist.id,
      parsed.data
    );
    return sendSuccess(res, appointment, 'Karar kaydedildi');
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const parsed = cancelSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: zodFirstMessage(parsed.error),
      });
    }
    const actor = { role: req.user.role, userId: req.user.id };
    if (req.user.role === 'psychologist') {
      const psy = await resolvePsychologist(req.user.id);
      actor.psychologistId = psy.id;
    }
    const appointment = await appointmentService.cancel(req.params.id, actor);
    return sendSuccess(res, appointment, 'Randevu iptal edildi');
  } catch (err) {
    next(err);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const list = await appointmentService.getAllAppointments();
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSlots,
  create,
  getMyAppointments,
  getPsychologistAppointments,
  getPending,
  getHistory,
  decide,
  cancel,
  getAllAppointments,
};
