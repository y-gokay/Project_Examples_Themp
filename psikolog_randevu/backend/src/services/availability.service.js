'use strict';

const { Availability, Psychologist } = require('../models');
const { createError } = require('../utils/response');

const normalizeHourBlocks = (hours) =>
  [...new Set(hours)]
    .map((h) => Number(h))
    .filter((h) => Number.isInteger(h) && h >= 8 && h <= 16)
    .sort((a, b) => a - b);

const getByPsychologist = async (psychologistId) => {
  const psychologist = await Psychologist.findByPk(psychologistId);
  if (!psychologist) {
    throw createError('Psikolog bulunamadı', 404);
  }

  return Availability.findAll({
    where: { psychologistId },
    order: [['dayOfWeek', 'ASC']],
  });
};

const upsertDay = async (psychologistId, { dayOfWeek, selectedHours }) => {
  const psychologist = await Psychologist.findByPk(psychologistId);
  if (!psychologist) {
    throw createError('Psikolog bulunamadı', 404);
  }

  const normalized = normalizeHourBlocks(selectedHours || []);
  if (normalized.length === 0) {
    await Availability.destroy({ where: { psychologistId, dayOfWeek } });
    return { psychologistId, dayOfWeek, selectedHours: [] };
  }

  const existing = await Availability.findOne({ where: { psychologistId, dayOfWeek } });
  if (existing) {
    await existing.update({ selectedHours: normalized });
    return existing;
  }

  return Availability.create({
    psychologistId,
    dayOfWeek,
    selectedHours: normalized,
  });
};

const removeDay = async (psychologistId, dayOfWeek) => {
  await Availability.destroy({ where: { psychologistId, dayOfWeek } });
  return true;
};

module.exports = { getByPsychologist, upsertDay, removeDay };
