# Tenant Web — PRD Tracking

> Daftar task actionable turunan dari [PRD.md](PRD.md) & [SRS](SRS_GM_Mobilindo.md).
> Status: `[x]` selesai · `[~]` sebagian · `[ ]` belum. Prioritas: 🔴 tinggi · 🟠 sedang · 🟢 rendah.
>
> **Terakhir diperbarui:** 17 Juli 2026 (rev 12 — audit ulang terhadap `ecatalogue-be/.prd/*` (37 file kontrak baru dari backend) + `ecatalogue-be/docs/*`; tabel di bawah adalah **sumber kebenaran status integrasi saat ini**, menggantikan asumsi lama di section "Status Integrasi API"/"AUDIT HARDCODE" di bawah bila bertentangan)

---

## 📋 Tracking Integrasi per PRD Backend (`ecatalogue-be/.prd/`)

> Backend (`ecatalogue-be`) kini jadi sumber kebenaran kontrak API — lihat `ecatalogue-be/.prd/README.md` untuk aturan lintas-modul (envelope response, branch scope, permission, idempotency, dll). Tabel ini memetakan **setiap file PRD backend** → status implementasi FE. Audit dilakukan dengan cross-check langsung ke `ecatalogue-be/src/routes.js` + `ecatalogue-be/src/modules/*` (backend) dan `src/routes/_admin/*` + `src/features/*` (frontend), bukan hanya dari klaim dokumen lama.
>
> Legenda status: ✅ **done** (UI real + API tersambung penuh) · 🟡 **partial** (UI ada tapi API belum lengkap/ada penyimpangan) · ⬜ **not-started** (belum ada FE sama sekali, atau 100% dummy).

### Dashboard

| PRD file           | Modul FE                 | Backend  | Status | Catatan                                    |
| ------------------ | ------------------------ | :------: | :----: | ------------------------------------------ |
| `create_dashboard` | Dashboard (`/dashboard`) | ✅ wired |   ✅   | `features/dashboard/dashboard.api.ts` real |

### Unit

| PRD file           | Modul FE                                              | Backend  | Status | Catatan                                                                              |
| ------------------ | ----------------------------------------------------- | :------: | :----: | ------------------------------------------------------------------------------------ |
| `create_unit`      | Inventory, Ready Stock (`/inventory`, `/ready-stock`) | ✅ wired |   ✅   | `features/units/unit.api.ts` real                                                    |
| `create_unit`      | Pembelian (`/pembelian`)                              | ✅ wired |   🟡   | Masih baca `s.data.units` (dummy Redux) — tinggal ganti ke `useUnits` yang sudah ada |
| `create_rekondisi` | Rekondisi (`/rekondisi`)                              | ✅ wired |   ✅   | `features/rekondisi/rekondisi.api.ts` real                                           |

### Sales

| PRD file            | Modul FE                                             | Backend  | Status | Catatan                                                                                                               |
| ------------------- | ---------------------------------------------------- | :------: | :----: | --------------------------------------------------------------------------------------------------------------------- |
| `create_lead`       | CRM/Lead (`/crm`)                                    | ✅ wired |   ✅   | `features/crm/crm.api.ts` (`leadApi`)                                                                                 |
| `create_test_drive` | Test Drive (`/test-drive`)                           | ✅ wired |   ✅   | `features/test-drive/testDrive.api.ts`                                                                                |
| `create_lead_order` | Penjualan (`/penjualan`), Pembayaran (`/pembayaran`) | ✅ wired |   ✅   | `crm.api.ts` (`leadOrderApi`, `leadPaymentApi`) — lihat catatan dead-code `SaleFormModal`/`PaymentFormModal` di bawah |

### Cashflow

