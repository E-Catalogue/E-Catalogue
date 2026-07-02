# PRD: Modul Unit (Inventory) & Rekondisi

Dokumen ini menjelaskan alur operasional, endpoint, request, response, dan aturan bisnis untuk modul Unit Inventory serta Rekondisi.

## 0. Konvensi API

### Base URL
Semua endpoint berada di bawah prefix:

```text
/api/v1
```

### Authentication
Semua endpoint wajib memakai token login:

```http
Authorization: Bearer <access_token>
```

### Format Response Sukses
Semua response sukses mengikuti format:

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

`meta` hanya ada pada endpoint list/pagination.

### Format Error Umum
Format error mengikuti middleware error backend. Minimal FE perlu membaca `message` dan `code`.

```json
{
  "success": false,
  "message": "Unit tidak ditemukan",
  "code": "UNIT_NOT_FOUND"
}
```

### Pagination
Endpoint list memakai query:

| Query | Type | Default | Keterangan |
| --- | --- | --- | --- |
| `page` | number | `1` | Halaman yang diminta. Minimal 1. |
| `limit` | number | `20` | Jumlah data per halaman. Minimal 1, maksimal 100. |

## 1. Alur Besar Modul

### 1.1 Alur Input Unit Baru
1. User membuka halaman Inventory Unit.
2. FE mengambil master data:
   - `GET /api/v1/units/kelengkapan`
   - `GET /api/v1/units/dokumen`
   - Master merek/tipe diambil dari modul master terkait.
3. User mengisi data unit: merek, tipe, plat, spesifikasi kendaraan, pembelian, kelengkapan, dan dokumen.
4. FE mengirim `POST /api/v1/units`.
5. Backend membuat unit dengan status awal `INVENTORY`.
6. Jika ada gambar, FE upload satu per satu ke `POST /api/v1/units/:id/image`.
7. Unit tampil di list inventory.

### 1.2 Alur Rekondisi Unit
1. User membuka detail unit.
2. User membuat rekondisi dari detail unit dengan `POST /api/v1/units/:id/rekondisi`.
3. Backend membuat rekondisi baru dengan status `PENDING`, `seq` otomatis, `nominal = 0`, dan `total = 0`.
4. User mengisi vendor/keterangan rekondisi melalui `PUT /api/v1/rekondisis/:id`.
5. User menambahkan item pekerjaan/pengecekan melalui `POST /api/v1/rekondisis/:rekondisiId/detail`.
6. Jika pekerjaan dimulai, user menjalankan `PATCH /api/v1/rekondisis/:id/progress`.
7. Jika pekerjaan selesai, user menjalankan `POST /api/v1/rekondisis/:id/done` dengan biaya tambahan dan invoice jika ada.
8. Backend menghitung:
   - `nominal` = total seluruh `RekondisiDetail.nominal`
   - `total` = `nominal + tax + adminFee + additionalFee`
   - status rekondisi menjadi `COMPLETED`

### 1.3 Alur Unit Menjadi Ready Stock
1. User membuka detail unit.
2. FE memanggil `GET /api/v1/units/:id/rekondisi-status-check`.
3. Jika `hasUnfinishedRekondisi = true`, FE menampilkan konfirmasi bahwa masih ada rekondisi `PENDING` atau `IN_PROGRESS`.
4. Jika user tetap lanjut, atau jika tidak ada rekondisi belum selesai, FE mengirim `PATCH /api/v1/units/:id/status` dengan `statusUnit = READY_STOCK`.
5. Backend menghitung harga:
   - `hpp = hargaBeli + total semua rekondisi COMPLETED`
   - `hargaTargetJual = hpp + 22%`
   - `hargaOtrSaatIni = hpp + 25%`
6. Unit siap dipakai oleh modul Lead Order. Saat sales order dibuat, unit harus aktif dan berstatus `READY_STOCK`.

### 1.4 Alur Status Unit
Status unit yang valid:

| Status | Keterangan |
| --- | --- |
| `INVENTORY` | Unit baru masuk stok, belum siap dijual. |
| `READY_STOCK` | Unit sudah siap dijual. HPP dan harga jual dihitung saat status ini dipilih. |
| `HOLD` | Unit sedang dibooking/order. Biasanya diubah otomatis oleh modul Lead Order. |
| `SOLD` | Unit sudah terjual. Biasanya diubah otomatis oleh modul Lead Order saat deal. |

