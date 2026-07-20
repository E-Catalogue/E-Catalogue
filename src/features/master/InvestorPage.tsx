import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Plus, Search, Loader2, Landmark, Wallet, HandCoins } from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { SectionCard } from '@/shared/components/ui/SectionCard';
import { DataTable, type Column } from '@/shared/components/ui/DataTable';
import { RowActions } from '@/shared/components/ui/RowActions';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Pagination } from '@/shared/components/ui/Pagination';
import { InvestorFormModal } from './InvestorFormModal';
import { InvestorCapitalModal } from './InvestorCapitalModal';
import { ActiveBadge } from './ActiveBadge';
import { useInvestors, useInvestorMutations } from './master.hooks';
import { useDebouncedValue } from './useDebouncedValue';
import { notifyApiError } from '@/core/api/notify';
import type { Investor } from './types';
import { RequirePermission } from '@/features/auth/permissions';
import { usePermissions } from '@/features/auth/usePermissions';

export const InvestorPage = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 350);
  const { data, isLoading, isError } = useInvestors({ page, limit: 10, search: debounced });
  const m = useInvestorMutations();

  const [form, setForm] = useState<{ item: Investor | null } | null>(null);
  const [toDelete, setToDelete] = useState<Investor | null>(null);
  const [modalFor, setModalFor] = useState<Investor | null>(null);

  const investors = data?.data ?? [];

  const handleSubmit = (values: Partial<Investor>) => {
    const opts = { onError: (e: unknown) => notifyApiError(e), onSuccess: () => setForm(null) };
    if (form?.item) m.update.mutate({ id: form.item.id, body: values }, opts);
    else m.create.mutate(values, opts);
  };

  const columns: Column<Investor>[] = [
    { header: 'Investor', cell: (r) => (
      <div>
        <p className="font-bold text-ink">{r.name}</p>
        <p className="text-[11px] font-medium text-muted">{r.code}</p>
      </div>
    ) },
    { header: 'Bank', cell: (r) => (
      <div>
        <p className="font-semibold text-ink text-[13px]">{r.bankName}</p>
        <p className="text-[11px] font-medium text-muted">{r.bankAccount} · {r.bankAccountName}</p>
      </div>
    ) },
    { header: 'Status', align: 'center', cell: (r) => <ActiveBadge active={r.isActive} /> },
    { header: '', align: 'right', cell: (r) => (
      <RowActions
        onEdit={can('INVESTOR_UPDATE') ? () => setForm({ item: r }) : undefined}
        onDelete={can('INVESTOR_DELETE') ? () => setToDelete(r) : undefined}
        extra={can('INVESTOR_CAPITAL_READ') ? [{
          label: 'Kelola Modal',
          icon: <Wallet size={13} />,
          onClick: () => setModalFor(r),
        }] : undefined}
      />
    ) },
  ];

  return (
    <RequirePermission code="INVESTOR_READ">
      <div className="max-w-[1200px] mx-auto  space-y-5">
        <PageHeader
          title="Investor"
          description="Master investor & rincian modal/bagi hasil"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {can('INVESTOR_OBLIGATION_READ') && (
                <Link to="/master/investor-obligation">
                  <Button variant="secondary" icon={<HandCoins size={17} strokeWidth={2.5} />}>Kewajiban Investor</Button>
                </Link>
              )}
              {can('INVESTOR_CREATE') && (
                <Button icon={<Plus size={17} strokeWidth={2.5} />} onClick={() => setForm({ item: null })}>Tambah Investor</Button>
              )}
            </div>
          }
        />

        <div className="relative max-w-xs">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari investor..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-border text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <SectionCard title="Daftar Investor" icon={<Landmark size={16} />} bodyClassName="p-0 md:p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted"><Loader2 size={24} className="animate-spin" /></div>
          ) : isError ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Gagal memuat data.</div>
          ) : investors.length === 0 ? (
            <div className="text-center py-16 text-muted font-semibold text-sm">Belum ada investor.</div>
          ) : (
            <>
              <DataTable columns={columns} data={investors} rowKey={(r) => r.id} />
              <div className="px-4 pb-4"><Pagination meta={data?.meta} page={page} onChange={setPage} /></div>
            </>
          )}
        </SectionCard>

        <InvestorFormModal
          open={!!form}
          onClose={() => setForm(null)}
          item={form?.item}
          submitting={m.create.isPending || m.update.isPending}
          onSubmit={handleSubmit}
        />
        <InvestorCapitalModal open={!!modalFor} investor={modalFor} onClose={() => setModalFor(null)} />
        <ConfirmDialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={() => toDelete && m.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null), onError: (e) => notifyApiError(e) })}
          loading={m.remove.isPending}
          closeOnConfirm={false}
          title="Hapus Investor"
          message={toDelete ? `Hapus investor "${toDelete.name}"? Data modal terkait juga dapat terpengaruh.` : ''}
        />
      </div>
    </RequirePermission>
  );
};