| PRD file                  | Modul FE                                           |                          Backend                           | Status | Catatan                                                                                                                                                                                                                        |
| ------------------------- | -------------------------------------------------- | :--------------------------------------------------------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `create_cash_account`     | Akun Kas (panel dalam `/cashflow`)                 |                          ✅ wired                          |   ✅   | `finance.api.ts` `cashAccountApi` — belum ada halaman standalone "Akun Kas", CRUD-nya nempel di `CashFlowPage`                                                                                                                 |
| `create_cash_transaction` | Transaksi Kas (`/cashflow`, `/dashboard-cashflow`) |                          ✅ wired                          |   ✅   | `cashTransactionApi` (manualIn/Out/transfer/adjustment/dashboard)                                                                                                                                                              |
| `create_book`             | Pembukuan & Pajak                                  |                    ✅ wired (`/books`)                     |   ⬜   | **Belum ada FE sama sekali** — tidak ada route/page/API call ke `/books/*` di mana pun                                                                                                                                         |
| `create_laporan`          | Laporan (`/laporan-cashflow`)                      | ⬜ belum ada backend (`/reports` belum dibuat, sesuai PRD) |   🟡   | FE **melanggar README §16**: fallback angka hardcode (`\|\| 3450000000` dst.) saat data kosong + tombol Export PDF/Excel palsu (tidak berfungsi). Harus **dibersihkan** jadi state "Belum tersedia", bukan dibuatkan API palsu |

### Operational

| PRD file                     | Modul FE                                     | Backend  | Status | Catatan                                                |
| ---------------------------- | -------------------------------------------- | :------: | :----: | ------------------------------------------------------ |
| `create_operational_expense` | Pengeluaran — tab expenses (`/pengeluaran`)  | ✅ wired |   ✅   | `operationalExpenseApi` incl. `.pay()`                 |
| `create_recurring_expense`   | Pengeluaran — tab recurring (`/pengeluaran`) | ✅ wired |   ✅   | `recurringExpenseApi` incl. `.generate()`              |
| `create_payroll`             | Payroll (`/payroll`)                         | ✅ wired |   ✅   | `payrollApi` (base salary/incentive/run, generate/pay) |

### Access Control

| PRD file                 | Modul FE                                        |                               Backend                                | Status | Catatan                                                                                                     |
| ------------------------ | ----------------------------------------------- | :------------------------------------------------------------------: | :----: | ----------------------------------------------------------------------------------------------------------- |
| `create_role`            | Role (`/access-control/roles`)                  |                               ✅ wired                               |   ✅   | `access.api.ts` (`roleApi`, incl. `setPermissions`)                                                         |
| `create_user`            | User (`/access-control/users`)                  |                               ✅ wired                               |   ✅   | `access.api.ts` (`userApi`, incl. `setRole`/`setBranch`)                                                    |
| `create_menu_permission` | Menu/Group/Permission (`/access-control/menus`) |                               ✅ wired                               |   ✅   | `access.api.ts` (`menuApi`)                                                                                 |
| `create_pengaturan`      | Pengaturan (`/pengaturan`)                      | ⬜ belum ada backend (sesuai PRD: "menu tersedia, API khusus belum") |   ⬜   | **Sesuai/compliant** — dummy statis saat ini benar per PRD, jangan dikarang API-nya sampai backend tersedia |

### Master

| PRD file                      | Modul FE                                              |                         Backend                          |                                             Status                                             |
| ----------------------------- | ----------------------------------------------------- | :------------------------------------------------------: | :--------------------------------------------------------------------------------------------: |
| `create_merek_tipe`           | Merek/Tipe (`/merek`)                                 |                         ✅ wired                         |                                               ✅                                               |
| `create_vendor`               | Vendor (`/vendor`)                                    |                         ✅ wired                         |                                               ✅                                               |
| `create_branch`               | Branch/Cabang (`/branch`)                             |                         ✅ wired                         |                                               ✅                                               |
| `create_leasing`              | Leasing (`/master/leasing`)                           |                         ✅ wired                         |                                               ✅                                               |
| `create_sumber_lead`          | Sumber Lead (`/master/sumber-lead`)                   |                         ✅ wired                         |                                               ✅                                               |
| `create_pengecekan`           | Pengecekan (`/master/pengecekan`)                     |                         ✅ wired                         |                                               ✅                                               |
| `create_kategori_pengeluaran` | Kategori Pengeluaran (`/master/kategori-pengeluaran`) |                         ✅ wired                         |                                               ✅                                               |
| `create_metode_pembayaran`    | Metode Pembayaran (`/master/metode-pembayaran`)       |                         ✅ wired                         |                                               ✅                                               |
| `create_dokumen`              | Dokumen (`/master/dokumen`)                           |                         ✅ wired                         |                                               ✅                                               |
| `create_perlengkapan`         | Perlengkapan (`/master/perlengkapan`)                 |                         ✅ wired                         |                                               ✅                                               |
| `create_investor`             | Investor + Modal (`/master/investor`)                 |                         ✅ wired                         |                                               ✅                                               |
| `create_investor_obligation`  | Investor Obligation                                   | ✅ wired (`/investor-obligations`, generate/pay/reverse) | ⬜ **Belum ada FE sama sekali** — tidak ada route, page, atau referensi "obligation" di `src/` |

