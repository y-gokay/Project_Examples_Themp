'use strict';

module.exports = (sequelize, DataTypes) => {
  const PatientNote = sequelize.define('PatientNote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    psychologistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Psychologists', key: 'id' },
      onDelete: 'RESTRICT',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'RESTRICT',
    },
    ciphertext: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    encryptedDataKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    keyVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    paranoid: true, // soft-delete: deletedAt kolonu, klinik kayıtlar kalıcı silinmez
  });

  return PatientNote;
};
