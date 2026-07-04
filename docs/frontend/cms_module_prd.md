# PRD Modul CMS — Detail Endpoint untuk Frontend

Dokumen **self-contained** untuk tim frontend membangun UI admin panel + website publik. Semua endpoint, payload, dan response di sini **diambil dari server yang sudah berjalan** (bukan menebak).

- **Base API:** `${VITE_API_URL}` = `http://localhost:3000/api/v1`
- **Base gambar:** `${VITE_API_ORIGIN}/public/<folder>/<filename>` (folder: `site`, `page`, `unit`, `testimoni`)
- **Status backend:** ✅ migration sudah `up to date`, ✅ seed sudah dijalankan (group menu `CMS` + 7 menu + 21 permission aktif).
- **Status frontend:** ✅ **Panel admin CMS + Website publik selesai** (semua endpoint `/cms/*` dan `/public/*` dikonsumsi, per 4 Juli 2026). Kolom "FE" menandai status.

---

## 0. Peta Status Implementasi

Legenda FE: ⛔ belum dibuat · 🟡 sebagian · ✅ sudah

| # | Fitur | Endpoint publik | Endpoint admin | FE |
|---|-------|-----------------|----------------|----|
| 1 | Site Settings | `GET /public/site-settings` | `GET/PUT /cms/site-settings` + upload logo/favicon | ✅ |
| 2 | Beranda (7 section) | `GET /public/homepage` | `GET/PUT /cms/homepage/{section}` + hero-image | ✅ |
| 3 | Tentang (5 section) | `GET /public/about` | `GET/PUT /cms/about/{section}` + hero-image | ✅ |
| 4 | Header Katalog | `GET /public/catalog-page` | `GET/PUT /cms/catalog-page` | ✅ |
| 5 | Header Kontak | `GET /public/contact-page` | `GET/PUT /cms/contact-page` | ✅ |
| 6 | Katalog publik | `GET /public/catalog*` | — | ✅ |
| 7 | Kelola tayang katalog | — | `GET /cms/catalog`, `PATCH .../publish`, galeri foto | ✅ |
| 8 | Testimoni | `GET /public/testimonials` | CRUD `/cms/testimonials*` | ✅ |
| 9 | Pesan Kontak | `POST /public/contact-messages` | inbox `/cms/contact-messages*` | ✅ |
| 10 | Simulasi Kredit | `GET /public/.../config`, `POST /.../calculate` | `GET/PUT /cms/.../config` | ✅ |
| 11 | Upload generik | — | `POST /cms/uploads/{page,site,testimoni}` | ✅ (`uploadCmsImage`) |

**Belum dikerjakan di backend** (opsional, bukan blocker): hapus file fisik lama saat ganti logo/avatar/hero; rate-limit form kontak; SEO meta per halaman; preview draft; automated test.

---

## 1. Konvensi

### Envelope
```json
{ "success": true, "message": "...", "data": {} }
```
List menambah: `"meta": { "page": 1, "limit": 20, "total": 57, "totalPages": 3 }`.

### Error
```json
{ "success": false, "message": "...", "error": { "code": "VALIDATION_ERROR", "details": [ { "field": "title", "message": "..." } ] } }
```
HTTP: `400` file wajib · `401` token · `403` permission · `404` tidak ada · `409` konflik · `422` validasi.

### Auth
Endpoint `/cms/*` wajib header `Authorization: Bearer <accessToken>` (dari `POST /api/v1/auth/login`). Endpoint `/public/*` tanpa auth.

### Aturan data
- `icon` = string nama **lucide-react** (mis. `"shield-check"`) → map via `iconMap` FE.
- `titleHtml` = pakai `<em>` untuk teks warna primary (render `<em>` → warna primary, bukan `innerHTML`).
- `isVisible` (boolean) ada di tiap section → jika `false`, FE **skip render** section.
- Nilai `"auto"` pada `stats[].value` sudah **di-resolve server** saat GET publik (mis. `"1+"` = jumlah unit tayang / unit terjual).
- Upload: `multipart/form-data`, field **`image`**, maks 5MB, JPG/JPEG/PNG. **Jangan** set `Content-Type` manual.
- URL gambar: `imageUrl(folder, filename)` = `${VITE_API_ORIGIN}/public/${folder}/${filename}`.

---

## 2. SITE SETTINGS

