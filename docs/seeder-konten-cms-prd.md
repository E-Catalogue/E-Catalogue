# PRD: Seeder Konten CMS — Halaman Publik (Customer)

> **Tujuan**: Dokumen ini mendeskripsikan **seluruh konten statis/CMS** yang perlu di-*seed* agar halaman-halaman publik (customer) tidak tampil kosong saat pertama kali deploy. Dengan PRD ini, backend developer bisa langsung membuat seeder tanpa harus melihat kode frontend.
>
> **Referensi API**: Dokumen ini disesuaikan dengan response aktual dari endpoint yang sudah berjalan di backend, sesuai spesifikasi di [`docs/prd/cms_prd.md`](docs/prd/cms_prd.md) dan [`docs/frontend/cms_module_prd.md`](docs/frontend/cms_module_prd.md).

> **PENTING**: Halaman **Katalog** dan **Simulasi Kredit** mengambil data unit dari master `units` — BUKAN dari seeder CMS, jadi data unit tidak tercakup di sini. Yang di-seed hanya konten "pembungkus" (header, konfigurasi UI) dan konten informatif (teks, testimoni).

---

## Daftar Endpoint Publik yang Perlu Di-Seed

| # | Endpoint Publik | Tabel/Model CMS | Halaman FE |
|---|----------------|-----------------|------------|
| 1 | `GET /public/site-settings` | `site_settings` (singleton) | Semua halaman (Navbar, Footer) |
| 2 | `GET /public/homepage` | `cms_pages` (per-section: `hero`, `brands`, `why-us`, `how-it-works`, `featured`, `testimonials`, `cta`) | Beranda |
| 3 | `GET /public/about` | `cms_pages` (per-section: `hero`, `stats`, `visi-misi`, `values`, `cta`) | Tentang |
| 4 | `GET /public/contact-page` | `cms_pages` (key: `contact`) | Kontak (header saja) |
| 5 | `GET /public/catalog-page` | `cms_pages` (key: `catalog`) | Katalog (header + filter harga) |
| 6 | `GET /public/credit-simulation/config` | `credit_sim_config` (singleton) | Simulasi Kredit (config UI) |
| 7 | `GET /public/testimonials` | `testimonials` (koleksi) | Beranda (section testimoni) |

> **Catatan arsitektur**: Endpoint publik agregat (`/public/homepage`, `/public/about`) menggabungkan semua section dalam 1 response. Admin mengatur per-section via `GET/PUT /cms/<page>/<section>`. Lihat §0.5 di `cms_prd.md`.

---

## 1. Site Settings (Singleton)

**Endpoint admin**: `PUT /cms/site-settings` (permission: `SITE_SETTING_UPDATE`)
**Endpoint publik**: `GET /public/site-settings`

**Dipakai di**: Navbar (logo, nama, tagline, menu navigasi, tombol WA), Footer (deskripsi, kontak, sosial media, copyright), Halaman Kontak (alamat, telepon, email, peta).

### Seed Data — Format Admin (flat, tanpa pembungkus `social`)

> Di endpoint admin, field sosial disimpan **flat** (`socialInstagram`, `socialFacebook`, dst). Di endpoint publik, field ini dibungkus dalam objek `social: { instagram, facebook, tiktok, website }`.

```json
{
  "companyName": "GM Mobilindo",
  "tagline": "Used Car Specialist",
  "logoFilename": null,
  "faviconFilename": null,
  "footerDescription": "Showroom mobil bekas terpercaya dengan layanan bergaransi, inspeksi menyeluruh, dan harga transparan untuk mobil impian Anda.",
  "navContactLabel": "Hubungi Kami",
  "navLinks": [
    { "label": "Beranda", "path": "/" },
    { "label": "Katalog", "path": "/katalog" },
    { "label": "Simulasi", "path": "/simulasi" },
    { "label": "Tentang", "path": "/tentang" },
    { "label": "Kontak", "path": "/kontak" }
  ],
  "whatsappNumber": "628123456789",
  "phone": "021-1500-888",
  "email": "halo@gmmobilindo.id",
  "address": "Jl. Raya Otomotif No. 88, Jakarta Selatan 12345",
  "businessHours": "Senin–Sabtu, 09.00–18.00 WIB",
  "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!...",
  "mapLat": -6.2,
  "mapLng": 106.8,
  "socialInstagram": "https://instagram.com/gmmobilindo",
  "socialFacebook": "https://facebook.com/gmmobilindo",
  "socialTiktok": null,
  "socialWebsite": "https://gmmobilindo.id",
  "copyrightText": "© 2026 GM Mobilindo"
}
```

