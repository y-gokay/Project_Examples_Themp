'use strict';

const slugify = require('slugify');
const crypto = require('crypto');

const baseSlug = (text) =>
  slugify(String(text || ''), {
    lower: true,
    strict: true,
    locale: 'tr',
    trim: true,
  }).slice(0, 200) || 'yazi';

/**
 * Verilen title için eşsiz slug üret. Model üzerinde paranoid:true olsa bile
 * silinenleri de kontrol ederiz (unique index aktif).
 * @param {import('sequelize').ModelStatic} Model
 * @param {string} title
 * @param {number|null} ignoreId  — update sırasında kendi kaydını hariç tut
 */
const generateUniqueSlug = async (Model, title, ignoreId = null) => {
  const base = baseSlug(title);
  let candidate = base;
  for (let i = 2; i <= 10; i++) {
    const where = { slug: candidate };
    const exists = await Model.findOne({ where, paranoid: false });
    if (!exists || exists.id === ignoreId) return candidate;
    candidate = `${base}-${i}`;
  }
  // Fallback — shortid
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
};

module.exports = { baseSlug, generateUniqueSlug };
