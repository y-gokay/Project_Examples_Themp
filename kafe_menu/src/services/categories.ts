import { api } from '@/lib/api';
import type {
  ApiEnvelope,
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '@/types/api';

export async function listCategories(venueId: number): Promise<Category[]> {
  const { data } = await api.get<ApiEnvelope<Category[]>>('/admin/categories', {
    params: { venueId },
  });
  return data.data;
}

export async function createCategory(input: CategoryCreateInput): Promise<Category> {
  const { data } = await api.post<ApiEnvelope<Category>>('/admin/categories', input);
  return data.data;
}

export async function updateCategory(
  id: number,
  input: CategoryUpdateInput,
): Promise<Category> {
  const { data } = await api.put<ApiEnvelope<Category>>(`/admin/categories/${id}`, input);
  return data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}
