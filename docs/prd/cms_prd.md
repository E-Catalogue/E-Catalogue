# PRD — Content Management System (CMS) E-Catalogue (Per-Section, v2)

**Tujuan:** Spesifikasi CMS **detail per-section** yang **menyesuaikan layout situs publik saat ini**, agar admin bisa mengatur **seluruh konten** tiap section, dan backend bisa membangun endpoint yang granular.

**Perubahan dari v1:** endpoint tidak lagi monolitik (`PUT /cms/homepage` sekaligus). Tiap **section punya endpoint GET/PUT sendiri** (`/cms/homepage/hero`, `/cms/homepage/why-us`, dst). Halaman publik tetap punya **satu endpoint agregat** (`GET /public/homepage`) untuk sekali render.

**Sumber layout (acuan field):**

- Global → `PublicLayout.tsx` (header + footer), `publicNav.ts`
- Beranda → `LandingPage.tsx` (7 section)
- Tentang → `TentangPage.tsx` (5 section)
- Kontak → `KontakPage.tsx`
- Simulasi → `SimulasiPage.tsx` + `KatalogDetailPage.tsx` (`SimulasiInline`)
- Katalog → `KatalogPage.tsx`, `KatalogDetailPage.tsx`
- Data unit → modul **Inventory** (master unit sudah ada)

---

## 0. Konvensi

### 0.1 Envelope & Error

```json
{ "success": true, "message": "OK", "data": {} }
```

List memakai `meta` (`page, limit, total, totalPages`). Error: `{ success:false, message, error:{code, details} }`. HTTP: 400/401/403/404/409/422.

### 0.2 Auth

- **Publik** `/api/v1/public/*` → tanpa auth, `GET` (kecuali submit form kontak). Hanya data published.
- **Admin** `/api/v1/cms/*` → `Authorization: Bearer <token>` + permission per section.

### 0.3 Gambar

Dilayani di root origin: `${API_ORIGIN}/public/<folder>/<filename>` (folder: `site`, `page`, `unit`, `testimoni`). Upload multipart field **`image`** → response `{ filename }`.

### 0.4 Icon & Rich Text

- `icon`: **string nama lucide-react** (`"shield-check"`, `"car"`, `"file-search"`, …). Frontend punya `iconMap`.
- `titleHtml`: `<em>...</em>` menandai teks warna primary (frontend render `<em>` → warna primary; parser aman, bukan innerHTML).

### 0.5 Pola Section-based

Untuk halaman multi-section (Beranda, Tentang):

- **Admin**: `GET /cms/<page>/<section>` + `PUT /cms/<page>/<section>` → 1 section per request.
- **Publik**: `GET /public/<page>` → seluruh section (sudah resolve auto-value & data unit) dalam 1 response.
- Section bisa punya flag `isVisible` (boolean) untuk sembunyikan section dari situs tanpa hapus data.

---

## 1. GLOBAL — Site Settings (Header, Footer, Kontak)

Dipakai di **semua halaman**: navbar (logo, nama, tagline, tombol Hubungi), footer (deskripsi, sosial, kontak, copyright), halaman Kontak, dan link WhatsApp global.

### Field

| Field                                                     | Tipe         | Dipakai di              | Contoh                                |
| --------------------------------------------------------- | ------------ | ----------------------- | ------------------------------------- |
| `companyName`                                             | string       | navbar, footer          | "GM MOBILINDO"                        |
| `tagline`                                                 | string       | navbar, footer          | "Used Car Specialist"                 |
| `logoFilename`                                            | string\|null | navbar, footer          | (fallback ikon mobil)                 |
| `faviconFilename`                                         | string\|null | `<head>`                |                                       |
| `footerDescription`                                       | string       | footer                  | "Showroom mobil bekas berkualitas..." |
| `navContactLabel`                                         | string       | tombol navbar           | "Hubungi Kami"                        |
| `whatsappNumber`                                          | string       | tombol navbar/footer/WA | "628000000000"                        |
| `phone`                                                   | string       | footer, kontak          | "021-1500-888"                        |
| `email`                                                   | string       | footer, kontak          | "halo@gmmobilindo.id"                 |
| `address`                                                 | string       | footer, kontak          | "Jl. Raya Otomotif No. 88, Jakarta"   |
| `businessHours`                                           | string       | kontak                  | "Senin–Sabtu, 09.00–18.00 WIB"        |
| `mapEmbedUrl`                                             | string\|null | kontak                  | URL embed peta                        |
| `social.instagram` / `.facebook` / `.tiktok` / `.website` | string\|null | footer                  | URL                                   |
| `copyrightText`                                           | string\|null | footer                  | default "© {th} {companyName}"        |

