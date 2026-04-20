'use strict';

const express = require('express');
const router = express.Router();
const psychologistController = require('../controllers/psychologist.controller');
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { slotLimiter } = require('../middlewares/rateLimiters');
const { intParam } = require('../middlewares/paramValidator');
const { avatarUpload, documentUpload } = require('../middlewares/upload');

// Public
router.get('/', psychologistController.getAll);

// Self (me) — :id'den ÖNCE olmalı
router.get('/me', authMiddleware, roleMiddleware('psychologist'), psychologistController.getMe);
router.patch('/me', authMiddleware, roleMiddleware('psychologist'), psychologistController.updateMe);
router.post(
  '/me/avatar',
  authMiddleware,
  roleMiddleware('psychologist'),
  avatarUpload.single('avatar'),
  psychologistController.uploadAvatar
);
router.delete(
  '/me/avatar',
  authMiddleware,
  roleMiddleware('psychologist'),
  psychologistController.deleteAvatar
);
router.post(
  '/me/documents',
  authMiddleware,
  roleMiddleware('psychologist'),
  documentUpload.single('file'),
  psychologistController.addDocument
);
router.post(
  '/me/documents/text',
  authMiddleware,
  roleMiddleware('psychologist'),
  psychologistController.addTextDocument
);
router.delete(
  '/me/documents/:id',
  authMiddleware,
  roleMiddleware('psychologist'),
  intParam('id'),
  psychologistController.deleteDocument
);

// Public by id
router.get('/:id', intParam('id'), psychologistController.getById);
router.get('/:id/slots', intParam('id'), slotLimiter, appointmentController.getSlots);

// Admin only
router.post('/', authMiddleware, roleMiddleware('admin'), psychologistController.create);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), intParam('id'), psychologistController.remove);

module.exports = router;
