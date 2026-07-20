# TASK LIST — GM Mobilindo E-Catalogue

> Daftar task actionable turunan dari [PRD.md](PRD.md) & [SRS](SRS_GM_Mobilindo.md).
> Status: `[x]` selesai · `[~]` sebagian · `[ ]` belum. Prioritas: 🔴 tinggi · 🟠 sedang · 🟢 rendah.
>
> **Terakhir diperbarui:** 20 Juli 2026 (rev 16 — dibersihkan 4 jalur UI lama yang masih baca/tulis dummy `dataSlice` alih-alih API asli: `PembelianPage`, `SaleFormModal`→diganti `SalesOrderFormModal` asli, `PaymentFormModal`→dibangun ulang total mengikuti kontrak "payment selalu milik satu `LeadOrder`", dan `ExpenseFormModal` dead code dihapus. Seluruh `dataSlice.ts`/Redux `data` slice (dummy store peninggalan awal proyek) sudah tidak dipakai sama sekali lagi dan dihapus. `tsc -b --noEmit`, `eslint .`, dan `npm run build` bersih.)

---

## ⚠️ Status eksekusi saat ini (20 Juli 2026)

> Build **hijau**. Seluruh 37 file kontrak PRD backend sudah terhubung ke API asli, termasuk 3 jalur UI "quick input"/legacy yang sebelumnya lolos audit karena tidak terikat 1:1 ke satu file PRD (lihat rev 16 di atas).

**Selesai & terverifikasi (`tsc`/`eslint`/`build` bersih):** Dashboard, Unit (funding/pricing), Pembelian Unit (kini pakai `useUnits`/`useUnitModals` asli, bukan dummy), Rekondisi (lookups), Lead (status+field), Test Drive (lookup field), Lead Order/Settlement (refactor terbesar) + quick-input "Buat Penjualan" (kini `SalesOrderFormModal` asli) + quick-input "Catat Pembayaran" (dibangun ulang: cari order dulu, baru reuse `PayForm` yang sama persis dengan `OrderDetailModal`), Investor (capital rebuild), Investor Obligation (modul baru), Laporan, Pengaturan, Role (bug permission), Cash Account & Cash Transaction (branch-header/idempotency-key lengkap + `reverse` + `inter-branch-transfer`), Payroll & Pengeluaran (disesuaikan ke signature baru + upload `proof` multipart asli), **Target** (modul baru), **Book/Pembukuan** (modul baru).

**Sisa gap non-blocker** (lihat "Ringkasan" & "Sisa pekerjaan" di bawah untuk daftar lengkap): keterbatasan arsitektural yang sudah diketahui sejak awal (branch-scope belum context provider global — lihat "Gap sistemik" di bawah), ditambah 1 temuan baru saat audit rev 16: **RBAC/`Can` guard belum lengkap di beberapa halaman lama** (`InventoryPage.tsx`, `RekondisiPage.tsx`, `MerekPage.tsx` — nol permission-check sama sekali; CRM sudah diperbaiki rev 16, lihat section "C. RBAC & Guard Halaman"). Ini soal UI menyembunyikan/menonaktifkan tombol sesuai izin — backend tetap menolak aksi tanpa izin di sisi API, jadi bukan lubang keamanan, tapi UX-nya salah (tombol tampil lalu gagal). Belum diperbaiki di sesi ini karena scope-nya terpisah & cukup besar (audit permission code per tombol, per modul).

### 🔴 Gap sistemik (memengaruhi banyak modul sekaligus)
1. **Header `X-Branch-Id`** — ✅ helper (`src/features/auth/useBranchScope.ts`) sudah terpasang lengkap di seluruh modul branch-scoped: cash-account, cash-transaction, operational-expense, recurring-expense, payroll, Target, Book. **Keterbatasan yang belum diperbaiki**: dipanggil per-halaman (state lokal), belum lewat context provider global — pilihan cabang Owner di satu halaman tidak otomatis ikut ke halaman lain yang di-mount terpisah.
2. **Header `Idempotency-Key`** — ✅ helper (`src/shared/hooks/useIdempotencyKey.ts`) dipakai di Investor Obligation, Investor Capital, Lead Order payment, dan transaksi kas manual-in/manual-out/transfer/adjustment/inter-branch-transfer.

