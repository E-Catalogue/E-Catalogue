# PRD: Modul Operational, Payroll, dan Cash Flow

Dokumen ini menjadi acuan frontend untuk membangun UI dan integrasi API modul keuangan sederhana:

- Operational: pengeluaran normal, pengeluaran backdate, dan pengeluaran rutin.
- Payroll: master gapok, insentif sales, generate payroll, dan pembayaran payroll.
- Cash Flow: akun kas, buku kas/ledger, kas masuk, kas keluar, transfer antar kas, penyesuaian saldo, dan dashboard.

Dokumen ini juga menjelaskan integrasi kas dari modul lain:

- Input Unit Baru menghasilkan kas keluar pembelian unit.
- Pembayaran Sales Order menghasilkan kas masuk.
- Modal Investor menghasilkan kas masuk.
- Pembayaran Rekondisi menghasilkan kas keluar.

---

## 0. Konvensi API

### Base URL

```text
/api/v1
```

### Authentication

Semua endpoint pada dokumen ini wajib login.

```http
Authorization: Bearer <accessToken>
```

### Format Response Sukses

```json
{
  "success": true,
  "message": "Request berhasil",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Catatan:

- `meta` hanya ada pada endpoint list/pagination.
- FE wajib selalu membaca `success`.
- FE wajib menampilkan `message` dari backend sebagai feedback user.

### Format Response Error

Backend dapat mengembalikan error dalam format global:

```json
{
  "success": false,
  "message": "Akun kas tidak ditemukan",
  "error": {
    "code": "CASH_ACCOUNT_NOT_FOUND",
    "details": null
  }
}
```

Beberapa dokumen lama memakai contoh `code` di root response. Untuk implementasi frontend, gunakan resolver berikut:

```js
const errorCode = error?.response?.data?.error?.code || error?.response?.data?.code;
const errorMessage = error?.response?.data?.message || "Terjadi kesalahan";
const errorDetails = error?.response?.data?.error?.details || null;
```

### Error UI Wajib

Frontend wajib menampilkan error secara jelas dan user-friendly:

| Status | Makna | Tampilan UI yang Disarankan |
|---|---|---|
| `400` | Request tidak valid secara format/domain sederhana | Toast merah + highlight field jika ada details |
| `401` | Token invalid/expired/session habis | Coba refresh token sekali, jika gagal redirect login |
| `403` | User tidak punya permission | Empty state "Anda tidak memiliki akses" dan sembunyikan tombol action |
| `404` | Data tidak ditemukan | Toast + arahkan balik ke list/detail sebelumnya |
| `409` | Konflik state/data, misal sudah dibayar | Dialog/toast dengan pesan backend, refresh data |
| `422` | Validasi bisnis gagal | Tampilkan pesan backend di form |
| `500` | Error server | Toast umum "Terjadi kesalahan server" |

### Pagination Query

Endpoint list memakai:

| Query | Type | Default | Keterangan |
|---|---:|---:|---|
| `page` | number | `1` | Halaman. Minimal 1. |
| `limit` | number | `20` | Jumlah data. Maksimal 100. |

---

## 1. Struktur Menu Frontend

### 1.1 Operational

```text
Operational
|-- Pengeluaran
|-- Pengeluaran Rutin
`-- Kategori Pengeluaran
```

Catatan:

- `Kategori Pengeluaran` sudah ada di endpoint `/api/v1/kategori-pengeluarans`.
- `Pengeluaran` adalah transaksi operasional aktual.
- `Pengeluaran Rutin` adalah template bulanan, bukan transaksi kas langsung.

### 1.2 Payroll

```text
Payroll
|-- Master Gapok
|-- Insentif Sales
`-- Pembayaran Payroll
```

Catatan:

- Insentif sales diinput manual per sales order yang sudah `DEAL`.
- Pembayaran payroll digenerate per bulan dari gapok aktif + insentif sales periode tersebut.
- Kas keluar payroll dibuat saat payroll dibayar, bukan saat draft digenerate.

### 1.3 Cash Flow

```text
Cash Flow
|-- Dashboard Cash Flow
|-- Akun Kas
|-- Buku Kas / Ledger
|-- Kas Masuk
|-- Kas Keluar
|-- Transfer Antar Kas
`-- Penyesuaian Saldo
```

Catatan:

- `Kas Masuk`, `Kas Keluar`, `Transfer Antar Kas`, dan `Penyesuaian Saldo` memakai endpoint `cash-transactions`.
- `Buku Kas / Ledger` adalah list semua transaksi.
- `Dashboard Cash Flow` memakai endpoint ringkasan.

---

## 2. Model Konsep

### 2.1 Cash Account

Akun kas adalah sumber/tujuan uang.

Contoh:

- Kas Utama
- BCA Showroom
- Mandiri Operasional
- Kas Kecil

Object:

```json
{
  "id": "cash-account-uuid",
  "name": "Kas Utama",
  "code": "KAS_UTAMA",
  "type": "CASH",
  "accountNumber": null,
  "bankName": null,
  "openingBalance": 0,
  "isActive": true,
  "createdAt": "2026-06-30T10:00:00.000Z",
  "updatedAt": "2026-06-30T10:00:00.000Z"
}
```

Enum `type`:

```text
CASH, BANK, OTHER
```

### 2.2 Cash Transaction / Ledger

Semua arus kas masuk/keluar dicatat di ledger.

Object:

```json
{
  "id": "cash-transaction-uuid",
  "type": "OUT",
  "sourceType": "OPERATIONAL",
  "sourceId": "source-uuid",
  "cashAccountId": "cash-account-uuid",
  "amount": 500000,
  "transactionDate": "2026-06-30T00:00:00.000Z",
  "description": "Bayar listrik Juni",
  "proofUrl": null,
  "transferGroupId": null,
  "createdById": "user-uuid",
  "cashAccount": {
    "id": "cash-account-uuid",
    "name": "Kas Utama",
    "code": "KAS_UTAMA"
  },
  "createdBy": {
    "id": "user-uuid",
    "name": "Admin",
    "username": "admin"
  }
}
```

Enum `type`:

```text
IN, OUT, TRANSFER
```

Catatan implementasi saat ini:

- Transfer antar kas membuat 2 ledger:
  - `OUT` dari akun asal
  - `IN` ke akun tujuan
- Keduanya memiliki `sourceType = TRANSFER` dan `transferGroupId` yang sama.

Enum `sourceType`:

