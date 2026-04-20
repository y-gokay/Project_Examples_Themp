# Psikolog Randevu — Frontend

Psikolog randevu sistemi kullanıcı arayüzü. Kullanıcılar psikolog seçip randevu alabilir; psikologlar randevularını ve notlarını yönetebilir.

## Teknoloji

- React 19 + Vite
- Axios
- React Context (AuthContext)

## Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → uygulama demo psikolog ve randevu verileriyle çalışır. Giriş ekranında herhangi bir e-posta ve şifre kullanılabilir.

## Backend ile Çalıştırma

Backend'i önce çalıştırın (bkz. `../backend/README.md`), ardından:

`.env` dosyasında:
```
VITE_API_URL=http://localhost:5001/api
VITE_USE_MOCK=false
```