### Dashboard
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_dashboard` | `dashboard/dashboard.api.ts`, `dashboard.types.ts` | ✅ **selesai** | Direkonsiliasi ke bentuk response asli (`{period,branch,summary,inventory,charts:{monthlySales}}`), param `tipePeriode` dihapus, widget yang murni karangan (`topSelling`/`salesPerformance`/`leadSources`/`agingStock`) dihapus, varian Owner `{consolidated,breakdown}` ditangani. |

### Unit
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_unit` | `units/unit.api.ts`, `unit.types.ts` | ✅ **selesai** | Endpoint funding/finalize-pricing/pricing-policy/transfer-branch ditambahkan; field direname persis kontrak (`purchaseCost`, `pricingCostBasis`, `targetPrice`, `otrPrice`); semua consumer (`InventoryPage.tsx`, `UnitCard.tsx`, `UnitDetailModal.tsx`) disesuaikan. |
| `create_rekondisi` | `rekondisi/rekondisi.api.ts`, `rekondisi.types.ts` | ✅ **selesai** | Dropdown vendor/pengecekan sekarang pakai `GET /rekondisis/lookups`. Enum `PAID` **dikonfirmasi tidak perlu** — dicek langsung ke Prisma schema, `status` backend memang cuma sampai `COMPLETED`, "paid" adalah kondisi turunan dari `paidAt` (kode FE sudah benar sebelumnya). |

