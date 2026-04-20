'use strict';

require('dotenv').config();
const { validateEnv } = require('./utils/envCheck');

try {
  validateEnv();
} catch (err) {
  console.error(`[startup] ${err.message}`);
  process.exit(1);
}

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5001;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL bağlantısı başarılı.');

    const server = app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} alındı, kapatılıyor...`);
      server.close(async () => {
        await sequelize.close();
        console.log('Bağlantılar kapatıldı.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Sunucu başlatılamadı:', err.message);
    process.exit(1);
  }
};

start();
