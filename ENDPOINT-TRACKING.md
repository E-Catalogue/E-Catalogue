# 🔌 Endpoint Tracking per Menu — Frontend ↔ Backend

> Dokumen ini memetakan **setiap menu** ke endpoint API yang dipanggil, untuk crosscheck dengan project backend (`ecatalogue-be`).
> Dibuat: 22 Juli 2026. Sumber: hasil ekstraksi otomatis dari `src/features/**/*.api.ts` + `lookup.ts`, dicocokkan dengan `ecatalogue-be/src/modules/**/**.route.js`.

## Konvensi

- **Base URL**: `VITE_API_BASE_URL` + `/api/v1` (default `http://localhost:3000/api/v1`). Lihat [src/core/api/client.ts](src/core/api/client.ts).
- **Path di tabel** relatif terhadap base URL (mis. `GET /units` = `GET {BASE}/api/v1/units`).
- **Kolom Cabang** — apakah route backend memakai middleware `resolveBranchScope` (butuh header `X-Branch-Id` untuk mutation role OWNER/ADMIN):
  - 🏢 = **ya**, branch-scoped. Header `X-Branch-Id` dilampirkan **OTOMATIS** oleh interceptor ([src/core/api/interceptor.ts](src/core/api/interceptor.ts)) dari cabang aktif di **BranchSwitcher header**. Tidak perlu passing manual.
  - — = tidak branch-scoped.
  - 📦 = tidak pakai header, tapi kirim `branchId` di **body** (khusus Target).
- **Kolom ✔** — status kecocokan dengan route backend: ✅ cocok · ⚠️ beda · ❌ tidak ada di BE.
- **Idempotency-Key** ditandai 🔑 pada aksi yang mengirimkannya (create pembayaran/transaksi/obligation).

**Status global: seluruh endpoint di bawah ✅ cocok dengan route backend** (per crosscheck 22 Juli 2026).

---

## Grup: Utama

### 📊 Dashboard — `/dashboard`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Muat ringkasan (per periode) | `GET /dashboard?period=YYYY-MM` | 🏢 (read) | ✅ |

---

## Grup: Operasional

### 🚗 Inventori / Pembelian Unit / Ready Stock — `/units`
> Ketiga menu memakai modul unit yang sama (Ready Stock & Pembelian = view terfilter dari Inventori).

| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List unit (+filter/tab status) | `GET /units` | 🏢 | ✅ |
| Detail unit | `GET /units/:id` | 🏢 | ✅ |
| Lookup form (merek/tipe/vendor/dll) | `GET /units/lookups` | 🏢 | ✅ |
| Master kelengkapan | `GET /units/kelengkapan` | 🏢 | ✅ |
| Master dokumen | `GET /units/dokumen` | 🏢 | ✅ |
| Tambah unit | `POST /units` | 🏢 | ✅ |
| Edit unit | `PUT /units/:id` | 🏢 | ✅ |
| Ubah status unit | `PATCH /units/:id/status` | 🏢 | ✅ |
| Hapus unit | `DELETE /units/:id` | 🏢 | ✅ |
| Upload foto unit | `POST /units/:id/image` | 🏢 | ✅ |
| Hapus foto unit | `DELETE /units/:id/image/:imageId` | 🏢 | ✅ |
| Urutkan foto | `PATCH /units/:id/images/reorder` | 🏢 | ✅ |
| Set foto utama | `PATCH /units/:id/image/:imageId/main` | 🏢 | ✅ |
| Cek status rekondisi | `GET /units/:id/rekondisi-status-check` | 🏢 | ✅ |
| Buat rekondisi dari unit | `POST /units/:id/rekondisi` | 🏢 | ✅ |
| Lihat pendanaan | `GET /units/:id/funding` | 🏢 | ✅ |
| Ubah pendanaan | `PATCH /units/:id/funding` | 🏢 | ✅ |
| Finalisasi harga awal | `POST /units/:id/finalize-initial-pricing` | 🏢 | ✅ |
| Lihat kebijakan harga | `GET /units/pricing-policy` | 🏢 | ✅ |
| Ubah kebijakan harga | `PUT /units/pricing-policy` | 🏢 | ✅ |
| Transfer unit antar cabang | `POST /units/:id/transfer-branch` | 🏢 | ✅ |

