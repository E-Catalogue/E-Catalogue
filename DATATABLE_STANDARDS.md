# Standard DataTable & UI Action Guidelines

Dokumen ini mendeskripsikan standar pembuatan antarmuka tabel (DataTable) seragam beserta cara penanganan aksi baris (*Row Actions*) berbasis *Role-Based Access Control* (RBAC).

## 0. Kapan **tidak** memakai DataTable

DataTable dipakai untuk daftar **datar** (satu baris = satu entitas, kolomnya seragam): Tenant, User,
Role.

Gunakan **List Card Collapse** (lihat `design.md` §4b) bila satu baris punya **isi bertingkat yang
perlu diedit di tempat**, karena isi anaknya bukan sekadar kolom:

| Halaman | Pola | Alasan |
|---|---|---|
| Platform / Tenant / User / Role | `DataTable` | Daftar datar, kolom seragam. |
| **Menu & Permission** (`PlatformMenuListPage`) | **List Card Collapse** | Satu `MENU` berisi banyak permission (dengan radio *enable-all* + checkbox), satu `MENU_GROUP` berisi banyak sub-menu. Hierarki dua level — tidak muat sebagai kolom. |

`RowActions` tetap dipakai di **kedua** pola (di kanan header kartu maupun di sel tabel), supaya
urutan dan gaya aksinya seragam.

## 1. Komponen Dasar
UI tabel utama dalam aplikasi menggunakan komponen-komponen siap pakai berikut dari direktori `src/shared/components/ui`:
- `DataTable<T>`: Komponen kerangka tabel berdesain seragam. Menerima properti `columns`, `data`, dan `rowKey`.
- `RowActions`: Komponen pembungkus seragam (berwujud ikon "ChevronDown" / Dropdown) untuk menampung tindakan-tindakan pada tiap baris data (View, Edit, Delete, dll).
- `ActionMenu`: Inti dari aksi bertingkat (dropdown menu) yang secara internal dipanggil oleh `RowActions`.

## 2. Penggunaan DataTable & Pagination
Deklarasikan kolom tabel di luar siklus perenderan komponen (di luar komponen `React`, atau dibungkus dengan `useMemo`) agar referensinya stabil. Komponen `DataTable` kini mendukung penuh properti *Toolbar* (Pencarian & Pemilih Baris) serta *Pagination*.

```tsx
import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { UserRowActions } from './UserRowActions';

export const UserList = ({ data }) => {
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const columns = useMemo<Column<User>[]>(() => [
    { header: 'Nama Lengkap', cell: (row) => <span className="font-bold">{row.name}</span> },
    { header: 'Email', cell: (row) => row.email },
    { 
      header: 'Aksi', 
      align: 'right', 
      cell: (row) => <UserRowActions user={row} /> 
    }
  ], []);

  // Opsional: Filter dan paginasi client-side jika API belum siap
  // (Direkomendasikan langsung mengaitkan state ke endpoint API)
  const filtered = useMemo(() => 
    data.filter(u => u.name.includes(search)), 
  [data, search]);
  
  const paginated = useMemo(() => 
    filtered.slice((page - 1) * limit, page * limit), 
  [filtered, page, limit]);
  
  const totalPages = Math.ceil(filtered.length / limit) || 1;

  return (
    <DataTable
      columns={columns}
      data={paginated}
      rowKey={(row) => row.id}
      
      // Integrasi Search
      searchValue={search}
      onSearchChange={(val) => { setSearch(val); setPage(1); }}
      searchPlaceholder="Cari nama pengguna..."
      
      // Integrasi Show Row (Limit)
      limit={limit}
      onLimitChange={(val) => { setLimit(val); setPage(1); }}
      
      // Integrasi Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );
};
```

## 3. Penanganan Tombol Aksi & Permissions
Sesuai PRD, seluruh tombol *action* harus bersembunyi atau dinonaktifkan jika *user* tidak memiliki izin (permission) yang sesuai. Jangan membungkus komponen `RowActions` secara keseluruhan dengan `<Can>`, melainkan **buatlah komponen khusus** (misalnya `<RoleRowActions>`) yang akan merakit *prop* `RowActions` secara kondisional berdasarkan `usePermission`.

### Contoh Standar Penanganan Permissions di Actions:
```tsx
import { RowActions } from '@/shared/components/ui/RowActions';
import { usePermission } from '@/features/auth/usePermission';

export const RoleRowActions = ({ role }: { role: RoleData }) => {
  const { hasPermission } = usePermission();

  // Hanya oper fungsi callback jika user punya akses.
  // Jika callback `undefined`, RowActions otomatis menyembunyikan tombol tersebut.
  const canUpdate = hasPermission('platform.role.update');
  const canDelete = hasPermission('platform.role.delete');
  const canView   = hasPermission('platform.role.read');

  return (
    <RowActions
      label="Aksi"
      onView={canView ? () => console.log("Lihat", role.id) : undefined}
      onEdit={canUpdate ? () => console.log("Edit", role.id) : undefined}
      onDelete={canDelete ? () => console.log("Hapus", role.id) : undefined}
      // Jika ada aksi khusus, masukkan ke `extra` dan filter!
      extra={[
        {
          label: 'Aksi Khusus',
          icon: <Star size={14} />,
          onClick: () => {},
        }
      ].filter(() => hasPermission('platform.role.special_action'))}
    />
  );
};
```

> [!IMPORTANT]
> - Selalu gunakan `usePermission` di *cell renderer* atau pembungkus baris aksi.
> - Hindari logika bercabang rumit di dalam deklarasi `columns`. Buat komponen *Action* terpisah seperti contoh di atas untuk kode yang bersih.
> - Komponen `RowActions` sudah mendesain urutan tombol secara konvensional: Lihat (Utama) -> Edit -> *Extra* -> Hapus (Danger / Merah).
