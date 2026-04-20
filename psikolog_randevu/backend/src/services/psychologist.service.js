'use strict';

const bcrypt = require('bcryptjs');
const { User, Psychologist, Availability, PsychologistDocument, BlogPost } = require('../models');
const { createError } = require('../utils/response');
const { normalizePhone } = require('../utils/phone');
const { unlinkFile } = require('../middlewares/upload');

const PUBLIC_PSYC_ATTRS = [
  'id', 'userId', 'specializations', 'title', 'bio', 'avatarUrl', 'educations',
];

const getAll = async () => {
  return Psychologist.findAll({
    attributes: PUBLIC_PSYC_ATTRS,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name'] },
      { model: Availability, as: 'availabilities' },
    ],
    order: [['id', 'ASC']],
  });
};

const getById = async (id) => {
  const psychologist = await Psychologist.findByPk(id, {
    attributes: PUBLIC_PSYC_ATTRS,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name'] },
      { model: Availability, as: 'availabilities' },
      {
        model: PsychologistDocument,
        as: 'documents',
        attributes: ['id', 'title', 'type', 'fileUrl', 'mimeType', 'createdAt'],
      },
    ],
  });

  if (!psychologist) {
    throw createError('Psikolog bulunamadı', 404);
  }

  const recentPosts = await BlogPost.findAll({
    where: { psychologistId: id, status: 'published' },
    attributes: ['id', 'title', 'slug', 'excerpt', 'coverImageUrl', 'publishedAt'],
    order: [['publishedAt', 'DESC']],
    limit: 3,
  });

  const plain = psychologist.toJSON();
  plain.recentPosts = recentPosts;
  return plain;
};

const create = async ({ name, email, phone, password, specializations }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw createError('Bu e-posta adresi zaten kullanılıyor', 409);
  }

  const normalizedPhone = normalizePhone(phone);
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name, email, phone: normalizedPhone,
    password: hashedPassword, role: 'psychologist',
  });

  const psychologist = await Psychologist.create({
    userId: user.id,
    specializations: specializations || [],
  });

  return { user: { id: user.id, name: user.name, email: user.email }, psychologist };
};

const remove = async (id) => {
  const psychologist = await Psychologist.findByPk(id);
  if (!psychologist) throw createError('Psikolog bulunamadı', 404);
  await User.destroy({ where: { id: psychologist.userId } });
};

// --- Self-service (me) ---

const getByUserId = async (userId) => {
  const psy = await Psychologist.findOne({
    where: { userId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      {
        model: PsychologistDocument,
        as: 'documents',
        attributes: ['id', 'title', 'type', 'fileUrl', 'mimeType', 'sizeBytes', 'content', 'createdAt'],
      },
    ],
  });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);
  return psy;
};

const updateMyProfile = async (userId, payload) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);

  const updatable = ['title', 'bio', 'specializations', 'educations'];
  const patch = {};
  for (const key of updatable) {
    if (payload[key] !== undefined) patch[key] = payload[key];
  }
  await psy.update(patch);
  return getByUserId(userId);
};

const setMyAvatar = async (userId, fileUrl) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);

  const old = psy.avatarUrl;
  await psy.update({ avatarUrl: fileUrl });
  if (old) await unlinkFile(old);
  return psy;
};

const clearMyAvatar = async (userId) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);
  const old = psy.avatarUrl;
  await psy.update({ avatarUrl: null });
  if (old) await unlinkFile(old);
  return psy;
};

const addMyFileDocument = async (userId, { title, fileUrl, mimeType, sizeBytes }) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);

  return PsychologistDocument.create({
    psychologistId: psy.id,
    type: 'file',
    title,
    fileUrl,
    mimeType,
    sizeBytes,
  });
};

const addMyTextDocument = async (userId, { title, content }) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);

  return PsychologistDocument.create({
    psychologistId: psy.id,
    type: 'text',
    title,
    content,
  });
};

const removeMyDocument = async (userId, documentId) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 404);

  const doc = await PsychologistDocument.findOne({
    where: { id: documentId, psychologistId: psy.id },
  });
  if (!doc) throw createError('Belge bulunamadı', 404);

  if (doc.type === 'file' && doc.fileUrl) {
    await unlinkFile(doc.fileUrl);
  }
  await doc.destroy();
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  remove,
  getByUserId,
  updateMyProfile,
  setMyAvatar,
  clearMyAvatar,
  addMyFileDocument,
  addMyTextDocument,
  removeMyDocument,
};
