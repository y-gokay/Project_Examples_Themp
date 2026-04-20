export const SLOT_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "noon", label: "Noon" },
  { value: "evening", label: "Evening" },
];

export function canCreateReservation(currentDayReservations) {
  return (currentDayReservations?.length || 0) < 3;
}
