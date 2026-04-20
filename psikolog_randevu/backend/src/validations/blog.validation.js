'use strict';

const { z } = require('zod');

const createBlogSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(400).optional().nullable(),
  content: z.string().min(10).max(60000),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

const updateBlogSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(400).optional().nullable(),
  content: z.string().min(10).max(60000).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

const listBlogQuerySchema = z.object({
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().max(1000).optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
});

module.exports = { createBlogSchema, updateBlogSchema, listBlogQuerySchema };
