# PRD Frontend: Penjualan Approval, Test Drive, dan Inventory Unit Image

## 1. Ringkasan

Dokumen ini menjadi panduan implementasi frontend untuk tiga perubahan backend terbaru:

1. Modul Penjualan: `statusApproval` berubah dari input string bebas menjadi enum.
2. Modul Test Drive: tersedia API baru untuk CRUD test drive dan lookup unit ready stock.
3. Modul Inventory Unit: image unit sekarang memiliki `sequence` dan `isMain`, serta tersedia API reorder dan set main image.

Tujuan frontend:

- Tidak ada input ID manual untuk data relasional.
- Semua field enum tampil sebagai dropdown/segmented control.
- Upload dokumen/gambar punya validasi dan pesan error yang jelas.
- UI image unit mendukung tambah, hapus, reorder, dan pilih gambar utama.

## 2. Penjualan

### 2.1 Perubahan Field `statusApproval`

Field `statusApproval` tidak boleh lagi berupa text input bebas. Frontend wajib menampilkan dropdown dengan opsi:

| Label UI | Value API |
| --- | --- |
| Menunggu Approval | `PENDING` |
| Disetujui | `APPROVED` |
| Ditolak | `REJECTED` |

Field boleh dikosongkan jika transaksi bukan kredit atau approval belum relevan.

### 2.2 Form Create / Update Penjualan

Endpoint tetap:

```http
POST /lead-orders
PATCH /lead-orders/:id
```

Contoh request create kredit:

```json
{
  "leadId": "lead-id",
  "unitId": "unit-id",
  "diskonShowroom": 5000000,
  "salesId": "sales-id",
  "paymentType": "KREDIT",
  "leasingId": "leasing-id",
  "statusSlik": "LOLOS",
  "statusApproval": "PENDING",
  "tanggalOrder": "2026-07-01",
  "catatan": "Menunggu approval leasing"
}
```

Jika `paymentType = CASH`, frontend sebaiknya hide atau disable:

- `leasingId`
- `statusSlik`
- `statusApproval`

Jika tetap dikirim, gunakan `null` atau string kosong:

```json
{
  "statusApproval": null
}
```

### 2.3 Validasi Frontend

Frontend wajib menolak submit jika:

- `statusApproval` bukan salah satu dari `PENDING`, `APPROVED`, `REJECTED`.
- `paymentType = KREDIT` tetapi `leasingId` belum dipilih, jika aturan UI internal mengharuskan leasing.
- `diskonShowroom` lebih besar dari harga OTR yang tampil.

### 2.4 Error Yang Harus Ditampilkan

| Code | Pesan UI |
| --- | --- |
| `VALIDATION_ERROR` | Data penjualan belum valid. Tandai field yang dikembalikan backend. |
| `UNIT_NOT_FOUND` | Unit tidak ditemukan. Muat ulang daftar unit. |
| `UNIT_NOT_READY_STOCK` | Unit harus aktif dan berstatus Ready Stock. |
| `UNIT_OTR_PRICE_REQUIRED` | Harga OTR unit belum tersedia. Ubah status unit ke Ready Stock atau cek data unit. |
| `INVALID_DISCOUNT` | Diskon tidak boleh melebihi harga OTR. |
| `SALES_NOT_FOUND` | Sales tidak ditemukan. |
| `SALES_INACTIVE` | Sales tidak aktif. |
| `LEASING_NOT_FOUND` | Leasing tidak ditemukan. |
| `LEASING_INACTIVE` | Leasing tidak aktif. |

## 3. Test Drive

### 3.1 Menu dan Halaman

Frontend perlu membuat halaman `Test Drive` dengan route UI:

```text
/test-drive
```

Permission:

- Page read: `TEST_DRIVE_READ`
- Tombol tambah: `TEST_DRIVE_CREATE`
- Tombol edit/status: `TEST_DRIVE_UPDATE`
- Tombol hapus: `TEST_DRIVE_DELETE`

### 3.2 Daftar Test Drive

Endpoint:

```http
GET /test-drives?page=1&limit=10&search=&status=&salesId=&leadId=&unitId=
```

Response sukses:

