"use strict";

/**
 * Startup-time environment validation.
 * Fails fast if critical env vars are missing or insecure.
 */

const REQUIRED = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "JWT_SECRET",
];

const validateEnv = () => {
  const missing = REQUIRED.filter(
    (k) => !process.env[k] || process.env[k].trim() === "",
  );
  if (missing.length) {
    throw new Error(`Eksik zorunlu env değişkenleri: ${missing.join(", ")}`);
  }

  /*   const secret = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === 'production';
  const minLen = isProd ? 64 : 24;
  if (secret.length < minLen) {
    throw new Error(
      `JWT_SECRET çok kısa (${secret.length} karakter). ${isProd ? 'Production' : 'Development'} için minimum ${minLen} karakter olmalı.`
    );W
  } */

  /*   const weak = [
    "changeme",
    "secret",
    "password",
    "12345",
    "jwt_secret",
    "changeme_at_least_64",
  ]; */
  /*   if (weak.some((w) => secret.toLowerCase().includes(w))) {
    throw new Error(
      "JWT_SECRET zayıf görünüyor (örnek/placeholder değer içeriyor). Güçlü bir secret üretin (örn: `openssl rand -hex 32`).",
    );
  } */

  if (!process.env.FRONTEND_URL) {
    console.warn(
      "[uyarı] FRONTEND_URL tanımlı değil; CORS varsayılan olarak http://localhost:5173 kullanılacak.",
    );
  }
};

module.exports = { validateEnv };
