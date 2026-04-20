'use strict';

/** Eski `active` kayıtlarını `approved` yapar; yeni akışta `active` kullanılmaz. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "Appointments"
      SET status = 'approved'
      WHERE status::text = 'active';
    `);
  },

  async down() {
    // Geri alınmaz; veri tutarlılığı için tek yönlü.
  },
};
