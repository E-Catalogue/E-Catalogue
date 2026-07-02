# PRD: Modul Lead / CRM, Sales Order & Pembayaran

## 1. Lead / CRM

Lead menyimpan data customer. Lead tidak memiliki endpoint delete karena lead wajib tetap tersimpan walaupun tidak terjadi penjualan.

### GET `/api/v1/leads`
Mengambil daftar lead paginated beserta relasi sumber lead dan order terakhir.
**Query Params:** `page`, `limit`, `search` (nama, NIK, no HP, email), `sumberLeadId`
**Permission:** `LEAD_READ`

### GET `/api/v1/leads/:id`
Mengambil detail lead beserta sumber lead dan daftar order terkait.
**Permission:** `LEAD_READ`

### POST `/api/v1/leads`
Menambah lead baru. Mendukung multipart form-data untuk upload foto KTP.
**Permission:** `LEAD_CREATE`
**Body (JSON atau form-data):**
```json
{
  "nama": "Budi Santoso",
  "nik": "3173010101900001",
  "noHp": "081234567890",
  "email": "budi@example.com",
  "alamat": "Jl. Contoh No. 1",
  "pekerjaan": "Karyawan Swasta",
  "sumberLeadId": "uuid"
}
```
**File form-data:** `ktp` (opsional, file gambar).

### PATCH `/api/v1/leads/:id`
Mengupdate data lead. Mendukung multipart form-data untuk mengganti foto KTP.
**Permission:** `LEAD_UPDATE`
**Body:** Sama dengan POST namun seluruh field opsional.


## 2. Sales Order

Sales Order mencatat pipeline/order penjualan. Saat membuat order, user dapat memilih lead yang sudah ada atau mengirim data lead baru inline. Order aktual dibuat dengan status awal `BOOKING`.

### GET `/api/v1/lead-orders`
Mengambil daftar sales order paginated.
**Query Params:** `page`, `limit`, `search` (nomor order, nama/NIK lead, plat nomor), `status`, `salesId`, `leadId`, `unitId`, `paymentType`
**Permission:** `LEAD_ORDER_READ`

### GET `/api/v1/lead-orders/:id`
Mengambil detail sales order beserta lead, unit, sales, leasing, dan pembayaran.
**Permission:** `LEAD_ORDER_READ`
**Return tambahan:**
```json
{
  "totalPaid": 14000000,
  "remainingPayment": 110000000,
  "isPaid": false
}
```

### POST `/api/v1/lead-orders`
Membuat sales order baru. Unit wajib aktif dan berstatus `READY_STOCK`; setelah order dibuat, status unit otomatis menjadi `HOLD`.
**Permission:** `LEAD_ORDER_CREATE`
**Body dengan lead existing:**
```json
{
  "leadId": "uuid",
  "unitId": "uuid",
  "diskonShowroom": 1000000,
  "paymentType": "KREDIT",
  "leasingId": "uuid",
  "statusSlik": "BI_CHECKING",
  "statusApproval": "Menunggu approval",
  "tanggalOrder": "2026-06-28T00:00:00.000Z",
  "catatan": "Customer booking unit"
}
```
**Body dengan lead baru inline:**
```json
{
  "lead": {
    "nama": "Budi Santoso",
    "nik": "3173010101900001",
    "noHp": "081234567890",
    "email": "budi@example.com",
    "alamat": "Jl. Contoh No. 1",
    "pekerjaan": "Karyawan Swasta",
    "sumberLeadId": "uuid"
  },
  "unitId": "uuid",
  "diskonShowroom": 1000000,
  "paymentType": "CASH",
  "catatan": "Customer cash buyer"
}
```
*Catatan:*
- `leadId` dan `lead` bersifat pilihan salah satu.
- `salesId` opsional; jika tidak dikirim, backend memakai user login.
- `nomorOrder` auto generate format `SO-YYYYMM-###`.
- `hargaPenawaran` otomatis dari `unit.hargaOtrSaatIni`.
- `hargaFinal = hargaPenawaran - diskonShowroom`.
- Request akan ditolak jika unit belum punya `hargaOtrSaatIni`.

### PATCH `/api/v1/lead-orders/:id`
Mengupdate informasi order non-status.
**Permission:** `LEAD_ORDER_UPDATE`
**Body:**
```json
{
  "diskonShowroom": 1500000,
  "salesId": "uuid",
  "paymentType": "KREDIT",
  "leasingId": "uuid",
  "statusSlik": "LOLOS",
  "statusApproval": "Approved",
  "tanggalOrder": "2026-06-28T00:00:00.000Z",
  "catatan": "Update catatan"
}
```
*Catatan: Jika `diskonShowroom` berubah, `hargaFinal` dihitung ulang otomatis.*

### PATCH `/api/v1/lead-orders/:id/status`
Mengubah status sales order.
**Permission:** `LEAD_ORDER_STATUS_UPDATE`
**Body:**
```json
{
  "status": "DEAL"
}
```
**Status valid:** `NEW`, `INTERESTED`, `FOLLOW_UP`, `TEST_DRIVE`, `APPROVED_KREDIT`, `CASH_BUYER`, `BOOKING`, `DEAL`, `REJECT_SLIK`, `CANCEL`

*Catatan status unit:*
- Jika status order menjadi `CANCEL`, unit otomatis kembali ke `READY_STOCK`.
- Jika status order menjadi `DEAL`, unit otomatis menjadi `SOLD`.


## 3. Pembayaran Sales Order

Terletak di _nested route_ `/api/v1/lead-orders/:orderId/payments`.

### GET `/`
Mengambil daftar pembayaran pada sales order.
**Query Params:** `page`, `limit`
**Permission:** `LEAD_PAYMENT_READ`

### GET `/:id`
Mengambil detail pembayaran.
**Permission:** `LEAD_PAYMENT_READ`

### POST `/`
Menambah pembayaran baru. Mendukung multipart form-data untuk upload bukti pembayaran.
**Permission:** `LEAD_PAYMENT_CREATE`
**Body (JSON atau form-data):**
```json
{
  "amount": 1000000,
  "paymentDate": "2026-06-28T00:00:00.000Z",
  "description": "Booking fee",
  "jenisPembayaran": "BOOKING_FEE"
}
```
**File form-data:** `bukti` (opsional, file gambar).
**Jenis pembayaran valid:** `BOOKING_FEE`, `DP`, `PELUNASAN`, `LEASING`, `REFUND_LEASING`

### PATCH `/:id`
Mengupdate pembayaran. Mendukung multipart form-data untuk mengganti bukti pembayaran.
**Permission:** `LEAD_PAYMENT_UPDATE`
**Body:** Sama dengan POST namun seluruh field opsional.

### DELETE `/:id`
Menghapus pembayaran.
**Permission:** `LEAD_PAYMENT_DELETE`

*Catatan: Dashboard pembayaran menghitung `totalPaid`, `remainingPayment`, dan `isPaid` dari total pembayaran dibandingkan `hargaFinal` pada Sales Order.*
