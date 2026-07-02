# PRD Integrasi Frontend — Modul CMS E-Catalogue (v2, per-section)

Panduan **lengkap & siap pakai** untuk tim frontend (React + TanStack Router/Query) mengintegrasikan modul CMS v2. Semua contoh request/response **sesuai implementasi backend nyata**.

> Arsitektur v2:
> - **Publik** (`/api/v1/public/*`) → tanpa auth. Halaman multi-section (Beranda, Tentang) punya **satu endpoint agregat** — 1 request per halaman, semua nilai dinamis (`auto`, unit unggulan, brand chips, testimoni) **sudah di-resolve server**.
> - **Admin** (`/api/v1/cms/*`) → Bearer token + permission. Tiap **section punya GET/PUT sendiri** (mis. `/cms/homepage/hero`) — update satu section tidak menyentuh section lain.
> - Setiap section punya flag **`isVisible`** untuk menyembunyikan section dari situs tanpa menghapus data.

---

## 1. Konfigurasi Dasar

### 1.1 Base URL & Env
```env
VITE_API_ORIGIN=http://localhost:3000        # origin server (untuk gambar)
VITE_API_URL=http://localhost:3000/api/v1    # base URL API
```

- **API** → `${VITE_API_URL}/public/...` atau `${VITE_API_URL}/cms/...`
- **Gambar** → `${VITE_API_ORIGIN}/public/<folder>/<filename>` — folder: `site`, `page`, `unit`, `testimoni`

> ⚠️ Gambar dilayani di **root origin** (`/public/...`), bukan di bawah `/api/v1`.

```ts
export const imageUrl = (folder: string, filename?: string | null) =>
  filename ? `${import.meta.env.VITE_API_ORIGIN}/public/${folder}/${filename}` : null;
```

### 1.2 Envelope & Error
```json
{ "success": true, "message": "OK", "data": { } }
```
List paginated menambah `meta: { page, limit, total, totalPages }`.

Error:
```json
{ "success": false, "message": "Data request tidak valid",
  "error": { "code": "VALIDATION_ERROR", "details": [ { "field": "title", "message": "..." } ] } }
```
HTTP: `400` file wajib, `401` token, `403` permission, `404` tidak ditemukan, `409` konflik, `422` validasi.

### 1.3 Auth (khusus `/cms/*`)
```
Authorization: Bearer <accessToken>
```

### 1.4 Konvensi konten
- **`icon`** = string nama lucide-react (`"shield-check"`) → dipetakan `iconMap` di frontend.
- **`titleHtml`** = pakai `<em>` untuk teks warna primary (render aman, bukan innerHTML).
- **`isVisible`** ada di setiap section — bila `false`, frontend skip render section itu.
- **Upload** = multipart field **`image`** (jangan set Content-Type manual). Maks 5 MB, JPG/JPEG/PNG.

---

## 2. ENDPOINT PUBLIK

### 2.1 Site Settings — `GET /public/site-settings` (alias `/public/contact-info`)
Dipakai layout semua halaman (header + footer + kontak):
```json
{
  "companyName": "GM Mobilindo",
  "tagline": "Used Car Specialist",
  "logoFilename": "logo.png",
  "faviconFilename": null,
  "footerDescription": "Showroom mobil bekas berkualitas...",
  "navContactLabel": "Hubungi Kami",
  "navLinks": [
    { "label": "Beranda", "path": "/" },
    { "label": "Katalog", "path": "/katalog" },
    { "label": "Simulasi", "path": "/simulasi" },
    { "label": "Tentang", "path": "/tentang" },
    { "label": "Kontak", "path": "/kontak" }
  ],
  "whatsappNumber": "628000000000",
  "phone": "021-1500-888",
  "email": "halo@gmmobilindo.id",
  "address": "Jl. Raya Otomotif No. 88, Jakarta",
  "businessHours": "Senin–Sabtu, 09.00–18.00 WIB",
  "mapEmbedUrl": null, "mapLat": null, "mapLng": null,
  "social": { "instagram": null, "facebook": null, "tiktok": null, "website": null },
  "copyrightText": "© 2026 GM Mobilindo"
}
```
- **Menu header/footer sekarang dinamis** via `navLinks` (fallback default bila admin belum atur).
- Logo: `imageUrl('site', logoFilename)`. WA: `https://wa.me/${whatsappNumber}`.

