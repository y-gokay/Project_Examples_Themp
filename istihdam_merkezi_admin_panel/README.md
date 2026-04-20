# İstihdam Merkezi Admin Panel

İstihdam merkezi yönetim paneli. Kullanıcı ve işveren hesaplarını, iş ilanlarını ve başvuruları yönetmek için kullanılan admin arayüzü.

## Teknoloji

- React 19 + Vite
- React Context API
- Fetch tabanlı API client

## Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → panel demo kullanıcı ve ilan verileriyle çalışır. Giriş ekranında herhangi bir e-posta ve şifre kullanılabilir.

## Gerçek Backend ile Çalıştırma

`.env` dosyasında:
```
VITE_APP_API_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```
