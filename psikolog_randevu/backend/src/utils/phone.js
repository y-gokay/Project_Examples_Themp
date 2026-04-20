'use strict';

/** Türk telefon numarasını standart formata çevirir: 05XXXXXXXXX */
const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) return '0' + digits.slice(2);
  if (digits.startsWith('5') && digits.length === 10) return '0' + digits;
  if (digits.startsWith('05') && digits.length === 11) return digits;
  return digits;
};

module.exports = { normalizePhone };
