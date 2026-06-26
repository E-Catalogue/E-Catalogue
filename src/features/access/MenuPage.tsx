import { useState, type FormEvent } from 'react';
import { Plus, Loader2, ChevronDown, ChevronRight, Pencil, Trash2, SquareMenu, FolderPlus, KeyRound } from 'lucide-react';
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

// Generic modal untuk group / menu / permission.
const FieldsModal = ({ open, onClose, title, fields, initial, submitting, onSubmit }: {
  open: boolean; onClose: () => void; title: string;
  fields: { key: string; label: string; type?: string; required?: boolean }[];
  initial?: Fields | null; submitting?: boolean; onSubmit: (v: Fields) => void;
}) => {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.type === 'number' ? 0 : ''])) as Fields;
  const [form, setForm] = useState<Fields>(initial ?? blank());
  const [seed, setSeed] = useState<Fields | null | undefined>(initial);
  if (open && initial !== seed) { setSeed(initial); setForm(initial ?? blank()); }
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(form); };

  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button type="submit" form="fields-form" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button></>}>
      <form id="fields-form" onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <TextField
            key={f.key}
            label={f.label}
            required={f.required}
            type={f.type === 'number' ? 'number' : 'text'}
            wrapClass={f.key === 'description' || f.key === 'path' ? 'sm:col-span-2' : ''}
            value={text(form, f.key)}
            onChange={(e) => setForm((s) => ({ ...s, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
          />
        ))}
      </form>
    </Modal>
  );
};

