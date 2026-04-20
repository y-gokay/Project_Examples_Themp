'use strict';

/** FK kolonlarına index ekle — join query'leri dramatik hızlanır. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const indexes = [
      { table: 'Appointments', field: 'userId' },
      { table: 'Appointments', field: 'psychologistId' },
      { table: 'PatientNotes', field: 'userId' },
      { table: 'PatientNotes', field: 'psychologistId' },
      { table: 'Psychologists', field: 'userId' },
      { table: 'Availabilities', field: 'psychologistId' },
      { table: 'PsychologistKeys', field: 'psychologistId' },
    ];

    for (const { table, field } of indexes) {
      const name = `${table.toLowerCase()}_${field.toLowerCase()}_idx`;
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" ("${field}");
      `);
    }

    // Availability: (psychologistId, dayOfWeek) unique — aynı psikolog için aynı günü tekrarlama
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS availabilities_psych_day_unique
      ON "Availabilities" ("psychologistId", "dayOfWeek");
    `);
  },

  async down(queryInterface, Sequelize) {
    const names = [
      'appointments_userid_idx',
      'appointments_psychologistid_idx',
      'patientnotes_userid_idx',
      'patientnotes_psychologistid_idx',
      'psychologists_userid_idx',
      'availabilities_psychologistid_idx',
      'psychologistkeys_psychologistid_idx',
      'availabilities_psych_day_unique',
    ];
    for (const name of names) {
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "${name}";`);
    }
  },
};
