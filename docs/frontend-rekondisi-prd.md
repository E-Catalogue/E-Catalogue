# PRD Frontend - Modul Rekondisi

Dokumen ini menjelaskan API, lookup, alur, request, dan response yang perlu dipakai frontend untuk modul rekondisi.

Base URL: `/api/v1`

Semua endpoint membutuhkan autentikasi.

```http
Authorization: Bearer <access_token>
```

Response sukses umum:

```json
{
  "success": true,
  "message": "Request berhasil",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

`meta` hanya muncul pada endpoint list.

Response error umum:

```json
{
  "success": false,
  "message": "Pesan error",
  "error": {
    "code": "ERROR_CODE",
    "details": null
  }
}
```

## Tujuan Fitur

Frontend dapat mengelola rekondisi unit dari awal sampai selesai:

1. Membuat rekondisi dari unit.
2. Mengisi vendor dan keterangan rekondisi.
3. Menambahkan rincian pekerjaan/biaya rekondisi.
4. Memproses rekondisi dari `PENDING` ke `IN_PROGRESS`.
5. Menyelesaikan rekondisi menjadi `COMPLETED`.
6. Membayar rekondisi yang sudah selesai.

## Status Rekondisi

Field status rekondisi:

```text
PENDING
IN_PROGRESS
COMPLETED
```

Alur status:

```text
PENDING -> IN_PROGRESS -> COMPLETED
```

Pembayaran bukan status baru. Rekondisi dianggap sudah dibayar jika `paidAt` dan `cashTransactionId` sudah terisi.

## Permission

Permission yang dipakai:

| Kebutuhan | Permission |
| --- | --- |
| List/detail rekondisi | `REKONDISI_READ` |
| Buat rekondisi dari unit | `REKONDISI_CREATE` |
| Tambah detail rekondisi | `REKONDISI_CREATE` |
| Update rekondisi/detail/progress/done | `REKONDISI_UPDATE` |
| Hapus detail rekondisi | `REKONDISI_DELETE` |
| Bayar rekondisi | `REKONDISI_PAY` |
| Cek unfinished rekondisi dari unit | `UNIT_UPDATE` |
| Lookup finance | `CASH_TRANSACTION_READ` |

## Lookup yang Dipakai Frontend

### 1. Lookup Unit

Dipakai saat halaman rekondisi butuh filter/pilih unit.

```http
GET /api/v1/finance/lookups/units?search=B123&statusUnit=INVENTORY
```

Permission: `CASH_TRANSACTION_READ`

Query:

| Query | Wajib | Keterangan |
| --- | --- | --- |
| `search` | Tidak | Cari plat nomor, merek, atau tipe |
| `statusUnit` | Tidak | Filter status unit |

Response:

```json
{
  "success": true,
  "message": "Lookup unit berhasil diambil",
  "data": [
    {
      "id": "unit-id-1",
      "platNomor": "B 1234 ABC",
      "merekName": "Toyota",
      "tipeName": "Avanza",
      "hargaBeli": 150000000,
      "tanggalPembelian": "2026-07-02T00:00:00.000Z",
      "purchaseCashTransactionId": "cash-transaction-id-1"
    }
  ]
}
```

### 2. Lookup Vendor

Dipakai untuk mengisi `vendorId` pada rekondisi.

```http
GET /api/v1/vendors?page=1&limit=20&search=bengkel&isActive=true
```

Permission: `VENDOR_READ`

Response:

```json
{
  "success": true,
  "message": "Daftar vendor berhasil diambil",
  "data": [
    {
      "id": "vendor-id-1",
      "name": "Bengkel ABC",
      "code": "BENGKEL_ABC",
      "isActive": true,
      "createdAt": "2026-07-02T10:00:00.000Z",
      "updatedAt": "2026-07-02T10:00:00.000Z"
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

### 3. Lookup Pengecekan

Dipakai untuk memilih kategori item detail rekondisi.

```http
GET /api/v1/pengecekans?page=1&limit=20&search=rem
```

Permission: `PENGECEKAN_READ`

Response:

```json
{
  "success": true,
  "message": "Daftar pengecekan berhasil diambil",
  "data": [
    {
      "id": "pengecekan-id-1",
      "name": "Rem",
      "code": "REM",
      "createdAt": "2026-07-02T10:00:00.000Z",
      "updatedAt": "2026-07-02T10:00:00.000Z"
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

### 4. Lookup Cash Account

Dipakai saat bayar rekondisi.

```http
GET /api/v1/finance/lookups/cash-accounts?search=kas&type=CASH&isActive=true
```

Permission: `CASH_TRANSACTION_READ`

Response:

```json
{
  "success": true,
  "message": "Lookup akun kas berhasil diambil",
  "data": [
    {
      "id": "cash-account-id-1",
      "name": "Kas Utama",
      "code": "KAS_UTAMA",
      "type": "CASH",
      "isActive": true
    }
  ]
}
```

### 5. Lookup Rekondisi Payable

Dipakai di flow pembayaran untuk memilih rekondisi yang sudah `COMPLETED` dan belum dibayar.

```http
GET /api/v1/finance/lookups/rekondisis-payable?search=B123&unitId=unit-id-1
```

Permission: `CASH_TRANSACTION_READ`

Response:

```json
{
  "success": true,
  "message": "Lookup rekondisi payable berhasil diambil",
  "data": [
    {
      "id": "rekondisi-id-1",
      "unitId": "unit-id-1",
      "platNomor": "B 1234 ABC",
      "unitName": "Toyota Avanza",
      "totalCost": 1375000,
      "status": "COMPLETED",
      "paidAt": null
    }
  ]
}
```

## Alur Utama Rekondisi dari Unit

Alur yang direkomendasikan:

```text
User pilih unit
-> cek unfinished rekondisi
-> create rekondisi
-> update vendor/keterangan
-> tambah detail biaya
-> progress ke IN_PROGRESS
-> done ke COMPLETED
-> pay jika perlu
-> ubah status unit ke READY_STOCK jika unit siap dijual
```

Catatan:

- Rekondisi dibuat dari endpoint unit, bukan langsung dari `POST /rekondisis`.
- Backend saat ini tidak memiliki endpoint create rekondisi langsung di route `rekondisis`.
- Detail biaya tidak otomatis mengubah `nominal` dan `total` saat dibuat. Nilai final dihitung saat endpoint `done`.

## API Rekondisi

### 1. Cek Unfinished Rekondisi Unit

Dipakai sebelum membuat rekondisi baru.

```http
GET /api/v1/units/:id/rekondisi-status-check
```

Permission: `UNIT_UPDATE`

Response:

```json
{
  "success": true,
  "message": "Status rekondisi berhasil dicek",
  "data": {
    "hasUnfinishedRekondisi": false
  }
}
```

Behavior:

- `true` jika unit punya rekondisi status `PENDING` atau `IN_PROGRESS`.
- Frontend sebaiknya tidak membuat rekondisi baru jika hasilnya `true`.

### 2. Buat Rekondisi Baru dari Unit

```http
POST /api/v1/units/:id/rekondisi
```

Permission: `REKONDISI_CREATE`

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Rekondisi unit berhasil dibuat",
  "data": {
    "id": "rekondisi-id-1",
    "status": "PENDING",
    "unitId": "unit-id-1",
    "tanggal": "2026-07-02T00:00:00.000Z",
    "seq": 1,
    "vendorId": null,
    "keterangan": null,
    "nominal": 0,
    "tax": null,
    "adminFee": null,
    "additionalFee": null,
    "total": 0,
    "invoiceUrl": null,
    "paidAt": null,
    "cashAccountId": null,
    "cashTransactionId": null,
    "createdAt": "2026-07-02T10:00:00.000Z",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

Backend behavior:

- `tanggal` otomatis tanggal saat ini.
- `seq` otomatis dari rekondisi terakhir unit tersebut + 1.
- `nominal` dan `total` awal `0`.
- `status` default `PENDING`.

### 3. List Rekondisi

```http
GET /api/v1/rekondisis?page=1&limit=20&unitId=unit-id-1&status=PENDING
```

Permission: `REKONDISI_READ`

Query:

| Query | Wajib | Keterangan |
| --- | --- | --- |
| `page` | Tidak | Default `1` |
| `limit` | Tidak | Default `20`, maksimal `100` |
| `unitId` | Tidak | Filter berdasarkan unit |
| `status` | Tidak | `PENDING`, `IN_PROGRESS`, atau `COMPLETED` |

Response:

```json
{
  "success": true,
  "message": "Daftar rekondisi berhasil diambil",
  "data": [
    {
      "id": "rekondisi-id-1",
      "status": "PENDING",
      "unitId": "unit-id-1",
      "tanggal": "2026-07-02T00:00:00.000Z",
      "seq": 1,
      "vendorId": "vendor-id-1",
      "keterangan": "Perbaikan bumper",
      "nominal": 0,
      "tax": null,
      "adminFee": null,
      "additionalFee": null,
      "total": 0,
      "invoiceUrl": null,
      "paidAt": null,
      "cashAccountId": null,
      "cashTransactionId": null,
      "vendor": {
        "id": "vendor-id-1",
        "name": "Bengkel ABC"
      },
      "unit": {
        "id": "unit-id-1",
        "platNomor": "B 1234 ABC"
      }
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

### 4. Detail Rekondisi

```http
GET /api/v1/rekondisis/:id
```

Permission: `REKONDISI_READ`

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diambil",
  "data": {
    "id": "rekondisi-id-1",
    "status": "COMPLETED",
    "unitId": "unit-id-1",
    "tanggal": "2026-07-02T00:00:00.000Z",
    "seq": 1,
    "vendorId": "vendor-id-1",
    "keterangan": "Perbaikan bumper",
    "nominal": 1200000,
    "tax": 100000,
    "adminFee": 50000,
    "additionalFee": 25000,
    "total": 1375000,
    "invoiceUrl": "/public/rekondisi/invoice-file.pdf",
    "paidAt": null,
    "cashAccountId": null,
    "cashTransactionId": null,
    "vendor": {
      "id": "vendor-id-1",
      "name": "Bengkel ABC"
    },
    "unit": {
      "id": "unit-id-1",
      "platNomor": "B 1234 ABC"
    },
    "rekondisiDetails": [
      {
        "id": "rekondisi-detail-id-1",
        "rekondisiId": "rekondisi-id-1",
        "pengecekanId": "pengecekan-id-1",
        "description": "Ganti kampas rem depan",
        "nominal": 750000,
        "invoiceUrl": null,
        "pengecekan": {
          "id": "pengecekan-id-1",
          "name": "Rem",
          "code": "REM"
        }
      }
    ]
  }
}
```

Error jika tidak ditemukan:

```json
{
  "success": false,
  "message": "Rekondisi tidak ditemukan",
  "error": {
    "code": "REKONDISI_NOT_FOUND",
    "details": null
  }
}
```

### 5. Update Metadata Rekondisi

Dipakai untuk mengubah vendor dan keterangan.

```http
PUT /api/v1/rekondisis/:id
```

Permission: `REKONDISI_UPDATE`

Request:

```json
{
  "vendorId": "vendor-id-1",
  "keterangan": "Perbaikan bumper dan interior"
}
```

Rules:

- `vendorId` optional, boleh `null` atau string kosong.
- `keterangan` optional, boleh `null` atau string kosong.
- Minimal satu field harus dikirim.

Response:

```json
{
  "success": true,
  "message": "Rekondisi berhasil diperbarui",
  "data": {
    "id": "rekondisi-id-1",
    "status": "PENDING",
    "unitId": "unit-id-1",
    "vendorId": "vendor-id-1",
    "keterangan": "Perbaikan bumper dan interior",
    "nominal": 0,
    "total": 0,
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### 6. Mulai Proses Rekondisi

Mengubah status dari `PENDING` ke `IN_PROGRESS`.

```http
PATCH /api/v1/rekondisis/:id/progress
```

Permission: `REKONDISI_UPDATE`

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Status rekondisi menjadi IN_PROGRESS",
  "data": {
    "id": "rekondisi-id-1",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

Error jika status bukan `PENDING`:

```json
{
  "success": false,
  "message": "Rekondisi hanya dapat diproses dari status PENDING",
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "details": null
  }
}
```

### 7. Selesaikan Rekondisi

Mengubah status dari `IN_PROGRESS` ke `COMPLETED`.

```http
POST /api/v1/rekondisis/:id/done
Content-Type: multipart/form-data
```

Permission: `REKONDISI_UPDATE`

Request form-data:

```text
invoice: <file optional>
tax: 100000
adminFee: 50000
additionalFee: 25000
```

Rules:

- `invoice` optional.
- `tax` optional number, minimal `0`.
- `adminFee` optional number, minimal `0`.
- `additionalFee` optional number, minimal `0`.
- Jika field biaya tidak dikirim, backend menganggap nilainya `0`.
- Backend menghitung `nominal` dari total semua `rekondisiDetails.nominal`.
- Backend menghitung `total = nominal + tax + adminFee + additionalFee`.

Response:

```json
{
  "success": true,
  "message": "Rekondisi berhasil diselesaikan",
  "data": {
    "id": "rekondisi-id-1",
    "status": "COMPLETED",
    "nominal": 1200000,
    "tax": 100000,
    "adminFee": 50000,
    "additionalFee": 25000,
    "total": 1375000,
    "invoiceUrl": "/public/rekondisi/invoice-file.pdf",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

Error jika status bukan `IN_PROGRESS`:

```json
{
  "success": false,
  "message": "Rekondisi harus IN_PROGRESS untuk dapat diselesaikan",
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "details": null
  }
}
```

### 8. Bayar Rekondisi

Mencatat pembayaran rekondisi ke kas dan membuat transaksi ledger.

```http
POST /api/v1/rekondisis/:id/pay
```

Permission: `REKONDISI_PAY`

Request:

```json
{
  "cashAccountId": "cash-account-id-1",
  "paidDate": "2026-07-02"
}
```

Rules:

- Rekondisi harus status `COMPLETED`.
- Rekondisi belum boleh punya `paidAt` atau `cashTransactionId`.
- Amount transaksi kas memakai `rekondisi.total`.
- Tipe transaksi kas yang dibuat: `OUT`.
- Source transaksi kas: `REKONDISI`.

Response:

```json
{
  "success": true,
  "message": "Rekondisi berhasil dibayar",
  "data": {
    "id": "rekondisi-id-1",
    "status": "COMPLETED",
    "total": 1375000,
    "paidAt": "2026-07-02T00:00:00.000Z",
    "cashAccountId": "cash-account-id-1",
    "cashTransactionId": "cash-transaction-id-1",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

Error jika belum completed:

```json
{
  "success": false,
  "message": "Rekondisi harus COMPLETED sebelum dibayar",
  "error": {
    "code": "REKONDISI_NOT_COMPLETED",
    "details": null
  }
}
```

Error jika sudah dibayar:

```json
{
  "success": false,
  "message": "Rekondisi sudah dibayar",
  "error": {
    "code": "REKONDISI_ALREADY_PAID",
    "details": null
  }
}
```

## API Detail Rekondisi

### 1. List Detail Rekondisi

```http
GET /api/v1/rekondisis/:rekondisiId/detail?page=1&limit=20
```

Permission: `REKONDISI_READ`

Response:

```json
{
  "success": true,
  "message": "Daftar detail rekondisi berhasil diambil",
  "data": [
    {
      "id": "rekondisi-detail-id-1",
      "rekondisiId": "rekondisi-id-1",
      "pengecekanId": "pengecekan-id-1",
      "description": "Ganti kampas rem depan",
      "nominal": 750000,
      "invoiceUrl": null,
      "createdAt": "2026-07-02T10:00:00.000Z",
      "updatedAt": "2026-07-02T10:00:00.000Z",
      "pengecekan": {
        "id": "pengecekan-id-1",
        "name": "Rem",
        "code": "REM"
      }
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

### 2. Detail Item Rekondisi

```http
GET /api/v1/rekondisis/:rekondisiId/detail/:id
```

Permission: `REKONDISI_READ`

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diambil",
  "data": {
    "id": "rekondisi-detail-id-1",
    "rekondisiId": "rekondisi-id-1",
    "pengecekanId": "pengecekan-id-1",
    "description": "Ganti kampas rem depan",
    "nominal": 750000,
    "invoiceUrl": null,
    "pengecekan": {
      "id": "pengecekan-id-1",
      "name": "Rem",
      "code": "REM"
    }
  }
}
```

### 3. Tambah Detail Rekondisi

```http
POST /api/v1/rekondisis/:rekondisiId/detail
```

Permission: `REKONDISI_CREATE`

Request:

```json
{
  "pengecekanId": "pengecekan-id-1",
  "description": "Ganti kampas rem depan",
  "nominal": 750000
}
```

Rules:

- `pengecekanId` required string.
- `description` optional, boleh `null` atau string kosong.
- `nominal` required number, minimal `0`.

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil ditambahkan",
  "data": {
    "id": "rekondisi-detail-id-1",
    "rekondisiId": "rekondisi-id-1",
    "pengecekanId": "pengecekan-id-1",
    "description": "Ganti kampas rem depan",
    "nominal": 750000,
    "invoiceUrl": null,
    "createdAt": "2026-07-02T10:00:00.000Z",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### 4. Update Detail Rekondisi

```http
PUT /api/v1/rekondisis/:rekondisiId/detail/:id
```

Permission: `REKONDISI_UPDATE`

Request:

```json
{
  "pengecekanId": "pengecekan-id-2",
  "description": "Ganti kampas rem depan dan belakang",
  "nominal": 1200000
}
```

Rules:

- Semua field optional.
- Minimal satu field harus dikirim.
- `nominal` minimal `0`.

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diperbarui",
  "data": {
    "id": "rekondisi-detail-id-1",
    "rekondisiId": "rekondisi-id-1",
    "pengecekanId": "pengecekan-id-2",
    "description": "Ganti kampas rem depan dan belakang",
    "nominal": 1200000,
    "invoiceUrl": null,
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### 5. Hapus Detail Rekondisi

```http
DELETE /api/v1/rekondisis/:rekondisiId/detail/:id
```

Permission: `REKONDISI_DELETE`

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil dihapus",
  "data": {
    "id": "rekondisi-detail-id-1",
    "rekondisiId": "rekondisi-id-1",
    "pengecekanId": "pengecekan-id-1",
    "description": "Ganti kampas rem depan",
    "nominal": 750000,
    "invoiceUrl": null
  }
}
```

## Alur Layar Frontend

### A. Halaman List Rekondisi

Data utama:

- `GET /api/v1/rekondisis`
- Filter unit memakai `GET /api/v1/finance/lookups/units`
- Filter status memakai enum lokal: `PENDING`, `IN_PROGRESS`, `COMPLETED`

Kolom yang disarankan:

- Unit: `unit.platNomor`
- Vendor: `vendor.name`
- Status
- Tanggal
- Seq
- Nominal
- Total
- Paid status: `paidAt ? "Sudah dibayar" : "Belum dibayar"`
- Aksi: detail, edit, progress, done, pay

### B. Flow Tambah Rekondisi dari Unit

1. User pilih unit.
2. Frontend panggil `GET /api/v1/units/:id/rekondisi-status-check`.
3. Jika `hasUnfinishedRekondisi = true`, tampilkan info bahwa masih ada rekondisi berjalan.
4. Jika `false`, panggil `POST /api/v1/units/:id/rekondisi`.
5. Arahkan user ke halaman detail rekondisi berdasarkan `data.id`.

### C. Flow Edit Rekondisi

1. Frontend panggil `GET /api/v1/rekondisis/:id`.
2. Load vendor dari `GET /api/v1/vendors`.
3. User edit `vendorId` dan `keterangan`.
4. Submit `PUT /api/v1/rekondisis/:id`.
5. Refetch detail.

### D. Flow Detail Biaya

1. Load detail dari `GET /api/v1/rekondisis/:id`.
2. Load pilihan pengecekan dari `GET /api/v1/pengecekans`.
3. Tambah item dengan `POST /api/v1/rekondisis/:rekondisiId/detail`.
4. Edit item dengan `PUT /api/v1/rekondisis/:rekondisiId/detail/:id`.
5. Hapus item dengan `DELETE /api/v1/rekondisis/:rekondisiId/detail/:id`.
6. Tampilkan subtotal sementara di frontend dari jumlah `nominal` detail.

Catatan penting:

- Backend baru menghitung `rekondisi.nominal` dan `rekondisi.total` saat endpoint `done`.
- Jadi sebelum `done`, total resmi pada header rekondisi bisa tetap `0`.

### E. Flow Progress

1. Tombol `Mulai Proses` hanya aktif jika status `PENDING`.
2. Submit `PATCH /api/v1/rekondisis/:id/progress`.
3. Setelah sukses, status menjadi `IN_PROGRESS`.

### F. Flow Done

1. Tombol `Selesaikan` hanya aktif jika status `IN_PROGRESS`.
2. Frontend tampilkan form:
   - Invoice file optional.
   - Tax.
   - Admin fee.
   - Additional fee.
3. Submit `POST /api/v1/rekondisis/:id/done` sebagai `multipart/form-data`.
4. Setelah sukses, status menjadi `COMPLETED`.
5. Frontend tampilkan `nominal`, `tax`, `adminFee`, `additionalFee`, dan `total` dari response/refetch.

### G. Flow Pay

1. Tombol `Bayar` hanya aktif jika:
   - status `COMPLETED`
   - `paidAt` kosong
   - `cashTransactionId` kosong
2. Load cash account dari `GET /api/v1/finance/lookups/cash-accounts`.
3. User pilih `cashAccountId` dan `paidDate`.
4. Submit `POST /api/v1/rekondisis/:id/pay`.
5. Setelah sukses, tampilkan status paid dan `cashTransactionId`.

## Validasi Frontend

Frontend perlu melakukan validasi:

- `vendorId` boleh kosong.
- `keterangan` boleh kosong.
- Detail rekondisi wajib punya `pengecekanId`.
- Detail rekondisi wajib punya `nominal >= 0`.
- Tombol progress hanya untuk status `PENDING`.
- Tombol done hanya untuk status `IN_PROGRESS`.
- Tombol pay hanya untuk status `COMPLETED` dan belum paid.
- Biaya `tax`, `adminFee`, `additionalFee` minimal `0`.
- `paidDate` wajib ISO date.
- `cashAccountId` wajib saat pay.

## Acceptance Criteria

1. Frontend dapat menampilkan list rekondisi dengan filter status dan unit.
2. Frontend dapat membuka detail rekondisi beserta detail item pekerjaan.
3. Frontend dapat membuat rekondisi dari unit setelah cek unfinished rekondisi.
4. Frontend dapat mengubah vendor dan keterangan rekondisi.
5. Frontend dapat menambah, mengubah, dan menghapus detail biaya rekondisi.
6. Frontend dapat mengubah status dari `PENDING` ke `IN_PROGRESS`.
7. Frontend dapat menyelesaikan rekondisi `IN_PROGRESS` menjadi `COMPLETED`.
8. Frontend dapat upload invoice pada saat done.
9. Frontend menampilkan total final dari backend setelah done.
10. Frontend dapat membayar rekondisi yang `COMPLETED` dan belum paid.
11. Frontend menampilkan error transisi status dari backend dengan jelas.
12. Frontend tidak menampilkan aksi yang tidak valid untuk status saat ini.

## Catatan Teknis

- URL file invoice dari backend berbentuk relatif, contoh `/public/rekondisi/invoice-file.pdf`.
- Untuk menampilkan file, gabungkan dengan base URL backend.
- Endpoint done memakai field upload bernama `invoice`.
- Detail rekondisi punya field `invoiceUrl` di database, tetapi route detail saat ini belum menyediakan upload invoice per-detail.
- Endpoint delete rekondisi utama belum tersedia. Yang tersedia hanya delete detail rekondisi.
- Endpoint create rekondisi utama berada di module unit: `POST /api/v1/units/:id/rekondisi`.