### 🔧 Rekondisi — `/rekondisis`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup vendor | `GET /rekondisis/lookups/vendors` | 🏢 | ✅ |
| Lookup pengecekan | `GET /rekondisis/lookups/checks` | 🏢 | ✅ |
| Lookup akun kas | `GET /rekondisis/lookups/cash-accounts` | 🏢 | ✅ |
| List rekondisi | `GET /rekondisis` | 🏢 | ✅ |
| Detail rekondisi | `GET /rekondisis/:id` | 🏢 | ✅ |
| Edit info rekondisi | `PUT /rekondisis/:id` | 🏢 | ✅ |
| Progress / Submit / Approve / Reject | `PATCH /rekondisis/:id/{progress,submit,approve,reject}` | 🏢 | ✅ |
| Selesaikan (done) | `POST /rekondisis/:id/done` | 🏢 | ✅ |
| Bayar | `POST /rekondisis/:id/pay` | 🏢 | ✅ |
| List item pekerjaan | `GET /rekondisis/:id/detail` | 🏢 | ✅ |
| Detail item | `GET /rekondisis/:id/detail/:itemId` | 🏢 | ✅ |
| Tambah item | `POST /rekondisis/:id/detail` | 🏢 | ✅ |
| Edit item | `PUT /rekondisis/:id/detail/:itemId` | 🏢 | ✅ |
| Hapus item | `DELETE /rekondisis/:id/detail/:itemId` | 🏢 | ✅ |
| *(unit picker)* | `GET /units` (filter INVENTORY di klien) | 🏢 | ✅ |

### 👥 CRM / Lead — `/leads`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List lead | `GET /leads` | 🏢 | ✅ |
| Detail lead | `GET /leads/:id` | 🏢 | ✅ |
| Lookup (sumber/sales/unit) | `GET /leads/lookups` | 🏢 | ✅ |
| Tambah lead | `POST /leads` | 🏢 | ✅ |
| Edit lead | `PATCH /leads/:id` | 🏢 | ✅ |
| Ubah status lead | `PATCH /leads/:id/status` | 🏢 | ✅ |

### 🔑 Test Drive — `/test-drives`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List test drive | `GET /test-drives` | 🏢 | ✅ |
| Lookup (unit/sales) | `GET /test-drives/lookups` | 🏢 | ✅ |
| Jadwalkan | `POST /test-drives` | 🏢 | ✅ |
| Edit jadwal | `PATCH /test-drives/:id` | 🏢 | ✅ |
| Hapus jadwal | `DELETE /test-drives/:id` | 🏢 | ✅ |

### 🧾 Penjualan — `/lead-orders`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup form order | `GET /lead-orders/lookups/order-form` | 🏢 | ✅ |
| Lookup akun kas | `GET /lead-orders/lookups/cash-accounts` | 🏢 | ✅ |
| List order | `GET /lead-orders` | 🏢 | ✅ |
| Detail order | `GET /lead-orders/:id` | 🏢 | ✅ |
| Buat order | `POST /lead-orders` | 🏢 | ✅ |
| Edit order | `PATCH /lead-orders/:id` | 🏢 | ✅ |
| Ubah status order (DEAL/CANCELLED) | `PATCH /lead-orders/:id/status` | 🏢 | ✅ |
| Detail settlement | `GET /lead-orders/:id/settlement` | 🏢 | ✅ |
| Set insentif sales | `PUT /lead-orders/:id/sales-incentive` | 🏢 | ✅ |
| Finalisasi settlement | `POST /lead-orders/:id/settlement/finalize` | 🏢 | ✅ |

### 💵 Pembayaran — `/lead-orders/:orderId/payments`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List pembayaran order | `GET /lead-orders/:orderId/payments` | 🏢 | ✅ |
| Catat pembayaran 🔑 | `POST /lead-orders/:orderId/payments` | 🏢 | ✅ |
| Edit pembayaran | `PATCH /lead-orders/:orderId/payments/:id` | 🏢 | ✅ |
| Balik (reverse) pembayaran | `POST /lead-orders/:orderId/payments/:id/reverse` | 🏢 | ✅ |
| Hapus pembayaran | `DELETE /lead-orders/:orderId/payments/:id` | 🏢 | ✅ |

### 🎯 Target Cabang & Sales — `/targets`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup cabang | `GET /targets/lookups/branches` | — | ✅ |
| Lookup sales (per cabang) | `GET /targets/lookups/sales?branchId=` | — | ✅ |
| Pencapaian | `GET /targets/achievement` | — | ✅ |
| List target | `GET /targets/branches` | — | ✅ |
| Detail target | `GET /targets/branches/:id` | — | ✅ |
| Buat target | `POST /targets/branches` (📦 `branchId` di body) | 📦 | ✅ |
| Edit target | `PATCH /targets/branches/:id` | — | ✅ |
| Ganti distribusi sales | `PUT /targets/branches/:id/sales` | — | ✅ |
| Aktifkan | `POST /targets/branches/:id/activate` | — | ✅ |
| Tutup | `POST /targets/branches/:id/close` | — | ✅ |

