'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PatientNotes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      psychologistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Psychologists', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ciphertext: { type: Sequelize.TEXT, allowNull: false },
      iv: { type: Sequelize.TEXT, allowNull: false },
      encryptedDataKey: { type: Sequelize.TEXT, allowNull: false },
      keyVersion: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('PatientNotes', ['psychologistId', 'userId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PatientNotes');
  },
};
