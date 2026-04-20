import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listVenues } from '@/services/venues';
import { useAppStore } from '@/store/useAppStore';

export function VenueSwitcher() {
  const user = useAppStore((s) => s.user);
  const selectedVenueId = useAppStore((s) => s.selectedVenueId);
  const setSelectedVenueId = useAppStore((s) => s.setSelectedVenueId);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: listVenues,
    enabled: isSuperAdmin,
  });

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (!selectedVenueId && venues && venues.length > 0) {
      setSelectedVenueId(venues[0].id);
    }
  }, [isSuperAdmin, selectedVenueId, venues, setSelectedVenueId]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm">
        <span className="text-muted-foreground">Mekan:</span>
        <span className="font-medium text-foreground">
          {user?.venueId ? `#${user.venueId}` : '—'}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={selectedVenueId ? String(selectedVenueId) : undefined}
      onValueChange={(val) => setSelectedVenueId(Number(val))}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Mekan seçin" />
      </SelectTrigger>
      <SelectContent>
        {venues?.map((v) => (
          <SelectItem key={v.id} value={String(v.id)}>
            {v.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
