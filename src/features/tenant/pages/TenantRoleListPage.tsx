import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { usePermissions } from '@/features/auth/usePermissions';
import type { TenantRole } from '@/features/tenant/api/tenant-roles.api';
import type { MenuPermissionItem } from '@/features/tenant/api/permission.types';
import { Shield, Plus } from 'lucide-react';

// MOCK DATA (TDD UI)
const MOCK_PERMISSION: MenuPermissionItem = {
  id: 'p1',
  moduleId: 'm1',
  code: 'catalogue.product.update',
  name: 'Ubah Produk',
  action: 'UPDATE',
  scope: 'TENANT',
  description: null,
  isActive: true,
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

const MOCK_TENANT_ROLES: TenantRole[] = [
  { id: '1', code: 'OWNER', name: 'Owner', description: 'Pemilik tenant', isSystem: true, grantsAllPermissions: true, isActive: true, permissions: [], _count: { userLinks: 1 } },
  { id: '2', code: 'CATALOG_EDITOR', name: 'Catalog Editor', description: 'Kelola katalog', isSystem: false, grantsAllPermissions: false, isActive: true, permissions: [MOCK_PERMISSION], _count: { userLinks: 2 } },
];

// TDD UI: ganti ke tenantRolesApi.getRoles() saat backend siap.
const fetchMockTenantRoles = async () =>
  new Promise<TenantRole[]>((resolve) => setTimeout(() => resolve(MOCK_TENANT_ROLES), 600));

const RoleRowActions = ({ role, onEdit }: { role: TenantRole; onEdit: () => void }) => {
  const { can } = usePermissions();

  const canUpdate = can('tenant.role.update');
  const canDelete = can('tenant.role.delete');
  const canView = can('tenant.role.read');

  return (
    <RowActions
      label="Aksi"
      onView={canView ? () => console.log('Lihat Detail', role.id) : undefined}
      onEdit={canUpdate && !role.isSystem && role.code !== 'OWNER' ? onEdit : undefined}
      onDelete={canDelete && !role.isSystem && role.code !== 'OWNER' ? () => console.log('Hapus', role.id) : undefined}
    />
  );
};

interface RoleFormData {
  code: string;
  name: string;
  description: string;
  isActive: string;
  permissionIds: string[];
}
const defaultRoleForm: RoleFormData = { code: '', name: '', description: '', isActive: 'true', permissionIds: [] };

export const TenantRoleListPage = () => {
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; id?: string; data: RoleFormData }>({
    open: false, mode: 'create', data: defaultRoleForm
  });

  const setForm = <K extends keyof RoleFormData>(key: K, value: RoleFormData[K]) => {
    setModal(prev => ({ ...prev, data: { ...prev.data, [key]: value } }));
  };

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['tenant-roles'],
    queryFn: fetchMockTenantRoles,
  });

  const filteredRoles = useMemo(() => {
    return roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));
  }, [roles, search]);

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRoles.slice(start, start + limit);
  }, [filteredRoles, page, limit]);

  const totalPages = Math.ceil(filteredRoles.length / limit) || 1;

  const handleEdit = useCallback((role: TenantRole) => {
    setModal({
      open: true,
      mode: 'edit',
      id: role.id,
      data: { 
        code: role.code, 
        name: role.name, 
        description: role.description || '', 
        isActive: role.isActive ? 'true' : 'false',
        permissionIds: role.permissions.map((p) => p.id)
      },
    });
  }, []);

  const columns = useMemo<Column<TenantRole>[]>(() => [
    {
      header: 'Nama Role',
      cell: (row) => (
        <div>
          <div className="font-bold text-ink">{row.name}</div>
          <div className="text-[11px] text-muted font-mono mt-0.5">{row.code}</div>
        </div>
      ),
    },
    {
      header: 'Hak Akses',
      cell: (row) => (
        <span className="text-[11px] font-medium text-ink-soft">
          {row.grantsAllPermissions ? 'Full Access' : `${row.permissions?.length || 0} permissions`}
        </span>
      ),
    },
    {
      header: 'Total Pengguna',
      cell: (row) => <span className="text-muted font-medium text-[11px]">{row._count?.userLinks || 0} user</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Tipe',
      cell: (row) => (
        row.isSystem ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
            <Shield size={10} /> System
          </span>
        ) : (
          <span className="text-muted text-[11px]">Custom</span>
        )
      ),
    },
    {
      header: 'Aksi',
      align: 'right',
      cell: (row) => <RoleRowActions role={row} onEdit={() => handleEdit(row)} />,
    },
  ], [handleEdit]);

  if (error) {
    return <div className="p-6 text-center text-semantic-error">Gagal memuat data role showroom.</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Showroom Roles"
        description="Kelola peran dan hak akses spesifik di dalam showroom Anda."
        action={can('tenant.role.create') ? (
          <Button icon={<Plus size={16} />} onClick={() => setModal({ open: true, mode: 'create', data: defaultRoleForm })}>
            Buat Role Baru
          </Button>
        ) : undefined}
      />

      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden p-10 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted">Memuat data roles...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={paginatedRoles} 
          rowKey={(row) => row.id} 
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          limit={limit}
          onLimitChange={(val) => { setLimit(val); setPage(1); }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          searchPlaceholder="Cari nama atau kode role..."
        />
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        title={modal.mode === 'create' ? 'Buat Role Showroom' : 'Edit Role Showroom'}
        subtitle={modal.mode === 'create' ? 'Buat peran baru untuk staf di showroom Anda' : 'Ubah detail dan hak akses peran'}
        icon={<Shield size={20} />}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(prev => ({ ...prev, open: false }))}>Batal</Button>
            <Button onClick={() => { console.log('Submit', modal.data); setModal(prev => ({ ...prev, open: false })); }}>
              {modal.mode === 'create' ? 'Simpan' : 'Perbarui'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField 
            label="Kode Role" 
            required 
            value={modal.data.code} 
            onChange={e => setForm('code', e.target.value)} 
            placeholder="CATALOG_EDITOR"
            disabled={modal.mode === 'edit'}
            helperText="Kode internal, tidak boleh ada spasi."
          />
          <TextField 
            label="Nama Role" 
            required 
            value={modal.data.name} 
            onChange={e => setForm('name', e.target.value)} 
            placeholder="Catalog Editor" 
          />
          <TextField 
            label="Deskripsi (Opsional)" 
            value={modal.data.description} 
            onChange={e => setForm('description', e.target.value)} 
            placeholder="Memiliki akses penuh ke katalog" 
          />
          {modal.mode === 'edit' && (
            <SelectField
              label="Status"
              value={modal.data.isActive}
              onChange={e => setForm('isActive', e.target.value)}
              options={[
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Nonaktif' }
              ]}
            />
          )}
          {/* TODO: Multi-select permissions component goes here */}
          <div className="text-xs text-muted p-3 bg-background rounded-lg border border-dashed border-border">
            (UI Multi-select permission menyusul / terintegrasi dengan endpoint master permission)
          </div>
        </div>
      </Modal>
    </div>
  );
};
