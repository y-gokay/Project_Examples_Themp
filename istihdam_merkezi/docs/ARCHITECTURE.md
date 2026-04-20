# ATIM - Mimari Dokümantasyon

Bu dokümantasyon, ATIM projesinin mimarisini ve kod yapısını developer'ların anlayabileceği şekilde açıklar.

## 📐 Genel Mimari

ATIM projesi **modüler ve ölçeklenebilir** bir mimariye sahiptir. Her modül kendi sorumluluğuna sahiptir ve diğer modüllerle gevşek bağlıdır (loosely coupled).

```
┌─────────────────────────────────────────────────┐
│                   React App                     │
│                  (App.jsx)                      │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Pages   │    │ Layouts  │    │Components│
│          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
                ┌──────────────┐
                │   Zustand    │
                │    Store     │
                └──────────────┘
                        │
                        ▼
                ┌──────────────┐
                │  API Client  │
                │   (api.js)   │
                └──────────────┘
```

## 🗂️ Klasör Yapısı ve Açıklamalar

### `/src/components`

Yeniden kullanılabilir UI bileşenlerini içerir.

#### `/components/ui`

Temel UI bileşenleri (Button, Input, Card, vb.). Bu bileşenler projenin her yerinde kullanılabilir.

**Örnek Kullanım:**

```javascript
import { Button, Input, Card } from "../components/ui";

const MyComponent = () => {
  return (
    <Card>
      <Input placeholder="Adınız" />
      <Button>Kaydet</Button>
    </Card>
  );
};
```

#### `/components/common`

Ortak bileşenler (Header, Footer, Sidebar). Bu bileşenler genellikle layout'larda kullanılır.

#### `/components/profile`

Profil sayfasına özel bileşenler. Her bileşen profil sayfasının bir bölümünü yönetir:

- `PersonalInfoSection` - Kişisel bilgiler
- `AddressSection` - Adres bilgileri
- `EducationSection` - Eğitim bilgileri
- vb.

**Neden Ayrı Bileşenler?**

- Her bileşen tek bir sorumluluğa sahiptir (Single Responsibility Principle)
- Kod daha okunabilir ve bakımı kolaydır
- Her bileşen bağımsız olarak test edilebilir

### `/src/pages`

Sayfa bileşenlerini içerir. Her dosya bir route'a karşılık gelir.

**Yapı:**

```
pages/
├── auth/          # Kimlik doğrulama sayfaları
├── business/      # İşveren sayfaları
├── jobs/          # İş ilanı sayfaları
├── seeker/        # İş arayan sayfaları
└── static/        # Statik sayfalar
```

**Örnek Sayfa:**

```javascript
// pages/Profile.jsx
import { PersonalInfoSection, AddressSection } from "../components/profile";

const Profile = () => {
  return (
    <div>
      <PersonalInfoSection />
      <AddressSection />
    </div>
  );
};
```

### `/src/store`

Global state yönetimi için Zustand store'u içerir.

#### Store Yapısı (Slice Pattern)

Store, domain'lere göre slice'lara ayrılmıştır:

```
store/
├── appStore.js          # Ana store dosyası (slice'ları birleştirir)
└── slices/
    ├── authSlice.js     # Kimlik doğrulama state'i
    ├── profileSlice.js  # Profil state'i
    ├── jobSlice.js      # İş ilanları state'i
    ├── lookupSlice.js   # Lookup verileri (şehirler, meslekler, vb.)
    ├── businessSlice.js # İşveren state'i
    ├── commonSlice.js   # Ortak state ve utility actions
    └── otherSlice.js    # CV, Notification, Appointment, vb.
```

**Neden Slice Pattern?**

- Her slice tek bir domain'e odaklanır
- Kod daha organize ve bakımı kolaydır
- Farklı geliştiriciler farklı slice'lar üzerinde çalışabilir

**Örnek Slice:**

```javascript
// store/slices/authSlice.js
export const authSlice = (set, get) => ({
  // State
  user: null,
  isAuthenticated: false,

  // Actions
  login: async (email, password) => {
    // Login logic
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
});
```

**Store Kullanımı:**

```javascript
import { useAppStore } from "./store";

const MyComponent = () => {
  // Tüm store'u almak yerine sadece ihtiyacımız olanları alıyoruz
  const { user, login, logout } = useAppStore();

  // ...
};
```

### `/src/hooks`

Custom React hook'larını içerir.

#### `useApiCall`

API çağrıları için standart hata yönetimi sağlar.

**Neden Gerekli?**

- Her API çağrısında aynı hata yönetimi kodunu tekrar yazmak yerine
- Tek bir hook ile loading, error ve success durumlarını yönetiriz

**Kullanım:**

