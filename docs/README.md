# Dokumentasi E-Catalogue Backend

Semua dokumen produk & integrasi terpusat di folder ini.

## Struktur

```
docs/
├── prd/           → PRD backend per modul (spesifikasi untuk tim backend)
│   ├── aplikasi_prd.md          PRD utama aplikasi (awal project)
│   ├── master_prd.md            Master data (merek, vendor, leasing, dsb)
│   ├── unit_prd.md              Inventory / unit
│   ├── lead_prd.md              CRM / lead
│   ├── cashflow_prd.md          Cash flow & keuangan
│   ├── cms_prd.md               CMS website publik (v2, per-section)
│   └── perbaikan_api_prd.md     Perbaikan API
│
├── frontend/      → 📦 PAKET UNTUK TIM FRONTEND — kirim folder ini
│   ├── cms_frontend_integration.md      Integrasi CMS & halaman publik (v2)
│   ├── penjualan_testdrive_unit_prd.md  Integrasi penjualan, test drive, unit
│   ├── auth_master_integration.md       Integrasi auth & master data
│   └── code_menu.md                     Daftar kode menu & permission
│
└── postman/       → Koleksi Postman
    └── master_collection.json
```

## Konvensi

- PRD backend (`prd/`) = sumber kebutuhan; dokumen integrasi (`frontend/`)
  = kontrak API yang **sesuai implementasi nyata** (contoh request/response asli).
- Setiap ada perubahan endpoint, update dokumen integrasi terkait di `frontend/`
  agar folder ini selalu siap dikirim.
