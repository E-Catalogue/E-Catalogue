# PRD — Standar Tabel Admin (DataTable)

**Berlaku untuk:** Semua halaman admin yang menampilkan daftar data  
**Referensi implementasi:** `InventoryPage`, `RekondisiPage`, `CrmPage`, `PenjualanPage`, `KatalogPage`

---

## 1. Struktur Wajib

Setiap halaman tabel mengikuti struktur ini secara berurutan:

```
PageHeader (judul + deskripsi + action button)
  ↓
[Opsional] Info/Alert Banner (jika ada alur penting yang perlu dijelaskan)
  ↓
Toolbar (tab filter status + search bar + tombol filter lanjutan)
  ↓
SectionCard → DataTable<T>
  ↓
[Opsional] Pagination (jika data > 1 halaman)
```

---

## 2. Komponen Wrapper

### SectionCard
Selalu gunakan `SectionCard` sebagai pembungkus tabel. Gunakan `bodyClassName="p-0 md:p-0"` agar tabel menyentuh tepi card tanpa padding ekstra.

```tsx
<SectionCard
  title={`Daftar Data (${rows.length})`}
  icon={<IconName size={16} />}
  bodyClassName="p-0 md:p-0"
>
  <DataTable ... />
</SectionCard>
```

### DataTable
Gunakan komponen `DataTable<T>` dari `@/shared/components/ui/DataTable`. Jangan buat tabel `<table>` manual.

```tsx
<DataTable<Entity>
  columns={columns}
  data={rows}
  rowKey={(row) => row.id}
/>
```

---

## 3. Definisi Kolom (Column<T>[])

### Urutan kolom standar
1. **Identitas utama** — nama/judul/plat nomor (align left, lebar fleksibel)
2. **Atribut pendukung** — tahun, tanggal, status, transmisi (align sesuai konteks)
3. **Nilai numerik** — harga, jumlah, qty (align right, `font-bold`)
4. **Status** — badge (align center)
5. **Kolom aksi** — `ActionMenu` (align right, header kosong `''`)

### Aturan per jenis kolom

| Jenis | Alignment | Style |
|-------|-----------|-------|
| Teks identitas (nama, merek, plat) | left | `font-bold text-ink text-[13px]` + subtitle `text-[11px] text-muted font-medium` |
| Tanggal/tahun | right | `font-bold text-ink text-[13px]` |
| Harga/angka | right | `font-bold text-ink text-[13px]` atau `text-primary` untuk harga jual |
| Status badge | center | `<StatusBadge status={row.status} />` |
| Transmisi / tipe pendek | center | badge chip `px-2.5 py-1 rounded-lg text-[11px] font-bold` |
| Foto / count | center | ikon + angka, `text-[11px] font-semibold text-muted` |
| Aksi | right | `<ActionMenu items={[...]} />` |

---

## 4. Aturan Gambar / Foto

**Dilarang keras menampilkan gambar/foto di dalam sel tabel.**

- Gambar hanya boleh dilihat melalui modal detail (action "Lihat Detail")
- Kolom "Foto" hanya boleh menampilkan **jumlah foto** (angka + ikon kamera/gambar)
- Thumbnail di tabel memperlambat render dan merusak keseragaman visual

```tsx
// ✅ Benar
{ header: 'Foto', align: 'center', cell: (u) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
    <ImageIcon size={12} /> {u.unitImages?.length ?? 0}
  </span>
)}

// ❌ Salah
{ header: 'Foto', cell: (u) => (
  <img src={getImageUrl(u)} className="w-20 h-14 rounded-xl object-cover" />
)}
```

---

## 5. Kolom Aksi (Dropdown)

Setiap baris tabel yang memiliki aksi **wajib memakai dropdown**, bukan tombol ikon berjejer. Ada dua cara, keduanya menghasilkan dropdown yang sama:

### Cara A — `RowActions` (default, paling ringkas)
Untuk aksi CRUD standar (lihat/edit/hapus + aksi tambahan). `RowActions` sudah otomatis merender `ActionMenu` di dalamnya, jadi cukup oper callback:

```tsx
import { RowActions } from '@/shared/components/ui/RowActions';

// Kolom aksi:
{ header: '', align: 'right', cell: (r) => (
  <RowActions
    onView={() => openDetail(r)}
    onEdit={() => openEdit(r)}
    onDelete={() => openDelete(r)}
    extra={[{ label: 'Ubah Status', icon: <RefreshCw size={13} />, onClick: () => setStatus(r) }]}
  />
) }
```

`RowActions` otomatis menyusun urutan: **Lihat Detail (primary) → Edit → aksi tambahan → [divider] → Hapus (danger)**. Aksi destruktif selalu paling bawah setelah pemisah.

### Cara B — `ActionMenu` langsung (untuk urutan/label khusus)
Bila butuh kontrol penuh atas urutan, label, atau variant per item:

