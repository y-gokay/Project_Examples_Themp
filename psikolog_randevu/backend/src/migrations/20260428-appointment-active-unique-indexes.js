'use strict';

/** Aynı kullanıcı veya psikolog için aynı tarih+saatte birden fazla pending/approved randevuyu engeller. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "appointments_user_datetime_active"
      ON "Appointments" ("userId", "date", "startTime")
      WHERE status IN ('pending', 'approved');
    `);
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "appointments_psychologist_datetime_active"
      ON "Appointments" ("psychologistId", "date", "startTime")
      WHERE status IN ('pending', 'approved');
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "appointments_user_datetime_active";`);
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "appointments_psychologist_datetime_active";`);
  },
};
