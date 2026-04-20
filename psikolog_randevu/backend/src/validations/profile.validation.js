'use strict';

const { z } = require('zod');

const educationItemSchema = z.object({
  school: z.string().min(1).max(200),
  degree: z.string().max(120).optional().default(''),
  field: z.string().max(200).optional().default(''),
  year: z.union([z.string().max(20), z.number().int()]).optional(),
});

const updateProfileSchema = z.object({
  title: z.string().max(120).optional().nullable(),
  bio: z.string().max(4000).optional().nullable(),
  specializations: z.array(z.string().min(1).max(60)).max(10).optional(),
  educations: z.array(educationItemSchema).max(20).optional(),
});

const createFileDocumentSchema = z.object({
  title: z.string().min(1).max(200),
});

const createTextDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

module.exports = {
  updateProfileSchema,
  createFileDocumentSchema,
  createTextDocumentSchema,
};