### Endpoint

| Method | Path                         | Auth                                      |
| ------ | ---------------------------- | ----------------------------------------- |
| GET    | `/public/site-settings`      | publik                                    |
| GET    | `/cms/site-settings`         | `SITE_SETTING_READ`                       |
| PUT    | `/cms/site-settings`         | `SITE_SETTING_UPDATE`                     |
| POST   | `/cms/site-settings/logo`    | `SITE_SETTING_UPDATE` (multipart `image`) |
| POST   | `/cms/site-settings/favicon` | `SITE_SETTING_UPDATE` (multipart `image`) |

> **Menu navigasi** (Beranda/Katalog/Simulasi/Tentang/Kontak) untuk saat ini **statis di frontend** (`publicNav.ts`) — tidak perlu di-CMS-kan kecuali diminta.

---

## 2. BERANDA — 7 Section

Halaman publik: **`GET /public/homepage`** → mengembalikan seluruh 7 section (section `featured` sudah berisi kartu unit; `stats` value `"auto"` sudah dihitung). Admin mengatur per-section di bawah.

Permission section beranda: `HOMEPAGE_READ` / `HOMEPAGE_UPDATE` (berlaku untuk semua sub-section).

### 2.1 Section HERO

`GET/PUT /cms/homepage/hero`

| Field                                    | Tipe         | Catatan                                                                                                                          |
| ---------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `badgeText`                              | string       | "Used Car Specialist #1"                                                                                                         |
| `titleHtml`                              | string       | "Mobil Bekas `<em>`Berkualitas`</em>`, Tanpa Drama"                                                                              |
| `subtitle`                               | string       | paragraf hero                                                                                                                    |
| `primaryCtaLabel` / `primaryCtaLink`     | string       | "Jelajahi Katalog" → `/katalog`                                                                                                  |
| `secondaryCtaLabel` / `secondaryCtaLink` | string       | "Simulasi Kredit" → `/simulasi`                                                                                                  |
| `imageFilename`                          | string\|null | folder `page`                                                                                                                    |
| `floatingCard`                           | object       | kartu badge mengambang di atas gambar: `{ icon, title, subtitle }` (mis. shield-check / "Garansi Mesin" / "Inspeksi 150+ titik") |
| `stats`                                  | array        | 3 item `{ value, label }`; `value` boleh `"auto"` (dihitung dari jumlah unit tayang)                                             |

### 2.2 Section BRAND CHIPS ("Merek populer")

`GET/PUT /cms/homepage/brands`

| Field      | Tipe             | Catatan                                         |
| ---------- | ---------------- | ----------------------------------------------- |
| `label`    | string           | "Merek populer:"                                |
| `mode`     | `auto`\|`manual` | `auto` = ambil merek terbanyak dari unit tayang |
| `brandIds` | string[]         | dipakai bila `manual` (id merek dari master)    |
| `limit`    | number           | default 6                                       |

Publik: array chip `[{ id, name }]` (link ke `/katalog?merek=<id>`).

### 2.3 Section KEUNGGULAN ("Kenapa GM Mobilindo")

`GET/PUT /cms/homepage/why-us`

| Field      | Tipe                                            |
| ---------- | ----------------------------------------------- |
| `eyebrow`  | string ("Kenapa GM Mobilindo")                  |
| `title`    | string ("Beli Mobil Bekas Jadi Tenang")         |
| `subtitle` | string                                          |
| `items`    | array `{ icon, title, desc }` (layout: 4 kartu) |

### 2.4 Section CARA KERJA ("4 Langkah Mudah")

`GET/PUT /cms/homepage/how-it-works`

| Field                            | Tipe                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| `eyebrow` / `title` / `subtitle` | string                                                                 |
| `steps`                          | array `{ icon, title, desc }` — ditampilkan bernomor 01–0n (4 langkah) |

