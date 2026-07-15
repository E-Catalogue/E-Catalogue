import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/Field';
import { usePermissions } from '@/features/auth/usePermissions';
import type { TenantUserItem } from '@/features/tenant/api/tenant-users.api';
import { UserCircle2, Plus } from 'lucide-react';

// MOCK DATA (TDD UI)
const MOCK_TENANT_USERS: TenantUserItem[] = [
  {
    id: '1',
    status: 'ACTIVE',
    joinedAt: '2026-07-01',
    user: { id: 'u1', name: 'John Doe', email: 'john@acme.com', status: 'ACTIVE', mustChangePassword: true },
    roleLinks: [{ tenantRole: { id: 'r1', code: 'OWNER', name: 'Owner' } }],
  },
  {
    id: '2',
    status: 'ACTIVE',
    joinedAt: '2026-07-05',
    user: { id: 'u2', name: 'Jane Smith', email: 'jane@acme.com', status: 'ACTIVE', mustChangePassword: true },
    roleLinks: [{ tenantRole: { id: 'r2', code: 'CATALOG_EDITOR', name: 'Catalog Editor' } }],
  },
];

// TDD UI: ganti ke tenantUsersApi.getUsers() saat backend siap.
const fetchMockTenantUsers = async () =>
  new Promise<TenantUserItem[]>((resolve) => setTimeout(() => resolve(MOCK_TENANT_USERS), 600));

const UserRowActions = ({ link, onEdit }: { link: TenantUserItem; onEdit: () => void }) => {
  const { can } = usePermissions();

  const isOwner = link.roleLinks.some((l) => l.tenantRole.code === 'OWNER');

  return (
    <RowActions
      label="Aksi"
      onView={can('tenant.user.read') ? () => console.log('Lihat Detail', link.id) : undefined}
      onEdit={can('tenant.user.update') ? onEdit : undefined}
      onDelete={can('tenant.user.delete') && !isOwner ? () => console.log('Hapus', link.id) : undefined}
    />
  );
};

interface UserFormData {
  email: string;
  name: string;
  roleIds: string[];
}
const defaultUserForm: UserFormData = { email: '', name: '', roleIds: [] };

export const TenantUserListPage = () => {
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; id?: string; data: UserFormData }>({
    open: false, mode: 'create', data: defaultUserForm
  });

  const setForm = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setModal(prev => ({ ...prev, data: { ...prev.data, [key]: value } }));
  };

  const { data: links = [], isLoading, error } = useQuery({
    queryKey: ['tenant-users'],
    queryFn: fetchMockTenantUsers,
  });

  const filteredLinks = useMemo(() => {
    return links.filter(l => l.user.name.toLowerCase().includes(search.toLowerCase()) || l.user.email.toLowerCase().includes(search.toLowerCase()));
  }, [links, search]);

  const paginatedLinks = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLinks.slice(start, start + limit);
  }, [filteredLinks, page, limit]);

  const totalPages = Math.ceil(filteredLinks.length / limit) || 1;

  const handleEdit = useCallback((link: TenantUserItem) => {
    setModal({
      open: true,
      mode: 'edit',
      id: link.id,
      data: { 
        email: link.user.email, 
        name: link.user.name, 
        roleIds: link.roleLinks.map((l) => l.tenantRole.id)
      },
    });
  }, []);

  const columns = useMemo<Column<TenantUserItem>[]>(() => [
    {
      header: 'Pengguna',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCircle2 size={18} className="text-primary" />
          </div>
          <div>
            <div className="font-bold text-ink">{row.user.name}</div>
            <div className="text-[11px] text-muted font-mono mt-0.5">{row.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Peran (Role)',
      cell: (row) => (
        <div className="flex flex-col gap-1">
          {row.roleLinks.map(({ tenantRole }) => (
            <span key={tenantRole.id} className="text-[11px] font-bold text-ink-soft">
              {tenantRole.name}
            </span>
          ))}
          {row.roleLinks.length === 0 && <span className="text-muted text-[11px]">-</span>}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.user.status} />,
    },
    {
      header: 'Aksi',
      align: 'right',
      cell: (row) => <UserRowActions link={row} onEdit={() => handleEdit(row)} />,
    },
  ], [handleEdit]);

  if (error) {
    return <div className="p-6 text-center text-semantic-error">Gagal memuat data pengguna showroom.</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Showroom Users"
        description="Kelola staf dan pengguna yang memiliki akses ke ruang kerja (showroom) ini."
        action={can('tenant.user.create') ? (
          <Button icon={<Plus size={16} />} onClick={() => setModal({ open: true, mode: 'create', data: defaultUserForm })}>
            Undang Pengguna
          </Button>
        ) : undefined}
      />

      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-10 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted">Memuat data pengguna...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={paginatedLinks} 
          rowKey={(row) => row.id} 
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          limit={limit}
          onLimitChange={(val) => { setLimit(val); setPage(1); }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          searchPlaceholder="Cari nama atau email..."
        />
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        title={modal.mode === 'create' ? 'Undang Pengguna Baru' : 'Edit Pengguna Showroom'}
        subtitle={modal.mode === 'create' ? 'Tambahkan anggota tim ke dalam showroom Anda' : 'Ubah data atau peran anggota tim'}
        icon={<UserCircle2 size={20} />}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(prev => ({ ...prev, open: false }))}>Batal</Button>
            <Button onClick={() => { console.log('Submit', modal.data); setModal(prev => ({ ...prev, open: false })); }}>
              {modal.mode === 'create' ? 'Kirim Undangan' : 'Perbarui'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField 
            label="Email" 
            type="email"
            required 
            value={modal.data.email} 
            onChange={e => setForm('email', e.target.value)} 
            placeholder="nama@perusahaan.com"
            disabled={modal.mode === 'edit'}
            helperText={modal.mode === 'create' ? 'Jika email belum terdaftar di sistem, mereka akan menerima email undangan untuk membuat kata sandi.' : undefined}
          />
          <TextField 
            label="Nama Lengkap" 
            required 
            value={modal.data.name} 
            onChange={e => setForm('name', e.target.value)} 
            placeholder="John Doe" 
          />
          {/* TODO: Multi-select Roles component goes here */}
          <div className="text-xs text-muted p-3 bg-background rounded-lg border border-dashed border-border mt-2">
            (UI Multi-select role menyusul / terintegrasi dengan endpoint tenant role)
          </div>
        </div>
      </Modal>
    </div>
  );
};
