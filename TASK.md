# TASK LIST — GM Mobilindo E-Catalogue

> 🔌 **Peta endpoint per menu (untuk crosscheck FE↔BE)**: lihat [ENDPOINT-TRACKING.md](ENDPOINT-TRACKING.md).
>
> Daftar task actionable turunan dari [PRD.md](PRD.md) & [SRS](SRS_GM_Mobilindo.md).
> Status: `[x]` selesai · `[~]` sebagian · `[ ]` belum. Prioritas: 🔴 tinggi · 🟠 sedang · 🟢 rendah.
>
> **Terakhir diperbarui:** 22 Juli 2026 (rev 21 — **fix bug simpan BRANCH_CONTEXT_REQUIRED + konsolidasi pemilihan cabang ke header**: (1) BUG — modul Unit, Lead, Rekondisi, Test Drive TIDAK pernah mengirim `X-Branch-Id` di mutation-nya padahal backend `router.use(resolveBranchScope)` mewajibkannya untuk OWNER/ADMIN → semua "Simpan" gagal 422. Diperbaiki di AKAR: **axios request interceptor** kini melampirkan `X-Branch-Id` OTOMATIS dari state global (`branchSlice`/`auth`) ke SEMUA request bila belum di-set eksplisit — sekali fix menutup seluruh modul & mencegah celah "lupa kirim header" di masa depan. (2) **Pemilihan cabang dikonsolidasi ke satu tempat: BranchSwitcher di header.** Selector cabang per-halaman (Dashboard, Cashflow, Book, Target, Investor Obligation, Penjualan, Pembayaran, modal Investor Capital) DIHAPUS; banner "pilih cabang" kini mengarahkan ke header. (3) Notifikasi (lonceng) & kalender di header DIHAPUS. (4) Ikon kaca pembesar di search `SearchableSelect` dirapikan (kelas `left-4.5` tak valid → distruktur ulang). (5) Pesan error branch-context dibuat ramah ("Pilih cabang aktif di header..."). `tsc`/`eslint`/`build` bersih.)
>
> rev 20 — **audit tuntas dropdown & datepicker**: seluruh `<select>` native tersisa (9 file: Dashboard, Inventory, Investor Capital, Rekondisi Detail, Test Drive, CMS, Katalog publik, Simulasi Kredit publik) diganti `SearchableSelect`/`SelectField` bertema; `SelectField` (`Field.tsx`) DITULIS ULANG jadi wrapper tipis di atas `SearchableSelect` (1 perbaikan komponen bersama menuntaskan 33 titik pemakaian sekaligus, pola sama dgn `CurrencyField`/`useSectionForm`). Ditambah **`MonthField`** (kalender bulan+tahun kustom) menggantikan 6 `<input type="month">` polos (Target, Dashboard, Pengeluaran, Payroll ×2, Book) — melengkapi `DateField` yang sebelumnya cuma menutup granularitas harian. Hasil: nol `<select>`, nol `type="date"`, nol `type="month"` polos tersisa di seluruh app (app admin + situs publik). `tsc`/`eslint`/`build` bersih.)
>
> rev 19 — **branch context global OWNER/ADMIN** (`.prd/frontend_owner_admin_branch_context_20260721.md` + `frontend_validation_checklist_20260721.md`): `selectedBranchId` dipindah dari state lokal per-halaman ke Redux (`branchSlice`, persist localStorage) = SATU sumber kebenaran; ditambah **BranchSwitcher global** di header (OWNER/ADMIN), verifikasi cabang tersimpan terhadap options, dan invalidasi seluruh query branch-scoped saat cabang berubah. Ini juga menuntaskan "Gap sistemik" lama (branch-scope belum context provider global).
>
> rev 18 — **migrasi besar "module-owned lookup"** (`.prd/update_module_owned_lookup_20260721.md` + `docs/lookup.md`): seluruh `/finance/lookups/*` global DIHAPUS backend & diganti endpoint lookup per-module; ditambah `/branch-context/options`; Target pilih cabang eksplisit (`branchId` di body); overhaul UI: `SearchableSelect` (dropdown + pencarian) & `DateField` (kalender) seragam, format angka/Rupiah dibetulkan.

