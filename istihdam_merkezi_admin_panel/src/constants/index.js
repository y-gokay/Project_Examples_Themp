// API Yapılandırması
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.atakumistihdam.gov.tr/v1";
export const API_TIMEOUT = 30000;

// Uygulama Route'ları
export const ROUTES = {
  HOME: "/",

  // Kimlik Doğrulama
  LOGIN: "/giris",
  REGISTER: "/kayit",
  FORGOT_PASSWORD: "/sifremi-unuttum",
  RESET_PASSWORD: "/sifre-sifirla",
  VERIFY_EMAIL: "/email-dogrulama",

  // İş İlanları
  JOBS: "/ilanlar",
  JOB_DETAIL: "/ilanlar/:id",
  JOB_APPLY: "/ilanlar/:id/basvur",

  // İş Arayan
  DASHBOARD: "/panel",
  PROFILE: "/profil",
  MY_APPLICATIONS: "/basvurularim",
  MY_APPLICATIONS_PANEL: "/panel/basvurularim",
  MY_FAVORITES: "/favorilerim",
  MY_FAVORITES_PANEL: "/panel/favorilerim",
  CV_WIZARD: "/cv-olustur",
  MY_CVS: "/cvlerim",
  MY_CVS_PANEL: "/panel/cvlerim",
  NOTIFICATIONS_PANEL: "/panel/bildirimler",
  APPOINTMENTS_PANEL: "/panel/randevularim",
  SAVED_SEARCHES: "/kayitli-aramalar",
  SAVED_SEARCHES_PANEL: "/panel/kayitli-aramalar",

  // İşveren
  EMPLOYER_DASHBOARD: "/isveren",
  EMPLOYER_PANEL: "/isveren/panel",
  EMPLOYER_PROFILE: "/isveren/profil",
  EMPLOYER_LOGIN: "/isveren/giris",
  EMPLOYER_REGISTER: "/isveren/kayit",
  EMPLOYER_FORGOT_PASSWORD: "/isveren/sifremi-unuttum",
  EMPLOYER_JOBS: "/isveren/ilanlar",
  EMPLOYER_MY_JOBS: "/isveren/ilanlarim",
  EMPLOYER_JOB_CREATE: "/isveren/ilan-olustur",
  EMPLOYER_JOB_EDIT: "/isveren/ilanlarim/:id/duzenle",
  EMPLOYER_APPLICATIONS: "/isveren/basvurular",
  EMPLOYER_COMPANY: "/isveren/sirket-profili",
  EMPLOYER_CANDIDATES: "/isveren/aday-havuzu",
  EMPLOYER_ACCOUNTS: "/isveren/hesaplar",
  EMPLOYER_CHANGE_PASSWORD: "/isveren/sifre-degistir",

  // Danışman
  ADVISOR_DASHBOARD: "/danisman",
  ADVISOR_APPOINTMENTS: "/danisman/randevular",
  ADVISOR_MATCHES: "/danisman/eslesmeler",
  ADVISOR_CALENDAR: "/danisman/takvim",

  // Randevular
  ADVISORS: "/danismanlar",
  ADVISOR_DETAIL: "/danismanlar/:id",
  MY_APPOINTMENTS: "/randevularim",

  // Etkinlikler
  EVENTS: "/etkinlikler",
  EVENT_DETAIL: "/etkinlikler/:id",
  MY_EVENTS: "/etkinliklerim",

  // İçerik
  BLOG: "/blog",
  BLOG_POST: "/blog/:slug",
  SUCCESS_STORIES: "/basari-hikayeleri",
  FAQ: "/sss",

  // Statik Sayfalar
  ABOUT: "/hakkimizda",
  CONTACT: "/iletisim",
  PRIVACY: "/kvkk",
  TERMS: "/kullanim-sartlari",

  // Hesap
  SETTINGS: "/ayarlar",
  NOTIFICATIONS: "/bildirimler",
  NOTIFICATION_PREFERENCES: "/bildirim-tercihleri",
};

