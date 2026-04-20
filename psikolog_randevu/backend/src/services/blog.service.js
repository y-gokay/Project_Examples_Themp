'use strict';

const { Op, UniqueConstraintError } = require('sequelize');
const { BlogPost, Psychologist, User } = require('../models');
const { createError } = require('../utils/response');
const { generateUniqueSlug } = require('../utils/slug');
const { escapeLike } = require('../utils/sql');
const { unlinkFile } = require('../middlewares/upload');

const AUTHOR_INCLUDE = {
  model: Psychologist,
  as: 'psychologist',
  attributes: ['id', 'title', 'avatarUrl', 'specializations'],
  include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
};

const getPsychologistIdByUserId = async (userId) => {
  const psy = await Psychologist.findOne({ where: { userId }, attributes: ['id'] });
  if (!psy) throw createError('Psikolog profili bulunamadı', 403);
  return psy.id;
};

// --- Public ---

const listPublic = async ({ q, page, limit }) => {
  const where = { status: 'published' };
  if (q && q.trim()) {
    const like = `%${escapeLike(q.trim())}%`;
    where[Op.or] = [
      { title: { [Op.iLike]: like } },
      { excerpt: { [Op.iLike]: like } },
    ];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await BlogPost.findAndCountAll({
    where,
    attributes: ['id', 'title', 'slug', 'excerpt', 'coverImageUrl', 'publishedAt'],
    include: [AUTHOR_INCLUDE],
    order: [['publishedAt', 'DESC']],
    limit, offset,
  });

  return { items: rows, total: count, page, limit };
};

const getPublicBySlug = async (slug) => {
  const post = await BlogPost.findOne({
    where: { slug, status: 'published' },
    include: [AUTHOR_INCLUDE],
  });
  if (!post) throw createError('Yazı bulunamadı', 404);
  return post;
};

// --- Author (me) ---

const listMine = async (userId, { page = 1, limit = 20 } = {}) => {
  const psychologistId = await getPsychologistIdByUserId(userId);
  const offset = (page - 1) * limit;
  const { rows, count } = await BlogPost.findAndCountAll({
    where: { psychologistId },
    order: [['updatedAt', 'DESC']],
    limit, offset,
  });
  return { items: rows, total: count, page, limit };
};

const getMineById = async (userId, id) => {
  const psychologistId = await getPsychologistIdByUserId(userId);
  const post = await BlogPost.findOne({ where: { id, psychologistId } });
  if (!post) throw createError('Yazı bulunamadı', 404);
  return post;
};

const createMine = async (userId, payload) => {
  const psychologistId = await getPsychologistIdByUserId(userId);
  const status = payload.status || 'draft';

  // Slug üretim + retry (race condition için)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const slug = await generateUniqueSlug(BlogPost, payload.title);
      const post = await BlogPost.create({
        psychologistId,
        title: payload.title,
        slug,
        excerpt: payload.excerpt || null,
        content: payload.content,
        status,
        publishedAt: status === 'published' ? new Date() : null,
      });
      return post;
    } catch (err) {
      if (err instanceof UniqueConstraintError && attempt < 2) continue;
      throw err;
    }
  }
  throw createError('Yazı oluşturulamadı', 500);
};

const updateMine = async (userId, id, payload) => {
  const psychologistId = await getPsychologistIdByUserId(userId);
  const post = await BlogPost.findOne({ where: { id, psychologistId } });
  if (!post) throw createError('Yazı bulunamadı', 404);

  const patch = {};
  if (payload.title !== undefined && payload.title !== post.title) {
    patch.title = payload.title;
    patch.slug = await generateUniqueSlug(BlogPost, payload.title, post.id);
  }
  if (payload.excerpt !== undefined) patch.excerpt = payload.excerpt;
  if (payload.content !== undefined) patch.content = payload.content;

  if (payload.status !== undefined && payload.status !== post.status) {
    patch.status = payload.status;
    if (payload.status === 'published' && !post.publishedAt) {
      patch.publishedAt = new Date();
    }
  }

  await post.update(patch);
  return post;
};

const publishMine = async (userId, id) => {
  const post = await getMineById(userId, id);
  await post.update({
    status: 'published',
    publishedAt: post.publishedAt || new Date(),
  });
  return post;
};

const unpublishMine = async (userId, id) => {
  const post = await getMineById(userId, id);
  await post.update({ status: 'draft' });
  return post;
};

const deleteMine = async (userId, id) => {
  const post = await getMineById(userId, id);
  await post.destroy(); // soft delete
  return true;
};

const setCover = async (userId, id, fileUrl) => {
  const post = await getMineById(userId, id);
  const old = post.coverImageUrl;
  await post.update({ coverImageUrl: fileUrl });
  if (old) await unlinkFile(old);
  return post;
};

module.exports = {
  listPublic,
  getPublicBySlug,
  listMine,
  getMineById,
  createMine,
  updateMine,
  publishMine,
  unpublishMine,
  deleteMine,
  setCover,
};
