import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Plus, Loader2, Pencil, Trash2, FolderTree, SquareMenu, KeyRound,
  ChevronRight, Layers, MousePointerClick,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useMenuGroups, useMenuMutations } from './access.hooks';
import { notifyApiError } from '@/core/api/notify';
import { usePermissions } from '@/features/auth/usePermissions';
import { RequirePermission } from '@/features/auth/permissions';
import type { MenuGroup, MenuItem, Permission } from './types';

type Fields = Record<string, string | number | boolean>;
const text = (f: Fields, k: string) => String(f[k] ?? '');

// ---------- Modal generik (group / menu / permission) ----------
const FieldsModal = ({ open, onClose, title, subtitle, fields, initial, submitting, onSubmit }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  fields: { key: string; label: string; type?: string; required?: boolean; placeholder?: string; hint?: string }[];
  initial?: Fields | null; submitting?: boolean; onSubmit: (v: Fields) => void;
}) => {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.type === 'number' ? 0 : ''])) as Fields;
  const [form, setForm] = useState<Fields>(initial ?? blank());
  const [seed, setSeed] = useState<Fields | null | undefined>(initial);
  if (open && initial !== seed) { setSeed(initial); setForm(initial ?? blank()); }
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(form); };

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="fields-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}>
      <form id="fields-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.key === 'description' || f.key === 'path' ? 'sm:col-span-2' : ''}>
            <TextField
              label={f.label}
              required={f.required}
              type={f.type === 'number' ? 'number' : 'text'}
              placeholder={f.placeholder}
              value={text(form, f.key)}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
            />
            {f.hint && <p className="text-[11px] text-muted mt-1">{f.hint}</p>}
          </div>
        ))}
      </form>
    </Modal>
  );
};

// ---------- Panel kolom ----------
const Column = ({ step, title, icon, count, action, children }: {
  step: number; title: string; icon: ReactNode; count?: number; action?: ReactNode; children: ReactNode;
}) => (
  <div className="flex flex-col bg-surface rounded-2xl border border-border overflow-hidden min-h-[420px]">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-divider bg-surface-soft/50 shrink-0">
      <span className="w-6 h-6 rounded-lg bg-primary text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">{step}</span>
      <span className="text-muted">{icon}</span>
      <h3 className="text-[13px] font-extrabold text-ink flex-1 truncate">{title}</h3>
      {typeof count === 'number' && <span className="text-[11px] font-bold text-muted bg-surface border border-border rounded-full px-2 py-0.5">{count}</span>}
      {action}
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-slim p-2 space-y-1">{children}</div>
  </div>
);

// Tombol "+" kecil di header kolom.
const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} title={label}
    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-primary hover:bg-primary-light transition-colors shrink-0">
    <Plus size={13} strokeWidth={2.8} /> Tambah
  </button>
);

