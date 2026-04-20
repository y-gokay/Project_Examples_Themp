'use strict';

const { z } = require('zod');

const base64 = z.string().regex(/^[A-Za-z0-9+/]+=*$/, 'Geçersiz base64');

const decodedMax = (maxBytes) =>
  base64.refine(
    (s) => {
      try {
        return Buffer.from(s, 'base64').length <= maxBytes;
      } catch {
        return false;
      }
    },
    { message: 'İçerik boyutu sınırı aşıldı' }
  );

const createNoteSchema = z.object({
  userId: z.number().int().positive(),
  ciphertext: decodedMax(65536),
  iv: decodedMax(64),
  encryptedDataKey: decodedMax(512),
});

const updateNoteSchema = z.object({
  ciphertext: decodedMax(65536),
  iv: decodedMax(64),
  encryptedDataKey: decodedMax(512),
});

module.exports = { createNoteSchema, updateNoteSchema };
