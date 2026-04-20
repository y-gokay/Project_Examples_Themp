import axios from "axios";

const MOCK_DATA = {
  "/admin/login": { success: 1, data: { token: "mock-admin-token-demo" } },
  "/admin/register": { success: 1 },

  "/admin/get-announcements": {
    success: 1,
    data: {
      totalPages: 2,
      announcements: [
        { id: "a1", title: "Yaz Dönemi Etkinlik Programı Yayınlandı", content: "Haziran-Ağustos arası kurslar için kayıtlar başlamıştır.", createdAt: "2024-06-01T08:00:00Z" },
        { id: "a2", title: "Kütüphane Çalışma Saatleri Değişti", content: "Hafta içi 08:00-20:00, hafta sonu 09:00-17:00.", createdAt: "2024-05-20T10:00:00Z" },
        { id: "a3", title: "Satranç Turnuvası Kayıtları", content: "Son kayıt tarihi 15 Haziran.", createdAt: "2024-05-15T09:00:00Z" },
      ],
    },
  },

  "/admin/get-books": {
    success: 1,
    data: {
      totalPages: 5,
      books: [
        { id: "b1", name: "Şeker Portakalı", author: "J.M. de Vasconcelos", isbn: "9789750719387", available: true, barcode: "1000001" },
        { id: "b2", name: "İnce Memed", author: "Yaşar Kemal", isbn: "9789750802867", available: true, barcode: "1000002" },
        { id: "b3", name: "Tutunamayanlar", author: "Oğuz Atay", isbn: "9789750512100", available: false, barcode: "1000003" },
        { id: "b4", name: "Saatleri Ayarlama Enstitüsü", author: "A.H. Tanpınar", isbn: "9789750519017", available: true, barcode: "1000004" },
        { id: "b5", name: "Kürk Mantolu Madonna", author: "Sabahattin Ali", isbn: "9789750719394", available: true, barcode: "1000005" },
      ],
    },
  },

  "/admin/get-book-details": {
    success: 1,
    data: { book: { id: "b1", name: "Şeker Portakalı", author: "J.M. de Vasconcelos", isbn: "9789750719387", available: true, barcode: "1000001", description: "Dünya çapında beğenilen klasik bir çocuk edebiyatı eseri." } },
  },

  "/admin/get-users": {
    success: 1,
    data: {
      totalPages: 3,
      users: [
        { id: "u1", name: "Ahmet", surname: "Yılmaz", email: "ahmet@example.com", tckn: "11111111111", phone: "0555 001 00 01", membershipDate: "2023-09-01" },
        { id: "u2", name: "Fatma", surname: "Kaya", email: "fatma@example.com", tckn: "22222222222", phone: "0555 002 00 02", membershipDate: "2023-10-15" },
        { id: "u3", name: "Mehmet", surname: "Demir", email: "mehmet@example.com", tckn: "33333333333", phone: "0555 003 00 03", membershipDate: "2024-01-20" },
      ],
    },
  },

  "/admin/get-user-details": {
    success: 1,
    data: { user: { id: "u1", name: "Ahmet", surname: "Yılmaz", email: "ahmet@example.com", tckn: "11111111111", phone: "0555 001 00 01" } },
  },

  "/admin/get-claims": {
    success: 1,
    data: {
      totalPages: 2,
      claims: [
        { id: "c1", bookName: "Şeker Portakalı", userName: "Ahmet Yılmaz", borrowDate: "2024-05-25", dueDate: "2024-06-08", returned: false },
        { id: "c2", bookName: "İnce Memed", userName: "Fatma Kaya", borrowDate: "2024-04-10", dueDate: "2024-04-24", returned: true },
      ],
    },
  },

  "/admin/get-book-by-barcode": {
    success: 1,
    data: { book: { id: "b1", name: "Şeker Portakalı", author: "J.M. de Vasconcelos", available: true, barcode: "1000001" } },
  },

  "/admin/get-user-by-tc": {
    success: 1,
    data: { user: { id: "u1", name: "Ahmet", surname: "Yılmaz", tckn: "11111111111" } },
  },

  "/admin/get-claimed-book-by-barcode": {
    success: 1,
    data: { claim: { id: "c1", bookName: "Şeker Portakalı", userName: "Ahmet Yılmaz" } },
  },

  "/admin/give-book": { success: 1 },
  "/admin/receive-book-with-bookID": { success: 1 },
  "/admin/create-book": { success: 1 },
  "/admin/update-book": { success: 1 },
  "/admin/delete-book": { success: 1 },
  "/admin/delete-announcement": { success: 1 },
  "/admin/create-announcement": { success: 1 },
  "/admin/change-user-password": { success: 1 },
  "/admin/upload": { success: 1, data: { imported: 10 } },
  "/admin/getBookQR": { success: 1, data: { url: "" } },
  "/admin/get-user-qr": { success: 1, data: { url: "" } },
  "/admin/register-user": { success: 1 },
};

function resolveMock(url) {
  for (const pattern of Object.keys(MOCK_DATA)) {
    if (url.includes(pattern)) return MOCK_DATA[pattern];
  }
  return { success: 0, message: `[MOCK] Endpoint tanımlı değil: ${url}` };
}

export function getMockResponse(url) {
  return resolveMock(url);
}

export function setupMockInterceptors() {
  axios.interceptors.request.use((config) => {
    config._isMock = true;
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.config?._isMock || !error.response) {
        const mockData = resolveMock(error.config?.url || "");
        return Promise.resolve({ data: mockData, status: 200 });
      }
      return Promise.reject(error);
    }
  );

  const originalRequest = axios.request.bind(axios);
  axios.defaults.adapter = async (config) => {
    const mockData = resolveMock(config.url || "");
    return { data: mockData, status: 200, headers: {}, config };
  };
}
