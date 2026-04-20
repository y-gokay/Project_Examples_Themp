'use strict';

const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { intParam } = require('../middlewares/paramValidator');

// Psikolog — spesifik path'ler önce
router.put('/', authMiddleware, roleMiddleware('psychologist'), availabilityController.upsert);
router.delete(
  '/day/:dayOfWeek',
  authMiddleware,
  roleMiddleware('psychologist'),
  intParam('dayOfWeek'),
  availabilityController.removeDay
);

// Public
router.get('/:psychologistId', intParam('psychologistId'), availabilityController.getByPsychologist);

module.exports = router;
