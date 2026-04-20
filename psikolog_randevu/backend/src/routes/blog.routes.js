'use strict';

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { searchLimiter } = require('../middlewares/rateLimiters');
const { intParam } = require('../middlewares/paramValidator');
const { coverUpload } = require('../middlewares/upload');

// --- Author (me) — :slug'den önce
router.get('/me', authMiddleware, roleMiddleware('psychologist'), blogController.listMine);
router.post('/me', authMiddleware, roleMiddleware('psychologist'), blogController.createMine);
router.get('/me/:id', authMiddleware, roleMiddleware('psychologist'), intParam('id'), blogController.getMine);
router.patch('/me/:id', authMiddleware, roleMiddleware('psychologist'), intParam('id'), blogController.updateMine);
router.delete('/me/:id', authMiddleware, roleMiddleware('psychologist'), intParam('id'), blogController.deleteMine);
router.post('/me/:id/publish', authMiddleware, roleMiddleware('psychologist'), intParam('id'), blogController.publishMine);
router.post('/me/:id/unpublish', authMiddleware, roleMiddleware('psychologist'), intParam('id'), blogController.unpublishMine);
router.post(
  '/me/:id/cover',
  authMiddleware,
  roleMiddleware('psychologist'),
  intParam('id'),
  coverUpload.single('cover'),
  blogController.uploadCover
);

// --- Public
router.get('/', searchLimiter, blogController.listPublic);
router.get('/:slug', blogController.getPublic);

module.exports = router;
