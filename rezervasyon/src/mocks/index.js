const salons = [
  { id: 1, name: "A Salonu", capacity: 150, isActive: true },
  { id: 2, name: "B Salonu", capacity: 80, isActive: true },
  { id: 3, name: "Bahçe", capacity: 200, isActive: true },
];

const reservations = [
  { id: 1, customerName: "Ahmet Yılmaz", customerPhone: "0555 001 00 01", startDate: "2024-06-15", endDate: "2024-06-15", salonId: 1, salon: salons[0], status: "confirmed", totalAmount: 5000, paidAmount: 2500, note: "50 kişilik düğün yemeği" },
  { id: 2, customerName: "Fatma Kaya", customerPhone: "0555 002 00 02", startDate: "2024-06-20", endDate: "2024-06-20", salonId: 2, salon: salons[1], status: "pending", totalAmount: 3000, paidAmount: 0, note: "Nişan töreni" },
  { id: 3, customerName: "Mehmet Demir", customerPhone: "0555 003 00 03", startDate: "2024-07-01", endDate: "2024-07-01", salonId: 1, salon: salons[0], status: "confirmed", totalAmount: 8000, paidAmount: 8000, note: "Şirket toplantısı" },
];

const menuCategories = [
  { id: 1, name: "Soğuk Mezeler" },
  { id: 2, name: "Sıcak Yemekler" },
  { id: 3, name: "İçecekler" },
];

const menus = [
  { id: 1, name: "Ekonomik Paket", price: 150, categoryId: 1 },
  { id: 2, name: "Standart Paket", price: 250, categoryId: 2 },
  { id: 3, name: "Lüks Paket", price: 400, categoryId: 2 },
];

const users = [
  { id: 1, name: "Admin Kullanıcı", email: "admin@example.com", role: "admin", isActive: true, salons: [salons[0], salons[1]] },
  { id: 2, name: "Satış Temsilcisi", email: "satis@example.com", role: "user", isActive: true, salons: [salons[0]] },
];

const stats = {
  totalReservations: 42,
  confirmedReservations: 35,
  pendingReservations: 5,
  cancelledReservations: 2,
  totalRevenue: 125000,
  collectedRevenue: 98000,
};

function resolveMock(method, url, params) {
  const m = method?.toLowerCase() ?? "get";

  if (url?.includes("/auth/login")) return { token: "mock-token-demo", user: users[0] };
  if (url?.includes("/auth/refresh")) return { token: "mock-token-demo-refreshed" };

  if (url?.includes("/users/me")) return users[0];
  if (url?.includes("/users/stats")) return { total: 2, active: 2 };
  if (url?.includes("/users/assign")) return { success: true };
  if (url?.match(/\/users\/\d+\/permissions/)) return { success: true };
  if (url?.match(/\/users\/\d+/)) return users.find(u => url.includes(u.id)) ?? users[0];
  if (url?.includes("/users")) return { data: users, total: users.length };

  if (url?.includes("/salons")) return salons;

  if (url?.includes("/menus/categories")) return menuCategories;
  if (url?.match(/\/menus\/\d+/)) return menus[0];
  if (url?.includes("/menus")) return menus;

  if (url?.includes("/reservations/availability")) return { available: true, slots: [] };
  if (url?.match(/\/reservations\/pdf/)) return null;
  if (url?.match(/\/reservations\/excel/)) return null;
  if (url?.match(/\/reservations\/\d+\/payments/)) return [];
  if (url?.match(/\/reservations\/\d+/)) return reservations.find(r => url.includes(r.id)) ?? reservations[0];
  if (url?.includes("/reservations")) return { data: reservations, total: reservations.length, pages: 1 };

  if (url?.match(/\/dashboard\/stats/)) return stats;
  if (url?.match(/\/dashboard\/paymentStats/)) return { totalPayments: 98000, cash: 50000, transfer: 48000 };
  if (url?.includes("/dashboard/get-my-logs")) return { logs: [] };
  if (url?.includes("/dashboard/get-logs")) return { logs: [] };

  if (url?.match(/\/saved-customers\/\d+/)) return { id: 1, name: "Ahmet Yılmaz", phone: "0555 001 00 01" };
  if (url?.includes("/saved-customers")) return [{ id: 1, name: "Ahmet Yılmaz", phone: "0555 001 00 01" }];

  if (url?.includes("/reservations/payment") || url?.includes("/payment")) return { success: true };

  return { success: true, message: `[MOCK] Endpoint: ${url}` };
}

export function setupMockAdapter(apiInstance) {
  apiInstance.defaults.adapter = async (config) => {
    const data = resolveMock(config.method, config.url, config.params);
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
}
