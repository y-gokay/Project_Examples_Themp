const MOCK_DATA = {
  "/admin/get-announcements": {
    success: 1,
    data: {
      announcements: [
        {
          _id: "mock-ann-1",
          title: "Yaz Dönemi Etkinlik Programı Yayınlandı",
          content:
            "Haziran-Ağustos arası düzenlenecek kurs ve etkinliklerin programı yayınlanmıştır. Kayıtlarınız için lütfen merkezi ziyaret ediniz.",
          createdAt: "2024-06-01T08:00:00Z",
          updatedAt: "2024-06-01T08:00:00Z",
        },
        {
          _id: "mock-ann-2",
          title: "Kütüphane Çalışma Saatleri Değişti",
          content:
            "Kütüphanemiz artık hafta içi 08:00-20:00, hafta sonu 09:00-17:00 saatleri arasında hizmet verecektir.",
          createdAt: "2024-05-20T10:00:00Z",
          updatedAt: "2024-05-20T10:00:00Z",
        },
        {
          _id: "mock-ann-3",
          title: "Satranç Turnuvası Kayıtları Başladı",
          content:
            "Gençlik Merkezi bünyesinde düzenlenecek satranç turnuvası için kayıtlar başlamıştır. Son kayıt tarihi 15 Haziran'dır.",
          createdAt: "2024-05-15T09:00:00Z",
          updatedAt: "2024-05-15T09:00:00Z",
        },
      ],
    },
  },

  "/user/get-my-details": {
    success: 1,
    data: {
      user: {
        _id: "mock-user-1",
        name: "Ahmet",
        surname: "Yılmaz",
        email: "demo@example.com",
        phone: "0555 000 00 01",
        tckn: "12345678901",
        birthDate: "2000-01-15",
        membershipDate: "2023-09-01",
        notifications: [
          {
            _id: "mock-notif-1",
            message: "Ödünç aldığınız 'Şeker Portakalı' kitabı 3 gün içinde teslim edilmesi gerekiyor.",
            seen: false,
            createdAt: "2024-06-05T10:00:00Z",
          },
          {
            _id: "mock-notif-2",
            message: "Satranç turnuvasına kaydınız başarıyla alınmıştır.",
            seen: true,
            createdAt: "2024-05-16T11:00:00Z",
          },
        ],
      },
    },
  },

  "/user/get-recent-books": {
    success: 1,
    data: {
      books: [
        {
          _id: "mock-book-1",
          name: "Şeker Portakalı",
          author: "José Mauro de Vasconcelos",
          isbn: "9789750719387",
          borrowDate: "2024-05-25T00:00:00Z",
          dueDate: "2024-06-08T00:00:00Z",
          returned: false,
        },
        {
          _id: "mock-book-2",
          name: "İnce Memed",
          author: "Yaşar Kemal",
          isbn: "9789750802867",
          borrowDate: "2024-04-10T00:00:00Z",
          dueDate: "2024-04-24T00:00:00Z",
          returned: true,
        },
        {
          _id: "mock-book-3",
          name: "Tutunamayanlar",
          author: "Oğuz Atay",
          isbn: "9789750512100",
          borrowDate: "2024-03-01T00:00:00Z",
          dueDate: "2024-03-15T00:00:00Z",
          returned: true,
        },
      ],
    },
  },

  "/user/get-books": {
    success: 1,
    data: {
      totalPages: 3,
      books: [
        { _id: "mock-b-1", name: "Şeker Portakalı", author: "José Mauro de Vasconcelos", isbn: "9789750719387", available: true },
        { _id: "mock-b-2", name: "İnce Memed", author: "Yaşar Kemal", isbn: "9789750802867", available: true },
        { _id: "mock-b-3", name: "Tutunamayanlar", author: "Oğuz Atay", isbn: "9789750512100", available: false },
        { _id: "mock-b-4", name: "Saatleri Ayarlama Enstitüsü", author: "Ahmet Hamdi Tanpınar", isbn: "9789750519017", available: true },
        { _id: "mock-b-5", name: "Huzur", author: "Ahmet Hamdi Tanpınar", isbn: "9789750519023", available: true },
        { _id: "mock-b-6", name: "Kürk Mantolu Madonna", author: "Sabahattin Ali", isbn: "9789750719394", available: true },
      ],
    },
  },

  "/user/saw-all-notifs": { success: 1 },
  "/user/change-password": { success: 1 },
  "/admin/login": { success: 1, data: { token: "mock-admin-token-demo" } },
  "/user/login": { success: 1, data: { token: "mock-user-token-demo" } },
  "/admin/register": { success: 1 },
  "/user/register": { success: 1 },
};

export function getMockResponse(url) {
  for (const pattern of Object.keys(MOCK_DATA)) {
    if (url.includes(pattern)) {
      return MOCK_DATA[pattern];
    }
  }
  return { success: 0, message: `[MOCK] Endpoint tanımlı değil: ${url}` };
}
