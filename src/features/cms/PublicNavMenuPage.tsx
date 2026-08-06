import { useState, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Save, Link2, ExternalLink, ArrowUp, ArrowDown
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { TableSkeleton } from '@/shared/components/ui/Skeleton';
import { ActionMenu } from '@/shared/components/ui/ActionMenu';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { TextField } from '@/shared/components/ui/Field';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SearchInput } from '@/shared/components/ui/SearchInput';
import { useDebouncedValue } from '@/features/master/useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { resolveIcon } from '@/shared/layout/iconMap';
import { usePublicNavMenus, usePublicNavMenuMutations } from './cms.hooks';
import type { PublicNavMenu, PublicNavMenuForm } from './cms.types';

const emptyForm: PublicNavMenuForm = {
  label: '', path: '', icon: null, sortOrder: 0, isActive: true,
};

export const PublicNavMenuPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [form, setForm] = useState<{ item?: PublicNavMenu } | null>(null);
  const [formData, setFormData] = useState<PublicNavMenuForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PublicNavMenu | null>(null);
  const [toggleTarget, setToggleTarget] = useState<PublicNavMenu | null>(null);
  const debounced = useDebouncedValue(search, 400);

  const { data: rows = [], isLoading, isError } = usePublicNavMenus();
  const m = usePublicNavMenuMutations();

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => r.label.toLowerCase().includes(debounced.toLowerCase()) || r.path.toLowerCase().includes(debounced.toLowerCase()))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [rows, debounced]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRows.slice(start, start + limit);
  }, [filteredRows, page, limit]);

  const meta = useMemo(() => ({
    page,
    limit,
    total: filteredRows.length,
    totalPages: Math.max(1, Math.ceil(filteredRows.length / limit)),
  }), [page, limit, filteredRows.length]);

  const activeCount = rows.filter((t) => t.isActive).length;

  const openCreate = () => {
    const nextSortOrder = Math.max(0, ...rows.map((row) => row.sortOrder)) + 10;
    setFormData({ ...emptyForm, sortOrder: nextSortOrder });
    setForm({});
  };
  const openEdit = (t: PublicNavMenu) => {
    setFormData({ label: t.label, path: t.path, icon: t.icon, isActive: t.isActive, sortOrder: t.sortOrder });
    setForm({ item: t });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onDone = { onSuccess: () => setForm(null), onError: (err: unknown) => notifyApiError(err) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: formData }, onDone);
    else m.create.mutate(formData, onDone);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    m.remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null), onError: (err) => notifyApiError(err) });
  };

  const confirmToggleActive = () => {
    if (!toggleTarget) return;
    m.update.mutate(
      { id: toggleTarget.id, body: { isActive: !toggleTarget.isActive } },
      { onSuccess: () => setToggleTarget(null), onError: (err) => notifyApiError(err) },
    );
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex(r => r.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      const temp = sorted[index];
      sorted[index] = sorted[index - 1];
      sorted[index - 1] = temp;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const temp = sorted[index];
      sorted[index] = sorted[index + 1];
      sorted[index + 1] = temp;
    } else {
      return;
    }
    m.reorder.mutate(sorted.map(r => r.id), { onError: (err) => notifyApiError(err) });
  };

  const saving = m.create.isPending || m.update.isPending;

  const columns: Column<PublicNavMenu>[] = [
    {
      header: 'Label Menu',
      cell: (r) => {
        const Icon = resolveIcon({ icon: r.icon });
        return (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon size={17} />
          </span>
          <div>
            <p className="font-extrabold text-ink text-[13px]">{r.label}</p>
            {r.icon && <p className="text-[11px] font-medium text-muted mt-0.5">Icon: {r.icon}</p>}
          </div>
        </div>
        );
      },
    },
    {
      header: 'Path URL',
      cell: (r) => <p className="text-[12px] font-medium text-ink-soft truncate" title={r.path}>{r.path}</p>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (r) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${r.isActive ? 'bg-accent-green/10 text-accent-green' : 'bg-muted/10 text-muted'}`}>
          {r.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
          {r.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (r) => (
        <ActionMenu items={[
          {
            icon: <ArrowUp size={14} />,
            label: 'Naikkan Urutan',
            onClick: () => handleReorder(r.id, 'up'),
          },
          {
            icon: <ArrowDown size={14} />,
            label: 'Turunkan Urutan',
            onClick: () => handleReorder(r.id, 'down'),
          },
          {
            icon: r.isActive ? <EyeOff size={14} /> : <Eye size={14} />,
            label: r.isActive ? 'Nonaktifkan' : 'Aktifkan',
            onClick: () => setToggleTarget(r),
            dividerAfter: true,
          },
          {
            icon: <Pencil size={14} />,
            label: 'Edit',
            onClick: () => openEdit(r),
          },
          {
            icon: <Trash2 size={14} />,
            label: 'Hapus',
            onClick: () => setDeleteTarget(r),
            variant: 'danger' as const,
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      <PageHeader
        title="Menu Navigasi Publik"
        description="Kelola tautan menu navigasi yang muncul di header dan footer website publik."
        action={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>Preview</Button>
            </a>
            <Button icon={<Plus size={16} />} onClick={openCreate}>Tambah Menu</Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Link2 size={20} className="text-primary" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Total Menu</p>
            <p className="text-xl font-extrabold text-ink">{isLoading ? '—' : rows.length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0"><Eye size={20} className="text-accent-green" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Menu Aktif</p>
            <p className="text-xl font-extrabold text-accent-green">{isLoading ? '—' : activeCount}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <SectionCard
        title="Daftar Menu"
        icon={<Link2 size={16} />}
        bodyClassName="p-0 md:p-0"
        action={
          <div className="w-56">
            <SearchInput
              placeholder="Cari menu..."
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
        }
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat menu navigasi.</div>
        ) : filteredRows.length === 0 ? (
          <EmptyState icon={Link2} title="Menu tidak ditemukan" description="Tambahkan menu baru atau ubah filter pencarian." />
        ) : (
          <>
            <DataTable columns={columns} data={paginatedRows} rowKey={(r) => r.id} />
            <div className="px-4 pb-4">
              <Pagination
                meta={meta}
                page={page}
                onChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                itemLabel="menu"
              />
            </div>
          </>
        )}
      </SectionCard>

      {/* Form Modal */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.item ? 'Edit Menu' : 'Tambah Menu'} icon={<Link2 size={20} />}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <TextField label="Label Menu" required value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Beranda" />
            <TextField label="Path URL" required value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/katalog" />
            <TextField label="Icon (opsional)" value={formData.icon ?? ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value || null })} placeholder="Kebab case nama icon" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm font-semibold text-ink">Aktif (Tampilkan di website)</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" icon={<Save size={16} />} loading={saving}>
              {saving ? 'Menyimpan…' : form?.item ? 'Simpan Perubahan' : 'Tambah Menu'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Menu"
        message={`Yakin ingin menghapus menu "${deleteTarget?.label}"?`}
        confirmLabel="Hapus"
        tone="danger"
        loading={m.remove.isPending}
        closeOnConfirm={false}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggleActive}
        title={toggleTarget?.isActive ? 'Nonaktifkan Menu' : 'Aktifkan Menu'}
        message={toggleTarget ? `${toggleTarget.isActive ? 'Nonaktifkan' : 'Aktifkan'} menu "${toggleTarget.label}" di website publik?` : ''}
        confirmLabel={toggleTarget?.isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
        tone="primary"
        loading={m.update.isPending}
        closeOnConfirm={false}
      />
    </div>
  );
};