```text
UNIT_PURCHASE
REKONDISI
LEAD_PAYMENT
OPERATIONAL
PAYROLL
INVESTOR_MODAL
MANUAL_ADJUSTMENT
TRANSFER
```

### 2.3 Operational Expense

Object:

```json
{
  "id": "operational-expense-uuid",
  "type": "BACKDATE",
  "status": "DRAFT",
  "title": "Tagihan listrik Mei",
  "kategoriPengeluaranId": "kategori-uuid",
  "amount": 750000,
  "expenseDate": "2026-06-30T00:00:00.000Z",
  "expensePeriodStart": "2026-05-01T00:00:00.000Z",
  "expensePeriodEnd": "2026-05-31T00:00:00.000Z",
  "dueDate": "2026-06-10T00:00:00.000Z",
  "paidDate": null,
  "description": "Tagihan listrik bulan Mei",
  "proofUrl": null,
  "cashAccountId": null,
  "cashTransactionId": null,
  "kategoriPengeluaran": {
    "id": "kategori-uuid",
    "name": "Listrik",
    "code": "LISTRIK"
  }
}
```

Enum `type`:

```text
NORMAL, BACKDATE
```

Enum `status`:

```text
DRAFT, PAID, CANCELLED
```

### 2.4 Recurring Expense

Template pengeluaran rutin bulanan.

```json
{
  "id": "recurring-expense-uuid",
  "name": "Sewa showroom",
  "kategoriPengeluaranId": "kategori-uuid",
  "defaultAmount": 25000000,
  "description": "Sewa bulanan showroom",
  "isActive": true,
  "kategoriPengeluaran": {
    "id": "kategori-uuid",
    "name": "Sewa",
    "code": "SEWA"
  }
}
```

### 2.5 Payroll Base Salary

Master gapok user/karyawan.

```json
{
  "id": "base-salary-uuid",
  "userId": "user-uuid",
  "amount": 5000000,
  "effectiveStart": "2026-06-01T00:00:00.000Z",
  "effectiveEnd": null,
  "isActive": true,
  "user": {
    "id": "user-uuid",
    "name": "Budi Sales",
    "username": "budi",
    "isActive": true
  }
}
```

### 2.6 Sales Incentive

Insentif manual per sales order `DEAL`.

```json
{
  "id": "sales-incentive-uuid",
  "salesId": "sales-user-uuid",
  "leadOrderId": "lead-order-uuid",
  "amount": 500000,
  "period": "2026-06",
  "status": "DRAFT",
  "description": "Insentif penjualan Avanza",
  "sales": {
    "id": "sales-user-uuid",
    "name": "Budi Sales",
    "username": "budi"
  },
  "leadOrder": {
    "id": "lead-order-uuid",
    "nomorOrder": "SO-202606-001",
    "status": "DEAL",
    "salesId": "sales-user-uuid",
    "hargaFinal": 100000000
  }
}
```

Enum `status`:

```text
DRAFT, INCLUDED, PAID, CANCELLED
```

Status lifecycle:

```text
DRAFT -> INCLUDED -> PAID
      -> CANCELLED
```

### 2.7 Payroll Run

Pembayaran payroll bulanan.

```json
{
  "id": "payroll-run-uuid",
  "period": "2026-06",
  "status": "DRAFT",
  "totalBaseSalary": 10000000,
  "totalIncentive": 1500000,
  "totalAllowance": 0,
  "totalDeduction": 0,
  "totalPaid": 11500000,
  "paidDate": null,
  "cashAccountId": null,
  "cashTransactionId": null,
  "items": [
    {
      "id": "payroll-item-uuid",
      "userId": "user-uuid",
      "baseSalary": 5000000,
      "incentive": 500000,
      "allowance": 0,
      "deduction": 0,
      "total": 5500000,
      "user": {
        "id": "user-uuid",
        "name": "Budi Sales",
        "username": "budi"
      },
      "salesIncentives": []
    }
  ]
}
```

Enum `status`:

```text
DRAFT, PAID, CANCELLED
```

---

## 3. Flow Besar

### 3.1 Flow Setup Awal

1. Admin/owner membuat akun kas di menu Cash Flow > Akun Kas.
2. Minimal ada satu akun kas aktif.
3. Seed backend membuat default `KAS_UTAMA`, tetapi FE tetap harus bisa membuat/mengubah akun kas lain.
4. Admin mengisi master kategori pengeluaran.
5. Admin mengisi master gapok untuk karyawan/sales.

### 3.2 Flow Input Unit Baru dan Kas Keluar

```text
User input unit baru
-->
User memilih akun kas pembelian
-->
POST /api/v1/units
-->
Backend membuat Unit
-->
Backend membuat CashTransaction OUT sourceType UNIT_PURCHASE
-->
Unit tersimpan dengan purchaseCashTransactionId
```

Catatan FE:

- Form tambah unit sekarang wajib menampilkan dropdown akun kas.
- `cashAccountId` wajib dikirim saat create unit.
- Setelah unit dibuat, `hargaBeli` dan `tanggalPembelian` dikunci dari perubahan jika sudah ada ledger.

Error penting:

- `CASH_ACCOUNT_NOT_FOUND`
- `CASH_ACCOUNT_INACTIVE`
- `UNIT_PURCHASE_LEDGER_LOCKED`

### 3.3 Flow Rekondisi dan Kas Keluar

```text
Buat rekondisi
-->
Tambah detail rekondisi
-->
Progress rekondisi
-->
Done rekondisi
-->
Rekondisi status COMPLETED
-->
User klik Bayar Rekondisi
-->
Pilih akun kas dan tanggal bayar
-->
POST /api/v1/rekondisis/:id/pay
-->
Backend membuat CashTransaction OUT sourceType REKONDISI
```

Catatan FE:

- Tombol "Bayar Rekondisi" hanya tampil jika `status = COMPLETED` dan `paidAt = null`.
- Jika `paidAt` sudah ada, tampilkan badge "Sudah Dibayar".
- Jangan izinkan user membayar ulang.

Error penting:

- `REKONDISI_NOT_FOUND`
- `REKONDISI_NOT_COMPLETED`
- `REKONDISI_ALREADY_PAID`
- `CASH_ACCOUNT_NOT_FOUND`
- `CASH_ACCOUNT_INACTIVE`

### 3.4 Flow Pembayaran Sales Order dan Kas Masuk