// Kullanıcı Rolleri
export const ROLES = {
  SEEKER: "seeker",
  EMPLOYER: "employer",
  ADVISOR: "advisor",
  ADMIN: "admin",
};

// İş Tipleri
export const JOB_TYPES = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  REMOTE: "remote",
  INTERNSHIP: "internship",
  FREELANCE: "freelance",
};

export const JOB_TYPE_LABELS = {
  "full-time": "Tam Zamanlı",
  "part-time": "Yarı Zamanlı",
  remote: "Uzaktan",
  internship: "Staj",
  freelance: "Serbest",
};

// Work Types
export const WORK_TYPES = {
  ONSITE: "onsite",
  REMOTE: "remote",
  HYBRID: "hybrid",
};

export const WORK_TYPE_LABELS = {
  onsite: "Ofiste",
  remote: "Uzaktan",
  hybrid: "Hibrit",
};

// Education Levels
export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: "lise",
  ASSOCIATE: "önlisans",
  BACHELOR: "lisans",
  MASTER: "yüksek-lisans",
  PHD: "doktora",
};

export const EDUCATION_LEVEL_LABELS = {
  lise: "Lise",
  önlisans: "Ön Lisans",
  lisans: "Lisans",
  "yüksek-lisans": "Yüksek Lisans",
  doktora: "Doktora",
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EMPLOYED: "employed",
  RECEIVED: "received",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  OFFER: "offer",
  HIRED: "hired",
};

export const APPLICATION_STATUS_LABELS = {
  pending: "Beklemede",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  employed: "İşe Alındı",
  received: "Alındı",
  shortlisted: "Kısa Listede",
  interview: "Mülakat",
  offer: "Teklif",
  hired: "İşe Alındı",
};

export const APPLICATION_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  employed: "bg-emerald-100 text-emerald-800",
  received: "bg-blue-100 text-blue-800",
  shortlisted: "bg-purple-100 text-purple-800",
  interview: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  hired: "bg-emerald-100 text-emerald-800",
};

// Job Status
export const JOB_STATUS = {
  DRAFT: "draft",
  OPEN: "open",
  CLOSED: "closed",
  EXPIRED: "expired",
};

export const JOB_STATUS_LABELS = {
  draft: "Taslak",
  open: "Açık",
  closed: "Kapalı",
  expired: "Süresi Dolmuş",
};

// Event Types
export const EVENT_TYPES = {
  TRAINING: "training",
  SEMINAR: "seminar",
  WORKSHOP: "workshop",
  JOB_FAIR: "job-fair",
  NETWORKING: "networking",
};

export const EVENT_TYPE_LABELS = {
  training: "Eğitim",
  seminar: "Seminer",
  workshop: "Atölye",
  "job-fair": "İş Fuarı",
  networking: "Networking",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no-show",
};

export const APPOINTMENT_STATUS_LABELS = {
  confirmed: "Onaylandı",
  cancelled: "İptal Edildi",
  completed: "Tamamlandı",
  "no-show": "Gelmedi",
};

// Profil Görünürlüğü
export const PROFILE_VISIBILITY = {
  PUBLIC: "public",
  ANONYMOUS: "anonymous",
  APPLICATIONS_ONLY: "applications-only",
};

export const PROFILE_VISIBILITY_LABELS = {
  public: "Herkese Açık",
  anonymous: "Anonim",
  "applications-only": "Sadece Başvurduklarım",
};

// Dil Seviyeleri
export const LANGUAGE_LEVELS = {
  NATIVE: "native",
  ADVANCED: "advanced",
  INTERMEDIATE: "intermediate",
  BASIC: "basic",
};

export const LANGUAGE_LEVEL_LABELS = {
  native: "Ana Dil",
  advanced: "İleri",
  intermediate: "Orta",
  basic: "Temel",
};

