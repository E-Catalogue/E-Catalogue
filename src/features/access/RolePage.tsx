import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Search, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useRoles, useRoleMutations, useRolePermissionLookup } from './access.hooks';
import { roleApi, type RolePermissionLookup } from './access.api';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { usePermissions } from '@/features/auth/usePermissions';
import { RequirePermission } from '@/features/auth/permissions';
import type { Role } from './types';

const Badge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${active ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
    {active ? 'Aktif' : 'Nonaktif'}
  </span>
);

// ---- Form Role ----
const RoleFormModal = ({ open, onClose, item, submitting, onSubmit }: {
  open: boolean; onClose: () => void; item?: Role | null; submitting?: boolean; onSubmit: (v: Partial<Role>) => void;
}) => {
  const [form, setForm] = useState<Partial<Role>>(item ?? { name: '', code: '', description: '', isActive: true });
  const [seedId, setSeedId] = useState<string | undefined>(item?.id);
  if (open && item?.id !== seedId) { setSeedId(item?.id); setForm(item ?? { name: '', code: '', description: '', isActive: true }); }
  if (open && !item && seedId !== undefined) { setSeedId(undefined); setForm({ name: '', code: '', description: '', isActive: true }); }
  const set = (k: keyof Role, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit({ ...form, name: (form.name ?? '').trim(), code: (form.code ?? '').trim().toUpperCase() }); };

  return (
    <Modal open={open} onClose={onClose} icon={<ShieldCheck size={20} />} title={item ? 'Edit Role' : 'Tambah Role'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="role-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}>
      <form id="role-form" onSubmit={submit} className="space-y-4">
        <TextField label="Nama Role" required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="mis. Sales" />
        <TextField label="Kode" required value={form.code ?? ''} onChange={(e) => set('code', e.target.value)} placeholder="SALES" disabled={!!item} />
        <TextField label="Deskripsi" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Opsional" />
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={!!form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)]" />
          <span className="text-[13px] font-semibold text-ink-soft">Aktif</span>
        </label>
      </form>
    </Modal>
  );
};

// ---- Set Permissions ----
/** Bentuk `groupMenu → menu → permission[]` dari daftar flat `/roles/lookups/permissions` (PRD §4.4). */
interface PermGroup { id: string; name: string; menus: { id: string; name: string; permissions: RolePermissionLookup[] }[] }
const groupPermissions = (perms: RolePermissionLookup[]): PermGroup[] => {
  const groups = new Map<string, PermGroup>();
  for (const p of perms) {
    const gm = p.menu.groupMenu;
    let g = groups.get(gm.id);
    if (!g) { g = { id: gm.id, name: gm.name, menus: [] }; groups.set(gm.id, g); }
    let menu = g.menus.find((m) => m.id === p.menu.id);
    if (!menu) { menu = { id: p.menu.id, name: p.menu.name, permissions: [] }; g.menus.push(menu); }
    menu.permissions.push(p);
  }
  return [...groups.values()];
};