### Penjelasan Field (bentuk DB / admin)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `companyName` | string | Nama showroom, tampil di navbar & footer |
| `tagline` | string | Sub-judul kecil di bawah nama perusahaan |
| `logoFilename` | string \| null | Nama file logo (upload via `POST /cms/site-settings/logo`). `null` = tampil ikon mobil default |
| `faviconFilename` | string \| null | Favicon browser (upload via `POST /cms/site-settings/favicon`) |
| `footerDescription` | string \| null | Paragraf deskripsi di kolom kiri footer |
| `navContactLabel` | string | Label tombol CTA di navbar (misal: "Hubungi Kami") |
| `navLinks` | array `{ label, path }` | Daftar link navigasi header & footer |
| `whatsappNumber` | string \| null | Nomor WA (format internasional tanpa `+`). Dipakai untuk tombol WA & halaman kontak → `https://wa.me/{whatsappNumber}` |
| `phone` | string \| null | Nomor telepon tampil di footer & halaman kontak |
| `email` | string \| null | Email tampil di footer & halaman kontak |
| `address` | string \| null | Alamat showroom tampil di footer & halaman kontak |
| `businessHours` | string \| null | Jam operasional tampil di halaman kontak |
| `mapEmbedUrl` | string \| null | URL embed Google Maps / OpenStreetMap |
| `mapLat`, `mapLng` | number \| null | Koordinat lokasi |
| `socialInstagram` | string \| null | URL Instagram (di publik tampil sebagai `social.instagram`) |
| `socialFacebook` | string \| null | URL Facebook |
| `socialTiktok` | string \| null | URL TikTok |
| `socialWebsite` | string \| null | URL website utama |
| `copyrightText` | string \| null | Teks copyright di footer. Default: `"© {tahun}"` |

---

## 2. Halaman Beranda — 7 Section

**Endpoint publik (agregat)**: `GET /public/homepage` — mengembalikan seluruh 7 section sekaligus.
**Endpoint admin (per-section)**: `GET/PUT /cms/homepage/<section>` (permission: `HOMEPAGE_READ`/`HOMEPAGE_UPDATE`)

> Setiap section memiliki flag `isVisible` (boolean). Jika `false`, frontend tidak merender section tersebut.

---

### 2.1 Section `hero` — Banner Utama

**Admin endpoint**: `GET/PUT /cms/homepage/hero` + `POST /cms/homepage/hero-image` (upload gambar)

```json
{
  "isVisible": true,
  "badgeText": "Used Car Specialist #1",
  "titleHtml": "Mobil Bekas <em>Berkualitas</em>, Tanpa Drama",
  "subtitle": "Ratusan unit terinspeksi, bergaransi, dan siap pakai. Harga transparan, tanpa biaya tersembunyi.",
  "primaryCtaLabel": "Jelajahi Katalog",
  "primaryCtaLink": "/katalog",
  "secondaryCtaLabel": "Simulasi Kredit",
  "secondaryCtaLink": "/simulasi",
  "imageFilename": null,
  "floatingCard": {
    "icon": "shield-check",
    "title": "Garansi Mesin",
    "subtitle": "Inspeksi 150+ titik"
  },
  "stats": [
    { "value": "auto", "label": "Unit Tersedia" },
    { "value": "4.9", "label": "Rating Pelanggan" },
    { "value": "10+", "label": "Tahun Pengalaman" }
  ]
}
```

**Catatan field**:
- `titleHtml`: Teks yang dibungkus `<em>...</em>` ditampilkan dengan warna primary (highlight). Frontend parse `<em>` → span warna, **bukan** innerHTML.
- `primaryCtaLink` / `secondaryCtaLink`: Path internal (`/katalog`, `/simulasi`) atau string `"whatsapp"` (frontend resolve ke URL WA dari Site Settings).
- `imageFilename`: `null` = gambar placeholder. Upload via `POST /cms/homepage/hero-image`. Gambar diakses: `${API_ORIGIN}/public/page/{filename}`.
- `floatingCard.icon`: Nama ikon `lucide-react` format kebab-case.
- `stats[].value`: String — bisa berisi `"auto"` (server auto-resolve saat GET publik, mis. jumlah unit tayang menjadi `"1+"`), atau hardcode `"4.9"`, `"10+"`, dll.

---

### 2.2 Section `brands` — Merek Populer (Chips)

**Admin endpoint**: `GET/PUT /cms/homepage/brands`

```json
{
  "isVisible": true,
  "label": "Merek populer:",
  "mode": "auto",
  "brandIds": [],
  "limit": 6
}
```

