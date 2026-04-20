# Gençlik Merkezi

Belediye gençlik merkezi kullanıcı uygulaması. Üyelerin kütüphane kitaplarını arayıp ödünç alabildiği, duyuruları takip edebildiği ve profil yönetimi yapabildiği web platformu.

## Teknoloji

- React 18 + Vite
- Redux Toolkit
- React Router v6

## Demo Modunda Çalıştırma (backend gerekmez)

```bash
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` → uygulama sahte verilerle çalışır. Giriş ekranında herhangi bir e-posta ve şifre kullanılabilir.

## Gerçek Backend ile Çalıştırma

`.env` dosyasında:
```
VITE_APP_API_URL=https://backend-adresiniz/api
VITE_USE_MOCK=false
```