### 2.2 Beranda — `GET /public/homepage` (agregat 7 section, 1 request)
```json
{
  "hero": {
    "badgeText": "Used Car Specialist #1",
    "titleHtml": "Mobil Bekas <em>Berkualitas</em>, Tanpa Drama",
    "subtitle": "...",
    "primaryCtaLabel": "Jelajahi Katalog", "primaryCtaLink": "/katalog",
    "secondaryCtaLabel": "Simulasi Kredit", "secondaryCtaLink": "/simulasi",
    "imageFilename": "hero.jpg",
    "floatingCard": { "icon": "shield-check", "title": "Garansi Mesin", "subtitle": "Inspeksi 150+ titik" },
    "stats": [
      { "value": "120+", "label": "Unit Tersedia" },
      { "value": "4.9", "label": "Rating Pelanggan" },
      { "value": "10+", "label": "Tahun Pengalaman" }
    ],
    "isVisible": true
  },
  "brands": {
    "label": "Merek populer:",
    "mode": "auto", "limit": 6,
    "items": [ { "id": "uuid", "name": "Toyota" }, { "id": "uuid", "name": "Honda" } ],
    "isVisible": true
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
    "mode": "auto", "limit": 4,
    "units": [ /* KARTU KATALOG (§2.5) — sudah diisi server */ ],
    "isVisible": true
  },
  "testimonials": {
    "eyebrow": "Testimoni", "title": "Kata Mereka", "subtitle": "...", "limit": 3,
    "items": [ { "id": "uuid", "name": "Andre P.", "role": "Karyawan Swasta",
                 "text": "...", "rating": 5, "avatarFilename": null } ],
    "isVisible": true
  },
  "cta": {
    "title": "Siap Membawa Pulang Mobil Idaman?", "subtitle": "...",
    "primaryLabel": "Lihat Katalog", "primaryLink": "/katalog",
    "secondaryLabel": "Hubungi Sales", "secondaryLink": "whatsapp",
    "isVisible": true
  }
}
```
Catatan render:
- `hero.stats[].value === "auto"` di CMS → server sudah mengganti dengan jumlah unit tayang.
- `brands.items` → chip link ke `/katalog?merek=<id>`.
- `featured.units` & `testimonials.items` sudah terisi — **tidak perlu** request tambahan untuk beranda.
- `hero.imageFilename` → `imageUrl('page', ...)`.
- `cta.secondaryLink === "whatsapp"` → `https://wa.me/${siteSettings.whatsappNumber}`.

### 2.3 Testimoni — `GET /public/testimonials?limit=3`
Hanya published, urut `sortOrder`; `limit` opsional. (Beranda tidak perlu ini — sudah termasuk agregat.)

### 2.4 Header halaman Katalog — `GET /public/catalog-page`
```json
{
  "eyebrow": "Katalog",
  "title": "Temukan Mobil Bekas Berkualitas",
  "subtitle": "...",
  "priceRanges": [
    { "label": "< 100 Juta", "min": 0, "max": 100000000 },
    { "label": "100–150 Juta", "min": 100000000, "max": 150000000 },
    { "label": "> 300 Juta", "min": 300000000, "max": null }
  ],
  "isVisible": true
}
```
`priceRanges` = tombol filter harga → map ke query `hargaMin`/`hargaMax` (`max: null` = tanpa batas atas).

