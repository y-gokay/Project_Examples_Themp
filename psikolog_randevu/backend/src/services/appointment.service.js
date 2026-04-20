'use strict';

const { Op, UniqueConstraintError } = require('sequelize');
const { Appointment, Psychologist, Availability, User, sequelize } = require('../models');
const { createError } = require('../utils/response');
const { filterAvailableSlots, buildSlotsFromSelectedHours } = require('../utils/slotHelper');
const { escapeLike } = require('../utils/sql');

const SLOT_DURATION_MINUTES = 30;
const BLOCKING_STATUSES = ['pending', 'approved'];
const CANCEL_MIN_HOURS_BEFORE = Math.max(
  1,
  Math.min(168, Number(process.env.APPOINTMENT_CANCEL_MIN_HOURS) || 2)
);

const getAvailableSlots = async (psychologistId, date) => {
  const psychologist = await Psychologist.findByPk(psychologistId);
  if (!psychologist) {
    throw createError('Psikolog bulunamadı', 404);
  }

  const requestedDate = new Date(date);
  if (isNaN(requestedDate)) {
    throw createError('Geçersiz tarih', 400);
  }

  const dayOfWeek = requestedDate.getDay();

  const availability = await Availability.findOne({
    where: { psychologistId, dayOfWeek },
  });

  if (!availability || !availability.selectedHours?.length) {
    return [];
  }

  const allSlots = buildSlotsFromSelectedHours(availability.selectedHours);

  const bookedAppointments = await Appointment.findAll({
    where: { psychologistId, date, status: { [Op.in]: BLOCKING_STATUSES } },
  });

  return filterAvailableSlots(allSlots, bookedAppointments);
};

const create = async (userId, { psychologistId, date, startTime, userNotes }) => {
  // Timezone-safe geçmiş tarih kontrolü: string karşılaştırması
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
  const nowTimeStr = new Date().toLocaleTimeString('sv-SE', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' });
  if (date < todayStr || (date === todayStr && startTime <= nowTimeStr)) {
    throw createError('Geçmiş tarih ve saat için randevu alınamaz', 400);
  }

  const psychologist = await Psychologist.findByPk(psychologistId);
  if (!psychologist) {
    throw createError('Psikolog bulunamadı', 404);
  }

  const endTime = calculateEndTime(startTime);
  const notesTrimmed = typeof userNotes === 'string' && userNotes.trim() ? userNotes.trim() : null;

  try {
    const appointment = await sequelize.transaction(async (t) => {
      return Appointment.create(
        {
          userId,
          psychologistId,
          date,
          startTime,
          endTime,
          status: 'pending',
          userNotes: notesTrimmed,
        },
        { transaction: t }
      );
    });
    return appointment;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw createError(
        'Bu tarih ve saatte zaten aktif bir randevunuz var veya seçilen slot dolu',
        409
      );
    }
    throw err;
  }
};

const calculateEndTime = (startTime) => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + SLOT_DURATION_MINUTES;
  const endH = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const endM = (totalMinutes % 60).toString().padStart(2, '0');
  return `${endH}:${endM}`;
};

const getMyAppointments = async (userId, { page = 1, pageSize = 20 } = {}) => {
  const limit = Math.min(Number(pageSize) || 20, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  return Appointment.findAll({
    where: { userId },
    include: [
      {
        model: Psychologist,
        as: 'psychologist',
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      },
    ],
    order: [['date', 'DESC'], ['startTime', 'DESC']],
    limit,
    offset,
  });
};

const getPsychologistAppointments = async (psychologistId, scope = 'upcoming') => {
  const where = { psychologistId };
  const today = new Date().toISOString().split('T')[0];

  if (scope === 'pending') {
    where.status = 'pending';
  } else if (scope === 'upcoming') {
    where.status = 'approved';
    where.date = { [Op.gte]: today };
  } else if (scope === 'past') {
    where[Op.or] = [
      { date: { [Op.lt]: today } },
      { status: { [Op.in]: ['rejected', 'cancelled'] } },
    ];
  }

  return Appointment.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['date', 'ASC'], ['startTime', 'ASC']],
  });
};

