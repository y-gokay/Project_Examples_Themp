'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PsychologistKeys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      psychologistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'Psychologists', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      publicKeyJwk: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      encryptedPrivateKey: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      privateKeyIv: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      privateKeySalt: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      kdfParams: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      keyVersion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PsychologistKeys');
  },
};