**Catatan**:
- `mode: "auto"` → backend otomatis mengisi `items` dari merek yang punya unit published (tayang). `limit` menentukan jumlah chip ditampilkan.
- `mode: "manual"` → backend mengisi `items` dari `brandIds` (array ID dari tabel master `merek`).
- Di response publik, field `items` berisi `[{ id, name }]` — diisi otomatis oleh backend, **tidak perlu di-seed**.

---

### 2.3 Section `why-us` — Kenapa Memilih Kami (4 Kartu Fitur)

**Admin endpoint**: `GET/PUT /cms/homepage/why-us`

```json
{
  "isVisible": true,
  "eyebrow": "Kenapa Kami",
  "title": "Beli Mobil Bekas Jadi Tenang",
  "subtitle": "Setiap unit terinspeksi, bergaransi, dan siap pakai. Tanpa drama, tanpa biaya tersembunyi.",
  "items": [
    {
      "icon": "shield-check",
      "title": "Bergaransi & Terpercaya",
      "desc": "Setiap unit lolos inspeksi 150+ titik dan bergaransi mesin hingga 1 tahun."
    },
    {
      "icon": "hand-coins",
      "title": "Harga Transparan",
      "desc": "Tanpa biaya tersembunyi. Harga yang tertera sudah final dan bersaing."
    },
    {
      "icon": "wrench",
      "title": "Rekondisi Profesional",
      "desc": "Body, mesin & interior dirawat oleh teknisi berpengalaman sebelum dijual."
    },
    {
      "icon": "badge-check",
      "title": "Surat Lengkap & Aman",
      "desc": "Semua dokumen terverifikasi. BPKB, STNK, faktur, dan kunci serep lengkap."
    }
  ]
}
```

**Catatan**: `items[].icon` — nama ikon `lucide-react` dalam format kebab-case. Layout frontend: grid 4 kartu.

---

### 2.4 Section `how-it-works` — Cara Kerja / 4 Langkah Mudah

**Admin endpoint**: `GET/PUT /cms/homepage/how-it-works`

```json
{
  "isVisible": true,
  "eyebrow": "Cara Kerja",
  "title": "4 Langkah Mudah",
  "subtitle": "Dari browsing sampai tangan pertama, prosesnya transparan.",
  "steps": [
    {
      "icon": "file-search",
      "title": "Cari & Bandingkan",
      "desc": "Jelajahi katalog online kami, filter sesuai budget dan preferensi Anda."
    },
    {
      "icon": "scan-eye",
      "title": "Cek & Inspeksi",
      "desc": "Datang ke showroom, lihat langsung kondisi mobil dan hasil inspeksi 150+ titik."
    },
    {
      "icon": "calculator",
      "title": "Ajukan Kredit / Cash",
      "desc": "Pilih metode pembayaran. Kami bantu proses kredit dengan leasing terpercaya."
    },
    {
      "icon": "key-round",
      "title": "Terima Kunci",
      "desc": "Setelah pembayaran, mobil siap dibawa pulang lengkap dengan garansi kami."
    }
  ]
}
```

**Catatan**: Field `steps` (bukan `items`). Ditampilkan bernomor 01–04 di frontend.

---

### 2.5 Section `featured` — Unit Unggulan

**Admin endpoint**: `GET/PUT /cms/homepage/featured`

```json
{
  "isVisible": true,
  "eyebrow": "Pilihan Terbaik",
  "title": "Unit Unggulan",
  "seeAllLabel": "Lihat Semua",
  "seeAllLink": "/katalog",
  "mode": "auto",
  "unitIds": [],
  "limit": 4
}
```

**Catatan**:
- `mode: "auto"` → backend mengisi `units` dari unit `statusUnit=READY_STOCK`, `isPublished=true`, diurutkan terbaru. `limit` menentukan jumlah kartu.
- `mode: "manual"` → backend mengisi dari `unitIds` (array UUID unit). Contoh: `PUT /cms/homepage/featured { "mode": "manual", "unitIds": ["id1","id2","id3","id4"], "limit": 4 }`.
- Di response publik, field `units` berisi array **kartu katalog** (lihat §5.2 di `cms_prd.md`) — **tidak perlu di-seed**.

---

### 2.6 Section `testimonials` — Header Testimoni

**Admin endpoint**: `GET/PUT /cms/homepage/testimonials`

```json
{
  "isVisible": true,
  "eyebrow": "Testimoni",
  "title": "Kata Mereka",
  "subtitle": "Kepuasan pelanggan adalah prioritas utama kami.",
  "limit": 3
}
```

**Catatan**:
- `limit` = jumlah testimoni yang ditampilkan di beranda (default 3).
- Di response publik, field `items` diisi otomatis dari tabel `testimonials` (yang `isPublished = true`, diambil sejumlah `limit`, diurutkan `sortOrder`).
- Isi testimoni di-seed terpisah — lihat bagian **2.6.2** di bawah.

