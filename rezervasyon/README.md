# Rezervasyon

Salon ve etkinlik rezervasyon yönetim sistemi. Salon ataması, ödeme takibi, PDF/Excel çıktısı ve takvim görünümü içerir.

## Teknoloji

- React 19 + Vite
- Redux Toolkit
- Axios (retry + exponential backoff)
- React Hot Toast

## Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → sistem demo rezervasyonlarla çalışır. Giriş ekranında herhangi bir e-posta ve şifre kullanılabilir.

## Gerçek Backend ile Çalıştırma

`.env` dosyasında:
```
VITE_API_BASE_URL=http://localhost:3002/api
VITE_USE_MOCK=false
```