const PermissionsModal = ({ open, onClose, role }: { open: boolean; onClose: () => void; role: Role | null }) => {
  const { data: permissions = [], isLoading } = useRolePermissionLookup(open);
  const m = useRoleMutations();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  // Reset input pencarian saat modal dibuka untuk role berbeda (pola derived-state, bukan efek).
  const [seedRoleId, setSeedRoleId] = useState<string | null>(null);
  if (open && role && seedRoleId !== role.id) { setSeedRoleId(role.id); setSearch(''); }
  if (!open && seedRoleId !== null) setSeedRoleId(null);

  useEffect(() => {
    if (open && role) {
      roleApi.get(role.id).then((detail) => setSelected(new Set((detail.rolePermissions ?? []).map((rp) => rp.permission.id)))).catch(() => setSelected(new Set()));
    }
  }, [open, role]);

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const save = () => {
    if (!role) return;
    m.setPermissions.mutate({ id: role.id, permissionIds: [...selected] }, { onError: (e) => notifyApiError(e), onSuccess: onClose });
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? permissions.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.menu.name.toLowerCase().includes(q))
    : permissions;
  const grouped = groupPermissions(filtered);

  return (
    <Modal open={open} onClose={onClose} icon={<KeyRound size={20} />} title={`Permission — ${role?.name ?? ''}`} subtitle={`${selected.size} permission dipilih`} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={save} disabled={m.setPermissions.isPending}>{m.setPermissions.isPending ? 'Menyimpan...' : 'Simpan'}</Button></>}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted"><Loader2 size={22} className="animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div className="relative sticky top-0 z-10 bg-surface pb-1">
            <Search size={15} className="absolute left-3 top-[13px] text-muted pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari permission / menu..." className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-soft border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
          </div>
          {grouped.length === 0 && <p className="text-center py-8 text-[12px] text-muted">Tidak ada permission yang cocok.</p>}
          {grouped.map((g) => (
            <div key={g.id}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-2">{g.name}</p>
              <div className="space-y-3">
                {g.menus.map((menu) => (
                  <div key={menu.id} className="rounded-xl border border-border p-3">
                    <p className="text-[12px] font-extrabold text-ink mb-2">{menu.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {menu.permissions.map((p) => (
                        <label key={p.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition-colors ${selected.has(p.id) ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-ink-soft hover:border-primary'}`}>
                          <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="hidden" />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

const RolePageInner = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isFetching, isError, refetch } = useRoles({ page, limit: 10, search: debounced });
  const m = useRoleMutations();
  const { can } = usePermissions();

  const [form, setForm] = useState<{ item: Role | null } | null>(null);
  const [perms, setPerms] = useState<Role | null>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const roles = data?.data ?? [];
  const handleSubmit = (values: Partial<Role>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const columns: Column<Role>[] = [
    { header: 'Role', cell: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: 'Kode', cell: (r) => <span className="font-mono text-[12px]">{r.code}</span> },
    { header: 'Status', align: 'center', cell: (r) => <Badge active={r.isActive} /> },
    { header: '', align: 'right', cell: (r) => (
      <RowActions
        onEdit={can('ROLE_UPDATE') ? () => setForm({ item: r }) : undefined}
        onDelete={can('ROLE_DELETE') ? () => setToDelete(r) : undefined}
        extra={can('PERMISSION_MANAGE') ? [{ icon: <KeyRound size={13} />, label: 'Permission', onClick: () => setPerms(r) }] : undefined}
      />
    ) },
  ];

  return (
    <div className="max-w-[1200px] mx-auto  space-y-5">
      <PageHeader title="Role" description="Kelola role & hak akses (permission)"
        action={can('ROLE_CREATE') ? <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Role</Button> : undefined} />

      <div className="relative max-w-xs">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari role..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light" />
      </div>

      <SectionCard title="Daftar Role" icon={<ShieldCheck size={16} />} bodyClassName="p-0 md:p-0">
        <DataTable columns={columns} data={roles} rowKey={(r) => r.id} loading={isLoading} refreshing={isFetching && !isLoading}
          error={isError} onRetry={() => refetch()} emptyState={{ title: debounced ? 'Role tidak ditemukan' : 'Belum ada role', description: debounced ? 'Ubah kata pencarian untuk melihat hasil lain.' : 'Tambahkan role untuk mengatur hak akses pengguna.' }} />
        {!isLoading && !isError && roles.length > 0 && <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>}
      </SectionCard>

      <RoleFormModal open={!!form} onClose={() => setForm(null)} item={form?.item} submitting={m.create.isPending || m.update.isPending} onSubmit={handleSubmit} />
      <PermissionsModal open={!!perms} onClose={() => setPerms(null)} role={perms} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
        title="Hapus Role"
        message={toDelete ? `Hapus role "${toDelete.name}"? Tindakan ini tidak dapat dibatalkan.` : ''}
        tone="danger"
        loading={m.remove.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};

export const RolePage = () => (
  <RequirePermission code="ROLE_READ">
    <RolePageInner />
  </RequirePermission>
);
