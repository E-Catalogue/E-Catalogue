# TASK LIST — GM Mobilindo E-Catalogue

> Daftar task actionable turunan dari [PRD.md](PRD.md) & [SRS](SRS_GM_Mobilindo.md).
> Status: `[x]` selesai · `[~]` sebagian · `[ ]` belum. Prioritas: 🔴 tinggi · 🟠 sedang · 🟢 rendah.
>
> **Terakhir diperbarui:** 30 Juni 2026 (rev 3)

---

## ✅ SELESAI (Done)

### Fondasi & UI
- [x] Setup project (Vite + React 19 + TS + Tailwind + TanStack Router)
- [x] Tema "Claude Orange" + token warna (CSS vars)
- [x] UI kit reusable (Modal, ConfirmDialog, DetailModal, Button, Field, DataTable, RowActions, Pagination, Tooltip, SectionCard, StatusBadge, UnitCard, PageHeader)
- [x] Layout admin (Sidebar accordion, Header, MainLayout) + Quick Input
- [x] Animasi halus (float-up, stagger, modal-in) + reduce-motion
- [x] **Sidebar accordion** — grup menu collapsible, active state otomatis, mode ikon-only flat, teks tidak terpotong, hierarki font group > item
- [x] **NumericField** — input angka tanpa masalah leading-zero (type text + inputMode numeric, format id-ID on blur, prefix/suffix)
- [x] **Header menu search** — command palette (Ctrl+K / ⌘K), keyboard nav ↑↓ Enter Esc, filter dinamis dari groupMenus

### Situs Publik (Customer)
- [x] Beranda marketing (hero, keunggulan, cara kerja, unggulan, testimoni, CTA)
- [x] Katalog + filter (merek/harga/transmisi/BBM/sort/search) + sidebar kanan
- [x] Detail mobil (galeri + spesifikasi + CTA + unit serupa)
- [x] Simulasi Kredit interaktif
- [x] Tentang & Kontak + PublicLayout (navbar/footer)
- [x] Responsif semua device

### Autentikasi (API nyata)
- [x] Axios client + base URL fleksibel (env)
- [x] Interceptor 1 pintu: attach token + auto-refresh 401 (rotation + antrean)
- [x] Refresh **hanya** saat `INVALID_ACCESS_TOKEN`; kode sesi-berakhir → langsung logout
- [x] Global error handler (network/timeout/5xx/parsing) + GlobalErrorModal
- [x] Login (identifier+password), `/auth/me` hydrate, logout, guard `_admin`
- [x] **Modal konfirmasi logout** + bersihkan cache React Query saat logout
- [x] **Logout semua perangkat** (`/auth/logout-all`) dgn konfirmasi di Header

### Master Data (API nyata)
- [x] Merek + Tipe (nested) CRUD + paginated/search
- [x] Vendor CRUD
- [x] Cabang CRUD + **PIC (dropdown user aktif, `picId` wajib)** + galeri foto (upload/hapus dgn konfirmasi, media `/m/:id`)
- [x] Akses Control: Role, User, Menu/Group/Permission (CRUD + set permission/role/branch) — halaman Menu dirapikan jadi alur 3-kolom (Group → Menu → Permission)
- [x] Master sederhana via komponen generik `SimpleMasterPage` (`code` **wajib** + auto-uppercase): **Leasing, Sumber Lead, Pengecekan, Kategori Pengeluaran, Metode Pembayaran, Dokumen, Perlengkapan**
- [x] **Investor + Modal Investor (nested)** CRUD — investor (nama/kode/bank/rekening) + rincian modal (nominal, tipe bagi hasil %/nominal, periode `YYYY-MM` start/end ongoing, tgl pembagian)

### CRM / Lead (API nyata) — *new*
- [x] `crm.types.ts` — `OrderStatus`, `PaymentType`, `JenisPembayaran`, label/warna map, interface `Lead`, `LeadOrder`, `LeadPayment`, `UnitSummary`
- [x] `crm.api.ts` — `leadApi`, `leadOrderApi`, `leadPaymentApi`, `unitApi`
- [x] `crm.hooks.ts` — `useLeads`, `useLead`, `useLeadMutations`, `useLeadOrders`, `useLeadOrder`, `useLeadOrderMutations` (incl. `updateStatus`), `useLeadPayments`, `useLeadPaymentMutations`, `useReadyStockUnits`
- [x] `CrmPage.tsx` — tabel lead real API, search debounced, no-delete (lead wajib tersimpan per PRD)
- [x] `LeadFormModal.tsx` — form lead (nama/NIK/HP/email/pekerjaan/alamat/sumber lead dropdown API)