### 2.5 Katalog (list) — `GET /public/catalog`
Hanya unit **`statusUnit=READY_STOCK`** (dari master Inventory) yang **`isPublished=true`** (dari CMS) dengan status katalog READY/BOOKED. Unit yang terjual (SOLD) **otomatis hilang** dari katalog publik tanpa perlu unpublish manual.

Query: `search, merek(id|nama), transmisi(AT|MT|CVT), bahanBakar(BENSIN|DIESEL|HYBRID|LISTRIK), hargaMin, hargaMax, sort(newest|price_asc|price_desc|km_asc), page, limit` (default page=1, limit=20, max 100).

Kartu katalog (`data[]`):
```json
{
  "id": "uuid", "code": "1A2B3C4D",
  "merek": { "id": "..", "name": "Toyota" }, "tipe": { "id": "..", "name": "Avanza" },
  "variant": "1.5 G", "tahun": 2020, "harga": 185000000, "kilometer": 45000,
  "transmisi": "AT", "bahanBakar": "BENSIN", "warna": "Silver",
  "statusKatalog": "READY", "isNew": false,
  "image": { "filename": "unit1.jpg", "sortOrder": 0 },
  "createdAt": "..."
}
```
+ `meta` pagination. Gambar: `imageUrl('unit', image?.filename)`.

### 2.6 Merek untuk filter — `GET /public/catalog/brands`
`[{ "id": "uuid", "name": "Toyota", "count": 12 }]` (hanya merek yang punya unit tayang).

### 2.7 Detail unit — `GET /public/catalog/:id`
Kartu katalog + tambahan:
```json
{
  "plat": "B 1••• XYZ",
  "description": "Toyota Avanza 2020 AT, warna Silver, 45.000 km. ...",
  "images": [ { "id": "img1", "filename": "unit1.jpg", "sortOrder": 0 } ],
  "perlengkapan": ["Kunci Serep", "Manual Book"],
  "dokumen": ["BPKB", "STNK"]
}
```
- `description` otomatis bila admin belum mengisi; `plat` disamarkan.
- **"Cicilan mulai"** di kartu harga: `harga * config.installmentFromFactor` (ambil dari §2.9 — jangan hardcode 0.022).
- `404 UNIT_NOT_FOUND` bila tidak tayang.

### 2.8 Unit serupa — `GET /public/catalog/:id/related?limit=4`
Array kartu katalog; prioritas merek sama, sisanya diisi unit tayang terbaru lain.

### 2.9 Simulasi Kredit — config — `GET /public/credit-simulation/config`
```json
{
  "tenorOptions": [12,24,36,48,60],
  "dpMinPercent": 10, "dpMaxPercent": 70, "dpDefaultPercent": 20, "dpStep": 5,
  "rateMin": 2, "rateMax": 9, "rateDefault": 4.5, "rateStep": 0.5,
  "method": "FLAT",
  "installmentFromFactor": 0.022,
  "disclaimer": "Estimasi ilustrasi, angka final mengikuti ketentuan leasing."
}
```

### 2.10 Simulasi Kredit — hitung di server — `POST /public/credit-simulation/calculate`
Rumus mengikuti `method` aktif di config (FLAT/EFEKTIF/ANUITAS) — frontend tidak perlu ganti rumus saat method berubah.

Request:
```json
{ "price": 185000000, "dpPercent": 20, "tenor": 36, "rate": 4.5 }
```
`dpPercent` & `rate` opsional (default dari config). `dpPercent` di luar rentang config → `422 DP_OUT_OF_RANGE`.

Response `data`:
```json
{
  "dp": 37000000, "pokok": 148000000, "totalBunga": 19980000,
  "totalBayar": 167980000, "cicilanPerBulan": 4666111,
  "method": "FLAT",
  "input": { "price": 185000000, "dpPercent": 20, "tenor": 36, "rate": 4.5 },
  "breakdown": [
    { "label": "Uang Muka (DP)", "value": 37000000 },
    { "label": "Pokok Kredit", "value": 148000000 },
    { "label": "Total Bunga", "value": 19980000 },
    { "label": "Total Pembayaran", "value": 167980000 },
    { "label": "Cicilan / Bulan", "value": 4666111 }
  ],
  "disclaimer": "..."
}
```
> Pola disarankan: slider real-time pakai rumus flat lokal (referensi di config), angka final dikonfirmasi via `calculate` (debounce).

