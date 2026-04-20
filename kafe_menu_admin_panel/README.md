# Kafe Menü — Yönetim Paneli

Belediye kafe menü sisteminin yönetim arayüzü: mekânlar, kategoriler, ürünler ve yetkili kullanıcılar.

## Teknoloji

React 19, Vite, TypeScript, TanStack Query, Zustand, shadcn/ui.

## Kurulum ve demo

```bash
cp .env.example .env
npm install
npm run dev
```

`VITE_USE_MOCK=true` iken uygulama gerçek API’ye bağlanmaz; örnek mekân, kategori ve ürün verileriyle çalışır.

## Gerçek backend ile

`.env` içinde `VITE_USE_MOCK=false` yapın ve `VITE_API_BASE_URL` değerini API sunucunuzun kök adresiyle güncelleyin.
