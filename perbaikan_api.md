# Perbaikan API Lookup Finance

Tujuan: semua kebutuhan lookup/dropdown untuk modul Operational, Payroll, dan Cash Flow disediakan dari satu module API finance, sehingga frontend tidak perlu mengambil route API dari module lain.

Base path yang disarankan:

```text
/api/v1/finance/lookups
```

## 1. Cash Accounts

`GET /api/v1/finance/lookups/cash-accounts`

Fungsi:
- Dropdown akun kas di semua form transaksi kas.
- Dipakai untuk bayar pengeluaran, kas masuk, kas keluar, transfer antar kas, adjustment, payroll pay, input pembelian unit, dan modal investor.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari `name` atau `code`. |
| `type` | string | `CASH`, `BANK`, `OTHER`. |
| `isActive` | boolean string | Default disarankan `true`. |

Response item:

```json
{
  "id": "cash-account-uuid",
  "name": "Kas Utama",
  "code": "KAS_UTAMA",
  "type": "CASH",
  "isActive": true
}
```

## 2. Expense Categories

`GET /api/v1/finance/lookups/expense-categories`

Fungsi:
- Dropdown kategori di Operational Expense.
- Dropdown kategori di Recurring Expense.
- Menggantikan kebutuhan frontend untuk call `/kategori-pengeluarans`.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari `name` atau `code`. |
| `isActive` | boolean string | Default disarankan `true`. |

Response item:

```json
{
  "id": "kategori-uuid",
  "name": "Listrik",
  "code": "LISTRIK",
  "isActive": true
}
```

## 3. Payroll Users

`GET /api/v1/finance/lookups/payroll-users`

Fungsi:
- Dropdown user/karyawan di Master Gapok.
- Menghindari input manual `userId`.
- Menghindari frontend call module user/access-control.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari `name` atau `username`. |
| `isActive` | boolean string | Default disarankan `true`. |
| `role` | string | Opsional, jika ingin filter role karyawan/sales/admin. |

Response item:

```json
{
  "id": "user-uuid",
  "name": "Budi Sales",
  "username": "budi",
  "roleName": "Sales",
  "isActive": true
}
```

## 4. Sales

`GET /api/v1/finance/lookups/sales`

Fungsi:
- Dropdown sales di form Insentif Sales.
- Menghindari input manual `salesId`.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari `name` atau `username`. |
| `isActive` | boolean string | Default disarankan `true`. |

Response item:

```json
{
  "id": "sales-user-uuid",
  "name": "Budi Sales",
  "username": "budi",
  "isActive": true
}
```

## 5. Deal Orders

`GET /api/v1/finance/lookups/deal-orders`

Fungsi:
- Dropdown sales order di form Insentif Sales.
- Hanya menampilkan order dengan status `DEAL`.
- Frontend tidak perlu call module penjualan/lead-order langsung.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari nomor order atau customer. |
| `salesId` | string | Filter order milik sales tertentu. |
| `period` | string | Format `YYYY-MM`, opsional untuk bantu filter periode insentif. |
| `withoutIncentive` | boolean string | Jika `true`, hanya tampilkan order yang belum punya insentif. |

Response item:

```json
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
```

## 6. Recurring Expenses

`GET /api/v1/finance/lookups/recurring-expenses`

Fungsi:
- Checklist template aktif saat generate pengeluaran rutin.
- Alternatif ringan dari endpoint utama `/recurring-expenses`.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari nama template. |
| `isActive` | boolean string | Default disarankan `true`. |

Response item:

```json
{
  "id": "recurring-expense-uuid",
  "name": "Sewa showroom",
  "kategoriPengeluaranId": "kategori-uuid",
  "kategoriName": "Sewa",
  "defaultAmount": 25000000,
  "isActive": true
}
```

## 7. Payroll Runs

`GET /api/v1/finance/lookups/payroll-runs`

Fungsi:
- Lookup/filter payroll run per periode/status untuk reporting atau relasi future enhancement.
- Opsional untuk implementasi awal, tetapi berguna jika modul laporan finance memakai payroll.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `period` | string | Format `YYYY-MM`. |
| `status` | string | `DRAFT`, `PAID`, `CANCELLED`. |

Response item:

```json
{
  "id": "payroll-run-uuid",
  "period": "2026-06",
  "status": "DRAFT",
  "totalPaid": 11500000
}
```

## 8. Units

`GET /api/v1/finance/lookups/units`

Fungsi:
- Lookup unit untuk kebutuhan finance tanpa call `/units`.
- Berguna untuk filter/report ledger source `UNIT_PURCHASE`.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari plat nomor, merek, atau tipe. |
| `statusUnit` | string | `INVENTORY`, `READY_STOCK`, `HOLD`, `SOLD`. |

Response item:

```json
{
  "id": "unit-uuid",
  "platNomor": "B 1234 ABC",
  "merekName": "Toyota",
  "tipeName": "Avanza",
  "hargaBeli": 100000000,
  "tanggalPembelian": "2026-06-30T00:00:00.000Z",
  "purchaseCashTransactionId": "cash-transaction-uuid"
}
```

## 9. Rekondisis Payable

`GET /api/v1/finance/lookups/rekondisis-payable`

Fungsi:
- Lookup rekondisi yang sudah selesai tetapi belum dibayar.
- Mendukung flow pembayaran rekondisi tanpa frontend call module rekondisi langsung.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari plat nomor atau nama unit. |
| `unitId` | string | Filter per unit. |

Response item:

```json
{
  "id": "rekondisi-uuid",
  "unitId": "unit-uuid",
  "platNomor": "B 1234 ABC",
  "unitName": "Toyota Avanza",
  "totalCost": 5000000,
  "status": "COMPLETED",
  "paidAt": null
}
```

## 10. Investors

`GET /api/v1/finance/lookups/investors`

Fungsi:
- Lookup investor untuk kebutuhan modal investor dari sisi finance.
- Menghindari frontend call `/investors` jika flow modal investor dipusatkan di finance.

Query:

| Query | Type | Keterangan |
|---|---|---|
| `search` | string | Cari nama atau kode investor. |
| `isActive` | boolean string | Default disarankan `true`. |

Response item:

```json
{
  "id": "investor-uuid",
  "name": "Investor A",
  "code": "INV_A",
  "isActive": true
}
```

## Prioritas Minimal

Endpoint lookup yang paling wajib untuk implementasi frontend saat ini:

1. `GET /api/v1/finance/lookups/cash-accounts`
2. `GET /api/v1/finance/lookups/expense-categories`
3. `GET /api/v1/finance/lookups/payroll-users`
4. `GET /api/v1/finance/lookups/sales`
5. `GET /api/v1/finance/lookups/deal-orders`
6. `GET /api/v1/finance/lookups/recurring-expenses`

Dengan 6 endpoint ini, modul Operational, Payroll, dan Cash Flow bisa menggunakan lookup dari satu module API finance.
