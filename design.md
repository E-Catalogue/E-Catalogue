# E-Catalogue - Design & UI Standards

File ini menjadi sumber kebenaran (Source of Truth) untuk gaya visual, penamaan warna, dan aturan UI di seluruh aplikasi, demi menjaga konsistensi (*pixel-perfect*) dengan *mockup* dan citra *brand*.

## 1. Skema Warna (Color Palette)
Warna-warna ini dikonfigurasi di `tailwind.config.js` dan `src/index.css`.

| Token | Hex | Keterangan |
|---|---|---|
| `primary` | `#D97757` | Aksen utama (tombol, indikator, judul grup aktif) |
| `primary-dark` | `#BE5D3D` | Hover tombol utama |
| `primary-light` | `#FBEDE6` | Latar item aktif (non-nested) |
| `ink` | `#181D2A` | Teks utama |
| `ink-soft` | `#3A4151` | Teks sekunder |
| `muted` | `#7A8194` | Label, placeholder |
| `background` | `#F4F5F8` | Warna kanvas |
| `surface` | `#FFFFFF` | Warna kartu |
| `surface-soft` | `#F8F9FB` | Hover baris tabel |
| `border` | `#EAECF1` | Garis tepi kartu |
| `divider` | `#EEF0F4` | Garis pemisah internal |
| `accent-green` | `#16A34A` | Success |
| `accent-amber` | `#F59E0B` | Warning |
| `accent-blue` | `#2563EB` | Info |
| `semantic-error` | `#E11933` | Danger / Error |

## 2. Status Badge
Badge status harus selalu mengadopsi konsep **Soft Badge** agar jelas terlihat namun tetap elegan.

```
Background  : bg-[warna]/15     → Transparansi 15%
Text        : text-[warna]       → Warna murni dari token
Border      : border-[warna]/30  → Garis tepi sangat tipis  
Border-Radius: rounded-lg
Font        : text-[10px] font-bold uppercase tracking-wide
```

**Contoh pemakaian:**
```tsx
<StatusBadge status="ACTIVE" />       → Hijau soft
<StatusBadge status="INACTIVE" />     → Abu-abu soft
<StatusBadge status="TRIAL" />        → Biru soft
<StatusBadge status="SUSPENDED" />    → Merah soft
```

**Contoh inline badge custom:**
```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
  <Shield size={10} /> System
</span>
```

## 3. Sidebar (Navigasi Kiri)
Sidebar dirancang untuk mudah dinavigasi dengan kondisi aktif yang jelas.

Menu **dibangun dinamis** dari `GET /auth/me/menu` (lihat PRD). Bentuknya dua level: item level-atas
bisa `MENU_GROUP` (punya `children`) atau `MENU` tunggal (langsung punya `path`, mis. Dashboard).
Helper bentuknya ada di `src/shared/layout/menu.ts` (`isGroup`, `childrenOf`, `flattenMenus`).

| Elemen | Keterangan |
|---|---|
| **Tombol Collapse** | `PanelLeftClose` / `PanelLeftOpen`, diletakkan di dalam area brand (atas, sebelah logo). |
| **Menu Group Aktif** | Judul grup `text-primary` + batang vertikal `w-[3px] h-5 rounded-r-md bg-primary` di `-left-3`. Berlaku selama salah satu child-nya aktif, baik grup terbuka maupun tertutup (jadi posisi aktif tidak pernah "hilang" saat grup ditutup). Judul grup memakai ikon sendiri. |
| **Sub-Menu / Item Nested Aktif** | Solid primary: `bg-primary text-white shadow-sm shadow-primary/20`, `rounded-xl`. |
| **Item Tunggal (Non-Nested) Aktif** | Soft primary: `bg-primary-light text-primary` + batang vertikal di `-left-3`. |
| **Hover State** | `hover:bg-surface-soft hover:text-ink`. |
| **Mini Mode (Collapsed)** | Lebar `w-[4.5rem]`. Judul grup diganti **ikon grup** (ikut `text-primary` bila salah satu child aktif); sub-menu tetap tampil sebagai ikon. Semua ikon memakai `Tooltip` di sisi kanan. |

**Tinggi & scroll:** sidebar `sticky top-0 h-screen` — setinggi viewport dan menempel. Brand (atas)
dan versi (bawah) **tidak ikut scroll**; hanya `<nav>` yang punya scroll internal (`overflow-y-auto`).

**Perilaku grup (accordion):**

- Default **tertutup semua**. Yang terbuka hanya grup yang berisi halaman aktif.
- **Single-open**: membuka grup B otomatis menutup grup A. Berpindah dari sub-menu grup A ke
  sub-menu grup B membuat grup A menutup sendiri.
- State grup **diturunkan dari route**, bukan disimpan lewat `useEffect`. Klik manual user hanya
  berlaku untuk pathname saat itu (`override` ber-key pathname); begitu pindah halaman, override
  kedaluwarsa dan grup kembali mengikuti halaman aktif.

**Kondisi aktif** memakai `isMenuActive`: Dashboard (`/`) dicocokkan **persis**; menu lain juga aktif
untuk halaman turunannya (mis. `/customers/123` menyalakan menu *Customers*).

**Animasi (framer-motion):**

