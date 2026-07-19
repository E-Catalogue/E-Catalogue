import { useState, type FormEvent } from 'react';
import { Plus, Search, Loader2, UserCog } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField, SelectField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useUsers, useUserMutations, useRoles } from './access.hooks';
import { useBranches } from '@/features/master/master.hooks';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { usePermissions } from '@/features/auth/usePermissions';
import { RequirePermission } from '@/features/auth/permissions';
import type { AccessUser } from './types';

const Badge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${active ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
    {active ? 'Aktif' : 'Nonaktif'}
  </span>
);

interface FormState {
  name: string; email: string; username: string; password: string; roleId: string; branchId: string; isActive: boolean;
}
const emptyForm = (): FormState => ({ name: '', email: '', username: '', password: '', roleId: '', branchId: '', isActive: true });

const UserFormModal = ({ open, onClose, item, submitting, onSubmit, canRoleUpdate = true, canBranchUpdate = true }: {
  open: boolean; onClose: () => void; item?: AccessUser | null; submitting?: boolean; onSubmit: (v: FormState) => void;
  canRoleUpdate?: boolean; canBranchUpdate?: boolean;
}) => {
  const { data: roles } = useRoles({ page: 1, limit: 100 });
  const { data: branches } = useBranches({ page: 1, limit: 100 });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [seedId, setSeedId] = useState<string | undefined>('init');

  const seedFrom = (u?: AccessUser | null): FormState =>
    u ? { name: u.name, email: u.email, username: u.username, password: '', roleId: u.role?.id ?? '', branchId: u.branch?.id ?? '', isActive: u.isActive } : emptyForm();
  if (open && (item?.id ?? 'new') !== seedId) { setSeedId(item?.id ?? 'new'); setForm(seedFrom(item)); }

  const set = (k: keyof FormState, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(form); };

  const roleOpts = [{ value: '', label: '— Pilih role —' }, ...(roles?.data ?? []).map((r) => ({ value: r.id, label: r.name }))];
  const branchOpts = [{ value: '', label: '— Tanpa cabang —' }, ...(branches?.data ?? []).map((b) => ({ value: b.id, label: b.nama }))];

  return (
    <Modal open={open} onClose={onClose} icon={<UserCog size={20} />} title={item ? 'Edit User' : 'Tambah User'} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="user-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}>
      <form id="user-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Nama" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nama lengkap" />
        <TextField label="Username" required value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="username" />
        <TextField label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@contoh.com" />
        <TextField label={item ? 'Password (kosongkan jika tetap)' : 'Password'} type="password" required={!item} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
        <SelectField label="Role" required value={form.roleId} onChange={(e) => set('roleId', e.target.value)} options={roleOpts} disabled={!!item && !canRoleUpdate} />
        <SelectField label="Cabang" value={form.branchId} onChange={(e) => set('branchId', e.target.value)} options={branchOpts} disabled={!!item && !canBranchUpdate} />
        <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};

const UserPageInner = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useUsers({ page, limit: 10, search: debounced });
  const m = useUserMutations();
  const { can } = usePermissions();

  const [form, setForm] = useState<{ item: AccessUser | null } | null>(null);
  const [toDelete, setToDelete] = useState<AccessUser | null>(null);

  const users = data?.data ?? [];

  const handleSubmit = async (v: FormState) => {
    try {
      if (form?.item) {
        const body: Record<string, unknown> = { name: v.name, email: v.email, username: v.username, isActive: v.isActive };
        if (v.password) body.password = v.password;
        await m.update.mutateAsync({ id: form.item.id, body });
        if (v.roleId && v.roleId !== form.item.role?.id && can('USER_ROLE_UPDATE')) await m.setRole.mutateAsync({ id: form.item.id, roleId: v.roleId });
        if (v.branchId !== form.item.branch?.id && can('USER_BRANCH_UPDATE')) await m.setBranch.mutateAsync({ id: form.item.id, branchId: v.branchId });
      } else {
        const body: Record<string, unknown> = { name: v.name, email: v.email, username: v.username, password: v.password, roleId: v.roleId, isActive: v.isActive };
        if (v.branchId) body.branchId = v.branchId;
        await m.create.mutateAsync(body);
      }
      setForm(null);
    } catch (e) {
      notifyApiError(e);
    }
  };

  const columns: Column<AccessUser>[] = [
    { header: 'Nama', cell: (u) => <span className="font-bold text-ink">{u.name}</span> },
    { header: 'Username', cell: (u) => u.username },
    { header: 'Email', cell: (u) => u.email },
    { header: 'Role', cell: (u) => u.role?.name ?? '-' },
    { header: 'Status', align: 'center', cell: (u) => <Badge active={u.isActive} /> },
    { header: '', align: 'right', cell: (u) => (
      <RowActions
        onEdit={can('USER_UPDATE') ? () => setForm({ item: u }) : undefined}
        onDelete={can('USER_DELETE') ? () => setToDelete(u) : undefined}
      />
    ) },
  ];

  return (
    <div className="max-w-[1200px] mx-auto  space-y-5">
      <PageHeader title="User" description="Kelola akun pengguna, role, & cabang"
        action={can('USER_CREATE') ? <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah User</Button> : undefined} />

      <div className="relative max-w-xs">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari user..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
      </div>

      <SectionCard title="Daftar User" icon={<UserCog size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
          : isError ? <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          : users.length === 0 ? <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada user.</div>
          : <><DataTable columns={columns} data={users} rowKey={(u) => u.id} /><div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div></>}
      </SectionCard>

      <UserFormModal open={!!form} onClose={() => setForm(null)} item={form?.item} submitting={m.create.isPending || m.update.isPending} onSubmit={handleSubmit} canRoleUpdate={can('USER_ROLE_UPDATE')} canBranchUpdate={can('USER_BRANCH_UPDATE')} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
        title="Nonaktifkan User"
        message={toDelete ? `Nonaktifkan user "${toDelete.name}"?` : ''}
        confirmLabel="Nonaktifkan"
        loading={m.remove.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};

export const UserPage = () => (
  <RequirePermission code="USER_READ">
    <UserPageInner />
  </RequirePermission>
);
