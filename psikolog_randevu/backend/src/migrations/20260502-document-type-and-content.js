'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ENUM tipi oluştur
    await queryInterface.sequelize.query(
      `DO $$ BEGIN
         CREATE TYPE "enum_PsychologistDocuments_type" AS ENUM ('file', 'text');
       EXCEPTION WHEN duplicate_object THEN NULL;
       END $$;`
    );

    await queryInterface.addColumn('PsychologistDocuments', 'type', {
      type: Sequelize.ENUM('file', 'text'),
      allowNull: false,
      defaultValue: 'file',
    });

    await queryInterface.addColumn('PsychologistDocuments', 'content', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // fileUrl, mimeType, sizeBytes artık nullable
    await queryInterface.changeColumn('PsychologistDocuments', 'fileUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('PsychologistDocuments', 'mimeType', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('PsychologistDocuments', 'sizeBytes', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PsychologistDocuments', 'type');
    await queryInterface.removeColumn('PsychologistDocuments', 'content');

    await queryInterface.changeColumn('PsychologistDocuments', 'fileUrl', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('PsychologistDocuments', 'mimeType', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('PsychologistDocuments', 'sizeBytes', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_PsychologistDocuments_type";`
    );
  },
};