```javascript
import { useApiCall } from "../hooks/useApiCall";

const MyComponent = () => {
  const updateApi = useApiCall();

  const handleUpdate = async () => {
    await updateApi.execute(() => updateProfile(data), {
      successMessage: "Başarılı!",
      errorMessage: "Hata oluştu",
      onSuccess: () => {
        // Başarılı işlem sonrası
      },
    });
  };

  return (
    <button onClick={handleUpdate} disabled={updateApi.loading}>
      {updateApi.loading ? "Yükleniyor..." : "Güncelle"}
    </button>
  );
};
```

#### `useFileUpload`

Dosya yükleme işlemleri için özel hook.

**Kullanım:**

```javascript
import { useFileUpload } from "../hooks/profile/useFileUpload";

const MyComponent = () => {
  const { upload, loading } = useFileUpload({
    onSuccess: () => console.log("Başarılı!"),
    onError: (error) => console.error(error),
  });

  const handleFileChange = (e) => {
    upload(e.target.files[0]);
  };
};
```

### `/src/layouts`

Sayfa layout'larını içerir. Her layout farklı bir sayfa tipi için kullanılır.

**Layout'lar:**

- `MainLayout` - Ana sayfa layout'u (Header + Footer)
- `AuthLayout` - Kimlik doğrulama sayfaları için
- `DashboardLayout` - Panel sayfaları için (Header + Sidebar)

**Kullanım:**

```javascript
// App.jsx
<Route element={<MainLayout />}>
  <Route path={ROUTES.HOME} element={<Home />} />
</Route>

<Route element={<DashboardLayout />}>
  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
</Route>
```

### `/src/lib`

Kütüphane dosyalarını içerir.

#### `api.js`

API client'ı. Tüm HTTP istekleri bu dosya üzerinden yapılır.

**Özellikler:**

- Token yönetimi
- Otomatik error handling
- 401 durumunda otomatik logout

**Kullanım:**

```javascript
import { api } from "../lib/api";

// GET request
const result = await api.get("/users");

// POST request
const result = await api.post("/users", { name: "John" });

// PUT request
const result = await api.put("/users/1", { name: "Jane" });

// DELETE request
const result = await api.delete("/users/1");
```

### `/src/constants`

Sabitler ve konfigürasyonları içerir.

**İçerik:**

- `ROUTES` - Tüm route path'leri
- `ROLES` - Kullanıcı rolleri
- `API_TIMEOUT` - API timeout süresi
- vb.

**Neden Önemli?**

- Hardcoded string'ler yerine constant kullanmak
- Değişiklik yapmak daha kolay
- Typo hatalarını önler

**Kullanım:**

```javascript
import { ROUTES } from "./constants";

// ❌ Kötü
navigate("/profil");

// ✅ İyi
navigate(ROUTES.PROFILE);
```

### `/src/utils`

Yardımcı fonksiyonları içerir.

#### `logger.js`

Geliştirme ve production için logging utility.

**Özellikler:**

- Development'ta console'a yazar
- Production'da otomatik devre dışı kalır
- Error tracking için hazır

**Kullanım:**

```javascript
import { log, error, warn } from "../utils/logger";

log("Bilgi mesajı");
warn("Uyarı mesajı");
error("Hata mesajı", errorObject);
```

## 🔄 Veri Akışı

### 1. Kullanıcı Aksiyonu → API Çağrısı

```
Kullanıcı tıklama
    ↓
Component handler fonksiyonu
    ↓
useApiCall hook
    ↓
Store action (örn: updateProfile)
    ↓
API client (api.js)
    ↓
Backend API
    ↓
Response
    ↓
Store state güncelleme
    ↓
Component re-render
```

**Örnek:**

```javascript
// 1. Kullanıcı "Kaydet" butonuna tıklar
const handleSubmit = async () => {
  // 2. useApiCall hook'u ile API çağrısı yapılır
  await updateApi.execute(
    // 3. Store action çağrılır
    () => updateProfile(data),
    {
      // 4. Başarılı olursa
      onSuccess: () => {
        // 5. Store state güncellenir
        // 6. Component otomatik re-render olur
      },
    }
  );
};
```

### 2. Sayfa Yükleme → Veri Çekme

```
Sayfa yüklenir
    ↓
useEffect çalışır
    ↓
Store action çağrılır (örn: getProfile)
    ↓
API çağrısı
    ↓
Veri store'a kaydedilir
    ↓
Component veriyi store'dan okur
    ↓
UI render edilir
```

**Örnek:**

```javascript
const Profile = () => {
  const { user, getProfile } = useAppStore();

  useEffect(() => {
    // Sayfa yüklendiğinde profil verisini çek
    getProfile();
  }, [getProfile]);

  // Store'dan gelen veriyi kullan
  return <div>{user?.name}</div>;
};
```

## 🎨 Component Yapısı

### Component Best Practices

1. **Tek Sorumluluk Prensibi**
   Her component tek bir işe odaklanmalıdır.