Global untuk **header, footer, halaman kontak**. Singleton (selalu 1 record).

### 2.1 `GET /public/site-settings` · publik
Alias identik: `GET /public/contact-info`.

**Response:**
```json
{
  "success": true, "message": "Pengaturan situs berhasil diambil",
  "data": {
    "companyName": "", "tagline": "",
    "logoFilename": null, "faviconFilename": null,
    "footerDescription": null,
    "navContactLabel": "Hubungi Kami",
    "navLinks": [
      { "label": "Beranda", "path": "/" },
      { "label": "Katalog", "path": "/katalog" },
      { "label": "Simulasi", "path": "/simulasi" },
      { "label": "Tentang", "path": "/tentang" },
      { "label": "Kontak", "path": "/kontak" }
    ],
    "whatsappNumber": null, "phone": null, "email": null, "address": null,
    "businessHours": null, "mapEmbedUrl": null, "mapLat": null, "mapLng": null,
    "social": { "instagram": null, "facebook": null, "tiktok": null, "website": null },
    "copyrightText": "© 2026"
  }
}
```
Catatan FE: menu header/footer dari `navLinks` (fallback default sudah terisi). Logo → `imageUrl('site', logoFilename)`. WhatsApp → `https://wa.me/${whatsappNumber}`.

### 2.2 `GET /cms/site-settings` · `SITE_SETTING_READ`
Mengembalikan record mentah (field kolom, tanpa pembungkus `social`): `companyName, tagline, logoFilename, faviconFilename, footerDescription, navContactLabel, navLinks, whatsappNumber, phone, email, address, businessHours, mapEmbedUrl, mapLat, mapLng, socialInstagram, socialFacebook, socialTiktok, socialWebsite, copyrightText`.

### 2.3 `PUT /cms/site-settings` · `SITE_SETTING_UPDATE`
Partial — kirim minimal 1 field.
**Body:**
```json
{
  "companyName": "GM Mobilindo",
  "tagline": "Used Car Specialist",
  "footerDescription": "Showroom mobil bekas terpercaya...",
  "navContactLabel": "Hubungi Kami",
  "navLinks": [ { "label": "Beranda", "path": "/" }, { "label": "Katalog", "path": "/katalog" } ],
  "whatsappNumber": "628000000000",
  "phone": "021-1500-888", "email": "halo@gmmobilindo.id",
  "address": "Jl. Raya Otomotif No. 88, Jakarta",
  "businessHours": "Senin–Sabtu, 09.00–18.00 WIB",
  "mapEmbedUrl": "https://www.google.com/maps/embed?...",
  "mapLat": -6.2, "mapLng": 106.8,
  "socialInstagram": "https://instagram.com/...",
  "socialFacebook": null, "socialTiktok": null, "socialWebsite": null,
  "copyrightText": "© 2026 GM Mobilindo"
}
```

### 2.4 Upload logo / favicon · `SITE_SETTING_UPDATE`
- `POST /cms/site-settings/logo` — multipart `image`
- `POST /cms/site-settings/favicon` — multipart `image`

**Response:** `{ "filename": "abc.png", "setting": { ...record terbaru } }` (filename otomatis tersimpan di record).

**Alur admin:** buka form → GET → edit → PUT → (opsional) upload logo/favicon.

---

## 3. BERANDA (per-section, 7 section)

Section: **`hero`, `brands`, `why-us`, `how-it-works`, `featured`, `testimonials`, `cta`**. Permission: `HOMEPAGE_READ` / `HOMEPAGE_UPDATE`.

**Alur admin:** tiap section = form terpisah → `GET /cms/homepage/<section>` → edit → `PUT /cms/homepage/<section>` (tidak menyentuh section lain). Toggle tampil via `isVisible` di body PUT.
**Alur publik:** cukup **1×** `GET /public/homepage` (semua section + data dinamis sudah terisi).

