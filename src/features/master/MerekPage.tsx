import { useState } from 'react';
import { Plus, Search, Loader2, Tag, Layers } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { NameFormModal, type NameActiveValues } from './NameFormModal';
import { TipeModal } from './TipeModal';
import { ActiveBadge } from './ActiveBadge';
import { useMereks, useMerekMutations } from './master.hooks';
import { notifyApiError } from '@/core/api/notify';
import { useDebouncedValue } from './useDebouncedValue';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import type { Merek } from './types';

const MerekPageInner = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useMereks({ page, limit: 10, search: debounced });
  const m = useMerekMutations();

  const [form, setForm] = useState<{ item: Merek | null } | null>(null);
  const [toDelete, setToDelete] = useState<Merek | null>(null);
  const [tipeFor, setTipeFor] = useState<Merek | null>(null);

  const mereks = data?.data ?? [];

  const handleSubmit = (values: NameActiveValues) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const columns: Column<Merek>[] = [
    { header: 'Merek', cell: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: 'Status', align: 'center', cell: (r) => <ActiveBadge active={r.isActive} /> },
    { header: '', align: 'right', cell: (r) => (
      <div className="flex items-center justify-end gap-1">
        {can('TIPE_READ') && (
          <button onClick={() => setTipeFor(r)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Kelola tipe">
            <Layers size={14} /> Tipe
          </button>
        )}
        <RowActions
          onEdit={can('MEREK_UPDATE') ? () => setForm({ item: r }) : undefined}
          onDelete={can('MEREK_DELETE') ? () => setToDelete(r) : undefined}
        />
      </div>
    ) },
  ];

  return (
    <div className="max-w-[1200px] mx-auto  space-y-5">
      <PageHeader
        title="Merek"
        description="Master merek kendaraan & tipe/varian-nya"
        action={can('MEREK_CREATE') ? <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Merek</Button> : undefined}
      />

      <div className="relative max-w-xs">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari merek..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
      </div>

      <SectionCard title="Daftar Merek" icon={<Tag size={16} />} bodyClassName="p-0 md:p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
        ) : mereks.length === 0 ? (
          <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada merek.</div>
        ) : (
          <>
            <DataTable columns={columns} data={mereks} rowKey={(r) => r.id} />
            <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
          </>
        )}
      </SectionCard>

      <NameFormModal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.item ? 'Edit Merek' : 'Tambah Merek'}
        label="Nama Merek"
        icon={<Tag size={20} />}
        initial={form?.item ? { name: form.item.name, isActive: form.item.isActive } : null}
        submitting={m.create.isPending || m.update.isPending}
        onSubmit={handleSubmit}
      />
      <TipeModal open={!!tipeFor} merek={tipeFor} onClose={() => setTipeFor(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
          loading={m.remove.isPending}
          closeOnConfirm={false}
        title="Hapus Merek"
        message={toDelete ? `Hapus merek "${toDelete.name}"? Tipe terkait juga dapat terpengaruh.` : ''}
      />
    </div>
  );
};

export const MerekPage = () => (
  <RequirePermission code="MEREK_READ">
    <MerekPageInner />
  </RequirePermission>
);
