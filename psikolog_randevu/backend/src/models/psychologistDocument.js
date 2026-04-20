'use strict';

module.exports = (sequelize, DataTypes) => {
  const PsychologistDocument = sequelize.define('PsychologistDocument', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    psychologistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Psychologists', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('file', 'text'),
      allowNull: false,
      defaultValue: 'file',
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    paranoid: true,
  });

  return PsychologistDocument;
};