```text
Sales order dibuat
-->
User input pembayaran
-->
Pilih jenis pembayaran dan akun kas
-->
POST /api/v1/lead-orders/:orderId/payments
-->
Backend membuat LeadPayment
-->
Backend membuat CashTransaction IN sourceType LEAD_PAYMENT
```

Jenis pembayaran:

```text
BOOKING_FEE
DP
TAMBAHAN_DP
PELUNASAN
LEASING
PENCAIRAN_LEASING
REFUND_LEASING
```

Catatan:

- `LEASING` masih diterima sebagai legacy alias.
- Backend akan menormalisasi `LEASING` menjadi `PENCAIRAN_LEASING`.
- UI baru sebaiknya memakai label `Pencairan Leasing`, value `PENCAIRAN_LEASING`.

### 3.5 Flow Kredit Dengan Kekurangan Approval Leasing

Contoh:

```text
Harga final: 100.000.000
DP customer: 10.000.000
Approval/pencairan leasing: 85.000.000
Shortfall: 5.000.000
```

Opsi penutup shortfall:

1. Customer tambah DP: input `TAMBAHAN_DP` 5 juta.
2. Pakai refund leasing: input `REFUND_LEASING`, sistem menghitung refund yang bisa menutup shortfall.
3. Kombinasi tambahan DP + refund leasing.

Response detail sales order memiliki field:

```json
{
  "settlement": {
    "totalDpCustomer": 15000000,
    "approvalLeasingAmount": 85000000,
    "refundLeasingAmount": 6000000,
    "shortfall": 0,
    "refundUsedForShortfall": 0,
    "additionalDpNeeded": 0
  },
  "totalPaid": 106000000,
  "remainingPayment": 0,
  "isPaid": true
}
```

Interpretasi FE:

- `shortfall > 0`: tampilkan alert "Masih kurang Rp ...".
- `additionalDpNeeded > 0`: sarankan input `TAMBAHAN_DP`.
- `refundLeasingAmount > refundUsedForShortfall`: tampilkan "Sisa refund leasing masuk showroom".
- `isPaid = true`: tampilkan badge "Lunas".

### 3.6 Flow Operational Expense Normal

```text
User input pengeluaran
-->
type NORMAL
-->
status DRAFT
-->
User klik Bayar
-->
Pilih akun kas + paidDate
-->
Backend membuat CashTransaction OUT sourceType OPERATIONAL
-->
status PAID
```

### 3.7 Flow Operational Expense Backdate

Contoh: membayar tagihan listrik bulan Mei pada bulan Juni.

```text
User input pengeluaran
-->
type BACKDATE
-->
expensePeriodStart = 2026-05-01
expensePeriodEnd = 2026-05-31
dueDate = 2026-06-10
expenseDate = tanggal pencatatan/tagihan
-->
User klik Bayar
-->
paidDate = tanggal uang keluar
-->
Ledger memakai paidDate sebagai transactionDate
```

Catatan FE:

- Jika `type = NORMAL`, field periode boleh disembunyikan.
- Jika `type = BACKDATE`, tampilkan:
  - Periode tagihan dari
  - Periode tagihan sampai
  - Jatuh tempo
  - Tanggal pencatatan/tagihan
- `paidDate` hanya diisi saat user membayar.

### 3.8 Flow Pengeluaran Rutin

```text
Admin membuat template pengeluaran rutin
-->
Set defaultAmount
-->
Setiap bulan user klik Generate
-->
Backend membuat draft OperationalExpense
-->
Nominal bisa dioverride saat generate
-->
Draft dibayar lewat flow Operational Expense
```

Contoh:

- Sewa: nominal tetap.
- Listrik/Air: nominal dinamis, override saat generate.

### 3.9 Flow Payroll Bulanan

```text
Admin isi Master Gapok
-->
Admin input Insentif Sales per order DEAL
-->
Admin generate payroll periode YYYY-MM
-->
Backend mengambil gapok aktif dan insentif DRAFT
-->
Payroll Run status DRAFT
-->
Insentif status INCLUDED
-->
Admin review/edit allowance/deduction per item
-->
Admin bayar payroll
-->
Backend membuat CashTransaction OUT sourceType PAYROLL
-->
Payroll Run status PAID
-->
Insentif status PAID
```

Catatan FE:

- Tombol "Generate Payroll" hanya butuh `period`.
- Setelah generate, tampilkan halaman review payroll.
- Allowance/deduction bisa diedit saat `status = DRAFT`.
- Tombol "Bayar Payroll" hanya tampil jika `status = DRAFT`.
- Setelah payroll dibayar, semua input payroll harus readonly.

---

## 4. Endpoint Cash Account

### 4.1 GET `/api/v1/cash-accounts`

Mengambil daftar akun kas.