### 2.6.2 Data Testimoni (Tabel Terpisah — Koleksi)

**Admin endpoint**: `POST /cms/testimonials` (permission: `TESTIMONI_CREATE`)
**Publik endpoint**: `GET /public/testimonials?limit=3`

Tabel `testimonials` perlu di-seed dengan minimal **6 data** agar halaman beranda dan endpoint publik tidak kosong:

```json
[
  {
    "name": "Budi Santoso",
    "role": "Pengusaha, Jakarta",
    "text": "Proses beli mobil di GM Mobilindo sangat mudah dan transparan. Mobilnya sesuai deskripsi, surat-surat lengkap. Sangat memuaskan!",
    "rating": 5,
    "avatarFilename": null,
    "isPublished": true,
    "sortOrder": 1
  },
  {
    "name": "Siti Rahayu",
    "role": "Ibu Rumah Tangga, Bekasi",
    "text": "Awalnya ragu beli mobil bekas, tapi setelah lihat hasil inspeksi 150 titik dan dapat garansi mesin, jadi yakin. Terima kasih GM Mobilindo!",
    "rating": 5,
    "avatarFilename": null,
    "isPublished": true,
    "sortOrder": 2
  },
  {
    "name": "Andi Prasetyo",
    "role": "Karyawan Swasta, Tangerang",
    "text": "Harga kompetitif, kondisi mobil prima, dan proses kreditnya dibantu sampai selesai. Recommended banget!",
    "rating": 5,
    "avatarFilename": null,
    "isPublished": true,
    "sortOrder": 3
  },
  {
    "name": "Dewi Lestari",
    "role": "Dokter, Depok",
    "text": "Cari mobil keluarga yang aman dan nyaman, ketemu di sini. Pelayanannya ramah dan profesional dari awal sampai akhir.",
    "rating": 4,
    "avatarFilename": null,
    "isPublished": true,
    "sortOrder": 4
  },
  {
    "name": "Rizky Hidayat",
    "role": "Freelancer, Bogor",
    "text": "Sudah 2 kali beli mobil di sini. Kualitas konsisten, after-sales juga bagus. Pasti balik lagi kalau mau upgrade.",
    "rating": 5,
    "avatarFilename": null,
    "isPublished": true,
    "sortOrder": 5
  },
  {
    "name": "Linda Wijaya",
    "role": "Guru, Jakarta Barat",
    "text": "Mobilnya bersih, terawat, dan harga sesuai pasaran. Senang sekali bisa dapat mobil impian tanpa ribet.",
    "rating": 4,
    "avatarFilename": null,
    "isPublished": true,
    "sortOrder": 6
  }
]
```

| Field | Tipe | Keterangan |
|-------|------|------------|
| `name` | string (wajib) | Nama pelanggan |
| `role` | string \| null | Profesi / kota |
| `text` | string (wajib) | Isi testimoni |
| `rating` | number 1–5 (default 5) | Rating bintang |
| `avatarFilename` | string \| null | File foto profil (upload via `POST /cms/testimonials/:id/avatar`, folder `testimoni`). `null` = tampil inisial nama |
| `isPublished` | boolean | Apakah ditampilkan di website publik |
| `sortOrder` | number | Urutan tampil (ascending) |

---

### 2.7 Section `cta` — Call to Action Bawah

**Admin endpoint**: `GET/PUT /cms/homepage/cta`

```json
{
  "isVisible": true,
  "title": "Siap Membawa Pulang Mobil Idaman?",
  "subtitle": "Telusuri katalog kami atau hubungi tim untuk konsultasi gratis. Tanpa komitmen.",
  "primaryLabel": "Lihat Katalog",
  "primaryLink": "/katalog",
  "secondaryLabel": "Hubungi Sales",
  "secondaryLink": "whatsapp"
}
```

**Catatan**: Jika `secondaryLink` bernilai `"whatsapp"`, frontend me-resolve ke `https://wa.me/{siteSettings.whatsappNumber}`.

---

## 3. Halaman Tentang — 5 Section

**Endpoint publik (agregat)**: `GET /public/about`
**Endpoint admin (per-section)**: `GET/PUT /cms/about/<section>` (permission: `ABOUT_READ`/`ABOUT_UPDATE`)

---

### 3.1 Section `hero` — Hero Tentang Kami

**Admin endpoint**: `GET/PUT /cms/about/hero` + `POST /cms/about/hero-image` (upload gambar)

