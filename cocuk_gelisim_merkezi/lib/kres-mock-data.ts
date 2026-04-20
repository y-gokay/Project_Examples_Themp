/**
 * Demo / public repo — anonim örnek API yükleri. Gerçek kişi veya kurum içermez.
 */

export const mockIncomeRanges = {
  items: [
    { id: 1, minIncome: 0, maxIncome: 15000, score: "10", order: 1 },
    { id: 2, minIncome: 15001, maxIncome: 30000, score: "20", order: 2 },
    { id: 3, minIncome: 30001, maxIncome: 50000, score: "30", order: 3 },
    { id: 4, minIncome: 50001, maxIncome: 999999999, score: "40", order: 4 },
  ],
};

export const mockKindergartenListItems = [
  {
    id: 1,
    name: "Örnek Çocuk Gelişim Merkezi — Kuzey",
    address: "Örnek Mah. Demo Cad. No:1, Örnek İlçe",
    phone: "0555 000 00 01",
    email: "ornek.kuzey@example.com",
    description:
      "Demo tanıtım metni. Gerçek bir kurumu temsil etmez. Oyun alanları ve eğitim atölyeleri ile desteklenen örnek bir merkez.",
    latitude: 41.2867,
    longitude: 36.33,
    photos: [
      { id: 1, photoPath: "/cgm1_1.jpg", order: 0 },
      { id: 2, photoPath: "/cgm1_2.jpg", order: 1 },
    ],
    ageGroups: [
      { id: 1, name: "3-4 yaş", minAge: 3, maxAge: 4, order: 1 },
      { id: 2, name: "4-5 yaş", minAge: 4, maxAge: 5, order: 2 },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Örnek Çocuk Gelişim Merkezi — Güney",
    address: "Deneme Sok. No:2, Örnek İlçe",
    phone: "0555 000 00 02",
    email: "ornek.guney@example.com",
    description:
      "İkinci demo merkez. Ziyaretçilerin arayüzü denemesi için üretilmiştir.",
    latitude: 41.27,
    longitude: 36.34,
    photos: [{ id: 3, photoPath: "/cgm2_1.jpg", order: 0 }],
    ageGroups: [
      { id: 1, name: "3-4 yaş", minAge: 3, maxAge: 4, order: 1 },
      { id: 3, name: "5-6 yaş", minAge: 5, maxAge: 6, order: 2 },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export function getMockKindergartenById(id: number) {
  return mockKindergartenListItems.find((k) => k.id === id) ?? null;
}