### 💸 Pengeluaran — `/operational-expenses` + `/recurring-expenses`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup kategori | `GET /operational-expenses/lookups/expense-categories` | 🏢 | ✅ |
| Lookup akun kas | `GET /operational-expenses/lookups/cash-accounts` | 🏢 | ✅ |
| List pengeluaran | `GET /operational-expenses` | 🏢 | ✅ |
| Detail | `GET /operational-expenses/:id` | 🏢 | ✅ |
| Tambah (multipart bukti) | `POST /operational-expenses` | 🏢 | ✅ |
| Edit | `PATCH /operational-expenses/:id` | 🏢 | ✅ |
| Hapus | `DELETE /operational-expenses/:id` | 🏢 | ✅ |
| Bayar | `POST /operational-expenses/:id/pay` | 🏢 | ✅ |
| Lookup template rutin | `GET /recurring-expenses/lookups/templates` | 🏢 | ✅ |
| List template rutin | `GET /recurring-expenses` | 🏢 | ✅ |
| Detail template | `GET /recurring-expenses/:id` | 🏢 | ✅ |
| Tambah/Edit/Hapus template | `POST` / `PATCH /:id` / `DELETE /:id` `/recurring-expenses` | 🏢 | ✅ |
| Generate dari template | `POST /recurring-expenses/generate` | 🏢 | ✅ |

### 🏦 Payroll — `/payroll`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup users/sales/deal-orders/kas | `GET /payroll/lookups/{users,sales,deal-orders,cash-accounts}` | 🏢 | ✅ |
| Gaji pokok: list/tambah/edit/hapus | `GET,POST /payroll/base-salaries` · `PATCH,DELETE /:id` | 🏢 | ✅ |
| Insentif sales: list/tambah/edit/hapus | `GET,POST /payroll/sales-incentives` · `PATCH,DELETE /:id` | 🏢 | ✅ |
| Payroll run: list | `GET /payroll/runs` | 🏢 | ✅ |
| Payroll run: detail | `GET /payroll/runs/:id` | 🏢 | ✅ |
| Generate payroll | `POST /payroll/runs/generate` | 🏢 | ✅ |
| Edit item payroll | `PATCH /payroll/runs/:id/items/:itemId` | 🏢 | ✅ |
| Bayar payroll | `POST /payroll/runs/:id/pay` | 🏢 | ✅ |

---

## Grup: Master Data

### 🏷️ Merek & Tipe — `/mereks`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List/tambah/edit/hapus merek | `GET,POST /mereks` · `PATCH,DELETE /:id` | — | ✅ |
| List/tambah/edit/hapus tipe | `GET,POST /mereks/:merekId/tipes` · `PATCH,DELETE /:id` | — | ✅ |

### 🔧 Vendor — `/vendors`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List/detail/tambah/edit/hapus | `GET /vendors` · `GET,PATCH,DELETE /:id` · `POST /vendors` | — | ✅ |

### 🏢 Cabang — `/branches`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup PIC | `GET /branches/lookups/pics` | — | ✅ |
| List/detail/tambah/edit/hapus | `GET /branches` · `GET,PATCH,DELETE /:id` · `POST /branches` | — | ✅ |
| Upload/hapus foto cabang | `POST /branches/:id/images` · `DELETE /branches/:id/images/:imageId` | — | ✅ |

### 📋 Master Generik (Leasing, Sumber Lead, Pengecekan, Kategori Pengeluaran, Metode Pembayaran, Dokumen, Perlengkapan)
> Semua memakai pola generik `{name, code, isActive}` di path masing-masing.

| Menu | Path | Aksi | ✔ |
|---|---|---|:--:|
| Leasing | `/leasings` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |
| Sumber Lead | `/sumber-leads` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |
| Pengecekan | `/pengecekans` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |
| Kategori Pengeluaran | `/kategori-pengeluarans` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |
| Metode Pembayaran | `/metode-pembayarans` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |
| Dokumen | `/dokumens` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |
| Perlengkapan | `/perlengkapans` | `GET,POST` · `PATCH,DELETE /:id` | ✅ |