```javascript
// ❌ Kötü - Çok fazla sorumluluk
const Profile = () => {
  // Profil bilgileri, adres, eğitim, iş deneyimi hepsi bir arada
};

// ✅ İyi - Her component tek bir sorumluluğa sahip
const Profile = () => {
  return (
    <>
      <PersonalInfoSection />
      <AddressSection />
      <EducationSection />
    </>
  );
};
```

2. **Props ile Veri Geçirme**
   Component'ler arası veri geçişi props ile yapılır.

```javascript
// Parent component
const Profile = () => {
  const { user } = useAppStore();

  return <PersonalInfoSection user={user} />;
};

// Child component
const PersonalInfoSection = ({ user }) => {
  return <div>{user?.name}</div>;
};
```

3. **Custom Hook'lar ile Mantık Ayırma**
   UI mantığı component'te, iş mantığı hook'ta olmalıdır.

```javascript
// Component - Sadece UI
const Profile = () => {
  const { user, updateProfile } = useProfileLogic();

  return (
    <form onSubmit={updateProfile}>
      <input defaultValue={user?.name} />
    </form>
  );
};

// Hook - İş mantığı
const useProfileLogic = () => {
  const { user, updateProfile: updateProfileStore } = useAppStore();

  const updateProfile = async (data) => {
    await updateProfileStore(data);
  };

  return { user, updateProfile };
};
```

## 🔐 Güvenlik ve Hata Yönetimi

### Token Yönetimi

Token'lar localStorage'da saklanır ve her API çağrısında otomatik olarak header'a eklenir.

```javascript
// api.js içinde otomatik olarak yapılır
const token = localStorage.getItem("atim-token");
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### Hata Yönetimi

Tüm API hataları merkezi olarak yönetilir:

```javascript
// api.js
if (!response.ok) {
  if (response.status === 401) {
    // Token geçersiz, logout yap
    storeInstance.getState().logout();
  }
  // Diğer hatalar
}
```

### Loading State Yönetimi

Her async işlem için loading state'i yönetilir:

```javascript
const { loading, execute } = useApiCall();

// Loading state otomatik olarak yönetilir
if (loading) {
  return <Loading />;
}
```

## 📊 State Management Stratejisi

### Ne Zaman Store Kullanılmalı?

✅ **Store Kullan:**

- Kullanıcı bilgileri (user)
- Global UI state (loading, error)
- Birden fazla component'te kullanılan veriler

❌ **Store Kullanma:**

- Sadece bir component'te kullanılan local state
- Form input değerleri (genellikle)
- Geçici UI state'i (modal açık/kapalı)

### Store vs Local State

```javascript
// ✅ Store - Global state
const { user } = useAppStore(); // Tüm uygulamada kullanılır

// ✅ Local State - Component-specific
const [isModalOpen, setIsModalOpen] = useState(false); // Sadece bu component'te
```

## 🧪 Test Stratejisi (Gelecek)

### Unit Testler

- Component testleri (React Testing Library)
- Hook testleri
- Utility fonksiyon testleri

### Integration Testler

- API entegrasyon testleri
- Store action testleri

## 📈 Performans Optimizasyonu

### Code Splitting

- Route bazlı code splitting (React.lazy)
- Component bazlı code splitting

### Memoization

- React.memo ile component memoization
- useMemo ile expensive hesaplamalar
- useCallback ile fonksiyon memoization

## 🚀 Deployment

### Build Process

```bash
npm run build
```

### Environment Variables

- `.env.development` - Development ortamı
- `.env.production` - Production ortamı

## 📚 Öğrenme Kaynakları

### React

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)

### Zustand

- [Zustand Docs](https://zustand-demo.pmnd.rs)

### Tailwind CSS

- [Tailwind CSS Docs](https://tailwindcss.com)

## ❓ Sık Sorulan Sorular

### 1. Yeni bir sayfa nasıl eklenir?

1. `src/pages/` altında yeni dosya oluştur
2. `src/App.jsx` içinde route ekle
3. `src/constants/index.js` içinde route constant ekle

### 2. Yeni bir API endpoint nasıl eklenir?

1. İlgili slice'a action ekle (`store/slices/`)
2. `api.js` kullanarak API çağrısı yap
3. Component'te hook ile kullan

### 3. Yeni bir component nasıl eklenir?

1. Uygun klasöre ekle (`components/ui/` veya `components/common/`)
2. `index.js` dosyasından export et
3. JSDoc yorumları ekle

### 4. Store'a nasıl yeni state eklenir?

1. İlgili slice dosyasını aç
2. State ve action'ları ekle
3. Component'te kullan

## 🎯 Sonuç

Bu mimari, projenin ölçeklenebilir ve bakımı kolay olmasını sağlar. Her modül kendi sorumluluğuna sahiptir ve diğer modüllerle gevşek bağlıdır. Bu sayede kod daha okunabilir, test edilebilir ve geliştirilebilir hale gelir.