```json
{
  "isVisible": true,
  "eyebrow": "Tentang Kami",
  "title": "Partner Terpercaya untuk Mobil Bekas Anda",
  "subtitle": "GM Mobilindo hadir untuk menghapus keraguan dalam membeli mobil bekas. Kami percaya setiap orang berhak mendapatkan mobil berkualitas dengan harga jujur dan pelayanan yang tulus.",
  "imageFilename": null,
  "ctaLabel": "Lihat Katalog",
  "ctaLink": "/katalog"
}
```

**Catatan**: `imageFilename` → `${API_ORIGIN}/public/page/{filename}`. Upload via `POST /cms/about/hero-image`.

---

### 3.2 Section `stats` — Statistik Perusahaan

**Admin endpoint**: `GET/PUT /cms/about/stats`

```json
{
  "isVisible": true,
  "items": [
    { "icon": "car", "value": "auto", "label": "Unit Terjual" },
    { "icon": "users", "value": "3.000+", "label": "Pelanggan Puas" },
    { "icon": "shield-check", "value": "100%", "label": "Unit Terinspeksi" },
    { "icon": "calendar", "value": "10+", "label": "Tahun Pengalaman" }
  ]
}
```

**Catatan**: `value: "auto"` → server auto-resolve saat GET publik (mis. hitung jumlah unit terjual, tampil sebagai `"1+"`). Nilai hardcode tidak berubah.

---

### 3.3 Section `visi-misi` — Visi & Misi

**Admin endpoint**: `GET/PUT /cms/about/visi-misi`

```json
{
  "isVisible": true,
  "visiTitle": "Visi",
  "visiIcon": "eye",
  "visi": "Menjadi showroom mobil bekas paling terpercaya dan transparan di Indonesia, pilihan utama setiap keluarga.",
  "misiTitle": "Misi",
  "misiIcon": "target",
  "misi": "Menyediakan mobil bekas berkualitas yang terinspeksi & bergaransi, dengan harga jujur dan layanan yang memudahkan setiap pelanggan."
}
```

---

### 3.4 Section `values` — Nilai-Nilai Perusahaan

**Admin endpoint**: `GET/PUT /cms/about/values`

```json
{
  "isVisible": true,
  "eyebrow": "Nilai Kami",
  "title": "Yang Kami Pegang Teguh",
  "items": [
    {
      "icon": "shield-check",
      "title": "Transparan",
      "desc": "Kondisi & riwayat mobil kami sampaikan apa adanya. Tanpa biaya tersembunyi."
    },
    {
      "icon": "heart",
      "title": "Mengutamakan Pelanggan",
      "desc": "Kepuasan dan kepercayaan Anda adalah prioritas utama kami."
    },
    {
      "icon": "award",
      "title": "Kualitas Terjamin",
      "desc": "Setiap unit melalui inspeksi & rekondisi sebelum dipasarkan."
    }
  ]
}
```

---

### 3.5 Section `cta` — CTA Bawah Halaman Tentang

**Admin endpoint**: `GET/PUT /cms/about/cta`

```json
{
  "isVisible": true,
  "title": "Mulai Perjalanan Mobil Anda",
  "subtitle": "Telusuri katalog kami atau hubungi tim untuk konsultasi gratis.",
  "primaryLabel": "Lihat Katalog",
  "primaryLink": "/katalog",
  "secondaryLabel": "Hubungi Kami",
  "secondaryLink": "/kontak"
}
```

---

## 4. Halaman Kontak — Header

**Endpoint admin**: `GET/PUT /cms/contact-page` (permission: `KONTAK_READ`/`KONTAK_UPDATE`)
**Endpoint publik**: `GET /public/contact-page`

> Konten info kontak (alamat, telepon, email, jam buka, peta, WhatsApp) diambil dari **Site Settings** (§1). Endpoint ini hanya menyimpan **header halaman**.

```json
{
  "eyebrow": "Kontak",
  "title": "Kami Siap Membantu",
  "subtitle": "Punya pertanyaan tentang unit, kredit, atau test drive? Hubungi kami kapan saja.",
  "isVisible": true
}
```

---

## 5. Halaman Katalog — Header + Filter Harga

**Endpoint admin**: `GET/PUT /cms/catalog-page` (permission: `KATALOG_READ`/`KATALOG_UPDATE`)
**Endpoint publik**: `GET /public/catalog-page`

> Data unit mobil diambil dari master `units` via `GET /public/catalog`. Endpoint ini hanya menyimpan **header dan konfigurasi filter harga**.

