'use strict';

const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { intParam } = require('../middlewares/paramValidator');

router.use(authMiddleware, roleMiddleware('psychologist'));

router.get('/patients', noteController.listPatients);
router.get('/', noteController.listForPatient);
router.post('/', noteController.create);
router.patch('/:id', intParam('id'), noteController.update);
router.delete('/:id', intParam('id'), noteController.remove);

module.exports = router;
