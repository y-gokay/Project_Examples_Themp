'use strict';

const express = require('express');
const router = express.Router();
const keyController = require('../controllers/key.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/setup', authMiddleware, roleMiddleware('psychologist'), keyController.setup);
router.get('/me', authMiddleware, roleMiddleware('psychologist'), keyController.getMine);
router.get(
  '/psychologist/:id/public',
  authMiddleware,
  keyController.getPublicForPsychologist
);

module.exports = router;