```json
{
  "eyebrow": "Katalog",
  "title": "Temukan Mobil Bekas Berkualitas",
  "subtitle": "Semua unit terinspeksi dan siap pakai. Filter sesuai kebutuhan Anda.",
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

**Catatan**: `priceRanges` digunakan frontend sebagai tombol-tombol filter → di-map ke query parameter `hargaMin`/`hargaMax`. `max: null` = tanpa batas atas.

---

## 6. Simulasi Kredit — Config (Singleton)

**Endpoint admin**: `GET/PUT /cms/credit-simulation/config` (permission: `CREDIT_SIM_READ`/`CREDIT_SIM_UPDATE`)
**Endpoint publik**: `GET /public/credit-simulation/config`

> Ini bukan konten teks, melainkan **konfigurasi parameter UI** kalkulator simulasi kredit. Data unit mobil untuk dropdown diambil dari `GET /public/catalog`.

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

| Field | Tipe | Keterangan |
|-------|------|------------|
| `tenorOptions` | number[] | Pilihan tenor (bulan) yang bisa dipilih customer |
| `dpMinPercent` / `dpMaxPercent` | number | Range slider uang muka (%) |
| `dpDefaultPercent` | number | Nilai default slider DP saat halaman pertama kali dibuka |
| `dpStep` | number | Langkah slider DP (misal 5 = 10%, 15%, 20%, ...) |
| `rateMin` / `rateMax` | number | Range slider bunga per tahun (%) |
| `rateDefault` | number | Nilai default bunga |
| `rateStep` | number | Langkah slider bunga (misal 0.5) |
| `method` | enum `FLAT` \| `EFEKTIF` \| `ANUITAS` | Metode perhitungan bunga aktif. Backend menentukan rumus; frontend tidak perlu ubah kode saat method berubah |
| `installmentFromFactor` | number | Faktor untuk menampilkan "Cicilan mulai Rp X/bln" di kartu unit (harga × factor) |
| `disclaimer` | string | Teks disclaimer di bawah hasil kalkulasi |

---

## Ringkasan Checklist Seeder

| # | Data | Admin Endpoint | Jumlah Record |
|---|------|----------------|:---:|
| 1 | Site Settings | `PUT /cms/site-settings` | 1 (singleton) |
| 2 | Homepage Hero | `PUT /cms/homepage/hero` | 1 (section) |
| 3 | Homepage Brands | `PUT /cms/homepage/brands` | 1 (section, mode auto) |
| 4 | Homepage Why Us | `PUT /cms/homepage/why-us` | 1 (section + 4 items) |
| 5 | Homepage How It Works | `PUT /cms/homepage/how-it-works` | 1 (section + 4 steps) |
| 6 | Homepage Featured | `PUT /cms/homepage/featured` | 1 (section, mode auto) |
| 7 | Homepage Testimonials Header | `PUT /cms/homepage/testimonials` | 1 (section) |
| 8 | Homepage CTA | `PUT /cms/homepage/cta` | 1 (section) |
| 9 | Testimoni (koleksi) | `POST /cms/testimonials` | 6 record |
| 10 | About Hero | `PUT /cms/about/hero` | 1 (section) |
| 11 | About Stats | `PUT /cms/about/stats` | 1 (section + 4 items) |
| 12 | About Visi Misi | `PUT /cms/about/visi-misi` | 1 (section) |
| 13 | About Values | `PUT /cms/about/values` | 1 (section + 3 items) |
| 14 | About CTA | `PUT /cms/about/cta` | 1 (section) |
| 15 | Contact Page Header | `PUT /cms/contact-page` | 1 (section) |
| 16 | Catalog Page Header | `PUT /cms/catalog-page` | 1 (section) |
| 17 | Credit Sim Config | `PUT /cms/credit-simulation/config` | 1 (singleton) |

---

## Catatan untuk Backend Developer

1. **Semua `icon` menggunakan nama lucide-react format kebab-case** (contoh: `shield-check`, `hand-coins`, `badge-check`, `key-round`, `file-search`, `scan-eye`, `calculator`). Frontend punya `iconMap` yang me-resolve nama ini ke ikon yang sesuai.

2. **`imageFilename` = null pada seed** — Artinya belum ada gambar yang di-upload. Frontend akan menampilkan gambar placeholder. Admin bisa upload gambar nanti via endpoint upload masing-masing (mis. `POST /cms/homepage/hero-image`, `POST /cms/about/hero-image`). Gambar diakses di `${API_ORIGIN}/public/<folder>/<filename>`, folder: `site`, `page`, `unit`, `testimoni`.

3. **Section dengan `mode: "auto"`** (brands, featured) — Backend cukup seed konfigurasi header-nya saja. Field `items` / `units` di response publik akan diisi otomatis berdasarkan data master yang sudah ada (unit tayang / merek aktif).

4. **`stats[].value = "auto"`** — Backend otomatis menghitung nilai saat `GET /public/homepage` atau `GET /public/about` (mis. jumlah unit tayang). Seeder cukup set string `"auto"`.

5. **`isVisible: true`** pada setiap section — Pastikan semua section bernilai `true` agar tidak ada yang tersembunyi saat pertama kali deploy.

6. **Urutan seed yang disarankan**:
   1. Site Settings (singleton)
   2. Credit Sim Config (singleton)
   3. Homepage sections (7 PUT)
   4. About sections (5 PUT)
   5. Contact Page header (1 PUT)
   6. Catalog Page header (1 PUT)
   7. Testimonials (6 POST)

7. **Tabel yang TIDAK perlu di-seed dari CMS**: `units`, `merek`, `tipe`, dan data master lainnya — karena itu sudah punya seeder tersendiri di modul Master Data / Inventory.

8. **Site Settings: field sosial di DB vs publik** — Di database/admin, field sosial disimpan flat (`socialInstagram`, `socialFacebook`, dll). Di response publik (`GET /public/site-settings`), field ini dibungkus dalam objek `social: { instagram, facebook, tiktok, website }`. Seeder mengisi bentuk flat (kolom DB).

---

## Appendix: Analisis Konten Hardcode vs Dinamis (Persiapan Skala SaaS)

Mengingat project ini direncanakan untuk model bisnis **SaaS (Software as a Service)** di mana aplikasi akan dilisensikan dan dikustomisasi (white-label) untuk banyak klien berbeda, ada beberapa komponen frontend yang saat ini masih statis/hardcode. Berikut analisis dan rekomendasinya:

### 1. Tema Visual (Warna & Font)
- **Status Saat Ini**: Warna utama (`primary`, `surface`, `ink`, dll) di-hardcode menggunakan variabel CSS Tailwind di file `index.css`.
- **Rekomendasi (SaaS)**: **WAJIB DINAMIS**. Setiap klien SaaS (showroom mobil lain) pasti punya identitas visual (branding) yang berbeda. 
- **Setup API (Backend)**: Tambahkan field `theme_color_primary` (misal: `#0ea5e9`), `theme_color_secondary`, dan `theme_font_family` ke tabel `site_settings`. Admin CMS cukup memilih **satu warna dasar HEX** per kategori via *Color Picker*. API tidak perlu pusing menghitung variasi warna hover/gelap.
- **Setup UI (Frontend)**: Frontend membaca warna HEX dari API. Menggunakan library ringan seperti `tinycolor2` atau `color2k`, frontend secara dinamis akan mengkonversi HEX ke HSL, menghitung variasi warna (seperti `-dark` atau `-light`), lalu meng-inject CSS variables tersebut ke dalam tag `<style>` di document root saat render. Ini akan menimpa nilai default dari `index.css` di sisi klien (browser) tanpa perlu proses *build* ulang.