const MenuPageInner = () => {
  const { data, isLoading, isError } = useMenuGroups({ page: 1, limit: 100 });
  const m = useMenuMutations();
  const { can } = usePermissions();
  const canCreate = can('MENU_CREATE');
  const canUpdate = can('MENU_UPDATE');
  const canDelete = can('MENU_DELETE');
  const canPerm = can('PERMISSION_MANAGE');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [groupForm, setGroupForm] = useState<{ item: MenuGroup | null } | null>(null);
  const [menuForm, setMenuForm] = useState<{ groupId: string; item: MenuItem | null } | null>(null);
  const [permForm, setPermForm] = useState<{ menuId: string; item: Permission | null } | null>(null);
  const [del, setDel] = useState<{ kind: 'group' | 'menu' | 'perm'; label: string; fn: () => void } | null>(null);

  const groups = data?.data ?? [];
  const toggle = (id: string) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const err = (e: unknown) => notifyApiError(e);

  return (
    <div className="max-w-[1100px] mx-auto animate-float-up space-y-5">
      <PageHeader title="Menu" description="Kelola group menu, menu, & permission aplikasi"
        action={canCreate ? <Button icon={<FolderPlus size={17} strokeWidth={2.5} />} onClick={() => setGroupForm({ item: null })}>Tambah Group</Button> : undefined} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted"><Loader2 size={24} className="animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-muted font-semibold text-sm">Gagal memuat data.</div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const open = expanded.has(g.id);
            return (
              <div key={g.id} className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <button onClick={() => toggle(g.id)} className="p-1 text-muted hover:text-primary">{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-ink text-[14px]">{g.name} <span className="font-mono text-[11px] text-muted">{g.code}</span></p>
                    <p className="text-[11px] text-muted">{(g.menus ?? []).length} menu</p>
                  </div>
                  {canCreate && <button onClick={() => setMenuForm({ groupId: g.id, item: null })} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-primary hover:bg-primary-light transition-colors"><Plus size={13} /> Menu</button>}
                  {canUpdate && <button onClick={() => setGroupForm({ item: g })} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10"><Pencil size={14} /></button>}
                  {canDelete && <button onClick={() => setDel({ kind: 'group', label: g.name, fn: () => m.removeGroup.mutate(g.id, { onError: err }) })} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={14} /></button>}
                </div>

                {open && (
                  <div className="border-t border-divider divide-y divide-divider bg-surface-soft/40">
                    {(g.menus ?? []).length === 0 && <p className="px-5 py-4 text-[12px] text-muted">Belum ada menu.</p>}
                    {(g.menus ?? []).map((menu) => (
                      <div key={menu.id} className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <SquareMenu size={15} className="text-muted shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-ink">{menu.name} <span className="font-mono text-[10px] text-muted">{menu.code}</span></p>
                            {menu.path && <p className="text-[11px] text-muted font-mono">{menu.path}</p>}
                          </div>
                          {canPerm && <button onClick={() => setPermForm({ menuId: menu.id, item: null })} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-accent-blue hover:bg-accent-blue/10"><KeyRound size={12} /> Permission</button>}
                          {canUpdate && <button onClick={() => setMenuForm({ groupId: g.id, item: menu })} className="p-1.5 rounded-lg text-muted hover:text-accent-blue hover:bg-accent-blue/10"><Pencil size={13} /></button>}
                          {canDelete && <button onClick={() => setDel({ kind: 'menu', label: menu.name, fn: () => m.removeMenu.mutate(menu.id, { onError: err }) })} className="p-1.5 rounded-lg text-muted hover:text-semantic-error hover:bg-semantic-error/10"><Trash2 size={13} /></button>}
                        </div>
                        {(menu.permissions ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
                            {menu.permissions!.map((p) => (
                              <span key={p.id} className="group/perm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-[10px] font-bold text-ink-soft">
                                {p.name}
                                {canPerm && <button onClick={() => setPermForm({ menuId: menu.id, item: p })} className="text-muted hover:text-accent-blue"><Pencil size={10} /></button>}
                                {canPerm && <button onClick={() => setDel({ kind: 'perm', label: p.name, fn: () => m.removePermission.mutate({ menuId: menu.id, permId: p.id }, { onError: err }) })} className="text-muted hover:text-semantic-error"><Trash2 size={10} /></button>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Group modal */}
      <FieldsModal
        open={!!groupForm}
        onClose={() => setGroupForm(null)}
        title={groupForm?.item ? 'Edit Group Menu' : 'Tambah Group Menu'}
        fields={[{ key: 'name', label: 'Nama', required: true }, { key: 'code', label: 'Kode', required: true }, { key: 'icon', label: 'Ikon' }, { key: 'sortOrder', label: 'Urutan', type: 'number' }, { key: 'description', label: 'Deskripsi' }]}
        initial={groupForm?.item ? { name: groupForm.item.name, code: groupForm.item.code, icon: groupForm.item.icon ?? '', sortOrder: groupForm.item.sortOrder ?? 0, description: groupForm.item.description ?? '' } : null}
        submitting={m.createGroup.isPending || m.updateGroup.isPending}
        onSubmit={(v) => {
          const body = { ...v, code: text(v, 'code').toUpperCase(), isActive: true };
          const opts = { onError: err, onSuccess: () => setGroupForm(null) };
          if (groupForm?.item) m.updateGroup.mutate({ id: groupForm.item.id, body }, opts);
          else m.createGroup.mutate(body, opts);
        }}
      />

      {/* Menu modal */}
      <FieldsModal
        open={!!menuForm}
        onClose={() => setMenuForm(null)}
        title={menuForm?.item ? 'Edit Menu' : 'Tambah Menu'}
        fields={[{ key: 'name', label: 'Nama', required: true }, { key: 'code', label: 'Kode', required: true }, { key: 'path', label: 'Path' }, { key: 'icon', label: 'Ikon' }, { key: 'sortOrder', label: 'Urutan', type: 'number' }]}
        initial={menuForm?.item ? { name: menuForm.item.name, code: menuForm.item.code, path: menuForm.item.path ?? '', icon: menuForm.item.icon ?? '', sortOrder: menuForm.item.sortOrder ?? 0 } : null}
        submitting={m.createMenu.isPending || m.updateMenu.isPending}
        onSubmit={(v) => {
          const body = { ...v, code: text(v, 'code').toUpperCase(), isActive: true };
          const opts = { onError: err, onSuccess: () => setMenuForm(null) };
          if (menuForm?.item) m.updateMenu.mutate({ id: menuForm.item.id, body }, opts);
          else if (menuForm) m.createMenu.mutate({ groupId: menuForm.groupId, body }, opts);
        }}
      />

      {/* Permission modal */}
      <FieldsModal
        open={!!permForm}
        onClose={() => setPermForm(null)}
        title={permForm?.item ? 'Edit Permission' : 'Tambah Permission'}
        fields={[{ key: 'name', label: 'Nama', required: true }, { key: 'code', label: 'Kode', required: true }, { key: 'description', label: 'Deskripsi' }]}
        initial={permForm?.item ? { name: permForm.item.name, code: permForm.item.code, description: permForm.item.description ?? '' } : null}
        submitting={m.createPermission.isPending || m.updatePermission.isPending}
        onSubmit={(v) => {
          const body = { ...v, code: text(v, 'code').toUpperCase() };
          const opts = { onError: err, onSuccess: () => setPermForm(null) };
          if (permForm?.item) m.updatePermission.mutate({ menuId: permForm.menuId, permId: permForm.item.id, body }, opts);
          else if (permForm) m.createPermission.mutate({ menuId: permForm.menuId, body }, opts);
        }}
      />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => del?.fn()}
        title="Hapus Data"
        message={del ? `Hapus "${del.label}"?` : ''}
      />
    </div>
  );
};

export const MenuPage = () => (
  <RequirePermission code="MENU_READ">
    <MenuPageInner />
  </RequirePermission>
);
