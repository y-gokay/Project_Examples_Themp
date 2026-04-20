'use strict';

const SLOT_DURATION_MINUTES = 30;

/**
 * Verilen çalışma saatleri aralığını 30'ar dakikalık slotlara böler.
 * @param {string} startTime - "HH:MM" formatında başlangıç saati
 * @param {string} endTime   - "HH:MM" formatında bitiş saati
 * @returns {Array<{startTime: string, endTime: string}>}
 */
const generateSlots = (startTime, endTime) => {
  const slots = [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + SLOT_DURATION_MINUTES <= end) {
    const slotStart = formatTime(current);
    const slotEnd = formatTime(current + SLOT_DURATION_MINUTES);
    slots.push({ startTime: slotStart, endTime: slotEnd });
    current += SLOT_DURATION_MINUTES;
  }

  return slots;
};

const formatTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Tüm slotlardan dolu olanları çıkararak boş slotları döndürür.
 * @param {Array} allSlots - generateSlots çıktısı
 * @param {Array} bookedAppointments - Aktif Appointment kayıtları
 * @returns {Array}
 */
/**
 * Seçilen saat bloklarından (8–9, 9–10, …) 30 dk slot listesi üretir.
 * @param {number[]} selectedHours - 8 ile 16 arası tam sayılar
 */
const buildSlotsFromSelectedHours = (selectedHours) => {
  if (!Array.isArray(selectedHours) || selectedHours.length === 0) return [];
  const sorted = [...new Set(selectedHours)]
    .filter((h) => Number.isInteger(h) && h >= 8 && h <= 16)
    .sort((a, b) => a - b);
  const slots = [];
  for (const h of sorted) {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push(...generateSlots(start, end));
  }
  return slots;
};

const filterAvailableSlots = (allSlots, bookedAppointments) => {
  const bookedTimes = new Set(
    bookedAppointments.map((a) => a.startTime.substring(0, 5))
  );

  return allSlots.filter((slot) => !bookedTimes.has(slot.startTime));
};

module.exports = { generateSlots, filterAvailableSlots, buildSlotsFromSelectedHours };
