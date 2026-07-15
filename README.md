# 🏢 E-Catalogue — Tenant Management

Panel administrasi internal untuk **mengelola tenant** (showroom mobil yang berlangganan): modul yang boleh mereka akses, hak akses (permission) di tiap modul, dan identitas aplikasi masing-masing.

> **Status: UI jalan, data masih lokal.**
>
> - ✅ Kerangka: routing, store, API layer (interceptor + auto-refresh), UI kit.
> - ✅ Halaman: Login, Dashboard, Tenant (+ modal Modul & Permission), CMS Tenant.
> - 🟡 **Belum ada konsumsi API** — endpoint e-catalogue belum tersedia. Data tenant memakai
>   seed di [`tenantSlice.ts`](src/app/store/tenantSlice.ts) (Redux), dan login belum diverifikasi.

## 🧩 Cakupan

Tiga hal yang diatur per tenant:

1. **Tenant** — profil showroom: nama aplikasi, nama perusahaan, pemilik, kota, dan status
   (Aktif / Trial / Ditangguhkan / Nonaktif).
2. **Modul & Permission** — modul apa saja yang boleh dipakai showroom itu (Inventory, CRM,
   Test Drive, Penjualan, Pembayaran, Cashflow, Laporan, CMS), lalu hak aksesnya per modul:
   **Lihat · Tambah · Ubah · Hapus**. Diatur lewat **modal besar** dari aksi baris di halaman
   Tenant ([`TenantAccessModal`](src/features/tenant/TenantAccessModal.tsx)) — bukan halaman
   terpisah, supaya tetap satu konteks dengan tenant yang sedang dilihat.
   Katalognya di [`tenant.catalog.ts`](src/features/tenant/tenant.catalog.ts).
   Kode permission berformat `MODUL.AKSI`, mis. `INVENTORY.CREATE`.
3. **CMS Tenant** — identitas showroom: **nama aplikasi**, **nama perusahaan**, tagline,
   **logo besar** (sidebar terbuka & halaman login) dan **logo kecil** (sidebar tertutup & favicon).

