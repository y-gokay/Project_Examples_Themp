'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ENUM yeni değerler
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Appointments_status" ADD VALUE IF NOT EXISTS 'pending';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Appointments_status" ADD VALUE IF NOT EXISTS 'approved';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Appointments_status" ADD VALUE IF NOT EXISTS 'rejected';`
    );

    await queryInterface.addColumn('Appointments', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Appointments', 'cancelledBy', {
      type: Sequelize.ENUM('user', 'psychologist'),
      allowNull: true,
    });

    await queryInterface.addColumn('Appointments', 'decidedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Appointments', 'rejectionReason');
    await queryInterface.removeColumn('Appointments', 'cancelledBy');
    await queryInterface.removeColumn('Appointments', 'decidedAt');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Appointments_cancelledBy";`);
  },
};
