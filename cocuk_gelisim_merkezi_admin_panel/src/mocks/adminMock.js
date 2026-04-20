/** Demo yanıtlar — anonim örnek veri */

export function mockAdminJwt() {
  const payload = btoa(
    JSON.stringify({ role: "super", username: "demo_admin", exp: 9999999999 }),
  );
  return `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.${payload}.mock`;
}

const ageGroupItems = [
  { id: 1, name: "3-3,5", minAge: 3, maxAge: 3.5, order: 1 },
  { id: 2, name: "3,5-4", minAge: 3.5, maxAge: 4, order: 2 },
  { id: 3, name: "4-4,5", minAge: 4, maxAge: 4.5, order: 3 },
  { id: 4, name: "4,5-5", minAge: 4.5, maxAge: 5, order: 4 },
  { id: 5, name: "5-6", minAge: 5, maxAge: 6, order: 5 },
];

const kresItems = [
  {
    id: 1,
    name: "Örnek Çocuk Gelişim Merkezi — Kuzey",
    address: "Örnek Mah. Demo Cad. No:1",
    phone: "0555 000 00 01",
    email: "ornek.kuzey@example.com",
    description: "Demo merkez açıklaması.",
    quota: 40,
    reservedQuota: 5,
    remainingQuota: 12,
    latitude: 41.29,
    longitude: 36.33,
    ageGroups: ageGroupItems.slice(0, 3),
    photos: [{ id: 1, photoPath: "/cgm1_1.jpg", order: 0 }],
  },
  {
    id: 2,
    name: "Örnek Çocuk Gelişim Merkezi — Güney",
    address: "Deneme Sok. No:2",
    phone: "0555 000 00 02",
    email: "ornek.guney@example.com",
    description: "İkinci demo merkez.",
    quota: 30,
    reservedQuota: 3,
    remainingQuota: 8,
    latitude: 41.27,
    longitude: 36.34,
    ageGroups: ageGroupItems.slice(2, 5),
    photos: [{ id: 2, photoPath: "/cgm2_1.jpg", order: 0 }],
  },
];

const selectedKres = (id) => kresItems.find((k) => k.id === id) || kresItems[0];

const demoApplications = [
  {
    id: 1001,
    fullName: "Ahmet Yılmaz",
    phone: "0555 000 10 01",
    score: 72,
    status: "bekliyor",
    adminNotes: "",
    createdAt: "2025-03-10T10:00:00.000Z",
    selectedKres: { id: 1, name: kresItems[0].name, address: kresItems[0].address },
    selectedAgeGroup: { id: 3, name: "4-4,5" },
  },
  {
    id: 1002,
    fullName: "Ayşe Demir",
    phone: "0555 000 10 02",
    score: 65,
    status: "kayıt_yaptırdı",
    adminNotes: "Demo not",
    createdAt: "2025-03-11T14:30:00.000Z",
    selectedKres: { id: 2, name: kresItems[1].name, address: kresItems[1].address },
    selectedAgeGroup: { id: 4, name: "4,5-5" },
  },
  {
    id: 1003,
    fullName: "Mehmet Kaya",
    phone: "0555 000 10 03",
    score: 58,
    status: null,
    adminNotes: null,
    createdAt: "2025-03-12T09:15:00.000Z",
    selectedKres: null,
    selectedAgeGroup: { id: 2, name: "3,5-4" },
  },
];

const archivedApplications = demoApplications.slice(0, 1).map((a) => ({
  ...a,
  archivedAt: "2025-04-01T12:00:00.000Z",
}));

const scoringConfigBody = {
  config: {
    socialSecurity: { SSK: 5, "BAĞ-KUR": 20, "Emekli Sandığı": 10 },
    disabledMembersInFamily: {},
    houseHeatingSystem: {},
    socialAssistanceHistory: {},
    numberOfStudentsInFamily: [{ op: ">", value: 2, points: 20 }],
    familySize: [{ op: ">=", value: 4, points: 10 }],
    totalIncome: [],
    employeesNumberOfFamily: [],
    houseRentalFee: [],
    familyPensionAmount: [],
    chronicDisease: { true: 15, false: 0 },
    additionalIncome: { true: 0, false: 10 },
  },
};