### 2.11 Tentang — `GET /public/about` (agregat 5 section)
```json
{
  "hero": { "eyebrow": "Tentang Kami", "title": "...", "subtitle": "...",
            "imageFilename": null, "ctaLabel": "Lihat Katalog", "ctaLink": "/katalog", "isVisible": true },
  "stats": {
    "items": [ { "icon": "car", "value": "2.500+", "label": "Unit Terjual" } ],
    "isVisible": true
  },
  "visiMisi": {
    "visiTitle": "Visi", "visiIcon": "eye", "visi": "...",
    "misiTitle": "Misi", "misiIcon": "target", "misi": "...",
    "isVisible": true
  },
  "values": { "eyebrow": "Nilai Kami", "title": "...",
              "items": [ { "icon": "shield-check", "title": "Transparan", "desc": "..." } ], "isVisible": true },
  "cta": { "title": "...", "subtitle": "...", "primaryLabel": "...", "primaryLink": "...",
           "secondaryLabel": "...", "secondaryLink": "...", "isVisible": true }
}
```
`stats.items[].value === "auto"` → server mengganti dengan total unit terjual.

### 2.12 Header halaman Kontak — `GET /public/contact-page`
```json
{ "eyebrow": "Kontak", "title": "Kami Siap Membantu", "subtitle": "...", "isVisible": true }
```
Info kontak/peta/WA → dari `site-settings` (§2.1).

### 2.13 Submit form kontak — `POST /public/contact-messages`
```json
{ "name": "Budi", "phone": "081234567890", "email": "budi@mail.com",
  "message": "Saya tertarik Avanza 2020", "website": "" }
```
`email` opsional; `website` = **honeypot** (hidden input, biarkan kosong). Response `201` → `{ id, createdAt }`.

> ℹ️ Modul **Banner sudah dihapus** di v2 — hero beranda dikelola per-section via `/cms/homepage/hero`.

---

## 3. Ringkasan Panggilan per Halaman (Publik)

| Halaman | Endpoint |
|---------|----------|
| Semua (layout) | `GET /public/site-settings` |
| Beranda | `GET /public/homepage` *(semua section + unit + testimoni sekaligus)* |
| Katalog | `GET /public/catalog-page`, `GET /public/catalog`, `GET /public/catalog/brands` |
| Detail Unit | `GET /public/catalog/:id`, `GET /public/catalog/:id/related`, `GET /public/credit-simulation/config` |
| Simulasi | `GET /public/credit-simulation/config`, `POST /public/credit-simulation/calculate`, `GET /public/catalog?limit=100` |
| Tentang | `GET /public/about` |
| Kontak | `GET /public/site-settings`, `GET /public/contact-page`, `POST /public/contact-messages` |

---

## 4. ENDPOINT CMS (Panel Admin)

Base: `${VITE_API_URL}/cms` + Bearer token.

