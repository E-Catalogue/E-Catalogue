import { useState } from 'react';
import { Plus, Search, Loader2, Building2, Images } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { BranchFormModal } from './BranchFormModal';
import { BranchImagesModal } from './BranchImagesModal';
import { useBranches, useBranchMutations } from './master.hooks';
import { useDebouncedValue } from './useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import type { Branch } from './types';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';

export const BranchPage = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useBranches({ page, limit: 10, search: debounced });
  const m = useBranchMutations();

  const [form, setForm] = useState<{ item: Branch | null } | null>(null);
  const [toDelete, setToDelete] = useState<Branch | null>(null);
  const [imagesFor, setImagesFor] = useState<Branch | null>(null);

  const branches = data?.data ?? [];

  const handleSubmit = (values: Partial<Branch>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const columns: Column<Branch>[] = [
    { header: 'Kode', cell: (r) => <span className="font-bold text-ink">{r.code}</span> },
    { header: 'Nama Cabang', cell: (r) => r.nama },
    { header: 'Lokasi', cell: (r) => r.lokasi || '-' },
    { header: 'Kontak', cell: (r) => r.kontak || '-' },
    { header: '', align: 'right', cell: (r) => (
      <div className="flex items-center justify-end gap-1">
        {can('BRANCH_UPDATE') && (
          <button onClick={() => setImagesFor(r)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Kelola foto">
            <Images size={14} /> Foto
          </button>
        )}
        <RowActions 
          onEdit={can('BRANCH_UPDATE') ? () => setForm({ item: r }) : undefined} 
          onDelete={can('BRANCH_DELETE') ? () => setToDelete(r) : undefined} 
        />
      </div>
    ) },
  ];

  return (
    <RequirePermission code="BRANCH_READ">
      <div className="max-w-[1200px] mx-auto  space-y-5">
        <PageHeader
          title="Cabang"
          description="Master cabang showroom & galeri fotonya"
          action={
            can('BRANCH_CREATE') && (
              <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Cabang</Button>
            )
          }
        />

        <div className="relative max-w-xs">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari cabang..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <SectionCard title="Daftar Cabang" icon={<Building2 size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
          ) : isError ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada cabang.</div>
          ) : (
            <>
              <DataTable columns={columns} data={branches} rowKey={(r) => r.id} />
              <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
            </>
          )}
        </SectionCard>

        <BranchFormModal
          open={!!form}
          onClose={() => setForm(null)}
          item={form?.item}
          submitting={m.create.isPending || m.update.isPending}
          onSubmit={handleSubmit}
        />
        <BranchImagesModal open={!!imagesFor} branch={imagesFor} onClose={() => setImagesFor(null)} />
        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onError: (e) => notifyApiError(e) })}
          title="Hapus Cabang"
          message={toDelete ? `Hapus cabang "${toDelete.nama}"?` : ''}
        />
      </div>
    </RequirePermission>
  );
};