### Sales Order / Penjualan (API nyata) — *new*
- [x] `SalesOrderFormModal.tsx` — pilih lead (search live), pilih unit READY_STOCK, tipe Cash/Kredit, leasing/SLIK/approval (kredi), diskon, tanggal, catatan
- [x] `PenjualanPage.tsx` — tabel order real API, filter status, klik status badge untuk ubah status, view detail, pagination
- [x] `OrderStatusModal.tsx` — ubah status order (grid pilih status + validasi beda dari saat ini)
- [x] `OrderDetailModal.tsx` — detail order + ringkasan bayar + riwayat pembayaran CRUD inline (PaymentFormModal bersarang)

### Pembayaran (API nyata) — *new*
- [x] `PembayaranPage.tsx` — view order dengan kolom totalTerbayar/sisa/isPaid, filter belum/lunas, summary card, klik Detail buka OrderDetailModal

### Sidebar & Routing dinamis
- [x] `PATH_BY_CODE` — alias kode backend (`UNIT`, `LEAD`, `LEAD_ORDER`, `LEAD_PAYMENT`) ke route frontend
- [x] `iconMap.ts` — ikon grup (`ACCESS_CONTROL`, `INVENTORY_OPERATIONAL`, `CRM_SALES`, `MASTER_DATA`) dan per-menu (`LEAD`, `LEAD_ORDER`, `LEAD_PAYMENT`, `UNIT`, `REKONDISI`)
- [x] `INVESTOR_MODAL` backend-menu difilter otomatis (path punya param URL → null → disembunyikan dari sidebar; diakses via InvestorPage)

### Unit (API nyata) — *rev 3*
- [x] `unit.types.ts` — `Unit`, `UnitFormData`, `UnitStatusUpdate`, `MasterKelengkapan`, `MasterDokumen`, `UnitImage`, status enums
- [x] `unit.api.ts` — list/get/create/update/updateStatus/delete, upload/delete image, `rekondisiStatusCheck`, `createRekondisi`
- [x] `unit.hooks.ts` — `useUnits`, `useUnit`, `useCreateUnit`, `useUpdateUnit`, `useUpdateUnitStatus`, `useDeleteUnit`, `useRekondisiStatusCheck`, `useCreateRekondisi`, `useMasterKelengkapan`, `useMasterDokumen`

### Rekondisi (API nyata) — *rev 3*
- [x] `rekondisi.types.ts` — `Rekondisi`, `RekondisiDetail`, form types, status labels/colors
- [x] `rekondisi.api.ts` — list/get/update/progress/done (multipart), detail CRUD
- [x] `rekondisi.hooks.ts` — `useRekondisis`, `useRekondisi`, `useRekondisiMutations`, `useRekondisiDetails`, `useRekondisiDetailMutations`
- [x] `RekondisiDetailModal.tsx` — modal manajemen rekondisi per-unit (accordion, inline item edit, progress/done flow, DoneForm + invoice upload)
- [x] `RekondisiPage.tsx` — klik card buka `RekondisiDetailModal` (bukan `UnitDetailModal`)
- [x] `master.hooks.ts` — tambah `usePengecekan` (dropdown item rekondisi)

### Modul admin (dummy — masih dipakai)
- [x] Dashboard (stat, ready stock, grafik, pipeline, rekondisi, aktivitas)
- [x] Inventory, Pembelian, Rekondisi, Ready Stock (CRUD unit)
- [x] Test Drive, Pengeluaran & Cash Flow
- [x] Laporan (ringkasan) & Pengaturan

---

## 📊 Status Integrasi API

> Audit endpoint-per-endpoint. **Indikator:** ✅ penuh · 🟡 sebagian/belum di-UI · ⬜ belum.

