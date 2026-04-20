'use strict';

const noteService = require('../services/note.service');
const { createNoteSchema, updateNoteSchema } = require('../validations/note.validation');
const { sendSuccess, zodFirstMessage } = require('../utils/response');

const validate = (schema, data, res) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: zodFirstMessage(parsed.error),
    });
    return null;
  }
  return parsed.data;
};

const create = async (req, res, next) => {
  try {
    const data = validate(createNoteSchema, req.body, res);
    if (!data) return;
    const note = await noteService.createNote(req.user.id, data);
    return sendSuccess(res, note, 'Not kaydedildi', 201);
  } catch (err) {
    next(err);
  }
};

const listForPatient = async (req, res, next) => {
  try {
    const patientUserId = Number(req.query.userId);
    if (!patientUserId) {
      return res.status(400).json({ success: false, message: 'userId gerekli' });
    }
    const notes = await noteService.listNotesForPatient(req.user.id, patientUserId);
    return sendSuccess(res, notes);
  } catch (err) {
    next(err);
  }
};

const listPatients = async (req, res, next) => {
  try {
    const patients = await noteService.listApprovedPatients(req.user.id);
    return sendSuccess(res, patients);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = validate(updateNoteSchema, req.body, res);
    if (!data) return;
    const note = await noteService.updateNote(req.user.id, req.params.id, data);
    return sendSuccess(res, note, 'Not güncellendi');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await noteService.deleteNote(req.user.id, req.params.id);
    return sendSuccess(res, null, 'Not silindi');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listForPatient, listPatients, update, remove };
