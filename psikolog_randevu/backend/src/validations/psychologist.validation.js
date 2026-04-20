'use strict';

const { z } = require('zod');

const createPsychologistSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z
    .string()
    .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  specializations: z.array(z.string().min(1).max(60)).max(10).optional(),
});

module.exports = { createPsychologistSchema };