### 3.1 `GET /public/homepage` · publik (agregat) — **response nyata:**
```json
{
  "hero": {
    "badgeText": "Used Car Specialist #1",
    "titleHtml": "Mobil Bekas <em>Berkualitas</em>, Tanpa Drama",
    "subtitle": "Ratusan unit terinspeksi, bergaransi, dan siap pakai...",
    "primaryCtaLabel": "Jelajahi Katalog", "primaryCtaLink": "/katalog",
    "secondaryCtaLabel": "Simulasi Kredit", "secondaryCtaLink": "/simulasi",
    "imageFilename": null,
    "floatingCard": { "icon": "shield-check", "title": "Garansi Mesin", "subtitle": "Inspeksi 150+ titik" },
    "stats": [
      { "value": "1+", "label": "Unit Tersedia" },
      { "value": "4.9", "label": "Rating Pelanggan" },
      { "value": "10+", "label": "Tahun Pengalaman" }
    ],
    "isVisible": true
  },
  "brands": {
    "label": "Merek populer:", "mode": "auto", "limit": 6, "isVisible": true,
    "items": [ { "id": "615f5193-...", "name": "Suzuki" } ]
  },
  "whyUs": {
    "eyebrow": "Kenapa Kami", "title": "Beli Mobil Bekas Jadi Tenang", "subtitle": "...",
    "items": [ { "icon": "shield-check", "title": "Bergaransi & Terpercaya", "desc": "..." } ],
    "isVisible": true
  },
  "howItWorks": {
    "eyebrow": "Cara Kerja", "title": "4 Langkah Mudah", "subtitle": "...",
    "steps": [ { "icon": "file-search", "title": "Cari & Bandingkan", "desc": "..." } ],
    "isVisible": true
  },
  "featured": {
    "eyebrow": "Pilihan Terbaik", "title": "Unit Unggulan",
    "seeAllLabel": "Lihat Semua", "seeAllLink": "/katalog",
    "mode": "auto", "limit": 4, "isVisible": true,
    "units": [ /* array KARTU KATALOG — lihat §7.1 */ ]
  },
  "testimonials": {
    "eyebrow": "Testimoni", "title": "Kata Mereka", "subtitle": "...", "limit": 3,
    "isVisible": true,
    "items": [ /* array testimoni — lihat §8 */ ]
  },
  "cta": {
    "title": "Siap Membawa Pulang Mobil Idaman?", "subtitle": "...",
    "primaryLabel": "Lihat Katalog", "primaryLink": "/katalog",
    "secondaryLabel": "Hubungi Sales", "secondaryLink": "whatsapp",
    "isVisible": true
  }
}
```
Catatan FE:
- `hero.imageFilename` → `imageUrl('page', ...)`.
- `brands.items` → chip link `/katalog?merek=<id>`.
- `featured.units` & `testimonials.items` **sudah terisi** — tidak perlu request lain untuk beranda.
- `cta.secondaryLink === "whatsapp"` → `https://wa.me/${siteSettings.whatsappNumber}`.

### 3.2 `GET /cms/homepage/<section>` · `HOMEPAGE_READ`
Mengembalikan 1 section (data + `isVisible`), mis. `GET /cms/homepage/hero`.

### 3.3 `PUT /cms/homepage/<section>` · `HOMEPAGE_UPDATE`
Partial (min 1 field), `isVisible` opsional. **Body per section:**

| Section | Field body |
|---------|-----------|
| `hero` | `badgeText, titleHtml, subtitle, primaryCtaLabel, primaryCtaLink, secondaryCtaLabel, secondaryCtaLink, imageFilename, floatingCard{icon,title,subtitle}, stats[{value,label}]` — `stats[].value` boleh `"auto"` |
| `brands` | `label, mode("auto"\|"manual"), brandIds[], limit` |
| `why-us` | `eyebrow, title, subtitle, items[{icon,title,desc}]` |
| `how-it-works` | `eyebrow, title, subtitle, steps[{icon,title,desc}]` |
| `featured` | `eyebrow, title, seeAllLabel, seeAllLink, mode("auto"\|"manual"), unitIds[], limit` ← **atur jumlah unit unggulan lewat `limit`** |
| `testimonials` | `eyebrow, title, subtitle, limit` (jumlah testimoni tampil di beranda) |
| `cta` | `title, subtitle, primaryLabel, primaryLink, secondaryLabel, secondaryLink` |

Contoh set unit unggulan manual 6 unit:
```http
PUT /cms/homepage/featured
{ "mode": "manual", "unitIds": ["id1","id2","id3","id4","id5","id6"], "limit": 6 }
```
Sembunyikan section why-us: `PUT /cms/homepage/why-us` body `{ "isVisible": false }`.

