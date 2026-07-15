# Tenant Web — PRD Tracking

Project ini **khusus Tenant Web** (aplikasi operasional showroom, audience token `TENANT`,
API `/api/tenant/*`). Platform Web adalah project terpisah — seluruh kodenya sudah dihapus dari repo ini.

Sumber struktur menu & halaman: [`.menu/seeded-navigation.md`](.menu/seeded-navigation.md) dan
[`.menu/tenant-web.md`](.menu/tenant-web.md). Kontrak endpoint: folder [`.prd/tenant`](.prd/tenant).

## Legenda

| Simbol | Arti |
|:---:|---|
| ✅ | Selesai |
| 🟡 | Sebagian |
| ⬜ | Belum dikerjakan |

Kolom:

- **PRD** — spesifikasi endpoint sudah ada di `.prd/tenant/`.
- **API** — file service (`src/features/tenant/api/*.api.ts`) sudah dibuat sesuai kontrak.
- **UI** — halaman sudah dibangun.
- **Wired** — UI benar-benar memanggil API (bukan mock).

> **Catatan TDD UI (rules.md §4):** endpoint modul operasional belum tersedia di backend, jadi seluruh
> halaman list memakai *mock fetcher* + `setTimeout`. Kolom & bentuk data sudah disiapkan mengikuti
> PRD, sehingga saat backend siap cukup menukar `queryFn` mock → service API.

---

## 🔐 Auth & Sesi

| Modul | PRD | API | UI | Wired | Keterangan |
|---|:---:|:---:|:---:|:---:|---|
| Login (tenantSlug + email + password) | ✅ | ✅ | ✅ | ✅ | `POST /tenant/auth/login` → simpan accessToken. |
| Me + Permission efektif | ✅ | ✅ | ✅ | ✅ | `GET /tenant/auth/me` — `permissions` dipakai untuk guard (`usePermissions`). |
| Menu sidebar | ✅ | ✅ | ✅ | ✅ | `GET /tenant/auth/me/menu` — sudah diuji dengan **response asli** (8 grup, 48 menu). **Fallback**: bila respons kosong, sidebar memakai [`tenantMenu.ts`](src/shared/layout/tenantMenu.ts) yang isinya salinan persis response tersebut. |
| Refresh token | ✅ | ✅ | ✅ | ✅ | Interceptor auto-refresh saat 401 (cookie HttpOnly). |
| Logout | ✅ | ✅ | ✅ | ✅ | Dropdown profil → konfirmasi → `POST /tenant/auth/logout`. |
| Change Password | ✅ | ✅ | ✅ | ✅ | `POST /tenant/auth/change-password` (dipakai saat `mustChangePassword`). |
| Forgot / Reset Password | ⬜ | ⬜ | ✅ | ⬜ | UI sudah ada; **endpoint belum ada di PRD** — masih `TODO(api)`. |
| Select Tenant (multi-membership) | ⬜ | ⬜ | ⬜ | ⬜ | Belum dibuat; PRD login belum mengembalikan daftar membership. |

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

| Halaman | UI | Keterangan |
|---|:---:|---|
| `/forbidden` | ✅ | Permission tidak tersedia. |
| `/feature-unavailable` | ✅ | Capability tidak aktif. |
| `/tenant-suspended` | ✅ | Tenant ditangguhkan. |
| 404 (`NotFound`) | ✅ | Route tidak dikenal. |

> Guard capability & status tenant **belum** dipasang otomatis (PRD-nya belum ada); halamannya sudah
> siap, tinggal diarahkan begitu backend mengirim status capability/tenant.

---

## 📊 Dashboard

| Modul | PRD | API | UI | Wired | Keterangan |
|---|:---:|:---:|:---:|:---:|---|
| Dashboard | ⬜ | ⬜ | ✅ | ⬜ | Widget: unit tersedia, test drive, reservasi, lead, PO belum diterima, piutang, utang, kas & bank + tabel Sales Order/Test Drive. Angka dari mock registry. |

## 👥 Customer

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Customers `/customers` | ✅ | ⬜ | ✅ | ⬜ |

## 📦 Catalogue

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Products `/catalogue/products` | ✅ | ⬜ | ✅ | ⬜ |
| Categories `/catalogue/categories` | ✅ | ⬜ | ✅ | ⬜ |
| Brands `/catalogue/brands` | ✅ | ⬜ | ✅ | ⬜ |
| Price Lists `/catalogue/price-lists` | ✅ | ⬜ | ✅ | ⬜ |