// Bildirim Tipleri
export const NOTIFICATION_TYPES = {
  APPLICATION: "application",
  JOB: "job",
  EVENT: "event",
  APPOINTMENT: "appointment",
  SYSTEM: "system",
};

// Dosya Yükleme Limitleri
export const FILE_LIMITS = {
  CV: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    extensions: [".pdf", ".doc", ".docx"],
  },
  PHOTO: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png"],
    extensions: [".jpg", ".jpeg", ".png"],
  },
  LOGO: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ["image/jpeg", "image/png", "image/svg+xml"],
    extensions: [".jpg", ".jpeg", ".png", ".svg"],
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    extensions: [".pdf", ".doc", ".docx"],
  },
};

// Sayfalama
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
};

// Tarih Formatları
export const DATE_FORMATS = {
  DISPLAY: "dd MMMM yyyy",
  DISPLAY_WITH_TIME: "dd MMMM yyyy HH:mm",
  API: "yyyy-MM-dd",
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss'Z'",
};

// Türk Şehirleri
export const CITIES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kilis",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Siirt",
  "Sinop",
  "Şırnak",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

// Samsun Districts
export const SAMSUN_DISTRICTS = [
  "Atakum",
  "İlkadım",
  "Canik",
  "Tekkeköy",
  "Asarcık",
  "Ayvacık",
  "Bafra",
  "Çarşamba",
  "Havza",
  "Kavak",
  "Ladik",
  "Salıpazarı",
  "Terme",
  "Vezirköprü",
  "Yakakent",
  "19 Mayıs",
  "Alaçam",
];

// Sectors
export const SECTORS = [
  { id: "bilisim", name: "Bilişim", icon: "💻" },
  { id: "uretim", name: "Üretim", icon: "🏭" },
  { id: "egitim", name: "Eğitim", icon: "🎓" },
  { id: "saglik", name: "Sağlık", icon: "🏥" },
  { id: "finans", name: "Finans", icon: "💰" },
  { id: "perakende", name: "Perakende", icon: "🛒" },
  { id: "insaat", name: "İnşaat", icon: "🏗️" },
  { id: "turizm", name: "Turizm", icon: "✈️" },
  { id: "lojistik", name: "Lojistik", icon: "🚚" },
  { id: "tarim", name: "Tarım", icon: "🌾" },
  { id: "enerji", name: "Enerji", icon: "⚡" },
  { id: "medya", name: "Medya", icon: "📱" },
  { id: "hukuk", name: "Hukuk", icon: "⚖️" },
  { id: "diger", name: "Diğer", icon: "📋" },
];

// Popular Skills (for autocomplete)
export const POPULAR_SKILLS = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Swift",
  "Kotlin",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Django",
  "Flask",
  "Spring Boot",
  "Laravel",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Bootstrap",
  "SASS",
  "TypeScript",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "Agile",
  "Scrum",
  "Jira",
  "Figma",
  "Adobe XD",
  "Excel",
  "Power BI",
  "Tableau",
  "SAP",
  "ERP",
  "CRM",
  "Satış",
  "Pazarlama",
  "İnsan Kaynakları",
  "Muhasebe",
  "Finans",
  "Hukuk",
  "İngilizce",
  "Almanca",
  "Fransızca",
  "İletişim",
  "Liderlik",
  "Ekip Yönetimi",
];

// Match Score Thresholds
export const MATCH_SCORE = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 0,
};

export const MATCH_SCORE_LABELS = {
  EXCELLENT: "Mükemmel Eşleşme",
  GOOD: "İyi Eşleşme",
  FAIR: "Orta Eşleşme",
  POOR: "Düşük Eşleşme",
};

export const MATCH_SCORE_COLORS = {
  EXCELLENT: "text-green-600",
  GOOD: "text-blue-600",
  FAIR: "text-yellow-600",
  POOR: "text-red-600",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "atim_auth_token",
  REFRESH_TOKEN: "atim_refresh_token",
  USER: "atim_user",
  THEME: "atim_theme",
  FILTERS: "atim_filters",
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
};
