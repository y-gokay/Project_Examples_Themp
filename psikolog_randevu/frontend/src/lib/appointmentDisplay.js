import { STATUS_LABEL, STATUS_TONE } from './appointmentStatus';

/** Bitiş anı (tarih + bitiş saati), yerel gün ile uyumlu. */
export const getSessionEnd = (apt) => {
  const t = apt.endTime?.length >= 5 ? apt.endTime.substring(0, 5) : apt.endTime;
  return new Date(`${apt.date}T${t}:00`);
};

/** Onaylı ve süresi geçmiş randevular için sanal "tamamlandı" durumu (DB'de ayrı kolon yok). */
export const isCompletedVirtual = (apt) =>
  apt.status === 'approved' && getSessionEnd(apt) < new Date();

export const resolveAppointmentDisplay = (apt) => {
  if (isCompletedVirtual(apt)) {
    return { label: STATUS_LABEL.completed, tone: STATUS_TONE.completed };
  }
  const label = STATUS_LABEL[apt.status] || apt.status;
  const tone = STATUS_TONE[apt.status] || 'neutral';
  return { label, tone };
};