### 💰 Investor — `/investors` (+ modal per cabang `/investors/:id`)
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| List/tambah/edit/hapus investor | `GET,POST /investors` · `PATCH,DELETE /:id` | — | ✅ |
| Lookup akun kas modal | `GET /investors/:id/lookups/cash-accounts` | 🏢 | ✅ |
| Akun modal (per cabang) | `GET /investors/:id/capital-accounts` | 🏢 | ✅ |
| Histori transaksi modal | `GET /investors/:id/capital-transactions` | 🏢 | ✅ |
| Setor modal 🔑 | `POST /investors/:id/capital/deposits` | 🏢 | ✅ |
| Tarik modal 🔑 | `POST /investors/:id/capital/withdrawals` | 🏢 | ✅ |

### 🤝 Kewajiban Investor — `/investor-obligations`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup akun kas | `GET /investor-obligations/lookups/cash-accounts` | 🏢 | ✅ |
| List | `GET /investor-obligations` | 🏢 | ✅ |
| Generate | `POST /investor-obligations/generate` | 🏢 | ✅ |
| Detail | `GET /investor-obligations/:id` | 🏢 | ✅ |
| Riwayat pembayaran | `GET /investor-obligations/:id/payments` | 🏢 | ✅ |
| Bayar 🔑 | `POST /investor-obligations/:id/payments` | 🏢 | ✅ |
| Balik pembayaran | `POST /investor-obligations/:id/payments/:paymentId/reverse` | 🏢 | ✅ |

---

## Grup: Akses

### 🛡️ Role — `/roles`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup permission | `GET /roles/lookups/permissions` | — | ✅ |
| List/detail/tambah/edit/hapus | `GET /roles` · `GET,PATCH,DELETE /:id` · `POST /roles` | — | ✅ |
| Set permission role | `PUT /roles/:id/permissions` | — | ✅ |

### 👤 User — `/users`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup (role/cabang) | `GET /users/lookups` | — | ✅ |
| List/detail/tambah/edit/hapus | `GET /users` · `GET,PATCH,DELETE /:id` · `POST /users` | — | ✅ |
| Ubah role user | `PUT /users/:id/role` | — | ✅ |
| Ubah cabang user | `PUT /users/:id/branch` | — | ✅ |

### 📑 Menu & Permission — `/menus`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup grup | `GET /menus/lookups/groups` | — | ✅ |
| Grup menu: list/detail/tambah/edit/hapus | `GET /menus/groups` · `GET,PATCH,DELETE /groups/:id` · `POST /groups` | — | ✅ |
| Tambah item ke grup | `POST /menus/groups/:groupId/items` | — | ✅ |
| Menu: detail/edit/hapus | `GET,PATCH,DELETE /menus/:id` | — | ✅ |
| Permission menu: tambah/edit/hapus | `POST /menus/:menuId/permissions` · `PATCH,DELETE /:menuId/permissions/:permId` | — | ✅ |

---

## Grup: Lainnya (Keuangan & Pengaturan)

### 📈 Dashboard Cashflow & Laporan Cashflow — `/cash-flow`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Dashboard kas | `GET /cash-flow/dashboard` | 🏢 (read) | ✅ |

### 💳 Cash Flow — `/cash-accounts` + `/cash-transactions`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Akun kas: list/detail/tambah/edit/hapus | `GET /cash-accounts` · `GET,PATCH,DELETE /:id` · `POST /cash-accounts` | 🏢 | ✅ |
| Ledger transaksi | `GET /cash-transactions` | 🏢 | ✅ |
| Lookup akun kas | `GET /cash-transactions/lookups/cash-accounts` | 🏢 | ✅ |
| Kas masuk / keluar 🔑 | `POST /cash-transactions/{manual-in,manual-out}` | 🏢 | ✅ |
| Transfer / Adjustment 🔑 | `POST /cash-transactions/{transfer,adjustment}` | 🏢 | ✅ |
| Transfer antar cabang 🔑 | `POST /cash-transactions/inter-branch-transfer` | 🏢 | ✅ |
| Balik transaksi | `POST /cash-transactions/:id/reverse` | 🏢 | ✅ |

### 📚 Pembukuan Cabang — `/books`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Lookup akun kas | `GET /books/lookups/cash-accounts` | 🏢 | ✅ |
| Periode: list/detail | `GET /books/periods` · `GET /books/periods/:period` | 🏢 | ✅ |
| Ledger | `GET /books/ledger` | 🏢 | ✅ |
| Ringkasan kas / laba rugi | `GET /books/{cash-summary,profit-summary}` | 🏢 | ✅ |
| Pengaturan pajak: lihat/ubah | `GET,PUT /books/tax-settings` | 🏢 | ✅ |
| Retry cadangan pajak | `POST /books/tax-reserve/retry` | 🏢 | ✅ |
| Tutup periode | `POST /books/periods/:period/close` | 🏢 | ✅ |

