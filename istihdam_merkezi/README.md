# ATIM - Atakum İstihdam Merkezi

## 📖 Proje Hakkında

ATIM (Atakum İstihdam Merkezi), iş arayanlar ve işverenleri buluşturan modern bir web uygulamasıdır. React 19, Vite ve güncel web teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js 18+**
- **npm** veya yarn

### Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → uygulama demo iş ilanları ve profil verileriyle çalışır. Giriş ekranında herhangi bir e-posta ve şifre kullanılabilir.

### Gerçek Backend ile Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla (.env dosyasını düzenleyin)
# VITE_APP_API_URL, VITE_APP_URL ve VITE_USE_MOCK=false değerlerini backend adresinize göre güncelleyin

# Geliştirme sunucusunu başlat
npm run dev

# Production build oluştur
npm run build

# Build'i önizle
npm run preview

# Lint kontrolü
npm run lint
```

### Ortam Değişkenleri

Proje kökünde `.env` dosyası oluşturup aşağıdaki değişkenleri tanımlayın:

| Değişken           | Açıklama                    |
|--------------------|-----------------------------|
| `VITE_APP_API_URL` | Backend API base URL (örn. `http://localhost:3001/api`) |
| `VITE_APP_URL`     | Backend sunucu URL (örn. `http://localhost:3001`)      |

## 📁 Proje Yapısı

```
src/
├── components/        # Yeniden kullanılabilir UI bileşenleri
│   ├── common/       # Ortak bileşenler (Header, Footer, Sidebar, PageWrapper, PageTransition)
│   ├── profile/      # Profil sayfası bileşenleri (PersonalInfo, Education, WorkExperience, vb.)
│   └── ui/           # Temel UI bileşenleri (Button, Input, Card, Modal, RichTextEditor, vb.)
├── pages/            # Sayfa bileşenleri
│   ├── auth/         # Kimlik doğrulama (Login, Register, ForgotPassword)
│   ├── business/     # İşveren sayfaları (Dashboard, JobPosts, CreateJobPost)
│   ├── jobs/         # İş ilanı sayfaları (JobList, JobDetail)
│   ├── seeker/       # İş arayan sayfaları (Applications, Favorites, CVs, Appointments)
│   └── static/       # Statik sayfalar (Hakkımızda, İletişim)
├── hooks/            # Custom React hook'ları (useApiCall, useAsyncOperation, useFileUpload, profile hooks)
├── store/            # Zustand state management
│   └── slices/       # authSlice, profileSlice, jobSlice, businessSlice, lookupSlice, commonSlice
├── layouts/          # AuthLayout, DashboardLayout, MainLayout
├── lib/              # API client (api.js)
├── constants/        # ROUTES, ROLES ve diğer sabitler
└── utils/            # Yardımcı fonksiyonlar (helpers, logger)
```

## 🏗️ Mimari

Bu proje **modüler mimari** prensiplerine göre yapılandırılmıştır:

- **Component-Based Architecture**: Her bileşen tek bir sorumluluğa sahiptir
- **Slice Pattern**: Store modüler slice'lara ayrılmıştır
- **Custom Hooks**: Tekrarlayan mantık hook'larda toplanmıştır
- **Centralized Constants**: Tüm route'lar ve sabitler merkezi bir dosyada

Detaylı mimari dokümantasyonu için [ARCHITECTURE.md](./docs/ARCHITECTURE.md) dosyasına bakın.

## 🛠️ Teknolojiler

- **React 19** – UI kütüphanesi
- **React Router v7** – Sayfa yönlendirme
- **Zustand** – State management
- **Tailwind CSS** – Styling (@tailwindcss/vite)
- **Vite 7** – Build tool
- **Lucide React** – İkon kütüphanesi
- **TipTap** – Zengin metin editörü (ilan açıklamaları vb.)
- **date-fns** – Tarih işlemleri

## 📚 Önemli Kavramlar

### 1. State Management (Zustand)

Proje, global state yönetimi için Zustand kullanır. Store modüler slice'lara ayrılmıştır:

```javascript
// Store kullanımı
import { useAppStore } from "./store";

const MyComponent = () => {
  const { user, login, logout } = useAppStore();
  // ...
};
```

### 2. Custom Hooks

Tekrarlayan mantık custom hook'larda toplanmıştır:

- `useApiCall` - API çağrıları için standart hata yönetimi
- `useFileUpload` - Dosya yükleme işlemleri
- `useAsyncOperation` - Async işlemler için loading state yönetimi

### 3. Route Management

Tüm route'lar `src/constants/index.js` dosyasında tanımlıdır:

```javascript
import { ROUTES } from "./constants";

// Hardcoded path yerine
navigate("/profil");

// Route constant kullan
navigate(ROUTES.PROFILE);
```

## 🎯 Geliştirme Rehberi

### Yeni Bir Sayfa Ekleme

1. `src/pages/` altında yeni bir dosya oluşturun
2. `src/App.jsx` içinde route ekleyin
3. `src/constants/index.js` içinde route constant'ı ekleyin

### Yeni Bir Component Ekleme

1. Uygun klasöre component ekleyin (`components/ui/` veya `components/common/`)
2. Component'i `index.js` dosyasından export edin
3. JSDoc yorumları ekleyin

### API Çağrısı Yapma

```javascript
import { useApiCall } from "../hooks/useApiCall";
import { useAppStore } from "../store";

const MyComponent = () => {
  const { getProfile } = useAppStore();
  const updateProfileApi = useApiCall();

  const handleUpdate = async () => {
    await updateProfileApi.execute(() => getProfile(), {
      successMessage: "Profil başarıyla güncellendi",
      errorMessage: "Bir hata oluştu",
      onSuccess: () => {
        // Başarılı işlem sonrası
      },
    });
  };
};
```

## 📝 Kod Standartları

- **ESLint** kullanılarak kod kalitesi kontrol edilir
- **JSDoc** yorumları ile fonksiyonlar dokümante edilir
- **PascalCase** component isimleri için
- **camelCase** fonksiyon ve değişken isimleri için
- **UPPER_SNAKE_CASE** sabitler için

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Store fonksiyonları çalışmıyor**

   - Store'dan fonksiyonu doğru import ettiğinizden emin olun
   - `useAppStore()` hook'unu kullandığınızdan emin olun

2. **Route çalışmıyor**

   - `ROUTES` constant'ını kullandığınızdan emin olun
   - Route'u `App.jsx` içinde tanımladığınızdan emin olun

3. **API çağrısı başarısız**
   - Backend sunucusunun çalıştığından emin olun
   - `.env` dosyasındaki `VITE_APP_API_URL` ve `VITE_APP_URL` değerlerini kontrol edin
   - Değişkenler `VITE_` ile başlamalıdır (Vite tarafından expose edilir)

## 📖 Daha Fazla Bilgi

- [Mimari Dokümantasyon](./docs/ARCHITECTURE.md)
- [Component Rehberi](./docs/COMPONENTS.md)
- [Başlangıç Rehberi](./docs/GETTING_STARTED.md)

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje Atakum Belediyesi için geliştirilmiştir.
