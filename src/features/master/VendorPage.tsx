import { useState } from 'react';
import { Plus, Search, Wrench } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useConfirmedAction } from '@/shared/components/ui/ConfirmedActionProvider';
import { VendorFormModal } from './VendorFormModal';
import { VendorDetailModal } from './VendorDetailModal';
import { ActiveBadge } from './ActiveBadge';
import { useVendors, useVendorMutations } from './master.hooks';
import { useDebouncedValue } from './useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import { getApiErrorCode } from '@/core/api/apiError';
import type { Vendor, VendorCreateInput } from './types';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';
import { changedVendorFields } from './vendor.utils';

export const VendorPage = () => {
  const { can } = usePermissions();
  const confirmAction = useConfirmedAction();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const query = useVendors({ page, limit: 10, search: debounced });
  const m = useVendorMutations();

  const [form, setForm] = useState<{ item: Vendor | null } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const vendors = query.data?.data ?? [];
  const submitting = m.create.isPending || m.update.isPending || m.remove.isPending;

  const handleMutationError = (error: unknown) => {
    if (getApiErrorCode(error) === 'DUPLICATE_DATA') {
      setCodeError('Code vendor sudah digunakan. Gunakan code lain.');
      return;
    }
    notifyApiError(error);
  };

  const handleSubmit = (values: VendorCreateInput) => {
    setCodeError(null);
    const item = form?.item ?? null;
    const body = item ? changedVendorFields(item, values) : values;
    if (item && Object.keys(body).length === 0) {
      setForm(null);
      return;
    }

    confirmAction({
      title: item ? 'Simpan Perubahan Vendor' : 'Tambah Vendor',
      message: item
        ? `Simpan perubahan untuk vendor “${item.code} — ${item.name}”?`
        : `Tambahkan vendor “${values.code} — ${values.name}”?`,
      confirmLabel: item ? 'Simpan Perubahan' : 'Tambah Vendor',
      tone: 'primary',
      execute: () => item
        ? m.update.mutateAsync({ id: item.id, body })
        : m.create.mutateAsync(values),
      onSuccess: () => setForm(null),
      onError: handleMutationError,
    });
  };

  const deleteVendor = (vendor: Vendor) => confirmAction({
    title: 'Hapus Vendor',
    message: `Hapus vendor “${vendor.code} — ${vendor.name}”? Tindakan ini tidak dapat dibatalkan.`,
    confirmLabel: 'Hapus Vendor',
    tone: 'danger',
    execute: () => m.remove.mutateAsync(vendor.id),
    onError: notifyApiError,
  });

  const columns: Column<Vendor>[] = [
    { header: 'Code', cell: (r) => <span className="font-mono text-[12px] font-bold text-ink-soft">{r.code}</span> },
    { header: 'Vendor', cell: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: 'Telepon', cell: (r) => r.phone || '-' },
    { header: 'Alamat', cell: (r) => r.address || '-' },
    { header: 'Status', align: 'center', cell: (r) => <ActiveBadge active={r.isActive} /> },
    { header: '', align: 'right', cell: (r) => (
      <RowActions
        onView={() => setDetailId(r.id)}
        onEdit={can('VENDOR_UPDATE') ? () => { setCodeError(null); setForm({ item: r }); } : undefined}
        onDelete={can('VENDOR_DELETE') ? () => deleteVendor(r) : undefined}
      />
    ) },
  ];

  return (
    <RequirePermission code="VENDOR_READ">
      <div className="max-w-[1200px] mx-auto space-y-5">
        <PageHeader
          title="Vendor"
          description="Master vendor rekondisi & layanan"
          action={can('VENDOR_CREATE') ? (
            <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => { setCodeError(null); setForm({ item: null }); }} disabled={submitting}>
              Tambah Vendor
            </Button>
          ) : undefined}
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
          <DataTable
            columns={columns}
            data={vendors}
            rowKey={(r) => r.id}
            loading={query.isLoading}
            refreshing={query.isFetching && !query.isLoading}
            error={query.isError}
            onRetry={() => query.refetch()}
            emptyState={debounced ? {
              title: 'Vendor tidak ditemukan',
              description: `Tidak ada vendor dengan nama yang cocok dengan “${debounced}”.`,
            } : {
              title: 'Belum ada vendor',
              description: 'Tambahkan vendor untuk digunakan pada proses rekondisi dan layanan.',
            }}
          />
          {!query.isLoading && !query.isError && vendors.length > 0 && (
            <div className="px-4 pb-4"><Pagination meta={query.data?.meta} page={page} onChange={setPage} /></div>
          )}
        </SectionCard>

        <VendorFormModal
          key={form ? (form.item?.id ?? 'create') : 'closed'}
          open={!!form}
          onClose={() => !submitting && setForm(null)}
          item={form?.item}
          submitting={m.create.isPending || m.update.isPending}
          codeError={codeError}
          onClearCodeError={() => setCodeError(null)}
          onSubmit={handleSubmit}
        />
        <VendorDetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
          onEdit={can('VENDOR_UPDATE') ? (vendor) => { setDetailId(null); setForm({ item: vendor }); } : undefined}
        />
      </div>
    </RequirePermission>
  );
};
