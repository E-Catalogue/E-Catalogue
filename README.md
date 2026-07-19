# 🚗 GM Mobilindo — E-Catalogue

Aplikasi **E-Catalogue showroom mobil bekas** dengan dua sisi dalam satu aplikasi:

- **Situs Publik (Customer)** — landing/marketing, katalog dengan filter, detail mobil (galeri + spesifikasi), simulasi kredit, tentang, dan kontak.
- **Panel Admin (Internal)** — dashboard operasional + modul CRUD (inventory, pembelian, rekondisi, ready stock, CRM/lead, test drive, penjualan, pembayaran, laporan, pengaturan).

> Status saat ini: **integrasi API bertahap**.
> - ✅ **Autentikasi** (login/refresh/logout/guard) & **Master Data** (Merek, Tipe, Vendor, Cabang+galeri) sudah terhubung backend nyata.
> - 🟡 Modul bisnis (unit, lead, sales, pembayaran, dll.) masih **dummy** (Redux store) sampai endpoint-nya tersedia.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/) (token warna via CSS variables)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest) (file-based & type-safe)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (data dummy + UI state)
- **Server State (tersedia):** [TanStack Query](https://tanstack.com/query/latest) — provider sudah dipasang untuk integrasi API nanti
- **Icons:** [lucide-react](https://lucide.dev/)
- **Font:** Plus Jakarta Sans

## 🎨 Tema

Warna utama **"Claude Orange"** (`#D97757`) dipadukan netral elegan (charcoal `#181D2A`, abu, putih) + palet aksen (biru/hijau/ungu/amber) untuk kartu statistik & chart. Token didefinisikan sebagai CSS variables di [`src/index.css`](src/index.css) dan dipetakan di [`tailwind.config.js`](tailwind.config.js).

## 🗺️ Routing

Routing dibagi tiga grup (lihat [`src/routes/`](src/routes/)):

| Grup           | Layout                | Rute                                                                                          |
| -------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| **Publik**     | `_public` (navbar + footer) | `/` (beranda), `/katalog`, `/katalog/$id` (detail), `/simulasi`, `/tentang`, `/kontak` |
| **Login**      | standalone            | `/login`                                                                                       |
| **Admin**      | `_admin` (sidebar + header) | `/dashboard`, `/inventory`, `/pembelian`, `/rekondisi`, `/ready-stock`, `/crm`, `/test-drive`, `/penjualan`, `/pembayaran`, `/pengeluaran`, `/merek`, `/vendor`, `/branch`, `/cashflow`, `/laporan`, `/pengaturan` |

> Admin terlindungi: tanpa token akan diarahkan ke `/login`.

`_public` & `_admin` adalah **pathless layout route** — URL tidak mengandung prefix-nya. `routeTree.gen.ts` di-generate otomatis oleh plugin TanStack Router.

## 🔌 Integrasi API

- **Base URL** dari env `VITE_API_BASE_URL` (lihat `.env.example`). Fleksibel: boleh menyertakan `/api/v1` atau tidak — [`client.ts`](src/core/api/client.ts) menormalkannya.
- **Satu pintu (interceptor)** di [`core/api/interceptor.ts`](src/core/api/interceptor.ts):
  - Request → lampirkan `Authorization: Bearer <accessToken>`.
  - Response 401 (endpoint terproteksi) → **auto-refresh token** (rotation + antrean request); gagal → clear sesi + redirect `/login`.
  - Error infrastruktur (network/timeout/5xx/parsing) → **GlobalErrorModal**; error bisnis 4xx diteruskan ke pemanggil.
- **Auth**: `features/auth/` (login, `/auth/me` hydrate, logout) + `authSlice` (user, permissionCodes, groupMenus).
- **Master Data**: `features/master/` — service + React Query hooks (TanStack Query) untuk Merek/Tipe/Vendor/Cabang + upload media.
- Helper `notifyApiError` menampilkan error bisnis mutation lewat modal global yang sama (tetap 1 pintu).

## 📂 Struktur Folder

```text
src/
├── app/
│   ├── providers/index.tsx       # Redux + React Query provider
│   ├── router/index.tsx          # Instance TanStack Router
│   └── store/
│       ├── index.tsx             # Store + typed hooks (useAppSelector/useAppDispatch)
│       ├── uiSlice.tsx           # State UI global (toast)
│       └── dataSlice.ts          # Data dummy + reducer CRUD (units/leads/testDrives/sales/payments)
│
├── core/utils/
│   └── format.ts                 # Helper format (Rupiah, angka, tanggal, KM)
│
├── data/
│   ├── types.ts                  # Tipe domain (Unit, Lead, TestDrive, Sale, Payment)
│   ├── mock.ts                   # Data dummy awal (seed)
│   └── gallery.ts                # Helper galeri foto per unit
│
├── features/
│   ├── landing/                  # SITUS PUBLIK (customer)
│   │   ├── PublicLayout.tsx      # Navbar + footer bersama
│   │   ├── PublicHeader.tsx      # Header band konsisten (eyebrow/title/breadcrumb)
│   │   ├── publicNav.ts          # Konfigurasi menu publik + URL WhatsApp
│   │   ├── LandingPage.tsx       # Beranda (hero, keunggulan, cara kerja, unggulan, testimoni, CTA)
│   │   ├── KatalogPage.tsx       # Katalog + filter sidebar (kanan) + sort + search
│   │   ├── KatalogDetailPage.tsx # Detail mobil (galeri, spesifikasi, CTA, unit serupa)
│   │   ├── SimulasiPage.tsx      # Kalkulator simulasi kredit interaktif
│   │   ├── TentangPage.tsx       # Tentang (cerita, visi-misi, nilai)
│   │   └── KontakPage.tsx        # Kontak (info, peta, form)
│   │
│   ├── auth/LoginPage.tsx        # Halaman login (demo, akses via URL /login)
│   │
│   ├── dashboard/                # Dashboard admin
│   │   ├── DashboardPage.tsx
│   │   └── components/           # StatCard, SalesChart, RecentActivity, PipelineFunnel, RekondisiList, BottomStats
│   │
│   ├── units/                    # Modal & hook CRUD unit (dipakai lintas modul stok)
│   │   ├── UnitFormModal.tsx
│   │   ├── UnitDetailModal.tsx
│   │   └── useUnitModals.tsx
│   │
│   ├── inventory/  pembelian/  rekondisi/  ready-stock/   # Modul berbasis unit
│   ├── crm/        test-drive/ penjualan/ pembayaran/      # Modul dengan form + detail + hapus
│   ├── laporan/    pengaturan/                             # Laporan & pengaturan
│
├── shared/
│   ├── components/ui/            # UI kit reusable
│   │   ├── Modal.tsx  ConfirmDialog.tsx  DetailModal.tsx
│   │   ├── Button.tsx Field.tsx  Tooltip.tsx
│   │   ├── SectionCard.tsx PageHeader.tsx DataTable.tsx RowActions.tsx
│   │   ├── StatusBadge.tsx UnitCard.tsx
│   ├── constants/index.ts        # Identitas app (GM Mobilindo) + user demo
│   └── layout/                   # Shell admin (Sidebar, Header, MainLayout, Logo, QuickInput, menu)
│
├── routes/                       # File-based routing (_public, _admin, login)
├── main.tsx  index.css  routeTree.gen.ts
```

## 🧩 Fitur Utama

### Situs Publik (Customer)

- **Beranda** — hero, alasan memilih (why-us), cara kerja 4 langkah, unit unggulan, testimoni, CTA.
- **Katalog** — pencarian, **sort**, dan **filter sidebar (kanan)**: merek, rentang harga, transmisi, bahan bakar; chip filter aktif yang bisa dihapus; di mobile filter jadi drawer.
- **Detail Mobil** — galeri foto (thumbnail), spesifikasi lengkap, estimasi cicilan, deskripsi, CTA WhatsApp/simulasi, unit serupa.
- **Simulasi Kredit** — kalkulator interaktif (pilih unit, slider DP & bunga, pilih tenor) → estimasi cicilan real-time.
- **Tentang & Kontak** — profil showroom, visi-misi, nilai; info kontak, peta, form pesan.

### Panel Admin

- **Dashboard** — kartu statistik, Ready Stock (scroll), grafik penjualan, pipeline, unit rekondisi, aktivitas, ringkasan.
- **CRUD penuh** untuk unit, lead, test drive, penjualan, pembayaran — lengkap dengan **modal tambah/edit**, **modal detail**, dan **konfirmasi hapus**. Semua perubahan tersimpan di Redux store (reaktif lintas halaman).
- **Quick Input** — tombol aksi cepat di sidebar untuk membuat data baru tanpa berpindah halaman.

## 🏗️ State & Data (mode dummy)

- Data awal di [`src/data/mock.ts`](src/data/mock.ts) → di-seed ke `dataSlice`.
- Komponen membaca via `useAppSelector`, mengubah via action `dataSlice` (`addUnit`, `updateLead`, `removeSale`, dst).
- **Migrasi ke API nanti:** ganti pembacaan store dengan hook TanStack Query (provider sudah tersedia), dan ganti action dummy dengan mutation. Untuk autentikasi, aktifkan field di `LoginPage` dan tambahkan guard `beforeLoad` di route `_admin`.

## 🚀 Menjalankan

```bash
npm install      # install dependencies
npm run dev      # development server (Vite)
npm run build    # build production (tsc + vite build)
npm run lint     # eslint
npm run preview  # preview hasil build
```

Buka `/` untuk situs customer, atau `/login` → **Login** untuk masuk dashboard admin.

## 📐 Konvensi

- **Komponen:** PascalCase. **Hook:** prefix `use`.
- **UI kit** reusable di `shared/components/ui/`; **shell admin** di `shared/layout/`; **situs publik** di `features/landing/`.
- **Warna** selalu lewat token Tailwind (`primary`, `ink`, `muted`, `accent-*`) — hindari hex hardcoded.
- **Animasi** halus & secukupnya (`animate-float-up`, `stagger`, `animate-modal-in`) dan menghormati `prefers-reduced-motion`.
