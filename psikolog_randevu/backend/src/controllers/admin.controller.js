'use strict';

const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id, req.user.id);
    return sendSuccess(res, {}, 'Kullanıcı silindi');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, deleteUser };