const listHistory = async (psychologistId, filters = {}) => {
  const where = { psychologistId };
  const today = new Date().toISOString().split('T')[0];

  const dateRange = {};
  if (filters.from) dateRange[Op.gte] = filters.from;
  if (filters.to) dateRange[Op.lte] = filters.to;

  if (filters.scope === 'upcoming') {
    where.status = 'approved';
    where.date = { ...dateRange, [Op.gte]: today };
  } else if (filters.scope === 'past') {
    if (filters.status) {
      where.status = filters.status;
      if (filters.status === 'approved') {
        where.date = { ...dateRange, [Op.lt]: today };
      } else if (filters.from || filters.to) {
        where.date = dateRange;
      }
    } else {
      where[Op.and] = [
        {
          [Op.or]: [
            { date: { ...dateRange, [Op.lt]: today } },
            { status: { [Op.in]: ['rejected', 'cancelled'] } },
          ],
        },
      ];
    }
  } else {
    if (filters.status) where.status = filters.status;
    if (filters.from || filters.to) {
      where.date = dateRange;
    }
  }

  const include = [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }];

  if (filters.q) {
    const safe = escapeLike(filters.q.trim().slice(0, 50));
    include[0].where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${safe}%` } },
        { email: { [Op.iLike]: `%${safe}%` } },
      ],
    };
    include[0].required = true;
  }

  return Appointment.findAll({
    where,
    include,
    order: [['date', 'DESC'], ['startTime', 'DESC']],
    limit: 200,
  });
};

// Geçerli durum geçişleri
const VALID_TRANSITIONS = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['cancelled'],
  rejected: [],
  cancelled: [],
};

const decideAppointment = async (appointmentId, psychologistId, { decision, reason }) => {
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, psychologistId },
  });

  if (!appointment) throw createError('Randevu bulunamadı', 404);
  if (appointment.status !== 'pending') {
    throw createError('Sadece bekleyen randevular için karar verilebilir', 400);
  }
  if (!['approved', 'rejected'].includes(decision)) {
    throw createError('Geçersiz karar', 400);
  }

  await appointment.update({
    status: decision,
    rejectionReason: decision === 'rejected' ? reason || null : null,
    decidedAt: new Date(),
  });

  return appointment;
};

const cancel = async (appointmentId, actor) => {
  // actor: { userId, psychologistId, role }
  const appointment = await Appointment.findByPk(appointmentId);
  if (!appointment) throw createError('Randevu bulunamadı', 404);

  if (actor.role === 'user' && appointment.userId !== actor.userId) {
    throw createError('Bu randevu size ait değil', 403);
  }
  if (actor.role === 'psychologist' && appointment.psychologistId !== actor.psychologistId) {
    throw createError('Bu randevu size ait değil', 403);
  }

  const allowedFrom = actor.role === 'user' ? ['pending', 'approved'] : ['approved'];
  if (!allowedFrom.includes(appointment.status)) {
    throw createError('Bu randevu iptal edilemez', 400);
  }

  // VALID_TRANSITIONS kontrolü
  if (!VALID_TRANSITIONS[appointment.status]?.includes('cancelled')) {
    throw createError('Bu randevunun durumu iptal edilmeye izin vermiyor', 400);
  }

  if (actor.role === 'user') {
    const t = String(appointment.startTime).slice(0, 5);
    const startMs = new Date(`${appointment.date}T${t}:00+03:00`).getTime();
    const deadlineMs = startMs - CANCEL_MIN_HOURS_BEFORE * 60 * 60 * 1000;
    if (Number.isFinite(startMs) && Date.now() > deadlineMs) {
      throw createError(
        `Randevuyu görüşme saatinden en az ${CANCEL_MIN_HOURS_BEFORE} saat önce iptal edebilirsiniz`,
        400
      );
    }
  }

  await appointment.update({
    status: 'cancelled',
    cancelledBy: actor.role === 'psychologist' ? 'psychologist' : 'user',
  });

  return appointment;
};

const getAllAppointments = async () => {
  return Appointment.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      {
        model: Psychologist,
        as: 'psychologist',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      },
    ],
    order: [['date', 'DESC']],
  });
};

module.exports = {
  CANCEL_MIN_HOURS_BEFORE,
  getAvailableSlots,
  create,
  getMyAppointments,
  getPsychologistAppointments,
  listHistory,
  decideAppointment,
  cancel,
  getAllAppointments,
};
