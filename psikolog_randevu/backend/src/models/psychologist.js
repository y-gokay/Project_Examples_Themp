'use strict';

module.exports = (sequelize, DataTypes) => {
  const Psychologist = sequelize.define('Psychologist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    specializations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    educations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  });

  return Psychologist;
};
