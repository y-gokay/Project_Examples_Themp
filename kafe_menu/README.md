# Kafe Menü

QR kod aracılığıyla erişilebilen dijital kafe menüsü yönetim sistemi. Mekan yöneticileri kategorileri, ürünleri ve fiyatları bu panelden yönetir.

## Teknoloji

- React 19 + Vite + TypeScript
- Zustand
- TanStack React Query
- Axios

## Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → panel sahte menü verileriyle çalışır.

Demo giriş (mock modda her bilgi çalışır):
- **E-posta:** admin@example.com
- **Şifre:** herhangi bir değer

## Gerçek Backend ile Çalıştırma

`.env` dosyasında:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK=false
```
