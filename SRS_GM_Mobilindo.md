# SRS — Sistem Manajemen Showroom GM Mobilindo (Web Based)

> Software Requirements Specification untuk sistem manajemen showroom mobil bekas GM Mobilindo yang terintegrasi dari proses pembelian unit, rekondisi, inventory, CRM, test drive, sales order, pembayaran, hingga laporan keuangan dan arus kas.

---

## Daftar Isi

1. [Business Flow](#1-business-flow)
2. [User Role](#2-user-role)
3. [Module Inventory](#3-module-inventory)
4. [Module Rekondisi](#4-module-rekondisi)
5. [Module CRM / Lead / Customer](#5-module-crm--lead--customer)
6. [Module Test Drive](#6-module-test-drive)
7. [Module Sales Order](#7-module-sales-order)
8. [Module Pembayaran](#8-module-pembayaran)
9. [Module Pengeluaran](#9-module-pengeluaran)
10. [Module Cash Flow](#10-module-cash-flow)
11. [Dashboard](#11-dashboard)
12. [Laporan](#12-laporan)
13. [Rekomendasi Fase 2](#13-rekomendasi-fase-2)

---

## 1. Business Flow

```
Inspeksi & Pembelian Unit
        ↓
   Inventory Unit
        ↓
   Rekondisi Unit
        ↓
   Ready Stock
        ↓
    Customer
        ↓
   Lead / CRM
        ↓
   Test Drive
        ↓
Sales Order / Penjualan
        ↓
   Pembayaran
        ↓
 Serah Terima Unit
        ↓
   Pengeluaran
        ↓
Laporan Profit & Cash Flow
```

---

## 2. User Role

| Modul                | Owner | Admin | Sales |
|----------------------|:-----:|:-----:|:-----:|
| Dashboard            | ✅    | —     | —     |
| Inventory            | ✅    | ✅    | —     |
| Rekondisi            | ✅    | ✅    | —     |
| CRM / Lead           | ✅    | ✅    | ✅    |
| Test Drive           | ✅    | ✅    | ✅    |
| Sales Order          | ✅    | ✅    | ✅    |
| Pembayaran           | ✅    | ✅    | —     |
| Pengeluaran          | —     | ✅    | —     |
| Cash Flow            | ✅    | ✅    | —     |
| Laporan              | ✅    | ✅    | —     |

---

## 3. Module Inventory

**Tujuan:** Mencatat seluruh unit kendaraan yang masuk showroom.

### Form Input Unit

| Field              | Type                         |
|--------------------|------------------------------|
| Pilihan Stok       | Dropdown (Investor / GM)     |
| Merek              | Dropdown                     |
| Tipe Mobil         | Text                         |
| Plat Nomor         | Text                         |
| Tahun              | Number                       |
| Warna              | Text                         |
| Transmisi          | Dropdown                     |
| No Rangka          | Text                         |
| No Mesin           | Text                         |
| Kilometer          | Number                       |
| Tanggal Pajak      | Date                         |
| Barcode            | Auto Generate                |
| Kunci Serep        | Checkbox                     |
| Manual Book        | Checkbox                     |
| Buku Service       | Checkbox                     |
| Dongkrak           | Checkbox                     |
| Kunci Roda         | Checkbox                     |
| Ban Serep          | Checkbox                     |
| Status BPKB        | Dropdown                     |
| Status Unit        | Dropdown                     |
| Harga Beli         | Currency                     |
| Harga Target Jual  | Auto (formula)               |
| Harga OTR Saat Ini | Auto (formula)               |
| Tanggal Pembelian  | Date                         |

### Formula Harga

```
HPP (Harga Pokok Penjualan)
  = Harga Beli + Total Rekondisi

Harga Target
  = HPP + 22%

Harga OTR (On The Road)
  = HPP + 25%
```

> ⚠️ **Catatan:** Harga OTR harus tetap menjadi dasar penjualan meskipun ada rekondisi tambahan setelah unit berstatus Ready Stock.

---

## 4. Module Rekondisi

**Tujuan:** Mencatat seluruh biaya perbaikan kendaraan.

### Alur

```
Pilih Unit → Tambah Rekondisi → Simpan → Update HPP
```

### Form Rekondisi

| Field           | Type                   |
|-----------------|------------------------|
| Unit            | Dropdown               |
| Tanggal         | Date                   |
| Jenis Kerusakan | Dropdown + Manual Input |
| Vendor          | Dropdown               |
| Keterangan      | Text Area              |
| Nominal         | Currency               |
| Upload Invoice  | File                   |

### Catatan Khusus

Unit yang sudah berstatus **READY STOCK** tetap dapat ditambahkan rekondisi baru. Contoh alur:

```
Unit Ready Stock → Ban Bocor → Tambah Rekondisi → HPP Bertambah → Harga OTR Tetap
```

> Berlaku untuk vendor **HD Argo**.

---

## 5. Module CRM / Lead / Customer

**Tujuan:** Seluruh sales wajib menginput lead. Lead tidak boleh dihapus. Status lead harus tersimpan meskipun tidak terjadi penjualan.

### Form Lead

| Field         | Type           |
|---------------|----------------|
| Nama          | Text           |
| No HP         | Text           |
| Alamat        | Text Area      |
| KTP           | Upload         |
| Pekerjaan     | Text           |
| Unit Diminati | Dropdown       |
| Sales         | Auto Login User |
| Sumber Lead   | Dropdown       |

### Informasi Kredit

| Field             | Type      |
|-------------------|-----------|
| Leasing           | Dropdown  |
| Status SLIK       | Dropdown  |
| Status Approval   | Dropdown  |
| Keterangan        | Text Area |

### Status Lead

```
New → Follow Up → Test Drive → Approved Kredit / Cash Buyer → Booking → Deal
                                                                        ↓
                                                              Reject SLIK / Cancel
```

> **Catatan:** Customer dapat langsung menjadi **Approved Kredit** atau **Cash Buyer** tanpa melalui test drive, namun lead wajib tetap dibuat.

---

## 6. Module Test Drive

**Tujuan:** Mencatat aktivitas test drive.

### Form Test Drive

| Field            | Type           |
|------------------|----------------|
| Customer         | Dropdown       |
| Unit             | Dropdown       |
| Tanggal          | Date           |
| Sales Pendamping | Auto           |
| Foto KTP         | Upload         |
| Foto SIM         | Upload         |
| Catatan          | Text Area      |

### Validasi

> ❌ Tidak boleh submit jika **Foto KTP** atau **Foto SIM** kosong.

---

## 7. Module Sales Order

**Tujuan:** Mencatat transaksi penjualan.

### Form Sales Order

**Data Sales:**

| Field        | Type     |
|--------------|----------|
| Sales Penjual | Dropdown |
| Customer     | Dropdown |
| Unit         | Dropdown |

**Harga:**

| Field           | Type     |
|-----------------|----------|
| Harga OTR       | Auto     |
| Diskon Showroom | Currency |
| Harga Final     | Auto     |

### Formula

```
Harga Final = Harga OTR – Diskon Showroom
```

> Saat admin memilih unit, Harga OTR otomatis muncul.

---

## 8. Module Pembayaran

### Jenis Pembayaran

#### Cash

| Item        | Nominal       |
|-------------|---------------|
| Harga OTR   | 124.000.000   |
| Booking     | 1.000.000     |
| Pelunasan 1 | 20.000.000    |
| Pelunasan 2 | 103.000.000   |

```
Total Bayar = Booking + Pelunasan
Sisa Bayar  = Harga OTR – Total Bayar
```

#### Kredit

| Item               | Nominal       |
|--------------------|---------------|
| OTR                | 124.000.000   |
| Booking            | 1.000.000     |
| DP                 | 13.000.000    |
| Refund / Bonus Leasing | 6.000.000 |
| Pencairan Leasing  | 104.000.000   |

> Semua nominal dibuat manual karena setiap leasing, refund, dan pencairan berbeda.

### Form Pembayaran

| Field            | Type         |
|------------------|--------------|
| Jenis Pembayaran | Cash / Kredit |
| Nominal          | Currency     |
| Keterangan       | Text         |
| Tanggal          | Date         |

### Dashboard Pembayaran

Menampilkan:
- Harga OTR
- Total Dibayar
- Sisa Pembayaran
- **Status:** Lunas / Belum Lunas

---

## 9. Module Pengeluaran

**Tujuan:** Mengelola seluruh biaya operasional showroom.

### Kategori Pengeluaran

**Investor**
```
Formula: 2.5% × Total Dana Investor
Saat ini: Rp 25.000.000 / bulan (dibuat otomatis bulanan)
```

**Operasional Showroom**
- Listrik
- Kontrakan
- Wifi
- Iklan
- Gaji

**Operasional Kendaraan**
- Bensin
- Tol
- Parkir
- Dll (dibuat manual)

---

## 10. Module Cash Flow

### Kas Masuk
- Booking Fee
- DP
- Pelunasan Cash
- Pencairan Leasing
- Refund Masuk
- Penjualan Unit

### Kas Keluar
- Pembelian Unit
- Rekondisi
- Investor Fee
- Operasional
- Gaji
- Iklan
- Bensin
- Lain-lain

### Formula

```
Saldo Akhir = Saldo Awal + Kas Masuk – Kas Keluar
```

---

## 11. Dashboard

### KPI Owner

**Inventory**
- Total Stok
- Ready Stock
- Unit Terjual

**Sales**
- Lead Baru
- Booking
- Deal
- Cancel

**Keuangan**
- Kas Masuk
- Kas Keluar
- Profit Bulan Ini

**Rekondisi**
- Total Biaya Rekondisi

---

## 12. Laporan

### Laporan Inventory
- Stok Ready
- Stok Terjual
- Aging Stock

### Laporan Sales
- Penjualan per Sales
- Closing Rate
- Lead Conversion

### Laporan Rekondisi
- Rekondisi per Unit
- Rekondisi per Vendor

### Laporan Cash Flow
- Harian
- Mingguan
- Bulanan

### Laporan Profit Unit

```
Profit = Harga Jual – (Harga Beli + Rekondisi + Biaya Unit)
```

### Audit Log

Wajib mencatat:
| Field            | Keterangan              |
|------------------|-------------------------|
| Siapa            | User yang mengubah data |
| Sebelum          | Nilai sebelum perubahan |
| Sesudah          | Nilai sesudah perubahan |
| Waktu Perubahan  | Timestamp               |

---

## 13. Rekomendasi Fase 2

| # | Fitur                              | Status     |
|---|------------------------------------|------------|
| 1 | Integrasi WhatsApp Follow Up Lead  | Disarankan |
| 2 | Approval Digital Owner (Diskon Besar) | Disarankan |
| 3 | E-Sign SPK                         | Nanti      |
| 4 | Scan Barcode Unit                  | Nanti      |
| 5 | Reminder Pajak Kendaraan           | Disarankan |
| 6 | Reminder Aging Stock > 60 Hari     | Disarankan |
| 7 | Dashboard ROI Investor             | Nanti      |
| 8 | Multi Cabang Showroom              | Disarankan |
| 9 | Mobile App Sales                   | Disarankan |

---

*SRS GM Mobilindo — Web Based Showroom Management System*
