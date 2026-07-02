# PRD Perbaikan API Lookup Finance

Dokumen ini menjelaskan perbaikan API lookup untuk modul Operational, Payroll, dan Cash Flow.

Tujuan utama: frontend cukup memakai satu base route lookup finance:

```text
/api/v1/finance/lookups
```

Dengan route ini, frontend tidak perlu mengambil dropdown finance dari route modul lain seperti `/users`, `/lead-orders`, `/units`, `/rekondisis`, `/investors`, atau `/kategori-pengeluarans`.

---

## 1. Konvensi Umum

### Authentication

Semua endpoint wajib login.

```http
Authorization: Bearer <accessToken>
```

### Permission

Semua endpoint lookup finance membutuhkan:

```text
FINANCE_LOOKUP_READ
```

Frontend tetap harus handle error `403` jika user tidak punya permission.

### Format Response Sukses

Semua lookup mengembalikan array data tanpa pagination.

```json
{
  "success": true,
  "message": "Lookup berhasil diambil",
  "data": []
}
```

### Format Error

```json
{
  "success": false,
  "message": "Tidak memiliki akses",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

Frontend wajib membaca error dengan pola:

```js
const code = error?.response?.data?.error?.code || error?.response?.data?.code;
const message = error?.response?.data?.message || "Terjadi kesalahan";
```

### Prinsip UX Frontend

- Lookup dipakai untuk dropdown, combobox, autocomplete, dan checklist.
- Lookup tidak memakai pagination, jadi frontend cukup request ulang saat search berubah.
- Beri debounce 300-500ms untuk search input.
- Saat data kosong, tampilkan empty state pendek, misalnya "Data tidak ditemukan".
- Jika endpoint gagal, tampilkan message backend dan tetap biarkan user retry.

---

## 2. Endpoint Summary

| Method | Endpoint | Fungsi UI |
|---|---|---|
| GET | `/api/v1/finance/lookups/cash-accounts` | Dropdown akun kas |
| GET | `/api/v1/finance/lookups/expense-categories` | Dropdown kategori pengeluaran |
| GET | `/api/v1/finance/lookups/payroll-users` | Dropdown user/karyawan payroll |
| GET | `/api/v1/finance/lookups/sales` | Dropdown sales |
| GET | `/api/v1/finance/lookups/deal-orders` | Dropdown order DEAL untuk insentif |
| GET | `/api/v1/finance/lookups/recurring-expenses` | Checklist generate pengeluaran rutin |
| GET | `/api/v1/finance/lookups/payroll-runs` | Lookup payroll run |
| GET | `/api/v1/finance/lookups/units` | Lookup unit untuk finance/report |
| GET | `/api/v1/finance/lookups/rekondisis-payable` | Lookup rekondisi selesai dan belum dibayar |
| GET | `/api/v1/finance/lookups/investors` | Dropdown investor |

---

## 3. Cash Accounts

### GET `/api/v1/finance/lookups/cash-accounts`

Dipakai pada:

- Bayar pengeluaran operasional.
- Manual kas masuk.
- Manual kas keluar.
- Transfer antar kas.
- Adjustment.
- Bayar payroll.
- Input pembelian unit.
- Input modal investor.
- Input pembayaran sales order.

Query:

| Query | Type | Default | Keterangan |
|---|---|---|---|
| `search` | string | - | Cari `name` atau `code` |
| `type` | string | - | `CASH`, `BANK`, `OTHER` |
| `isActive` | string | `true` | `"true"` atau `"false"` |

Request:

```http
GET /api/v1/finance/lookups/cash-accounts?search=kas&type=CASH
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "message": "Lookup akun kas berhasil diambil",
  "data": [
    {
      "id": "cash-account-uuid",
      "name": "Kas Utama",
      "code": "KAS_UTAMA",
      "type": "CASH",
      "isActive": true
    }
  ]
}
```

UI:

- Tampilkan label: `name`.
- Tampilkan helper text kecil: `code` dan `type`.
- Disable atau sembunyikan item nonaktif.

---

## 4. Expense Categories

### GET `/api/v1/finance/lookups/expense-categories`

Dipakai pada:

- Form Operational Expense.
- Form Recurring Expense.

Query:

| Query | Type | Default | Keterangan |
|---|---|---|---|
| `search` | string | - | Cari `name` atau `code` |
| `isActive` | string | `true` | `"true"` atau `"false"` |

Response item:

```json
{
  "id": "kategori-uuid",
  "name": "Listrik",
  "code": "LISTRIK",
  "isActive": true
}
```

UI:

- Tampilkan label: `name`.
- Tampilkan `code` sebagai secondary text.
- Jika kategori kosong, tampilkan CTA menuju halaman Master Kategori Pengeluaran jika user punya permission.

---

## 5. Payroll Users

### GET `/api/v1/finance/lookups/payroll-users`

Dipakai pada:

- Dropdown user/karyawan di Master Gapok.
- Menghindari user mengetik `userId` manual.
- Menghindari frontend call route `/users`.

Query:

| Query | Type | Default | Keterangan |
|---|---|---|---|
| `search` | string | - | Cari `name` atau `username` |
| `isActive` | string | `true` | `"true"` atau `"false"` |
| `role` | string | - | Optional filter role code, misalnya `SALES`, `ADMIN`, `OWNER` |

Response:

```json
{
  "success": true,
  "message": "Lookup user payroll berhasil diambil",
  "data": [
    {
      "id": "user-uuid",
      "name": "Budi Sales",
      "username": "budi",
      "roleName": "Sales",
      "isActive": true
    }
  ]
}
```

UI:

- Label utama: `name`.
- Secondary: `username` dan `roleName`.
- Untuk form master gapok, default tampilkan semua user aktif.

---

## 6. Sales

### GET `/api/v1/finance/lookups/sales`

Dipakai pada:

- Dropdown sales di form Insentif Sales.
- Filter list insentif sales.

Query:

| Query | Type | Default | Keterangan |
|---|---|---|---|
| `search` | string | - | Cari `name` atau `username` |
| `isActive` | string | `true` | `"true"` atau `"false"` |

Response:

```json
{
  "success": true,
  "message": "Lookup sales berhasil diambil",
  "data": [
    {
      "id": "sales-user-uuid",
      "name": "Budi Sales",
      "username": "budi",
      "isActive": true
    }
  ]
}
```

Catatan:

- Endpoint ini hanya mengambil user dengan role code `SALES`.
- Jika perusahaan memakai role sales dengan code lain, seed role harus disesuaikan.

---

## 7. Deal Orders

### GET `/api/v1/finance/lookups/deal-orders`

Dipakai pada:

- Dropdown sales order di form Insentif Sales.
- Hanya menampilkan order dengan status `DEAL`.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari nomor order atau nama customer |
| `salesId` | string | Filter order milik sales tertentu |
| `period` | string | Format `YYYY-MM`; filter berdasarkan `updatedAt` order |
| `withoutIncentive` | string | Jika `"true"`, hanya order yang belum punya insentif |

Response:

```json
{
  "success": true,
  "message": "Lookup sales order DEAL berhasil diambil",
  "data": [
    {
      "id": "lead-order-uuid",
      "nomorOrder": "SO-202606-001",
      "salesId": "sales-user-uuid",
      "salesName": "Budi Sales",
      "customerName": "Andi",
      "status": "DEAL",
      "hargaFinal": 100000000,
      "dealDate": "2026-06-30T00:00:00.000Z",
      "hasIncentive": false
    }
  ]
}
```

Catatan implementasi:

- Karena belum ada field khusus `dealDate`, backend memakai `updatedAt` order sebagai `dealDate`.
- Filter `period` juga memakai `updatedAt`.
- Jika frontend butuh tanggal deal yang benar-benar historis, backend perlu field status history di fase berikutnya.

UI:

- Jika user memilih sales, call ulang dengan `salesId`.
- Untuk form tambah insentif, gunakan `withoutIncentive=true`.
- Tampilkan label: `nomorOrder - customerName`.
- Tampilkan secondary: `salesName`, `hargaFinal`, `dealDate`.
- Jika `hasIncentive=true`, tampilkan badge "Sudah ada insentif" dan disable item pada form tambah.

---

## 8. Recurring Expenses

### GET `/api/v1/finance/lookups/recurring-expenses`

Dipakai pada:

- Checklist template aktif saat generate pengeluaran rutin.
- Menghindari frontend call endpoint utama `/recurring-expenses` jika hanya butuh data ringan.

Query:

| Query | Type | Default | Keterangan |
|---|---|---|---|
| `search` | string | - | Cari nama template |
| `isActive` | string | `true` | `"true"` atau `"false"` |

Response:

```json
{
  "success": true,
  "message": "Lookup pengeluaran rutin berhasil diambil",
  "data": [
    {
      "id": "recurring-expense-uuid",
      "name": "Sewa showroom",
      "kategoriPengeluaranId": "kategori-uuid",
      "kategoriName": "Sewa",
      "defaultAmount": 25000000,
      "isActive": true
    }
  ]
}
```

UI:

- Gunakan checkbox list.
- Default nominal input diisi dari `defaultAmount`.
- User boleh override nominal sebelum submit generate recurring expense.

---

## 9. Payroll Runs

### GET `/api/v1/finance/lookups/payroll-runs`

Dipakai pada:

- Filter/reporting payroll.
- Future enhancement relasi laporan finance.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `period` | string | Format `YYYY-MM` |
| `status` | string | `DRAFT`, `PAID`, `CANCELLED` |

Response:

```json
{
  "success": true,
  "message": "Lookup payroll run berhasil diambil",
  "data": [
    {
      "id": "payroll-run-uuid",
      "period": "2026-06",
      "status": "DRAFT",
      "totalPaid": 11500000
    }
  ]
}
```

UI:

- Label: `period`.
- Secondary: `status` dan `totalPaid`.

---

## 10. Units

### GET `/api/v1/finance/lookups/units`

Dipakai pada:

- Filter/report ledger source `UNIT_PURCHASE`.
- Lookup unit dari sisi finance tanpa call `/units`.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari plat nomor, merek, atau tipe |
| `statusUnit` | string | `INVENTORY`, `READY_STOCK`, `HOLD`, `SOLD` |

Response:

```json
{
  "success": true,
  "message": "Lookup unit berhasil diambil",
  "data": [
    {
      "id": "unit-uuid",
      "platNomor": "B 1234 ABC",
      "merekName": "Toyota",
      "tipeName": "Avanza",
      "hargaBeli": 100000000,
      "tanggalPembelian": "2026-06-30T00:00:00.000Z",
      "purchaseCashTransactionId": "cash-transaction-uuid"
    }
  ]
}
```

UI:

- Label: `platNomor`.
- Secondary: `merekName tipeName`.
- Tampilkan indikator "Sudah tercatat di kas" jika `purchaseCashTransactionId` ada.

---

## 11. Rekondisis Payable

### GET `/api/v1/finance/lookups/rekondisis-payable`

Dipakai pada:

- Lookup rekondisi selesai tetapi belum dibayar.
- Mendukung flow pembayaran rekondisi dari halaman finance.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari plat nomor, merek, atau tipe |
| `unitId` | string | Filter per unit |

Response:

```json
{
  "success": true,
  "message": "Lookup rekondisi payable berhasil diambil",
  "data": [
    {
      "id": "rekondisi-uuid",
      "unitId": "unit-uuid",
      "platNomor": "B 1234 ABC",
      "unitName": "Toyota Avanza",
      "totalCost": 5000000,
      "status": "COMPLETED",
      "paidAt": null
    }
  ]
}
```

Aturan:

- Backend hanya mengembalikan rekondisi dengan `status = COMPLETED` dan `paidAt = null`.

UI:

- Label: `platNomor - unitName`.
- Secondary: `totalCost`.
- Saat user memilih item, arahkan pembayaran ke endpoint existing:

```text
POST /api/v1/rekondisis/:id/pay
```

---

## 12. Investors

### GET `/api/v1/finance/lookups/investors`

Dipakai pada:

- Dropdown investor untuk flow modal investor dari sisi finance.
- Menghindari frontend call `/investors` jika halaman finance yang mengelola modal investor.

Query:

| Query | Type | Default | Keterangan |
|---|---|---|---|
| `search` | string | - | Cari nama atau kode investor |
| `isActive` | string | `true` | `"true"` atau `"false"` |

Response:

```json
{
  "success": true,
  "message": "Lookup investor berhasil diambil",
  "data": [
    {
      "id": "investor-uuid",
      "name": "Investor A",
      "code": "INV_A",
      "isActive": true
    }
  ]
}
```

UI:

- Label: `name`.
- Secondary: `code`.

---

## 13. Frontend Implementation Guide

### 13.1 Service Layer

Buat satu service frontend, misalnya:

```ts
export const financeLookupService = {
  cashAccounts: (params) => api.get("/finance/lookups/cash-accounts", { params }),
  expenseCategories: (params) => api.get("/finance/lookups/expense-categories", { params }),
  payrollUsers: (params) => api.get("/finance/lookups/payroll-users", { params }),
  sales: (params) => api.get("/finance/lookups/sales", { params }),
  dealOrders: (params) => api.get("/finance/lookups/deal-orders", { params }),
  recurringExpenses: (params) => api.get("/finance/lookups/recurring-expenses", { params }),
  payrollRuns: (params) => api.get("/finance/lookups/payroll-runs", { params }),
  units: (params) => api.get("/finance/lookups/units", { params }),
  rekondisisPayable: (params) => api.get("/finance/lookups/rekondisis-payable", { params }),
  investors: (params) => api.get("/finance/lookups/investors", { params }),
};
```

### 13.2 Dropdown UX

Rekomendasi behavior:

- Load awal saat form dibuka.
- Search menggunakan debounce 300-500ms.
- Tampilkan loading di dalam dropdown.
- Tampilkan empty state jika `data.length === 0`.
- Jika API error, tampilkan inline error dan tombol retry kecil.

### 13.3 Error Handling

Jika lookup gagal:

- `401`: coba refresh token, lalu ulang request.
- `403`: sembunyikan dropdown/action terkait dan tampilkan "Anda tidak memiliki akses lookup finance".
- `500`: tampilkan "Gagal mengambil data dropdown. Coba lagi."

### 13.4 Prioritas Minimal UI

Endpoint yang wajib dipakai untuk implementasi awal:

1. `/finance/lookups/cash-accounts`
2. `/finance/lookups/expense-categories`
3. `/finance/lookups/payroll-users`
4. `/finance/lookups/sales`
5. `/finance/lookups/deal-orders`
6. `/finance/lookups/recurring-expenses`

Endpoint lain bisa dipakai untuk filter/reporting atau flow lanjutan.

---

## 14. Catatan Teknis Backend

- Endpoint lookup ini read-only.
- Tidak ada pagination.
- Default `isActive = true` untuk:
  - cash accounts
  - expense categories
  - payroll users
  - sales
  - recurring expenses
  - investors
- `deal-orders.period` memakai `updatedAt` karena belum ada field `dealDate`.
- `deal-orders.withoutIncentive=true` memakai relasi `salesIncentives none`.
- `rekondisis-payable` hanya mengembalikan data `COMPLETED` dan belum dibayar.
