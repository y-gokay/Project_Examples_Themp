# Çocuk Gelişim Merkezi — Yönetim Paneli

Başvuruları, çekiliş/yerleştirme süreçlerini ve çocuk gelişim merkezi kayıtlarını yönetmek için kullanılan React + Vite yönetim arayüzü.

## Teknoloji

React 18, Vite, React Router, Tailwind CSS.

## Kurulum ve demo

```bash
cp .env.example .env
npm install
npm run dev
```

`VITE_USE_MOCK=true` iken panel gerçek API’ye istek atmaz; giriş sonrası örnek başvurular, merkezler ve ayarlar gösterilir. Excel indirme aksiyonları demo modda boş bir `.xlsx` dosyası indirir.

**Demo giriş:** mock modda herhangi bir kullanıcı adı ve şifre kabul edilir (JWT yerel üretilir).

## Gerçek backend ile

`.env` içinde `VITE_USE_MOCK=false` yapın ve `VITE_API_BASE_URL` değerini API sunucunuzun kök adresine ayarlayın (ör. `http://localhost:3000`).
