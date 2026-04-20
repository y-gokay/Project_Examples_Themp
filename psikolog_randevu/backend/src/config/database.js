require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
};

const prodExtra = {
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: true },
  },
};

module.exports = {
  development: { ...base, database: process.env.DB_NAME },
  test: { ...base, database: process.env.DB_NAME + '_test' },
  production: { ...base, ...prodExtra, database: process.env.DB_NAME },
};