| Elemen | Cara |
|---|---|
| **Penanda aktif** | Latar aktif dipisah jadi layer ber-`layoutId` — `nav-pill` (sub-menu, solid primary) dan `nav-bar` (item tunggal & judul grup). Karena ber-`layoutId`, penanda **meluncur** dari menu sebelumnya, bukan muncul-hilang. Ikon & teks dinaikkan `relative z-10` agar tetap di atas layer. |
| **Buka/tutup grup** | `AnimatePresence` + `motion.div` `height: 0 ↔ auto` dengan `overflow-hidden`. |
| **Chevron** | `motion.span` `rotate: 0 ↔ -90`. |
| **Transition** | Penanda aktif: `spring` (stiffness 520, damping 40). Collapse & chevron: `0.24s` `cubic-bezier(0.22, 1, 0.36, 1)`. |

Seluruhnya menghormati `useReducedMotion` → durasi 0 bila user memilih *reduce motion*.

> Pencarian menu **tidak** diletakkan di sidebar, melainkan di tengah header sebagai command palette
> (`MenuSearchModal`, dibuka lewat ⌘K / Ctrl+K). Logout lewat dropdown profil + `ConfirmDialog`.

## 4. DataTable & Interaksi
Lihat `DATATABLE_STANDARDS.md` untuk implementasi teknis. Secara desain:

| Elemen | Style |
|---|---|
| **Wrapper** | `bg-surface border border-border rounded-2xl shadow-sm` |
| **Header tabel** | `text-[10px] font-bold uppercase tracking-wide text-muted` |
| **Baris data** | `text-[12px] font-semibold text-ink-soft`, hover `bg-surface-soft/50` |
| **Toolbar (Search + Limit)** | Di atas tabel, `bg-surface-soft/50`, search `rounded-xl h-10` |
| **Pagination** | Di bawah tabel, prev/next dengan `rounded-lg border` |
| **Empty State** | Teks `text-sm font-medium text-muted`, di-*center* dengan `py-12` |

## 4b. List Card Collapse (alternatif DataTable)

Dipakai saat satu baris punya **isi bertingkat** yang perlu diedit langsung (mis. Menu & Permission:
satu modul berisi banyak permission, satu group berisi banyak sub-menu). Tabel tidak cocok untuk ini
karena isi anaknya bukan sekadar kolom.

| Elemen | Style |
|---|---|
| **Kartu** | `bg-surface border border-border rounded-2xl shadow-sm overflow-hidden`, antar-kartu `space-y-3` |
| **Header kartu** | Tombol `aria-expanded`, berisi chevron (`ChevronRight`, `rotate-90` saat terbuka), ikon modul, nama + `code` mono, badge tipe, ringkasan (jumlah izin / sub-menu), `StatusBadge`, lalu `RowActions` |
| **Ikon modul** | Group → `bg-primary/10 text-primary`; Menu → `bg-accent-blue/10 text-accent-blue`, `w-10 h-10 rounded-xl` |
| **Isi collapse** | `border-t border-divider bg-surface-soft/50 p-4` |
| **Kartu anak (sub-menu)** | Kartu yang sama, di-render rekursif di dalam isi collapse group |

**Radio "Aktifkan semua permission":** tiap modul punya dua mode yang saling meniadakan —
`ALL` (semua permission aktif; checkbox individual dikunci) dan `CUSTOM` (aktifkan satu per satu).
Karena mutually exclusive, kontrolnya memakai **radio**, bukan checkbox.

```tsx
<input type="radio" name={`perm-mode-${menu.id}`} className="accent-primary" />
```

## 5. Typography Scale
| Size | Penggunaan |
|---|---|
| `text-[8px]` | Sub-tagline sidebar |
| `text-[10px]` | Label, badge, header tabel, versi |
| `text-[11px]` | Sub-teks, kode mono |
| `text-[12px]` | Body tabel, tombol aksi |
| `text-[13px]` | Item sidebar, input, teks card |
| `text-sm` / `text-base` | Judul modal, deskripsi |
| `text-xl md:text-2xl` | Judul halaman (PageHeader) |

## 6. Tombol (Button)
Gunakan komponen `<Button>` dari `src/shared/components/ui/Button.tsx`.

| Variant | Penampilan |
|---|---|
| `primary` | `bg-primary text-white shadow-glow` |
| `secondary` | `bg-surface border text-ink-soft` |
| `danger` | `bg-semantic-error text-white` |
| `ghost` | `text-muted hover:text-primary` |

## 7. Modal & Form
- **Modal**: Gunakan `<Modal>` dengan props `icon`, `title`, `subtitle`, `footer`.
- **Form Field**: Gunakan `<TextField>`, `<SelectField>`, `<NumericField>` dari `Field.tsx`.
- **Grid**: Susun form dengan `grid grid-cols-1 sm:grid-cols-2 gap-4`.

**Props Field yang tersedia:**

| Prop | Fungsi |
|---|---|
| `helperText` | Teks bantuan `text-[11px] text-muted` di bawah input (mis. "Subdomain bersifat permanen"). |
| `error` | Pesan validasi; menimpa `helperText`, mewarnai teks + border `semantic-error`, memasang `aria-invalid`. |
| `disabled` | `bg-surface-soft text-muted cursor-not-allowed` — tetap terbaca, jelas tidak bisa diubah. |

**State form:** inisialisasi dari props lalu **remount lewat `key`** (lihat `TenantProfilePage`,
`PlatformMenuListPage`). Jangan menyinkronkan state form lewat `useEffect` — lint menolaknya
(`setState` di dalam effect memicu render berantai).

Setiap desainer atau *developer* AI/Manusia harus merujuk pada standar ini sebelum mengubah kelas CSS dasar.