### 3.4 `POST /cms/homepage/hero-image` · `HOMEPAGE_UPDATE`
Multipart `image` → otomatis set `hero.imageFilename`. Response: `{ "filename": "...", "hero": { ...section hero } }`.

---

## 4. TENTANG (per-section, 5 section)

Section: **`hero`, `stats`, `visi-misi`, `values`, `cta`**. Permission: `ABOUT_READ` / `ABOUT_UPDATE`.

### 4.1 `GET /public/about` · publik (agregat) — **response nyata:**
```json
{
  "hero": { "eyebrow": "Tentang Kami", "title": "Partner Terpercaya...", "subtitle": "...",
            "imageFilename": null, "ctaLabel": "Lihat Katalog", "ctaLink": "/katalog", "isVisible": true },
  "stats": { "items": [
      { "icon": "car", "value": "1+", "label": "Unit Terjual" },
      { "icon": "users", "value": "3.000+", "label": "Pelanggan Puas" },
      { "icon": "shield-check", "value": "100%", "label": "Unit Terinspeksi" },
      { "icon": "calendar", "value": "10+", "label": "Tahun Pengalaman" }
    ], "isVisible": true },
  "visiMisi": { "visiTitle": "Visi", "visiIcon": "eye", "visi": "...",
                "misiTitle": "Misi", "misiIcon": "target", "misi": "...", "isVisible": true },
  "values": { "eyebrow": "Nilai Kami", "title": "Yang Kami Pegang Teguh",
              "items": [ { "icon": "shield-check", "title": "Transparan", "desc": "..." } ], "isVisible": true },
  "cta": { "title": "Mulai Perjalanan Mobil Anda", "subtitle": "...",
           "primaryLabel": "Lihat Katalog", "primaryLink": "/katalog",
           "secondaryLabel": "Hubungi Kami", "secondaryLink": "/kontak", "isVisible": true }
}
```

### 4.2 Admin per-section · `ABOUT_READ` / `ABOUT_UPDATE`
- `GET/PUT /cms/about/<section>`
- `POST /cms/about/hero-image` (multipart `image`)

**Body PUT per section:**
| Section | Field |
|---------|-------|
| `hero` | `eyebrow, title, subtitle, imageFilename, ctaLabel, ctaLink` |
| `stats` | `items[{icon,value,label}]` — `value` boleh `"auto"` (total terjual) |
| `visi-misi` | `visiTitle, visiIcon, visi, misiTitle, misiIcon, misi` |
| `values` | `eyebrow, title, items[{icon,title,desc}]` |
| `cta` | `title, subtitle, primaryLabel, primaryLink, secondaryLabel, secondaryLink` |

---

## 5. HEADER HALAMAN KATALOG & KONTAK

### 5.1 Katalog · `KATALOG_READ` / `KATALOG_UPDATE`
`GET /public/catalog-page` (publik), `GET/PUT /cms/catalog-page`.

**Response nyata:**
```json
{
  "eyebrow": "Katalog",
  "title": "Temukan Mobil Bekas Berkualitas",
  "subtitle": "Semua unit terinspeksi dan siap pakai...",
  "priceRanges": [
    { "label": "< 100 Juta", "min": 0, "max": 100000000 },
    { "label": "100–150 Juta", "min": 100000000, "max": 150000000 },
    { "label": "150–200 Juta", "min": 150000000, "max": 200000000 },
    { "label": "200–300 Juta", "min": 200000000, "max": 300000000 },
    { "label": "> 300 Juta", "min": 300000000, "max": null }
  ],
  "isVisible": true
}
```
`priceRanges` = tombol filter → map ke query `hargaMin`/`hargaMax` (`max: null` = tanpa batas atas). Body PUT: field yang sama (partial).

### 5.2 Kontak · `KONTAK_READ` / `KONTAK_UPDATE`
`GET /public/contact-page` (publik), `GET/PUT /cms/contact-page`.
**Response nyata:** `{ "eyebrow": "Kontak", "title": "Kami Siap Membantu", "subtitle": "...", "isVisible": true }`. Info kontak/peta/WA diambil dari **site-settings** (§2).

---

## 6. — (dipindah, lihat §7 Katalog & §8 Testimoni)

## 7. KATALOG

Unit **dibuat di modul Inventory**, bukan CMS. Katalog publik hanya menampilkan unit **`statusUnit=READY_STOCK` + `isPublished=true`** (status katalog READY/BOOKED). Unit SOLD otomatis hilang.