### 2. Navigasi Utama (Menu Header)
- **Status Saat Ini**: Frontend sudah membaca menu navigasi dinamis dari `siteSettings.navLinks` (di `PublicLayout.tsx`). Namun masih ada fallback hardcode di `publicNav.ts`.
- **Rekomendasi (SaaS)**: Konfigurasi via DB sudah cukup. Karena struktur di API sudah ada, pastikan CMS admin memiliki antarmuka (UI) untuk melakukan **CRUD menu navigasi** agar tiap client bisa atur menu dan path mereka sendiri tanpa menyentuh kode.

### 3. Header Halaman Simulasi Kredit
- **Status Saat Ini**: Teks utama seperti "Simulasi Kredit" dan "Hitung Estimasi Cicilan Anda" masih hardcode di `SimulasiPage.tsx`. Config CMS saat ini hanya mengatur *angka* simulasi, bukan teks headernya.
- **Rekomendasi (SaaS)**: **Sebaiknya Dinamis**. Tambahkan `eyebrow`, `title`, dan `subtitle` ke dalam config `credit_sim_config` (mirip seperti Header Kontak / Katalog). Client mungkin ingin menggunakan istilah lain seperti "Kalkulator Cicilan" atau bahasa yang berbeda.

### 4. Teks Form Kontak & Label Standar
- **Status Saat Ini**: Teks input label (Nama, No. Telepon, Pesan), placeholder form (mis. "0812-xxxx-xxxx"), button CTA "Kirim Pesan", serta notifikasi "Pesan Terkirim!" masih hardcode di frontend.
- **Rekomendasi (SaaS)**: **HARDCODE SUDAH CUKUP**. Teks form standar seperti ini tidak perlu di-CMS-kan karena akan sangat merepotkan admin (terlalu banyak field mikro). Jika SaaS akan menargetkan klien mancanegara, cukup atasi menggunakan library *i18n* (Internationalization) di sisi frontend (misal: bahasa ID / EN).

