import { api } from '@/lib/api';
import type { ApiEnvelope, Venue, VenueCreateInput, VenueUpdateInput } from '@/types/api';

export async function listVenues(): Promise<Venue[]> {
  const { data } = await api.get<ApiEnvelope<Venue[]>>('/admin/venues');
  return data.data;
}

export async function createVenue(input: VenueCreateInput): Promise<Venue> {
  const { data } = await api.post<ApiEnvelope<Venue>>('/admin/venues', input);
  return data.data;
}

export async function updateVenue(id: number, input: VenueUpdateInput): Promise<Venue> {
  const { data } = await api.put<ApiEnvelope<Venue>>(`/admin/venues/${id}`, input);
  return data.data;
}