---

## ⚠️ Status eksekusi saat ini (22 Juli 2026)

### 🩹 Fix bug simpan (BRANCH_CONTEXT_REQUIRED) + konsolidasi cabang (rev 21)
**Bug**: OWNER/ADMIN menyimpan data di Inventory (dan modul lain) gagal 422 `BRANCH_CONTEXT_REQUIRED`. Akar masalah: backend memasang `router.use(resolveBranchScope)` di 16 modul (unit, lead, lead-order, test-drive, rekondisi, cash-account, cash-transaction, cash-flow, operational-expense, recurring-expense, payroll, book, investor-capital, investor-obligation, dashboard, private-media) yang mewajibkan header `X-Branch-Id` untuk semua mutation role global — tapi FE modul **Unit, Lead, Rekondisi, Test Drive** tak pernah mengirimnya (hanya finance/target/book/investor yang sudah, via passing manual).
- **Perbaikan di akar (bukan tambal per-modul)**: `src/core/api/interceptor.ts` — request interceptor melampirkan `X-Branch-Id` OTOMATIS dari SATU sumber global (`store.getState().branch.selectedBranchId` untuk OWNER/ADMIN, atau `user.branch.id` untuk role lain) ke SEMUA request, kecuali sudah di-set eksplisit pemanggil. Menutup seluruh modul sekaligus + mustahil "lupa kirim header" lagi. Non-scoped route (master, role, dst.) mengabaikan header → aman. GET OWNER tanpa cabang (null) → tanpa header → konsolidasi semua cabang (perilaku benar).
- **Konsolidasi pemilihan cabang ke HEADER (satu tempat)**: user minta pemilihan cabang di satu lokasi. `BranchSwitcher` di header jadi SATU-SATUNYA kontrol. Selector cabang per-halaman DIHAPUS dari: Dashboard, Cashflow, Book, Target, Investor Obligation, Penjualan, Pembayaran, modal Investor Capital. `setSelectedBranchId` kini HANYA dipanggil dari `BranchSwitcher`. Banner "pilih cabang" & pesan error diarahkan ke header.
- **Pesan error ramah** (`notify.ts`): kode `BRANCH_CONTEXT_REQUIRED`/`BRANCH_SCOPE_FORBIDDEN`/`BRANCH_NOT_FOUND`/`BRANCH_NOT_ASSIGNED`/`CROSS_BRANCH_RELATION` dipetakan ke pesan Indonesia yang mengarahkan ke switcher header (bukan "Header X-Branch-Id..." teknis).
- **Header dirapikan**: tombol notifikasi (lonceng) & kalender DIHAPUS (nonfungsional). Ikon kaca pembesar di `SearchableSelect` diperbaiki (kelas `left-4.5` tak valid → wrapper input distruktur ulang, ikon `left-3` + `pl-9`).

> Build **hijau** (`tsc -b --noEmit`, `eslint .`, `npm run build` semua lulus). Unit test suite TIDAK bisa dijalankan karena dependency `@adobe/css-tools` rusak di node_modules (ESM path `.mjs` hilang) — error saat import, BUKAN dari kode; perlu `npm install` ulang untuk memperbaiki env test. Seluruh 37 file kontrak PRD backend + 5 addendum (vendor code, target branch-selection, module-owned lookup, branch-context OWNER/ADMIN, validation-checklist) sudah terhubung ke API asli.

