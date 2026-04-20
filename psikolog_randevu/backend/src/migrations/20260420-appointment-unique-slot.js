'use strict';

/** Randevu double-booking'i DB seviyesinde engelle.
 *  status IN ('pending','approved') olan satırlar için
 *  (psychologistId, date, startTime) unique partial index.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS appointment_active_slot_unique
      ON "Appointments" ("psychologistId", "date", "startTime")
      WHERE status IN ('pending', 'approved');
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS appointment_active_slot_unique;
    `);
  },
};