**Permission:** `CASH_ACCOUNT_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `search` | string | Cari name/code/bankName |
| `isActive` | string | `"true"` atau `"false"` |

Response:

```json
{
  "success": true,
  "message": "Daftar akun kas berhasil diambil",
  "data": [
    {
      "id": "cash-account-uuid",
      "name": "Kas Utama",
      "code": "KAS_UTAMA",
      "type": "CASH",
      "accountNumber": null,
      "bankName": null,
      "openingBalance": 0,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4.2 GET `/api/v1/cash-accounts/:id`

**Permission:** `CASH_ACCOUNT_READ`

### 4.3 POST `/api/v1/cash-accounts`

**Permission:** `CASH_ACCOUNT_CREATE`

Request:

```json
{
  "name": "Bank BCA Showroom",
  "code": "BCA_SHOWROOM",
  "type": "BANK",
  "accountNumber": "1234567890",
  "bankName": "BCA",
  "openingBalance": 10000000,
  "isActive": true
}
```

Aturan:

- `name` wajib, minimal 2 karakter.
- `code` wajib, 2-50 karakter, otomatis uppercase.
- `type`: `CASH`, `BANK`, `OTHER`.
- `openingBalance` minimal 0.
- `code` harus unik.

### 4.4 PATCH `/api/v1/cash-accounts/:id`

**Permission:** `CASH_ACCOUNT_UPDATE`

Semua field opsional, minimal 1 field.

### 4.5 DELETE `/api/v1/cash-accounts/:id`

**Permission:** `CASH_ACCOUNT_DELETE`

Efek: akun kas dinonaktifkan (`isActive = false`), bukan hard delete.

---

## 5. Endpoint Cash Transaction / Ledger

### 5.1 GET `/api/v1/cash-transactions`

Mengambil buku kas/ledger.

**Permission:** `CASH_TRANSACTION_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `type` | string | `IN`, `OUT`, `TRANSFER` |
| `sourceType` | string | Filter sumber |
| `cashAccountId` | string | Filter akun kas |
| `dateFrom` | ISO date | Tanggal awal |
| `dateTo` | ISO date | Tanggal akhir |

Response:

```json
{
  "success": true,
  "message": "Daftar transaksi kas berhasil diambil",
  "data": [
    {
      "id": "trx-uuid",
      "type": "IN",
      "sourceType": "LEAD_PAYMENT",
      "sourceId": "payment-uuid",
      "cashAccountId": "cash-account-uuid",
      "amount": 1000000,
      "transactionDate": "2026-06-30T00:00:00.000Z",
      "description": "BOOKING_FEE SO-202606-001",
      "cashAccount": {
        "id": "cash-account-uuid",
        "name": "Kas Utama",
        "code": "KAS_UTAMA"
      },
      "createdBy": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 5.2 POST `/api/v1/cash-transactions/manual-in`

Membuat kas masuk manual.

**Permission:** `CASH_TRANSACTION_CREATE`

Request:

```json
{
  "cashAccountId": "cash-account-uuid",
  "amount": 1000000,
  "transactionDate": "2026-06-30T00:00:00.000Z",
  "description": "Setoran kas manual",
  "proofUrl": null
}
```

Response: single `CashTransaction`.

### 5.3 POST `/api/v1/cash-transactions/manual-out`

Membuat kas keluar manual.

**Permission:** `CASH_TRANSACTION_CREATE`

Request sama seperti `manual-in`.

### 5.4 POST `/api/v1/cash-transactions/transfer`

Transfer antar akun kas.

**Permission:** `CASH_TRANSACTION_CREATE`

Request:

```json
{
  "fromCashAccountId": "kas-utama-uuid",
  "toCashAccountId": "bca-uuid",
  "amount": 5000000,
  "transactionDate": "2026-06-30T00:00:00.000Z",
  "description": "Setor kas tunai ke bank",
  "proofUrl": null
}
```

Response:

```json
{
  "success": true,
  "message": "Transfer antar kas berhasil dibuat",
  "data": {
    "transferGroupId": "uuid",
    "out": {
      "type": "OUT",
      "sourceType": "TRANSFER",
      "amount": 5000000
    },
    "in": {
      "type": "IN",
      "sourceType": "TRANSFER",
      "amount": 5000000
    }
  }
}
```

Aturan:

- `fromCashAccountId` dan `toCashAccountId` tidak boleh sama.
- Kedua akun harus aktif.

### 5.5 POST `/api/v1/cash-transactions/adjustment`

Penyesuaian saldo.

**Permission:** `CASH_TRANSACTION_CREATE`

Request:

```json
{
  "cashAccountId": "cash-account-uuid",
  "type": "IN",
  "amount": 100000,
  "transactionDate": "2026-06-30T00:00:00.000Z",
  "description": "Koreksi saldo awal",
  "proofUrl": null
}
```

`type` hanya boleh:

```text
IN, OUT
```

---

## 6. Endpoint Cash Flow Dashboard

### GET `/api/v1/cash-flow/dashboard`

Mengambil ringkasan saldo dan arus kas.

**Permission:** `CASH_TRANSACTION_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `dateFrom` | ISO date | Tanggal awal filter |
| `dateTo` | ISO date | Tanggal akhir filter |

Response:

```json
{
  "success": true,
  "message": "Dashboard cash flow berhasil diambil",
  "data": {
    "summary": {
      "openingBalance": 10000000,
      "totalIn": 5000000,
      "totalOut": 3000000,
      "endingBalance": 12000000
    },
    "accounts": [
      {
        "id": "cash-account-uuid",
        "name": "Kas Utama",
        "code": "KAS_UTAMA",
        "type": "CASH",
        "openingBalance": 10000000,
        "totalIn": 5000000,
        "totalOut": 3000000,
        "endingBalance": 12000000
      }
    ]
  }
}
```

UI yang disarankan:

- Card: Saldo awal, kas masuk, kas keluar, saldo akhir.
- Table per akun kas.
- Filter tanggal.
- Format nominal sebagai Rupiah.
- Gunakan warna netral:
  - Masuk: hijau.
  - Keluar: merah.
  - Transfer: biru/abu.

---

## 7. Endpoint Operational Expense

### 7.1 GET `/api/v1/operational-expenses`

**Permission:** `OPERATIONAL_EXPENSE_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `search` | string | Cari title/description |
| `status` | string | `DRAFT`, `PAID`, `CANCELLED` |
| `type` | string | `NORMAL`, `BACKDATE` |
| `kategoriPengeluaranId` | string | Filter kategori |

### 7.2 GET `/api/v1/operational-expenses/:id`

**Permission:** `OPERATIONAL_EXPENSE_READ`

### 7.3 POST `/api/v1/operational-expenses`

Membuat draft pengeluaran.

**Permission:** `OPERATIONAL_EXPENSE_CREATE`

Request normal:

```json
{
  "type": "NORMAL",
  "title": "Beli ATK",
  "kategoriPengeluaranId": "kategori-uuid",
  "amount": 250000,
  "expenseDate": "2026-06-30T00:00:00.000Z",
  "description": "Kertas dan pulpen",
  "proofUrl": null
}
```

Request backdate:

```json
{
  "type": "BACKDATE",
  "title": "Tagihan listrik Mei",
  "kategoriPengeluaranId": "kategori-uuid",
  "amount": 750000,
  "expenseDate": "2026-06-30T00:00:00.000Z",
  "expensePeriodStart": "2026-05-01T00:00:00.000Z",
  "expensePeriodEnd": "2026-05-31T00:00:00.000Z",
  "dueDate": "2026-06-10T00:00:00.000Z",
  "description": "Tagihan bulan Mei"
}
```

Aturan:

- `title` wajib.
- `kategoriPengeluaranId` wajib dan harus aktif.
- `amount` wajib dan harus > 0.
- `expenseDate` wajib.
- Field periode backdate opsional dari backend, tetapi FE wajib menampilkan dan mendorong user mengisinya untuk type `BACKDATE`.

### 7.4 PATCH `/api/v1/operational-expenses/:id`

**Permission:** `OPERATIONAL_EXPENSE_UPDATE`

Aturan:

- Hanya bisa update jika `status = DRAFT`.
- Jika sudah `PAID`, backend menolak dengan `OPERATIONAL_EXPENSE_NOT_EDITABLE`.

### 7.5 DELETE `/api/v1/operational-expenses/:id`

**Permission:** `OPERATIONAL_EXPENSE_DELETE`

Efek:

- `DRAFT` menjadi `CANCELLED`.
- `PAID` tidak bisa dibatalkan.

### 7.6 POST `/api/v1/operational-expenses/:id/pay`

Membayar pengeluaran dan membuat kas keluar.

**Permission:** `OPERATIONAL_EXPENSE_PAY`

Request:

```json
{
  "cashAccountId": "cash-account-uuid",
  "paidDate": "2026-06-30T00:00:00.000Z",
  "proofUrl": null
}
```

Response:

```json
{
  "success": true,
  "message": "Pengeluaran operasional berhasil dibayar",
  "data": {
    "id": "operational-expense-uuid",
    "status": "PAID",
    "paidDate": "2026-06-30T00:00:00.000Z",
    "cashAccountId": "cash-account-uuid",
    "cashTransactionId": "cash-transaction-uuid"
  }
}
```

UI:

- Tombol "Bayar" hanya muncul untuk `DRAFT`.
- `PAID`: badge hijau "Sudah Dibayar".
- `CANCELLED`: badge abu "Dibatalkan".

---

## 8. Endpoint Recurring Expense

### 8.1 GET `/api/v1/recurring-expenses`

**Permission:** `RECURRING_EXPENSE_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `search` | string | Cari name/description |
| `isActive` | string | `"true"` atau `"false"` |

### 8.2 GET `/api/v1/recurring-expenses/:id`

**Permission:** `RECURRING_EXPENSE_READ`

### 8.3 POST `/api/v1/recurring-expenses`

**Permission:** `RECURRING_EXPENSE_CREATE`

Request:

```json
{
  "name": "Sewa showroom",
  "kategoriPengeluaranId": "kategori-uuid",
  "defaultAmount": 25000000,
  "description": "Sewa bulanan showroom",
  "isActive": true
}
```

### 8.4 PATCH `/api/v1/recurring-expenses/:id`

**Permission:** `RECURRING_EXPENSE_UPDATE`

### 8.5 DELETE `/api/v1/recurring-expenses/:id`

**Permission:** `RECURRING_EXPENSE_DELETE`

Efek: `isActive = false`.

### 8.6 POST `/api/v1/recurring-expenses/generate`

Generate draft operational expense dari template aktif.

**Permission:** `RECURRING_EXPENSE_CREATE`

Request generate semua template aktif:

```json
{
  "period": "2026-06"
}
```

Request generate sebagian template dan override nominal:

```json
{
  "period": "2026-06",
  "items": [
    {
      "recurringExpenseId": "recurring-expense-uuid",
      "amount": 775000
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "Pengeluaran rutin berhasil digenerate",
  "data": [
    {
      "id": "operational-expense-uuid",
      "type": "BACKDATE",
      "status": "DRAFT",
      "title": "Sewa showroom 2026-06",
      "amount": 25000000,
      "expensePeriodStart": "2026-06-01T00:00:00.000Z",
      "expensePeriodEnd": "2026-06-30T00:00:00.000Z"
    }
  ]
}
```

UI:

- Halaman generate tampilkan checklist template aktif.
- Tampilkan input nominal override per template.
- Setelah generate, arahkan ke list Pengeluaran dengan filter `status=DRAFT`.

---

## 9. Endpoint Payroll - Master Gapok

### 9.1 GET `/api/v1/payroll/base-salaries`

**Permission:** `PAYROLL_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `userId` | string | Filter user |
| `isActive` | string | `"true"` atau `"false"` |

### 9.2 GET `/api/v1/payroll/base-salaries/:id`

**Permission:** `PAYROLL_READ`

### 9.3 POST `/api/v1/payroll/base-salaries`

**Permission:** `PAYROLL_CREATE`

Request:

```json
{
  "userId": "user-uuid",
  "amount": 5000000,
  "effectiveStart": "2026-06-01T00:00:00.000Z",
  "effectiveEnd": null,
  "isActive": true
}
```

Aturan:

- `userId` wajib dan harus aktif.
- `amount` minimal 0.
- `effectiveStart` wajib.
- `effectiveEnd` boleh null.

### 9.4 PATCH `/api/v1/payroll/base-salaries/:id`

**Permission:** `PAYROLL_UPDATE`

### 9.5 DELETE `/api/v1/payroll/base-salaries/:id`

**Permission:** `PAYROLL_DELETE`

Efek: `isActive = false`.

---

## 10. Endpoint Payroll - Insentif Sales

### 10.1 GET `/api/v1/payroll/sales-incentives`

**Permission:** `PAYROLL_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `salesId` | string | Filter sales |
| `leadOrderId` | string | Filter order |
| `period` | string | Format `YYYY-MM` |
| `status` | string | `DRAFT`, `INCLUDED`, `PAID`, `CANCELLED` |

### 10.2 GET `/api/v1/payroll/sales-incentives/:id`

**Permission:** `PAYROLL_READ`

### 10.3 POST `/api/v1/payroll/sales-incentives`

**Permission:** `PAYROLL_CREATE`

Request:

```json
{
  "salesId": "sales-user-uuid",
  "leadOrderId": "lead-order-uuid",
  "amount": 500000,
  "period": "2026-06",
  "description": "Insentif penjualan SO-202606-001"
}
```

Aturan:

- `salesId` wajib dan user harus aktif.
- `leadOrderId` wajib.
- Sales order harus `status = DEAL`.
- `salesId` harus sama dengan sales pada order.
- Satu `leadOrderId` hanya boleh punya satu insentif.

### 10.4 PATCH `/api/v1/payroll/sales-incentives/:id`

**Permission:** `PAYROLL_UPDATE`

Request:

```json
{
  "amount": 750000,
  "period": "2026-06",
  "description": "Update nominal insentif",
  "status": "DRAFT"
}
```

Aturan:

- Hanya bisa update jika status `DRAFT` atau `CANCELLED`.
- Jika sudah `INCLUDED` atau `PAID`, tidak bisa diubah.

### 10.5 DELETE `/api/v1/payroll/sales-incentives/:id`

**Permission:** `PAYROLL_DELETE`

Efek:

- Status berubah menjadi `CANCELLED`.
- Hanya bisa jika masih `DRAFT`.

UI:

- Tombol edit/delete hanya untuk `DRAFT`.
- `INCLUDED`: tampilkan badge kuning "Masuk Payroll".
- `PAID`: tampilkan badge hijau "Dibayar".
- `CANCELLED`: tampilkan badge abu "Dibatalkan".

---

## 11. Endpoint Payroll - Pembayaran Payroll

### 11.1 GET `/api/v1/payroll/runs`

**Permission:** `PAYROLL_READ`

Query:

| Query | Type | Keterangan |
|---|---|---|
| `page` | number | Pagination |
| `limit` | number | Pagination |
| `period` | string | Format `YYYY-MM` |
| `status` | string | `DRAFT`, `PAID`, `CANCELLED` |

### 11.2 GET `/api/v1/payroll/runs/:id`

**Permission:** `PAYROLL_READ`

### 11.3 POST `/api/v1/payroll/runs/generate`

Generate payroll bulanan.

**Permission:** `PAYROLL_CREATE`

Request:

```json
{
  "period": "2026-06"
}
```

Aturan:

- Periode format `YYYY-MM`.
- Satu periode hanya bisa digenerate sekali.
- Backend mengambil gapok aktif dan insentif `DRAFT` pada periode tersebut.
- Jika tidak ada gapok/insentif, backend menolak.
- Insentif yang masuk payroll berubah menjadi `INCLUDED`.

Response:

```json
{
  "success": true,
  "message": "Payroll berhasil digenerate",
  "data": {
    "id": "payroll-run-uuid",
    "period": "2026-06",
    "status": "DRAFT",
    "totalBaseSalary": 10000000,
    "totalIncentive": 1500000,
    "totalAllowance": 0,
    "totalDeduction": 0,
    "totalPaid": 11500000,
    "items": [
      {
        "id": "payroll-item-uuid",
        "userId": "user-uuid",
        "baseSalary": 5000000,
        "incentive": 500000,
        "allowance": 0,
        "deduction": 0,
        "total": 5500000
      }
    ]
  }
}
```

### 11.4 PATCH `/api/v1/payroll/runs/:id/items/:itemId`

Update allowance/deduction item payroll.

**Permission:** `PAYROLL_UPDATE`

Request:

```json
{
  "allowance": 250000,
  "deduction": 100000
}
```

Aturan:

- Hanya bisa jika payroll run masih `DRAFT`.
- Backend menghitung ulang `item.total`.
- Backend menghitung ulang total payroll run.

### 11.5 POST `/api/v1/payroll/runs/:id/pay`

Membayar payroll dan membuat kas keluar.

**Permission:** `PAYROLL_PAY`

Request:

```json
{
  "cashAccountId": "cash-account-uuid",
  "paidDate": "2026-06-30T00:00:00.000Z",
  "description": "Pembayaran payroll Juni 2026"
}
```

Response:

```json
{
  "success": true,
  "message": "Payroll berhasil dibayar",
  "data": {
    "id": "payroll-run-uuid",
    "period": "2026-06",
    "status": "PAID",
    "paidDate": "2026-06-30T00:00:00.000Z",
    "cashAccountId": "cash-account-uuid",
    "cashTransactionId": "cash-transaction-uuid",
    "totalPaid": 11500000
  }
}
```

UI:

- Tombol "Bayar Payroll" hanya aktif untuk `DRAFT`.
- Setelah `PAID`, semua item readonly.
- Tampilkan ringkasan:
  - Total gapok
  - Total insentif
  - Total tunjangan
  - Total potongan
  - Total dibayar

---

## 12. Update Endpoint Existing yang Berhubungan Dengan Cash Flow

### 12.1 POST `/api/v1/units`

Sekarang create unit wajib menyertakan `cashAccountId`.

Request tambahan:

```json
{
  "cashAccountId": "cash-account-uuid"
}
```

Efek:

- Backend membuat unit.
- Backend membuat kas keluar `UNIT_PURCHASE`.
- `purchaseCashTransactionId` tersimpan pada unit.

Error baru:

- `CASH_ACCOUNT_REQUIRED`
- `CASH_ACCOUNT_NOT_FOUND`
- `CASH_ACCOUNT_INACTIVE`

### 12.2 PUT `/api/v1/units/:id`

Jika unit sudah punya `purchaseCashTransactionId`, field berikut tidak boleh diubah:

- `hargaBeli`
- `tanggalPembelian`

Error:

```text
UNIT_PURCHASE_LEDGER_LOCKED
```

UI:

- Pada detail/edit unit, disable field harga beli dan tanggal pembelian jika `purchaseCashTransactionId` tidak null.

### 12.3 POST `/api/v1/lead-orders/:orderId/payments`

Sekarang create payment wajib menyertakan `cashAccountId`.

Request:

```json
{
  "amount": 1000000,
  "paymentDate": "2026-06-30T00:00:00.000Z",
  "description": "Booking fee",
  "jenisPembayaran": "BOOKING_FEE",
  "cashAccountId": "cash-account-uuid"
}
```

Efek:

- Backend membuat `LeadPayment`.
- Backend membuat kas masuk `LEAD_PAYMENT`.
- `cashTransactionId` tersimpan pada payment.

### 12.4 PATCH `/api/v1/lead-orders/:orderId/payments/:id`

Jika payment sudah punya `cashTransactionId`, field berikut tidak boleh diubah:

- `amount`
- `paymentDate`
- `jenisPembayaran`
- `cashAccountId`

Error:

```text
PAYMENT_LEDGER_LOCKED
```

UI:

- Jika `cashTransactionId` ada, hanya izinkan edit `description` dan `buktiUrl`.

### 12.5 POST `/api/v1/rekondisis/:id/pay`

Endpoint baru untuk membayar rekondisi.

Request:

```json
{
  "cashAccountId": "cash-account-uuid",
  "paidDate": "2026-06-30T00:00:00.000Z"
}
```

### 12.6 POST `/api/v1/investors/:investorId/modals`

Sekarang create modal investor wajib menyertakan `cashAccountId`.

Request:

```json
{
  "amount": 100000000,
  "profitSharingType": "percentage",
  "profitSharing": 10,
  "profitSharingDate": null,
  "shareStart": "2026-06",
  "shareEnd": null,
  "cashAccountId": "cash-account-uuid",
  "isActive": true
}
```

Efek:

- Backend membuat modal investor.
- Backend membuat kas masuk `INVESTOR_MODAL`.

Jika modal sudah punya `cashTransactionId`, field `amount` tidak boleh diubah.

Error:

```text
INVESTOR_MODAL_LEDGER_LOCKED
```

---

## 13. Permissions

| Menu/Fitur | Permission |
|---|---|
| Akun Kas list/detail | `CASH_ACCOUNT_READ` |
| Akun Kas create | `CASH_ACCOUNT_CREATE` |
| Akun Kas update | `CASH_ACCOUNT_UPDATE` |
| Akun Kas delete/nonaktif | `CASH_ACCOUNT_DELETE` |
| Buku Kas/Dashboard | `CASH_TRANSACTION_READ` |
| Manual in/out, transfer, adjustment | `CASH_TRANSACTION_CREATE` |
| Pengeluaran Operasional list/detail | `OPERATIONAL_EXPENSE_READ` |
| Pengeluaran Operasional create | `OPERATIONAL_EXPENSE_CREATE` |
| Pengeluaran Operasional update | `OPERATIONAL_EXPENSE_UPDATE` |
| Pengeluaran Operasional cancel | `OPERATIONAL_EXPENSE_DELETE` |
| Pengeluaran Operasional pay | `OPERATIONAL_EXPENSE_PAY` |
| Pengeluaran Rutin list/detail | `RECURRING_EXPENSE_READ` |
| Pengeluaran Rutin create/generate | `RECURRING_EXPENSE_CREATE` |
| Pengeluaran Rutin update | `RECURRING_EXPENSE_UPDATE` |
| Pengeluaran Rutin delete/nonaktif | `RECURRING_EXPENSE_DELETE` |
| Payroll semua list/detail | `PAYROLL_READ` |
| Payroll create/generate | `PAYROLL_CREATE` |
| Payroll update | `PAYROLL_UPDATE` |
| Payroll delete/cancel | `PAYROLL_DELETE` |
| Payroll pay | `PAYROLL_PAY` |

Frontend wajib:

- Sembunyikan menu jika user tidak punya permission read.
- Sembunyikan tombol create/update/delete/pay jika user tidak punya permission action terkait.
- Tetap handle `403` dari backend walaupun tombol sudah disembunyikan.

---

## 14. Error Code dan Cara Tampil di UI

### 14.1 Cash Account / Ledger

| Code | Penyebab | UI Message yang Disarankan |
|---|---|---|
| `CASH_ACCOUNT_REQUIRED` | `cashAccountId` tidak dikirim | Pilih akun kas terlebih dahulu. |
| `CASH_ACCOUNT_NOT_FOUND` | Akun kas tidak ditemukan | Akun kas tidak ditemukan. Refresh data akun kas. |
| `CASH_ACCOUNT_INACTIVE` | Akun kas nonaktif | Akun kas tidak aktif. Pilih akun kas lain. |
| `CODE_ALREADY_EXISTS` | Code akun kas sudah dipakai | Kode sudah digunakan. Gunakan kode lain. |

### 14.2 Operational

| Code | Penyebab | UI Message yang Disarankan |
|---|---|---|
| `KATEGORI_PENGELUARAN_NOT_FOUND` | Kategori tidak ada | Kategori pengeluaran tidak ditemukan. |
| `KATEGORI_PENGELUARAN_INACTIVE` | Kategori nonaktif | Kategori pengeluaran tidak aktif. Pilih kategori lain. |
| `OPERATIONAL_EXPENSE_NOT_FOUND` | Pengeluaran tidak ada | Data pengeluaran tidak ditemukan. |
| `OPERATIONAL_EXPENSE_NOT_EDITABLE` | Pengeluaran sudah dibayar | Pengeluaran sudah dibayar dan tidak bisa diubah. |
| `OPERATIONAL_EXPENSE_ALREADY_PAID` | Sudah dibayar / tidak bisa cancel | Pengeluaran ini sudah dibayar. |
| `OPERATIONAL_EXPENSE_CANCELLED` | Pengeluaran sudah dibatalkan | Pengeluaran ini sudah dibatalkan. |

### 14.3 Recurring Expense

| Code | Penyebab | UI Message yang Disarankan |
|---|---|---|
| `RECURRING_EXPENSE_NOT_FOUND` | Template tidak ditemukan/tidak aktif | Template pengeluaran rutin tidak ditemukan atau tidak aktif. |
| `KATEGORI_PENGELUARAN_NOT_FOUND` | Kategori tidak ada | Kategori pengeluaran tidak ditemukan. |
| `KATEGORI_PENGELUARAN_INACTIVE` | Kategori nonaktif | Kategori pengeluaran tidak aktif. |

### 14.4 Payroll

| Code | Penyebab | UI Message yang Disarankan |
|---|---|---|
| `USER_NOT_FOUND` | User/karyawan tidak ditemukan | User tidak ditemukan. |
| `USER_INACTIVE` | User/karyawan tidak aktif | User tidak aktif. Pilih user lain. |
| `BASE_SALARY_NOT_FOUND` | Master gapok tidak ditemukan | Master gapok tidak ditemukan. |
| `SALES_NOT_FOUND` | Sales tidak ditemukan | Sales tidak ditemukan. |
| `SALES_INACTIVE` | Sales tidak aktif | Sales tidak aktif. |
| `LEAD_ORDER_NOT_FOUND` | Sales order tidak ditemukan | Sales order tidak ditemukan. |
| `LEAD_ORDER_NOT_DEAL` | Order belum DEAL | Insentif hanya bisa dibuat untuk order yang sudah DEAL. |
| `SALES_ORDER_MISMATCH` | Sales tidak sama dengan sales order | Sales tidak sesuai dengan sales order. |
| `SALES_INCENTIVE_NOT_FOUND` | Insentif tidak ditemukan | Insentif sales tidak ditemukan. |
| `SALES_INCENTIVE_NOT_EDITABLE` | Insentif sudah masuk payroll/dibayar | Insentif sudah masuk payroll atau sudah dibayar. |
| `PAYROLL_RUN_NOT_FOUND` | Payroll run tidak ditemukan | Payroll tidak ditemukan. |
| `PAYROLL_RUN_ALREADY_EXISTS` | Periode sudah digenerate | Payroll periode ini sudah pernah digenerate. |
| `PAYROLL_RUN_EMPTY` | Tidak ada gapok/insentif | Tidak ada data gapok atau insentif untuk periode ini. |
| `PAYROLL_RUN_ITEM_NOT_FOUND` | Item payroll tidak ditemukan | Item payroll tidak ditemukan. |
| `PAYROLL_RUN_NOT_EDITABLE` | Payroll sudah dibayar | Payroll sudah dibayar dan tidak bisa diubah. |
| `PAYROLL_RUN_NOT_PAYABLE` | Payroll tidak bisa dibayar | Payroll sudah dibayar atau dibatalkan. |

### 14.5 Integrasi Unit / Payment / Rekondisi / Investor

| Code | Penyebab | UI Message yang Disarankan |
|---|---|---|
| `UNIT_PURCHASE_LEDGER_LOCKED` | Harga/tanggal beli dikunci karena sudah masuk kas | Harga beli dan tanggal pembelian tidak bisa diubah karena sudah tercatat di kas. |
| `PAYMENT_LEDGER_LOCKED` | Payment sudah masuk ledger | Pembayaran sudah tercatat di kas. Nominal, tanggal, jenis, dan akun kas tidak bisa diubah. |
| `REKONDISI_NOT_COMPLETED` | Rekondisi belum selesai | Rekondisi harus selesai sebelum dibayar. |
| `REKONDISI_ALREADY_PAID` | Rekondisi sudah dibayar | Rekondisi ini sudah dibayar. |
| `INVESTOR_MODAL_LEDGER_LOCKED` | Modal investor sudah masuk ledger | Nominal modal tidak bisa diubah karena sudah tercatat di kas. |

---

## 15. Rekomendasi UI Detail

### 15.1 Global Formatting

- Semua nominal tampil sebagai Rupiah.
- Gunakan input numeric/currency yang tidak mengizinkan nilai negatif.
- Tanggal tampil format lokal, misalnya `30 Jun 2026`.
- Simpan tanggal ke API sebagai ISO string.
- Gunakan badge konsisten:
  - `DRAFT`: abu/biru muda.
  - `PAID`: hijau.
  - `CANCELLED`: abu.
  - `INCLUDED`: kuning.

### 15.2 Empty State

Gunakan empty state yang memberi action jelas:

- Akun kas kosong: "Belum ada akun kas. Buat akun kas pertama."
- Ledger kosong: "Belum ada transaksi pada periode ini."
- Payroll kosong: "Belum ada payroll. Generate payroll bulanan."
- Insentif kosong: "Belum ada insentif. Tambahkan dari sales order DEAL."

### 15.3 Loading State

- Table: skeleton row.
- Submit form: disable tombol submit dan tampilkan spinner.
- Pay action: disable semua action lain selama request berjalan.
- Generate payroll/recurring: tampilkan loading karena proses bisa membuat banyak data.

### 15.4 Confirmation Dialog

Wajib konfirmasi untuk action berikut:

- Delete/nonaktif akun kas.
- Cancel pengeluaran.
- Pay pengeluaran.
- Generate recurring expense.
- Generate payroll.
- Pay payroll.
- Transfer antar kas.
- Manual adjustment.

Contoh copy:

```text
Bayar payroll periode Juni 2026?
Kas keluar sebesar Rp 11.500.000 akan dicatat ke akun Kas Utama.
Action ini tidak bisa diedit setelah dibayar.
```

### 15.5 Form UX Operational Expense

Field:

- Tipe: segmented control `Normal` / `Backdate`.
- Judul.
- Kategori pengeluaran.
- Nominal.
- Tanggal pengeluaran.
- Periode tagihan, hanya tampil untuk backdate.
- Jatuh tempo, hanya tampil untuk backdate.
- Keterangan.

Action:

- Simpan Draft.
- Bayar dari detail/list.

### 15.6 Form UX Payroll

Master Gapok:

- User dropdown.
- Nominal gapok.
- Berlaku mulai.
- Berlaku sampai.
- Aktif/nonaktif.

Insentif Sales:

- Sales dropdown.
- Sales order dropdown hanya tampilkan order `DEAL`.
- Nominal insentif.
- Periode.
- Keterangan.

Generate Payroll:

- Pilih periode.
- Tampilkan preview setelah generate:
  - Nama user.
  - Gapok.
  - Insentif.
  - Allowance editable.
  - Deduction editable.
  - Total.

### 15.7 Cash Flow Dashboard UX

Filter:

- Date range.
- Akun kas opsional untuk future enhancement.

Cards:

- Saldo awal.
- Kas masuk.
- Kas keluar.
- Saldo akhir.

Table:

- Per akun kas: opening, masuk, keluar, ending.

CTA:

- Manual Kas Masuk.
- Manual Kas Keluar.
- Transfer Antar Kas.
- Penyesuaian Saldo.

---

## 16. Checklist Frontend

### Wajib Sebelum Implement UI

- Ambil `permissionCodes` dari `/auth/me` atau login response.
- Buat helper `hasPermission(code)`.
- Buat helper `formatRupiah`.
- Buat helper `formatDate`.
- Buat helper error resolver yang membaca `message`, `error.code`, dan `error.details`.
- Buat reusable component:
  - Data table dengan pagination.
  - Status badge.
  - Cash account dropdown.
  - Currency input.
  - Date input.
  - Confirm dialog.

### Wajib Pada Setiap Form

- Disable submit saat loading.
- Tampilkan error field jika validasi frontend gagal.
- Tampilkan toast/dialog error backend jika request gagal.
- Refresh detail/list setelah create/update/pay/generate berhasil.
- Jangan hardcode nominal dari UI jika backend sudah mengembalikan hasil hitung.

### Wajib Pada Data Finansial

- Jangan izinkan nilai negatif.
- Jangan submit tanpa akun kas untuk transaksi yang menghasilkan ledger.
- Jangan izinkan edit field finansial yang sudah terkunci oleh ledger.
- Selalu tampilkan `cashTransactionId` atau indikator "Sudah tercatat di kas" jika ada.

---

## 17. Catatan Implementasi Saat Ini

- Transfer antar kas dibuat sebagai dua row ledger: satu `OUT`, satu `IN`.
- Dashboard cash flow menghitung saldo akhir dari `openingBalance + totalIn - totalOut`.
- Payment `LEASING` masih diterima sebagai input legacy, tetapi dinormalisasi ke `PENCAIRAN_LEASING`.
- Cash account default `KAS_UTAMA` dibuat lewat seed.
- Pengeluaran rutin generate akan membuat operational expense bertipe `BACKDATE`.
- Rekondisi baru masuk kas hanya saat endpoint `/rekondisis/:id/pay` dipanggil.
- Payroll baru masuk kas hanya saat endpoint `/payroll/runs/:id/pay` dipanggil.