### 🔍 Audit tuntas dropdown & datepicker (rev 20 — permintaan user)
User minta di-crosscheck ULANG: apa benar SEMUA dropdown (filter maupun form) sudah pakai input pencarian & bertema (bukan `<select>` default browser), dan semua datepicker sudah kalender kustom (bukan `<input type="date">` polos)? Audit rev 18 sebelumnya baru menutup SEBAGIAN — grep menemukan sisa:
- **9 file dengan `<select>` native tersisa**: `dashboard/DashboardPage.tsx` (filter cabang inline), `inventory/InventoryPage.tsx` (filter Merek), `master/InvestorCapitalModal.tsx` (filter tipe transaksi), `rekondisi/RekondisiDetailModal.tsx` (pilih pengecekan saat tambah item), `test-drive/TestDrivePage.tsx` (filter status & sales, 2 titik), `cms/CmsKit.tsx` (toggle Manual/Otomatis nilai statistik — diganti **segmented toggle button**, bukan combobox, karena cuma 2 opsi biner), `landing/KatalogPage.tsx` (situs publik, sortir katalog), `landing/SimulasiPage.tsx` (situs publik, pilih mobil) — semua diganti `SearchableSelect` (kecuali toggle biner CmsKit).
- **Perbaikan level komponen bersama (leverage tertinggi)**: `SelectField` (`src/shared/components/ui/Field.tsx`) — dipakai di **33 titik lintas 18 file admin** — ternyata SELAMA INI masih merender `<select>` native polos di baliknya (celah yang lolos rev 18 karena audit sebelumnya cuma cek `SearchableSelect`/`DateField` langsung, bukan komponen pembungkus). Ditulis ulang jadi wrapper tipis di atas `SearchableSelect` (pola sama seperti `CurrencyField` di atas `NumericField` rev 18) — signature `onChange={(e) => ...e.target.value}` dipertahankan 100% drop-in compatible, jadi 33 titik pemakaian otomatis ikut cantik tanpa sentuh satu pun caller.
- **`type="date"` polos**: nol tersisa (sudah tuntas rev 18).
- **`type="month"` polos — GAP baru ditemukan**: `DateField` rev 18 cuma menutup granularitas harian; 6 file masih pakai `<input type="month">` bawaan browser (styling beda-beda tiap OS) untuk field Periode: `target/TargetFormModal.tsx`, `target/TargetPage.tsx`, `dashboard/DashboardPage.tsx`, `pengeluaran/PengeluaranPage.tsx` (Generate Rutin), `payroll/PayrollPage.tsx` (×2 — edit item & Generate Payroll), `book/BookPage.tsx`. Dibuat **`MonthField`** baru (`src/shared/components/ui/MonthField.tsx`) — popover grid 12 bulan + navigasi tahun, format ISO `YYYY-MM` (kompatibel dengan value lama), tombol pintasan "Bulan Ini". Semua 6 titik dimigrasi.
- **Verifikasi akhir**: `grep -rn "<select"` / `'type="date"'` / `'type="month"'` di seluruh `src/` → nol hasil (di luar komentar dokumentasi komponen itu sendiri). `tsc -b --noEmit`, `eslint .`, `npm run build` semua bersih.

### 🌿 Branch Context Global OWNER/ADMIN (rev 19 — `.prd/frontend_owner_admin_branch_context_20260721.md` + `frontend_validation_checklist_20260721.md`)
Menjadikan pemilihan cabang **satu sumber kebenaran global** (sebelumnya tiap halaman punya state cabang lokal yang tidak sinkron — ini "Gap sistemik" lama yang akhirnya tuntas):
- **`src/app/store/branchSlice.ts`** — `selectedBranchId` disimpan di Redux + localStorage (bertahan antar reload). `null` = "semua cabang" (hanya untuk READ).
- **`useBranchScope` ditulis ulang** — baca/tulis Redux (bukan `useState` lokal). Semua halaman & modal kini membaca cabang yang SAMA (fix: pilihan Owner tak lagi terisolasi per komponen yang di-mount terpisah). `setSelectedBranchId` juga meng-invalidasi seluruh query branch-scoped (list/lookup/detail/summary) supaya data cabang lama tidak bocor (PRD §6.3).
- **`BranchSwitcher` global** di header (`src/shared/layout/BranchSwitcher.tsx`) — hanya untuk OWNER/ADMIN, opsi dari `/branch-context/options` (tanpa `BRANCH_READ`); cabang tersimpan yang tak lagi valid di options otomatis di-reset. Selector cabang per-halaman lama tetap ada tapi kini semua terikat state global yang sama (kontrol tambahan, bukan sumber terpisah).
- **Kebenaran aksi resource existing (verified ke kode backend)**: `pay`/`update`/`delete`/`reverse` memakai `branchWhere(scope)` HANYA untuk *menemukan* resource lalu posting ke `resource.branchId`. Jadi: mode "semua cabang" (tanpa header) → temukan resource manapun → posting ke cabangnya sendiri ✅; mode cabang konkret → list terfilter, hanya lihat/aksi cabang itu ✅. Maka mengirim header global (perilaku sekarang) sudah BENAR — tidak perlu menyuntik `resource.branchId` ke tiap mutation (rekomendasi PRD bersifat belt-and-suspenders untuk kasus yang UX-nya sudah dicegah).
- **Error handling branch** (`BRANCH_CONTEXT_REQUIRED`/`BRANCH_SCOPE_FORBIDDEN`/`CROSS_BRANCH_RELATION`) sudah dipetakan di `FinanceErrorBanner`/`notifyApiError`; guard `mutationBlocked` (Owner wajib pilih cabang) sudah ada di seluruh form mutasi finansial sejak rev 14.
- **Verifikasi checklist**: nol referensi endpoint legacy/`/finance/lookups`, nol hardcode `'OWNER'` di luar `useBranchScope` (ADMIN dapat perilaku global sama), semua query branch-scoped punya `branchKey` di key, base URL dari env. Sisa item checklist bersifat QA manual (butuh backend + multi-role di runtime) — didokumentasikan di `docs/frontend-manual-validation.md` backend.

