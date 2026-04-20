# Gençlik Merkezi Admin Panel

Belediye gençlik merkezi yönetim paneli. Kitap kataloğunu, üye kayıtlarını, ödünç işlemlerini ve duyuruları yönetmek için kullanılan admin arayüzü.

## Teknoloji

- React 18 + Vite
- Redux Toolkit
- React Router v6
- Axios + MUI

## Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → panel sahte verilerle çalışır. Giriş ekranında herhangi bir e-posta ve şifre kullanılabilir.

## Gerçek Backend ile Çalıştırma

`.env` dosyasında:
```
VITE_APP_API_URL=https://backend-adresiniz/api
VITE_USE_MOCK=false
```
