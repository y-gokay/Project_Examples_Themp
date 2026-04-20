# All Jobs — Proje Portföyü

Bu repo, farklı kurumlar için geliştirdiğim web uygulamalarını bir arada barındırır. Her proje bağımsız olarak çalışabilir; mock modu sayesinde backend bağlantısı olmadan da demo olarak incelenebilir.

---

## Projeler

| Proje                                                                 | Teknoloji                                                     | Açıklama                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| [Gençlik Merkezi](./Gençlik%20Merkezi/)                               | React 18 + Vite + Redux                                       | Belediye gençlik merkezi kullanıcı uygulaması   |
| [Gençlik Merkezi Admin Panel](./Gençlik%20Merkezi%20Admin%20Panel/)   | React 18 + Vite + Redux                                       | Gençlik merkezi yönetim paneli                  |
| [Kafe Menü](./Kafe%20Menü/)                                           | React 19 + Vite + TypeScript + Zustand                        | QR kod ile erişilebilen dijital kafe menüsü     |
| [Kafe Menü Admin Panel](./Kafe%20Menü%20Admin%20Panel/)               | React 19 + Vite + TypeScript                                  | Kafe menü yönetim paneli                        |
| [Kreş](./Kreş/)                                                       | Next.js + React                                               | Çocuk gelişim merkezi tanıtım ve başvuru sitesi |
| [Kreş Admin Panel](./Kreş%20Admin%20Panel/)                           | React 18 + Vite                                               | Çocuk gelişim merkezi yönetim paneli            |
| [Psikolog Randevu](./Psikolog%20Randevu/)                             | React 19 + Vite (frontend) / Express 5 + PostgreSQL (backend) | Psikolog randevu yönetim sistemi                |
| [Rezervasyon](./Rezervasyon/)                                         | React 19 + Vite + Redux                                       | Salon/etkinlik rezervasyon sistemi              |
| [İstihdam Merkezi](./İstihdam%20Merkezi/)                             | React 19 + Vite + Redux                                       | İş ilanı ve başvuru platformu                   |
| [İstihdam Merkezi Admin Panel](./İstihdam%20Merkezi%20Admin%20Panel/) | React 19 + Vite                                               | İstihdam merkezi yönetim paneli                 |

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
cd "Psikolog Randevu/backend"
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
All_Jobs/
├── Gençlik Merkezi/
├── Gençlik Merkezi Admin Panel/
├── Kafe Menü/
├── Kafe Menü Admin Panel/
├── Çocuk Gelişim Merkezi/
├── Çocuk Gelişim Merkezi Admin Panel/
├── Psikolog Randevu/
│   ├── frontend/
│   └── backend/
├── Rezervasyon/
├── İstihdam Merkezi/
└── İstihdam Merkezi Admin Panel/
```

---

## Lisans

MIT — Detaylar için [LICENSE](./LICENSE) dosyasına bakınız.