### 4.1 Site Settings
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/cms/site-settings` | `SITE_SETTING_READ` |
| PUT | `/cms/site-settings` | `SITE_SETTING_UPDATE` |
| POST | `/cms/site-settings/logo` | `SITE_SETTING_UPDATE` (multipart `image`) |
| POST | `/cms/site-settings/favicon` | `SITE_SETTING_UPDATE` (multipart `image`) |

Body PUT (semua opsional, min 1) — termasuk field baru:
```json
{
  "companyName": "...", "tagline": "...", "footerDescription": "...",
  "navContactLabel": "Hubungi Kami",
  "navLinks": [ { "label": "Beranda", "path": "/" } ],
  "whatsappNumber": "...", "phone": "...", "email": "...", "address": "...",
  "businessHours": "...", "mapEmbedUrl": "...", "mapLat": null, "mapLng": null,
  "socialInstagram": "...", "socialFacebook": "...", "socialTiktok": "...",
  "socialWebsite": "...", "copyrightText": "..."
}
```

### 4.2 Beranda — per-section (`HOMEPAGE_READ` / `HOMEPAGE_UPDATE`)
Semua GET+PUT. PUT boleh partial (min 1 field); `isVisible` boolean opsional di semua section.

| Endpoint | Field |
|----------|-------|
| `/cms/homepage/hero` | `badgeText, titleHtml, subtitle, primaryCtaLabel/Link, secondaryCtaLabel/Link, imageFilename, floatingCard{icon,title,subtitle}, stats[{value,label}]` — `value` boleh `"auto"` |
| `/cms/homepage/brands` | `label, mode(auto\|manual), brandIds[], limit` |
| `/cms/homepage/why-us` | `eyebrow, title, subtitle, items[{icon,title,desc}]` |
| `/cms/homepage/how-it-works` | `eyebrow, title, subtitle, steps[{icon,title,desc}]` |
| `/cms/homepage/featured` | `eyebrow, title, seeAllLabel, seeAllLink, mode(auto\|manual), unitIds[], limit` ← **atur jumlah unit unggulan di sini** |
| `/cms/homepage/testimonials` | `eyebrow, title, subtitle, limit` (jumlah testimoni tampil di beranda) |
| `/cms/homepage/cta` | `title, subtitle, primaryLabel/Link, secondaryLabel/Link` (`secondaryLink` boleh `"whatsapp"`) |

Upload hero: `POST /cms/homepage/hero-image` (multipart `image`) → otomatis set `hero.imageFilename`.

Contoh — ubah jumlah unit unggulan jadi 8 + pilih manual:
```http
PUT /cms/homepage/featured
{ "mode": "manual", "unitIds": ["id1","id2","id3"], "limit": 8 }
```

### 4.3 Tentang — per-section (`ABOUT_READ` / `ABOUT_UPDATE`)
| Endpoint | Field |
|----------|-------|
| `/cms/about/hero` | `eyebrow, title, subtitle, imageFilename, ctaLabel, ctaLink` |
| `/cms/about/stats` | `items[{icon,value,label}]` — `value` boleh `"auto"` (total terjual) |
| `/cms/about/visi-misi` | `visiTitle, visiIcon, visi, misiTitle, misiIcon, misi` |
| `/cms/about/values` | `eyebrow, title, items[{icon,title,desc}]` |
| `/cms/about/cta` | `title, subtitle, primaryLabel/Link, secondaryLabel/Link` |

Upload hero: `POST /cms/about/hero-image` (multipart `image`).

### 4.4 Header Halaman Kontak & Katalog
| Method | Path | Permission | Body |
|--------|------|-----------|------|
| GET/PUT | `/cms/contact-page` | `KONTAK_READ`/`KONTAK_UPDATE` | `{ eyebrow, title, subtitle, isVisible? }` |
| GET/PUT | `/cms/catalog-page` | `KATALOG_READ`/`KATALOG_UPDATE` | `{ eyebrow, title, subtitle, priceRanges[{label,min,max}], isVisible? }` |

### 4.5 Testimoni (koleksi) — `TESTIMONI_*`
| Method | Path |
|--------|------|
| GET | `/cms/testimonials?page=&limit=` (paginated) |
| GET | `/cms/testimonials/:id` |
| POST | `/cms/testimonials` — `{ name*, role, text*, rating(1-5), avatarFilename, isPublished, sortOrder }` |
| PUT | `/cms/testimonials/:id` |
| PATCH | `/cms/testimonials/:id/publish` — `{ isPublished }` |
| POST | `/cms/testimonials/:id/avatar` (multipart `image`) |
| DELETE | `/cms/testimonials/:id` |

### 4.6 Pesan Kontak (inbox) — `CONTACT_MESSAGE_*`
| Method | Path | Ket |
|--------|------|-----|
| GET | `/cms/contact-messages?status=&page=&limit=` | filter status, paginated |
| GET | `/cms/contact-messages/count-new` | `{ "new": 3 }` untuk badge |
| GET | `/cms/contact-messages/:id` | |
| PATCH | `/cms/contact-messages/:id/status` | `{ "status": "READ" }` — `NEW\|READ\|REPLIED\|ARCHIVED` |
| DELETE | `/cms/contact-messages/:id` | |

### 4.7 Simulasi Kredit — `CREDIT_SIM_*`
GET/PUT `/cms/credit-simulation/config`. Body PUT (partial):
```json
{
  "tenorOptions": [12,24,36,48,60],
  "dpMinPercent": 10, "dpMaxPercent": 70, "dpDefaultPercent": 20, "dpStep": 5,
  "rateMin": 2, "rateMax": 9, "rateDefault": 4.5, "rateStep": 0.5,
  "method": "FLAT",              // FLAT | EFEKTIF | ANUITAS
  "installmentFromFactor": 0.022,
  "disclaimer": "..."
}
```

### 4.8 Katalog (kelola tayang) — `KATALOG_*`
Unit dibuat di modul **Inventory**; CMS hanya mengatur tayang.

| Method | Path |
|--------|------|
| GET | `/cms/catalog?search=&isPublished=&statusUnit=&page=&limit=` (paginated) |
| GET | `/cms/catalog/:id` |
| PATCH | `/cms/catalog/:id/publish` — `{ isPublished?, isNew?, statusKatalog?(READY\|BOOKED), variant?, bahanBakar?, deskripsi? }` |
| POST | `/cms/catalog/:id/images` (multipart `image`) |
| PATCH | `/cms/catalog/:id/images/reorder` — `{ "orderedIds": ["img1","img2"] }` |
| DELETE | `/cms/catalog/:id/images/:imageId` |

### 4.9 Upload Generik
Untuk mengisi field `*Filename` dari form (mis. sebelum PUT section). Response: `{ filename, folder, path }`.

| Path | Permission | Folder |
|------|-----------|--------|
| `POST /cms/uploads/page` | `HOMEPAGE_UPDATE` | `page` (hero beranda/tentang) |
| `POST /cms/uploads/site` | `SITE_SETTING_UPDATE` | `site` (logo dsb) |
| `POST /cms/uploads/testimoni` | `TESTIMONI_CREATE` | `testimoni` (avatar) |

---

## 5. Contoh TanStack Query

```ts
const API = import.meta.env.VITE_API_URL;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as T;
}

