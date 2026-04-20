'use strict';

module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    psychologistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dayOfWeek: {
      type: DataTypes.INTEGER, // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
      allowNull: false,
    },
    /** Seçilen tam saat blokları: 8 => 08:00–09:00, …, 16 => 16:00–17:00 (30 dk randevulara bölünür) */
    selectedHours: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  }, {
    indexes: [
      { unique: true, fields: ['psychologistId', 'dayOfWeek'] },
    ],
  });

  return Availability;
};
