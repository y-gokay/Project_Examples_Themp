import { api } from '@/lib/api';
import type { AdminUser, AdminUserCreateInput, ApiEnvelope } from '@/types/api';

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<ApiEnvelope<AdminUser[]>>('/admin/admin-users');
  return data.data;
}

export async function createAdminUser(input: AdminUserCreateInput): Promise<AdminUser> {
  const { data } = await api.post<ApiEnvelope<AdminUser>>('/admin/admin-users', input);
  return data.data;
}