### 5. Empty State & Teks Notifikasi
- **Status Saat Ini**: Teks seperti "Tidak ada unit yang ditemukan" pada pencarian katalog atau pesan error dari API, ditangani secara lokal (statis) oleh komponen frontend.
- **Rekomendasi (SaaS)**: **HARDCODE SUDAH CUKUP**. Seperti form, notifikasi operasional sistem sebaiknya di-handle via translation layer (i18n) dan tidak perlu jadi konfigurasi per-tenant/klien.

### 6. Ikon Sosial Media di Footer
- **Status Saat Ini**: Mendukung 4 media sosial via site settings (Instagram, Facebook, Tiktok, Website).
- **Rekomendasi (SaaS)**: Untuk tahap awal sudah cukup, namun di masa depan jika klien butuh sosmed tambahan (misal: Youtube, Twitter/X, Linkedin), menambahkan kolom flat `social_youtube` di database tidak akan scalable. Solusi jangka panjang: Ubah `social` menjadi array of objects di backend `[{ platform: 'youtube', url: '...' }]` ketimbang kolom flat di `site_settings`.

### Kesimpulan untuk Tim API Backend

Jika API ingin benar-benar siap untuk SaaS multi-tenant, Anda perlu melakukan penyesuaian pada **dua endpoint**. Berikut adalah contoh mendetail struktur JSON yang disarankan agar frontend dapat mengkonsumsinya dengan mudah:

#### 1. Update Endpoint: `GET /public/site-settings`
**Perubahan**: Tambahkan konfigurasi tema visual (`theme`) dan ubah field sosial media menjadi struktur *array of objects* agar lebih *scalable* saat client meminta penambahan platform baru.

**Contoh Response yang Diharapkan:**
```json
{
  "success": true,
  "data": {
    "companyName": "GM Mobilindo",
    "tagline": "Used Car Specialist",
    "logoFilename": null,
    "faviconFilename": null,
    "footerDescription": "Showroom mobil bekas terpercaya...",
    "navContactLabel": "Hubungi Kami",
    "navLinks": [
      { "label": "Beranda", "path": "/" },
      { "label": "Katalog", "path": "/katalog" }
    ],
    "whatsappNumber": "628000000000",
    "phone": "021-1500-888",
    "email": "halo@gmmobilindo.id",
    "address": "Jl. Raya Otomotif No. 88, Jakarta",
    "businessHours": "Senin–Sabtu, 09.00–18.00 WIB",
    "mapEmbedUrl": "https://www.google.com/maps/embed?...",
    "mapLat": -6.2, 
    "mapLng": 106.8,
    "copyrightText": "© 2026 GM Mobilindo",
    
    // [BARU] 1. Konfigurasi Tema (SaaS Branding)
    "theme": {
      "colorPrimary": "#0ea5e9", // Untuk warna tombol utama, teks highlight, dll
      "colorSecondary": "#10b981", // Untuk warna aksen (misal: badge, tombol WA)
      "fontFamily": "Inter, sans-serif" // Opsional: jika client bisa pilih font
    },

    // [MODIFIKASI] 2. Social Media menjadi Array
    // Dulu: "social": { "instagram": "...", "facebook": "..." }
    // Sekarang menjadi dinamis agar admin bisa tambah sosmed apapun (Youtube, X, dll):
    "socialLinks": [
      { "platform": "instagram", "url": "https://instagram.com/..." },
      { "platform": "facebook", "url": "https://facebook.com/..." },
      { "platform": "youtube", "url": "https://youtube.com/@..." }
    ]
  }
}
```
*Tentu endpoint untuk admin (`GET/PUT /cms/site-settings`) juga harus disesuaikan untuk mengelola struktur data baru di atas.*

#### 2. Update Endpoint: `GET /public/credit-simulation/config`
**Perubahan**: Tambahkan field header (`eyebrow`, `title`, `subtitle`) agar teks pada halaman Simulasi Kredit dapat disesuaikan oleh masing-masing tenant.

**Contoh Response yang Diharapkan:**
```json
{
  "success": true,
  "data": {
    // [BARU] Header halaman simulasi
    "eyebrow": "Simulasi",
    "title": "Hitung Estimasi Cicilan Anda",
    "subtitle": "Kalkulator kredit transparan untuk membantu merencanakan keuangan Anda.",
    
    // Field yang sudah ada
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
}
```

Dengan kedua perubahan di atas, frontend sudah 100% siap untuk di-*deploy* sebagai *white-label* SaaS. Frontend akan membaca `theme.colorPrimary` dari API dan meng-inject-nya langsung ke dalam CSS aplikasi, sehingga seketika mengubah warna *brand* tanpa perlu *build* ulang!