### Sales
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_lead` | `crm/crm.api.ts` (`leadApi`) | ✅ **selesai** | `updateStatus` ditambahkan (`PATCH /leads/:id/status`), field `ktpUrl` dibetulkan, status-change UI ditambahkan di `CrmPage.tsx` (WON dikunci manual, cuma dari DEAL). |
| `create_test_drive` | `test-drive/testDrive.api.ts` | ✅ **selesai** | Lookup unit dibetulkan ke bentuk nested (`merek.name`/`tipe.name`/`otrPrice`). |
| `create_lead_order` | `crm/crm.api.ts` (`leadOrderApi`,`leadPaymentApi`), `penjualan/*`, `pembayaran/*` | ✅ **selesai — refactor terbesar sesi ini** | `OrderStatus` dibetulkan ke `BOOKING\|DEAL\|CANCELLED`. Modul Settlement dibangun (lookups, get, set incentive, finalize). Reversal payment ditambahkan (`leadPaymentApi.reverse`), delete keras dihapus (backend selalu tolak dengan `POSTED_PAYMENT_IMMUTABLE`). Field `LeadPayment` dibetulkan (`leadOrderId`/`buktiUrl`/`postingStatus`/`cashAccountId`/`idempotencyKey`). |

### Cashflow
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_cash_account` | `finance/finance.api.ts` | ✅ **selesai** | Branch-header wiring lengkap (`requireBranchId` di `create`/`update`). |
| `create_cash_transaction` | `finance/finance.api.ts`, `CashFlowPage.tsx` | ✅ **selesai** | Branch-header + `Idempotency-Key` lengkap di manual-in/out/transfer/adjustment. Endpoint `interBranchTransfer` (`POST /cash-transactions/inter-branch-transfer`, tombol "Transfer Cabang") dan `reverse` (`POST /cash-transactions/:id/reverse`, aksi "Balik Transaksi" — hanya utk `sourceType==='MANUAL_ADJUSTMENT'`) ditambahkan. |
| `create_book` | `book/*` | ✅ **selesai — modul baru** | Dibangun dari nol: tab Ringkasan (cash-summary + profit-summary live, konsolidasi Owner memakai `consolidated` dari backend, TIDAK dijumlah manual dari breakdown — README §16), tab Ledger (paginated, `page < totalPages` krn `createPaginationMeta` tidak punya `hasNextPage`), tab Pengaturan Pajak (readiness per cabang, form tarif+akun sumber/cadangan, retry cadangan pajak). Tutup periode (`POST /books/periods/:period/close`) di-gate hanya utk periode lampau + `ConfirmDialog tone="danger"` (irreversible, tidak ada endpoint buka-kembali). |
| `create_laporan` | `laporan-cashflow/LaporanCashflowPage.tsx` | ✅ **selesai** | Angka fiktif & tombol export palsu dihapus; sekarang tampilkan data real dari cash dashboard, dengan notice jujur untuk bagian yang memang belum ada backend-nya. |

### Operational
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_operational_expense` | `finance/finance.api.ts`, `pengeluaran/*` | ✅ **selesai** | Upload file `proof` asli (`<input type="file">`, multipart `upload.single("proof")`) menggantikan input teks URL manual di form create/update/pay. |
| `create_recurring_expense` | `finance/finance.api.ts` | ✅ sesuai | — |
| `create_payroll` | `finance/finance.api.ts`, `payroll/PayrollPage.tsx` | ✅ **selesai** | Disesuaikan ke signature `branchKey`-first + `{body,headers}` object, `useBranchScope()` dipasang di seluruh form & detail. |

### Access Control
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_role` | `access/access.api.ts`, `RolePage.tsx` | ✅ **selesai** | Mapping `rolePermissions[].permission` dibetulkan — checkbox permission sekarang ter-centang saat edit role. |
| `create_user` | `access/access.api.ts` | ✅ sesuai | — |
| `create_menu_permission` | `access/access.api.ts` | ✅ sesuai | — |
| `create_pengaturan` | `pengaturan/PengaturanPage.tsx` | ✅ **selesai** | Diganti jadi read-only (info user login real), form fiktif & tombol "Simpan" yang tidak berfungsi dihapus. |

### Master
| PRD file | FE | Status |
|---|---|:--:|
| `create_merek_tipe` | `master/master.api.ts` | ✅ sesuai |
| `create_vendor` | `master/master.api.ts` | ✅ sesuai |
| `create_branch` | `master/master.api.ts` | ✅ sesuai |
| `create_leasing`, `create_sumber_lead`, `create_pengecekan`, `create_kategori_pengeluaran`, `create_metode_pembayaran`, `create_dokumen`, `create_perlengkapan` | `master/simpleMaster.api.ts` | ✅ sesuai (7 modul generik `{name,code,isActive}` — kebetulan identik hari ini, tapi rawan drift diam-diam kalau salah satu Joi schema berubah nanti) |
| `create_investor` | `master/master.api.ts` (`investorApi`,`capitalApi`) | ✅ **selesai** | Field wajib `scheme`/`defaultRate` ditambahkan ke form. `investorModalApi` (410 di production) diganti total dengan `capitalApi` (`/capital-accounts`, `/capital-transactions`, `/capital/deposits`, `/capital/withdrawals`) di `InvestorCapitalModal.tsx` baru — idempotency-key + branch-header + cache invalidation lengkap. |
| `create_investor_obligation` | `investor-obligation/*` | ✅ **selesai — modul baru** | Dibangun dari nol: list+filter, detail+riwayat pembayaran, generate, bayar (Idempotency-Key wajib), reverse. Ketemu gap kontrak: endpoint reverse balikin objek obligation, bukan payment (PRD salah) — sudah diikuti kode backend yang sebenarnya. |

### Target dan Kinerja
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_target` | `target/*` | ✅ **selesai — modul baru** | Dibangun dari nol: satu resource `BranchTarget` (unit+revenue sekaligus, bukan dua modul terpisah seperti PRD lama) dengan status `DRAFT→ACTIVE→CLOSED`. Edit hanya saat `DRAFT`, aktivasi & tutup lewat `ConfirmDialog`. Halaman lama (`target-penjualan/*.tsx`, 100% mock) dan menu `SALES_TARGET`/`REVENUE_TARGET` (deprecated permanen di backend) sudah dihapus, diganti menu tunggal `BRANCH_TARGET`. |

### CMS
| PRD file | FE | Status |
|---|---|:--:|
| `create_cms_site_setting`, `create_cms_homepage`, `create_cms_about`, `create_cms_testimonial`, `create_cms_catalog`, `create_cms_contact`, `create_cms_credit_simulation` | `cms/cms.api.ts` | ✅ sesuai — seluruh 7 modul CMS dicek field-by-field, endpoint & body cocok kontrak persis. |

> **Situs publik** (`src/features/landing/`) — dicek terpisah, **tidak ada drift**: seluruh endpoint `/public/*` (site-settings, homepage, about, contact-page, catalog+brands+detail+related, credit-simulation config+calculate, contact-messages) cocok `public.route.js` persis, termasuk penanganan field legacy vs field asli di `mapCatalogUnit()`.

### Ringkasan (37 PRD file)
- ✅ **Selesai/sesuai kontrak: 37 — semua PRD file sudah diimplementasikan.** dashboard, unit, rekondisi, lead, test-drive, lead-order/settlement, laporan, role, pengaturan, investor, investor-obligation, seluruh master data generik, cash-account, cash-transaction (+ reverse/inter-branch-transfer), operational-expense (+ multipart upload), recurring-expense, payroll, target, book, access control lain, seluruh CMS + situs publik.
- 🟡 **Drift tersisa: 0**
- ⬜ **Belum ada FE sama sekali: 0**

### 🎯 Sisa pekerjaan
Tidak ada item 🔴/🟠 tersisa dari daftar PRD. Yang tersisa murni peningkatan arsitektural non-blocking (lihat "Gap sistemik" di atas):
1. 🟢 **Angkat `useBranchScope()` jadi context provider global** — saat ini dipanggil per-halaman (state lokal); pilihan cabang Owner tidak ikut lintas halaman yang di-mount terpisah. Tidak mengganggu kebenaran data (tiap halaman query ulang dengan `branchKey`-nya sendiri), hanya soal kenyamanan UX.
2. 🟢 **Code-split bundle** — `npm run build` memperingatkan chunk utama >500kB gzip; pertimbangkan dynamic `import()` per rute kalau ukuran bundle mulai jadi masalah nyata.

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

### CMS UX + Error/Upload + Tabel — *rev 11* (acuan [docs/frontend/cms_module_prd.md](docs/frontend/cms_module_prd.md) §1.5)
- [x] **CMS auto/manual jelas** — `AutoValueField` (dropdown Otomatis/Manual + badge "Dihitung otomatis dari data") gantikan input ketik "auto" di Statistik Hero/About; `ModeSelect` (segmented radio + hint) gantikan input teks mode di Merek Populer & Unit Unggulan
- [x] **Validasi upload gambar** — util `validateImageFile` (`core/utils/imageValidation.ts`: 5 MB, JPG/PNG) dipakai `ImageUpload` (feedback instan sebelum upload)
- [x] **Error handling terpusat** — `core/api/apiError.ts`: `getApiErrorCode` (branching), `getApiErrorMessage` (tampilan), `getFieldErrors` (highlight field dari `VALIDATION_ERROR.details`)
- [x] **Tabel standar (§5)** — semua kolom aksi kini pakai dropdown `RowActions`/`ActionMenu`: BranchPage ("Kelola Foto" → extra), InvestorPage ("Kelola Modal" → extra), PembayaranPage ("Detail" → onView). Scan konfirmasi 0 deviasi.

### Loaders & Action UX — *rev 10*
- [x] **`Button` prop `loading`** — spinner + auto-disable (cegah double-click) di seluruh app; `aria-busy`
- [x] **`ConfirmDialog`** — tombol konfirmasi tampil spinner saat `loading`, `closeOnConfirm={false}` menahan dialog terbuka sampai proses selesai
- [x] **Skeleton loaders** — `Skeleton`, `TableSkeleton`, `StatCardSkeleton`, `PageLoader` (branded) di `ui/Skeleton.tsx` + shimmer CSS
- [x] **TableSkeleton** menggantikan spinner polos di 8 halaman: Inventory, Rekondisi, CRM, Penjualan, Pembayaran, CMS Katalog/Testimoni/Kontak
- [x] **CustomerLoader full-screen** (rev 9) untuk situs publik
- [x] **Aksi ada loading + konfirmasi** (cegah double-click & aksi tak sengaja):
  - Hapus Unit (`useUnitModals` → Inventory/Rekondisi) — loading + keep-open
  - Master: `SimpleMasterPage` (7 halaman), Vendor, Merek, Branch, Investor, Test Drive — loading + keep-open
  - CMS: simpan section/site-settings/katalog/kontak/simulasi → `loading`; hapus Testimoni & Pesan Kontak → loading + keep-open
- [ ] 🟢 Sisa `ConfirmDialog` adopsi pola `loading`: access (User/Role/Menu), CashFlow, Pengeluaran, Payroll, OrderDetailModal, TipeModal, InvestorModalModal, BranchImagesModal, RekondisiDetailModal (primitif sudah siap, tinggal oper `loading={mut.isPending}` + `closeOnConfirm={false}`)

### Customer Error Handling — *rev 9* (acuan [docs/customer-error-handler-prd.md](docs/customer-error-handler-prd.md))
- [x] `CustomerStates.tsx` — `EmptyCmsState` (CMS belum di-setup), `CustomerNotFound` (404 ramah), `CustomerServerError` (API down + WA hotline + Coba Lagi)
- [x] **`CustomerLoader` full-screen branded** — overlay `fixed inset-0 z-[100]` (menutupi header & footer) dengan logo/nama tenant, ring berputar, pulse, & bar indeterminate → beranda tampil hanya loader dulu, tidak setengah jadi
- [x] **404** — `notFoundComponent` di `__root` + `_public` (dalam PublicLayout) → CustomerNotFound
- [x] **Error boundary** — `errorComponent` di `_public` → CustomerServerError (onRetry=reset)
- [x] **Load-gate** — LandingPage & TentangPage tampil **hanya setelah data siap** (loading → CustomerLoader), `isError` → CustomerServerError, data CMS kosong → EmptyCmsState (tidak render kosong melompong)
- [x] KatalogPage `isError` → CustomerServerError (retry via `refetch`)

### Polish UI global — *rev 6*
- [x] **Modal notifikasi** — ikon sukses = ceklis hijau (`CheckCircle2`), gagal/peringatan = tanda seru (`AlertTriangle`), via `variant` di `uiSlice` + derivasi title
- [x] **Halaman 404** dipercantik (angka 404 besar + kartu ikon mobil + ambient glow)
- [x] **Branding dinamis** — Logo sidebar & kartu footer ambil nama/tagline/logo dari `usePublicSiteSettings()`
- [x] **Rekondisi = stepper modal** — Kelola Rekondisi jadi stepper (Buat→Isi Item→Pengerjaan→Selesai), tombol "Buat Rekondisi" pindah ke dalam modal, riwayat selesai collapsible
- [x] **Filter katalog publik** — `PriceRangeSlider` (dual range + input min/max kustom + nilai rupiah)
- [x] **Landing** — animasi scroll-reveal **sekali** (`Reveal` + IntersectionObserver unobserve) di section Keunggulan/Cara Kerja/Unggulan/Testimoni/CTA
- [x] **Tabel seragam** — cross-check: semua halaman DataTable, tanpa `<table>` manual & tanpa gambar di sel (kecuali Menu & Permission)
- [x] **Tabel seragam (rev 9)** — perbaiki deviasi: `TargetPenjualanPage`/`TargetPendapatanPage` (aksi inline `<Button>` + header 'Aksi' → `RowActions` + header `''`), `CashFlowPage` (tombol Edit/Nonaktif inline → `RowActions` + cek `usePermissions().can()`), `TestimoniPage` (hapus `<img>` avatar di sel → inisial saja per §4)

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

## 🔍 AUDIT HARDCODE / DATA STATIS (cross-check modul admin — rev 1 Jul 2026, dituntaskan rev 16)

> Hasil telusur pemakaian Redux store statis (`s.data.*` / `dataSlice`) & tipe `@/data/types` di seluruh modul admin.
> **Status rev 16: SELESAI SELURUHNYA.** `src/app/store/dataSlice.ts` (dummy Redux store peninggalan awal proyek —
> `units`/`leads`/`testDrives`/`sales`/`payments`/`expenses`) sudah tidak dipakai di mana pun lagi dan **dihapus total**
> dari codebase beserta registrasinya di `app/store/index.tsx`. Riwayat perbaikan:

- [x] **Test Drive — dropdown Unit** → API (`useUnits`) di `TestDriveFormModal`, bukan `s.data.units`.
- [x] **Rekondisi** → tombol "Tambah Unit" dihapus dari `RekondisiPage` (unit dibuat dari modul Inventory).
- [x] **Test Drive — list & CRUD** → sudah jadi modul API penuh (`test-drive/testDrive.api.ts`), lihat `create_test_drive` ✅ di atas.
- [x] **Dashboard** (`DashboardPage` & seluruh widget) → agregasi dari `dashboard.api.ts` real, lihat `create_dashboard` ✅ di atas.
- [x] **Laporan** (`LaporanCashflowPage.tsx`) → data real dari cash dashboard, lihat `create_laporan` ✅ di atas.
- [x] **Pembelian** (`PembelianPage.tsx`) → **rev 16**: diganti total ke `useUnits`/`useUnitModals` asli (field `purchaseCost`/`tanggalPembelian`/`statusUnit`/`fundingAgreement`), "pembelian" bukan endpoint terpisah — akuisisi unit = `POST /units`.
- [x] **Penjualan — quick-input "Buat Penjualan"** (`SaleFormModal.tsx`) → **rev 16**: file dummy dihapus, `QuickInput.tsx` sekarang pakai `SalesOrderFormModal.tsx` asli (form yang sama dengan tombol "Buat Order" di `PenjualanPage.tsx`) + `useLeadOrderMutations`.
- [x] **Pembayaran — quick-input "Catat Pembayaran"** (`PaymentFormModal.tsx`) → **rev 16**: dibangun ulang total. Backend TIDAK punya endpoint "catat pembayaran" berdiri sendiri — pembayaran selalu terikat ke satu `LeadOrder` (`POST /lead-orders/:id/payments`). Modal baru: langkah 1 cari & pilih order, langkah 2 reuse komponen `PayForm` (diekspor dari `OrderDetailModal.tsx`) — sama persis dengan form pembayaran di halaman detail order, termasuk idempotency-key & posting kas.
- [x] **`ExpenseFormModal.tsx`** — **rev 16**: dead code (tidak direferensikan di mana pun), dihapus.
- [x] Simulasi kredit config (landing) — sudah pakai `usePublicCreditConfig`, bukan hardcode (lihat "Situs Publik" — tidak ada drift).

### Sudah dinamis (rev 8) ✅
- Halaman **publik/customer** (`landing/*`) konsumsi `/public/*` (lihat section "Situs Publik / Customer (API nyata)"). Redux dummy `s.data.*` **tidak lagi** dipakai di situs publik.

---

## 🚧 BELUM / SEBAGIAN (To Do)

### A. Integrasi API modul bisnis — SELESAI SEMUA ✅ (section basi dari rev 1, lihat tabel PRD di atas untuk status akurat)
- [x] **Unit** — list + CRUD + upload foto, `InventoryPage`/`UnitFormModal` full real API.
- [x] **Rekondisi** — entri biaya per unit, detail item, progress/done, stepper 6 langkah.
- [x] **Test Drive** — form + lookup unit dari API real.
- [x] **Pengeluaran & Cash Flow** — CRUD transaksi, per kategori, upload bukti multipart.
- [x] **Dashboard & Laporan** — data agregasi dari API real (bukan dummy).

### B. Penyempurnaan CRM/Sales 🟠
- [ ] 🟠 Upload foto KTP di form Lead (`multipart`)
- [ ] 🟠 Harga penawaran unit di Sales Order (ambil OTR dari unit terpilih)
- [ ] 🟠 Notifikasi/validasi unit tidak boleh double-order
- [ ] 🟢 Filter lead by sumber, sales, tanggal

### C. RBAC & Guard Halaman 🟠
- [x] Sidebar dinamis dari `groupMenus` (`/auth/me`) + `PATH_BY_CODE`
- [x] Guard aksi per-permission (Role/User/Menu, Penjualan, Pembayaran, Target, Book, Investor Obligation, dan lain-lain yang dibangun sejak rev 11)
- [x] **CRM/Lead** — **rev 16**: `CrmPage.tsx` sebelumnya nol permission-check (page & semua tombol tampil ke siapa saja walau backend menolak). Ditambah `RequirePermission code="LEAD_READ"` + gate `can('LEAD_CREATE')`/`can('LEAD_UPDATE')` di tombol Tambah/Edit/Ubah-Status. (`LEAD_DELETE` ada di seed permission tapi backend tidak punya route delete-nya — sengaja tidak ada tombol hapus, itu bukan gap.)
- [ ] 🟠 **Ditemukan saat audit rev 16, BELUM diperbaiki** — beberapa halaman modul lama (pre-rev 8) sama sekali tidak punya `RequirePermission`/`Can`: `InventoryPage.tsx`, `RekondisiPage.tsx`, `MerekPage.tsx` (dicek 0 pemakaian `can()`/`Can` sama sekali). Halaman lain yang lebih baru (Payroll/Pengeluaran/Test Drive/CashFlow) sudah punya sebagian gating tapi belum diaudit lengkap per-endpoint. Ini scope terpisah & cukup besar (audit permission code per tombol untuk tiap modul) — belum digarap di sesi ini, perlu keputusan eksplisit sebelum dikerjakan karena menyentuh banyak halaman sekaligus.

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

**Situs PUBLIK (website customer) — SUDAH konsumsi API asli, lihat section F di bawah ✅**

| Halaman publik | Endpoint yang dipakai | Status |
|----------------|-----------------------------|:--:|
| Layout (`PublicLayout`) header/footer | `GET /public/site-settings` (`navLinks`, logo, sosial) | ✅ `usePublicSiteSettings` |
| Beranda (`LandingPage`) | `GET /public/homepage` (agregat 7 section) | ✅ |
| Katalog (`KatalogPage` publik) | `GET /public/catalog`, `/catalog/brands`, `/catalog-page` | ✅ `usePublicCatalog`/`usePublicCatalogBrands`/`usePublicCatalogPage` |
| Detail (`KatalogDetailPage`) | `GET /public/catalog/:id`, `/related`, config | ✅ |
| Simulasi (`SimulasiPage`) | `GET /public/credit-simulation/config` + `POST /calculate` | ✅ `usePublicCreditConfig`/`useCalculateCredit` |
| Tentang (`TentangPage`) | `GET /public/about` | ✅ |
| Kontak (`KontakPage`) | `GET /public/contact-page` + `POST /public/contact-messages` | ✅ |

> Tabel di atas sempat basi (ditulis rev 1 Jul saat migrasi baru direncanakan) — migrasi situs publik sudah tuntas sejak rev 8 (lihat section F "CMS + Situs Publik — SELESAI" tepat di bawah). Dummy Redux `s.data.*` yang jadi alasan ⬜ di tabel lama sudah dihapus total di rev 16.

### F. CMS + Situs Publik — SELESAI ✅
- [x] Panel admin CMS: Site Settings, Beranda (7 section), Tentang (5 section), Testimoni, Katalog (publish+galeri+header), Kontak & Pesan (inbox), Simulasi Kredit
- [x] **Situs publik consume `/public/*`** — 7 halaman (`landing/*`) sudah dinamis dari API (site-settings, homepage, about, catalog+detail+related, credit config+calculate, contact submit). Data dummy Redux tidak lagi dipakai di situs publik.
- [ ] 🟢 Verifikasi end-to-end dengan backend aktif (uji render nyata + submit form).

### Z. Perbaikan build (bukan CMS/publik — pekerjaan paralel) 🟠
- [x] **3 file error build**: `DashboardCashflowPage` ditulis ulang total (data real, bukan fabrikasi); `TargetPendapatanPage`/`TargetPenjualanPage` (100% mock lama) dihapus, diganti modul `target/*` baru berbasis kontrak backend nyata. `tsc -b --noEmit` bersih.

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
