import { useAppStore } from '@/store/useAppStore';

/** SUPER_ADMIN: seçili mekan; VENUE_ADMIN: kullanıcının venueId'si */
export function useEffectiveVenueId(): number | null {
  const user = useAppStore((s) => s.user);
  const selectedVenueId = useAppStore((s) => s.selectedVenueId);
  if (!user) return null;
  if (user.role === 'VENUE_ADMIN') return user.venueId ?? null;
  return selectedVenueId;
}