// Baris item selectable dengan aksi edit/hapus saat hover.
const Row = ({ active, selectable, onSelect, title, code, sub, canEdit, canDelete, onEdit, onDelete }: {
  active?: boolean; selectable?: boolean; onSelect?: () => void; title: string; code?: string; sub?: string;
  canEdit?: boolean; canDelete?: boolean; onEdit?: () => void; onDelete?: () => void;
}) => (
  <div
    onClick={selectable ? onSelect : undefined}
    className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl transition-colors ${selectable ? 'cursor-pointer' : ''} ${
      active ? 'bg-primary-light ring-1 ring-primary/30' : 'hover:bg-surface-soft'
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className={`text-[13px] font-bold truncate ${active ? 'text-primary-dark' : 'text-ink'}`}>
        {title}
        {code && <span className="ml-1.5 font-mono text-[10px] font-semibold text-muted">{code}</span>}
      </p>
      {sub && <p className="text-[11px] text-muted truncate font-mono">{sub}</p>}
    </div>
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      {canEdit && <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10"><Pencil size={13} /></button>}
      {canDelete && <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={13} /></button>}
    </div>
    {selectable && <ChevronRight size={15} className={`shrink-0 ${active ? 'text-primary' : 'text-muted/50'}`} />}
  </div>
);

// Empty state dalam kolom.
const Empty = ({ icon, text: t }: { icon: ReactNode; text: string }) => (
  <div className="flex flex-col items-center justify-center text-center gap-2 py-12 px-4 text-muted">
    <span className="opacity-50">{icon}</span>
    <p className="text-[12px] font-semibold leading-snug max-w-[200px]">{t}</p>
  </div>
);

const MenuPageInner = () => {
  const { data, isLoading, isError } = useMenuGroups({ page: 1, limit: 100 });
  const m = useMenuMutations();
  const { can } = usePermissions();
  const canCreate = can('MENU_CREATE');
  const canUpdate = can('MENU_UPDATE');
  const canDelete = can('MENU_DELETE');
  const canPermCreate = can('PERMISSION_MANAGE');
  const canPermUpdate = can('PERMISSION_MANAGE');
  const canPermDelete = can('PERMISSION_MANAGE');

  const groups = data?.data ?? [];
  const [groupId, setGroupId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Selection yang selalu valid terhadap data terbaru.
  const group = groups.find((g) => g.id === groupId) ?? null;
  const menus = group?.menus ?? [];
  const menu = menus.find((mi) => mi.id === menuId) ?? null;
  const perms = menu?.permissions ?? [];

  const [groupForm, setGroupForm] = useState<{ item: MenuGroup | null } | null>(null);
  const [menuForm, setMenuForm] = useState<{ item: MenuItem | null } | null>(null);
  const [permForm, setPermForm] = useState<{ item: Permission | null } | null>(null);
  const [del, setDel] = useState<{ label: string; fn: () => void } | null>(null);

  const err = (e: unknown) => notifyApiError(e);

  return (
    <div className="max-w-[1200px] mx-auto  space-y-4">
      <PageHeader title="Menu & Permission" description="Atur navigasi dan hak akses: Group → Menu → Permission" />

      {/* Petunjuk alur */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold text-muted bg-surface-soft/60 border border-border rounded-xl px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5"><FolderTree size={14} className="text-primary" /> Pilih group</span>
        <ChevronRight size={13} className="text-muted/50" />
        <span className="inline-flex items-center gap-1.5"><SquareMenu size={14} className="text-primary" /> Pilih menu</span>
        <ChevronRight size={13} className="text-muted/50" />
        <span className="inline-flex items-center gap-1.5"><KeyRound size={14} className="text-primary" /> Kelola permission</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted"><Loader2 size={26} className="animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-24 text-muted font-semibold text-sm">Gagal memuat data.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KOLOM 1 — Group */}
          <Column step={1} title="Group Menu" icon={<FolderTree size={15} />} count={groups.length}
            action={canCreate ? <AddBtn label="Tambah Group" onClick={() => setGroupForm({ item: null })} /> : undefined}>
            {groups.length === 0 ? (
              <Empty icon={<Layers size={26} />} text="Belum ada group. Tambahkan group menu pertama Anda." />
            ) : groups.map((g) => (
              <Row key={g.id} selectable active={g.id === groupId}
                onSelect={() => { setGroupId(g.id); setMenuId(null); }}
                title={g.name} code={g.code} sub={`${(g.menus ?? []).length} menu`}
                canEdit={canUpdate} canDelete={canDelete}
                onEdit={() => setGroupForm({ item: g })}
                onDelete={() => setDel({ label: g.name, fn: () => m.removeGroup.mutate(g.id, { onError: err }) })}
              />
            ))}
          </Column>

          {/* KOLOM 2 — Menu */}
          <Column step={2} title={group ? `Menu — ${group.name}` : 'Menu'} icon={<SquareMenu size={15} />} count={group ? menus.length : undefined}
            action={canCreate && group ? <AddBtn label="Tambah Menu" onClick={() => setMenuForm({ item: null })} /> : undefined}>
            {!group ? (
              <Empty icon={<MousePointerClick size={26} />} text="Pilih group di sebelah kiri untuk melihat menunya." />
            ) : menus.length === 0 ? (
              <Empty icon={<SquareMenu size={26} />} text="Group ini belum punya menu. Klik “Tambah”." />
            ) : menus.map((mi) => (
              <Row key={mi.id} selectable active={mi.id === menuId}
                onSelect={() => setMenuId(mi.id)}
                title={mi.name} code={mi.code} sub={mi.path ?? undefined}
                canEdit={canUpdate} canDelete={canDelete}
                onEdit={() => setMenuForm({ item: mi })}
                onDelete={() => setDel({ label: mi.name, fn: () => m.removeMenu.mutate(mi.id, { onError: err }) })}
              />
            ))}
          </Column>

          {/* KOLOM 3 — Permission */}
          <Column step={3} title={menu ? `Permission — ${menu.name}` : 'Permission'} icon={<KeyRound size={15} />} count={menu ? perms.length : undefined}
            action={canPermCreate && menu ? <AddBtn label="Tambah Permission" onClick={() => setPermForm({ item: null })} /> : undefined}>
            {!menu ? (
              <Empty icon={<MousePointerClick size={26} />} text="Pilih menu untuk mengatur permission-nya." />
            ) : perms.length === 0 ? (
              <Empty icon={<KeyRound size={26} />} text="Menu ini belum punya permission. Klik “Tambah”." />
            ) : perms.map((p) => (
              <Row key={p.id} title={p.name} code={p.code} sub={p.description ?? undefined}
                canEdit={canPermUpdate} canDelete={canPermDelete}
                onEdit={() => setPermForm({ item: p })}
                onDelete={() => setDel({ label: p.name, fn: () => menu && m.removePermission.mutate({ menuId: menu.id, permId: p.id }, { onError: err }) })}
              />
            ))}
          </Column>
        </div>
      )}

      {/* ---- Modals ---- */}
      <FieldsModal
        open={!!groupForm}
        onClose={() => setGroupForm(null)}
        title={groupForm?.item ? 'Edit Group Menu' : 'Tambah Group Menu'}
        subtitle="Kelompok navigasi, mis. “Master Data”"
        fields={[
          { key: 'name', label: 'Nama', required: true, placeholder: 'Master Data' },
          { key: 'code', label: 'Kode', required: true, placeholder: 'MASTER_DATA', hint: 'Huruf kapital, angka, underscore' },
          { key: 'icon', label: 'Ikon', placeholder: 'database' },
          { key: 'sortOrder', label: 'Urutan', type: 'number' },
          { key: 'description', label: 'Deskripsi', placeholder: 'Pengelolaan data utama' },
        ]}
        initial={groupForm?.item ? { name: groupForm.item.name, code: groupForm.item.code, icon: groupForm.item.icon ?? '', sortOrder: groupForm.item.sortOrder ?? 0, description: groupForm.item.description ?? '' } : null}
        submitting={m.createGroup.isPending || m.updateGroup.isPending}
        onSubmit={(v) => {
          const body = { ...v, code: text(v, 'code').toUpperCase(), isActive: true };
          const opts = { onError: err, onSuccess: () => setGroupForm(null) };
          if (groupForm?.item) m.updateGroup.mutate({ id: groupForm.item.id, body }, opts);
          else m.createGroup.mutate(body, opts);
        }}
      />

      <FieldsModal
        open={!!menuForm}
        onClose={() => setMenuForm(null)}
        title={menuForm?.item ? 'Edit Menu' : 'Tambah Menu'}
        subtitle={group ? `Group: ${group.name}` : undefined}
        fields={[
          { key: 'name', label: 'Nama', required: true, placeholder: 'User' },
          { key: 'code', label: 'Kode', required: true, placeholder: 'USER' },
          { key: 'path', label: 'Path', placeholder: '/access-control/users' },
          { key: 'icon', label: 'Ikon', placeholder: 'users' },
          { key: 'sortOrder', label: 'Urutan', type: 'number' },
        ]}
        initial={menuForm?.item ? { name: menuForm.item.name, code: menuForm.item.code, path: menuForm.item.path ?? '', icon: menuForm.item.icon ?? '', sortOrder: menuForm.item.sortOrder ?? 0 } : null}
        submitting={m.createMenu.isPending || m.updateMenu.isPending}
        onSubmit={(v) => {
          const body = { ...v, code: text(v, 'code').toUpperCase(), isActive: true };
          const opts = { onError: err, onSuccess: () => setMenuForm(null) };
          if (menuForm?.item) m.updateMenu.mutate({ id: menuForm.item.id, body }, opts);
          else if (group) m.createMenu.mutate({ groupId: group.id, body }, opts);
        }}
      />

      <FieldsModal
        open={!!permForm}
        onClose={() => setPermForm(null)}
        title={permForm?.item ? 'Edit Permission' : 'Tambah Permission'}
        subtitle={menu ? `Menu: ${menu.name}` : undefined}
        fields={[
          { key: 'name', label: 'Nama', required: true, placeholder: 'Lihat User' },
          { key: 'code', label: 'Kode', required: true, placeholder: 'USER_READ' },
          { key: 'description', label: 'Deskripsi', placeholder: 'Melihat daftar dan detail user' },
        ]}
        initial={permForm?.item ? { name: permForm.item.name, code: permForm.item.code, description: permForm.item.description ?? '' } : null}
        submitting={m.createPermission.isPending || m.updatePermission.isPending}
        onSubmit={(v) => {
          const body = { ...v, code: text(v, 'code').toUpperCase() };
          const opts = { onError: err, onSuccess: () => setPermForm(null) };
          if (permForm?.item && menu) m.updatePermission.mutate({ menuId: menu.id, permId: permForm.item.id, body }, opts);
          else if (menu) m.createPermission.mutate({ menuId: menu.id, body }, opts);
        }}
      />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => del?.fn()}
        title="Hapus Data"
        message={del ? `Hapus "${del.label}"? Tindakan ini tidak dapat dibatalkan.` : ''}
      />
    </div>
  );
};

export const MenuPage = () => (
  <RequirePermission code="MENU_READ">
    <MenuPageInner />
  </RequirePermission>
);