### Target dan Kinerja

| PRD file        | Modul FE                                                                |                                     Backend                                      | Status | Catatan                                                                                                     |
| --------------- | ----------------------------------------------------------------------- | :------------------------------------------------------------------------------: | :----: | ----------------------------------------------------------------------------------------------------------- |
| `create_target` | Target Penjualan/Pendapatan (`/target-penjualan`, `/target-pendapatan`) | ✅ wired (`/targets/branches`, `/targets/achievement`, `/targets/lookups/sales`) |   ⬜   | **100% dummy** — state lokal `INITIAL_TARGETS`/`INITIAL_REVENUE_TARGETS`, tidak ada `targetApi` sama sekali |

### CMS

| PRD file                       | Modul FE                             | Backend  | Status |
| ------------------------------ | ------------------------------------ | :------: | :----: |
| `create_cms_site_setting`      | Site Settings (`/cms/site-settings`) | ✅ wired |   ✅   |
| `create_cms_homepage`          | Beranda (`/cms/homepage`)            | ✅ wired |   ✅   |
| `create_cms_about`             | Tentang (`/cms/about`)               | ✅ wired |   ✅   |
| `create_cms_testimonial`       | Testimoni (`/cms/testimoni`)         | ✅ wired |   ✅   |
| `create_cms_catalog`           | Katalog (`/cms/katalog`)             | ✅ wired |   ✅   |
| `create_cms_contact`           | Kontak (`/cms/kontak`)               | ✅ wired |   ✅   |
| `create_cms_credit_simulation` | Simulasi Kredit (`/cms/simulasi`)    | ✅ wired |   ✅   |

> Situs publik (`src/features/landing/`, `src/routes/_public/`) sudah 100% konsumsi `/public/*` (site-settings, homepage, about, catalog+detail+related, credit-simulation, contact-messages) — **tidak ada dummy Redux tersisa di sini**, konsisten dengan klaim lama di section "F. CMS + Situs Publik".

### Ringkasan (37 PRD file)

- ✅ **Done: 31** modul — mayoritas master data, access control, sales/CRM, rekondisi, dashboard, test drive, cash account/transaction, expense/payroll, seluruh CMS.
- 🟡 **Partial: 2** — Pembelian (tinggal ganti dummy → `useUnits`), Laporan (harus dibersihkan dari data palsu, bukan ditambah API palsu).
- ⬜ **Not-started: 4** — Investor Obligation (build baru, backend siap), Book/Pembukuan (build baru, backend siap), Target (build baru, backend siap), Pengaturan (tunggu backend, jangan dikarang).

### 🎯 Prioritas kerja berikutnya (berdasarkan tracking di atas)

1. 🔴 **Target** — ganti dummy state → `targetApi` baru + `useTargets`/`useTargetAchievement`, wire ke `TargetPenjualanPage`/`TargetPendapatanPage`.
2. 🔴 **Investor Obligation** — modul baru penuh (api/types/hooks/page) sesuai `create_investor_obligation_20260717_090122.md`, termasuk idempotency key untuk endpoint pay.
3. 🟠 **Book/Pembukuan** — modul baru (period ledger, cash/profit summary, close period, tax settings) sesuai `create_book_20260717_090122.md`.
4. 🟠 **Pembelian** — quick fix, ganti `s.data.units` → `useUnits`.
5. 🟠 **Laporan** — hapus fallback angka hardcode + tombol export palsu, ganti state "Belum tersedia" sesuai README §16 (backend `/reports` belum ada).
6. 🟢 **Dead code** — evaluasi hapus `SaleFormModal.tsx`/`PaymentFormModal.tsx` (nulis ke `dataSlice` lama, sudah tidak dipakai halaman utama, tipe `Sale`/`Payment` sudah menyimpang dari kontrak `LeadOrder`/`LeadPayment` asli).

---

## 🔐 Auth & Sesi

