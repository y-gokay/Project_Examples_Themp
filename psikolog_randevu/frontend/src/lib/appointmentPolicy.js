/** Backend `APPOINTMENT_CANCEL_MIN_HOURS` ile aynı tutulmalı (varsayılan 2). */
export const CANCEL_MIN_HOURS_BEFORE = 2;

/**
 * Vatandaş iptali: görüşme saatinden en az N saat önce mümkün mü?
 * @param {{ date: string, startTime: string }} apt
 */
export function canCitizenCancelAppointment(apt) {
  if (!apt?.date || !apt?.startTime) return false;
  const t = String(apt.startTime).slice(0, 5);
  const startMs = new Date(`${apt.date}T${t}:00+03:00`).getTime();
  if (!Number.isFinite(startMs)) return false;
  const deadlineMs = startMs - CANCEL_MIN_HOURS_BEFORE * 60 * 60 * 1000;
  return Date.now() <= deadlineMs;
}