### ⚙️ Pengaturan — `/auth`
| Aksi UI | Method + Endpoint | Cabang | ✔ |
|---|---|:--:|:--:|
| Info user login (read-only) | `GET /auth/me` | — | ✅ |

---

## Global / Non-menu

### 🔐 Auth
| Aksi | Method + Endpoint | ✔ |
|---|---|:--:|
| Login | `POST /auth/login` | ✅ |
| Refresh token (interceptor) | `POST /auth/refresh` | ✅ |
| Profil | `GET /auth/me` | ✅ |
| Logout / Logout semua | `POST /auth/{logout,logout-all}` | ✅ |

### 🌿 Branch Context (switcher header)
| Aksi | Method + Endpoint | ✔ |
|---|---|:--:|
| Opsi cabang untuk switcher | `GET /branch-context/options` | ✅ |

### 🎨 CMS Admin — `/cms` (menu: Site Settings, Homepage, About, Katalog, Testimoni, Kontak, Simulasi Kredit)
| Aksi UI | Method + Endpoint | ✔ |
|---|---|:--:|
| Section homepage/about: baca/simpan | `GET,PUT /cms/:page/:section` | ✅ |
| Upload hero image | `POST /cms/:page/hero-image` | ✅ |
| Lookup homepage (merek/unit unggulan) | `GET /cms/homepage/lookups` | ✅ |
| Upload generik | `POST /cms/uploads/:folder` | ✅ |
| Site settings: baca/simpan | `GET,PUT /cms/site-settings` | ✅ |
| Upload logo/favicon | `POST /cms/site-settings/{logo,favicon}` | ✅ |
| Contact page: baca/simpan | `GET,PUT /cms/contact-page` | ✅ |
| Catalog page: baca/simpan | `GET,PUT /cms/catalog-page` | ✅ |
| Testimoni: list/tambah/edit/publish/avatar/hapus | `GET,POST /cms/testimonials` · `PUT,PATCH .../publish,POST .../avatar,DELETE /:id` | ✅ |
| Pesan kontak: list/count/status/hapus | `GET /cms/contact-messages` · `.../count-new` · `PATCH /:id/status` · `DELETE /:id` | ✅ |
| Simulasi kredit config: baca/simpan | `GET,PUT /cms/credit-simulation/config` | ✅ |
| Katalog unit CMS: list/publish/foto | `GET /cms/catalog` · `PATCH /:id/publish` · `POST /:id/images` · `PATCH /:id/images/reorder` · `DELETE /:id/images/:imageId` | ✅ |

### 🌐 Situs Publik — `/public` (landing, katalog, simulasi, kontak)
| Aksi UI | Method + Endpoint | ✔ |
|---|---|:--:|
| Site settings publik | `GET /public/site-settings` | ✅ |
| Homepage / About / Contact / Catalog page | `GET /public/{homepage,about,contact-page,catalog-page}` | ✅ |
| Katalog: list/brands/detail/related | `GET /public/catalog` · `.../brands` · `/:id` · `/:id/related` | ✅ |
| Simulasi kredit: config/hitung | `GET /public/credit-simulation/config` · `POST .../calculate` | ✅ |
| Kirim pesan kontak | `POST /public/contact-messages` | ✅ |

---

## Catatan cross-check

1. **Semua path FE cocok dengan route BE** (crosscheck 22 Juli 2026). Tidak ada endpoint FE yang menembak route yang tidak ada di backend.
2. **Header `X-Branch-Id` (kolom 🏢)** dilampirkan otomatis oleh interceptor dari cabang aktif di **BranchSwitcher header** — jadi tidak ada lagi celah "lupa kirim header" (dulu penyebab error `BRANCH_CONTEXT_REQUIRED` di Unit/Lead/Rekondisi/Test Drive).
3. **Modul branch-scoped di backend** (`router.use(resolveBranchScope)`): units, leads, lead-orders, test-drives, rekondisis, cash-accounts, cash-transactions, cash-flow, operational-expenses, recurring-expenses, payroll, books, investors/capital, investor-obligations, dashboard, private-media.
4. **Target** memakai skema berbeda: `branchId` dikirim di **body** saat create (bukan header) — sesuai kontrak `create_target`.
5. **Endpoint BE yang belum dipakai FE** (bukan mismatch, hanya belum dikonsumsi): `GET /units/lookups/branches` (FE ambil cabang dari `/branch-context/options`). Aman.
6. Untuk RBAC/permission per endpoint, lihat `authorize(...)` di tiap `*.route.js` backend — dokumen ini fokus ke pemetaan URL, bukan permission.
