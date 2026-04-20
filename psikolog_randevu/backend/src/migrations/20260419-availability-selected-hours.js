'use strict';

const { hoursFromLegacyRange } = require('../utils/availabilityHours');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Availabilities', 'selectedHours', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    const [rows] = await queryInterface.sequelize.query(
      `SELECT id, "psychologistId", "dayOfWeek", "startTime", "endTime" FROM "Availabilities" ORDER BY id`
    );

    const byKey = new Map();
    for (const r of rows) {
      const key = `${r.psychologistId}_${r.dayOfWeek}`;
      if (!byKey.has(key)) {
        byKey.set(key, { ids: [], hourSet: new Set() });
      }
      const g = byKey.get(key);
      g.ids.push(r.id);
      hoursFromLegacyRange(r.startTime, r.endTime).forEach((h) => g.hourSet.add(h));
    }

    for (const [, g] of byKey) {
      const arr = [...g.hourSet].sort((a, b) => a - b);
      const keepId = Math.min(...g.ids);
      const deleteIds = g.ids.filter((id) => id !== keepId);
      await queryInterface.sequelize.query(
        `UPDATE "Availabilities" SET "selectedHours" = $1::jsonb WHERE id = $2`,
        { bind: [JSON.stringify(arr), keepId] }
      );
      if (deleteIds.length) {
        await queryInterface.sequelize.query(
          `DELETE FROM "Availabilities" WHERE id IN (${deleteIds.join(',')})`
        );
      }
    }

    await queryInterface.removeColumn('Availabilities', 'startTime');
    await queryInterface.removeColumn('Availabilities', 'endTime');

    await queryInterface.changeColumn('Availabilities', 'selectedHours', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.addConstraint('Availabilities', {
      fields: ['psychologistId', 'dayOfWeek'],
      type: 'unique',
      name: 'Availabilities_psychologistId_dayOfWeek_key',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Availabilities', 'Availabilities_psychologistId_dayOfWeek_key');

    await queryInterface.addColumn('Availabilities', 'startTime', {
      type: Sequelize.TIME,
      allowNull: true,
    });
    await queryInterface.addColumn('Availabilities', 'endTime', {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "Availabilities"
      SET
        "startTime" = '09:00',
        "endTime" = '17:00'
      WHERE "selectedHours" IS NOT NULL AND jsonb_array_length("selectedHours"::jsonb) > 0;
    `);

    await queryInterface.removeColumn('Availabilities', 'selectedHours');
  },
};
