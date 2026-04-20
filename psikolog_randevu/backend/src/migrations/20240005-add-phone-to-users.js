'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
      after: 'email',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'phone');
  },
};
