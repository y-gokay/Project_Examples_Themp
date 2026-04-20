const jobs = [
  { id: 1, title: "Frontend Geliştirici", company: "Örnek A.Ş.", location: "İstanbul", workingMethod: "Uzaktan", salary: "25.000 - 35.000 TL", sector: "Bilişim", isActive: true, createdAt: "2024-05-01T10:00:00Z", description: "React ve TypeScript bilgisi olan adaylar aranıyor.", isForDisabled: false },
  { id: 2, title: "Backend Geliştirici", company: "Teknoloji Ltd.", location: "Ankara", workingMethod: "Hibrit", salary: "30.000 - 45.000 TL", sector: "Yazılım", isActive: true, createdAt: "2024-05-05T10:00:00Z", description: "Node.js ve PostgreSQL deneyimi gerekmektedir.", isForDisabled: false },
  { id: 3, title: "İK Uzmanı", company: "Örnek Holding", location: "İzmir", workingMethod: "Yüz yüze", salary: "20.000 - 28.000 TL", sector: "İnsan Kaynakları", isActive: true, createdAt: "2024-05-10T10:00:00Z", description: "Deneyimli İK uzmanı aranıyor.", isForDisabled: false },
  { id: 4, title: "Muhasebe Uzmanı", company: "Finans A.Ş.", location: "Bursa", workingMethod: "Yüz yüze", salary: "18.000 - 25.000 TL", sector: "Finans", isActive: true, createdAt: "2024-05-12T10:00:00Z", description: "SMMM belgesi olan adaylar tercih edilir.", isForDisabled: false },
];

const userProfile = {
  id: 1,
  firstName: "Ahmet",
  lastName: "Yılmaz",
  email: "demo@example.com",
  phone: "0555 000 00 01",
  tcNo: "12345678901",
  birthDate: "1995-06-15",
  gender: "male",
  city: "İstanbul",
  district: "Kadıköy",
  description: "Yazılım geliştirme alanında deneyimli.",
  profilePicture: null,
  isEmailVerified: true,
  isPhoneVerified: true,
  professions: [{ id: 1, name: "Yazılım Geliştirici" }],
  sectors: [{ id: 1, name: "Bilişim" }],
};

const businessProfile = {
  id: 1,
  companyName: "Demo Şirketi A.Ş.",
  email: "demo-firma@example.com",
  phone: "0212 000 00 01",
  sector: "Bilişim",
  city: "İstanbul",
  address: "Örnek Mahallesi, Demo Caddesi No:1",
  description: "Demo şirket açıklaması.",
  taxNumber: "1234567890",
  isVerified: true,
};

const lookups = {
  professions: [{ id: 1, name: "Yazılım Geliştirici" }, { id: 2, name: "Tasarımcı" }, { id: 3, name: "Proje Yöneticisi" }],
  sectors: [{ id: 1, name: "Bilişim" }, { id: 2, name: "Finans" }, { id: 3, name: "Sağlık" }],
  workingMethods: [{ id: 1, name: "Uzaktan" }, { id: 2, name: "Hibrit" }, { id: 3, name: "Yüz yüze" }],
  districts: [{ id: 1, name: "Kadıköy" }, { id: 2, name: "Beşiktaş" }, { id: 3, name: "Çankaya" }],
};

const faqs = [
  { id: 1, question: "Nasıl iş başvurusu yapabilirim?", answer: "İlan sayfasına gidip 'Başvur' butonuna tıklayabilirsiniz." },
  { id: 2, question: "CV'mi nasıl güncellerim?", answer: "Profil sayfanızdan CV bölümünü düzenleyebilirsiniz." },
];

function resolveMock(endpoint, method) {
  const m = (method || "GET").toUpperCase();

  if (endpoint?.includes("/auth/login")) return { success: true, token: "mock-token-demo", userType: "user" };
  if (endpoint?.includes("/auth/register")) return { success: true, message: "Kayıt başarılı." };
  if (endpoint?.includes("/auth/logout")) return { success: true };
  if (endpoint?.includes("/auth/forgot-password") || endpoint?.includes("/auth/verify-reset") || endpoint?.includes("/auth/reset-password")) return { success: true, message: "İşlem başarılı." };

  if (endpoint?.includes("/jobs/favorites") && m === "GET") return { success: true, data: jobs.slice(0, 2) };
  if (endpoint?.includes("/jobs/favorites")) return { success: true };
  if (endpoint?.includes("/jobs/applications")) return { success: true, data: [], total: 0 };
  if (endpoint?.match(/\/jobs\/\d+\/apply/)) return { success: true, message: "Başvurunuz alındı." };
  if (endpoint?.match(/\/jobs\/\d+/)) return { success: true, data: jobs[0] };
  if (endpoint?.includes("/jobs")) return { success: true, data: jobs, total: jobs.length, pages: 1 };

  if (endpoint?.includes("/users/profile")) return { success: true, data: userProfile };
  if (endpoint?.includes("/users/statistics")) return { success: true, data: { applications: 3, favorites: 2, views: 12 } };
  if (endpoint?.includes("/users/job-recommendations")) return { success: true, data: jobs.slice(0, 2) };
  if (endpoint?.includes("/users/change-password")) return { success: true };
  if (endpoint?.includes("/users/email") || endpoint?.includes("/users/phone")) return { success: true };
  if (endpoint?.includes("/users/description") || endpoint?.includes("/users/set-") || endpoint?.includes("/users/profile-picture")) return { success: true, data: userProfile };

  if (endpoint?.includes("/businesses/profile")) return { success: true, data: businessProfile };
  if (endpoint?.includes("/businesses/job-posts")) return { success: true, data: jobs, total: jobs.length };
  if (endpoint?.includes("/businesses")) return { success: true, data: businessProfile };

  if (endpoint?.includes("/cvs")) return { success: true, data: [] };
  if (endpoint?.includes("/notifications")) return { success: true, data: [], unreadCount: 0 };
  if (endpoint?.includes("/faqs")) return { success: true, data: faqs };
  if (endpoint?.includes("/contacts")) return { success: true };
  if (endpoint?.includes("/appointments")) return { success: true, data: [] };
  if (endpoint?.includes("/saved-searches")) return { success: true, data: [] };

  if (endpoint?.includes("/professions") || endpoint?.includes("/sectors") || endpoint?.includes("/districts") || endpoint?.includes("/working-methods")) {
    const key = Object.keys(lookups).find(k => endpoint.includes(k.slice(0, -1)));
    return { success: true, data: key ? lookups[key] : [] };
  }

  return { success: true, data: null, message: `[MOCK] Endpoint: ${endpoint}` };
}

export function createMockApi() {
  const mockMethod = (method) => (endpoint) => Promise.resolve(resolveMock(endpoint, method));
  return {
    get: mockMethod("GET"),
    post: (endpoint) => Promise.resolve(resolveMock(endpoint, "POST")),
    put: (endpoint) => Promise.resolve(resolveMock(endpoint, "PUT")),
    patch: (endpoint) => Promise.resolve(resolveMock(endpoint, "PATCH")),
    delete: (endpoint) => Promise.resolve(resolveMock(endpoint, "DELETE")),
  };
}
