'use strict';

const blogService = require('../services/blog.service');
const {
  createBlogSchema,
  updateBlogSchema,
  listBlogQuerySchema,
} = require('../validations/blog.validation');
const { sendSuccess, zodFirstMessage, createError } = require('../utils/response');
const { processCover } = require('../middlewares/upload');

// Public
const listPublic = async (req, res, next) => {
  try {
    const parsed = listBlogQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const data = await blogService.listPublic(parsed.data);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getPublic = async (req, res, next) => {
  try {
    const post = await blogService.getPublicBySlug(req.params.slug);
    return sendSuccess(res, post);
  } catch (err) { next(err); }
};

// Me
const listMine = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const data = await blogService.listMine(req.user.id, { page, limit });
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getMine = async (req, res, next) => {
  try {
    const post = await blogService.getMineById(req.user.id, req.params.id);
    return sendSuccess(res, post);
  } catch (err) { next(err); }
};

const createMine = async (req, res, next) => {
  try {
    const parsed = createBlogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const post = await blogService.createMine(req.user.id, parsed.data);
    return sendSuccess(res, post, 'Yazı oluşturuldu', 201);
  } catch (err) { next(err); }
};

const updateMine = async (req, res, next) => {
  try {
    const parsed = updateBlogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: zodFirstMessage(parsed.error) });
    }
    const post = await blogService.updateMine(req.user.id, req.params.id, parsed.data);
    return sendSuccess(res, post, 'Yazı güncellendi');
  } catch (err) { next(err); }
};

const publishMine = async (req, res, next) => {
  try {
    const post = await blogService.publishMine(req.user.id, req.params.id);
    return sendSuccess(res, post, 'Yazı yayınlandı');
  } catch (err) { next(err); }
};

const unpublishMine = async (req, res, next) => {
  try {
    const post = await blogService.unpublishMine(req.user.id, req.params.id);
    return sendSuccess(res, post, 'Yazı taslağa alındı');
  } catch (err) { next(err); }
};

const deleteMine = async (req, res, next) => {
  try {
    await blogService.deleteMine(req.user.id, req.params.id);
    return sendSuccess(res, {}, 'Yazı silindi');
  } catch (err) { next(err); }
};

const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) throw createError('Dosya yüklenmedi', 400);
    const { fileUrl } = await processCover(req.file.buffer);
    const post = await blogService.setCover(req.user.id, req.params.id, fileUrl);
    return sendSuccess(res, { coverImageUrl: post.coverImageUrl }, 'Kapak güncellendi');
  } catch (err) { next(err); }
};

module.exports = {
  listPublic, getPublic,
  listMine, getMine, createMine, updateMine,
  publishMine, unpublishMine, deleteMine, uploadCover,
};