| Modul                                 | PRD | API | UI  | Wired | Keterangan                                                                                                                                                                                                                               |
| ------------------------------------- | :-: | :-: | :-: | :---: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login (tenantSlug + email + password) | ✅  | ✅  | ✅  |  ✅   | `POST /tenant/auth/login` → simpan accessToken.                                                                                                                                                                                          |
| Me + Permission efektif               | ✅  | ✅  | ✅  |  ✅   | `GET /tenant/auth/me` — `permissions` dipakai untuk guard (`usePermissions`).                                                                                                                                                            |
| Menu sidebar                          | ✅  | ✅  | ✅  |  ✅   | `GET /tenant/auth/me/menu` — sudah diuji dengan **response asli** (8 grup, 48 menu). **Fallback**: bila respons kosong, sidebar memakai [`tenantMenu.ts`](src/shared/layout/tenantMenu.ts) yang isinya salinan persis response tersebut. |
| Refresh token                         | ✅  | ✅  | ✅  |  ✅   | Interceptor auto-refresh saat 401 (cookie HttpOnly).                                                                                                                                                                                     |
| Logout                                | ✅  | ✅  | ✅  |  ✅   | Dropdown profil → konfirmasi → `POST /tenant/auth/logout`.                                                                                                                                                                               |
| Change Password                       | ✅  | ✅  | ✅  |  ✅   | `POST /tenant/auth/change-password` (dipakai saat `mustChangePassword`).                                                                                                                                                                 |
| Forgot / Reset Password               | ⬜  | ⬜  | ✅  |  ⬜   | UI sudah ada; **endpoint belum ada di PRD** — masih `TODO(api)`.                                                                                                                                                                         |
| Select Tenant (multi-membership)      | ⬜  | ⬜  | ⬜  |  ⬜   | Belum dibuat; PRD login belum mengembalikan daftar membership.                                                                                                                                                                           |

### Catatan kontrak menu (dari response asli)

- **Kode permission** memakai resource seperti `customer.customer`, `catalogue.product`,
  `inventory.stock`, `purchasing.supplier`, `sales.lead`, `showroom.vehicle_unit`, `finance.account`,
  dan `tenant.profile` / `tenant.user` / `tenant.role` / `tenant.numbering` / `tenant.approval` /
  `tenant.module_settings`. Aksi = `<resource>.read|create|update|delete`.
- **Ikon** dikirim sebagai nama lucide kebab-case (`layout-dashboard`, `package-search`,
  `chart-no-axes-combined`). [`iconMapper.ts`](src/shared/layout/iconMapper.ts) me-resolve-nya
  dinamis ke registry lucide — menu baru hasil seeder langsung dapat ikon tanpa ubah kode.
- **Dashboard ber-path `/`**, jadi login dipindah ke `/login` (sesuai guard di `tenant-web.md`).

## 🧭 Halaman Kondisi Akses

| Halaman                | UI  | Keterangan                 |
| ---------------------- | :-: | -------------------------- |
| `/forbidden`           | ✅  | Permission tidak tersedia. |
| `/feature-unavailable` | ✅  | Capability tidak aktif.    |
| `/tenant-suspended`    | ✅  | Tenant ditangguhkan.       |
| 404 (`NotFound`)       | ✅  | Route tidak dikenal.       |

> Guard capability & status tenant **belum** dipasang otomatis (PRD-nya belum ada); halamannya sudah
> siap, tinggal diarahkan begitu backend mengirim status capability/tenant.

---

## 📊 Dashboard

| Modul     | PRD | API | UI  | Wired | Keterangan                                                                                                                                                  |
| --------- | :-: | :-: | :-: | :---: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard | ⬜  | ⬜  | ✅  |  ⬜   | Widget: unit tersedia, test drive, reservasi, lead, PO belum diterima, piutang, utang, kas & bank + tabel Sales Order/Test Drive. Angka dari mock registry. |

<<<<<<< Updated upstream

## 👥 Customer

| Menu                   | PRD | API | UI  | Wired |
| ---------------------- | :-: | :-: | :-: | :---: |
| Customers `/customers` | ✅  | ⬜  | ✅  |  ⬜   |

## 📦 Catalogue

| Menu                                 | PRD | API | UI  | Wired |
| ------------------------------------ | :-: | :-: | :-: | :---: |
| Products `/catalogue/products`       | ✅  | ⬜  | ✅  |  ⬜   |
| Categories `/catalogue/categories`   | ✅  | ⬜  | ✅  |  ⬜   |
| Brands `/catalogue/brands`           | ✅  | ⬜  | ✅  |  ⬜   |
| Price Lists `/catalogue/price-lists` | ✅  | ⬜  | ✅  |  ⬜   |

