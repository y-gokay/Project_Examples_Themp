'use strict';

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { intParam } = require('../middlewares/paramValidator');
const { searchLimiter } = require('../middlewares/rateLimiters');

// Vatandaş
router.post('/', authMiddleware, roleMiddleware('user'), appointmentController.create);
router.get('/me', authMiddleware, appointmentController.getMyAppointments);

// Hasta veya psikolog iptal
router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware('user', 'psychologist'),
  intParam('id'),
  appointmentController.cancel
);

// Psikolog
router.get(
  '/psychologist',
  authMiddleware,
  roleMiddleware('psychologist'),
  appointmentController.getPsychologistAppointments
);
router.get(
  '/pending',
  authMiddleware,
  roleMiddleware('psychologist'),
  appointmentController.getPending
);
router.get(
  '/history',
  authMiddleware,
  roleMiddleware('psychologist'),
  searchLimiter,
  appointmentController.getHistory
);
router.patch(
  '/:id/decision',
  authMiddleware,
  roleMiddleware('psychologist'),
  intParam('id'),
  appointmentController.decide
);

// Admin
router.get('/', authMiddleware, roleMiddleware('admin'), appointmentController.getAllAppointments);

module.exports = router;