```tsx
import { ActionMenu } from '@/shared/components/ui/ActionMenu';

<ActionMenu items={[
  { icon: <Wrench size={13} />, label: 'Kelola Rekondisi', onClick: () => kelola(r), variant: 'primary' },
  { icon: <Plus size={13} />, label: 'Buat Rekondisi Baru', onClick: () => buat(r), dividerAfter: true },
  { icon: <Eye size={13} />, label: 'Lihat Detail', onClick: () => detail(r) },
]} />
```

**Aturan dropdown:**
- Maksimal 5 item per menu
- Item `variant: 'danger'` selalu paling bawah, setelah `dividerAfter: true`
- Aksi paling sering dipakai diletakkan paling atas
- Aksi yang bergantung permission → cek dengan `usePermissions().can(code)` sebelum memasukkan item (jangan bungkus `<Can>` di dalam sel)

---

## 5b. Kontrol Interaktif di Dalam Sel

**Dilarang menaruh toggle/switch, atau tombol aksi mengambang di dalam sel data.** Status yang bisa diubah cukup ditampilkan sebagai **badge** (read-only); aksi untuk mengubahnya diletakkan di dropdown aksi.

```tsx
// ✅ Benar — badge read-only + aksi di dropdown
{ header: 'Tayang', align: 'center', cell: (u) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
    isPub ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'
  }`}>
    {isPub ? <Eye size={12} /> : <EyeOff size={12} />} {isPub ? 'Tayang' : 'Hidden'}
  </span>
)}
// action "Tampilkan/Sembunyikan" ada di <ActionMenu>

// ❌ Salah — toggle switch di dalam sel
{ header: 'Tayang', cell: (u) => <button onClick={toggle} className="...switch..." /> }
```

---

## 6. Toolbar (Filter & Search)

### Search bar
Selalu sediakan search bar untuk halaman dengan data > 20 item.

```tsx
<div className="relative">
  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Cari..."
    className="w-full sm:w-64 h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
  />
</div>
```

### Tab filter status
Untuk data dengan enum status (ACTIVE/INACTIVE, SOLD/AVAILABLE, dsb.), gunakan tab chip:

```tsx
<button onClick={() => setTab(key)} className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all ${
  active ? 'bg-primary text-white shadow-glow' : 'bg-surface border border-border text-ink-soft hover:border-primary'
}`}>
  {label}
  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
    active ? 'bg-white/20 text-white' : 'bg-surface-soft text-muted'
  }`}>{count}</span>
</button>
```

### Filter lanjutan
Gunakan **Modal** (bukan popover/dropdown) untuk filter lanjutan dengan banyak input.  
Pattern: draft state → terapkan saat klik "Terapkan" → tidak langsung filter saat mengetik.

```tsx
// ✅ Benar — FilterModal dengan draft state
const FilterModal = ({ open, onClose, value, onApply }) => {
  const [draft, setDraft] = useState(value);
  // ... inputs pakai draft state
  // Footer: Batal | Reset | Terapkan
}

// ❌ Salah — filter langsung terapkan tanpa konfirmasi (menyebabkan "bablas")
```

---

## 7. State Loading / Error / Kosong

Setiap tabel wajib menangani 3 state:

```tsx
{isLoading ? (
  <div className="flex items-center justify-center py-16 text-muted gap-2">
    <Loader2 size={22} className="animate-spin" />
  </div>
) : isError ? (
  <div className="text-center py-16 text-muted font-semibold text-sm">
    Gagal memuat data.
  </div>
) : rows.length === 0 ? (
  <div className="text-center py-16">
    <IconName size={32} className="text-muted mx-auto mb-3" />
    <p className="font-bold text-ink text-[14px]">Tidak ada data ditemukan.</p>
    <p className="text-muted text-[12px] font-medium mt-1">Pesan kontekstual sesuai kondisi.</p>
  </div>
) : (
  <DataTable ... />
)}
```

---

## 8. Format Nilai

Gunakan fungsi dari `@/core/utils/format`:

| Tipe | Fungsi | Output contoh |
|------|--------|---------------|
| Harga penuh | `formatCurrency(n)` | `Rp 150.000.000` |
| Harga ringkas | `formatCurrency(n, { compact: true })` | `Rp 150 Jt` |
| Angka biasa | `formatNumber(n)` | `125.000` |
| Kilometer | `formatKm(n)` | `125.000 KM` |
| Tanggal | `formatDate(str)` | `15 Jun 2024` |

Nilai `null` atau `undefined` selalu tampilkan sebagai `—` (em dash), bukan kosong atau `0`.

---

## 9. Checklist Sebelum Deploy

- [ ] Tidak ada `<img>` di dalam sel tabel
- [ ] Semua aksi menggunakan `<ActionMenu>` bukan tombol inline
- [ ] Wrapper menggunakan `SectionCard` dengan `bodyClassName="p-0 md:p-0"`
- [ ] Tabel menggunakan komponen `DataTable<T>`
- [ ] State loading / error / kosong tersedia
- [ ] Search bar menggunakan `useDebouncedValue` (delay 400ms)
- [ ] Filter lanjutan menggunakan Modal, bukan popover
- [ ] Nilai null ditampilkan sebagai `—`
- [ ] Kolom harga align right dengan `font-bold text-ink`
- [ ] Kolom aksi align right, header kosong `''`