### 🔀 Migrasi Module-Owned Lookup (rev 18 — `.prd/update_module_owned_lookup_20260721.md`)
Backend **menghapus** seluruh `/finance/lookups/*` global + aggregate lama (`/lead-orders/sales`, `/test-drives/units|sales`, aggregate `/rekondisis/lookups`, aggregate `/payroll/lookups`) dan menggantinya dengan endpoint lookup **milik masing-masing module** (`authorizeAny` — user cukup punya permission module pemakai, tidak perlu permission CRUD sumber). Seluruh FE dimigrasikan:
- **Infrastruktur baru**: `src/features/finance/lookup.ts` (hook lookup akun-kas/kategori/template/payroll per-module dengan query key ter-namespace per module+cabang), `src/features/auth/branchContext.api.ts` (`/branch-context/options` untuk 7 selector cabang global, tak perlu `BRANCH_READ`). Select bersama di `finance/components.tsx` (`CashAccountSelect`, dll) diubah jadi **presentational** (data dipasok caller, pakai `SearchableSelect`).
- **Per module**: Unit (semua via `/units/lookups`), Rekondisi (vendors/checks/cash-accounts terpisah), Cash Transaction, Book, Operational + Recurring Expense, Payroll (4 endpoint: users/sales/deal-orders/cash-accounts), Investor Capital (`/investors/:id/lookups/cash-accounts`), Investor Obligation, Lead Order (`order-form` + `cash-accounts` terpisah), Test Drive (aggregat baru), CRM Lead (`/leads/lookups` sumber), Access Control (User `/users/lookups`, Branch PIC `/branches/lookups/pics`, Role permission `/roles/lookups/permissions`), CMS Homepage (`/cms/homepage/lookups` untuk pemilih merek/unit unggulan mode manual).
- **Dihapus total**: `financeLookupApi` + 10 hook `useLookup*` + 9 tipe `Lookup*` dari modul finance. Grep memastikan **nol** referensi `/finance/lookups` atau endpoint legacy tersisa.
- **1 catatan gap backend**: tidak ada lookup unit khusus Rekondisi (backend hanya sediakan vendors/checks/cash-accounts). Karena rekondisi memang operasi berbasis unit, RekondisiPage pakai daftar `/units` nyata (`useUnits`) lalu saring `statusUnit === 'INVENTORY'` di klien — didokumentasikan sbg komentar di kode.

### 🎯 Target — pilih cabang eksplisit (rev 18, backend kini SUDAH implementasi)
Di rev 17 addendum ini ditunda karena backend belum siap. Commit `097f079` backend menambah `branchId` wajib di `createBranchTargetSchema`, `/targets/lookups/branches`, dan menghapus cek `TARGET_DISTRIBUTION_MISMATCH` pada activate. FE sekarang: create target mengirim `branchId` di body, selector cabang dari `/targets/lookups/branches`, update tetap tak boleh ubah cabang.

