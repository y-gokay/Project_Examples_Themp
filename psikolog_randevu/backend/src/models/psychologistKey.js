'use strict';

module.exports = (sequelize, DataTypes) => {
  const PsychologistKey = sequelize.define('PsychologistKey', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    psychologistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    publicKeyJwk: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    encryptedPrivateKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    privateKeyIv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    privateKeySalt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    kdfParams: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    keyVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });

  return PsychologistKey;
};