```json
{
  "success": true,
  "message": "Daftar test drive berhasil diambil",
  "data": [
    {
      "id": "test-drive-id",
      "leadId": "lead-id",
      "unitId": "unit-id",
      "salesId": "sales-id",
      "scheduledAt": "2026-07-01T10:00:00.000Z",
      "status": "SCHEDULED",
      "fotoKtpUrl": "src/media/public/images/test-drive/file-ktp.jpg",
      "fotoSimUrl": "src/media/public/images/test-drive/file-sim.jpg",
      "catatan": "Customer ingin coba unit sore hari",
      "lead": {
        "id": "lead-id",
        "nama": "Nama Customer",
        "nik": "317..."
      },
      "unit": {
        "id": "unit-id",
        "platNomor": "B 1234 ABC",
        "merek": { "name": "Toyota" },
        "tipe": { "name": "Avanza" }
      },
      "sales": {
        "id": "sales-id",
        "name": "Nama Sales"
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

Kolom tabel yang disarankan:

- Jadwal
- Customer
- Unit
- Sales
- Status
- Foto KTP
- Foto SIM
- Aksi

Status badge:

| Label UI | Value API | Warna |
| --- | --- | --- |
| Dijadwalkan | `SCHEDULED` | Biru |
| Selesai | `COMPLETED` | Hijau |
| Dibatalkan | `CANCELLED` | Merah/Abu |

### 3.3 Lookup Unit Test Drive

Endpoint:

```http
GET /test-drives/units?search=
```

Backend selalu mengembalikan unit aktif berstatus `READY_STOCK`.

Response:

```json
{
  "success": true,
  "message": "Daftar unit test drive berhasil diambil",
  "data": [
    {
      "id": "unit-id",
      "platNomor": "B 1234 ABC",
      "merekName": "Toyota",
      "tipeName": "Avanza",
      "tahun": 2020,
      "warna": "Hitam",
      "hargaOtrSaatIni": 125000000,
      "statusUnit": "READY_STOCK"
    }
  ]
}
```

UI dropdown unit harus menampilkan minimal:

```text
B 1234 ABC - Toyota Avanza 2020 - Hitam
```

Jangan gunakan hardcode unit di frontend.

### 3.4 Form Create Test Drive

Endpoint:

```http
POST /test-drives
Content-Type: multipart/form-data
```

Field form-data:

| Field | Tipe | Wajib | Catatan |
| --- | --- | --- | --- |
| `leadId` | string | Ya | Pilih dari lead/customer. |
| `unitId` | string | Ya | Pilih dari `GET /test-drives/units`. |
| `salesId` | string | Tidak | Jika kosong backend memakai user login. |
| `scheduledAt` | ISO datetime | Ya | Jadwal test drive. |
| `status` | enum | Tidak | Default `SCHEDULED`. |
| `fotoKtp` | file image | Ya | JPG/JPEG/PNG, max 5MB. |
| `fotoSim` | file image | Ya | JPG/JPEG/PNG, max 5MB. |
| `catatan` | string | Tidak | Catatan tambahan. |

Contoh submit:

```js
const form = new FormData()
form.append('leadId', leadId)
form.append('unitId', unitId)
form.append('scheduledAt', scheduledAt)
form.append('fotoKtp', ktpFile)
form.append('fotoSim', simFile)
form.append('catatan', catatan || '')
```

### 3.5 Form Update Test Drive

Endpoint:

```http
PATCH /test-drives/:id
Content-Type: multipart/form-data
```

Field sama seperti create, tetapi semuanya optional.

Frontend harus mendukung:

- Ubah jadwal.
- Ubah status.
- Ubah unit.
- Ubah sales.
- Upload ulang Foto KTP.
- Upload ulang Foto SIM.
- Ubah catatan.

### 3.6 Hapus Test Drive

Endpoint:

```http
DELETE /test-drives/:id
```

UI:

- Tampilkan confirmation dialog.
- Setelah sukses, refresh list.

### 3.7 Error Test Drive

| Code | Pesan UI |
| --- | --- |
| `FOTO_KTP_REQUIRED` | Foto KTP wajib diunggah. |
| `FOTO_SIM_REQUIRED` | Foto SIM wajib diunggah. |
| `INVALID_FILE_TYPE` | File harus JPG, JPEG, atau PNG. |
| `LIMIT_FILE_SIZE` / upload size error | Ukuran file maksimal 5MB. |
| `LEAD_NOT_FOUND` | Lead tidak ditemukan. |
| `UNIT_NOT_FOUND` | Unit tidak ditemukan. |
| `UNIT_NOT_READY_STOCK` | Unit harus aktif dan berstatus Ready Stock. |
| `SALES_NOT_FOUND` | Sales tidak ditemukan. |
| `SALES_INACTIVE` | Sales tidak aktif. |
| `TEST_DRIVE_NOT_FOUND` | Test drive tidak ditemukan. |
| `VALIDATION_ERROR` | Data test drive belum valid. |

Frontend wajib menampilkan error per field jika backend mengirim `errors`.

## 4. Inventory Unit Image

### 4.1 Data Image Unit

Detail unit dari:

```http
GET /units/:id
```

Sekarang `unitImages` mengandung:

```json
{
  "id": "image-id",
  "filename": "file.jpg",
  "originalName": "mobil-depan.jpg",
  "extension": ".jpg",
  "sequence": 1,
  "isMain": true,
  "unitId": "unit-id",
  "createdAt": "2026-07-01T00:00:00.000Z",
  "updatedAt": "2026-07-01T00:00:00.000Z"
}
```

Backend sudah mengurutkan image berdasarkan:

```text
sequence ASC, createdAt ASC
```

### 4.2 UI Galeri Unit

Frontend perlu menampilkan galeri image di detail/edit unit.

Fitur:

- Upload image.
- Hapus image.
- Drag-and-drop reorder atau tombol naik/turun.
- Tandai gambar utama.
- Badge `Utama` pada image dengan `isMain=true`.
- Preview gambar.

Jika belum ada image:

- Tampilkan empty state: `Belum ada gambar unit`.
- Upload pertama otomatis menjadi gambar utama.

### 4.3 Upload Image Unit

Endpoint:

```http
POST /units/:id/image
Content-Type: multipart/form-data
```

Field:

| Field | Tipe | Wajib | Catatan |
| --- | --- | --- | --- |
| `image` | file image | Ya | JPG/JPEG/PNG, max 5MB. |
| `sequence` | number | Tidak | Jika kosong backend set otomatis. |
| `isMain` | boolean | Tidak | Jika true, image lain otomatis bukan main. |

Contoh:

```js
const form = new FormData()
form.append('image', file)
form.append('isMain', 'true')
```

### 4.4 Reorder Image

Endpoint:

```http
PATCH /units/:id/images/reorder
Content-Type: application/json
```

Request:

```json
{
  "images": [
    { "id": "image-id-1", "sequence": 1 },
    { "id": "image-id-2", "sequence": 2 },
    { "id": "image-id-3", "sequence": 3 }
  ]
}
```

UI behavior:

- Setelah drag/drop selesai, kirim semua image dengan sequence final.
- Optimistic update boleh dilakukan, tetapi rollback jika API gagal.
- Setelah sukses, gunakan response API sebagai state final.

### 4.5 Set Main Image

Endpoint:

```http
PATCH /units/:id/image/:imageId/main
```

Behavior:

- Backend otomatis set semua image lain menjadi `isMain=false`.
- Frontend refresh galeri atau update local state dari response.

### 4.6 Delete Image

Endpoint:

```http
DELETE /units/:id/image/:imageId
```

Behavior:

- Jika image yang dihapus adalah main image, backend otomatis memilih image berikutnya sebagai main.
- Frontend harus refresh detail unit setelah delete agar main image terbaru tampil benar.

### 4.7 Error Unit Image

| Code | Pesan UI |
| --- | --- |
| `IMAGE_REQUIRED` | Gambar wajib diunggah. |
| `INVALID_FILE_TYPE` | File harus JPG, JPEG, atau PNG. |
| `UNIT_NOT_FOUND` | Unit tidak ditemukan. |
| `UNIT_IMAGE_NOT_FOUND` | Gambar unit tidak ditemukan. |
| `VALIDATION_ERROR` | Data gambar belum valid. |

## 5. Inventory Unit Status dan Rekondisi

### 5.1 Ubah Status Unit

Endpoint:

```http
PATCH /units/:id/status
Content-Type: application/json
```

Request:

```json
{
  "statusUnit": "READY_STOCK"
}
```

Opsi:

| Label UI | Value API |
| --- | --- |
| Inventory | `INVENTORY` |
| Ready Stock | `READY_STOCK` |
| Hold | `HOLD` |
| Sold | `SOLD` |

Saat status diubah ke `READY_STOCK`, backend menghitung:

- HPP
- Harga Target Jual
- Harga OTR Saat Ini

Frontend harus refresh detail unit setelah sukses.

### 5.2 Button Rekondisi

Sebelum membuat rekondisi:

```http
GET /units/:id/rekondisi-status-check
```

Response:

```json
{
  "success": true,
  "data": {
    "hasUnfinishedRekondisi": false
  }
}
```

Jika `hasUnfinishedRekondisi=true`, tampilkan warning:

```text
Masih ada rekondisi yang belum selesai untuk unit ini.
```

Buat rekondisi:

```http
POST /units/:id/rekondisi
```

Setelah sukses, arahkan user ke detail rekondisi terkait.

## 6. Payroll: Sales dan Order Dropdown

### 6.1 Masalah Yang Harus Dihilangkan

Pada form Insentif Sales, frontend tidak boleh lagi menampilkan `salesId` dan `leadOrderId/orderId` sebagai input text manual.

Frontend wajib memakai dropdown/searchable select:

- `salesId` dipilih dari lookup sales.
- `leadOrderId` dipilih dari lookup order yang sudah `DEAL`.

### 6.2 Lookup Sales

Endpoint:

```http
GET /finance/lookups/sales?search=
```

Response:

```json
{
  "success": true,
  "message": "Lookup sales berhasil diambil",
  "data": [
    {
      "id": "sales-id",
      "name": "Nama Sales",
      "username": "sales01",
      "isActive": true
    }
  ]
}
```

UI dropdown sales:

```text
Nama Sales (@sales01)
```

Value yang dikirim ke API tetap `id`.

### 6.3 Lookup Order DEAL

Endpoint:

```http
GET /finance/lookups/deal-orders?salesId=&period=YYYY-MM&withoutIncentive=true&search=
```

Parameter yang disarankan:

| Parameter | Wajib | Catatan |
| --- | --- | --- |
| `salesId` | Ya | Kirim setelah sales dipilih. |
| `period` | Ya | Samakan dengan periode insentif payroll. |
| `withoutIncentive` | Ya | Gunakan `true` agar order yang sudah punya insentif tidak muncul lagi. |
| `search` | Tidak | Cari nomor order atau nama customer. |

Response:

```json
{
  "success": true,
  "message": "Lookup sales order DEAL berhasil diambil",
  "data": [
    {
      "id": "lead-order-id",
      "nomorOrder": "SO-202607-001",
      "salesId": "sales-id",
      "salesName": "Nama Sales",
      "customerName": "Nama Customer",
      "status": "DEAL",
      "hargaFinal": 100000000,
      "dealDate": "2026-07-01T00:00:00.000Z",
      "hasIncentive": false
    }
  ]
}
```

UI dropdown order:

```text
SO-202607-001 - Nama Customer - Rp100.000.000
```

Value yang dikirim ke API adalah `id` sebagai `leadOrderId`.

### 6.4 Form Insentif Sales

Endpoint create:

```http
POST /payroll/sales-incentives
Content-Type: application/json
```

Request:

```json
{
  "salesId": "sales-id",
  "leadOrderId": "lead-order-id",
  "amount": 1000000,
  "period": "2026-07",
  "description": "Insentif deal SO-202607-001"
}
```

Aturan UI:

- Pilih periode terlebih dahulu.
- Pilih sales dari lookup.
- Setelah sales dipilih, load order DEAL berdasarkan `salesId` dan `period`.
- Disable dropdown order sebelum sales dipilih.
- Tampilkan empty state jika tidak ada order DEAL yang eligible.
- Jangan izinkan submit jika `salesId`, `leadOrderId`, `amount`, atau `period` kosong.
- Jangan beri field text manual untuk ID.

### 6.5 Error Payroll Insentif

| Code | Pesan UI |
| --- | --- |
| `VALIDATION_ERROR` | Data insentif belum valid. Tandai field yang dikembalikan backend. |
| `SALES_NOT_FOUND` | Sales tidak ditemukan. Pilih sales ulang dari dropdown. |
| `SALES_INACTIVE` | Sales tidak aktif. |
| `LEAD_ORDER_NOT_FOUND` | Order penjualan tidak ditemukan. Pilih order ulang dari dropdown. |
| `LEAD_ORDER_NOT_DEAL` | Insentif hanya bisa dibuat untuk order dengan status Deal. |
| `SALES_ORDER_MISMATCH` | Order tidak dimiliki oleh sales yang dipilih. |
| unique duplicate incentive | Order ini sudah memiliki insentif. Muat ulang daftar order. |

### 6.6 Acceptance Criteria Payroll

- Tidak ada input text untuk `salesId`.
- Tidak ada input text untuk `leadOrderId` atau `orderId`.
- Sales dipilih dari `GET /finance/lookups/sales`.
- Order dipilih dari `GET /finance/lookups/deal-orders`.
- Dropdown order terfilter berdasarkan sales dan periode.
- Order yang sudah punya insentif tidak muncul jika `withoutIncentive=true`.
- Submit mengirim `salesId` dan `leadOrderId` dari selected option.

## 7. Permission Frontend

Gunakan `permissionCodes` dari `/auth/me`.

| Fitur | Permission |
| --- | --- |
| Lihat Penjualan | `LEAD_ORDER_READ` |
| Ubah Penjualan | `LEAD_ORDER_UPDATE` |
| Lihat Test Drive | `TEST_DRIVE_READ` |
| Tambah Test Drive | `TEST_DRIVE_CREATE` |
| Ubah Test Drive | `TEST_DRIVE_UPDATE` |
| Hapus Test Drive | `TEST_DRIVE_DELETE` |
| Lihat Unit | `UNIT_READ` |
| Ubah Unit / image / status | `UNIT_UPDATE` |
| Buat Rekondisi dari Unit | `REKONDISI_CREATE` |
| Lihat Payroll | `PAYROLL_READ` |
| Buat Insentif Sales | `PAYROLL_CREATE` |
| Ubah Insentif Sales | `PAYROLL_UPDATE` |
| Hapus Insentif Sales | `PAYROLL_DELETE` |

Jika user tidak punya permission:

- Sembunyikan tombol aksi.
- Jika akses halaman ditolak, tampilkan halaman `Tidak memiliki akses`.

## 8. Acceptance Criteria

### Penjualan

- `statusApproval` tampil sebagai dropdown, bukan text input.
- Submit dengan value selain `PENDING`, `APPROVED`, `REJECTED` tidak mungkin dilakukan dari UI.
- Error validation backend ditampilkan per field.

### Test Drive

- User bisa melihat daftar test drive.
- User bisa membuat test drive dengan lead, unit ready stock, jadwal, foto KTP, dan foto SIM.
- Dropdown unit test drive memakai `GET /test-drives/units`, bukan hardcode.
- Submit tanpa Foto KTP atau Foto SIM menampilkan error jelas.
- Unit selain Ready Stock tidak muncul di dropdown.
- User bisa update status menjadi `SCHEDULED`, `COMPLETED`, atau `CANCELLED`.

### Inventory Unit Image

- User bisa upload image unit.
- Upload pertama otomatis tampil sebagai gambar utama.
- User bisa memilih gambar utama.
- User bisa reorder image dan urutan tetap setelah refresh.
- User bisa hapus image.
- Jika main image dihapus, gambar berikutnya otomatis menjadi main setelah refresh.

### Payroll

- Form insentif sales tidak memakai input ID manual.
- Sales dan order dipilih dari dropdown lookup.
- Order dropdown hanya menampilkan order `DEAL` yang sesuai sales dan periode.
- Frontend menampilkan error jika order sudah memiliki insentif.

## 9. Catatan Implementasi

- File URL dari backend saat ini berupa path relatif seperti `src/media/public/images/...`. Frontend perlu menggabungkan dengan base URL static media yang digunakan aplikasi.
- Untuk multipart update Test Drive, jangan kirim file field jika user tidak mengganti file.
- Untuk reorder image, kirim seluruh daftar image dengan sequence final agar state backend deterministik.
- Setelah operasi image, disarankan refetch `GET /units/:id` agar `isMain` dan sequence yang tampil benar.
- Untuk Payroll, endpoint lookup berada di `/finance/lookups/*`. Pastikan user payroll memiliki permission yang diperlukan oleh backend untuk mengakses lookup tersebut.
