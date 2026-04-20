'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Psychologists', 'specializations', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    // Mevcut specialization string'ini array'e taşı
    await queryInterface.sequelize.query(`
      UPDATE "Psychologists"
      SET specializations = CASE
        WHEN specialization IS NULL OR trim(specialization) = '' THEN '[]'::jsonb
        WHEN position(',' IN specialization) > 0
          THEN to_jsonb(
            array(
              SELECT trim(s)
              FROM unnest(string_to_array(specialization, ',')) AS s
              WHERE trim(s) <> ''
            )
          )
        ELSE jsonb_build_array(trim(specialization))
      END
    `);

    await queryInterface.removeColumn('Psychologists', 'specialization');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Psychologists', 'specialization', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Array'i virgüllü string'e geri dönüştür
    await queryInterface.sequelize.query(`
      UPDATE "Psychologists"
      SET specialization = (
        SELECT string_agg(elem, ', ')
        FROM jsonb_array_elements_text(specializations) AS elem
      )
    `);

    await queryInterface.removeColumn('Psychologists', 'specializations');
  },
};
