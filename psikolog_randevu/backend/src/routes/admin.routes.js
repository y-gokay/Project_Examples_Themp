'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { intParam } = require('../middlewares/paramValidator');

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', intParam('id'), adminController.deleteUser);

module.exports = router;