### 🎨 Overhaul UI (rev 18 — permintaan user)
- **`SearchableSelect`** (`src/shared/components/ui/SearchableSelect.tsx`) — dropdown dengan input pencarian di dalamnya + keyboard nav, popover di-portal (tak terpotong modal). Dipakai untuk semua dropdown lookup panjang (unit, lead, sales, akun kas, merek, vendor, PIC, role, dll) di form maupun filter.
- **`DateField`** (`src/shared/components/ui/DateField.tsx`) — date picker kalender kustom bertema, mengganti `<input type="date">` polos di 12 file (value tetap ISO `YYYY-MM-DD`).
- **Checklist search** — pencarian ditambahkan ke checklist Perlengkapan/Dokumen (Unit form), assignment permission (Role), dan pemilih manual merek/unit (CMS Homepage).
- **Format angka** — bug "Tahun 2.026" dibetulkan (`NumericField` prop `thousands={false}` untuk angka non-uang); `CurrencyField` dibangun ulang di atas `NumericField` supaya nominal Rupiah selalu berpemisah ribuan "1.000.000" (sebelumnya `<input type=number>` polos tanpa pemisah). Sisa input nominal mentah (Rekondisi item, Payroll tunjangan/potongan, Generate pengeluaran) juga dibetulkan.
- **Modal diperbesar** — form Tambah/Edit Unit `size` `lg`→`xl` untuk kemudahan input.

---

## ⚠️ Status eksekusi (arsip rev 17, 21 Juli 2026)

> Build **hijau**. Seluruh 37 file kontrak PRD backend sudah terhubung ke API asli.

**Selesai & terverifikasi (`tsc`/`eslint`/`build` bersih):** Dashboard, Unit (funding/pricing), Pembelian Unit, Rekondisi, Lead, Test Drive, Lead Order/Settlement + quick-input Penjualan/Pembayaran, Investor (capital), Investor Obligation, Laporan, Pengaturan, Role, Cash Account & Cash Transaction, Payroll & Pengeluaran, Target, Book/Pembukuan, **Vendor** (`code` field addendum), **RBAC guard** (seluruh halaman admin kini punya `RequirePermission`/`Can` yang sesuai kode permission backend).

### 🩹 Bug diperbaiki rev 17
- **`crypto.randomUUID is not a function`** — `crypto.randomUUID()` HANYA ada di secure context (HTTPS atau `localhost`). Tim ini mengakses app lewat IP LAN via HTTP biasa (mis. `http://10.x.x.x:5173`), yang BUKAN secure context, jadi `crypto.randomUUID` benar-benar tidak ada di window `crypto` dan langsung `TypeError` saat modal manapun dibuka. Dibuatkan `src/core/utils/uuid.ts` (`safeRandomUUID()`, fallback manual RFC4122-v4 kalau `crypto.randomUUID` tidak tersedia) dan dipasang di 3 titik pemakaian: `Modal.tsx` (modal-stack id), `useIdempotencyKey.ts`, `uiSlice.tsx` (toast id).

### 🔄 Crosscheck backend rev 17 (2 commit baru: `bb53624`, `eecc553`)
1. **Vendor — tambah field `code`** (`.prd/update_vendor_code_20260720_203949.md`) — ✅ **sudah diimplementasikan** (lihat entri Vendor di tabel Master di bawah).
2. **Branch-scope: role `ADMIN` disamakan dengan `OWNER`** (akses semua cabang) — perubahan nyata di `branch-scope.middleware.js` (`GLOBAL_BRANCH_ROLE_CODES = new Set(["OWNER","ADMIN"])`). **Sudah benar di FE** — `useBranchScope.ts` sudah punya `hasAllBranchScope()` yang mencakup kedua role ini (dicek ulang, tidak ada hardcode `'OWNER'` lain yang lolos di luar hook ini).
3. **Target — "pilih cabang eksplisit" + distribusi sales opsional** (`.prd/update_target_branch_selection_optional_sales_20260720_213510.md`) — 🔴 **BELUM diimplementasikan di backend** (dinyatakan eksplisit di PRD-nya sendiri: "Implementasi backend saat ini masih menggunakan `req.branchScope`... masih menghasilkan `TARGET_DISTRIBUTION_MISMATCH`"). Dicek langsung: `target.validation.js` belum punya field `branchId` pada `createBranchTargetSchema`, endpoint `GET /targets/lookups/branches` belum ada. **Sengaja TIDAK diimplementasikan di FE dulu** — mengikuti prioritas README §1 (kode backend nyata > file PRD) supaya modul Target yang sudah jalan sekarang tidak dirusak dengan mengirim field yang belum didukung. Perlu dikerjakan ulang begitu backend menyusul.