### 2.5 Section UNIT UNGGULAN (Featured)

`GET/PUT /cms/homepage/featured`

| Field                        | Tipe             | Catatan                             |
| ---------------------------- | ---------------- | ----------------------------------- |
| `eyebrow` / `title`          | string           | "Pilihan Terbaik" / "Unit Unggulan" |
| `seeAllLabel` / `seeAllLink` | string           | "Lihat Semua" → `/katalog`          |
| `mode`                       | `auto`\|`manual` | `auto` = unit tayang terbaru        |
| `unitIds`                    | string[]         | dipakai bila `manual`               |
| `limit`                      | number           | default 4                           |

Publik: `featured.units` = array **kartu katalog** (lihat §5.2) siap render.

### 2.6 Section TESTIMONI (header + koleksi)

Header section: `GET/PUT /cms/homepage/testimonials`

| Field                            | Tipe                                     |
| -------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `eyebrow` / `title` / `subtitle` | string ("Testimoni" / "Kata Mereka" / …) |
| `limit`                          | number                                   | jumlah testimoni tampil di beranda (default 3) |

Isi testimoni = **koleksi** (§7). Publik `GET /public/homepage` menyertakan `testimonials.items` sejumlah `limit`.

### 2.7 Section CTA (ajakan bawah)

`GET/PUT /cms/homepage/cta`

| Field                              | Tipe                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| `title` / `subtitle`               | string                                                    |
| `primaryLabel` / `primaryLink`     | string                                                    |
| `secondaryLabel` / `secondaryLink` | string (link boleh `"whatsapp"` → pakai `whatsappNumber`) |

> Setiap section boleh punya `isVisible` (bool) untuk toggle tampil/sembunyi.

---

## 3. TENTANG — 5 Section

Publik: **`GET /public/about`** (agregat). Admin per-section, permission `ABOUT_READ` / `ABOUT_UPDATE`.

### 3.1 Hero — `GET/PUT /cms/about/hero`

`eyebrow`, `title`, `subtitle`, `imageFilename` (folder `page`), `ctaLabel`, `ctaLink`.

### 3.2 Statistik — `GET/PUT /cms/about/stats`

`items`: array `{ icon, value, label }` (layout: 4 kartu — Unit Terjual, Pelanggan Puas, dst). `value` boleh `"auto"`.

### 3.3 Visi & Misi — `GET/PUT /cms/about/visi-misi`

`visi` (string), `misi` (string). (Opsional `visiTitle`/`misiTitle`/`visiIcon`/`misiIcon` bila ingin atur label & ikon.)

### 3.4 Nilai (Core Values) — `GET/PUT /cms/about/values`

`eyebrow`, `title`, `items`: array `{ icon, title, desc }` (layout: 3 kartu).

### 3.5 CTA — `GET/PUT /cms/about/cta`

`title`, `subtitle`, `primaryLabel`/`primaryLink`, `secondaryLabel`/`secondaryLink`.

---

## 4. KONTAK

Layout `KontakPage.tsx`: header, kartu info (alamat/telepon/email/jam), tombol WA, peta, **form pesan**.

### 4.1 Info kontak & peta

Ambil dari **Site Settings** (§1) — `address`, `phone`, `email`, `businessHours`, `whatsappNumber`, `mapEmbedUrl`, `social`. **Tidak ada entitas terpisah.**

### 4.2 Header halaman (opsional CMS)

`GET/PUT /cms/contact-page` → `{ eyebrow, title, subtitle }` (default: "Kontak" / "Kami Siap Membantu" / …). Permission `KONTAK_READ` / `KONTAK_UPDATE`.

### 4.3 Form Pesan → Inbox (koleksi)

`POST /public/contact-messages` (publik) — body `{ name*, phone*, email, message*, website(honeypot) }`.