## 🏬 Inventory

| Menu                                            | PRD | API | UI  | Wired |
| ----------------------------------------------- | :-: | :-: | :-: | :---: |
| Stock `/inventory/stocks`                       | ✅  | ⬜  | ✅  |  ⬜   |
| Serialized Stock `/inventory/serialized-stocks` | ✅  | ⬜  | ✅  |  ⬜   |
| Locations `/inventory/locations`                | ✅  | ⬜  | ✅  |  ⬜   |
| Movements `/inventory/movements`                | ✅  | ⬜  | ✅  |  ⬜   |
| Transfers `/inventory/transfers`                | ✅  | ⬜  | ✅  |  ⬜   |
| Adjustments `/inventory/adjustments`            | ✅  | ⬜  | ✅  |  ⬜   |
| Stock Counts `/inventory/stock-counts`          | ✅  | ⬜  | ✅  |  ⬜   |
| Reports `/inventory/reports`                    | ✅  | ⬜  | ✅  |  ⬜   |

## 🛒 Purchasing

| Menu                                              | PRD | API | UI  | Wired |
| ------------------------------------------------- | :-: | :-: | :-: | :---: |
| Suppliers `/purchasing/suppliers`                 | ✅  | ⬜  | ✅  |  ⬜   |
| Purchase Requests `/purchasing/purchase-requests` | ✅  | ⬜  | ✅  |  ⬜   |
| Purchase Orders `/purchasing/purchase-orders`     | ✅  | ⬜  | ✅  |  ⬜   |
| Goods Receipts `/purchasing/goods-receipts`       | ✅  | ⬜  | ✅  |  ⬜   |
| Purchase Invoices `/purchasing/purchase-invoices` | ✅  | ⬜  | ✅  |  ⬜   |
| Purchase Returns `/purchasing/purchase-returns`   | ✅  | ⬜  | ✅  |  ⬜   |
| Reports `/purchasing/reports`                     | ✅  | ⬜  | ✅  |  ⬜   |

## 💼 Sales

| Menu                             | PRD | API | UI  | Wired |
| -------------------------------- | :-: | :-: | :-: | :---: |
| Leads `/sales/leads`             | ✅  | ⬜  | ✅  |  ⬜   |
| Quotations `/sales/quotations`   | ✅  | ⬜  | ✅  |  ⬜   |
| Sales Orders `/sales/orders`     | ✅  | ⬜  | ✅  |  ⬜   |
| Sales Invoices `/sales/invoices` | ✅  | ⬜  | ✅  |  ⬜   |
| Sales Returns `/sales/returns`   | ✅  | ⬜  | ✅  |  ⬜   |
| Reports `/sales/reports`         | ✅  | ⬜  | ✅  |  ⬜   |

## 🚗 Showroom

PRD ada di `.prd/tenant/verticals/showroom`.

| Menu                                    | PRD | API | UI  | Wired |
| --------------------------------------- | :-: | :-: | :-: | :---: |
| Vehicle Units `/showroom/vehicle-units` | ✅  | ⬜  | ✅  |  ⬜   |
| Test Drives `/showroom/test-drives`     | ✅  | ⬜  | ✅  |  ⬜   |
| Reservations `/showroom/reservations`   | ✅  | ⬜  | ✅  |  ⬜   |
| Deliveries `/showroom/deliveries`       | ✅  | ⬜  | ✅  |  ⬜   |
| Trade-ins `/showroom/trade-ins`         | ✅  | ⬜  | ✅  |  ⬜   |
| Leasing `/showroom/leasing`             | ✅  | ⬜  | ✅  |  ⬜   |

## 💰 Finance

| Menu                                     | PRD | API | UI  | Wired |
| ---------------------------------------- | :-: | :-: | :-: | :---: |
| Chart of Accounts `/finance/accounts`    | ✅  | ⬜  | ✅  |  ⬜   |
| Fiscal Periods `/finance/fiscal-periods` | ✅  | ⬜  | ✅  |  ⬜   |
| Journals `/finance/journals`             | ✅  | ⬜  | ✅  |  ⬜   |
| Receivables `/finance/receivables`       | ✅  | ⬜  | ✅  |  ⬜   |
| Payables `/finance/payables`             | ✅  | ⬜  | ✅  |  ⬜   |
| Cash & Bank `/finance/cash-bank`         | ✅  | ⬜  | ✅  |  ⬜   |
| Payments `/finance/payments`             | ✅  | ⬜  | ✅  |  ⬜   |
| Expenses `/finance/expenses`             | ✅  | ⬜  | ✅  |  ⬜   |
| Reports `/finance/reports`               | ✅  | ⬜  | ✅  |  ⬜   |

