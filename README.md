# Proje Portföyü

Bu repo, farklı kurumlar için geliştirdiğim bazı web uygulamalarını bir arada barındırır. Her proje bağımsız olarak çalışabilir; mock modu sayesinde backend bağlantısı olmadan da demo olarak incelenebilir.

---

## Projeler

| Proje                                                           | Teknoloji                                                     | Açıklama                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| [Gençlik Merkezi](./genclik_merkezi/)                           | React 18 + Vite + Redux                                       | Belediye gençlik merkezi kullanıcı uygulaması   |
| [Gençlik Merkezi Admin Panel](./genclik_merkezi_admin_panel/)   | React 18 + Vite + Redux                                       | Gençlik merkezi yönetim paneli                  |
| [Kafe Menü](./kafe_menu/)                                       | React 19 + Vite + TypeScript + Zustand                        | QR kod ile erişilebilen dijital kafe menüsü     |
| [Kafe Menü Admin Panel](./kafe_menu_admin_panel/)               | React 19 + Vite + TypeScript                                  | Kafe menü yönetim paneli                        |
| [Kreş](./cocuk_gelisim_merkezi/)                                | Next.js + React                                               | Çocuk gelişim merkezi tanıtım ve başvuru sitesi |
| [Kreş Admin Panel](./cocuk_gelisim_merkezi_admin_panel/)        | React 18 + Vite                                               | Çocuk gelişim merkezi yönetim paneli            |
| [Psikolog Randevu](./psikolog_randevu/)                         | React 19 + Vite (frontend) / Express 5 + PostgreSQL (backend) | Psikolog randevu yönetim sistemi                |
| [Rezervasyon](./rezervasyon/)                                   | React 19 + Vite + Redux                                       | Salon/etkinlik rezervasyon sistemi              |
| [İstihdam Merkezi](./istihdam_merkezi/)                         | React 19 + Vite + Redux                                       | İş ilanı ve başvuru platformu                   |
| [İstihdam Merkezi Admin Panel](./istihdam_merkezi_admin_panel/) | React 19 + Vite                                               | İstihdam merkezi yönetim paneli                 |

---

## Demo Modunda Çalıştırma

Çoğu Vite tabanlı frontend `VITE_USE_MOCK=true` ile backend olmadan demo verisi kullanır. **Kreş** (Next.js) projesinde eşdeğer değişken `NEXT_PUBLIC_USE_MOCK=true` olarak `.env.example` içinde tanımlıdır. Her projede:

```bash
cd "Proje Adı"
cp .env.example .env
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç — uygulama demo verileriyle çalışıyor olacak.

---

## Psikolog Randevu — Backend Kurulumu

Bu proje Express.js + PostgreSQL backend'i içerir. Backend'i Docker ile ayağa kaldırmak için:

```bash
cd psikolog_randevu/backend
cp .env.example .env
# .env dosyasını açıp şifreleri değiştir
docker compose up -d
npm install
npm run migrate
npm run seed
npm run dev
```

Demo hesaplar:

- Admin: `admin@pdr.com` / `.env`'deki `ADMIN_PASSWORD`
- Psikolog: `zeynep@pdr.com` / `psikolog123`
- Kullanıcı: `ahmet@test.com` / `kullanici123`

---

## Proje Yapısı

```
Project_Examples_Themp/
├── genclik_merkezi/
├── genclik_merkezi_admin_panel/
├── kafe_menu/
├── kafe_menu_admin_panel/
├── cocuk_gelisim_merkezi/
├── cocuk_gelisim_merkezi_admin_panel/
├── psikolog_randevu/
│   ├── frontend/
│   └── backend/
├── rezervasyon/
├── istihdam_merkezi/
└── istihdam_merkezi_admin_panel/
```

---

## Lisans

MIT — Detaylar için [LICENSE](./LICENSE) dosyasına bakınız.
