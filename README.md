## 🚀 Tech Stack Utama

Proyek ini dibangun menggunakan teknologi :

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest) (File-based & Type-safe routing)
- **Data Fetching & Server State:** [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Client State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **HTTP Client:** [Axios](https://axios-http.com/) (Centralized 1-Pintu & Interceptors)
- **Schema Validation:** [Zod](https://zod.dev/)

## 📂 Struktur Folder (Arsitektur)

```text
src/
├── app/                  # Inisialisasi layer aplikasi paling luar
│   ├── providers/
│   │   └── index.tsx     # Redux Provider, QueryClientProvider, dll
│   ├── router/
│   │   └── index.tsx     # Konfigurasi TanStack Router & Route Tree
│   └── store/            # Setup Redux store & global slices
│       ├── authSlice.tsx # State autentikasi (token, user)
│       ├── uiSlice.tsx   # State UI global (modal, sidebar, dll)
│       └── index.tsx     # Setup Redux store & root reducer
│
├── core/                 # Setup fundamental (API 1 pintu ada di sini)
│   ├── api/
│   │   ├── client.tsx    # Inisialisasi Axios instance (Base URL, Timeout)
│   │   ├── interceptor.tsx# Request (Token) & Response (Error handling) global
│   │   ├── errorHandler.ts# Klasifikasi error global (network/timeout/5xx/HTML/CORS)
│   │   └── types.tsx     # Tipe generic seperti BaseResponse<T>, PaginatedResponse<T>
│   ├── config/
│   │   └── index.tsx     # Environment variables validation
│   └── utils/            # Helper global
│       ├── formatCurrency.ts  # Format mata uang (Rupiah)
│       ├── formatDate.ts      # Format tanggal
│       └── resolveImageUrl.ts # Ubah path gambar relatif API jadi URL absolut
│
├── features/             # Layer Fitur Utama (Isolasi Logika & UI per Domain)
│   ├── auth/             # Domain Autentikasi (Login)
│   │   ├── schema.ts     # Zod schema untuk validasi request/response
│   │   ├── api/
│   │   │   └── auth.api.ts         # API Autentikasi
│   │   ├── components/
│   │   │   └── LoginForm.tsx       # Form login
│   │   ├── hooks/
│   │   │   └── useAuth.ts          # Hook autentikasi
│   │   └── pages/
│   │       └── LoginPage.tsx       # Halaman login
│   │
│   ├── main/             # SPA : Sidebar, Header, Main Layout
│   │   ├── components/   # UI Komponen utama
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── modals/
│   │   │       └── LogoutModal.tsx # Modal konfirmasi logout
│   │   └── hooks/
│   │       └── useLayout.ts        # Hook untuk layout
│   │
│   ├── order/            # Domain PENJUALAN (Kasir) - Mono Domain
│   │   ├── schema.tsx              # Zod schema untuk validasi
│   │   ├── api/                    # Repository API
│   │   │   ├── product.api.tsx     # API Produk (paginated, kategori, detail)
│   │   │   ├── product.schema.ts   # Zod schema response produk + mapper ke Product
│   │   │   ├── transaction.api.tsx # API Transaksi (create order)
│   │   │   ├── transaction.schema.ts # Zod schema request/response create order
│   │   │   └── customer.api.ts     # API cek member by nomor telepon
│   │   ├── components/             # Komponen POS (Terstruktur per context)
│   │   │   ├── cart/
│   │   │   │   └── CartPanel.tsx               # Panel keranjang
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutItemsList.tsx       # Daftar item checkout
│   │   │   │   ├── CheckoutLayout.tsx          # Layout checkout
│   │   │   │   ├── CheckoutSummary.tsx         # Ringkasan checkout
│   │   │   │   └── CustomerInfoForm.tsx        # Form data pelanggan
│   │   │   ├── layout/
│   │   │   │   └── PosLayout.tsx               # Layout POS utama
│   │   │   ├── modals/
│   │   │   │   ├── AdditionsModal.tsx          # Modal detail produk + kustomisasi (data dari API detail)
│   │   │   │   ├── LoyaltyModal.tsx            # Modal loyalty points
│   │   │   │   ├── PaymentMethodModal.tsx      # Modal metode pembayaran
│   │   │   │   └── PromoModal.tsx              # Modal promosi
│   │   │   ├── payment/
│   │   │   │   ├── PaymentView.tsx             # Tampilan pembayaran
│   │   │   │   └── ThermalReceipt.tsx          # Struk thermal printer
│   │   │   ├── payment-status/
│   │   │   │   └── PaymentSuccessView.tsx      # Tampilan sukses pembayaran
│   │   │   └── product/
│   │   │       ├── CategoryTabs.tsx            # Tab kategori produk
│   │   │       └── ProductCard.tsx            # Kartu produk
│   │   ├── constants/
│   │   │   └── index.tsx                       # Konstanta order
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useProducts.tsx     # Hook React Query: list/kategori/detail produk
│   │   │   ├── useCreateOrder.tsx  # Hook mutation create order (POST /sales/order)
│   │   │   ├── useOrderDetail.tsx  # Hook query detail order (GET /sales/order/{id})
│   │   │   ├── useCancelOrder.tsx  # Hook mutation cancel order (PATCH .../cancel)
│   │   │   ├── useCheckout.tsx     # Hook checkout
│   │   │   ├── useOrderCart.tsx    # Hook keranjang
│   │   │   ├── usePayment.tsx      # Hook pembayaran
│   │   │   └── usePaymentSuccess.tsx # Hook status pembayaran
│   │   ├── utils/
│   │   │   └── orderDetailToCart.ts # Map item OrderDetail (server) -> CartItem (PaymentView/struk)
│   │   └── pages/
│   │       └── PointOfSalePage.tsx # Halaman POS + bagian pembayaran (juga untuk order existing via ?orderId)
│   │
│   ├── dashboard/        # Domain Dashboard (Analytics & Metrics)
│   │   ├── schema.tsx              # Zod schema
│   │   ├── components/             # UI Komponen dashboard
│   │   │   ├── RecentActivity.tsx  # Aktivitas terbaru
│   │   │   ├── SummaryCards.tsx    # Kartu ringkasan
│   │   │   └── TopProductsList.tsx # Daftar produk populer
│   │   ├── hooks/
│   │   │   └── useDashboardMetrics.ts # Hook untuk metrics
│   │   └── pages/
│   │       └── DashboardPage.tsx   # Halaman dashboard
│   │
│   └── tracking/         # Domain Order Tracking (Pelacakan)
│       ├── schema.tsx              # Zod schema
│       ├── api/
│       │   └── tracking.api.ts     # API get all order (GET /sales/order)
│       ├── components/             # UI Tracking
│       │   ├── OrderTrackingCard.tsx    # Kartu tracking
│       │   ├── OrderTrackingList.tsx    # Daftar tracking
│       │   ├── TrackingTabs.tsx         # Tab navigation
│       │   └── modals/
│       │       └── OrderDetailModal.tsx # Modal detail order
│       ├── hooks/
│       │   └── useTracking.ts      # Hook tracking
│       └── pages/
│           └── TrackingPage.tsx    # Halaman tracking
│
├── routes/               # Konfigurasi routes (File-based routing)
│   ├── __root.tsx        # Root route layout
│   ├── dashboard.tsx     # Route dashboard
│   ├── index.tsx         # Route home
│   ├── pos.tsx           # Route POS (mendukung ?orderId= untuk bayar order existing)
│   └── tracking.tsx      # Route tracking
│
├── shared/               # Komponen/UI yang bisa dipakai ulang lintas fitur
│   ├── components/       # Reusable UI Components (Dumb components)
│   │   ├── Alert.tsx              # Komponen alert
│   │   ├── Badge.tsx              # Badge component
│   │   ├── Button.tsx             # Button component
│   │   ├── ConfirmationModal.tsx  # Modal konfirmasi
│   │   ├── GlobalErrorModal.tsx   # Modal error global
│   │   ├── Input.tsx              # Input component
│   │   ├── Modal.tsx              # Modal component
│   │   └── Table.tsx              # Table component
│   ├── constants/        # Nilai statis global
│   │   └── index.ts      # Export konstanta (mis. DEFAULT_PRODUCT_IMAGE)
│   ├── hooks/            # Reusable hooks lintas fitur
│   │   └── useDebounce.ts    # Debounce nilai (mis. input pencarian)
│   ├── utils/           # Helper UI lintas fitur
│   │   └── handleProductImageError.ts # Fallback gambar produk saat gagal dimuat
│   ├── layouts/          # Layout templates
│   │   ├── AuthLayout.tsx    # Layout autentikasi
│   │   └── MainLayout.tsx    # Layout utama
│   └── styles/           # Global styles
│       └── globals.css   # Tailwind globals
│
├── assets/               # Gambar statis, SVG, favicon
│   ├── hero.png          # Gambar hero
│   ├── react.svg         # Logo React
│   └── vite.svg          # Logo Vite
│
├── App.tsx               # Root React component
├── App.css               # Styling App
├── main.tsx              # Entry point React
├── index.css             # Global styles
└── routeTree.gen.ts      # Generated route tree (Auto-generated)
```

### Root Level Configuration Files

```text
/
├── package.json              # Dependencies dan scripts project
├── package-lock.json         # Lockfile dependencies (npm)
├── tsconfig.json             # TypeScript configuration (Base)
├── tsconfig.app.json         # TypeScript configuration untuk app (Extended)
├── tsconfig.node.json        # TypeScript configuration untuk Node (Build tools)
├── vite.config.ts            # Konfigurasi Vite (Build & Dev server)
├── tailwind.config.js        # Konfigurasi Tailwind CSS
├── postcss.config.js         # Konfigurasi PostCSS (untuk Tailwind)
├── eslint.config.js          # Konfigurasi ESLint (Linting)
├── vercel.json               # Konfigurasi deployment Vercel (SPA rewrites)
├── index.html                # HTML entry point
├── README.md                 # Dokumentasi project
├── public/                   # Static files (di-serve langsung)
│   ├── favicon.svg           # Favicon aplikasi
│   ├── icons.svg             # Sprite SVG icons
│   └── images/
│       └── QRIS.png          # Gambar QRIS pembayaran
└── .gitignore                # Git ignore rules
```

## 🏗️ Penjelasan Arsitektur

### App Layer (`src/app/`)

- **Providers**: Setup Redux, React Query, dan global providers
- **Router**: Konfigurasi TanStack Router dengan type-safe routing
- **Store**: Redux store setup dengan slices global

### Core Layer (`src/core/`)

- **API**: Axios client instance dengan base URL dan timeout configuration
- **Interceptor**: Global request/response interceptors untuk token dan error handling
- **Error Handler**: Klasifikasi error terpusat (`classifyAxiosError`) — membedakan timeout, koneksi/CORS, response non-JSON, gateway, dan 5xx
- **Config**: Environment variables validation
- **Utils**: Helper functions global (formatDate, formatCurrency, resolveImageUrl)

#### Token & Error Handling (Interceptor — 1 Pintu)

Semua error response melewati satu pintu di `interceptor.tsx`. Penanganannya dibagi 2:

**A. Otorisasi (401)** — berdasarkan `errorCode` dari body backend:

- **`TOKEN_EXPIRED`** → otomatis hit `POST /auth/refresh` dengan body `{ refreshToken }`,
  lalu request yang gagal di-retry. Request lain yang barengan masuk antrean sampai refresh selesai.
- **`INVALID_TOKEN`** (atau token tidak valid lainnya) → sesi dibersihkan
  (`clearCredentials`), tampilkan modal error, dan redirect ke halaman login.

**B. Error infrastruktur** — diklasifikasikan terpusat di `errorHandler.ts`
(`classifyAxiosError`) lalu ditampilkan lewat `GlobalErrorModal` dengan ikon khusus:

| Tipe          | Kondisi                                                        |
| ------------- | ------------------------------------------------------------- |
| `timeout`     | Request melebihi batas waktu (koneksi lambat)                 |
| `network`     | Tidak ada response — jaringan putus, server mati, atau CORS   |
| `parsing`     | Response bukan JSON (HTML/teks, mis. halaman error gateway)   |
| `maintenance` | 502 / 503 / 504 (gateway down / overload / maintenance)       |
| `server`      | 5xx lain dari aplikasi server                                 |

> Error bisnis 4xx (400/403/404/422 dengan body JSON) **tidak** diambil alih global —
> dibiarkan ditangani komponen/hook React Query. Request yang dibatalkan diabaikan.

### Features Layer (`src/features/`)

Domain-driven architecture, setiap fitur memiliki struktur konsisten:

- **schema.ts**: Zod schema untuk validasi input/output API
- **api/**: API calls (repository pattern) menggunakan Axios
- **hooks/**: Custom hooks menggunakan React Query/TanStack Query
- **components/**: React components untuk feature spesifik
- **pages/**: Page components untuk routing

**Domain Utama:**

1. **Auth**: Login, autentikasi user
2. **Main**: Sidebar, Header, layout utama SPA
3. **Order**: POS system dengan sub-components (cart, checkout, payment, etc.)
4. **Dashboard**: Analytics dan metrics bisnis
5. **Tracking**: Pelacakan status order

### Shared Layer (`src/shared/`)

- **Components**: Reusable UI components (Button, Input, Modal, Table, etc.)
- **Layouts**: Layout templates (AuthLayout, MainLayout)
- **Constants**: Static values global
- **Styles**: Global CSS dan Tailwind configuration

### Routes Layer (`src/routes/`)

File-based routing configuration dengan TanStack Router

- Setiap file `.tsx` di sini adalah sebuah route
- Type-safe route generation dengan `routeTree.gen.ts` (auto-generated)

## 📋 Konvensi Development

### Naming Convention

- **Components**: PascalCase (e.g., `LoginForm.tsx`, `CartPanel.tsx`)
- **Files/Folders**: kebab-case atau camelCase sesuai konteks
- **Hooks**: Prefix `use` (e.g., `useAuth.ts`, `useCheckout.tsx`)
- **API Files**: Suffix `.api.ts` atau `.api.tsx`

### Code Organization

- **Kelompok komponen** berdasarkan functionality (cart/, checkout/, payment/, etc.)
- **Centralized API** di `core/api/` untuk single point of API management
- **Type-safe headers** dan validation menggunakan Zod
- **Global interceptors** untuk token & error handling otomatis

### API Pattern (Repository Pattern)

```
features/[domain]/api/[feature].api.ts
└── Function yang mereturn Promise<Response> menggunakan Axios client
```

#### Endpoint yang sudah di-consume

| Domain  | Method & Path                          | Keterangan                                  |
| ------- | -------------------------------------- | ------------------------------------------- |
| Auth    | `POST /auth/login`                     | Login (email, password)                     |
| Auth    | `POST /auth/refresh`                   | Refresh token (body `{ refreshToken }`)     |
| Auth    | `POST /auth/logout`                    | Logout / blacklist refresh token            |
| Product | `GET /sales/product/paginated`         | List produk (param opsional: `search`, `page`, `limit`, `categoryId`, `categorySubId`) |
| Product | `GET /sales/combobox/category`         | Kategori produk untuk filter/tab            |
| Product | `GET /sales/product/{id}`              | Detail produk + `details` (info) & `options` (addition) untuk modal Detail Product |
| Order   | `POST /sales/order`                    | Buat order/transaksi baru. Dipanggil saat konfirmasi checkout ("Lanjut Bayar") dengan loader anti double-click; `orderNo`/`queueNo` & total dari server |
| Order   | `GET /sales/order`                     | List semua order untuk menu Tracking (filter status & type di client) |
| Order   | `GET /sales/order/{id}`                | Detail order. Di-hit di bagian pembayaran POS (termasuk order PENDING dari tracking via `/pos?orderId=`) & modal detail tracking |
| Order   | `PATCH /sales/order/{id}/cancel`       | Batalkan order (hanya status PENDING) + catatan. Dari layar pembayaran POS & modal detail tracking, via modal konfirmasi |
| Customer| `GET /sales/user/customer?phone=`      | Cek member by nomor telepon (tombol "Cek"). 404 = bukan member; `id` → `customerProfileId` ikut di order |

### State Management

- **Global State (Redux)**: Auth, UI global state
- **Server State (TanStack Query)**: Data dari API dengan caching otomatis
- **Local State (React hooks)**: Component-specific state

## 🚀 Quick Start Development

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Environment**
   - Copy `.env.example` ke `.env.local`
   - Set API Base URL dan environment variables

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```
