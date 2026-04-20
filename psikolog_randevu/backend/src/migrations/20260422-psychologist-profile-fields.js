'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Psychologists', 'title', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn('Psychologists', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Psychologists', 'avatarUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Psychologists', 'educations', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Psychologists', 'educations');
    await queryInterface.removeColumn('Psychologists', 'avatarUrl');
    await queryInterface.removeColumn('Psychologists', 'bio');
    await queryInterface.removeColumn('Psychologists', 'title');
  },
};