// ---------- Publik ----------
export const useSiteSettings = () =>
  useQuery({ queryKey: ["site-settings"], queryFn: () => getJson("/public/site-settings") });

export const useHomepage = () =>
  useQuery({ queryKey: ["homepage"], queryFn: () => getJson("/public/homepage") });

export const useCatalog = (params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString();
  return useQuery({ queryKey: ["catalog", params], queryFn: () => getJson(`/public/catalog?${qs}`) });
};

export const useCalculateCredit = () =>
  useMutation({
    mutationFn: (body: { price: number; dpPercent?: number; tenor: number; rate?: number }) =>
      fetch(`${API}/public/credit-simulation/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async (r) => {
        const json = await r.json();
        if (!json.success) throw new Error(json.message);
        return json.data;
      }),
  });

// ---------- CMS per-section ----------
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const useCmsSection = (page: "homepage" | "about", section: string) =>
  useQuery({
    queryKey: ["cms", page, section],
    queryFn: () =>
      fetch(`${API}/cms/${page}/${section}`, { headers: authHeaders() })
        .then((r) => r.json())
        .then((j) => { if (!j.success) throw new Error(j.message); return j.data; }),
  });

export const useUpdateCmsSection = (page: string, section: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) =>
      fetch(`${API}/cms/${page}/${section}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async (r) => {
        const json = await r.json();
        if (!json.success) throw new Error(json.message);
        return json.data;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", page, section] }),
  });
};

// Upload gambar generik (page/site/testimoni)
export async function uploadCmsImage(folder: string, file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${API}/cms/uploads/${folder}`, {
    method: "POST", headers: authHeaders(), body: fd,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data.filename as string; // isi ke field *Filename lalu PUT section
}
```

---

## 6. Pemetaan Halaman Admin ↔ Endpoint

| Halaman Admin (FE) | Endpoint |
|--------------------|----------|
| Banner & Hero (`BannerPage`) | `/cms/homepage/hero`, `/cms/homepage/cta` |
| Keunggulan / Cara Kerja / Merek / Unggulan | `/cms/homepage/why-us`, `/how-it-works`, `/brands`, `/featured` |
| Testimoni (`TestimoniPage`) | koleksi `/cms/testimonials*` + header `/cms/homepage/testimonials` |
| Profil (`ProfilPage`) | `/cms/about/hero`, `/stats`, `/visi-misi`, `/values`, `/cta` |
| Info Kontak (`KontakCmsPage`) | `/cms/site-settings` + `/cms/contact-page` |
| Inbox Pesan | `/cms/contact-messages*` |
| Katalog (CMS) | `/cms/catalog*` + `/cms/catalog-page` |
| Simulasi Kredit | `/cms/credit-simulation/config` |

---

## 7. Kode Permission (RBAC)

| Modul | Codes |
|-------|-------|
| Site Settings | `SITE_SETTING_READ`, `SITE_SETTING_UPDATE` |
| Homepage (semua section) | `HOMEPAGE_READ`, `HOMEPAGE_UPDATE` |
| About (semua section) | `ABOUT_READ`, `ABOUT_UPDATE` |
| Kontak (header) | `KONTAK_READ`, `KONTAK_UPDATE` |
| Pesan Kontak | `CONTACT_MESSAGE_READ`, `CONTACT_MESSAGE_UPDATE`, `CONTACT_MESSAGE_DELETE` |
| Katalog | `KATALOG_READ`, `KATALOG_CREATE`, `KATALOG_UPDATE`, `KATALOG_DELETE` |
| Simulasi | `CREDIT_SIM_READ`, `CREDIT_SIM_UPDATE` |
| Testimoni | `TESTIMONI_READ`, `TESTIMONI_CREATE`, `TESTIMONI_UPDATE`, `TESTIMONI_DELETE` |

Menu CMS muncul otomatis di `GET /api/v1/menus` (group `CMS`) sesuai permission role.

---

## 8. Checklist Migrasi Data Statis → CMS

1. Layout (`PublicLayout.tsx`, `publicNav.ts`) → `useSiteSettings()` — nama, logo, tagline, **navLinks**, `navContactLabel`, footer, sosial, copyright.
2. Beranda (`LandingPage.tsx`) → `useHomepage()` — 1 request untuk 7 section; render skip section `isVisible === false`.
3. Katalog (`KatalogPage.tsx`) → `useCatalogPage()` (header + priceRanges) + `useCatalog(params)` + brands.
4. Detail (`KatalogDetailPage.tsx`) → detail + related + config (`installmentFromFactor` untuk "cicilan mulai").
5. Simulasi (`SimulasiPage.tsx`) → config (slider) + `calculate` (angka final).
6. Tentang (`TentangPage.tsx`) → `useAbout()` — 5 section.
7. Kontak (`KontakPage.tsx`) → site-settings + contact-page + submit form (jangan lupa honeypot `website`).

Semua daftar publik **sudah terfilter, terurut, dan ter-paginate di server**.