### 7.1 `GET /public/catalog` · publik
**Query:** `search, merek(id|nama), transmisi(AT|MT|CVT), bahanBakar(BENSIN|DIESEL|HYBRID|LISTRIK), hargaMin, hargaMax, sort(newest|price_asc|price_desc|km_asc), page, limit` (default page=1, limit=20, max 100).

**Response nyata (kartu katalog + meta):**
```json
{
  "success": true, "message": "Daftar katalog berhasil diambil",
  "data": [
    {
      "id": "749e8831-...", "code": "749E8831",
      "merek": { "id": "615f5193-...", "name": "Suzuki" },
      "tipe": { "id": "91fb02ee-...", "name": "XL7" },
      "variant": null, "tahun": 2025, "harga": 375750000, "kilometer": 20000,
      "transmisi": "AT", "bahanBakar": null, "warna": "SILVER",
      "statusKatalog": "READY", "isNew": false,
      "image": null, "createdAt": "2026-07-04T06:19:58.898Z"
    }
  ],
  "meta": { "page": 1, "limit": 1, "total": 1, "totalPages": 1 }
}
```
`image` = foto pertama `{ filename, sortOrder }` atau `null`. Gambar → `imageUrl('unit', image.filename)`.

### 7.2 `GET /public/catalog/brands` · publik
```json
{ "success": true, "data": [ { "id": "615f5193-...", "name": "Suzuki", "count": 1 } ] }
```

### 7.3 `GET /public/catalog/:id` · publik — **response nyata:**
```json
{
  "id": "749e8831-...", "code": "749E8831",
  "merek": { "id": "...", "name": "Suzuki" }, "tipe": { "id": "...", "name": "XL7" },
  "variant": null, "tahun": 2025, "harga": 375750000, "kilometer": 20000,
  "transmisi": "AT", "bahanBakar": null, "warna": "SILVER",
  "statusKatalog": "READY", "isNew": false, "image": null,
  "createdAt": "2026-07-04T06:19:58.898Z",
  "plat": "B 8••• BJJ",
  "description": "Suzuki XL7 2025 AT, warna SILVER, 20.000 km. Unit terinspeksi dan siap pakai.",
  "images": [],
  "perlengkapan": ["Kunci Serep"],
  "dokumen": ["Kwitansi","BPKB","Pajak","STNK","Faktur"]
}
```
`description` auto bila admin belum isi. `plat` disamarkan. `images` = `[{id,filename,sortOrder}]`. Cicilan mulai = `harga * config.installmentFromFactor` (lihat §10). `404 UNIT_NOT_FOUND` bila tidak tayang.

### 7.4 `GET /public/catalog/:id/related?limit=4` · publik
Array kartu katalog (prioritas merek sama, sisanya diisi unit tayang lain).

### 7.5 Admin — kelola tayang · `KATALOG_*`
| Method | Path | Body / Fungsi |
|--------|------|---------------|
| GET | `/cms/catalog?search=&isPublished=&statusUnit=&page=&limit=` | list tabel kelola (paginated) |
| GET | `/cms/catalog/:id` | detail |
| PATCH | `/cms/catalog/:id/publish` | `{ isPublished?, isNew?, statusKatalog?("READY"\|"BOOKED"), variant?, bahanBakar?, deskripsi? }` (min 1) |
| POST | `/cms/catalog/:id/images` | multipart `image` (tambah foto galeri) |
| PATCH | `/cms/catalog/:id/images/reorder` | `{ "orderedIds": ["img1","img2","img3"] }` |
| DELETE | `/cms/catalog/:id/images/:imageId` | hapus foto (file fisik ikut terhapus) |

Row `GET /cms/catalog` berisi field admin: `id, merek, tipe, variant, tahun, platNomor, warna, transmisi, bahanBakar, kilometer, harga, statusUnit, statusKatalog, isPublished, isNew, deskripsi, imageCount, images[], updatedAt`.

**Alur admin:** buka list unit READY_STOCK → toggle `isPublished` → atur `statusKatalog`/`isNew`/`variant`/`bahanBakar`/`deskripsi` → upload & urutkan foto galeri.

---

## 8. TESTIMONI (koleksi, full CRUD) · `TESTIMONI_*`

