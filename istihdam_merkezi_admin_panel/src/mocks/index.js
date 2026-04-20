const users = [
  { id: 1, firstName: "Ahmet", lastName: "Yılmaz", email: "ahmet@example.com", phone: "0555 001 00 01", isActive: true, isEmailVerified: true, createdAt: "2024-01-15T10:00:00Z", professions: [{ name: "Yazılım Geliştirici" }] },
  { id: 2, firstName: "Fatma", lastName: "Kaya", email: "fatma@example.com", phone: "0555 002 00 02", isActive: true, isEmailVerified: true, createdAt: "2024-02-10T10:00:00Z", professions: [{ name: "Tasarımcı" }] },
  { id: 3, firstName: "Mehmet", lastName: "Demir", email: "mehmet@example.com", phone: "0555 003 00 03", isActive: false, isEmailVerified: false, createdAt: "2024-03-01T10:00:00Z", professions: [] },
];

const businesses = [
  { id: 1, companyName: "Demo Teknoloji A.Ş.", email: "demo@tech.com", phone: "0212 001 00 01", sector: "Bilişim", isActive: true, isApproved: true, createdAt: "2024-01-20T10:00:00Z" },
  { id: 2, companyName: "Örnek Finans Ltd.", email: "ornek@finans.com", phone: "0312 002 00 02", sector: "Finans", isActive: true, isApproved: false, createdAt: "2024-02-15T10:00:00Z" },
];

const jobPosts = [
  { id: 1, title: "Frontend Geliştirici", company: businesses[0], isActive: true, applicantCount: 12, createdAt: "2024-05-01T10:00:00Z" },
  { id: 2, title: "Backend Geliştirici", company: businesses[0], isActive: true, applicantCount: 8, createdAt: "2024-05-05T10:00:00Z" },
  { id: 3, title: "İK Uzmanı", company: businesses[1], isActive: false, applicantCount: 5, createdAt: "2024-04-20T10:00:00Z" },
];

const dashboardStats = {
  basic: { totalUsers: 342, totalBusinesses: 28, totalJobPosts: 156, totalApplications: 1204 },
  users: { active: 315, inactive: 27, verified: 290, unverified: 52, newThisMonth: 18 },
  jobPosts: { active: 89, inactive: 67, totalApplications: 1204, avgApplicationsPerPost: 7.7 },
};

function resolveMock(endpoint, method) {
  const m = (method || "GET").toUpperCase();

  if (endpoint?.includes("/auth/login")) return { success: true, token: "mock-admin-token-demo", admin: { id: 1, name: "Admin", email: "admin@example.com" } };
  if (endpoint?.includes("/auth/logout")) return { success: true };

  if (endpoint?.includes("/admin/dashboard/stats/users")) return dashboardStats.users;
  if (endpoint?.includes("/admin/dashboard/stats/job-posts")) return dashboardStats.jobPosts;
  if (endpoint?.includes("/admin/dashboard/stats")) return dashboardStats.basic;

  if (endpoint?.match(/\/admin\/users\/\d+\/applications/)) return { data: [], total: 0, page: 1, limit: 10 };
  if (endpoint?.match(/\/admin\/users\/\d+\/job-recommendations/)) return { data: jobPosts.slice(0, 2) };
  if (endpoint?.match(/\/admin\/users\/\d+\/send-email/)) return { success: true };
  if (endpoint?.match(/\/admin\/users\/\d+\/restore/)) return { success: true };
  if (endpoint?.match(/\/admin\/users\/\d+/)) {
    const id = Number(endpoint.split('/').filter(Boolean).pop());
    return { data: users.find(u => u.id === id) ?? users[0] };
  }
  if (endpoint?.includes("/admin/users")) return { data: users, total: users.length, page: 1, limit: 20 };

  if (endpoint?.match(/\/admin\/businesses\/\d+\/approve/)) return { success: true };
  if (endpoint?.match(/\/admin\/businesses\/\d+\/reject/)) return { success: true };
  if (endpoint?.match(/\/admin\/businesses\/\d+\/restore/)) return { success: true };
  if (endpoint?.match(/\/admin\/businesses\/\d+/)) return { data: businesses[0] };
  if (endpoint?.includes("/admin/businesses")) return { data: businesses, total: businesses.length };

  if (endpoint?.includes("/admin/job-posts")) return { data: jobPosts, total: jobPosts.length };

  if (endpoint?.includes("/admin/change-requests")) return { data: [], total: 0 };
  if (endpoint?.includes("/admin/contacts")) return { data: [], total: 0 };
  if (endpoint?.includes("/admin/faqs")) return { data: [], total: 0 };
  if (endpoint?.includes("/admin/lookups") || endpoint?.includes("/lookups")) return { data: [] };

  return { success: true, data: null };
}

export function getMockApiRequest() {
  return async (endpoint, options = {}) => {
    const method = options.method || "GET";
    return resolveMock(endpoint, method);
  };
}