## ⚙️ Settings

| Menu                                | PRD | API | UI  | Wired | Keterangan                                                     |
| ----------------------------------- | :-: | :-: | :-: | :---: | -------------------------------------------------------------- |
| General `/settings/general`         | ✅  | ✅  | ✅  |  ⬜   | `tenant-profile.api.ts` sudah ada; halaman masih memakai mock. |
| Users `/settings/users`             | ✅  | ✅  | ✅  |  ⬜   | `tenant-users.api.ts` sudah ada; halaman masih memakai mock.   |
| Roles `/settings/roles`             | ✅  | ✅  | ✅  |  ⬜   | `tenant-roles.api.ts` sudah ada; halaman masih memakai mock.   |
| Numbering `/settings/numbering`     | ✅  | ⬜  | ✅  |  ⬜   |                                                                |
| Approvals `/settings/approvals`     | ✅  | ⬜  | ✅  |  ⬜   |                                                                |
| Module Settings `/settings/modules` | ✅  | ⬜  | ✅  |  ⬜   | Capability read-only (aktivasi lewat Platform).                |

=======
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
| Test Drive | `testDriveApi` | ✅ |
| Rekondisi (list/progress/done + detail items) | `rekondisiApi` | ✅ |
| Pengeluaran (operational + recurring) | `operationalExpenseApi`, `recurringExpenseApi` | ✅ |
| Payroll | `payrollApi` | ✅ |
| Cash Account / Cash Transaction | `cashAccountApi`, `cashTransactionApi` | ✅ |
| Laporan | — (backend `/reports` belum ada, lihat tracking di atas) | 🟡 |
| Target (Penjualan/Pendapatan) | — (`/targets/*` backend siap, FE masih dummy) | ⬜ |
| Investor Obligation | — (`/investor-obligations` backend siap, FE belum ada) | ⬜ |
| Pembukuan / Book | — (`/books` backend siap, FE belum ada) | ⬜ |
| **CMS — Pengaturan Situs** (`SiteSettingsPage`) | `siteSettingsApi` (+logo/favicon/navLinks) | ✅ |
| **CMS — Beranda 7 section** (`HomepagePage`) | `sectionApi('homepage')` + hero-image | ✅ |
| **CMS — Tentang 5 section** (`AboutPage`) | `sectionApi('about')` + hero-image | ✅ |
| **CMS — Testimoni** (`TestimoniPage`) | `testimonialApi` | ✅ |
| **CMS — Katalog + galeri + header** (`KatalogPage`) | `cmsCatalogApi` + `catalogPageApi` | ✅ |
| **CMS — Kontak & Pesan** (`ContactInboxPage`) | `contactPageApi` + `contactMessageApi` | ✅ |
| **CMS — Simulasi Kredit** (`CreditSimPage`) | `creditSimApi` | ✅ |
| **Situs publik (7 halaman)** consume `/public/*` | `landingApi` + `landing.hooks` | ✅ |

> > > > > > > Stashed changes

---

## 🔜 Langkah Berikutnya

1. **Sambungkan 3 halaman Settings** (General/Users/Roles) ke service API yang sudah ada — ini yang
   paling siap: tinggal tukar `fetchMock*` → `tenantProfileApi` / `tenantUsersApi` / `tenantRolesApi`.
2. Buat service API untuk modul operasional (`customer`, `catalogue`, `inventory`, `purchasing`,
   `sales`, `finance`, `showroom`) mengikuti `.prd/tenant/<modul>/`, lalu tukar `queryFn` di
   [`ResourceListPage`](src/features/modules/ResourceListPage.tsx) / registry.
3. Halaman detail / create / edit per modul (`.menu/tenant-web.md`) — saat ini baru halaman **list**.
4. Guard capability & status tenant → arahkan ke `/feature-unavailable` dan `/tenant-suspended`.
5. Endpoint Forgot/Reset Password + Select Tenant (belum ada di PRD).
