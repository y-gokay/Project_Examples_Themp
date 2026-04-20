'use strict';

const { PatientNote, Psychologist, PsychologistKey, Appointment, User } = require('../models');
const { createError } = require('../utils/response');

const MAX_CIPHERTEXT_BYTES = 65536;
const MAX_EDK_BYTES = 512;

const assertOpaquePayload = (payload) => {
  const len = (b64) => Buffer.from(b64, 'base64').length;
  if (len(payload.ciphertext) > MAX_CIPHERTEXT_BYTES) {
    throw createError('Şifreli içerik boyutu sınırı aşıldı', 400);
  }
  if (len(payload.encryptedDataKey) > MAX_EDK_BYTES) {
    throw createError('Şifreli veri anahtarı geçersiz', 400);
  }
  if (len(payload.iv) > 64) {
    throw createError('IV geçersiz', 400);
  }
};

const getPsychologistByUserId = async (userId) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 403);
  return psy;
};

const ensureApprovedRelationship = async (psychologistId, patientUserId) => {
  const approved = await Appointment.findOne({
    where: { psychologistId, userId: patientUserId, status: 'approved' },
  });
  if (!approved) {
    throw createError('Bu hasta için onaylanmış bir randevunuz yok', 403);
  }
};

const createNote = async (userId, payload) => {
  assertOpaquePayload(payload);
  const psychologist = await getPsychologistByUserId(userId);
  await ensureApprovedRelationship(psychologist.id, payload.userId);

  const keyRow = await PsychologistKey.findOne({
    where: { psychologistId: psychologist.id },
  });
  if (!keyRow) {
    throw createError('Önce klinik anahtarı oluşturulmalıdır', 403);
  }

  const note = await PatientNote.create({
    psychologistId: psychologist.id,
    userId: payload.userId,
    ciphertext: payload.ciphertext,
    iv: payload.iv,
    encryptedDataKey: payload.encryptedDataKey,
    keyVersion: keyRow.keyVersion,
  });

  return note;
};

const listNotesForPatient = async (userId, patientUserId) => {
  const psychologist = await getPsychologistByUserId(userId);
  await ensureApprovedRelationship(psychologist.id, patientUserId);

  return PatientNote.findAll({
    where: { psychologistId: psychologist.id, userId: patientUserId },
    order: [['createdAt', 'DESC']],
  });
};

const listApprovedPatients = async (userId) => {
  const psychologist = await getPsychologistByUserId(userId);

  const approved = await Appointment.findAll({
    where: { psychologistId: psychologist.id, status: 'approved' },
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }], // email psikolog listesine girmez
    order: [['date', 'DESC']],
  });

  const map = new Map();
  for (const appt of approved) {
    if (!map.has(appt.userId)) {
      map.set(appt.userId, {
        userId: appt.userId,
        name: appt.user.name,
        lastDate: appt.date,
      });
    }
  }

  return Array.from(map.values());
};

const updateNote = async (userId, noteId, payload) => {
  assertOpaquePayload(payload);
  const psychologist = await getPsychologistByUserId(userId);
  const note = await PatientNote.findOne({
    where: { id: noteId, psychologistId: psychologist.id },
  });
  if (!note) throw createError('Not bulunamadı', 404);

  const keyRow = await PsychologistKey.findOne({
    where: { psychologistId: psychologist.id },
  });
  await note.update({
    ...payload,
    keyVersion: keyRow?.keyVersion ?? note.keyVersion,
  });
  return note;
};

const deleteNote = async (userId, noteId) => {
  const psychologist = await getPsychologistByUserId(userId);
  const note = await PatientNote.findOne({
    where: { id: noteId, psychologistId: psychologist.id },
  });
  if (!note) throw createError('Not bulunamadı', 404);

  await note.destroy();
  return true;
};

module.exports = {
  createNote,
  listNotesForPatient,
  listApprovedPatients,
  updateNote,
  deleteNote,
};
