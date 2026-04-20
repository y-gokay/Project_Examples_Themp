'use strict';

const psychologistService = require('../services/psychologist.service');
const { createPsychologistSchema } = require('../validations/psychologist.validation');
const {
  updateProfileSchema,
  createFileDocumentSchema,
  createTextDocumentSchema,
} = require('../validations/profile.validation');
const { sendSuccess, zodFirstMessage, createError } = require('../utils/response');
const { processAvatar } = require('../middlewares/upload');

const getAll = async (req, res, next) => {
  try {
    const list = await psychologistService.getAll();
    return sendSuccess(res, list);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const psychologist = await psychologistService.getById(req.params.id);
    return sendSuccess(res, psychologist);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const parsed = createPsychologistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const result = await psychologistService.create(parsed.data);
    return sendSuccess(res, result, 'Psikolog başarıyla eklendi', 201);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await psychologistService.remove(req.params.id);
    return sendSuccess(res, {}, 'Psikolog silindi');
  } catch (err) { next(err); }
};

// --- Self ---

const getMe = async (req, res, next) => {
  try {
    const me = await psychologistService.getByUserId(req.user.id);
    return sendSuccess(res, me);
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const me = await psychologistService.updateMyProfile(req.user.id, parsed.data);
    return sendSuccess(res, me, 'Profil güncellendi');
  } catch (err) { next(err); }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw createError('Dosya yüklenmedi', 400);
    const { fileUrl } = await processAvatar(req.file.buffer);
    const psy = await psychologistService.setMyAvatar(req.user.id, fileUrl);
    return sendSuccess(res, { avatarUrl: psy.avatarUrl }, 'Avatar güncellendi');
  } catch (err) { next(err); }
};

const deleteAvatar = async (req, res, next) => {
  try {
    await psychologistService.clearMyAvatar(req.user.id);
    return sendSuccess(res, {}, 'Avatar silindi');
  } catch (err) { next(err); }
};

const addDocument = async (req, res, next) => {
  try {
    if (!req.file) throw createError('Dosya yüklenmedi', 400);
    const parsed = createFileDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const doc = await psychologistService.addMyFileDocument(req.user.id, {
      title: parsed.data.title,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
    return sendSuccess(res, doc, 'Belge yüklendi', 201);
  } catch (err) { next(err); }
};

const addTextDocument = async (req, res, next) => {
  try {
    const parsed = createTextDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const doc = await psychologistService.addMyTextDocument(req.user.id, parsed.data);
    return sendSuccess(res, doc, 'Belge eklendi', 201);
  } catch (err) { next(err); }
};

const deleteDocument = async (req, res, next) => {
  try {
    await psychologistService.removeMyDocument(req.user.id, req.params.id);
    return sendSuccess(res, {}, 'Belge silindi');
  } catch (err) { next(err); }
};

module.exports = {
  getAll, getById, create, remove,
  getMe, updateMe,
  uploadAvatar, deleteAvatar,
  addDocument, addTextDocument, deleteDocument,
};
