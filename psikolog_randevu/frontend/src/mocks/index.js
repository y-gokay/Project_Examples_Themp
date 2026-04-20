import axios from 'axios';

const psychologists = [
  { id: 1, name: "Dr. Zeynep Arslan", email: "zeynep@pdr.com", specialization: "Bilişsel Davranışçı Terapi", bio: "10 yıllık deneyimli psikolog.", avatarUrl: null, isAvailable: true, availabilitySlots: [] },
  { id: 2, name: "Dr. Ali Çelik", email: "ali@pdr.com", specialization: "Aile ve Çift Terapisi", bio: "5 yıllık deneyimli aile terapisti.", avatarUrl: null, isAvailable: true, availabilitySlots: [] },
];

const appointments = [
  { id: 1, psychologist: psychologists[0], user: { id: 2, name: "Ahmet Yılmaz" }, date: "2024-06-20", time: "10:00", duration: 50, status: "confirmed", notes: null },
  { id: 2, psychologist: psychologists[1], user: { id: 2, name: "Ahmet Yılmaz" }, date: "2024-07-05", time: "14:00", duration: 50, status: "pending", notes: null },
];

const blogPosts = [
  { id: 1, slug: "stres-yonetimi", title: "Stres Yönetimi Teknikleri", excerpt: "Günlük hayatta stresi azaltmanın etkili yolları.", author: psychologists[0], publishedAt: "2024-05-01T10:00:00Z", isPublished: true },
  { id: 2, slug: "kaygı-ile-baskasma", title: "Kaygı ile Başa Çıkma", excerpt: "Kaygı bozukluklarında pratik yaklaşımlar.", author: psychologists[1], publishedAt: "2024-05-15T10:00:00Z", isPublished: true },
];

function resolveMock(method, url) {
  if (url?.includes('/auth/login')) return { data: { token: "mock-token-demo", refreshToken: "mock-refresh-demo", user: { id: 2, name: "Ahmet Yılmaz", email: "ahmet@test.com", role: "user" } } };
  if (url?.includes('/auth/register')) return { data: { message: "Kayıt başarılı." } };
  if (url?.includes('/auth/logout')) return { data: { success: true } };
  if (url?.includes('/auth/me') || url?.includes('/auth/change-password') || url?.includes('/auth/forgot') || url?.includes('/auth/reset')) return { data: { success: true } };
  if (url?.includes('/auth/refresh')) return { data: { token: "mock-token-refreshed" } };

  if (url?.match(/\/appointments\/\d+\/cancel/)) return { data: { success: true } };
  if (url?.match(/\/appointments\/\d+\/decision/)) return { data: { success: true } };
  if (url?.includes('/appointments/psychologist')) return { data: appointments };
  if (url?.includes('/appointments/pending')) return { data: appointments.filter(a => a.status === "pending") };
  if (url?.includes('/appointments/history')) return { data: [] };
  if (url?.includes('/appointments/me')) return { data: appointments };
  if (url?.includes('/appointments')) return { data: { appointment: appointments[0] } };

  if (url?.includes('/psychologists/me')) return { data: psychologists[0] };
  if (url?.match(/\/psychologists\/\d+/)) return { data: psychologists[0] };
  if (url?.includes('/psychologists')) return { data: psychologists };

  if (url?.includes('/blog/me')) return { data: blogPosts };
  if (url?.match(/\/blog\/[a-z-]+/)) return { data: blogPosts[0] };
  if (url?.includes('/blog')) return { data: { posts: blogPosts, total: blogPosts.length } };

  if (url?.includes('/notes/patients')) return { data: [] };
  if (url?.includes('/notes')) return { data: [] };

  if (url?.includes('/keys/me')) return { data: null };
  if (url?.includes('/keys/psychologist')) return { data: null };
  if (url?.includes('/keys/setup')) return { data: { success: true } };

  return { data: { success: true } };
}

export function setupMockAdapter(apiInstance) {
  apiInstance.defaults.adapter = async (config) => {
    const data = resolveMock(config.method, config.url);
    return { data: data.data, status: 200, statusText: 'OK', headers: {}, config };
  };
}
