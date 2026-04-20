## Çocuk Gelişim Merkezi — Tanıtım ve Başvuru (Next.js)

Next.js ile geliştirilmiş çocuk gelişim merkezi tanıtım sitesi ve online başvuru formu.

### Gereksinimler

- Node.js 18+ (önerilen: 20+)
- npm veya pnpm

### Kurulum

```bash
npm install
```

### Ortam değişkenleri

```bash
cp .env.example .env
```

- `NEXT_PUBLIC_USE_MOCK=true` — Backend olmadan demo: merkez listesi, detay, gelir dilimleri ve başvuru gönderimi (başarı sayfasına yönlendirme) örnek veriyle çalışır.
- `NEXT_PUBLIC_SITE_URL` — Geliştirmede genelde `http://localhost:3000` (metadata ve görseller için taban adres).
- `NEXT_PUBLIC_API_BASE_URL` — Gerçek API kullanırken zorunlu. Mock modda placeholder (`http://localhost:3999`) yeterlidir; istek yapılmaz.

### Geliştirme

```bash
npm run dev
```

Varsayılan adres: `http://localhost:3000` (veya `.env` içindeki `PORT`).

### Production build

```bash
npm run build
npm run start
```

### Gerçek API ile

`.env` dosyasında `NEXT_PUBLIC_USE_MOCK=false` yapın ve `NEXT_PUBLIC_API_BASE_URL` değerini canlı API adresinizle güncelleyin. İsteğe bağlı olarak `NEXT_PUBLIC_API_PUBLIC_BASE_URL` ve sunucu tarafı için `API_BASE_URL_INTERNAL` tanımlayın.