| Module | API frontend | Status |
|--------|--------------|:------:|
| Role (+ set permission) | `roleApi` | ✅ |
| User (+ set role/branch, soft-delete) | `userApi` | ✅ |
| Menu / Group / Permission | `menuApi` | ✅ |
| Auth (login/refresh/me/logout/logout-all) | `authApi` + interceptor | ✅ |
| Merek | `merekApi` | ✅ |
| Tipe (nested) | `tipeApi` | ✅ |
| Vendor | `vendorApi` | ✅ |
| Branch & Media | `branchApi` | ✅ |
| Leasing | `leasingApi` | ✅ |
| Sumber Lead | `sumberLeadApi` | ✅ |
| Pengecekan | `pengecekanApi` | ✅ |
| Kategori Pengeluaran | `kategoriPengeluaranApi` | ✅ |
| Metode Pembayaran | `metodePembayaranApi` | ✅ |
| Dokumen | `dokumenApi` | ✅ |
| Perlengkapan | `perlengkapanApi` | ✅ |
| Investor | `investorApi` | ✅ |
| Investor Modal (nested) | `investorModalApi` | ✅ |
| **Lead / CRM** | `leadApi` | ✅ |
| **Sales Order** | `leadOrderApi` (list/get/create/update/updateStatus) | ✅ |
| **Pembayaran Order** | `leadPaymentApi` (nested under order) | ✅ |
| Unit (full CRUD + images + status) | `unitApi` | ✅ |
| Test Drive | — | ⬜ |
| Rekondisi (list/progress/done + detail items) | `rekondisiApi` | ✅ |
| Pengeluaran | — | ⬜ |
| Laporan | — | ⬜ |

---

## 🚧 BELUM / SEBAGIAN (To Do)

### A. Integrasi API modul bisnis (sisa) 🔴
- [x] **Unit** — list + CRUD + upload foto (API layer selesai; UI InventoryPage masih perlu wire ke real API)
- [x] **Rekondisi** — entri biaya per unit, detail item, progress/done (API + modal selesai)
- [ ] 🟠 **Unit Inventory UI** — hubungkan InventoryPage / UnitFormModal ke real API (ganti dummy data)
- [ ] 🟠 **Test Drive** — form (upload KTP+SIM), sales pendamping, link lead
- [ ] 🟠 **Pengeluaran & Cash Flow** — CRUD transaksi, per kategori
- [ ] 🟢 **Dashboard & Laporan** — data agregasi dari API (bukan dummy)

### B. Penyempurnaan CRM/Sales 🟠
- [ ] 🟠 Upload foto KTP di form Lead (`multipart`)
- [ ] 🟠 Harga penawaran unit di Sales Order (ambil OTR dari unit terpilih)
- [ ] 🟠 Notifikasi/validasi unit tidak boleh double-order
- [ ] 🟢 Filter lead by sumber, sales, tanggal

### C. RBAC & Guard Halaman 🟠
- [x] Sidebar dinamis dari `groupMenus` (`/auth/me`) + `PATH_BY_CODE`
- [x] Guard aksi per-permission (Role/User/Menu module)
- [ ] 🟠 Terapkan `Can`/`RequirePermission` ke modul CRM, Penjualan, Pembayaran

### D. Laporan & Audit 🟠
- [ ] 🟠 Laporan: inventory/aging, sales per sales, closing rate, rekondisi, cashflow periodik, profit unit
- [ ] 🟠 Export PDF/Excel
- [ ] 🔴 **Audit Log** (siapa, sebelum, sesudah, waktu)

### E. Lain-lain 🟢
- [ ] 🟢 Fungsikan wishlist/favorit (tombol hati) & bandingkan mobil
- [ ] 🟢 Validasi form menyeluruh (Zod)
- [ ] 🟢 Code-splitting (chunk > 500kB) + optimasi gambar
- [ ] 🟢 Fase 2 SRS: WhatsApp follow-up, approval owner, e-sign SPK, reminder pajak/aging, ROI investor, multi cabang, mobile app

---

## 🎯 Saran urutan berikutnya
1. **A** — Inventory/Unit full CRUD + formula HPP (fondasi semua modul lain).
2. **A** — Test Drive API integration (form upload KTP+SIM + link lead).
3. **A** — Rekondisi biaya → update HPP otomatis.
4. **B** — Upload KTP lead + ambil OTR unit ke Sales Order form.
