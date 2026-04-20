import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const venues = [
  {
    id: 1,
    name: 'Örnek Merkez Kafe',
    slug: 'ornek-merkez-kafe',
    description: 'Demo lokasyon — ana bina',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    _count: { categories: 3, admins: 2 },
  },
  {
    id: 2,
    name: 'Örnek Bahçe Kafe',
    slug: 'ornek-bahce-kafe',
    description: 'Demo lokasyon — bahçe',
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    _count: { categories: 2, admins: 1 },
  },
];

const categories = [
  {
    id: 1,
    name: 'Sıcak İçecekler',
    sortOrder: 1,
    venueId: 1,
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
    _count: { products: 5 },
  },
  {
    id: 2,
    name: 'Soğuk İçecekler',
    sortOrder: 2,
    venueId: 1,
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
    _count: { products: 4 },
  },
  {
    id: 3,
    name: 'Atıştırmalıklar',
    sortOrder: 3,
    venueId: 1,
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
    _count: { products: 3 },
  },
];

const products = [
  {
    id: 1,
    name: 'Türk Kahvesi',
    description: 'Demo ürün',
    price: 35,
    imageUrl: null,
    isAvailable: true,
    sortOrder: 1,
    categoryId: 1,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 2,
    name: 'Americano',
    description: 'Demo ürün',
    price: 45,
    imageUrl: null,
    isAvailable: true,
    sortOrder: 2,
    categoryId: 1,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 3,
    name: 'Limonata',
    description: 'Demo ürün',
    price: 40,
    imageUrl: null,
    isAvailable: true,
    sortOrder: 1,
    categoryId: 2,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
];

const adminUsers = [
  {
    id: 1,
    name: 'Demo Yönetici',
    email: 'admin@example.com',
    role: 'SUPER_ADMIN' as const,
    isActive: true,
    venueId: null,
    venue: null,
  },
  {
    id: 2,
    name: 'Örnek Kafe Yetkilisi',
    email: 'kafe@example.com',
    role: 'VENUE_ADMIN' as const,
    isActive: true,
    venueId: 1,
    venue: { name: 'Örnek Merkez Kafe', slug: 'ornek-merkez-kafe' },
  },
];

function resolveMock(method: string, url: string, params?: Record<string, unknown>) {
  const m = method.toLowerCase();
  const path = url.split('?')[0] ?? url;

  if (path.includes('/auth/login')) {
    return {
      token: 'mock-jwt-token-demo',
      user: {
        id: 1,
        name: 'Demo Yönetici',
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
        venueId: null,
      },
    };
  }
  if (path.includes('/auth/me')) {
    return { data: { id: 1, name: 'Demo Yönetici', email: 'admin@example.com', role: 'SUPER_ADMIN', venueId: null } };
  }

  if (path.match(/\/admin\/venues\/\d+/)) {
    const id = Number(path.split('/').pop());
    if (m === 'get') return { data: venues.find((v) => v.id === id) ?? venues[0] };
    return { data: venues[0] };
  }
  if (path.includes('/admin/venues')) return { data: venues };

  if (path.match(/\/admin\/categories\/\d+/)) {
    if (m === 'delete') return { data: null };
    return { data: categories[0] };
  }
  if (path.includes('/admin/categories')) {
    const venueId = Number(params?.venueId ?? 1);
    return { data: categories.filter((c) => c.venueId === venueId) };
  }

  if (path.match(/\/admin\/products\/\d+/)) {
    if (m === 'delete') return { data: null };
    return { data: products[0] };
  }
  if (path.includes('/admin/products')) {
    const venueId = Number(params?.venueId ?? 1);
    const catIds = categories.filter((c) => c.venueId === venueId).map((c) => c.id);
    return { data: products.filter((p) => catIds.includes(p.categoryId)) };
  }

  if (path.includes('/admin/admin-users')) return { data: adminUsers };

  if (m === 'delete') return { data: null };

  return { data: null, message: `[MOCK] Endpoint tanımlı değil: ${url}` };
}

export function setupMockAdapter(apiInstance: AxiosInstance) {
  apiInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const data = resolveMock(
      config.method ?? 'get',
      config.url ?? '',
      config.params as Record<string, unknown>,
    );
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}