### 8.1 `GET /public/testimonials?limit=3` · publik
```json
{ "success": true, "data": [
  { "id": "uuid", "name": "Andre P.", "role": "Karyawan Swasta", "text": "...", "rating": 5, "avatarFilename": null }
] }
```
Avatar → `imageUrl('testimoni', avatarFilename)`, fallback inisial bila null.

### 8.2 Admin
| Method | Path | Body |
|--------|------|------|
| GET | `/cms/testimonials?page=&limit=` | — (paginated, field lengkap + `isPublished`, `sortOrder`) |
| GET | `/cms/testimonials/:id` | — |
| POST | `/cms/testimonials` | `{ name*, role?, text*, rating(1-5, default 5), avatarFilename?, isPublished?, sortOrder? }` |
| PUT | `/cms/testimonials/:id` | idem (partial) |
| PATCH | `/cms/testimonials/:id/publish` | `{ "isPublished": true }` |
| POST | `/cms/testimonials/:id/avatar` | multipart `image` |
| DELETE | `/cms/testimonials/:id` | — |

---

## 9. PESAN KONTAK · `CONTACT_MESSAGE_*`

### 9.1 `POST /public/contact-messages` · publik
**Body:** `{ "name": "...", "phone": "...", "email": "...", "message": "...", "website": "" }`
- `email` opsional; `website` = **honeypot** (hidden input, biarkan kosong; jika terisi → ditolak).

**Response nyata (`201`):**
```json
{ "success": true, "message": "Pesan berhasil dikirim. Tim kami akan segera menghubungi Anda.",
  "data": { "id": "b2154e57-...", "createdAt": "2026-07-04T10:25:40.064Z" } }
```

