'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'kvkkAcceptedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'emailVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Mevcut kullanıcılar için varsayılan: kayıtlı oldukları için varsayılan kabul edilmiş say
    await queryInterface.sequelize.query(
      `UPDATE "Users" SET "kvkkAcceptedAt" = "createdAt" WHERE "kvkkAcceptedAt" IS NULL`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'kvkkAcceptedAt');
    await queryInterface.removeColumn('Users', 'emailVerifiedAt');
  },
};
