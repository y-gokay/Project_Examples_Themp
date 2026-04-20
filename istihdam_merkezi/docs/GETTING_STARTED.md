# Başlangıç Rehberi

### Proje Nedir?

ATIM (Atakum İstihdam Merkezi), iş arayanlar ve işverenleri buluşturan bir web uygulamasıdır.

### Teknolojiler

- **React 19** - UI kütüphanesi
- **React Router** - Sayfa yönlendirme
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Proje Yapısı

```
src/
├── components/     # Yeniden kullanılabilir bileşenler
├── pages/          # Sayfa bileşenleri
├── hooks/          # Custom hook'lar
├── store/          # Global state
├── layouts/        # Sayfa layout'ları
├── lib/            # Kütüphane dosyaları
├── constants/      # Sabitler
└── utils/          # Yardımcı fonksiyonlar
```

## 🚀 İlk Adımlar

### 1. Projeyi Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:5173` adresine git.

### 2. İlk Değişikliği Yapma

`src/pages/Home.jsx` dosyasını aç ve bir şeyler değiştir. Değişiklikler otomatik olarak görünecektir (Hot Module Replacement).

### 3. Kod Yapısını Anlama

#### Component Nedir?

Component, ekranda görünen bir parçadır. Örneğin bir buton, bir form, bir kart.

```javascript
// Basit bir component örneği
const MyButton = () => {
  return <button>Tıkla</button>;
};
```

#### Hook Nedir?

Hook, React'in özel fonksiyonlarıdır. State yönetimi, side effect'ler için kullanılır.

```javascript
// useState hook'u ile state yönetimi
const [count, setCount] = useState(0);

// useEffect hook'u ile side effect
useEffect(() => {
  console.log("Component yüklendi");
}, []);
```

#### Store Nedir?

Store, uygulamanın global state'ini tutar. Her component'ten erişilebilir.

```javascript
// Store'dan veri okuma
const { user } = useAppStore();

// Store'a veri yazma
const { login } = useAppStore();
await login(email, password);
```

## 📝 Yaygın Görevler

### Yeni Bir Sayfa Ekleme

1. **Sayfa dosyası oluştur**

   ```javascript
   // src/pages/MyNewPage.jsx
   const MyNewPage = () => {
     return <div>Yeni Sayfa</div>;
   };

   export default MyNewPage;
   ```

2. **Route ekle**

   ```javascript
   // src/App.jsx
   import MyNewPage from "./pages/MyNewPage";

   <Route path={ROUTES.MY_NEW_PAGE} element={<MyNewPage />} />;
   ```

3. **Route constant ekle**
   ```javascript
   // src/constants/index.js
   export const ROUTES = {
     MY_NEW_PAGE: "/yeni-sayfa",
     // ...
   };
   ```

### Yeni Bir Component Ekleme

1. **Component dosyası oluştur**

   ```javascript
   // src/components/ui/MyComponent.jsx
   const MyComponent = ({ title, onClick }) => {
     return (
       <div>
         <h2>{title}</h2>
         <button onClick={onClick}>Tıkla</button>
       </div>
     );
   };

   export default MyComponent;
   ```

2. **Export et**

   ```javascript
   // src/components/ui/index.js
   export { default as MyComponent } from "./MyComponent";
   ```

3. **Kullan**

   ```javascript
   import { MyComponent } from "../components/ui";

   <MyComponent title="Başlık" onClick={() => console.log("Tıklandı")} />;
   ```

### API Çağrısı Yapma

1. **Store action kullan**

   ```javascript
   import { useAppStore } from "../store";

   const { getProfile } = useAppStore();
   const profile = await getProfile();
   ```

2. **useApiCall hook kullan (önerilen)**

   ```javascript
   import { useApiCall } from "../hooks/useApiCall";
   import { useAppStore } from "../store";

   const { updateProfile } = useAppStore();
   const updateApi = useApiCall();

   const handleUpdate = async () => {
     await updateApi.execute(() => updateProfile(data), {
       successMessage: "Başarılı!",
       errorMessage: "Hata oluştu",
     });
   };
   ```

### Form Oluşturma

```javascript
import { useState } from "react";
import { Input, Button } from "../components/ui";

const MyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Adınız"
      />
      <Input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="E-posta"
      />
      <Button type="submit">Gönder</Button>
    </form>
  );
};
```

## 🐛 Sorun Giderme

### Sayfa Yüklenmiyor

1. Route'un `App.jsx` içinde tanımlı olduğundan emin ol
2. Route constant'ının `constants/index.js` içinde tanımlı olduğundan emin ol
3. Browser console'da hata var mı kontrol et

### API Çağrısı Çalışmıyor

1. Backend sunucusunun çalıştığından emin ol
2. `src/lib/api.js` içindeki base URL'i kontrol et
3. Network tab'ında request'i kontrol et
4. Token'ın geçerli olduğundan emin ol

### Component Render Olmuyor

1. Component'in export edildiğinden emin ol
2. Import path'inin doğru olduğundan emin ol
3. Component'in bir JSX return ettiğinden emin ol

### State Güncellenmiyor

1. Store action'ının doğru çağrıldığından emin ol
2. State'in doğru şekilde güncellendiğinden emin ol
3. Component'in store'dan state'i okuduğundan emin ol

## 📖 Öğrenme Kaynakları

### React

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)

### Zustand

- [Zustand Docs](https://zustand-demo.pmnd.rs)

### Tailwind CSS

- [Tailwind CSS Docs](https://tailwindcss.com)

## 💡 İpuçları

1. **Kod Okumak**: Önce mevcut kodu oku, sonra değiştir
2. **Küçük Adımlar**: Büyük değişiklikler yerine küçük adımlarla ilerle
3. **Test Et**: Her değişiklikten sonra test et
4. **Soru Sor**: Anlamadığın bir şey varsa sor
5. **Dokümantasyon**: Dokümantasyonu oku

## 🎓 Sonraki Adımlar

1. [ARCHITECTURE.md](../ARCHITECTURE.md) dosyasını oku
2. Mevcut component'leri incele
3. Küçük bir özellik ekle
4. Code review iste
