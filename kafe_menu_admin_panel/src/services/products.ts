import { api } from '@/lib/api';
import type { ApiEnvelope, Product, ProductFormValues } from '@/types/api';

export async function listProducts(venueId: number): Promise<Product[]> {
  const { data } = await api.get<ApiEnvelope<Product[]>>('/admin/products', {
    params: { venueId },
  });
  return data.data;
}

/** Mevcut ürünü (görsel değiştirmeden) güncelleme gövdesi için */
export function productToFormValues(p: Product): ProductFormValues {
  return {
    categoryId: p.categoryId,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    isAvailable: p.isAvailable,
    sortOrder: p.sortOrder,
  };
}

export function buildProductFormData(values: ProductFormValues): FormData {
  const fd = new FormData();
  fd.append('categoryId', String(values.categoryId));
  fd.append('name', values.name);
  fd.append('description', values.description ?? '');
  fd.append('price', String(values.price));
  fd.append('isAvailable', String(values.isAvailable));
  fd.append('sortOrder', String(values.sortOrder));
  if (values.image instanceof File) {
    fd.append('image', values.image);
  }
  return fd;
}

export async function createProduct(
  venueId: number,
  values: ProductFormValues,
): Promise<Product> {
  const fd = buildProductFormData(values);
  const { data } = await api.post<ApiEnvelope<Product>>('/admin/products', fd, {
    params: { venueId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateProduct(
  id: number,
  values: ProductFormValues,
): Promise<Product> {
  const fd = buildProductFormData(values);
  const { data } = await api.put<ApiEnvelope<Product>>(`/admin/products/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}