### 9.2 Admin inbox
| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/cms/contact-messages?status=&page=&limit=` | list (filter status opsional, paginated) |
| GET | `/cms/contact-messages/count-new` | `{ "new": 3 }` untuk badge |
| GET | `/cms/contact-messages/:id` | detail |
| PATCH | `/cms/contact-messages/:id/status` | `{ "status": "READ" }` — `NEW\|READ\|REPLIED\|ARCHIVED` |
| DELETE | `/cms/contact-messages/:id` | hapus |

---

## 10. SIMULASI KREDIT · `CREDIT_SIM_*`

### 10.1 `GET /public/credit-simulation/config` · publik — **response nyata:**
```json
{
  "tenorOptions": [12,24,36,48,60],
  "dpMinPercent": 10, "dpMaxPercent": 70, "dpDefaultPercent": 20, "dpStep": 5,
  "rateMin": 2, "rateMax": 9, "rateDefault": 4.5, "rateStep": 0.5,
  "method": "FLAT", "installmentFromFactor": 0.022,
  "disclaimer": "Estimasi ilustrasi, angka final mengikuti ketentuan leasing."
}
```

### 10.2 `POST /public/credit-simulation/calculate` · publik
**Body:** `{ "price": 375750000, "dpPercent": 20, "tenor": 36, "rate": 4.5 }` (`dpPercent` & `rate` opsional, default dari config).

**Response nyata:**
```json
{
  "dp": 75150000, "pokok": 300600000, "totalBunga": 40581000,
  "totalBayar": 341181000, "cicilanPerBulan": 9477250, "method": "FLAT",
  "input": { "price": 375750000, "dpPercent": 20, "tenor": 36, "rate": 4.5 },
  "breakdown": [
    { "label": "Uang Muka (DP)", "value": 75150000 },
    { "label": "Pokok Kredit", "value": 300600000 },
    { "label": "Total Bunga", "value": 40581000 },
    { "label": "Total Pembayaran", "value": 341181000 },
    { "label": "Cicilan / Bulan", "value": 9477250 }
  ],
  "disclaimer": "..."
}
```
`dpPercent` di luar rentang config → `422 DP_OUT_OF_RANGE`. Rumus mengikuti `method` aktif (FLAT/EFEKTIF/ANUITAS) — FE tidak perlu ganti rumus saat method berubah.

### 10.3 Admin config
`GET /cms/credit-simulation/config`, `PUT /cms/credit-simulation/config` (partial). Body: `tenorOptions[], dpMinPercent, dpMaxPercent, dpDefaultPercent, dpStep, rateMin, rateMax, rateDefault, rateStep, method("FLAT"|"EFEKTIF"|"ANUITAS"), installmentFromFactor, disclaimer`.

---

## 11. UPLOAD GENERIK · admin

Untuk mengisi field `*Filename` dari form sebelum PUT section. Response: `{ "filename": "...", "folder": "...", "path": "/public/<folder>/<filename>" }`.

| Path | Permission | Folder |
|------|-----------|--------|
| `POST /cms/uploads/page` | `HOMEPAGE_UPDATE` | `page` |
| `POST /cms/uploads/site` | `SITE_SETTING_UPDATE` | `site` |
| `POST /cms/uploads/testimoni` | `TESTIMONI_CREATE` | `testimoni` |

Endpoint upload yang langsung menyimpan ke record: `/cms/site-settings/logo`, `/favicon`, `/cms/homepage/hero-image`, `/cms/about/hero-image`, `/cms/testimonials/:id/avatar`, `/cms/catalog/:id/images`.

---

## 12. Ringkasan Panggilan per Halaman Publik

| Halaman | Endpoint |
|---------|----------|
| Layout (semua) | `GET /public/site-settings` |
| Beranda | `GET /public/homepage` |
| Katalog | `GET /public/catalog-page`, `GET /public/catalog`, `GET /public/catalog/brands` |
| Detail unit | `GET /public/catalog/:id`, `GET /public/catalog/:id/related`, `GET /public/credit-simulation/config` |
| Simulasi | `GET /public/credit-simulation/config`, `POST /public/credit-simulation/calculate` |
| Tentang | `GET /public/about` |
| Kontak | `GET /public/site-settings`, `GET /public/contact-page`, `POST /public/contact-messages` |

---

## 13. Permission (RBAC) & Menu Admin

Menu CMS tampil di `GET /api/v1/menus` (group `CMS`) sesuai permission role. **Admin & Owner otomatis dapat semua.** Saat ini ter-seed: group `CMS` + 7 menu + 21 permission.

| Menu (kode) | Path FE | Permission |
|-------------|---------|-----------|
| Pengaturan Situs (`CMS_SITE_SETTING`) | `/cms/site-settings` | `SITE_SETTING_READ/UPDATE` |
| Beranda (`CMS_HOMEPAGE`) | `/cms/homepage` | `HOMEPAGE_READ/UPDATE` |
| Testimoni (`CMS_TESTIMONI`) | `/cms/testimonials` | `TESTIMONI_READ/CREATE/UPDATE/DELETE` |
| Katalog (`CMS_KATALOG`) | `/cms/catalog` | `KATALOG_READ/CREATE/UPDATE/DELETE` |
| Tentang (`CMS_ABOUT`) | `/cms/about` | `ABOUT_READ/UPDATE` |
| Kontak & Pesan (`CMS_KONTAK`) | `/cms/contact` | `KONTAK_READ/UPDATE`, `CONTACT_MESSAGE_READ/UPDATE/DELETE` |
| Simulasi Kredit (`CMS_SIMULASI`) | `/cms/credit-simulation` | `CREDIT_SIM_READ/UPDATE` |

---

## 14. Pemetaan Halaman Admin FE ↔ Endpoint (untuk dibangun)

| Halaman Admin | Endpoint | FE |
|---------------|----------|----|
| Pengaturan Situs | `/cms/site-settings` (+logo, favicon) | ⛔ |
| Beranda: Hero & CTA | `/cms/homepage/hero`, `/cms/homepage/cta` (+hero-image) | ⛔ |
| Beranda: Keunggulan/Cara Kerja/Merek/Unggulan | `/cms/homepage/{why-us,how-it-works,brands,featured}` | ⛔ |
| Beranda: Header Testimoni | `/cms/homepage/testimonials` | ⛔ |
| Testimoni (koleksi) | `/cms/testimonials*` | ⛔ |
| Tentang | `/cms/about/{hero,stats,visi-misi,values,cta}` | ⛔ |
| Header Katalog | `/cms/catalog-page` | ⛔ |
| Kelola Katalog | `/cms/catalog*` (publish, galeri) | ⛔ |
| Header & Info Kontak | `/cms/contact-page` + `/cms/site-settings` | ⛔ |
| Inbox Pesan | `/cms/contact-messages*` | ⛔ |
| Simulasi Kredit | `/cms/credit-simulation/config` | ⛔ |
```
