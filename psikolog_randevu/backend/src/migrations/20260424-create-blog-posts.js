'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogPosts', {
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
      title: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(220), allowNull: false, unique: true },
      excerpt: { type: Sequelize.STRING(400), allowNull: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      coverImageUrl: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'draft',
      },
      publishedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { allowNull: true, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('BlogPosts', ['psychologistId']);
    await queryInterface.addIndex('BlogPosts', ['status', 'publishedAt']);
    await queryInterface.addIndex('BlogPosts', ['slug'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BlogPosts');
    // ENUM temizliği
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_BlogPosts_status";');
  },
};
