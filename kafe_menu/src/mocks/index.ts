import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const venues = [
  { id: 1, name: "Merkez Kafe", slug: "merkez-kafe", description: "Ana bina birinci kat kafe", isActive: true, createdAt: "2024-01-10T10:00:00Z", updatedAt: "2024-01-10T10:00:00Z", _count: { categories: 3, admins: 2 } },
  { id: 2, name: "Bahçe Kafe", slug: "bahce-kafe", description: "Açık hava bahçe kafe", isActive: true, createdAt: "2024-02-01T10:00:00Z", updatedAt: "2024-02-01T10:00:00Z", _count: { categories: 2, admins: 1 } },
];

const categories = [
  { id: 1, name: "Sıcak İçecekler", sortOrder: 1, venueId: 1, createdAt: "2024-01-11T10:00:00Z", updatedAt: "2024-01-11T10:00:00Z", _count: { products: 5 } },
  { id: 2, name: "Soğuk İçecekler", sortOrder: 2, venueId: 1, createdAt: "2024-01-11T10:00:00Z", updatedAt: "2024-01-11T10:00:00Z", _count: { products: 4 } },
  { id: 3, name: "Atıştırmalıklar", sortOrder: 3, venueId: 1, createdAt: "2024-01-11T10:00:00Z", updatedAt: "2024-01-11T10:00:00Z", _count: { products: 3 } },
];

const products = [
  { id: 1, name: "Türk Kahvesi", description: "Geleneksel Türk kahvesi", price: 35, imageUrl: null, isAvailable: true, sortOrder: 1, categoryId: 1, createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-12T10:00:00Z" },
  { id: 2, name: "Americano", description: "Espresso ve sıcak su", price: 45, imageUrl: null, isAvailable: true, sortOrder: 2, categoryId: 1, createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-12T10:00:00Z" },
  { id: 3, name: "Latte", description: "Espresso ve buharlatılmış süt", price: 55, imageUrl: null, isAvailable: true, sortOrder: 3, categoryId: 1, createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-12T10:00:00Z" },
  { id: 4, name: "Limonata", description: "Taze sıkılmış limon", price: 40, imageUrl: null, isAvailable: true, sortOrder: 1, categoryId: 2, createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-12T10:00:00Z" },
  { id: 5, name: "Ice Tea", description: "Soğuk çay", price: 35, imageUrl: null, isAvailable: true, sortOrder: 2, categoryId: 2, createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-12T10:00:00Z" },
  { id: 6, name: "Kek", description: "Günlük taze kek", price: 30, imageUrl: null, isAvailable: true, sortOrder: 1, categoryId: 3, createdAt: "2024-01-12T10:00:00Z", updatedAt: "2024-01-12T10:00:00Z" },
];

const adminUsers = [
  { id: 1, name: "Demo Admin", email: "admin@example.com", role: "SUPER_ADMIN" as const, isActive: true, venueId: null, venue: null },
  { id: 2, name: "Kafe Yöneticisi", email: "kafe@example.com", role: "VENUE_ADMIN" as const, isActive: true, venueId: 1, venue: { name: "Merkez Kafe", slug: "merkez-kafe" } },
];

function resolveMock(method: string, url: string, params?: Record<string, unknown>) {
  const m = method.toLowerCase();

  if (url.includes('/auth/login')) return { token: "mock-jwt-token-demo", user: { id: 1, name: "Demo Admin", email: "admin@example.com", role: "SUPER_ADMIN", venueId: null } };
  if (url.includes('/auth/me')) return { data: { id: 1, name: "Demo Admin", email: "admin@example.com", role: "SUPER_ADMIN", venueId: null } };

  if (url.match(/\/admin\/venues\/\d+/)) {
    const id = Number(url.split('/').pop());
    if (m === 'get') return { data: venues.find(v => v.id === id) ?? venues[0] };
    return { data: venues[0] };
  }
  if (url.includes('/admin/venues')) return { data: venues };

  if (url.match(/\/admin\/categories\/\d+/)) return { data: categories[0] };
  if (url.includes('/admin/categories')) {
    const venueId = Number(params?.venueId ?? 1);
    return { data: categories.filter(c => c.venueId === venueId) };
  }

  if (url.match(/\/admin\/products\/\d+/)) return { data: products[0] };
  if (url.includes('/admin/products')) {
    const venueId = Number(params?.venueId ?? 1);
    const catIds = categories.filter(c => c.venueId === venueId).map(c => c.id);
    return { data: products.filter(p => catIds.includes(p.categoryId)) };
  }

  if (url.includes('/admin/users')) return { data: adminUsers };

  return { data: null, message: `[MOCK] Endpoint tanımlı değil: ${url}` };
}

export function setupMockAdapter(apiInstance: AxiosInstance) {
  apiInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const data = resolveMock(config.method ?? 'get', config.url ?? '', config.params as Record<string, unknown>);
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}