function parsePath(url) {
  const q = url.indexOf("?");
  const path = q >= 0 ? url.slice(0, q) : url;
  const search = q >= 0 ? url.slice(q + 1) : "";
  const params = new URLSearchParams(search);
  return { path, params };
}

/**
 * @returns {unknown | undefined} undefined = gerçek fetch kullan
 */
export function tryMockApiResponse(url, method, bodyText) {
  const m = (method || "GET").toUpperCase();
  const { path, params } = parsePath(url);

  if (path === "/admin/login" && m === "POST") {
    return { token: mockAdminJwt() };
  }

  if (path === "/admin/applications/open" && m === "GET") {
    return { open: true };
  }

  if (path === "/admin/settings/applications-open" && m === "GET") {
    return { open: true };
  }

  if (path === "/admin/settings/applications-open" && m === "POST") {
    try {
      const b = bodyText ? JSON.parse(bodyText) : {};
      return { open: !!b.open };
    } catch {
      return { open: true };
    }
  }

  if (path === "/admin/age-groups" && m === "GET") {
    return { items: ageGroupItems };
  }

  if (path === "/admin/scoring-config" && m === "GET") {
    return scoringConfigBody;
  }

  if (path === "/admin/users" && m === "GET") {
    return {
      items: [
        { id: 1, username: "demo_admin", role: "super", createdAt: "2025-01-01T00:00:00.000Z" },
      ],
    };
  }

  if (path === "/admin/users" && m === "POST") {
    return { ok: true, id: 99 };
  }

  if (path.match(/^\/admin\/users\/\d+$/) && m === "DELETE") {
    return { ok: true };
  }

  if (path === "/admin/applications/archived" && m === "GET") {
    return { items: archivedApplications };
  }

  if (path.startsWith("/admin/applications") && m === "GET") {
    const page = Number(params.get("page") || "1");
    const limit = Number(params.get("limit") || "100");
    const items = [...demoApplications];
    const start = (page - 1) * limit;
    const pageItems = items.slice(start, start + limit);
    return {
      items: pageItems,
      pagination: { total: items.length, page, limit },
    };
  }

  if (path.match(/^\/admin\/applications\/\d+\/status$/) && m === "PATCH") {
    return { ok: true };
  }

  if (path.match(/^\/admin\/applications\/\d+\/send-message$/) && m === "POST") {
    return { ok: true };
  }

  if (path === "/admin/applications/archive" && m === "POST") {
    return { ok: true };
  }

  if (path === "/admin/applications/unarchive" && m === "POST") {
    return { ok: true };
  }

  if (path === "/admin/applications/delete" && m === "POST") {
    return { ok: true };
  }

  if (path.match(/^\/admin\/applications\/\d+$/) && m === "DELETE") {
    return { ok: true };
  }

  if (path === "/admin/applications/lottery" && m === "POST") {
    const placed = demoApplications.filter((a) => a.selectedKres);
    return {
      totalPlaced: placed.length,
      totalUnplaced: demoApplications.length - placed.length,
      selectedAgeGroup: { id: 3, name: "4-4,5" },
      resultsByKres: kresItems.map((k) => ({
        kresId: k.id,
        kresName: k.name,
        applications: placed.filter((a) => a.selectedKres?.id === k.id),
      })),
    };
  }

  if (path === "/admin/applications/recalculate-scores" && m === "POST") {
    return { changed: 0, total: demoApplications.length };
  }

  if (path === "/kresler/admin/all" && m === "GET") {
    return { items: kresItems };
  }

  const detailMatch = path.match(/^\/kresler\/(\d+)$/);
  if (detailMatch && m === "GET" && !path.includes("/admin")) {
    const id = Number(detailMatch[1]);
    const k = selectedKres(id);
    return { ...k, id };
  }

  if (path === "/kresler/admin" && m === "POST") {
    return { id: 3, ...kresItems[0], name: "Yeni Demo Merkez" };
  }

  if (path.match(/^\/kresler\/admin\/\d+$/) && m === "PUT") {
    const id = Number(path.split("/").pop());
    return { id, ...selectedKres(id) };
  }

  if (path.match(/^\/kresler\/admin\/\d+$/) && m === "DELETE") {
    return { ok: true };
  }

  if (path.match(/^\/kresler\/admin\/photos\/\d+$/) && m === "DELETE") {
    return { ok: true };
  }

  return undefined;
}