### 🛡️ Audit RBAC rev 17 — dituntaskan
Ditemukan cukup banyak halaman admin lama (pre-rev 16) yang nol permission-check sama sekali (tombol create/edit/delete tampil ke semua orang walau backend akan menolak). Semua sudah ditambahkan `RequirePermission`/`Can`/`can()` sesuai kode permission asli backend (dicek langsung ke `*.route.js` masing-masing modul, bukan ditebak dari nama): `InventoryPage`, `PembelianPage`, `RekondisiPage`+`RekondisiDetailModal` (gate ganda status+permission untuk submit/progress/done/pay), `MerekPage`+`TipeModal`, `CrmPage`, `PayrollPage`, `PengeluaranPage`, `CashFlowPage`, `DashboardCashflowPage`, `LaporanCashflowPage`, `TestDrivePage`, `DashboardPage`.

### 🎯 Audit UX "confirm + loading + refresh + feedback" rev 17
User menetapkan standar: **setiap aksi selain GET (simpan/edit/hapus/dll) wajib** punya (1) dialog konfirmasi, (2) indikator loading, (3) penutupan modal otomatis setelah sukses, (4) refresh data (invalidate query), (5) indikator sukses/gagal yang jelas — supaya tidak ada race condition/double-submit dan user tidak bingung apakah aksinya berhasil.

Ditemukan infrastruktur yang **sudah dibangun matang** untuk pola ini (kemungkinan dari pekerjaan sebelumnya di sesi ini yang tidak sempat tercatat detail di rev sebelumnya): `ConfirmedActionProvider`/`useConfirmedAction()` (`src/shared/components/ui/ConfirmedActionProvider.tsx`) — pembungkus generik: 1 pemanggilan `confirmAction({title,message,execute,onSuccess,onError})` otomatis menampilkan `ConfirmDialog`, menjaga `running` state (blokir double-click), lalu memanggil `onSuccess`/`onError`. Dipakai luas di Vendor, Target, Unit, Branch Images, CMS Katalog. Juga `DataTable` sudah punya prop bawaan `loading`/`refreshing`/`error`/`onRetry`/`emptyState` (dengan `EmptyState` komponen: ikon+judul+deskripsi) — dipakai di banyak halaman (Role, User, Branch, Investor, Merek, master generik, Vendor, Target, Test Drive, Payroll, Pengeluaran, Pembelian, Cash Flow).

**Gap konkret yang ditemukan & diperbaiki** (aksi yang sebelumnya `onClick={() => x.mutate(...)}` langsung tanpa dialog konfirmasi sama sekali):
- `UnitDetailModal.tsx` — tombol Hapus foto unit (destruktif, sebelumnya tanpa konfirmasi sama sekali).
- `KatalogPage.tsx` (CMS) — tombol Hapus foto galeri unit, dan tombol Simpan Header Katalog.
- `ContactInboxPage.tsx` (CMS) — tombol Simpan Header Halaman Kontak.
- `SiteSettingsPage.tsx` (CMS) — tombol Simpan & Simpan Semua.
- `CreditSimPage.tsx` (CMS) — tombol Simpan konfigurasi simulasi kredit.
- **`useSectionForm` (`cms.hooks.ts`)** — 1 perbaikan di level hook ini otomatis menuntaskan **11 section** Homepage (7) + About (5) sekaligus (hero, brands, why-us, how-it-works, featured, testimonials, cta × 2 halaman), karena semuanya memanggil hook generik yang sama.

