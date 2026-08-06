# Standard Datatable E-Catalogue Frontend

Dokumen ini mendefinisikan standar konsisten untuk implementasi **DataTable**, **Pencarian (Search Input)**, **Limit Baris (Show Data Rows)**, dan **Paginasi** pada seluruh modul dan halaman tabel di frontend showroom E-Catalogue.

---

## 1. Komponen Standar UI

Semua tabel data menggunakan komponen reusable yang berada di `@/shared/components/ui/`:

| Komponen | Lokasi File | Fungsi |
| :--- | :--- | :--- |
| **`DataTable`** | `src/shared/components/ui/DataTable.tsx` | Merender table wrapper, thead, tbody, cell alignment, skeleton loading, refreshing indicator, and error state. |
| **`SearchInput`** | `src/shared/components/ui/SearchInput.tsx` | Input pencarian instan (*on key up*) dengan ikon search, tombol reset (*clear* $X$), dan styling seragam. |
| **`Pagination`** | `src/shared/components/ui/Pagination.tsx` | Kontrol paginasi terpadu: **Pojok kiri bawah** info data ("Menampilkan X–Y dari Z data") + dropdown pilihan baris (limit); **Pojok kanan bawah** tombol *Sebelumnya*, nomor halaman bernomor aktif/inaktif dengan warna utama web, dan tombol *Berikutnya*. |
| **`EmptyState`** | `src/shared/components/ui/EmptyState.tsx` | Tampilan state kosong jika tidak ada data atau hasil pencarian nihil. |
| **`TableSkeleton`** | `src/shared/components/ui/Skeleton.tsx` | Skeleton placeholder animasi shimmer saat data sedang dimuat. |

---

## 2. Struktur Standar Layout Datatable

Setiap SectionCard yang berisi tabel data mengikuti susunan UX berikut:

```text
+-----------------------------------------------------------------------------------------------+
|  [Icon] Judul Section / Tabel                             [ SearchInput / Action Buttons ]   |
+-----------------------------------------------------------------------------------------------+
|  Kolom 1             | Kolom 2              | Kolom 3              | Kolom 4 (Align Right)    |
+----------------------+----------------------+----------------------+--------------------------+
|  Data baris 1        | Nilai 1              | Badge Status         | Rp 150.000.000           |
|  Data baris 2        | Nilai 2              | Badge Status         | Rp 220.000.000           |
+-----------------------------------------------------------------------------------------------+
|  [Menampilkan 1–15 dari 48 unit]  Tampilkan: [ 15 baris v ]  [Sebelumnya] [1] [2] [Berikutnya]|
|  <----------------- POJOK KIRI BAWAH ----------------->      <----- POJOK KANAN BAWAH ------->|
+-----------------------------------------------------------------------------------------------+
```

---

## 3. Pola Implementasi di React Component

### A. State yang Dibutuhkan
```tsx
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(15); // Default 10 / 15 / 20 / 25
const [search, setSearch] = useState('');
const debounced = useDebouncedValue(search, 350);
```

### B. Hook Query dengan Limit & Pagination
```tsx
const { data, isLoading, isError, refetch } = useMyData({
  page,
  limit,
  search: debounced || undefined,
  ...otherFilters,
});
```

### C. Markup JSX
```tsx
<SectionCard
  title="Daftar Data"
  icon={<TableIcon size={16} />}
  bodyClassName="p-0 md:p-0"
>
  {isLoading ? (
    <TableSkeleton rows={6} cols={columns.length} />
  ) : rawData.length === 0 ? (
    <EmptyState
      title="Belum ada data"
      description="Data sesuai filter akan muncul di sini."
    />
  ) : (
    <>
      <DataTable
        columns={columns}
        data={rawData}
        rowKey={(row) => row.id}
        error={isError}
        onRetry={() => refetch()}
      />
      <div className="p-4">
        <Pagination
          meta={data?.meta}
          page={page}
          onChange={setPage}
          limit={limit}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          limitOptions={[10, 15, 25, 50, 100]}
          itemLabel="data"
        />
      </div>
    </>
  )}
</SectionCard>
```

---

## 4. Konfigurasi `Pagination` Props

| Prop | Type | Default | Penjelasan |
| :--- | :--- | :--- | :--- |
| `meta` | `ApiMeta` | `undefined` | Objek meta dari backend (`{ page, limit, total, totalPages }`). |
| `page` | `number` | **Wajib** | State halaman aktif saat ini (1-indexed). |
| `onChange` | `(page: number) => void` | **Wajib** | Handler saat tombol navigasi atau nomor halaman diklik. |
| `limit` | `number` | `undefined` | Nilai limit baris aktif saat ini. |
| `onLimitChange` | `(limit: number) => void` | `undefined` | Handler saat user memilih limit baris baru dari dropdown (mereset `page` ke 1). |
| `limitOptions` | `number[]` | `[10, 15, 25, 50, 100]` | Opsi dropdown pilihan baris per halaman. |
| `itemLabel` | `string` | `'data'` | Label unit data (misal `'unit'`, `'order'`, `'lead'`, `'jadwal'`, `'pembayaran'`). |

---

## 5. Halaman yang Telah Menerapkan Standar Ini

1. **Laporan Stok** (`src/features/stock-report/StockReportPage.tsx`)
2. **Laporan Closing** (`src/features/reports/ClosingReportPage.tsx`)
3. **Laporan Pengeluaran** (`src/features/reports/ExpenseReportPage.tsx`)
4. **CRM / Lead** (`src/features/crm/CrmPage.tsx`)
5. **Test Drive** (`src/features/test-drive/TestDrivePage.tsx`)
6. **Penjualan** (`src/features/penjualan/PenjualanPage.tsx`)
7. **Pembayaran** (`src/features/pembayaran/PembayaranPage.tsx`)
