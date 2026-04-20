'use strict';

const { z } = require('zod');

const createAppointmentSchema = z.object({
  psychologistId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  userNotes: z.string().max(2000, 'Not en fazla 2000 karakter olabilir').optional(),
});

const decisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().max(500).optional(),
});

const historyFilterSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q: z.string().trim().max(100).optional(),
  scope: z.enum(['upcoming', 'past', 'all']).optional(),
});

const cancelSchema = z.object({}).strict();

module.exports = {
  createAppointmentSchema,
  decisionSchema,
  historyFilterSchema,
  cancelSchema,
};
