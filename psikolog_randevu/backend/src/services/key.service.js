'use strict';

const { PsychologistKey, Psychologist } = require('../models');
const { createError } = require('../utils/response');

const getPsychologistByUserId = async (userId) => {
  const psy = await Psychologist.findOne({ where: { userId } });
  if (!psy) throw createError('Psikolog profili bulunamadı', 403);
  return psy;
};

const setupKey = async (userId, payload) => {
  const psychologist = await getPsychologistByUserId(userId);
  const existing = await PsychologistKey.findOne({
    where: { psychologistId: psychologist.id },
  });
  if (existing) {
    throw createError('Anahtar zaten mevcut. Rotasyon için ayrı akış gereklidir.', 409);
  }

  const record = await PsychologistKey.create({
    psychologistId: psychologist.id,
    ...payload,
  });

  return sanitize(record);
};

const getMyKey = async (userId) => {
  const psychologist = await getPsychologistByUserId(userId);
  const key = await PsychologistKey.findOne({
    where: { psychologistId: psychologist.id },
  });
  return key ? sanitize(key) : null;
};

const sanitize = (key) => ({
  id: key.id,
  psychologistId: key.psychologistId,
  publicKeyJwk: key.publicKeyJwk,
  encryptedPrivateKey: key.encryptedPrivateKey,
  privateKeyIv: key.privateKeyIv,
  privateKeySalt: key.privateKeySalt,
  kdfParams: key.kdfParams,
  keyVersion: key.keyVersion,
});

const getPublicKeyByPsychologistId = async (psychologistId) => {
  const key = await PsychologistKey.findOne({ where: { psychologistId } });
  if (!key) throw createError('Bu psikolog için kayıtlı anahtar yok', 404);
  return {
    psychologistId: key.psychologistId,
    publicKeyJwk: key.publicKeyJwk,
    keyVersion: key.keyVersion,
  };
};

module.exports = { setupKey, getMyKey, getPublicKeyByPsychologistId };