## 🏬 Inventory

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Stock `/inventory/stocks` | ✅ | ⬜ | ✅ | ⬜ |
| Serialized Stock `/inventory/serialized-stocks` | ✅ | ⬜ | ✅ | ⬜ |
| Locations `/inventory/locations` | ✅ | ⬜ | ✅ | ⬜ |
| Movements `/inventory/movements` | ✅ | ⬜ | ✅ | ⬜ |
| Transfers `/inventory/transfers` | ✅ | ⬜ | ✅ | ⬜ |
| Adjustments `/inventory/adjustments` | ✅ | ⬜ | ✅ | ⬜ |
| Stock Counts `/inventory/stock-counts` | ✅ | ⬜ | ✅ | ⬜ |
| Reports `/inventory/reports` | ✅ | ⬜ | ✅ | ⬜ |

## 🛒 Purchasing

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Suppliers `/purchasing/suppliers` | ✅ | ⬜ | ✅ | ⬜ |
| Purchase Requests `/purchasing/purchase-requests` | ✅ | ⬜ | ✅ | ⬜ |
| Purchase Orders `/purchasing/purchase-orders` | ✅ | ⬜ | ✅ | ⬜ |
| Goods Receipts `/purchasing/goods-receipts` | ✅ | ⬜ | ✅ | ⬜ |
| Purchase Invoices `/purchasing/purchase-invoices` | ✅ | ⬜ | ✅ | ⬜ |
| Purchase Returns `/purchasing/purchase-returns` | ✅ | ⬜ | ✅ | ⬜ |
| Reports `/purchasing/reports` | ✅ | ⬜ | ✅ | ⬜ |

## 💼 Sales

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Leads `/sales/leads` | ✅ | ⬜ | ✅ | ⬜ |
| Quotations `/sales/quotations` | ✅ | ⬜ | ✅ | ⬜ |
| Sales Orders `/sales/orders` | ✅ | ⬜ | ✅ | ⬜ |
| Sales Invoices `/sales/invoices` | ✅ | ⬜ | ✅ | ⬜ |
| Sales Returns `/sales/returns` | ✅ | ⬜ | ✅ | ⬜ |
| Reports `/sales/reports` | ✅ | ⬜ | ✅ | ⬜ |

## 🚗 Showroom

PRD ada di `.prd/tenant/verticals/showroom`.

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Vehicle Units `/showroom/vehicle-units` | ✅ | ⬜ | ✅ | ⬜ |
| Test Drives `/showroom/test-drives` | ✅ | ⬜ | ✅ | ⬜ |
| Reservations `/showroom/reservations` | ✅ | ⬜ | ✅ | ⬜ |
| Deliveries `/showroom/deliveries` | ✅ | ⬜ | ✅ | ⬜ |
| Trade-ins `/showroom/trade-ins` | ✅ | ⬜ | ✅ | ⬜ |
| Leasing `/showroom/leasing` | ✅ | ⬜ | ✅ | ⬜ |

## 💰 Finance

| Menu | PRD | API | UI | Wired |
|---|:---:|:---:|:---:|:---:|
| Chart of Accounts `/finance/accounts` | ✅ | ⬜ | ✅ | ⬜ |
| Fiscal Periods `/finance/fiscal-periods` | ✅ | ⬜ | ✅ | ⬜ |
| Journals `/finance/journals` | ✅ | ⬜ | ✅ | ⬜ |
| Receivables `/finance/receivables` | ✅ | ⬜ | ✅ | ⬜ |
| Payables `/finance/payables` | ✅ | ⬜ | ✅ | ⬜ |
| Cash & Bank `/finance/cash-bank` | ✅ | ⬜ | ✅ | ⬜ |
| Payments `/finance/payments` | ✅ | ⬜ | ✅ | ⬜ |
| Expenses `/finance/expenses` | ✅ | ⬜ | ✅ | ⬜ |
| Reports `/finance/reports` | ✅ | ⬜ | ✅ | ⬜ |

## ⚙️ Settings

| Menu | PRD | API | UI | Wired | Keterangan |
|---|:---:|:---:|:---:|:---:|---|
| General `/settings/general` | ✅ | ✅ | ✅ | ⬜ | `tenant-profile.api.ts` sudah ada; halaman masih memakai mock. |
| Users `/settings/users` | ✅ | ✅ | ✅ | ⬜ | `tenant-users.api.ts` sudah ada; halaman masih memakai mock. |
| Roles `/settings/roles` | ✅ | ✅ | ✅ | ⬜ | `tenant-roles.api.ts` sudah ada; halaman masih memakai mock. |
| Numbering `/settings/numbering` | ✅ | ⬜ | ✅ | ⬜ | |
| Approvals `/settings/approvals` | ✅ | ⬜ | ✅ | ⬜ | |
| Module Settings `/settings/modules` | ✅ | ⬜ | ✅ | ⬜ | Capability read-only (aktivasi lewat Platform). |

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
