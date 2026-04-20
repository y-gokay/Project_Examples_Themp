'use strict';

const { User } = require('../models');
const { createError } = require('../utils/response');

const getAllUsers = async () => {
  return User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
};

const deleteUser = async (id, actorUserId) => {
  const numericId = Number(id);
  if (actorUserId !== undefined && Number(actorUserId) === numericId) {
    throw createError('Kendi hesabınızı bu ekrandan silemezsiniz', 403);
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw createError('Kullanıcı bulunamadı', 404);
  }

  if (user.role === 'admin') {
    throw createError('Admin kullanıcılar silinemez', 403);
  }

  await user.destroy();
};

module.exports = { getAllUsers, deleteUser };