Catatan:
- Endpoint update status tidak membatasi transisi antar status. FE perlu mengatur UX agar perubahan status sesuai proses bisnis.
- Saat status diubah ke `READY_STOCK`, backend selalu menghitung ulang `hpp`, `hargaTargetJual`, dan `hargaOtrSaatIni`.
- Soft delete unit hanya mengubah `isActive = false`.

## 2. Data Object

### 2.1 Unit

```json
{
  "id": "unit-uuid",
  "statusUnit": "INVENTORY",
  "isActive": true,
  "merekId": "merek-uuid",
  "tipeId": "tipe-uuid",
  "platNomor": "B 1234 ABC",
  "tahun": 2020,
  "warna": "Hitam",
  "transmisi": "AUTOMATIC",
  "noRangka": "MHF123",
  "noMesin": "J20A123",
  "kilometer": 15000,
  "tanggalPajak": "2024-05-20T00:00:00.000Z",
  "hargaBeli": 150000000,
  "tanggalPembelian": "2023-01-15T00:00:00.000Z",
  "hpp": 155000000,
  "hargaTargetJual": 189100000,
  "hargaOtrSaatIni": 193750000,
  "createdAt": "2026-06-30T10:00:00.000Z",
  "updatedAt": "2026-06-30T10:00:00.000Z"
}
```

### 2.2 Rekondisi

```json
{
  "id": "rekondisi-uuid",
  "status": "PENDING",
  "unitId": "unit-uuid",
  "tanggal": "2026-06-30T00:00:00.000Z",
  "seq": 1,
  "vendorId": "vendor-uuid",
  "keterangan": "Perbaikan AC",
  "nominal": 500000,
  "tax": 55000,
  "adminFee": 25000,
  "additionalFee": 100000,
  "total": 680000,
  "invoiceUrl": "/public/rekondisi/invoice-file.pdf",
  "createdAt": "2026-06-30T10:00:00.000Z",
  "updatedAt": "2026-06-30T10:00:00.000Z"
}
```

### 2.3 Rekondisi Detail

```json
{
  "id": "detail-uuid",
  "rekondisiId": "rekondisi-uuid",
  "pengecekanId": "pengecekan-uuid",
  "description": "Ganti oli mesin",
  "nominal": 500000,
  "createdAt": "2026-06-30T10:00:00.000Z",
  "updatedAt": "2026-06-30T10:00:00.000Z"
}
```

## 3. Endpoint Unit

### 3.1 GET `/api/v1/units`
Mengambil daftar unit paginated.

**Permission:** `UNIT_READ`

**Query Params:**

| Query | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `page` | number | Tidak | Halaman. Default `1`. |
| `limit` | number | Tidak | Jumlah data. Default `20`, maksimal `100`. |
| `search` | string | Tidak | Mencari berdasarkan `platNomor`. |
| `statusUnit` | string | Tidak | `INVENTORY`, `READY_STOCK`, `HOLD`, `SOLD`. |
| `isActive` | string | Tidak | Isi `"true"` atau `"false"`. |

**Contoh Request:**

