'use strict';

const { z } = require('zod');

const upsertAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  /** 8 = 08:00–09:00, …, 16 = 16:00–17:00; boş = o günü temizle */
  selectedHours: z.array(z.number().int().min(8).max(16)).default([]),
});

module.exports = { upsertAvailabilitySchema };
