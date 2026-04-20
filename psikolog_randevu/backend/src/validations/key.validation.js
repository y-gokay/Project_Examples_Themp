'use strict';

const { z } = require('zod');

const base64 = z.string().regex(/^[A-Za-z0-9+/=_-]+$/, 'Geçersiz base64');

const setupKeySchema = z.object({
  publicKeyJwk: z.string().min(10).max(8192),
  encryptedPrivateKey: base64.max(16384),
  privateKeyIv: base64.max(256),
  privateKeySalt: base64.max(256),
  kdfParams: z.object({
    iterations: z.number().int().min(310000).max(2000000),
    hash: z.enum(['SHA-256', 'SHA-512']),
  }),
});

module.exports = { setupKeySchema };
