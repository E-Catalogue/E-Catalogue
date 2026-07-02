# PRD Frontend - Unit Actions

Dokumen ini menjelaskan kebutuhan frontend untuk tiga aksi di modul Unit:

1. Update dokumen dan perlengkapan pada aksi edit unit.
2. Merubah status unit.
3. Menambahkan data rekondisi unit.

Base URL endpoint backend: `/api/v1`

Semua endpoint pada dokumen ini membutuhkan autentikasi bearer token.

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Untuk upload invoice rekondisi, gunakan `multipart/form-data`.

## Response Umum

Semua response sukses memakai format:

```json
{
  "success": true,
  "message": "Request berhasil",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Field `meta` hanya muncul pada endpoint list.

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

## 1. Update Dokumen dan Perlengkapan di Edit Unit

### Tujuan

Frontend dapat menampilkan checklist master perlengkapan dan dokumen pada form edit unit, lalu menyimpan perubahan relasi pilihan user ke unit.

Catatan naming:

- Label bisnis/UI: `Perlengkapan`.
- Field payload backend: `kelengkapans`.
- Label bisnis/UI: `Dokumen`.
- Field payload backend: `dokumens`.
- Dokumen di modul ini adalah master checklist dokumen, bukan upload file dokumen.

### Permission

- Baca master dan detail unit: `UNIT_READ`
- Update unit: `UNIT_UPDATE`

### Alur UI

1. User klik aksi edit pada salah satu unit.
2. Frontend ambil detail unit.
3. Frontend ambil master perlengkapan dan master dokumen.
4. Frontend preselect checkbox berdasarkan relasi pada detail unit.
5. User ubah pilihan perlengkapan/dokumen.
6. Frontend submit `PUT /api/v1/units/:id`.
7. Setelah berhasil, frontend sebaiknya refetch `GET /api/v1/units/:id` agar mendapatkan nama master relasi terbaru.

### Endpoint Master Perlengkapan

```http
GET /api/v1/units/kelengkapan
```

Response:

```json
{
  "success": true,
  "message": "Master kelengkapan berhasil diambil",
  "data": [
    {
      "id": "perlengkapan-id-1",
      "name": "Kunci Serep",
      "code": "KUNCI_SEREP",
      "isActive": true,
      "createdAt": "2026-07-02T10:00:00.000Z",
      "updatedAt": "2026-07-02T10:00:00.000Z"
    }
  ]
}
```

### Endpoint Master Dokumen

```http
GET /api/v1/units/dokumen
```

Response:

```json
{
  "success": true,
  "message": "Master dokumen berhasil diambil",
  "data": [
    {
      "id": "dokumen-id-1",
      "name": "STNK",
      "code": "STNK",
      "isActive": true,
      "createdAt": "2026-07-02T10:00:00.000Z",
      "updatedAt": "2026-07-02T10:00:00.000Z"
    }
  ]
}
```

### Endpoint Detail Unit

```http
GET /api/v1/units/:id
```

Response penting untuk edit:

```json
{
  "success": true,
  "message": "Detail unit berhasil diambil",
  "data": {
    "id": "unit-id-1",
    "merekId": "merek-id-1",
    "tipeId": "tipe-id-1",
    "platNomor": "B 1234 ABC",
    "statusUnit": "INVENTORY",
    "unitKelengkapans": [
      {
        "id": "unit-kelengkapan-id-1",
        "unitId": "unit-id-1",
        "perlengkapanId": "perlengkapan-id-1",
        "perlengkapan": {
          "id": "perlengkapan-id-1",
          "name": "Kunci Serep",
          "code": "KUNCI_SEREP"
        }
      }
    ],
    "unitDokumens": [
      {
        "id": "unit-dokumen-id-1",
        "unitId": "unit-id-1",
        "dokumenId": "dokumen-id-1",
        "dokumen": {
          "id": "dokumen-id-1",
          "name": "STNK",
          "code": "STNK"
        }
      }
    ]
  }
}
```

Frontend mapping preselect:

```js
const selectedKelengkapans = unit.unitKelengkapans.map((item) => item.perlengkapanId);
const selectedDokumens = unit.unitDokumens.map((item) => item.dokumenId);
```

### Endpoint Update Unit

```http
PUT /api/v1/units/:id
```

Request untuk update hanya dokumen dan perlengkapan:

```json
{
  "kelengkapans": ["perlengkapan-id-1", "perlengkapan-id-2"],
  "dokumens": ["dokumen-id-1", "dokumen-id-2"]
}
```

Behavior penting:

- Jika `kelengkapans` dikirim, backend akan replace semua relasi perlengkapan unit.
- Jika `kelengkapans: []`, semua perlengkapan unit akan dihapus.
- Jika `kelengkapans` tidak dikirim, perlengkapan unit tidak berubah.
- Jika `dokumens` dikirim, backend akan replace semua relasi dokumen unit.
- Jika `dokumens: []`, semua dokumen unit akan dihapus.
- Jika `dokumens` tidak dikirim, dokumen unit tidak berubah.

Request gabungan dengan field unit lain:

```json
{
  "warna": "Hitam",
  "kilometer": 12500,
  "tanggalPajak": "2026-12-31",
  "kelengkapans": ["perlengkapan-id-1"],
  "dokumens": ["dokumen-id-1"]
}
```

Response:

```json
{
  "success": true,
  "message": "Unit berhasil diperbarui",
  "data": {
    "id": "unit-id-1",
    "statusUnit": "INVENTORY",
    "unitKelengkapans": [
      {
        "id": "unit-kelengkapan-id-1",
        "unitId": "unit-id-1",
        "perlengkapanId": "perlengkapan-id-1",
        "createdAt": "2026-07-02T10:00:00.000Z",
        "updatedAt": "2026-07-02T10:00:00.000Z"
      }
    ],
    "unitDokumens": [
      {
        "id": "unit-dokumen-id-1",
        "unitId": "unit-id-1",
        "dokumenId": "dokumen-id-1",
        "createdAt": "2026-07-02T10:00:00.000Z",
        "updatedAt": "2026-07-02T10:00:00.000Z"
      }
    ]
  }
}
```

### Validasi Frontend

- Kirim array string ID.
- Jangan kirim duplicate ID dalam satu array.
- Pastikan ID berasal dari master aktif.
- Tampilkan error jika backend mengembalikan `RELATION_CONFLICT`, `DATA_NOT_FOUND`, atau error validasi.

## 2. Merubah Status Unit

### Tujuan

Frontend dapat mengubah status inventory unit dari halaman list/detail unit.

### Permission

- `UNIT_UPDATE`

### Status yang Didukung

```text
INVENTORY
READY_STOCK
HOLD
SOLD
```

### Alur UI

1. User membuka list/detail unit.
2. User memilih aksi ubah status.
3. Frontend tampilkan pilihan status valid.
4. User konfirmasi perubahan.
5. Frontend submit `PATCH /api/v1/units/:id/status`.
6. Frontend update state list/detail atau refetch data.

Catatan bisnis:

- Saat status diubah ke `READY_STOCK`, backend menghitung ulang nilai:
  - `hpp = hargaBeli + total rekondisi COMPLETED`
  - `hargaTargetJual = hpp + 22%`
  - `hargaOtrSaatIni = hpp + 25%`
- Endpoint ini tidak memvalidasi alur transisi status secara ketat di backend saat ini. Frontend tetap disarankan meminta konfirmasi user, terutama untuk `SOLD`.

### Endpoint

```http
PATCH /api/v1/units/:id/status
```

Request:

```json
{
  "statusUnit": "READY_STOCK"
}
```

Response:

```json
{
  "success": true,
  "message": "Status unit berhasil diperbarui",
  "data": {
    "id": "unit-id-1",
    "statusUnit": "READY_STOCK",
    "hargaBeli": 150000000,
    "hpp": 160000000,
    "hargaTargetJual": 195200000,
    "hargaOtrSaatIni": 200000000,
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### Error yang Perlu Ditangani

Unit tidak ditemukan:

```json
{
  "success": false,
  "message": "Unit tidak ditemukan",
  "error": {
    "code": "UNIT_NOT_FOUND",
    "details": null
  }
}
```

Status tidak valid:

```json
{
  "success": false,
  "message": "\"statusUnit\" must be one of [INVENTORY, READY_STOCK, HOLD, SOLD]",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {}
  }
}
```

## 3. Menambahkan Data Rekondisi Unit

### Tujuan

Frontend dapat membuat rekondisi baru untuk sebuah unit, mengisi metadata vendor/keterangan, menambahkan detail biaya rekondisi, memproses rekondisi, menyelesaikan rekondisi, dan jika diperlukan melakukan pembayaran.

### Permission

- Cek status rekondisi: `UNIT_UPDATE`
- Buat rekondisi dari unit: `REKONDISI_CREATE`
- Baca rekondisi: `REKONDISI_READ`
- Update rekondisi: `REKONDISI_UPDATE`
- Tambah detail rekondisi: `REKONDISI_CREATE`
- Hapus detail rekondisi: `REKONDISI_DELETE`
- Bayar rekondisi: `REKONDISI_PAY`

### Status Rekondisi

```text
PENDING
IN_PROGRESS
COMPLETED
```

Alur status yang didukung backend:

```text
PENDING -> IN_PROGRESS -> COMPLETED -> PAID
```

`PAID` bukan value field `status`; kondisi paid ditandai oleh `paidAt` dan `cashTransactionId`.

### Alur UI Direkomendasikan

1. User klik aksi "Tambah Rekondisi" pada unit.
2. Frontend cek apakah unit masih punya rekondisi yang belum selesai.
3. Jika ada rekondisi `PENDING` atau `IN_PROGRESS`, tampilkan warning dan arahkan user ke rekondisi tersebut.
4. Jika tidak ada, frontend submit create rekondisi.
5. Frontend arahkan user ke halaman/form detail rekondisi.
6. User memilih vendor dan mengisi keterangan.
7. User menambahkan item detail biaya rekondisi.
8. User klik mulai proses untuk mengubah status menjadi `IN_PROGRESS`.
9. Setelah selesai, user upload invoice dan input fee/tax tambahan.
10. Backend menghitung total dari subtotal detail + tax + admin fee + additional fee.
11. Jika rekondisi sudah selesai dan perlu dibayar, user pilih akun kas dan tanggal bayar.

### 3.1 Cek Rekondisi Belum Selesai

```http
GET /api/v1/units/:id/rekondisi-status-check
```

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

- `hasUnfinishedRekondisi: true` jika ada rekondisi unit dengan status `PENDING` atau `IN_PROGRESS`.
- Frontend disarankan tidak membuat rekondisi baru jika response `true`.

### 3.2 Buat Rekondisi Baru dari Unit

```http
POST /api/v1/units/:id/rekondisi
```

Request body:

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
    "unitId": "unit-id-1",
    "tanggal": "2026-07-02T10:00:00.000Z",
    "seq": 1,
    "status": "PENDING",
    "nominal": 0,
    "tax": 0,
    "adminFee": 0,
    "additionalFee": 0,
    "total": 0,
    "vendorId": null,
    "keterangan": null,
    "invoiceUrl": null,
    "paidAt": null,
    "cashAccountId": null,
    "cashTransactionId": null,
    "createdAt": "2026-07-02T10:00:00.000Z",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

Catatan:

- `seq` otomatis bertambah berdasarkan rekondisi terakhir pada unit yang sama.
- Data awal dibuat dengan `nominal: 0` dan `total: 0`.

### 3.3 Update Metadata Rekondisi

Dipakai untuk mengisi vendor dan keterangan.

```http
PUT /api/v1/rekondisis/:id
```

Request:

```json
{
  "vendorId": "vendor-id-1",
  "keterangan": "Perbaikan bumper dan poles body"
}
```

Field:

- `vendorId`: optional, string, boleh `null` atau string kosong.
- `keterangan`: optional, string, boleh `null` atau string kosong.
- Minimal satu field harus dikirim.

Response:

```json
{
  "success": true,
  "message": "Rekondisi berhasil diperbarui",
  "data": {
    "id": "rekondisi-id-1",
    "unitId": "unit-id-1",
    "vendorId": "vendor-id-1",
    "keterangan": "Perbaikan bumper dan poles body",
    "status": "PENDING",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### 3.4 Tambah Detail Biaya Rekondisi

```http
POST /api/v1/rekondisis/:rekondisiId/detail
```

Request:

```json
{
  "pengecekanId": "pengecekan-id-1",
  "description": "Ganti kampas rem depan",
  "nominal": 750000
}
```

Field:

- `pengecekanId`: required, string.
- `description`: optional, string, boleh `null` atau string kosong.
- `nominal`: required, number, minimal 0.

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
    "createdAt": "2026-07-02T10:00:00.000Z",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### 3.5 List Detail Biaya Rekondisi

```http
GET /api/v1/rekondisis/:rekondisiId/detail?page=1&limit=20
```

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

### 3.6 Update Detail Biaya Rekondisi

```http
PUT /api/v1/rekondisis/:rekondisiId/detail/:id
```

Request:

```json
{
  "description": "Ganti kampas rem depan dan belakang",
  "nominal": 1200000
}
```

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diperbarui",
  "data": {
    "id": "rekondisi-detail-id-1",
    "rekondisiId": "rekondisi-id-1",
    "pengecekanId": "pengecekan-id-1",
    "description": "Ganti kampas rem depan dan belakang",
    "nominal": 1200000,
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### 3.7 Hapus Detail Biaya Rekondisi

```http
DELETE /api/v1/rekondisis/:rekondisiId/detail/:id
```

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
    "nominal": 750000
  }
}
```

### 3.8 Mulai Proses Rekondisi

```http
PATCH /api/v1/rekondisis/:id/progress
```

Request body:

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

### 3.9 Selesaikan Rekondisi

```http
POST /api/v1/rekondisis/:id/done
Content-Type: multipart/form-data
```

Request form-data:

```text
invoice: <file optional>
tax: 100000
adminFee: 50000
additionalFee: 25000
```

Field:

- `invoice`: optional file. Jika dikirim, backend menyimpan URL sebagai `/public/rekondisi/<filename>`.
- `tax`: optional number, minimal 0.
- `adminFee`: optional number, minimal 0.
- `additionalFee`: optional number, minimal 0.

Backend menghitung:

```text
nominal = sum(detail.nominal)
total = nominal + tax + adminFee + additionalFee
status = COMPLETED
```

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

### 3.10 Bayar Rekondisi

```http
POST /api/v1/rekondisis/:id/pay
```

Request:

```json
{
  "cashAccountId": "cash-account-id-1",
  "paidDate": "2026-07-02"
}
```

Field:

- `cashAccountId`: required, string.
- `paidDate`: required, ISO date.

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

Error jika belum `COMPLETED`:

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

### 3.11 Ambil Detail Rekondisi

```http
GET /api/v1/rekondisis/:id
```

Response:

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diambil",
  "data": {
    "id": "rekondisi-id-1",
    "unitId": "unit-id-1",
    "vendorId": "vendor-id-1",
    "status": "COMPLETED",
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
        "pengecekanId": "pengecekan-id-1",
        "description": "Ganti kampas rem depan dan belakang",
        "nominal": 1200000,
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

### 3.12 List Rekondisi

```http
GET /api/v1/rekondisis?page=1&limit=20&unitId=unit-id-1&status=PENDING
```

Query:

- `page`: optional, default `1`.
- `limit`: optional, default `20`, max `100`.
- `unitId`: optional.
- `status`: optional.

Response:

```json
{
  "success": true,
  "message": "Daftar rekondisi berhasil diambil",
  "data": [
    {
      "id": "rekondisi-id-1",
      "unitId": "unit-id-1",
      "status": "PENDING",
      "seq": 1,
      "nominal": 0,
      "total": 0,
      "vendor": null,
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

## Frontend Acceptance Criteria

1. Form edit unit dapat menampilkan master perlengkapan dan dokumen sebagai checklist.
2. Checklist edit unit ter-preselect sesuai `unitKelengkapans` dan `unitDokumens` dari detail unit.
3. Submit edit unit mengirim `kelengkapans` dan `dokumens` sebagai array ID.
4. User dapat menghapus semua dokumen/perlengkapan dengan mengirim array kosong.
5. User dapat merubah status unit menggunakan endpoint status khusus.
6. Saat status menjadi `READY_STOCK`, UI menampilkan nilai `hpp`, `hargaTargetJual`, dan `hargaOtrSaatIni` terbaru dari response/refetch.
7. User dapat membuat rekondisi baru dari unit setelah pengecekan unfinished rekondisi.
8. User dapat mengisi vendor/keterangan rekondisi.
9. User dapat menambah, mengubah, dan menghapus detail biaya rekondisi.
10. User dapat memproses rekondisi dari `PENDING` ke `IN_PROGRESS`.
11. User dapat menyelesaikan rekondisi dari `IN_PROGRESS` ke `COMPLETED` dengan optional upload invoice.
12. User dapat melakukan pembayaran rekondisi yang sudah `COMPLETED`.

## Catatan Integrasi

- Untuk nama vendor, pengecekan, cash account, merek, dan tipe, frontend perlu memakai endpoint master/lookup terkait yang sudah ada di modul masing-masing.
- Setelah update unit, response relasi belum menyertakan object master lengkap. Refetch detail unit jika UI membutuhkan nama perlengkapan/dokumen.
- Untuk invoice rekondisi, simpan dan tampilkan `invoiceUrl` dari response. URL file relatif terhadap base backend.
- Validasi frontend harus tetap ringan; backend tetap sumber kebenaran untuk permission, relasi ID, dan status transition rekondisi.
