import { useState } from 'react';
import { Plus, Search, Loader2, Wrench } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { VendorFormModal } from './VendorFormModal';
import { ActiveBadge } from './ActiveBadge';
import { useVendors, useVendorMutations } from './master.hooks';
import { useDebouncedValue } from './useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { getApiErrorCode } from '@/core/api/apiError';
import { store } from '@/app/store';
import { showToast } from '@/app/store/uiSlice';
import type { Vendor } from './types';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';

export const VendorPage = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useVendors({ page, limit: 10, search: debounced });
  const m = useVendorMutations();

  const [form, setForm] = useState<{ item: Vendor | null } | null>(null);
  const [toDelete, setToDelete] = useState<Vendor | null>(null);

  const vendors = data?.data ?? [];

  const handleSubmit = (values: Partial<Vendor>) => {
    const opts = {
      // 409 DUPLICATE_DATA (unique constraint `code`): beri pesan spesifik, modal TIDAK ditutup
      // supaya isi form dipertahankan (PRD update_vendor_code §Penanganan Error).
      onError: (e: unknown) => {
        if (getApiErrorCode(e) === 'DUPLICATE_DATA') {
          store.dispatch(showToast({ type: 'general', variant: 'error', title: 'Gagal', message: 'Code vendor sudah digunakan. Gunakan code lain.' }));
          return;
        }
        notifyApiError(e);
      },
      onSuccess: () => setForm(null),
    };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const columns: Column<Vendor>[] = [
    { header: 'Code', cell: (r) => <span className="font-mono text-[12px] font-bold text-ink-soft">{r.code}</span> },
    { header: 'Vendor', cell: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: 'Telepon', cell: (r) => r.phone || '-' },
    { header: 'Alamat', cell: (r) => r.address || '-' },
    { header: 'Status', align: 'center', cell: (r) => <ActiveBadge active={r.isActive} /> },
    { header: '', align: 'right', cell: (r) => (
      <RowActions 
        onEdit={can('VENDOR_UPDATE') ? () => setForm({ item: r }) : undefined} 
        onDelete={can('VENDOR_DELETE') ? () => setToDelete(r) : undefined} 
      />
    ) },
  ];

  return (
    <RequirePermission code="VENDOR_READ">
      <div className="max-w-[1200px] mx-auto  space-y-5">
        <PageHeader
          title="Vendor"
          description="Master vendor rekondisi & layanan"
          action={
            can('VENDOR_CREATE') && (
              <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Vendor</Button>
            )
          }
        />

        <div className="relative max-w-xs">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama vendor..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <SectionCard title="Daftar Vendor" icon={<Wrench size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
          ) : isError ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada vendor.</div>
          ) : (
            <>
              <DataTable columns={columns} data={vendors} rowKey={(r) => r.id} />
              <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
            </>
          )}
        </SectionCard>

        <VendorFormModal
          open={!!form}
          onClose={() => setForm(null)}
          item={form?.item}
          submitting={m.create.isPending || m.update.isPending}
          onSubmit={handleSubmit}
        />
        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
          loading={m.remove.isPending}
          closeOnConfirm={false}
          title="Hapus Vendor"
          message={toDelete ? `Hapus vendor "${toDelete.name}"?` : ''}
        />
      </div>
    </RequirePermission>
  );
};