```http
GET /api/v1/units?page=1&limit=10&search=B%201234&statusUnit=INVENTORY&isActive=true
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Daftar unit berhasil diambil",
  "data": [
    {
      "id": "unit-uuid",
      "statusUnit": "INVENTORY",
      "isActive": true,
      "merekId": "merek-uuid",
      "tipeId": "tipe-uuid",
      "platNomor": "B 1234 ABC",
      "tahun": 2020,
      "warna": "Hitam",
      "transmisi": "AUTOMATIC",
      "noRangka": "MHF123",
      "noMesin": "J20A123",
      "kilometer": 15000,
      "tanggalPajak": "2024-05-20T00:00:00.000Z",
      "hargaBeli": 150000000,
      "tanggalPembelian": "2023-01-15T00:00:00.000Z",
      "hpp": null,
      "hargaTargetJual": null,
      "hargaOtrSaatIni": null,
      "createdAt": "2026-06-30T10:00:00.000Z",
      "updatedAt": "2026-06-30T10:00:00.000Z",
      "merek": {
        "id": "merek-uuid",
        "name": "Toyota"
      },
      "tipe": {
        "id": "tipe-uuid",
        "name": "Avanza"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3.2 GET `/api/v1/units/:id`
Mengambil detail unit beserta merek, tipe, kelengkapan, dokumen, dan gambar.

**Permission:** `UNIT_READ`

**Contoh Request:**

```http
GET /api/v1/units/unit-uuid
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Detail unit berhasil diambil",
  "data": {
    "id": "unit-uuid",
    "statusUnit": "INVENTORY",
    "isActive": true,
    "merekId": "merek-uuid",
    "tipeId": "tipe-uuid",
    "platNomor": "B 1234 ABC",
    "tahun": 2020,
    "warna": "Hitam",
    "transmisi": "AUTOMATIC",
    "noRangka": "MHF123",
    "noMesin": "J20A123",
    "kilometer": 15000,
    "tanggalPajak": "2024-05-20T00:00:00.000Z",
    "hargaBeli": 150000000,
    "tanggalPembelian": "2023-01-15T00:00:00.000Z",
    "hpp": null,
    "hargaTargetJual": null,
    "hargaOtrSaatIni": null,
    "createdAt": "2026-06-30T10:00:00.000Z",
    "updatedAt": "2026-06-30T10:00:00.000Z",
    "merek": {
      "id": "merek-uuid",
      "name": "Toyota"
    },
    "tipe": {
      "id": "tipe-uuid",
      "name": "Avanza"
    },
    "unitKelengkapans": [
      {
        "id": "unit-kelengkapan-uuid",
        "unitId": "unit-uuid",
        "perlengkapanId": "perlengkapan-uuid",
        "perlengkapan": {
          "id": "perlengkapan-uuid",
          "name": "Dongkrak"
        }
      }
    ],
    "unitDokumens": [
      {
        "id": "unit-dokumen-uuid",
        "unitId": "unit-uuid",
        "dokumenId": "dokumen-uuid",
        "dokumen": {
          "id": "dokumen-uuid",
          "name": "STNK"
        }
      }
    ],
    "unitImages": [
      {
        "id": "image-uuid",
        "filename": "unit-1710000000000.jpg",
        "originalName": "depan.jpg",
        "extension": ".jpg",
        "unitId": "unit-uuid"
      }
    ]
  }
}
```

**Error 404:**

```json
{
  "success": false,
  "message": "Unit tidak ditemukan",
  "code": "UNIT_NOT_FOUND"
}
```

### 3.3 POST `/api/v1/units`
Menambah unit baru. Status awal default dari database adalah `INVENTORY`.

**Permission:** `UNIT_CREATE`

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `merekId` | string | Ya | ID master merek. |
| `tipeId` | string | Ya | ID master tipe. |
| `platNomor` | string | Ya | Nomor polisi. |
| `tahun` | number | Ya | Tahun kendaraan, 1900 sampai 2100. |
| `warna` | string | Ya | Warna kendaraan. |
| `transmisi` | string | Ya | `MANUAL` atau `AUTOMATIC`. |
| `noRangka` | string | Ya | Nomor rangka. |
| `noMesin` | string | Ya | Nomor mesin. |
| `kilometer` | number | Ya | Kilometer kendaraan. Minimal 0. |
| `tanggalPajak` | ISO date | Ya | Tanggal pajak. |
| `hargaBeli` | number | Ya | Harga beli unit. Minimal 0. |
| `tanggalPembelian` | ISO date | Ya | Tanggal pembelian unit. |
| `kelengkapans` | string[] | Tidak | Array ID master perlengkapan. |
| `dokumens` | string[] | Tidak | Array ID master dokumen. |
| `isActive` | boolean | Tidak | Default `true`. |

**Contoh Request:**

```json
{
  "merekId": "merek-uuid",
  "tipeId": "tipe-uuid",
  "platNomor": "B 1234 ABC",
  "tahun": 2020,
  "warna": "Hitam",
  "transmisi": "AUTOMATIC",
  "noRangka": "MHF123",
  "noMesin": "J20A123",
  "kilometer": 15000,
  "tanggalPajak": "2024-05-20T00:00:00.000Z",
  "hargaBeli": 150000000,
  "tanggalPembelian": "2023-01-15T00:00:00.000Z",
  "kelengkapans": ["perlengkapan-uuid-1", "perlengkapan-uuid-2"],
  "dokumens": ["dokumen-uuid-1", "dokumen-uuid-2"]
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Unit berhasil dibuat",
  "data": {
    "id": "unit-uuid",
    "statusUnit": "INVENTORY",
    "isActive": true,
    "merekId": "merek-uuid",
    "tipeId": "tipe-uuid",
    "platNomor": "B 1234 ABC",
    "tahun": 2020,
    "warna": "Hitam",
    "transmisi": "AUTOMATIC",
    "noRangka": "MHF123",
    "noMesin": "J20A123",
    "kilometer": 15000,
    "tanggalPajak": "2024-05-20T00:00:00.000Z",
    "hargaBeli": 150000000,
    "tanggalPembelian": "2023-01-15T00:00:00.000Z",
    "hpp": null,
    "hargaTargetJual": null,
    "hargaOtrSaatIni": null,
    "unitKelengkapans": [
      {
        "id": "unit-kelengkapan-uuid",
        "unitId": "unit-uuid",
        "perlengkapanId": "perlengkapan-uuid-1"
      }
    ],
    "unitDokumens": [
      {
        "id": "unit-dokumen-uuid",
        "unitId": "unit-uuid",
        "dokumenId": "dokumen-uuid-1"
      }
    ],
    "createdAt": "2026-06-30T10:00:00.000Z",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

### 3.4 PUT `/api/v1/units/:id`
Mengupdate data unit. Endpoint ini tidak dipakai untuk update status.

**Permission:** `UNIT_UPDATE`

**Content-Type:** `application/json`

**Aturan:**
- Semua field opsional, tetapi minimal harus ada 1 field.
- Jika `kelengkapans` dikirim, data kelengkapan lama dihapus lalu diganti dengan array baru.
- Jika `dokumens` dikirim, data dokumen lama dihapus lalu diganti dengan array baru.
- Jika ingin mengosongkan semua kelengkapan/dokumen, kirim array kosong: `[]`.

**Contoh Request:**

```json
{
  "kilometer": 18000,
  "warna": "Putih",
  "kelengkapans": ["perlengkapan-uuid-1"],
  "dokumens": []
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Unit berhasil diperbarui",
  "data": {
    "id": "unit-uuid",
    "statusUnit": "INVENTORY",
    "isActive": true,
    "merekId": "merek-uuid",
    "tipeId": "tipe-uuid",
    "platNomor": "B 1234 ABC",
    "tahun": 2020,
    "warna": "Putih",
    "transmisi": "AUTOMATIC",
    "noRangka": "MHF123",
    "noMesin": "J20A123",
    "kilometer": 18000,
    "tanggalPajak": "2024-05-20T00:00:00.000Z",
    "hargaBeli": 150000000,
    "tanggalPembelian": "2023-01-15T00:00:00.000Z",
    "unitKelengkapans": [
      {
        "id": "unit-kelengkapan-uuid",
        "unitId": "unit-uuid",
        "perlengkapanId": "perlengkapan-uuid-1"
      }
    ],
    "unitDokumens": []
  }
}
```

### 3.5 GET `/api/v1/units/:id/rekondisi-status-check`
Mengecek apakah unit masih memiliki rekondisi yang belum selesai.

**Permission:** `UNIT_STATUS_UPDATE`

**Kapan Dipakai:** Sebelum FE mengubah status unit ke `READY_STOCK`.

**Contoh Request:**

```http
GET /api/v1/units/unit-uuid/rekondisi-status-check
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Status rekondisi berhasil dicek",
  "data": {
    "hasUnfinishedRekondisi": true
  }
}
```

**Interpretasi FE:**
- `true`: Ada rekondisi `PENDING` atau `IN_PROGRESS`. Tampilkan konfirmasi sebelum lanjut.
- `false`: Tidak ada rekondisi berjalan. Status aman diubah ke `READY_STOCK`.

### 3.6 PATCH `/api/v1/units/:id/status`
Mengubah status unit.

**Permission:** `UNIT_STATUS_UPDATE`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "statusUnit": "READY_STOCK"
}
```

`statusUnit` wajib salah satu:

```text
INVENTORY, READY_STOCK, HOLD, SOLD
```

**Response 200 Saat READY_STOCK:**

```json
{
  "success": true,
  "message": "Status unit berhasil diperbarui",
  "data": {
    "id": "unit-uuid",
    "statusUnit": "READY_STOCK",
    "isActive": true,
    "hargaBeli": 150000000,
    "hpp": 155000000,
    "hargaTargetJual": 189100000,
    "hargaOtrSaatIni": 193750000,
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

**Contoh Perhitungan:**
- `hargaBeli = 150000000`
- Total rekondisi `COMPLETED = 5000000`
- `hpp = 155000000`
- `hargaTargetJual = 155000000 + 22% = 189100000`
- `hargaOtrSaatIni = 155000000 + 25% = 193750000`

### 3.7 DELETE `/api/v1/units/:id`
Soft delete unit. Backend mengubah `isActive` menjadi `false`.

**Permission:** `UNIT_DELETE`

**Contoh Request:**

```http
DELETE /api/v1/units/unit-uuid
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Unit berhasil dihapus",
  "data": {
    "id": "unit-uuid",
    "isActive": false
  }
}
```

### 3.8 POST `/api/v1/units/:id/image`
Upload gambar unit.

**Permission:** `UNIT_UPDATE`

**Content-Type:** `multipart/form-data`

**Form Data:**

| Key | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `image` | file | Ya | File gambar unit. |

**Contoh Request:**

```http
POST /api/v1/units/unit-uuid/image
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

image=<file>
```

**Response 201:**

```json
{
  "success": true,
  "message": "Gambar unit berhasil ditambahkan",
  "data": {
    "id": "image-uuid",
    "filename": "unit-1710000000000.jpg",
    "originalName": "depan.jpg",
    "extension": ".jpg",
    "unitId": "unit-uuid",
    "createdAt": "2026-06-30T10:00:00.000Z",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

**Error 400 Jika File Kosong:**

```json
{
  "success": false,
  "message": "File gambar wajib diunggah",
  "code": "IMAGE_REQUIRED"
}
```

### 3.9 DELETE `/api/v1/units/:id/image/:imageId`
Menghapus gambar unit. File fisik di folder `public/unit` dihapus jika masih ada, lalu record database dihapus.

**Permission:** `UNIT_UPDATE`

**Contoh Request:**

```http
DELETE /api/v1/units/unit-uuid/image/image-uuid
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Gambar unit berhasil dihapus",
  "data": {
    "id": "image-uuid",
    "filename": "unit-1710000000000.jpg",
    "originalName": "depan.jpg",
    "extension": ".jpg",
    "unitId": "unit-uuid"
  }
}
```

**Error 404:**

```json
{
  "success": false,
  "message": "Gambar unit tidak ditemukan",
  "code": "UNIT_IMAGE_NOT_FOUND"
}
```

### 3.10 GET `/api/v1/units/kelengkapan`
Mengambil master kelengkapan aktif untuk checkbox form unit.

**Permission:** `UNIT_READ`

**Response 200:**

```json
{
  "success": true,
  "message": "Master kelengkapan berhasil diambil",
  "data": [
    {
      "id": "perlengkapan-uuid",
      "name": "Dongkrak",
      "isActive": true
    }
  ]
}
```

### 3.11 GET `/api/v1/units/dokumen`
Mengambil master dokumen aktif untuk checkbox form unit.

**Permission:** `UNIT_READ`

**Response 200:**

```json
{
  "success": true,
  "message": "Master dokumen berhasil diambil",
  "data": [
    {
      "id": "dokumen-uuid",
      "name": "STNK",
      "isActive": true
    }
  ]
}
```

### 3.12 POST `/api/v1/units/:id/rekondisi`
Membuat entry rekondisi baru untuk unit.

**Permission:** `REKONDISI_CREATE`

**Aturan:**
- Status awal selalu `PENDING`.
- `tanggal` otomatis tanggal saat request.
- `seq` otomatis berdasarkan urutan rekondisi pada unit yang sama.
- `nominal` dan `total` awal bernilai `0`.

**Contoh Request:**

```http
POST /api/v1/units/unit-uuid/rekondisi
Authorization: Bearer <access_token>
```

**Response 201:**

```json
{
  "success": true,
  "message": "Rekondisi unit berhasil dibuat",
  "data": {
    "id": "rekondisi-uuid",
    "status": "PENDING",
    "unitId": "unit-uuid",
    "tanggal": "2026-06-30T00:00:00.000Z",
    "seq": 1,
    "vendorId": null,
    "keterangan": null,
    "nominal": 0,
    "tax": null,
    "adminFee": null,
    "additionalFee": null,
    "total": 0,
    "invoiceUrl": null,
    "createdAt": "2026-06-30T10:00:00.000Z",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

## 4. Endpoint Rekondisi

### 4.1 GET `/api/v1/rekondisis`
Mengambil daftar rekondisi paginated.

**Permission:** `REKONDISI_READ`

**Query Params:**

| Query | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `page` | number | Tidak | Halaman. Default `1`. |
| `limit` | number | Tidak | Jumlah data. Default `20`, maksimal `100`. |
| `status` | string | Tidak | `PENDING`, `IN_PROGRESS`, `COMPLETED`. |
| `unitId` | string | Tidak | Filter rekondisi berdasarkan unit. |

**Contoh Request:**

```http
GET /api/v1/rekondisis?page=1&limit=10&status=PENDING&unitId=unit-uuid
Authorization: Bearer <access_token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Daftar rekondisi berhasil diambil",
  "data": [
    {
      "id": "rekondisi-uuid",
      "status": "PENDING",
      "unitId": "unit-uuid",
      "tanggal": "2026-06-30T00:00:00.000Z",
      "seq": 1,
      "vendorId": null,
      "keterangan": null,
      "nominal": 0,
      "total": 0,
      "vendor": null,
      "unit": {
        "id": "unit-uuid",
        "platNomor": "B 1234 ABC",
        "statusUnit": "INVENTORY"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4.2 GET `/api/v1/rekondisis/:id`
Mengambil detail rekondisi beserta vendor, unit, dan item detail.

**Permission:** `REKONDISI_READ`

**Response 200:**

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diambil",
  "data": {
    "id": "rekondisi-uuid",
    "status": "IN_PROGRESS",
    "unitId": "unit-uuid",
    "tanggal": "2026-06-30T00:00:00.000Z",
    "seq": 1,
    "vendorId": "vendor-uuid",
    "vendor": {
      "id": "vendor-uuid",
      "name": "Bengkel Jaya"
    },
    "unit": {
      "id": "unit-uuid",
      "platNomor": "B 1234 ABC"
    },
    "keterangan": "Perbaikan AC",
    "nominal": 0,
    "tax": null,
    "adminFee": null,
    "additionalFee": null,
    "total": 0,
    "invoiceUrl": null,
    "rekondisiDetails": [
      {
        "id": "detail-uuid",
        "rekondisiId": "rekondisi-uuid",
        "pengecekanId": "pengecekan-uuid",
        "description": "Ganti oli mesin",
        "nominal": 500000,
        "pengecekan": {
          "id": "pengecekan-uuid",
          "name": "Mesin"
        }
      }
    ]
  }
}
```

**Error 404:**

```json
{
  "success": false,
  "message": "Rekondisi tidak ditemukan",
  "code": "REKONDISI_NOT_FOUND"
}
```

### 4.3 PUT `/api/v1/rekondisis/:id`
Update vendor dan keterangan rekondisi.

**Permission:** `REKONDISI_UPDATE`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "vendorId": "vendor-uuid",
  "keterangan": "Perbaikan AC dan kaki-kaki"
}
```

Field opsional, tetapi minimal salah satu harus dikirim. `vendorId` dan `keterangan` boleh dikirim `null` atau string kosong.

**Response 200:**

```json
{
  "success": true,
  "message": "Rekondisi berhasil diperbarui",
  "data": {
    "id": "rekondisi-uuid",
    "status": "PENDING",
    "vendorId": "vendor-uuid",
    "keterangan": "Perbaikan AC dan kaki-kaki",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

### 4.4 PATCH `/api/v1/rekondisis/:id/progress`
Mengubah status rekondisi dari `PENDING` menjadi `IN_PROGRESS`.

**Permission:** `REKONDISI_STATUS_UPDATE`

**Aturan:**
- Hanya bisa dijalankan jika status saat ini `PENDING`.
- Jika status sudah `IN_PROGRESS` atau `COMPLETED`, request ditolak.

**Response 200:**

```json
{
  "success": true,
  "message": "Status rekondisi menjadi IN_PROGRESS",
  "data": {
    "id": "rekondisi-uuid",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

**Error 400:**

```json
{
  "success": false,
  "message": "Rekondisi hanya dapat diproses dari status PENDING",
  "code": "INVALID_STATUS_TRANSITION"
}
```

### 4.5 POST `/api/v1/rekondisis/:id/done`
Menyelesaikan rekondisi dan menghitung total biaya.

**Permission:** `REKONDISI_STATUS_UPDATE`

**Content-Type:** `multipart/form-data`

**Aturan:**
- Hanya bisa dijalankan jika status saat ini `IN_PROGRESS`.
- `invoice` opsional.
- `tax`, `adminFee`, dan `additionalFee` opsional. Jika tidak dikirim, dianggap `0`.
- Backend menghitung `nominal` dari total seluruh item detail rekondisi.
- Status berubah menjadi `COMPLETED`.

**Form Data:**

| Key | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `tax` | number | Tidak | Pajak. Minimal 0. |
| `adminFee` | number | Tidak | Biaya admin. Minimal 0. |
| `additionalFee` | number | Tidak | Biaya tambahan. Minimal 0. |
| `invoice` | file | Tidak | File invoice gambar/pdf. |

**Contoh Request:**

```http
POST /api/v1/rekondisis/rekondisi-uuid/done
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

tax=55000
adminFee=25000
additionalFee=100000
invoice=<file>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Rekondisi berhasil diselesaikan",
  "data": {
    "id": "rekondisi-uuid",
    "status": "COMPLETED",
    "nominal": 500000,
    "tax": 55000,
    "adminFee": 25000,
    "additionalFee": 100000,
    "total": 680000,
    "invoiceUrl": "/public/rekondisi/invoice-file.pdf",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

**Error 400:**

```json
{
  "success": false,
  "message": "Rekondisi harus IN_PROGRESS untuk dapat diselesaikan",
  "code": "INVALID_STATUS_TRANSITION"
}
```

## 5. Endpoint Rekondisi Detail

Semua endpoint detail berada di nested route:

```text
/api/v1/rekondisis/:rekondisiId/detail
```

### 5.1 GET `/api/v1/rekondisis/:rekondisiId/detail`
Mengambil daftar item detail rekondisi.

**Permission:** `REKONDISI_DETAIL_READ`

**Query Params:** `page`, `limit`

**Response 200:**

```json
{
  "success": true,
  "message": "Daftar detail rekondisi berhasil diambil",
  "data": [
    {
      "id": "detail-uuid",
      "rekondisiId": "rekondisi-uuid",
      "pengecekanId": "pengecekan-uuid",
      "description": "Ganti oli mesin",
      "nominal": 500000,
      "pengecekan": {
        "id": "pengecekan-uuid",
        "name": "Mesin"
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

### 5.2 GET `/api/v1/rekondisis/:rekondisiId/detail/:id`
Mengambil detail satu item rekondisi.

**Permission:** `REKONDISI_DETAIL_READ`

**Response 200:**

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diambil",
  "data": {
    "id": "detail-uuid",
    "rekondisiId": "rekondisi-uuid",
    "pengecekanId": "pengecekan-uuid",
    "description": "Ganti oli mesin",
    "nominal": 500000,
    "pengecekan": {
      "id": "pengecekan-uuid",
      "name": "Mesin"
    }
  }
}
```

### 5.3 POST `/api/v1/rekondisis/:rekondisiId/detail`
Menambah item pekerjaan/pengecekan ke rekondisi.

**Permission:** `REKONDISI_DETAIL_CREATE`

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `pengecekanId` | string | Ya | ID master pengecekan. |
| `description` | string | Tidak | Deskripsi pekerjaan. Boleh `null` atau string kosong. |
| `nominal` | number | Ya | Biaya item. Minimal 0. |

**Contoh Request:**

```json
{
  "pengecekanId": "pengecekan-uuid",
  "description": "Ganti oli mesin",
  "nominal": 500000
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil ditambahkan",
  "data": {
    "id": "detail-uuid",
    "rekondisiId": "rekondisi-uuid",
    "pengecekanId": "pengecekan-uuid",
    "description": "Ganti oli mesin",
    "nominal": 500000,
    "createdAt": "2026-06-30T10:00:00.000Z",
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

### 5.4 PUT `/api/v1/rekondisis/:rekondisiId/detail/:id`
Mengubah item detail rekondisi.

**Permission:** `REKONDISI_DETAIL_UPDATE`

**Aturan:** Semua field opsional, tetapi minimal 1 field harus dikirim.

**Contoh Request:**

```json
{
  "description": "Ganti oli mesin dan filter",
  "nominal": 650000
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil diperbarui",
  "data": {
    "id": "detail-uuid",
    "rekondisiId": "rekondisi-uuid",
    "pengecekanId": "pengecekan-uuid",
    "description": "Ganti oli mesin dan filter",
    "nominal": 650000,
    "updatedAt": "2026-06-30T10:00:00.000Z"
  }
}
```

### 5.5 DELETE `/api/v1/rekondisis/:rekondisiId/detail/:id`
Menghapus item detail rekondisi.

**Permission:** `REKONDISI_DETAIL_DELETE`

**Response 200:**

```json
{
  "success": true,
  "message": "Detail rekondisi berhasil dihapus",
  "data": {
    "id": "detail-uuid",
    "rekondisiId": "rekondisi-uuid",
    "pengecekanId": "pengecekan-uuid",
    "description": "Ganti oli mesin",
    "nominal": 500000
  }
}
```

**Error 404:**

```json
{
  "success": false,
  "message": "Rekondisi Detail tidak ditemukan",
  "code": "REKONDISI_DETAIL_NOT_FOUND"
}
```

## 6. Flow FE yang Direkomendasikan

### 6.1 Halaman List Unit
1. Call `GET /api/v1/units`.
2. Kirim query `search`, `statusUnit`, dan `isActive` sesuai filter.
3. Tampilkan `data` sebagai table.
4. Pakai `meta.page`, `meta.limit`, `meta.total`, dan `meta.totalPages` untuk pagination.

### 6.2 Form Tambah/Edit Unit
1. Call `GET /api/v1/units/kelengkapan`.
2. Call `GET /api/v1/units/dokumen`.
3. User pilih checkbox kelengkapan dan dokumen.
4. Submit:
   - Tambah: `POST /api/v1/units`
   - Edit: `PUT /api/v1/units/:id`
5. Jika user menambah foto, upload setelah unit berhasil tersimpan.

### 6.3 Detail Unit dan Rekondisi
1. Call `GET /api/v1/units/:id`.
2. Call `GET /api/v1/rekondisis?unitId=:id` untuk menampilkan riwayat rekondisi unit.
3. Untuk membuat rekondisi baru, call `POST /api/v1/units/:id/rekondisi`.
4. Arahkan user ke detail rekondisi.

### 6.4 Detail Rekondisi
1. Call `GET /api/v1/rekondisis/:id`.
2. User mengisi vendor/keterangan dengan `PUT /api/v1/rekondisis/:id`.
3. User menambah item pekerjaan dengan `POST /api/v1/rekondisis/:rekondisiId/detail`.
4. User mulai pekerjaan dengan `PATCH /api/v1/rekondisis/:id/progress`.
5. User menyelesaikan pekerjaan dengan `POST /api/v1/rekondisis/:id/done`.

### 6.5 Ubah Unit ke Ready Stock
1. Dari detail unit, user klik aksi "Ready Stock".
2. FE call `GET /api/v1/units/:id/rekondisi-status-check`.
3. Jika ada rekondisi belum selesai, tampilkan dialog konfirmasi.
4. Jika user lanjut, FE call `PATCH /api/v1/units/:id/status` dengan `statusUnit = READY_STOCK`.
5. Refresh detail unit agar nilai `hpp`, `hargaTargetJual`, dan `hargaOtrSaatIni` tampil terbaru.

## 7. Permissions

| Fitur | Permission |
| --- | --- |
| List/detail unit | `UNIT_READ` |
| Buat unit | `UNIT_CREATE` |
| Edit unit | `UNIT_UPDATE` |
| Hapus unit | `UNIT_DELETE` |
| Update status unit | `UNIT_STATUS_UPDATE` |
| List/detail rekondisi | `REKONDISI_READ` |
| Buat rekondisi dari unit | `REKONDISI_CREATE` |
| Edit rekondisi | `REKONDISI_UPDATE` |
| Update progress/done rekondisi | `REKONDISI_STATUS_UPDATE` |
| List/detail rekondisi detail | `REKONDISI_DETAIL_READ` |
| Buat rekondisi detail | `REKONDISI_DETAIL_CREATE` |
| Edit rekondisi detail | `REKONDISI_DETAIL_UPDATE` |
| Hapus rekondisi detail | `REKONDISI_DETAIL_DELETE` |