Admin inbox:
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/cms/contact-messages?status=` | `CONTACT_MESSAGE_READ` |
| GET | `/cms/contact-messages/count-new` | `CONTACT_MESSAGE_READ` → `{ new }` (badge) |
| PATCH | `/cms/contact-messages/:id/status` | `CONTACT_MESSAGE_UPDATE` — `{ status }` |
| DELETE | `/cms/contact-messages/:id` | `CONTACT_MESSAGE_DELETE` |

`status`: `NEW`\|`READ`\|`REPLIED`\|`ARCHIVED`.

---

## 5. KATALOG (Publik) — pakai master Inventory

Unit sumbernya dari modul **Inventory** (sudah ada). CMS hanya atur **tayang/foto/deskripsi** (lihat §8). Berikut endpoint **publik** untuk halaman customer.

### 5.1 Header halaman katalog (opsional CMS)

`GET/PUT /cms/catalog-page` → `{ eyebrow, title, subtitle, priceRanges }` di mana `priceRanges` = array `{ label, min, max }` untuk filter harga (layout `KatalogPage` punya 5 rentang). Permission `KATALOG_READ`/`KATALOG_UPDATE`.

### 5.2 List katalog

`GET /public/catalog` — query: `search, merek, transmisi(AT|MT|CVT), bahanBakar(BENSIN|DIESEL|HYBRID|LISTRIK), hargaMin, hargaMax, sort(newest|price_asc|price_desc|km_asc), page, limit`.

Response = array **kartu katalog**:

```json
{
  "id": "uuid",
  "code": "1A2B3C4D",
  "merek": { "id": "..", "name": "Toyota" },
  "tipe": { "id": "..", "name": "Avanza" },
  "variant": "1.5 G",
  "tahun": 2020,
  "harga": 185000000,
  "kilometer": 45000,
  "transmisi": "AT",
  "bahanBakar": "BENSIN",
  "warna": "Silver",
  "statusKatalog": "READY",
  "isNew": false,
  "image": { "filename": "unit1.jpg" },
  "createdAt": "..."
}
```

### 5.3 Merek untuk filter

`GET /public/catalog/brands` → `[{ id, name, count }]`.

### 5.4 Detail unit

`GET /public/catalog/:id` → kartu + `plat` (disamarkan), `description` (auto bila kosong), `images: [{ id, filename, sortOrder }]`, `perlengkapan`/`dokumen` bila ada. `404 UNIT_NOT_FOUND` jika tidak tayang.

Detail juga butuh angka "Cicilan mulai" → hitung dari **config simulasi** (§6), bukan hardcode.

### 5.5 Unit serupa

`GET /public/catalog/:id/related?limit=4` → array kartu (prioritas merek sama).

---

## 6. SIMULASI KREDIT — Rules & Rumus dari API

Layout: halaman `SimulasiPage` + `SimulasiInline` di detail. **Rumus & aturan harus dari API** agar dinamis.

### 6.1 Config (parameter UI)

`GET /public/credit-simulation/config`

```json
{
  "tenorOptions": [12, 24, 36, 48, 60],
  "dpMinPercent": 10,
  "dpMaxPercent": 70,
  "dpDefaultPercent": 20,
  "dpStep": 5,
  "rateMin": 2,
  "rateMax": 9,
  "rateDefault": 4.5,
  "rateStep": 0.5,
  "method": "FLAT",
  "installmentFromFactor": 0.022,
  "disclaimer": "Estimasi ilustrasi, angka final mengikuti ketentuan leasing."
}
```

- `method`: `FLAT` \| `EFEKTIF` \| `ANUITAS` (backend yang tentukan rumus aktif).
- `installmentFromFactor`: faktor "cicilan mulai" di kartu harga detail (ganti angka hardcode `0.022`).

Admin: `GET/PUT /cms/credit-simulation/config` (`CREDIT_SIM_READ`/`CREDIT_SIM_UPDATE`).

### 6.2 Hitung di server (rumus dinamis) — **direkomendasikan**

`POST /public/credit-simulation/calculate`

```json
// request
{ "price": 185000000, "dpPercent": 20, "tenor": 36, "rate": 4.5 }
// response.data
{
  "dp": 37000000, "pokok": 148000000, "totalBunga": 19980000,
  "totalBayar": 167980000, "cicilanPerBulan": 4666111,
  "method": "FLAT", "breakdown": [ { "label": "Pokok Kredit", "value": 148000000 } ]
}
```

> Dengan endpoint ini, saat backend ganti `method` (flat→anuitas), frontend tidak perlu ubah rumus. Frontend boleh tetap punya rumus flat fallback untuk slider real-time, lalu konfirmasi angka final via `calculate`.

Rumus flat (referensi, sesuai frontend sekarang):

```
dp=price*dpPercent/100; pokok=price-dp;
totalBunga=pokok*(rate/100)*(tenor/12);
cicilan=(pokok+totalBunga)/tenor
```

---

## 7. TESTIMONI (Koleksi)

Dipakai section beranda §2.6. Full CRUD admin.

| Field            | Tipe                                                |
| ---------------- | --------------------------------------------------- |
| `id`             | uuid                                                |
| `name*`          | string                                              |
| `role`           | string\|null                                        |
| `text*`          | string                                              |
| `rating`         | 1–5                                                 |
| `avatarFilename` | string\|null (folder `testimoni`; fallback inisial) |
| `isPublished`    | bool                                                |
| `sortOrder`      | int                                                 |

| Method | Path                            | Permission                             |
| ------ | ------------------------------- | -------------------------------------- |
| GET    | `/public/testimonials?limit=`   | publik (published)                     |
| GET    | `/cms/testimonials`             | `TESTIMONI_READ`                       |
| POST   | `/cms/testimonials`             | `TESTIMONI_CREATE`                     |
| PUT    | `/cms/testimonials/:id`         | `TESTIMONI_UPDATE`                     |
| PATCH  | `/cms/testimonials/:id/publish` | `TESTIMONI_UPDATE` — `{ isPublished }` |
| POST   | `/cms/testimonials/:id/avatar`  | `TESTIMONI_UPDATE` (multipart)         |
| DELETE | `/cms/testimonials/:id`         | `TESTIMONI_DELETE`                     |

---

## 8. KATALOG CMS (Kelola Tayang) — atas master Inventory

CMS **tidak** membuat unit (dibuat di Inventory). Hanya atur visibilitas, badge, status katalog, deskripsi, galeri.

| Method | Path                                                         | Permission                                                                                       |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| GET    | `/cms/catalog?search=&isPublished=&statusUnit=&page=&limit=` | `KATALOG_READ`                                                                                   |
| GET    | `/cms/catalog/:id`                                           | `KATALOG_READ`                                                                                   |
| PATCH  | `/cms/catalog/:id/publish`                                   | `KATALOG_UPDATE` — `{ isPublished?, isNew?, statusKatalog?, variant?, bahanBakar?, deskripsi? }` |
| POST   | `/cms/catalog/:id/images`                                    | `KATALOG_UPDATE` (multipart)                                                                     |
| PATCH  | `/cms/catalog/:id/images/reorder`                            | `KATALOG_UPDATE` — `{ orderedIds }`                                                              |
| DELETE | `/cms/catalog/:id/images/:imageId`                           | `KATALOG_UPDATE`                                                                                 |

---

## 9. Ringkasan Endpoint Publik (per halaman)

| Halaman        | Endpoint                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Semua (layout) | `GET /public/site-settings`                                                                                              |
| Beranda        | `GET /public/homepage` _(hero, brands, why-us, how-it-works, featured+units, testimonials+items, cta — semua sekaligus)_ |
| Katalog        | `GET /public/catalog`, `GET /public/catalog/brands`, `GET /public/catalog-page`                                          |
| Detail Unit    | `GET /public/catalog/:id`, `GET /public/catalog/:id/related`, `GET /public/credit-simulation/config`                     |
| Simulasi       | `GET /public/credit-simulation/config`, `POST /public/credit-simulation/calculate`, `GET /public/catalog?limit=100`      |
| Tentang        | `GET /public/about`                                                                                                      |
| Kontak         | `GET /public/site-settings`, `GET /public/contact-page`, `POST /public/contact-messages`                                 |

---

## 10. Ringkasan Endpoint Admin (per-section)

| Grup          | Endpoint (GET+PUT kecuali disebut)                                                                                        | Permission                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Site Settings | `/cms/site-settings` (+logo,favicon)                                                                                      | `SITE_SETTING_*`                |
| Beranda       | `/cms/homepage/hero`, `/brands`, `/why-us`, `/how-it-works`, `/featured`, `/testimonials`, `/cta` (+`/hero-image` upload) | `HOMEPAGE_*`                    |
| Tentang       | `/cms/about/hero`, `/stats`, `/visi-misi`, `/values`, `/cta` (+`/hero-image` upload)                                      | `ABOUT_*`                       |
| Kontak        | `/cms/contact-page`; inbox `/cms/contact-messages*`                                                                       | `KONTAK_*`, `CONTACT_MESSAGE_*` |
| Katalog       | `/cms/catalog-page`; `/cms/catalog*` (publish/images)                                                                     | `KATALOG_*`                     |
| Simulasi      | `/cms/credit-simulation/config`                                                                                           | `CREDIT_SIM_*`                  |
| Testimoni     | `/cms/testimonials*`                                                                                                      | `TESTIMONI_*`                   |

---

## 11. Permission Codes

| Modul                    | Codes                                                                        |
| ------------------------ | ---------------------------------------------------------------------------- |
| Site Settings            | `SITE_SETTING_READ`, `SITE_SETTING_UPDATE`                                   |
| Homepage (semua section) | `HOMEPAGE_READ`, `HOMEPAGE_UPDATE`                                           |
| About (semua section)    | `ABOUT_READ`, `ABOUT_UPDATE`                                                 |
| Kontak (header)          | `KONTAK_READ`, `KONTAK_UPDATE`                                               |
| Pesan Kontak             | `CONTACT_MESSAGE_READ`, `CONTACT_MESSAGE_UPDATE`, `CONTACT_MESSAGE_DELETE`   |
| Katalog                  | `KATALOG_READ`, `KATALOG_CREATE`, `KATALOG_UPDATE`, `KATALOG_DELETE`         |
| Simulasi                 | `CREDIT_SIM_READ`, `CREDIT_SIM_UPDATE`                                       |
| Testimoni                | `TESTIMONI_READ`, `TESTIMONI_CREATE`, `TESTIMONI_UPDATE`, `TESTIMONI_DELETE` |

---

## 12. Pemetaan Halaman Admin ↔ Section (kondisi FE saat ini)

| Halaman Admin (FE)                | Section CMS                                                        | Status FE                                      |
| --------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| **Banner & Hero** (`BannerPage`)  | `/cms/homepage/hero` (+ stats, floatingCard) & `/cms/homepage/cta` | wired (monolitik v1 — perlu pisah per-section) |
| — _(belum ada halaman)_           | `/cms/homepage/why-us`, `/how-it-works`, `/brands`, `/featured`    | **belum ada UI**                               |
| **Testimoni** (`TestimoniPage`)   | koleksi `/cms/testimonials` + header `/cms/homepage/testimonials`  | wired (koleksi)                                |
| **Profil** (`ProfilPage`)         | `/cms/about/*` (visi-misi, stats, values)                          | wired (monolitik v1)                           |
| — _(belum ada)_                   | `/cms/about/hero`, `/cms/about/cta`                                | **belum ada UI**                               |
| **Info Kontak** (`KontakCmsPage`) | `/cms/site-settings` (+ `/cms/contact-page`)                       | wired                                          |
| — _(belum ada)_                   | Inbox `/cms/contact-messages`                                      | **belum ada UI**                               |
| **Katalog** (`KatalogPage` CMS)   | `/cms/catalog*` (+ `/cms/catalog-page`)                            | wired                                          |
| — _(belum ada)_                   | `/cms/credit-simulation/config`                                    | **belum ada UI**                               |

---

## 13. Catatan Penting untuk Backend

1. **Per-section PUT**: tiap section berdiri sendiri; update satu section tidak menyentuh section lain (hindari race & timpa data).
2. **Publik agregat**: `GET /public/homepage` & `/public/about` menggabungkan semua section + resolve `auto`/unit. Frontend cukup 1 request per halaman.
3. **`auto` values**: `stats.value === "auto"` dihitung server (mis. jumlah unit tayang, total terjual).
4. **Simulasi**: sediakan `POST .../calculate` agar rumus dinamis; `method` + `installmentFromFactor` di config.
5. **Katalog**: sumber unit = master Inventory; flag `isPublished`/foto/`deskripsi` milik CMS.
6. **Icon**: simpan string lucide-react apa adanya.
7. **`isVisible` per section** (opsional tapi disarankan): sembunyikan section tanpa hapus data.
8. **Gambar**: field `image` (multipart), served `${API_ORIGIN}/public/<folder>/<filename>`.