> Menonaktifkan sebuah modul otomatis mencabut seluruh permission modul itu — supaya tidak ada
> hak akses yatim yang menunjuk ke modul mati.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/) (token warna via CSS variables)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest) (file-based & type-safe)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Server State:** [TanStack Query](https://tanstack.com/query/latest) (provider sudah terpasang)
- **HTTP:** [Axios](https://axios-http.com/) + interceptor terpusat
- **Icons:** [lucide-react](https://lucide.dev/) · **Font:** Plus Jakarta Sans

## 🗺️ Routing

| Rute         | Layout     | Keterangan                                   |
| ------------ | ---------- | -------------------------------------------- |
| `/`          | standalone | **Halaman login** — route utama aplikasi     |
| `/dashboard` | `_admin`   | Ringkasan tenant + pemakaian modul           |
| `/tenant`    | `_admin`   | CRUD showroom + modul & permission (modal)   |
| `/cms`       | `_admin`   | Identitas & logo tiap tenant                 |
| lainnya      | —          | 404 (`NotFound`)                             |

Login berada di **root (`/`)** — tidak ada `/login`. Setelah keluar, user dikembalikan ke `/`
(interceptor juga mengarah ke sana saat sesi berakhir).

Sidebar ([`Sidebar.tsx`](src/shared/layout/Sidebar.tsx)):

- **Menu ber-grup & bisa di-collapse** — **Dashboard**, lalu grup **Tenant Management**
  (*Tenant*, *CMS*). Judul grup punya ikon sendiri; klik untuk menutup/membukanya. Menu aktif
  ditandai batang oranye + latar `primary-light`. Bila grup ditutup padahal berisi halaman aktif,
  judul grup ikut menyala — supaya posisi aktif tidak hilang.
- **Saat mini**, hierarki tetap berlaku: judul grup jadi ikon grup (ikut menyala bila salah satu
  sub-menunya aktif), sub-menu tetap tampil sebagai ikon ber-tooltip, dan item aktif ditandai
  batang oranye yang menempel di tepi sidebar.
- **Tombol perbesar/perkecil di atas** (sebelah brand). Saat mini: logo kecil, ikon saja + tooltip.
  Pilihannya diingat di localStorage (`master_sidebar_collapsed`).
- **Profil** di kanan header berupa dropdown ([`ProfileMenu`](src/shared/layout/ProfileMenu.tsx)):
  klik nama/avatar → **Profil** dan **Keluar**. Keluar memunculkan modal konfirmasi (`ConfirmDialog`).

**Pencarian menu** ada di **tengah header**: tombol bergaya input yang membuka command
palette [`MenuSearchModal`](src/shared/components/ui/MenuSearchModal.tsx). Bisa dibuka dengan
**⌘K / Ctrl+K**, navigasi dengan ↑/↓, buka dengan Enter, tutup dengan Esc.

`_admin` adalah **pathless layout route** (sidebar + header) — prefix-nya tidak muncul di URL.
`routeTree.gen.ts` di-generate otomatis oleh plugin TanStack Router — jangan diedit manual.

> ⚠️ Guard auth di [`_admin.tsx`](src/routes/_admin.tsx) **belum dipasang** (lihat `TODO(auth)`):
> login belum menghasilkan token, jadi guard hanya akan mengunci dashboard. Pasang begitu API siap.

## 🔌 API Layer (siap, belum dipakai)

Kerangka HTTP lengkap di [`src/core/api/`](src/core/api/), tetapi **belum ada satu pun pemanggilan endpoint**.

- **Base URL** dari env `VITE_API_BASE_URL` (lihat `.env.example`). Boleh menyertakan `/api/v1` atau tidak — [`client.ts`](src/core/api/client.ts) menormalkannya.
- **Satu pintu (interceptor)** di [`interceptor.ts`](src/core/api/interceptor.ts):
  - Request → lampirkan `Authorization: Bearer <accessToken>`.
  - Response 401 pada endpoint terproteksi → **auto-refresh token** (rotation + antrean request); bila gagal → clear sesi + redirect ke `/` (login).
  - Error infrastruktur (network/timeout/5xx/parsing) → **GlobalErrorModal**; error bisnis 4xx diteruskan ke pemanggil.
- **Helper**: `getApiErrorCode` / `getApiErrorMessage` / `getFieldErrors` ([`apiError.ts`](src/core/api/apiError.ts)) dan `notifyApiError` ([`notify.ts`](src/core/api/notify.ts)).
- **Token** di localStorage (`master_access_token` / `master_refresh_token`) — [`token.ts`](src/core/api/token.ts).

### Yang perlu dilakukan saat API siap

1. Buat `src/features/auth/auth.api.ts` (`login`, `me`, `logout`).
2. Ganti blok `TODO(auth)` di [`LoginPage.tsx`](src/features/auth/LoginPage.tsx) dengan `authApi.login` → `dispatch(setCredentials(payload))`.
3. Pasang `AuthBootstrap` (hidrasi sesi via `GET /auth/me`) di [`app/providers/index.tsx`](src/app/providers/index.tsx), dan aktifkan guard di `_admin.tsx`.
4. Ganti `tenantSlice` (seed lokal) dengan service + React Query hooks — provider Query sudah terpasang.
5. Unggah logo: [`LogoField`](src/features/cms/LogoField.tsx) sementara menyimpan data URL di klien; arahkan ke endpoint media begitu tersedia.

## 📂 Struktur Folder

```text
src/
├── app/
│   ├── providers/index.tsx    # Redux + React Query provider + GlobalErrorModal
│   ├── router/index.tsx       # Instance TanStack Router
│   ├── queryClient.ts         # Singleton QueryClient
│   └── store/
│       ├── index.tsx          # Store + typed hooks (useAppSelector/useAppDispatch)
│       ├── authSlice.ts       # Sesi: user, permissionCodes, groupMenus
│       ├── tenantSlice.ts     # Tenant + modul + permission + identitas (seed lokal)
│       └── uiSlice.tsx        # State UI global (modal error)
│
├── core/
│   ├── api/                   # client, interceptor, token, errorHandler, apiError, notify, types
│   └── utils/format.ts        # Helper format (Rupiah, angka, tanggal)
│
├── features/
│   ├── auth/                  # LoginPage, types, usePermissions, permissions (Can/RequirePermission)
│   ├── dashboard/             # DashboardPage
│   ├── tenant/                # TenantPage, TenantFormModal, TenantAccessModal,
│   │                          #   TenantPicker, types, catalog
│   └── cms/                   # CmsPage, LogoField (identitas & logo tenant)
│
├── shared/
│   ├── layout/                # MainLayout, Sidebar (bisa dilipat), Header, menu (ber-grup)
│   ├── components/
│   │   ├── NotFound.tsx       # 404 global
│   │   └── ui/                # UI kit reusable: Button, Modal, ConfirmDialog, DetailModal,
│   │                          #   DataTable, Field, PageHeader, Pagination, RowActions,
│   │                          #   SectionCard, Skeleton, StatusBadge, Tooltip, ActionMenu,
│   │                          #   MenuSearchModal (⌘K), GlobalErrorModal
│   └── constants/index.ts     # Identitas app (APP_NAME, APP_TAGLINE, APP_VERSION)
│
├── routes/                    # File-based: __root, index (redirect), login, _admin/*
└── main.tsx  index.css  routeTree.gen.ts
```

Pola per fitur (dipakai kembali saat menambah modul):

```text
features/<nama>/
├── <Nama>Page.tsx      # Halaman
├── <nama>.api.ts       # Service (axios)
├── <nama>.hooks.ts     # React Query hooks
└── types.ts            # Tipe domain
```

> ⚠️ `GlobalErrorModal` adalah modal **blocking** — pakai hanya untuk error. Untuk konfirmasi aksi
> rutin (mis. simpan), pakai feedback inline seperti di `CmsPage`, jangan modal.

## 🎨 Tema

Warna utama **"Claude Orange"** (`#D97757`) dipadukan netral elegan (charcoal `#181D2A`, abu, putih) + palet aksen (biru/hijau/ungu/amber) untuk kartu statistik. Token didefinisikan sebagai CSS variables di [`src/index.css`](src/index.css) dan dipetakan di [`tailwind.config.js`](tailwind.config.js).

Aplikasi memakai **tema terang saja** — tidak ada mode gelap / ikut-perangkat.

## 🚀 Menjalankan

```bash
npm install      # install dependencies
npm run dev      # development server (Vite)
npm run build    # build production (tsc + vite build)
npm run lint     # eslint
npm run preview  # preview hasil build
```

Buka `/` — langsung halaman login. Tombol **Login** masuk ke dashboard
(kredensial belum diverifikasi karena API belum ada).

## 📐 Konvensi

- **Komponen:** PascalCase. **Hook:** prefix `use`. **Import** memakai alias `@/` → `src/`.
- **UI kit** reusable di `shared/components/ui/`; kode domain di `features/<nama>/`.
- **Warna** selalu lewat token Tailwind (`primary`, `ink`, `muted`, `accent-*`) — hindari hex hardcoded.
- **Error API** lewat satu pintu (interceptor + `notifyApiError`), jangan `alert()` sendiri.
- **Form**: state di-init dari props + remount lewat `key` (lihat `TenantFormModal`, `CmsPage`) —
  jangan menyinkronkan state lewat `useEffect`.
- **Animasi** halus & secukupnya (`animate-float-up`, `stagger`, `animate-modal-in`), menghormati `prefers-reduced-motion`.