**Catatan jujur soal kelengkapan**: ada ±136 titik `.mutate()/.mutateAsync()` tersebar di seluruh codebase — audit ini menelusuri secara sistematis (grep pola `onClick={() => x.mutate(`, cross-check semua aksi destruktif "remove/delete") dan memverifikasi tiap mutation hook punya toast+invalidate di levelnya, tapi BUKAN peninjauan baris-demi-baris utuh 136 titik tsb satu per satu. Kemungkinan masih ada 1-2 aksi kecil/jarang dipakai yang lolos; laporkan kalau ditemukan ada tombol yang terasa "langsung terjadi tanpa konfirmasi" saat dipakai.

### 🔴 Gap sistemik (memengaruhi banyak modul sekaligus)
1. **Header `X-Branch-Id`** — ✅ helper (`src/features/auth/useBranchScope.ts`) sudah terpasang lengkap di seluruh modul branch-scoped: cash-account, cash-transaction, operational-expense, recurring-expense, payroll, Target, Book. **rev 19 — TUNTAS**: `selectedBranchId` sudah diangkat jadi context provider global (`branchSlice` Redux + `BranchSwitcher` di header), tidak lagi state lokal per-halaman — lihat bagian "🌿 Branch Context Global OWNER/ADMIN" di atas.
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
| `create_vendor` (+ addendum `update_vendor_code_20260720_203949.md`) | `master/master.api.ts`, `VendorPage.tsx`, `VendorFormModal.tsx` | ✅ sesuai — field `code` (wajib, unik, ditampilkan sbg kolom tabel + form) sudah ditambahkan rev 17 |
| `create_branch` | `master/master.api.ts` | ✅ sesuai |
| `create_leasing`, `create_sumber_lead`, `create_pengecekan`, `create_kategori_pengeluaran`, `create_metode_pembayaran`, `create_dokumen`, `create_perlengkapan` | `master/simpleMaster.api.ts` | ✅ sesuai (7 modul generik `{name,code,isActive}` — kebetulan identik hari ini, tapi rawan drift diam-diam kalau salah satu Joi schema berubah nanti) |
| `create_investor` | `master/master.api.ts` (`investorApi`,`capitalApi`) | ✅ **selesai** | Field wajib `scheme`/`defaultRate` ditambahkan ke form. `investorModalApi` (410 di production) diganti total dengan `capitalApi` (`/capital-accounts`, `/capital-transactions`, `/capital/deposits`, `/capital/withdrawals`) di `InvestorCapitalModal.tsx` baru — idempotency-key + branch-header + cache invalidation lengkap. |
| `create_investor_obligation` | `investor-obligation/*` | ✅ **selesai — modul baru** | Dibangun dari nol: list+filter, detail+riwayat pembayaran, generate, bayar (Idempotency-Key wajib), reverse. Ketemu gap kontrak: endpoint reverse balikin objek obligation, bukan payment (PRD salah) — sudah diikuti kode backend yang sebenarnya. |

### Target dan Kinerja
| PRD file | FE | Status | Catatan |
|---|---|:--:|---|
| `create_target` (+ addendum branch-selection & module-owned-lookup) | `target/*` | ✅ **selesai (rev 18 update penuh)** | `BranchTarget` (unit+revenue) status `DRAFT→ACTIVE→CLOSED`. **rev 18**: adopsi addendum "pilih cabang eksplisit" — `branchId` dikirim di body create (backend commit `097f079` sudah wajibkan), selector cabang dari `/targets/lookups/branches`, activate tak lagi menuntut distribusi sales sama. Halaman lama (`target-penjualan/*.tsx` mock) & menu `SALES_TARGET`/`REVENUE_TARGET` sudah dihapus, diganti menu tunggal `BRANCH_TARGET`. |

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
Tidak ada item 🔴/🟠 tersisa dari daftar PRD. ~~Angkat `useBranchScope()` jadi context provider global~~ sudah tuntas di rev 19 (`branchSlice` + `BranchSwitcher`). Yang tersisa murni peningkatan non-blocking:
1. 🟢 **Code-split bundle** — `npm run build` memperingatkan chunk utama >500kB gzip; pertimbangkan dynamic `import()` per rute kalau ukuran bundle mulai jadi masalah nyata.

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
