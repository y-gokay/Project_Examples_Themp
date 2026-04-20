'use strict';

/** Eski start/end TIME aralığından, 8–16 arası tam saat bloklarını üretir (8–9 … 16–17). */
const hoursFromLegacyRange = (startTime, endTime) => {
  if (!startTime || !endTime) return [];
  const st = String(startTime).substring(0, 5);
  const et = String(endTime).substring(0, 5);
  const [sh, sm] = st.split(':').map(Number);
  const [eh, em] = et.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const hours = [];
  for (let h = 8; h <= 16; h += 1) {
    const blockStart = h * 60;
    const blockEnd = (h + 1) * 60;
    if (blockEnd > startMin && blockStart < endMin) hours.push(h);
  }
  return hours;
};

module.exports = { hoursFromLegacyRange };
