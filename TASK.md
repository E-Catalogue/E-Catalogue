# TASK LIST — GM Mobilindo E-Catalogue

> Daftar task actionable turunan dari [PRD.md](PRD.md) & [SRS](SRS_GM_Mobilindo.md).
> Status: `[x]` selesai · `[~]` sebagian · `[ ]` belum. Prioritas: 🔴 tinggi · 🟠 sedang · 🟢 rendah.
>
> **Terakhir diperbarui:** 4 Juli 2026 (rev 8 — situs publik consume /public/* API)

---

## ✅ SELESAI (Done)

### Fondasi & UI
- [x] Setup project (Vite + React 19 + TS + Tailwind + TanStack Router)
- [x] Tema "Claude Orange" + token warna (CSS vars)
- [x] UI kit reusable (Modal, ConfirmDialog, DetailModal, Button, Field, DataTable, RowActions, Pagination, Tooltip, SectionCard, StatusBadge, UnitCard, PageHeader)
- [x] Layout admin (Sidebar accordion, Header, MainLayout) + Quick Input
- [x] Animasi halus (float-up, stagger, modal-in) + reduce-motion
- [x] **Sidebar accordion** — grup menu collapsible, active state otomatis, mode ikon-only flat, teks tidak terpotong, hierarki font group > item
- [x] **NumericField** — input angka tanpa masalah leading-zero (type text + inputMode numeric, format id-ID on blur, prefix/suffix)
- [x] **Header menu search** — command palette (Ctrl+K / ⌘K), keyboard nav ↑↓ Enter Esc, filter dinamis dari groupMenus

### Situs Publik (Customer)
- [x] Beranda marketing (hero, keunggulan, cara kerja, unggulan, testimoni, CTA)
- [x] Katalog + filter (merek/harga/transmisi/BBM/sort/search) + sidebar kanan
- [x] Detail mobil (galeri + spesifikasi + CTA + unit serupa)
- [x] Simulasi Kredit interaktif
- [x] Tentang & Kontak + PublicLayout (navbar/footer)
- [x] Responsif semua device

### Autentikasi (API nyata)
- [x] Axios client + base URL fleksibel (env)
- [x] Interceptor 1 pintu: attach token + auto-refresh 401 (rotation + antrean)
- [x] Refresh **hanya** saat `INVALID_ACCESS_TOKEN`; kode sesi-berakhir → langsung logout
- [x] Global error handler (network/timeout/5xx/parsing) + GlobalErrorModal
- [x] Login (identifier+password), `/auth/me` hydrate, logout, guard `_admin`
- [x] **Modal konfirmasi logout** + bersihkan cache React Query saat logout
- [x] **Logout semua perangkat** (`/auth/logout-all`) dgn konfirmasi di Header

### Master Data (API nyata)
- [x] Merek + Tipe (nested) CRUD + paginated/search
- [x] Vendor CRUD
- [x] Cabang CRUD + **PIC (dropdown user aktif, `picId` wajib)** + galeri foto (upload/hapus dgn konfirmasi, media `/m/:id`)
- [x] Akses Control: Role, User, Menu/Group/Permission (CRUD + set permission/role/branch) — halaman Menu dirapikan jadi alur 3-kolom (Group → Menu → Permission)
- [x] Master sederhana via komponen generik `SimpleMasterPage` (`code` **wajib** + auto-uppercase): **Leasing, Sumber Lead, Pengecekan, Kategori Pengeluaran, Metode Pembayaran, Dokumen, Perlengkapan**
- [x] **Investor + Modal Investor (nested)** CRUD — investor (nama/kode/bank/rekening) + rincian modal (nominal, tipe bagi hasil %/nominal, periode `YYYY-MM` start/end ongoing, tgl pembagian)

### CRM / Lead (API nyata) — *new*
- [x] `crm.types.ts` — `OrderStatus`, `PaymentType`, `JenisPembayaran`, label/warna map, interface `Lead`, `LeadOrder`, `LeadPayment`, `UnitSummary`
- [x] `crm.api.ts` — `leadApi`, `leadOrderApi`, `leadPaymentApi`, `unitApi`
- [x] `crm.hooks.ts` — `useLeads`, `useLead`, `useLeadMutations`, `useLeadOrders`, `useLeadOrder`, `useLeadOrderMutations` (incl. `updateStatus`), `useLeadPayments`, `useLeadPaymentMutations`, `useReadyStockUnits`
- [x] `CrmPage.tsx` — tabel lead real API, search debounced, no-delete (lead wajib tersimpan per PRD)
- [x] `LeadFormModal.tsx` — form lead (nama/NIK/HP/email/pekerjaan/alamat/sumber lead dropdown API)

### Sales Order / Penjualan (API nyata) — *new*
- [x] `SalesOrderFormModal.tsx` — pilih lead (search live), pilih unit READY_STOCK, tipe Cash/Kredit, leasing/SLIK/approval (kredi), diskon, tanggal, catatan
- [x] `PenjualanPage.tsx` — tabel order real API, filter status, klik status badge untuk ubah status, view detail, pagination
- [x] `OrderStatusModal.tsx` — ubah status order (grid pilih status + validasi beda dari saat ini)
- [x] `OrderDetailModal.tsx` — detail order + ringkasan bayar + riwayat pembayaran CRUD inline (PaymentFormModal bersarang)

### Pembayaran (API nyata) — *new*
- [x] `PembayaranPage.tsx` — view order dengan kolom totalTerbayar/sisa/isPaid, filter belum/lunas, summary card, klik Detail buka OrderDetailModal

### CMS (API nyata) — *rev 6: v2 per-section* (acuan docs/frontend/cms_frontend_integration.md)
- [x] `cms.types.ts` — v2 per-section (SiteSettings + navLinks, Homepage sections hero/brands/whyUs/howItWorks/featured/testimonials/cta, About sections, ContactPage, CatalogPage, Testimonial, ContactMessage, CreditSimConfig, CmsCatalogRow)
- [x] `cms.api.ts` — `sectionApi.get/update(page,section)` generik + `/cms/{page}/hero-image` + `uploadCmsImage(folder)` + site-settings/contact-page/catalog-page/testimonials/contact-messages/credit-sim/catalog. **Modul Banner dihapus (v2).**
- [x] `cms.hooks.ts` — `useCmsSection`/`useUpdateCmsSection` generik, `usePublicSiteSettings`, dll (toast `variant:'success'`)
- [x] **ImageUpload** — komponen upload dengan **preview gambar** (drag/drop, validasi 5MB JPG/PNG, preview instan)
- [x] **BannerPage** → `/cms/homepage/hero` + `/cms/homepage/cta` (per-section, upload hero pakai ImageUpload)
- [x] **ProfilPage** → `/cms/about/visi-misi` + `/stats` + `/values` (per-section)
- [x] **TestimoniPage** → `/cms/testimonials` (CRUD + publish + avatar)
- [x] **KatalogPage (CMS)** → `/cms/catalog` (publish/isNew/statusKatalog)
- [x] **KontakCmsPage** → `/cms/site-settings`

### Situs Publik / Customer (API nyata) — *rev 8*
- [x] `public.types.ts` — CatalogCard, CatalogDetail, PublicHomepage/About (agregat), CreditCalcResult, CatalogQuery, dll
- [x] `landing.api.ts` + `landing.hooks.ts` — semua endpoint `/public/*` (site-settings, homepage, about, catalog + brands + detail + related, catalog-page, contact-page, credit config + **calculate**, submit contact)
- [x] `Ic.tsx` — resolver string ikon lucide (dari CMS) → komponen · `PublicUnitCard` — kartu unit dari `CatalogCard` (harga/km/transmisi API)
- [x] **PublicLayout** — nama/logo/tagline/navLinks/footer/sosial/WA/copyright dinamis dari `site-settings`
- [x] **LandingPage** → `GET /public/homepage` (7 section, hormati `isVisible`, ikon & unit unggulan dari API, reveal animasi)
- [x] **KatalogPage (publik)** → `GET /public/catalog` (filter server-side: search/merek/transmisi/BBM/harga/sort + paginasi) + brands + catalog-page header
- [x] **KatalogDetailPage** → `GET /public/catalog/:id` + related + config (galeri, spesifikasi, kelengkapan/dokumen, WA prefilled, cicilan pakai `installmentFromFactor`)
- [x] **SimulasiPage** → config (slider) + **`POST /public/credit-simulation/calculate`** (angka final, debounced, ikut method aktif)
- [x] **TentangPage** → `GET /public/about` (5 section)
- [x] **KontakPage** → contact-page + site-settings + **`POST /public/contact-messages`** (honeypot anti-spam)

### Polish UI global — *rev 6*
- [x] **Modal notifikasi** — ikon sukses = ceklis hijau (`CheckCircle2`), gagal/peringatan = tanda seru (`AlertTriangle`), via `variant` di `uiSlice` + derivasi title
- [x] **Halaman 404** dipercantik (angka 404 besar + kartu ikon mobil + ambient glow)
- [x] **Branding dinamis** — Logo sidebar & kartu footer ambil nama/tagline/logo dari `usePublicSiteSettings()`
- [x] **Rekondisi = stepper modal** — Kelola Rekondisi jadi stepper (Buat→Isi Item→Pengerjaan→Selesai), tombol "Buat Rekondisi" pindah ke dalam modal, riwayat selesai collapsible
- [x] **Filter katalog publik** — `PriceRangeSlider` (dual range + input min/max kustom + nilai rupiah)
- [x] **Landing** — animasi scroll-reveal **sekali** (`Reveal` + IntersectionObserver unobserve) di section Keunggulan/Cara Kerja/Unggulan/Testimoni/CTA
- [x] **Tabel seragam** — cross-check: 18 halaman DataTable, tanpa `<table>` manual & tanpa gambar di sel (kecuali Menu & Permission)

### Sidebar & Routing dinamis
- [x] `PATH_BY_CODE` — alias kode backend (`UNIT`, `LEAD`, `LEAD_ORDER`, `LEAD_PAYMENT`) ke route frontend
- [x] `iconMap.ts` — ikon grup (`ACCESS_CONTROL`, `INVENTORY_OPERATIONAL`, `CRM_SALES`, `MASTER_DATA`) dan per-menu (`LEAD`, `LEAD_ORDER`, `LEAD_PAYMENT`, `UNIT`, `REKONDISI`)
- [x] `INVESTOR_MODAL` backend-menu difilter otomatis (path punya param URL → null → disembunyikan dari sidebar; diakses via InvestorPage)

### Unit (API nyata) — *rev 3*
- [x] `unit.types.ts` — `Unit`, `UnitFormData`, `UnitStatusUpdate`, `MasterKelengkapan`, `MasterDokumen`, `UnitImage`, status enums
- [x] `unit.api.ts` — list/get/create/update/updateStatus/delete, upload/delete image, `rekondisiStatusCheck`, `createRekondisi`
- [x] `unit.hooks.ts` — `useUnits`, `useUnit`, `useCreateUnit`, `useUpdateUnit`, `useUpdateUnitStatus`, `useDeleteUnit`, `useRekondisiStatusCheck`, `useCreateRekondisi`, `useMasterKelengkapan`, `useMasterDokumen`

### Rekondisi (API nyata) — *rev 3*
- [x] `rekondisi.types.ts` — `Rekondisi`, `RekondisiDetail`, form types, status labels/colors
- [x] `rekondisi.api.ts` — list/get/update/progress/done (multipart), detail CRUD
- [x] `rekondisi.hooks.ts` — `useRekondisis`, `useRekondisi`, `useRekondisiMutations`, `useRekondisiDetails`, `useRekondisiDetailMutations`
- [x] `RekondisiDetailModal.tsx` — modal manajemen rekondisi per-unit (accordion, inline item edit, progress/done flow, DoneForm + invoice upload)
- [x] `RekondisiPage.tsx` — klik card buka `RekondisiDetailModal` (bukan `UnitDetailModal`)
- [x] `master.hooks.ts` — tambah `usePengecekan` (dropdown item rekondisi)

### Modul admin (dummy — masih dipakai)
- [x] Dashboard (stat, ready stock, grafik, pipeline, rekondisi, aktivitas)
- [x] Inventory, Pembelian, Rekondisi, Ready Stock (CRUD unit)
- [x] Test Drive, Pengeluaran & Cash Flow
- [x] Laporan (ringkasan) & Pengaturan

---

## 📊 Status Integrasi API

> Audit endpoint-per-endpoint. **Indikator:** ✅ penuh · 🟡 sebagian/belum di-UI · ⬜ belum.

| Module | API frontend | Status |
|--------|--------------|:------:|
| Role (+ set permission) | `roleApi` | ✅ |
| User (+ set role/branch, soft-delete) | `userApi` | ✅ |
| Menu / Group / Permission | `menuApi` | ✅ |
| Auth (login/refresh/me/logout/logout-all) | `authApi` + interceptor | ✅ |
| Merek | `merekApi` | ✅ |
| Tipe (nested) | `tipeApi` | ✅ |
| Vendor | `vendorApi` | ✅ |
| Branch & Media | `branchApi` | ✅ |
| Leasing | `leasingApi` | ✅ |
| Sumber Lead | `sumberLeadApi` | ✅ |
| Pengecekan | `pengecekanApi` | ✅ |
| Kategori Pengeluaran | `kategoriPengeluaranApi` | ✅ |
| Metode Pembayaran | `metodePembayaranApi` | ✅ |
| Dokumen | `dokumenApi` | ✅ |
| Perlengkapan | `perlengkapanApi` | ✅ |
| Investor | `investorApi` | ✅ |
| Investor Modal (nested) | `investorModalApi` | ✅ |
| **Lead / CRM** | `leadApi` | ✅ |
| **Sales Order** | `leadOrderApi` (list/get/create/update/updateStatus) | ✅ |
| **Pembayaran Order** | `leadPaymentApi` (nested under order) | ✅ |
| Unit (full CRUD + images + status) | `unitApi` | ✅ |
| Test Drive | — | ⬜ |
| Rekondisi (list/progress/done + detail items) | `rekondisiApi` | ✅ |
| Pengeluaran | — | ⬜ |
| Laporan | — | ⬜ |
| **CMS — Pengaturan Situs** (`SiteSettingsPage`) | `siteSettingsApi` (+logo/favicon/navLinks) | ✅ |
| **CMS — Beranda 7 section** (`HomepagePage`) | `sectionApi('homepage')` + hero-image | ✅ |
| **CMS — Tentang 5 section** (`AboutPage`) | `sectionApi('about')` + hero-image | ✅ |
| **CMS — Testimoni** (`TestimoniPage`) | `testimonialApi` | ✅ |
| **CMS — Katalog + galeri + header** (`KatalogPage`) | `cmsCatalogApi` + `catalogPageApi` | ✅ |
| **CMS — Kontak & Pesan** (`ContactInboxPage`) | `contactPageApi` + `contactMessageApi` | ✅ |
| **CMS — Simulasi Kredit** (`CreditSimPage`) | `creditSimApi` | ✅ |
| **Situs publik (7 halaman)** consume `/public/*` | `landingApi` + `landing.hooks` | ✅ |

---

## 🔍 AUDIT HARDCODE / DATA STATIS (cross-check modul admin — rev 1 Jul 2026)

> Hasil telusur pemakaian Redux store statis (`s.data.*` / `dataSlice`) & tipe `@/data/types` di seluruh modul admin.
> Legenda: **API ada** = master/endpoint sudah tersedia, tinggal wire. **API belum** = backend belum siap.

### Sudah diperbaiki ✅
- [x] **Test Drive — dropdown Unit** → sekarang ambil dari API (`useUnits`) di `TestDriveFormModal`, bukan `s.data.units`.
- [x] **Rekondisi** → tombol "Tambah Unit" dihapus dari `RekondisiPage` (unit dibuat dari modul Inventory, bukan di sini).

### Masih hardcode — API SUDAH ADA (tinggal wire) 🟠
- [ ] 🟠 **Pembelian** (`PembelianPage.tsx`) — daftar & sumber unit masih `s.data.units`. → pakai `useUnits`.
- [ ] 🟠 **Penjualan — form** (`SaleFormModal.tsx`) — dropdown unit `s.data.units`. → `useUnits` (ambil OTR unit terpilih).
- [ ] 🟠 **Pembayaran — form** (`PaymentFormModal.tsx`) — tulis ke `dataSlice` (dipakai QuickInput & OrderDetailModal). → wire ke finance/penjualan API.
- [ ] 🟠 **Dashboard** (`DashboardPage`, `BottomStats`, `PipelineFunnel`, `RecentActivity`, `RekondisiList`, `SalesChart`) — semua baca `s.data.*` (units/leads/sales/payments). → agregasi dari API (units, crm, finance).
- [ ] 🟠 **Laporan** (`LaporanPage.tsx`) — `s.data.units`. → API units + agregasi.

### Masih hardcode — API BELUM ADA (butuh backend dulu) 🔴
- [ ] 🔴 **Test Drive — list & CRUD** (`TestDrivePage` → `s.data.testDrives`, `addTestDrive/updateTestDrive/removeTestDrive`). Belum ada `test-drive.api.ts`. → butuh endpoint Test Drive.
- [ ] 🔴 **Simulasi kredit config** (landing) — parameter tenor/bunga hardcode (lihat [cms_prd.md](cms_prd.md) §8).

### Dead code / legacy (bersihkan) 🟢
- [ ] 🟢 **`ExpenseFormModal.tsx`** — tidak direferensikan di mana pun (PengeluaranPage sudah pakai finance API). Hapus atau arsipkan.
- [ ] 🟢 **`SaleFormModal.tsx` / `PaymentFormModal.tsx`** — hanya dipakai `QuickInput` (shortcut lama). Setelah wire ke API, evaluasi ulang.

### Sudah dinamis (rev 8) ✅
- Halaman **publik/customer** (`landing/*`) kini konsumsi `/public/*` (lihat section "Situs Publik / Customer (API nyata)"). Redux dummy `s.data.*` **tidak lagi** dipakai di situs publik.

---

## 🚧 BELUM / SEBAGIAN (To Do)

### A. Integrasi API modul bisnis (sisa) 🔴
- [x] **Unit** — list + CRUD + upload foto (API layer selesai; UI InventoryPage masih perlu wire ke real API)
- [x] **Rekondisi** — entri biaya per unit, detail item, progress/done (API + modal selesai)
- [ ] 🟠 **Unit Inventory UI** — hubungkan InventoryPage / UnitFormModal ke real API (ganti dummy data)
- [ ] 🟠 **Test Drive** — form (upload KTP+SIM), sales pendamping, link lead
- [ ] 🟠 **Pengeluaran & Cash Flow** — CRUD transaksi, per kategori
- [ ] 🟢 **Dashboard & Laporan** — data agregasi dari API (bukan dummy)

### B. Penyempurnaan CRM/Sales 🟠
- [ ] 🟠 Upload foto KTP di form Lead (`multipart`)
- [ ] 🟠 Harga penawaran unit di Sales Order (ambil OTR dari unit terpilih)
- [ ] 🟠 Notifikasi/validasi unit tidak boleh double-order
- [ ] 🟢 Filter lead by sumber, sales, tanggal

### C. RBAC & Guard Halaman 🟠
- [x] Sidebar dinamis dari `groupMenus` (`/auth/me`) + `PATH_BY_CODE`
- [x] Guard aksi per-permission (Role/User/Menu module)
- [ ] 🟠 Terapkan `Can`/`RequirePermission` ke modul CRM, Penjualan, Pembayaran

### D. Laporan & Audit 🟠
- [ ] 🟠 Laporan: inventory/aging, sales per sales, closing rate, rekondisi, cashflow periodik, profit unit
- [ ] 🟠 Export PDF/Excel
- [ ] 🔴 **Audit Log** (siapa, sebelum, sesudah, waktu)

### ✅ Status Integrasi CMS (rev 7 — acuan [docs/frontend/cms_module_prd.md](docs/frontend/cms_module_prd.md))

**Panel Admin CMS — SUDAH terintegrasi penuh (semua endpoint dikonsumsi):**

| # | Modul | Halaman FE | Endpoint | Status |
|---|-------|-----------|----------|:--:|
| 1 | Pengaturan Situs | `SiteSettingsPage` (`/cms/site-settings`) | `GET/PUT /cms/site-settings` + logo/favicon + navLinks | ✅ |
| 2 | Beranda (7 section) | `HomepagePage` (`/cms/homepage`) | `/cms/homepage/{hero,brands,why-us,how-it-works,featured,testimonials,cta}` + hero-image | ✅ |
| 3 | Tentang (5 section) | `AboutPage` (`/cms/about`) | `/cms/about/{hero,stats,visi-misi,values,cta}` + hero-image | ✅ |
| 4 | Testimoni | `TestimoniPage` (`/cms/testimoni`) | CRUD `/cms/testimonials*` + publish + avatar | ✅ |
| 5 | Katalog (tayang + header + galeri) | `KatalogPage` (`/cms/katalog`) | `/cms/catalog*` (publish, images, reorder) + `/cms/catalog-page` | ✅ |
| 6 | Kontak & Pesan | `ContactInboxPage` (`/cms/kontak`) | `/cms/contact-page` + inbox `/cms/contact-messages*` (status, count-new, hapus) | ✅ |
| 7 | Simulasi Kredit | `CreditSimPage` (`/cms/simulasi`) | `GET/PUT /cms/credit-simulation/config` | ✅ |

Pendukung: `ImageUpload` (preview + validasi), `useSectionForm`/`useCmsSection` generik, `CmsKit` (SectionBar/IconItemsEditor/StatsEditor), `uploadCmsImage` (generik page/site/testimoni).

**Situs PUBLIK (website customer) — BELUM konsumsi API, masih data dummy Redux 🔴**

| Halaman publik | Endpoint yang harus dipakai | Status |
|----------------|-----------------------------|:--:|
| Layout (`PublicLayout`) header/footer | `GET /public/site-settings` (`navLinks`, logo, sosial) | ⬜ (dashboard admin sudah pakai `usePublicSiteSettings`) |
| Beranda (`LandingPage`) | `GET /public/homepage` (agregat 7 section) | ⬜ |
| Katalog (`KatalogPage` publik) | `GET /public/catalog`, `/catalog/brands`, `/catalog-page` | ⬜ (masih `s.data.units`) |
| Detail (`KatalogDetailPage`) | `GET /public/catalog/:id`, `/related`, config | ⬜ |
| Simulasi (`SimulasiPage`) | `GET /public/credit-simulation/config` + `POST /calculate` | ⬜ |
| Tentang (`TentangPage`) | `GET /public/about` | ⬜ |
| Kontak (`KontakPage`) | `GET /public/contact-page` + `POST /public/contact-messages` | ⬜ |

> **Sisa utama CMS = migrasi situs publik ke `/public/*`.** Semua API layer publik/agregat sudah tersedia di `cms.api.ts` (`siteSettingsApi.getPublic`) — perlu tambah hook publik untuk homepage/about/catalog/credit-sim + ganti data dummy. Butuh backend aktif untuk verifikasi.

### F. CMS + Situs Publik — SELESAI ✅
- [x] Panel admin CMS: Site Settings, Beranda (7 section), Tentang (5 section), Testimoni, Katalog (publish+galeri+header), Kontak & Pesan (inbox), Simulasi Kredit
- [x] **Situs publik consume `/public/*`** — 7 halaman (`landing/*`) sudah dinamis dari API (site-settings, homepage, about, catalog+detail+related, credit config+calculate, contact submit). Data dummy Redux tidak lagi dipakai di situs publik.
- [ ] 🟢 Verifikasi end-to-end dengan backend aktif (uji render nyata + submit form).

### Z. Perbaikan build (bukan CMS/publik — pekerjaan paralel) 🟠
- [ ] 🟠 **3 file error build**: `DashboardCashflowPage`, `TargetPendapatanPage`, `TargetPenjualanPage` — prop `size`/`className` tidak ada di Button/Modal, `Column` generic, unused imports. Bukan bagian tugas CMS/publik; perlu dirapikan agar `tsc -b` hijau.

### E. Lain-lain 🟢
- [ ] 🟢 Fungsikan wishlist/favorit (tombol hati) & bandingkan mobil
- [ ] 🟢 Validasi form menyeluruh (Zod)
- [ ] 🟢 Code-splitting (chunk > 500kB) + optimasi gambar
- [ ] 🟢 Fase 2 SRS: WhatsApp follow-up, approval owner, e-sign SPK, reminder pajak/aging, ROI investor, multi cabang, mobile app

---

## 🎯 Saran urutan berikutnya
1. **A** — Inventory/Unit full CRUD + formula HPP (fondasi semua modul lain).
2. **A** — Test Drive API integration (form upload KTP+SIM + link lead).
3. **A** — Rekondisi biaya → update HPP otomatis.
4. **B** — Upload KTP lead + ambil OTR unit ke Sales Order form.
