'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const userPassword = await bcrypt.hash('kullanici123', 12);
    const psyPassword = await bcrypt.hash('psikolog123', 12);

    // Vatandaş ve psikolog kullanıcısını ekle
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@test.com',
        phone: '05321234567',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dr. Zeynep Arslan',
        email: 'zeynep@pdr.com',
        phone: '05339876543',
        password: psyPassword,
        role: 'psychologist',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Psikolog profilini oluştur (userId = en son eklenen psikolog user'ı)
    const psyUser = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'zeynep@pdr.com' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (psyUser.length > 0) {
      await queryInterface.bulkInsert('Psychologists', [
        {
          userId: psyUser[0].id,
          specializations: ['Klinik Psikoloji', 'Aile Danışmanlığı'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Psikolog kaydının ID'sini al
      const psyRecord = await queryInterface.sequelize.query(
        `SELECT id FROM "Psychologists" WHERE "userId" = ${psyUser[0].id} LIMIT 1`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (psyRecord.length > 0) {
        // Haftalık müsaitlik: Pazartesi–Cuma, 09:00–17:00 (saat blokları 9–16)
        // bulkInsert JS dizisini PG'ye integer[] gönderir; jsonb için JSON metni gerekir
        const demoHoursJson = JSON.stringify([9, 10, 11, 12, 13, 14, 15, 16]);
        const availabilities = [1, 2, 3, 4, 5].map((day) => ({
          psychologistId: psyRecord[0].id,
          dayOfWeek: day,
          selectedHours: demoHoursJson,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('Availabilities', availabilities);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', {
      email: ['ahmet@test.com', 'zeynep@pdr.com'],
    }, {});
  },
};
