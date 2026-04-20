# Psikolog Randevu Sistemi

Online psikolog randevu yönetim sistemi. Kullanıcılar psikolog seçip randevu oluşturabilir; psikologlar randevularını, notlarını ve blog yazılarını yönetebilir.

## Yapı

```
Psikolog Randevu/
├── frontend/   → React 19 + Vite (kullanıcı arayüzü)
└── backend/    → Express 5 + PostgreSQL (API sunucusu)
```

## Frontend — Demo Modu (backend gerekmez)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Backend — Docker ile Kurulum

```bash
cd backend
cp .env.example .env
# .env dosyasını açıp DB_PASSWORD, JWT_SECRET ve ADMIN_PASSWORD değerlerini belirleyin
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Demo hesaplar (seed sonrası):
| Rol | E-posta | Şifre |
|---|---|---|
| Admin | admin@pdr.com | `.env`'deki `ADMIN_PASSWORD` |
| Psikolog | zeynep@pdr.com | psikolog123 |
| Kullanıcı | ahmet@test.com | kullanici123 |

## Detaylar

- [Frontend README](./frontend/README.md)
- [Backend .env.example](./backend/.env.example)
